import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Layers, ImageIcon, ExternalLink } from "lucide-react";

type Popup = {
  id: number; title: string; imageUrl: string | null; linkUrl: string | null;
  startDate: string | null; endDate: string | null; status: "active" | "inactive";
  createdAt: string;
};

const EMPTY_FORM = {
  title: "", linkUrl: "", startDate: "", endDate: "", status: "inactive" as "active" | "inactive",
  fileData: "", mimeType: "", previewUrl: "",
};

export default function AdminPopups() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Popup | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const closeAll = () => { setIsCreateOpen(false); setEditTarget(null); setForm(EMPTY_FORM); };

  const { createMutation, updateMutation, confirmDelete } = useCRUD({
    queryKey: "popups",
    path: "popups",
    entityName: "팝업",
    onSuccess: closeAll,
  });

  const { data: popups = [], isLoading } = useQuery({
    queryKey: ["popups"],
    queryFn: () => api.get<Popup[]>("/popups"),
  });

  const set = (k: keyof typeof EMPTY_FORM, v: any) => setForm((f) => ({ ...f, [k]: v }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      set("fileData", base64);
      set("mimeType", file.type);
      set("previewUrl", dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const buildPayload = () => ({
    title: form.title,
    linkUrl: form.linkUrl || undefined,
    startDate: form.startDate || undefined,
    endDate: form.endDate || undefined,
    status: form.status,
    ...(form.fileData ? { fileData: form.fileData, mimeType: form.mimeType } : {}),
  });

  const openEdit = (p: Popup) => {
    setEditTarget(p);
    setForm({
      title: p.title,
      linkUrl: p.linkUrl ?? "",
      startDate: p.startDate ? new Date(p.startDate).toISOString().slice(0, 16) : "",
      endDate: p.endDate ? new Date(p.endDate).toISOString().slice(0, 16) : "",
      status: p.status,
      fileData: "", mimeType: "",
      previewUrl: p.imageUrl ?? "",
    });
  };

  const getStatus = (p: Popup) => {
    if (p.status !== "active") return { label: "비활성", variant: "secondary" as const };
    const now = new Date();
    if (p.startDate && new Date(p.startDate) > now) return { label: "예정", variant: "outline" as const };
    if (p.endDate && new Date(p.endDate) < now) return { label: "종료", variant: "outline" as const };
    return { label: "노출 중", variant: "default" as const };
  };

  const FormBody = ({ isEdit }: { isEdit?: boolean }) => (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>제목 <span className="text-destructive">*</span></Label>
        <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="팝업 제목" />
      </div>

      {/* 이미지 업로드 */}
      <div className="space-y-1.5">
        <Label>이미지 {!isEdit && <span className="text-muted-foreground text-xs">(선택)</span>}</Label>
        <div
          className="border-2 border-dashed rounded-lg overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          {form.previewUrl ? (
            <img src={form.previewUrl} alt="preview" className="w-full max-h-48 object-contain bg-muted" />
          ) : (
            <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
              <ImageIcon className="h-8 w-8" />
              <p className="text-sm">클릭해서 이미지 선택</p>
              <p className="text-xs">JPG, PNG, GIF, WebP</p>
            </div>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        {form.previewUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground text-xs"
            onClick={() => { set("previewUrl", ""); set("fileData", ""); set("mimeType", ""); }}
          >
            이미지 제거
          </Button>
        )}
      </div>

      <div className="space-y-1.5">
        <Label>클릭 링크 <span className="text-muted-foreground text-xs">(선택)</span></Label>
        <Input
          value={form.linkUrl}
          onChange={(e) => set("linkUrl", e.target.value)}
          placeholder="https://example.com"
          type="url"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>게시 시작</Label>
          <Input type="datetime-local" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>게시 종료</Label>
          <Input type="datetime-local" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch id="popup-active" checked={form.status === "active"} onCheckedChange={(v) => set("status", v ? "active" : "inactive")} />
        <Label htmlFor="popup-active" className="cursor-pointer">활성화</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">팝업 관리</h1>
          <p className="text-muted-foreground mt-2">홈페이지에 표시할 이미지 팝업을 관리하세요</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(o) => { if (!o) closeAll(); else setIsCreateOpen(true); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />새 팝업</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>새 팝업</DialogTitle></DialogHeader>
            <FormBody />
            <DialogFooter>
              <Button variant="outline" onClick={closeAll}>취소</Button>
              <Button onClick={() => createMutation.mutate(buildPayload())} disabled={!form.title || createMutation.isPending}>
                {createMutation.isPending ? "생성 중..." : "생성"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-muted-foreground">로딩 중...</div>
      ) : popups.length === 0 ? (
        <Card className="elegant-shadow">
          <CardContent className="py-12 text-center">
            <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">팝업이 없습니다. 첫 팝업을 만들어보세요!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {popups.map((p) => {
            const status = getStatus(p);
            return (
              <Card key={p.id} className="elegant-shadow overflow-hidden">
                {/* 썸네일 */}
                <div className="aspect-video bg-muted relative">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
                <CardContent className="p-3 space-y-2">
                  <p className="font-medium text-sm truncate">{p.title}</p>
                  {(p.startDate || p.endDate) && (
                    <p className="text-xs text-muted-foreground">
                      {p.startDate ? new Date(p.startDate).toLocaleDateString("ko-KR") : "∞"}
                      {" ~ "}
                      {p.endDate ? new Date(p.endDate).toLocaleDateString("ko-KR") : "∞"}
                    </p>
                  )}
                  {p.linkUrl && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />{p.linkUrl}
                    </p>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button
                      variant="outline" size="sm" className="flex-1"
                      onClick={() => openEdit(p)}
                    >
                      <Edit className="h-3.5 w-3.5 mr-1" />수정
                    </Button>
                    <Button
                      variant="outline" size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => confirmDelete(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* 수정 다이얼로그 */}
      <Dialog open={!!editTarget} onOpenChange={(o) => { if (!o) closeAll(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>팝업 수정</DialogTitle></DialogHeader>
          <FormBody isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={closeAll}>취소</Button>
            <Button onClick={() => updateMutation.mutate({ id: editTarget!.id, ...buildPayload() })} disabled={!form.title || updateMutation.isPending}>
              {updateMutation.isPending ? "수정 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
