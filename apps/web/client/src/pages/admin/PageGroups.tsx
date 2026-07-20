import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
import type { PageGroup } from "@shared/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2 } from "lucide-react";

const TABS = [
  { key: "departments",   label: "부서소개" },
  { key: "god-love",      label: "하나님사랑" },
  { key: "neighbor-love", label: "이웃사랑" },
] as const;

type GroupKey = (typeof TABS)[number]["key"];

function emptyForm() {
  return { name: "", slug: "", description: "", imageUrl: "", displayOrder: 99, status: "visible" as "visible" | "hidden" };
}

export default function AdminPageGroups() {
  const [tab, setTab]             = useState<GroupKey>("departments");
  const [isOpen, setIsOpen]       = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm]           = useState(emptyForm());

  const close = () => { setIsOpen(false); setEditingId(null); setForm(emptyForm()); };

  const { createMutation, updateMutation, confirmDelete } = useCRUD({
    queryKey: "page-groups",
    path: "page-groups",
    entityName: "소그룹",
    onSuccess: close,
  });

  const { data: groups, isLoading } = useQuery({
    queryKey: ["page-groups", tab],
    queryFn: () => api.get<PageGroup[]>(`/page-groups?groupKey=${tab}`),
  });

  const openEdit = (g: PageGroup) => {
    setEditingId(g.id);
    setForm({ name: g.name, slug: g.slug ?? "", description: g.description ?? "", imageUrl: g.imageUrl ?? "", displayOrder: g.displayOrder, status: g.status });
    setIsOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.slug.trim()) { toast.error("이름과 슬러그를 입력해주세요"); return; }
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate({ ...form, groupKey: tab });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">소그룹 관리</h1>
          <p className="text-muted-foreground mt-1">부서·사역 소그룹 페이지를 관리합니다</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm(emptyForm()); setIsOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />추가
        </Button>
      </div>

      {/* 탭 */}
      <div className="flex gap-1 border-b">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t.key ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {(groups ?? []).length === 0 && (
                <p className="py-10 text-center text-muted-foreground text-sm">항목이 없습니다. 추가 버튼을 눌러주세요.</p>
              )}
              {(groups ?? []).map((g) => (
                <div key={g.id} className="flex items-center gap-4 px-5 py-3.5">
                  {g.imageUrl && (
                    <img src={g.imageUrl} alt={g.name} className="h-12 w-16 object-cover rounded shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{g.name}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">{g.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {g.status === "hidden" && (
                      <span className="text-xs text-muted-foreground">숨김</span>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(g)}>
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => confirmDelete(g.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={(v) => { if (!v) close(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "수정" : "추가"}</DialogTitle>
            <DialogDescription>{TABS.find((t) => t.key === tab)?.label} 항목</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>이름</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
            </div>
            <div>
              <Label>슬러그 (URL용 영문)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="예) bible-study" className="mt-1" />
            </div>
            <div>
              <Label>설명</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="mt-1" />
            </div>
            <div>
              <Label>이미지 URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." className="mt-1" />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Label>표시 순서</Label>
                <Input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} className="mt-1" />
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Switch checked={form.status === "visible"} onCheckedChange={(v) => setForm({ ...form, status: v ? "visible" : "hidden" })} />
                <Label>공개</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={close}>취소</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
