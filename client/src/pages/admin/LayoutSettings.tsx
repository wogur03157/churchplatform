import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Plus, X, Save, GripVertical, ImageIcon, ChevronDown, ChevronUp } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// ─── 섹션 정의 ────────────────────────────────────────────────────────────────

type SectionType = "hero" | "announcements" | "images" | "videos" | "image_a" | "image_b";

const SECTION_META: Record<SectionType, { label: string; description: string }> = {
  hero:          { label: "히어로 배너",   description: "상단 타이틀·부제목 영역" },
  announcements: { label: "공지사항",      description: "공지사항 카드 목록" },
  images:        { label: "이미지 갤러리", description: "이미지 그리드" },
  videos:        { label: "영상",          description: "유튜브·영상 목록" },
  image_a:       { label: "이미지 A",      description: "빈 공간을 채우는 배경 이미지" },
  image_b:       { label: "이미지 B",      description: "빈 공간을 채우는 배경 이미지" },
};

const ALL_SECTIONS = Object.keys(SECTION_META) as SectionType[];

// ─── 타입 ─────────────────────────────────────────────────────────────────────

type LayoutItem = {
  id?: number;
  sectionType: SectionType;
  status: "visible" | "hidden";
  displayOrder: number;
  colSpan: number;
  title: string;
  subtitle: string;
  imageKey: string | null;
  imageUrl: string | null;
};

// ─── 섹션 색상 ────────────────────────────────────────────────────────────────

const SECTION_COLORS: Record<SectionType, { bg: string; border: string; text: string; selectedRing: string }> = {
  hero:          { bg: "bg-primary/10",  border: "border-primary/30",  text: "text-primary",      selectedRing: "ring-primary" },
  announcements: { bg: "bg-blue-50",     border: "border-blue-200",    text: "text-blue-700",     selectedRing: "ring-blue-400" },
  images:        { bg: "bg-green-50",    border: "border-green-200",   text: "text-green-700",    selectedRing: "ring-green-400" },
  videos:        { bg: "bg-purple-50",   border: "border-purple-200",  text: "text-purple-700",   selectedRing: "ring-purple-400" },
  image_a:       { bg: "bg-orange-50",   border: "border-orange-200",  text: "text-orange-700",   selectedRing: "ring-orange-400" },
  image_b:       { bg: "bg-pink-50",     border: "border-pink-200",    text: "text-pink-700",     selectedRing: "ring-pink-400" },
};

// ─── 열 너비 토글 ─────────────────────────────────────────────────────────────

// 12열 그리드 기준 프리셋 (colSpan → label)
const SPAN_PRESETS = [
  { label: "1/4", value: 3 },
  { label: "1/3", value: 4 },
  { label: "1/2", value: 6 },
  { label: "2/3", value: 8 },
  { label: "3/4", value: 9 },
  { label: "전체", value: 12 },
] as const;

function ColSpanToggle({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-0.5">
      {SPAN_PRESETS.map(({ label, value: v }) => (
        <button
          key={v}
          onClick={(e) => { e.stopPropagation(); onChange(v); }}
          title={label}
          className={`px-1 py-0.5 text-[9px] font-medium rounded border transition-colors ${
            value === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 bg-background/80 text-muted-foreground"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// ─── 캔버스 블록 (드래그 가능) ────────────────────────────────────────────────

function CanvasBlock({
  item,
  isSelected,
  onClick,
  onRemove,
  onUpdate,
}: {
  item: LayoutItem;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<LayoutItem>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileDragOver, setFileDragOver] = useState(false);
  const c = SECTION_COLORS[item.sectionType];
  const isImageWidget = item.sectionType === "image_a" || item.sectionType === "image_b";

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.sectionType });

  const style = {
    gridColumn: `span ${item.colSpan}`,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 0 : undefined,
  };

  const loadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const res = await fetch("/api/layout-settings/upload-image", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) { toast.error("이미지 업로드 실패"); return; }
    const { url, key } = await res.json() as { url: string; key: string };
    onUpdate({ imageUrl: url, imageKey: key });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border-2 overflow-hidden transition-shadow cursor-pointer ${c.border} ${
        isSelected ? `ring-2 ring-offset-1 ${c.selectedRing}` : "hover:shadow-md"
      }`}
      onClick={onClick}
    >
      {/* 블록 헤더 */}
      <div className={`flex items-center gap-1.5 px-2 py-1.5 ${c.bg}`}>
        {/* 드래그 핸들 */}
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground touch-none select-none flex-shrink-0"
          title="드래그하여 순서 변경"
        >
          <GripVertical className="h-3.5 w-3.5" />
        </button>

        <span className={`flex-1 text-xs font-semibold truncate ${c.text}`}>
          {item.title || SECTION_META[item.sectionType].label}
        </span>

        <ColSpanToggle value={item.colSpan} onChange={(v) => onUpdate({ colSpan: v })} />

        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-0.5 rounded hover:bg-destructive/15 hover:text-destructive text-muted-foreground flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 블록 본문 */}
      <div className={`min-h-[56px] flex items-center justify-center ${c.bg} border-t ${c.border}`}>
        {isImageWidget ? (
          item.imageUrl ? (
            <img src={item.imageUrl} alt="" className="w-full h-20 object-cover" />
          ) : (
            <>
              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
              <div
                onClick={(e) => { e.stopPropagation(); fileRef.current?.click(); }}
                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setFileDragOver(true); }}
                onDragLeave={() => setFileDragOver(false)}
                onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setFileDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) loadFile(f); }}
                className={`w-full h-20 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${fileDragOver ? "bg-primary/10" : ""}`}
              >
                <ImageIcon className={`h-5 w-5 ${fileDragOver ? c.text : "text-muted-foreground"}`} />
                <span className="text-[10px] text-muted-foreground">{fileDragOver ? "놓기" : "이미지 드롭 또는 클릭"}</span>
              </div>
            </>
          )
        ) : (
          <span className={`text-[10px] ${c.text} opacity-50`}>
            {SECTION_META[item.sectionType].description}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── 섹션 설정 패널 ───────────────────────────────────────────────────────────

function SectionSettings({
  item,
  onUpdate,
}: {
  item: LayoutItem;
  onUpdate: (patch: Partial<LayoutItem>) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const c = SECTION_COLORS[item.sectionType];
  const isImageWidget = item.sectionType === "image_a" || item.sectionType === "image_b";

  const loadFile = async (file: File) => {
    const res = await fetch("/api/layout-settings/upload-image", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) { toast.error("이미지 업로드 실패"); return; }
    const { url, key } = await res.json() as { url: string; key: string };
    onUpdate({ imageUrl: url, imageKey: key });
  };

  return (
    <Card className={`border-2 ${c.border}`}>
      <CardContent className="p-3">
        <p className={`text-xs font-semibold mb-2 ${c.text}`}>
          {SECTION_META[item.sectionType].label} 설정
        </p>

        {isImageWidget ? (
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) loadFile(f); e.target.value = ""; }} />
            {item.imageUrl ? (
              <div className="relative group rounded border overflow-hidden">
                <img src={item.imageUrl} alt="" className="w-full h-28 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary" className="h-7 text-xs" onClick={() => fileRef.current?.click()}>변경</Button>
                  <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => onUpdate({ imageUrl: null, imageKey: null })}>삭제</Button>
                </div>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()}
                className="w-full h-20 border-2 border-dashed border-border rounded flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-muted/50 transition-colors">
                <ImageIcon className="h-5 w-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">클릭하여 이미지 업로드</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs">제목</Label>
              <Input value={item.title} onChange={(e) => onUpdate({ title: e.target.value })}
                placeholder={`${SECTION_META[item.sectionType].label} 제목`} className="h-7 text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">부제목</Label>
              <Input value={item.subtitle} onChange={(e) => onUpdate({ subtitle: e.target.value })}
                placeholder="부제목 (선택사항)" className="h-7 text-xs" />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export default function AdminLayoutSettings() {
  const qc = useQueryClient();
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [selected, setSelected] = useState<SectionType | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const { data: layoutSettings, isLoading } = useQuery({
    queryKey: ["layout-settings"],
    queryFn: () => api.get<any[]>("/layout-settings"),
  });


  useEffect(() => {
    if (!layoutSettings) return;
    // 구 포맷(1-3) → 12열 포맷으로 변환
    const toSpan12 = (v: number) => v <= 3 ? ({ 1: 4, 2: 8, 3: 12 }[v] ?? 12) : v;
    const loaded: LayoutItem[] = layoutSettings.map((s) => ({
      id: s.id,
      sectionType: s.sectionType as SectionType,
      status: (s.status ?? "visible") as "visible" | "hidden",
      displayOrder: s.displayOrder,
      colSpan: toSpan12(s.colSpan ?? 3),
      title: s.title ?? "",
      subtitle: s.subtitle ?? "",
      imageKey: s.imageKey ?? null,
      imageUrl: s.imageUrl ?? null,
    }));
    ALL_SECTIONS.forEach((type) => {
      if (!loaded.find((i) => i.sectionType === type)) {
        loaded.push({ sectionType: type, status: "hidden", displayOrder: 99, colSpan: 4, title: "", subtitle: "", imageKey: null, imageUrl: null });
      }
    });
    setItems(loaded.sort((a, b) => a.displayOrder - b.displayOrder));
  }, [layoutSettings]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.post("/layout-settings/save-all",
        items.map((item, i) => ({
          sectionType: item.sectionType,
          status: item.status,
          displayOrder: i + 1,
          colSpan: item.colSpan,
          title: item.title || undefined,
          subtitle: item.subtitle || undefined,
          imageKey: item.imageKey || undefined,
          imageUrl: item.imageUrl || undefined,
        })),
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["layout-settings"] });
      toast.success("레이아웃이 저장되었습니다");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const active   = items.filter((i) => i.status === "visible");
  const inactive = items.filter((i) => i.status === "hidden");

  const update = (type: SectionType, patch: Partial<LayoutItem>) =>
    setItems((prev) => prev.map((i) => i.sectionType === type ? { ...i, ...patch } : i));

  const addSection    = (type: SectionType) => { update(type, { status: "visible" }); setSelected(type); };
  const removeSection = (type: SectionType) => { update(type, { status: "hidden" }); if (selected === type) setSelected(null); };

  const handleDragStart = ({ active: a }: DragStartEvent) => setDraggingId(String(a.id));

  const handleDragEnd = ({ active: a, over }: DragEndEvent) => {
    setDraggingId(null);
    if (!over || a.id === over.id) return;
    const fromId = String(a.id);
    const toId   = String(over.id);
    setItems((prev) => {
      const oldIdx = prev.findIndex((i) => i.sectionType === fromId);
      const newIdx = prev.findIndex((i) => i.sectionType === toId);
      if (oldIdx === -1 || newIdx === -1) return prev;
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const heroSection  = active.find((i) => i.sectionType === "hero");
  const dataSections = active.filter((i) => i.sectionType !== "hero");
  const selectedItem = selected ? items.find((i) => i.sectionType === selected) ?? null : null;
  const draggingItem = draggingId ? items.find((i) => i.sectionType === draggingId) ?? null : null;

  if (isLoading) return <div className="text-center py-12 text-muted-foreground">로딩 중...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">레이아웃 설정</h1>
          <p className="text-muted-foreground mt-1">블록을 드래그해서 순서와 너비를 조정하세요</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="h-4 w-4 mr-1.5" />
          {saveMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

        {/* ── 레이아웃 캔버스 (메인 편집 영역) ── */}
        <div className="lg:col-span-2 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">
            레이아웃 캔버스 ({active.length}개 배치됨)
          </p>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {/* 편집 캔버스 */}
            <div className="border-2 border-dashed border-border rounded-xl p-3 min-h-[140px] bg-muted/20 space-y-2">

              {/* 히어로 섹션 (항상 전체 너비, DnD 대상에서 제외) */}
              {heroSection && (
                <div
                  className={`rounded-lg border-2 overflow-hidden cursor-pointer transition-shadow ${SECTION_COLORS.hero.border} ${
                    selected === "hero" ? `ring-2 ring-offset-1 ${SECTION_COLORS.hero.selectedRing}` : "hover:shadow-md"
                  }`}
                  onClick={() => setSelected(selected === "hero" ? null : "hero")}
                >
                  <div className={`flex items-center gap-2 px-3 py-2 ${SECTION_COLORS.hero.bg}`}>
                    <span className={`flex-1 text-xs font-semibold ${SECTION_COLORS.hero.text}`}>
                      {heroSection.title || "히어로 배너"}
                    </span>
                    <span className="text-[10px] text-muted-foreground">전체 너비 고정</span>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection("hero"); }}
                      className="p-0.5 rounded hover:bg-destructive/15 hover:text-destructive text-muted-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className={`h-8 ${SECTION_COLORS.hero.bg} border-t ${SECTION_COLORS.hero.border} flex items-center justify-center`}>
                    <span className={`text-[10px] opacity-40 ${SECTION_COLORS.hero.text}`}>{SECTION_META.hero.description}</span>
                  </div>
                </div>
              )}

              {/* 데이터 섹션 그리드 (드래그 가능) */}
              {dataSections.length > 0 && (
                <SortableContext
                  items={dataSections.map((i) => i.sectionType)}
                  strategy={rectSortingStrategy}
                >
                  <div className="grid grid-cols-12 gap-2">
                    {dataSections.map((item) => (
                      <CanvasBlock
                        key={item.sectionType}
                        item={item}
                        isSelected={selected === item.sectionType}
                        onClick={() => setSelected(selected === item.sectionType ? null : item.sectionType)}
                        onRemove={() => removeSection(item.sectionType)}
                        onUpdate={(patch) => update(item.sectionType, patch)}
                      />
                    ))}
                  </div>
                </SortableContext>
              )}

              {/* 비어있을 때 */}
              {active.length === 0 && (
                <div className="h-24 flex items-center justify-center text-sm text-muted-foreground">
                  오른쪽에서 섹션을 추가하세요
                </div>
              )}
            </div>

            {/* 드래그 중 오버레이 */}
            <DragOverlay>
              {draggingItem && (
                <div
                  className={`rounded-lg border-2 shadow-xl overflow-hidden ${SECTION_COLORS[draggingItem.sectionType].border}`}
                  style={{ width: "120px" }}
                >
                  <div className={`px-2 py-1.5 ${SECTION_COLORS[draggingItem.sectionType].bg}`}>
                    <span className={`text-xs font-semibold ${SECTION_COLORS[draggingItem.sectionType].text}`}>
                      {SECTION_META[draggingItem.sectionType].label}
                    </span>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* ── 선택된 섹션 설정 ── */}
          {selectedItem && selectedItem.status === "visible" && (
            <SectionSettings
              item={selectedItem}
              onUpdate={(patch) => update(selectedItem.sectionType, patch)}
            />
          )}

          {/* 안내 */}
          <p className="text-[11px] text-muted-foreground">
            같은 행의 너비 합이 전체(12)가 되면 나란히 배치됩니다 (예: 1/3+2/3, 1/4+3/4, 1/3+1/3+1/3, 1/4×4)
          </p>
        </div>

        {/* ── 추가 가능한 섹션 팔레트 ── */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">추가 가능한 섹션 ({inactive.length})</p>

          {inactive.length === 0 && (
            <Card>
              <CardContent className="py-6 text-center text-muted-foreground text-xs">
                모든 섹션이 배치되어 있습니다
              </CardContent>
            </Card>
          )}

          {inactive.map((item) => (
            <Card key={item.sectionType} className="border-dashed">
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">{SECTION_META[item.sectionType].label}</p>
                  <p className="text-xs text-muted-foreground">{SECTION_META[item.sectionType].description}</p>
                </div>
                <Button size="sm" variant="outline" className="flex-shrink-0" onClick={() => addSection(item.sectionType)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />추가
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* 안내 */}
          <Card className="bg-muted/40 border-dashed">
            <CardContent className="py-3 px-3 text-xs text-muted-foreground space-y-1">
              <p>• <strong>이미지 A / B</strong>: 빈 열을 채우는 배경 이미지</p>
              <p>• 블록 클릭 시 상세 설정 열림</p>
              <p>• 변경 후 반드시 <strong>저장</strong></p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
