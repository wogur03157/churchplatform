import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ArrowDown,
  ArrowUp,
  EyeOff,
  GripVertical,
  ImageIcon,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type SectionType =
  | "hero"
  | "announcements"
  | "images"
  | "videos"
  | "image_a"
  | "image_b"
  | "content_category"
  | "media_category";

type DisplayVariant = "grid" | "list" | "featured" | "links";
type HeroSlideType = "text" | "image_split" | "image_bottom" | "image";

type LayoutItem = {
  id?: number;
  tempId: string;
  sectionType: SectionType;
  status: "visible" | "hidden";
  displayOrder: number;
  colSpan: number;
  gridCols: number | null;
  title: string;
  subtitle: string;
  imageKey: string | null;
  imageUrl: string | null;
  sourceCategoryId: number | null;
  itemLimit: number | null;
  displayVariant: DisplayVariant | null;
};

type CategoryTreeNode = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  children: CategoryTreeNode[];
};

type FlatCategoryOption = {
  id: number;
  label: string;
};

type MediaCategory = {
  id: number;
  name: string;
  slug: string;
};

const PRESET_META: Record<Exclude<SectionType, "content_category" | "media_category">, { label: string; description: string }> = {
  hero: { label: "메인 비주얼", description: "상단 히어로와 퀵 메뉴" },
  announcements: { label: "공지사항", description: "홈 공지 목록" },
  images: { label: "갤러리", description: "홈 이미지 목록" },
  videos: { label: "영상", description: "대표 영상 섹션" },
  image_a: { label: "이미지 A", description: "배너형 단일 이미지" },
  image_b: { label: "이미지 B", description: "배너형 단일 이미지" },
};

const TYPE_LABEL: Record<SectionType, string> = {
  hero: "메인 비주얼",
  announcements: "공지사항",
  images: "갤러리",
  videos: "영상",
  image_a: "이미지 A",
  image_b: "이미지 B",
  content_category: "페이지 카테고리",
  media_category: "미디어 카테고리",
};

const SPAN_OPTIONS = [
  { label: "1/4", value: 3 },
  { label: "1/3", value: 4 },
  { label: "1/2", value: 6 },
  { label: "2/3", value: 8 },
  { label: "3/4", value: 9 },
  { label: "전체", value: 12 },
] as const;

const GRID_COL_OPTIONS = [2, 3, 4, 5, 6] as const;

const CONTENT_VARIANTS: { value: DisplayVariant; label: string }[] = [
  { value: "grid", label: "카드형" },
  { value: "links", label: "링크형" },
];

const MEDIA_VARIANTS: { value: DisplayVariant; label: string }[] = [
  { value: "featured", label: "대표형" },
  { value: "grid", label: "그리드형" },
  { value: "list", label: "리스트형" },
];

const HERO_SLIDE_LABELS: Record<HeroSlideType, string> = {
  text: "텍스트",
  image_split: "좌우 분할",
  image_bottom: "하단 텍스트",
  image: "전체 이미지",
};

function createTempId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getSectionKey(item: LayoutItem) {
  return item.id ? `db-${item.id}` : `tmp-${item.tempId}`;
}

function toLayoutItem(raw: any): LayoutItem {
  return {
    id: raw.id,
    tempId: createTempId(),
    sectionType: raw.sectionType,
    status: raw.status ?? "visible",
    displayOrder: raw.displayOrder ?? 0,
    colSpan: raw.colSpan ?? 12,
    gridCols: raw.gridCols ?? null,
    title: raw.title ?? "",
    subtitle: raw.subtitle ?? "",
    imageKey: raw.imageKey ?? null,
    imageUrl: raw.imageUrl ?? null,
    sourceCategoryId: raw.sourceCategoryId ?? null,
    itemLimit: raw.itemLimit ?? null,
    displayVariant: raw.displayVariant ?? null,
  };
}

function createPresetSection(type: Exclude<SectionType, "content_category" | "media_category">): LayoutItem {
  return {
    tempId: createTempId(),
    sectionType: type,
    status: "visible",
    displayOrder: 0,
    colSpan: type === "hero" ? 12 : 6,
    gridCols: type === "images" ? 4 : null,
    title: "",
    subtitle: "",
    imageKey: null,
    imageUrl: null,
    sourceCategoryId: null,
    itemLimit: null,
    displayVariant: null,
  };
}

function createDynamicSection(type: "content_category" | "media_category", sourceCategoryId: number): LayoutItem {
  return {
    tempId: createTempId(),
    sectionType: type,
    status: "visible",
    displayOrder: 0,
    colSpan: 6,
    gridCols: null,
    title: "",
    subtitle: "",
    imageKey: null,
    imageUrl: null,
    sourceCategoryId,
    itemLimit: 6,
    displayVariant: type === "content_category" ? "grid" : "featured",
  };
}

function flattenContentCategories(nodes: CategoryTreeNode[], parents: string[] = []): FlatCategoryOption[] {
  const options: FlatCategoryOption[] = [];
  for (const node of nodes) {
    if (node.slug === "media" && node.parentId === null) continue;
    const nextParents = [...parents, node.name];
    options.push({ id: node.id, label: nextParents.join(" / ") });
    options.push(...flattenContentCategories(node.children ?? [], nextParents));
  }
  return options;
}

function HeroSlideForm({
  form,
  setForm,
  onCancel,
  onSave,
  isPending,
}: {
  form: any;
  setForm: (value: any) => void;
  onCancel: () => void;
  onSave: () => void;
  isPending: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFile = async (file: File) => {
    const res = await fetch("/api/layout-settings/upload-image", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) {
      toast.error("슬라이드 이미지를 업로드하지 못했습니다.");
      return;
    }
    const payload = (await res.json()) as { url: string; key: string };
    setForm({ ...form, imageUrl: payload.url, imageKey: payload.key });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <div className="grid gap-2 md:grid-cols-4">
        {(Object.keys(HERO_SLIDE_LABELS) as HeroSlideType[]).map((type) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant={form.type === type ? "default" : "outline"}
            onClick={() => setForm({ ...form, type })}
          >
            {HERO_SLIDE_LABELS[type]}
          </Button>
        ))}
      </div>

      {form.type !== "text" && (
        <div className="space-y-2">
          <Label>슬라이드 이미지</Label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) uploadFile(file);
              event.target.value = "";
            }}
          />
          {form.imageUrl ? (
            <div className="relative overflow-hidden rounded-lg border">
              <img src={form.imageUrl} alt="" className="h-40 w-full object-cover" />
              <div className="absolute right-3 top-3 flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => fileRef.current?.click()}>
                  변경
                </Button>
                <Button type="button" size="sm" variant="destructive" onClick={() => setForm({ ...form, imageUrl: null, imageKey: null })}>
                  제거
                </Button>
              </div>
            </div>
          ) : (
            <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
              <ImageIcon className="mr-2 h-4 w-4" />
              이미지 업로드
            </Button>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>제목</Label>
          <Input value={form.title ?? ""} onChange={(event) => setForm({ ...form, title: event.target.value })} />
        </div>
        <div className="space-y-2">
          <Label>부제목</Label>
          <Input value={form.subtitle ?? ""} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          취소
        </Button>
        <Button type="button" onClick={onSave} disabled={isPending}>
          저장
        </Button>
      </div>
    </div>
  );
}

function HeroSlidesPanel() {
  const qc = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingForm, setEditingForm] = useState<any | null>(null);
  const [addingForm, setAddingForm] = useState<any | null>(null);

  const { data: slides = [] } = useQuery<any[]>({
    queryKey: ["hero-slides"],
    queryFn: () => api.get<any[]>("/hero-slides/all"),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["hero-slides"] });

  const createMutation = useMutation({
    mutationFn: (body: any) => api.post("/hero-slides", body),
    onSuccess: () => {
      toast.success("슬라이드를 추가했습니다.");
      setAddingForm(null);
      invalidate();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => api.patch(`/hero-slides/${id}`, body),
    onSuccess: () => {
      toast.success("슬라이드를 저장했습니다.");
      setEditingId(null);
      setEditingForm(null);
      invalidate();
    },
    onError: (error: any) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/hero-slides/${id}`),
    onSuccess: () => {
      toast.success("슬라이드를 삭제했습니다.");
      invalidate();
    },
    onError: (error: any) => toast.error(error.message),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>메인 슬라이드</Label>
          <p className="mt-1 text-xs text-muted-foreground">홈 히어로에서 사용하는 슬라이드를 관리합니다.</p>
        </div>
        {!addingForm && (
          <Button type="button" size="sm" variant="outline" onClick={() => setAddingForm({ type: "text", title: "", subtitle: "", imageUrl: null, imageKey: null, status: "visible" })}>
            <Plus className="mr-2 h-4 w-4" />
            슬라이드 추가
          </Button>
        )}
      </div>

      {addingForm && <HeroSlideForm form={addingForm} setForm={setAddingForm} onCancel={() => setAddingForm(null)} onSave={() => createMutation.mutate(addingForm)} isPending={createMutation.isPending} />}

      <div className="space-y-3">
        {slides.map((slide) => {
          const isEditing = editingId === slide.id && editingForm;
          return (
            <Card key={slide.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <CardTitle className="text-base">{slide.title || "제목 없는 슬라이드"}</CardTitle>
                    <CardDescription>{HERO_SLIDE_LABELS[slide.type as HeroSlideType] ?? slide.type}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => { setEditingId(slide.id); setEditingForm({ ...slide }); }}>
                      수정
                    </Button>
                    <Button type="button" variant="destructive" size="sm" onClick={() => deleteMutation.mutate(slide.id)}>
                      삭제
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isEditing && (
                <CardContent>
                  <HeroSlideForm form={editingForm} setForm={setEditingForm} onCancel={() => { setEditingId(null); setEditingForm(null); }} onSave={() => updateMutation.mutate({ id: slide.id, ...editingForm })} isPending={updateMutation.isPending} />
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function CanvasItem({
  item,
  isSelected,
  sourceLabel,
  onSelect,
}: {
  item: LayoutItem;
  isSelected: boolean;
  sourceLabel?: string | null;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: getSectionKey(item),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    gridColumn: `span ${item.colSpan}`,
  };

  return (
    <button
      ref={setNodeRef}
      type="button"
      style={style}
      onClick={onSelect}
      className={`overflow-hidden rounded-xl border-2 text-left transition-colors ${isSelected ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}
    >
      <div className="flex items-center gap-2 border-b bg-muted/40 px-3 py-2">
        <span {...attributes} {...listeners} onClick={(event) => event.stopPropagation()} className="cursor-grab text-muted-foreground active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.title || TYPE_LABEL[item.sectionType]}</span>
        <span className="rounded-full bg-background px-2 py-1 text-[0.6875rem] text-muted-foreground">
          {SPAN_OPTIONS.find((option) => option.value === item.colSpan)?.label ?? item.colSpan}
        </span>
      </div>
      <div className="flex min-h-[5.5rem] flex-col justify-between gap-3 p-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            {TYPE_LABEL[item.sectionType]}
            {sourceLabel ? ` · ${sourceLabel}` : ""}
          </p>
          <p className="line-clamp-2 text-sm text-foreground/80">{item.subtitle || "오른쪽 설정에서 제목, 폭, 연결 데이터를 조정할 수 있습니다."}</p>
        </div>
        <div className="flex flex-wrap gap-2 text-[0.6875rem] text-muted-foreground">
          {item.itemLimit ? <span className="rounded-full bg-muted px-2 py-1">노출 {item.itemLimit}개</span> : null}
          {item.displayVariant ? <span className="rounded-full bg-muted px-2 py-1">{item.displayVariant}</span> : null}
        </div>
      </div>
    </button>
  );
}

export default function AdminLayoutSettings() {
  const qc = useQueryClient();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [items, setItems] = useState<LayoutItem[]>([]);
  const [contentCategoryDraftId, setContentCategoryDraftId] = useState("");
  const [mediaCategoryDraftId, setMediaCategoryDraftId] = useState("");

  const { data: layoutSettings = [], isLoading } = useQuery<any[]>({
    queryKey: ["layout-settings"],
    queryFn: () => api.get<any[]>("/layout-settings"),
  });

  const { data: contentCategoryTree = [] } = useQuery<CategoryTreeNode[]>({
    queryKey: ["content-pages", "categories", "tree"],
    queryFn: () => api.get<CategoryTreeNode[]>("/content-pages/categories/tree"),
  });

  const { data: mediaCategories = [] } = useQuery<MediaCategory[]>({
    queryKey: ["video-categories"],
    queryFn: () => api.get<MediaCategory[]>("/video-categories"),
  });

  useEffect(() => {
    setItems(layoutSettings.map(toLayoutItem));
  }, [layoutSettings]);

  const contentCategoryOptions = useMemo(() => flattenContentCategories(contentCategoryTree), [contentCategoryTree]);
  const contentCategoryLabelById = useMemo(() => new Map(contentCategoryOptions.map((option) => [option.id, option.label] as const)), [contentCategoryOptions]);
  const mediaCategoryLabelById = useMemo(() => new Map(mediaCategories.map((category) => [category.id, category.name] as const)), [mediaCategories]);
  const visibleItems = useMemo(() => items.filter((item) => item.status === "visible").sort((a, b) => a.displayOrder - b.displayOrder), [items]);
  const hiddenPresetSections = useMemo(() => {
    const hiddenItems = items.filter((item) => item.status === "hidden");
    const byType = new Map(hiddenItems.map((item) => [item.sectionType, item] as const));
    return (Object.keys(PRESET_META) as Array<keyof typeof PRESET_META>)
      .map((type) => byType.get(type) ?? null)
      .filter((item): item is LayoutItem => item !== null);
  }, [items]);
  const selectedItem = useMemo(() => items.find((item) => getSectionKey(item) === selectedKey) ?? null, [items, selectedKey]);

  const replaceVisibleOrder = (nextVisible: LayoutItem[]) => {
    const hiddenItems = items.filter((item) => item.status === "hidden");
    setItems([
      ...nextVisible.map((item, index) => ({ ...item, displayOrder: index + 1 })),
      ...hiddenItems.map((item, index) => ({ ...item, displayOrder: nextVisible.length + index + 1 })),
    ]);
  };

  const updateItem = (key: string, patch: Partial<LayoutItem>) => {
    setItems((prev) => prev.map((item) => (getSectionKey(item) === key ? { ...item, ...patch } : item)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = visibleItems.findIndex((item) => getSectionKey(item) === String(active.id));
    const newIndex = visibleItems.findIndex((item) => getSectionKey(item) === String(over.id));
    if (oldIndex === -1 || newIndex === -1) return;
    replaceVisibleOrder(arrayMove(visibleItems, oldIndex, newIndex));
  };

  const moveSelected = (direction: "up" | "down") => {
    if (!selectedItem || selectedItem.status !== "visible") return;
    const index = visibleItems.findIndex((item) => getSectionKey(item) === getSectionKey(selectedItem));
    if (index === -1) return;
    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= visibleItems.length) return;
    const nextVisible = [...visibleItems];
    const [moved] = nextVisible.splice(index, 1);
    nextVisible.splice(nextIndex, 0, moved);
    replaceVisibleOrder(nextVisible);
  };

  const addPresetSection = (type: keyof typeof PRESET_META) => {
    const existing = items.find((item) => item.sectionType === type);
    if (existing) {
      updateItem(getSectionKey(existing), { status: "visible" });
      setSelectedKey(getSectionKey(existing));
      return;
    }
    const created = createPresetSection(type);
    replaceVisibleOrder([...visibleItems, { ...created, displayOrder: visibleItems.length + 1 }]);
    setSelectedKey(getSectionKey(created));
  };

  const addDynamicSection = (type: "content_category" | "media_category", categoryId: number | null) => {
    if (!categoryId) {
      toast.error("먼저 카테고리를 선택해 주세요.");
      return;
    }
    const created = createDynamicSection(type, categoryId);
    replaceVisibleOrder([...visibleItems, { ...created, displayOrder: visibleItems.length + 1 }]);
    setSelectedKey(getSectionKey(created));
  };

  const removeSelected = () => {
    if (!selectedItem) return;
    const key = getSectionKey(selectedItem);
    if (selectedItem.sectionType === "content_category" || selectedItem.sectionType === "media_category") {
      setItems((prev) => prev.filter((item) => getSectionKey(item) !== key));
    } else {
      updateItem(key, { status: "hidden" });
    }
    setSelectedKey(null);
  };

  const uploadSectionImage = async (file: File) => {
    if (!selectedItem) return;
    const res = await fetch("/api/layout-settings/upload-image", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) {
      toast.error("이미지를 업로드하지 못했습니다.");
      return;
    }
    const payload = (await res.json()) as { url: string; key: string };
    updateItem(getSectionKey(selectedItem), { imageUrl: payload.url, imageKey: payload.key });
    toast.success("이미지를 업로드했습니다.");
  };

  const saveMutation = useMutation({
    mutationFn: () =>
      api.post(
        "/layout-settings/save-all",
        [...visibleItems, ...items.filter((item) => item.status === "hidden")].map((item, index) => ({
          id: item.id,
          sectionType: item.sectionType,
          status: item.status,
          displayOrder: index + 1,
          colSpan: item.colSpan,
          gridCols: item.gridCols,
          title: item.title || undefined,
          subtitle: item.subtitle || undefined,
          imageKey: item.imageKey || undefined,
          imageUrl: item.imageUrl || undefined,
          sourceCategoryId: item.sourceCategoryId ?? undefined,
          itemLimit: item.itemLimit ?? undefined,
          displayVariant: item.displayVariant ?? undefined,
        })),
      ),
    onSuccess: () => {
      toast.success("홈 레이아웃을 저장했습니다.");
      qc.invalidateQueries({ queryKey: ["layout-settings"] });
      qc.invalidateQueries({ queryKey: ["public", "home-data"] });
    },
    onError: (error: any) => toast.error(error.message),
  });

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">레이아웃을 불러오는 중입니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">홈 레이아웃</h1>
          <p className="mt-1 text-muted-foreground">배치 캔버스에서 위치를 보고 드래그로 순서를 바꾸며 홈 섹션을 구성합니다.</p>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {saveMutation.isPending ? "저장 중..." : "저장"}
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(22rem,1fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>배치 캔버스</CardTitle>
              <CardDescription>섹션을 드래그해서 순서를 바꾸고 폭이 어떻게 보이는지 확인합니다.</CardDescription>
            </CardHeader>
            <CardContent>
              {visibleItems.length === 0 ? (
                <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">오른쪽에서 섹션을 추가하면 이곳에 배치됩니다.</div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <SortableContext items={visibleItems.map((item) => getSectionKey(item))} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-12 gap-3 rounded-xl border border-dashed bg-muted/20 p-3">
                      {visibleItems.map((item) => {
                        const key = getSectionKey(item);
                        const sourceLabel = item.sectionType === "content_category"
                          ? contentCategoryLabelById.get(item.sourceCategoryId ?? -1)
                          : item.sectionType === "media_category"
                            ? mediaCategoryLabelById.get(item.sourceCategoryId ?? -1)
                            : null;
                        return <CanvasItem key={key} item={item} isSelected={selectedKey === key} sourceLabel={sourceLabel} onSelect={() => setSelectedKey(key)} />;
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              )}
            </CardContent>
          </Card>

          {selectedItem && (
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <CardTitle>{TYPE_LABEL[selectedItem.sectionType]} 설정</CardTitle>
                    <CardDescription>선택한 섹션의 크기와 내용을 조정합니다.</CardDescription>
                  </div>
                  <Button type="button" variant={selectedItem.sectionType === "content_category" || selectedItem.sectionType === "media_category" ? "destructive" : "outline"} onClick={removeSelected}>
                    {selectedItem.sectionType === "content_category" || selectedItem.sectionType === "media_category" ? <><Trash2 className="mr-2 h-4 w-4" />삭제</> : <><EyeOff className="mr-2 h-4 w-4" />숨기기</>}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>제목</Label>
                    <Input value={selectedItem.title} onChange={(event) => updateItem(getSectionKey(selectedItem), { title: event.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>부제목</Label>
                    <Input value={selectedItem.subtitle} onChange={(event) => updateItem(getSectionKey(selectedItem), { subtitle: event.target.value })} />
                  </div>
                </div>

                <div className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                  {SPAN_OPTIONS.map((option) => (
                    <Button key={option.value} type="button" variant={selectedItem.colSpan === option.value ? "default" : "outline"} onClick={() => updateItem(getSectionKey(selectedItem), { colSpan: option.value })}>
                      {option.label}
                    </Button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => moveSelected("up")}><ArrowUp className="mr-2 h-4 w-4" />위로</Button>
                  <Button type="button" variant="outline" onClick={() => moveSelected("down")}><ArrowDown className="mr-2 h-4 w-4" />아래로</Button>
                </div>

                {selectedItem.sectionType === "images" && (
                  <div className="space-y-2">
                    <Label>갤러리 열 수</Label>
                    <div className="grid gap-2 sm:grid-cols-5">
                      {GRID_COL_OPTIONS.map((cols) => (
                        <Button key={cols} type="button" variant={selectedItem.gridCols === cols ? "default" : "outline"} onClick={() => updateItem(getSectionKey(selectedItem), { gridCols: cols })}>
                          {cols}열
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedItem.sectionType === "image_a" || selectedItem.sectionType === "image_b") && (
                  <div className="space-y-3">
                    <Label>배너 이미지</Label>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) uploadSectionImage(file);
                      event.target.value = "";
                    }} />
                    {selectedItem.imageUrl ? (
                      <div className="relative overflow-hidden rounded-xl border">
                        <img src={selectedItem.imageUrl} alt="" className="h-48 w-full object-cover" />
                        <div className="absolute right-3 top-3 flex gap-2">
                          <Button type="button" size="sm" variant="secondary" onClick={() => imageInputRef.current?.click()}>변경</Button>
                          <Button type="button" size="sm" variant="destructive" onClick={() => updateItem(getSectionKey(selectedItem), { imageUrl: null, imageKey: null })}>제거</Button>
                        </div>
                      </div>
                    ) : (
                      <Button type="button" variant="outline" onClick={() => imageInputRef.current?.click()}><ImageIcon className="mr-2 h-4 w-4" />이미지 업로드</Button>
                    )}
                  </div>
                )}

                {selectedItem.sectionType === "content_category" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label>연결할 페이지 카테고리</Label>
                      <Select value={String(selectedItem.sourceCategoryId ?? "")} onValueChange={(value) => updateItem(getSectionKey(selectedItem), { sourceCategoryId: Number(value) })}>
                        <SelectTrigger className="w-full bg-background"><SelectValue placeholder="카테고리를 선택하세요" /></SelectTrigger>
                        <SelectContent>
                          {contentCategoryOptions.map((option) => <SelectItem key={option.id} value={String(option.id)}>{option.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>노출 개수</Label>
                      <Input type="number" min={1} max={12} value={selectedItem.itemLimit ?? 6} onChange={(event) => updateItem(getSectionKey(selectedItem), { itemLimit: Number(event.target.value) || 6 })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>표시 방식</Label>
                      <Select value={selectedItem.displayVariant ?? "grid"} onValueChange={(value) => updateItem(getSectionKey(selectedItem), { displayVariant: value as DisplayVariant })}>
                        <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {CONTENT_VARIANTS.map((variant) => <SelectItem key={variant.value} value={variant.value}>{variant.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {selectedItem.sectionType === "media_category" && (
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2 md:col-span-2">
                      <Label>연결할 미디어 카테고리</Label>
                      <Select value={String(selectedItem.sourceCategoryId ?? "")} onValueChange={(value) => updateItem(getSectionKey(selectedItem), { sourceCategoryId: Number(value) })}>
                        <SelectTrigger className="w-full bg-background"><SelectValue placeholder="미디어 카테고리를 선택하세요" /></SelectTrigger>
                        <SelectContent>
                          {mediaCategories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>노출 개수</Label>
                      <Input type="number" min={1} max={12} value={selectedItem.itemLimit ?? 6} onChange={(event) => updateItem(getSectionKey(selectedItem), { itemLimit: Number(event.target.value) || 6 })} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>표시 방식</Label>
                      <Select value={selectedItem.displayVariant ?? "featured"} onValueChange={(value) => updateItem(getSectionKey(selectedItem), { displayVariant: value as DisplayVariant })}>
                        <SelectTrigger className="w-full bg-background"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {MEDIA_VARIANTS.map((variant) => <SelectItem key={variant.value} value={variant.value}>{variant.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {selectedItem.sectionType === "hero" && <HeroSlidesPanel />}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle>기본 섹션 추가</CardTitle>
              <CardDescription>홈에서 직접 관리하는 고정 섹션입니다.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {(Object.keys(PRESET_META) as Array<keyof typeof PRESET_META>).filter((type) => {
                const item = items.find((entry) => entry.sectionType === type);
                return !item || item.status === "hidden";
              }).map((type) => (
                <button key={type} type="button" onClick={() => addPresetSection(type)} className="rounded-xl border border-dashed p-4 text-left transition-colors hover:border-primary hover:bg-primary/5">
                  <p className="font-semibold">{PRESET_META[type].label}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{PRESET_META[type].description}</p>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>페이지 카테고리 섹션 추가</CardTitle>
              <CardDescription>카테고리와 하위 페이지를 홈 섹션으로 연결합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={contentCategoryDraftId} onValueChange={setContentCategoryDraftId}>
                <SelectTrigger className="w-full bg-background"><SelectValue placeholder="카테고리를 선택하세요" /></SelectTrigger>
                <SelectContent>
                  {contentCategoryOptions.map((option) => <SelectItem key={option.id} value={String(option.id)}>{option.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" className="w-full" onClick={() => addDynamicSection("content_category", contentCategoryDraftId ? Number(contentCategoryDraftId) : null)}>
                <Plus className="mr-2 h-4 w-4" />페이지 카테고리 추가
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle>미디어 카테고리 섹션 추가</CardTitle>
              <CardDescription>설교나 갤러리 같은 미디어 묶음을 홈 섹션으로 연결합니다.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Select value={mediaCategoryDraftId} onValueChange={setMediaCategoryDraftId}>
                <SelectTrigger className="w-full bg-background"><SelectValue placeholder="미디어 카테고리를 선택하세요" /></SelectTrigger>
                <SelectContent>
                  {mediaCategories.map((category) => <SelectItem key={category.id} value={String(category.id)}>{category.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button type="button" className="w-full" onClick={() => addDynamicSection("media_category", mediaCategoryDraftId ? Number(mediaCategoryDraftId) : null)}>
                <Video className="mr-2 h-4 w-4" />미디어 카테고리 추가
              </Button>
            </CardContent>
          </Card>

          {hiddenPresetSections.length > 0 && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle>숨김 처리된 기본 섹션</CardTitle>
                <CardDescription>필요하면 다시 복원할 수 있습니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {hiddenPresetSections.map((item) => (
                  <div key={getSectionKey(item)} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{TYPE_LABEL[item.sectionType]}</p>
                      <p className="text-sm text-muted-foreground">{item.title || "저장된 설정 유지"}</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={() => addPresetSection(item.sectionType as keyof typeof PRESET_META)}>
                      <Plus className="mr-2 h-4 w-4" />복원
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
