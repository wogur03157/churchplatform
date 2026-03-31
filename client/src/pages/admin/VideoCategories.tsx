import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Edit, Lock, Plus, Trash2 } from "lucide-react";

type VideoCategory = {
  id: number;
  name: string;
  slug: string;
  isBuiltIn: number;
  displayOrder: number;
};

const initialForm = {
  name: "",
  slug: "",
  displayOrder: 99,
};

export default function AdminVideoCategories() {
  const qc = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<VideoCategory | null>(null);
  const [form, setForm] = useState(initialForm);

  const { data: categories, isLoading } = useQuery({
    queryKey: ["video-categories"],
    queryFn: () => api.get<VideoCategory[]>("/video-categories"),
  });

  const resetDialog = () => {
    setIsOpen(false);
    setEditingCategory(null);
    setForm(initialForm);
  };

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["video-categories"] });
  };

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => api.post("/video-categories", payload),
    onSuccess: () => {
      toast.success("카테고리를 추가했습니다.");
      refresh();
      resetDialog();
    },
    onError: (error: any) => toast.error(error.message ?? "카테고리 추가에 실패했습니다."),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: typeof form) => api.patch(`/video-categories/${editingCategory?.id}`, payload),
    onSuccess: () => {
      toast.success("카테고리를 수정했습니다.");
      refresh();
      resetDialog();
    },
    onError: (error: any) => toast.error(error.message ?? "카테고리 수정에 실패했습니다."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/video-categories/${id}`),
    onSuccess: () => {
      toast.success("카테고리를 삭제했습니다.");
      refresh();
    },
    onError: (error: any) => toast.error(error.message ?? "카테고리 삭제에 실패했습니다."),
  });

  const openCreate = () => {
    setEditingCategory(null);
    setForm(initialForm);
    setIsOpen(true);
  };

  const openEdit = (category: VideoCategory) => {
    setEditingCategory(category);
    setForm({
      name: category.name,
      slug: category.slug,
      displayOrder: category.displayOrder,
    });
    setIsOpen(true);
  };

  const submit = () => {
    if (!form.name.trim() || !form.slug.trim()) {
      toast.error("이름과 slug를 입력해 주세요.");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate(form);
      return;
    }

    createMutation.mutate(form);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">미디어 카테고리</h1>
          <p className="text-muted-foreground mt-1">영상과 이미지가 함께 사용하는 공통 카테고리를 관리합니다.</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />카테고리 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {(categories ?? []).map((category) => {
                const isBuiltIn = Boolean(category.isBuiltIn);

                return (
                  <div key={category.id} className="flex items-center justify-between px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="font-medium truncate">{category.name}</span>
                      <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                        {category.slug}
                      </code>
                      {isBuiltIn && <Badge variant="secondary" className="text-xs">기본</Badge>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground">순서 {category.displayOrder}</span>
                      {isBuiltIn ? (
                        <Button variant="ghost" size="sm" disabled>
                          <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(category)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (confirm("이 카테고리를 삭제하시겠습니까?")) {
                                deleteMutation.mutate(category.id);
                              }
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={(open) => (!open ? resetDialog() : setIsOpen(true))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "카테고리 수정" : "카테고리 추가"}</DialogTitle>
            <DialogDescription>공통 미디어 카테고리의 이름, slug, 정렬 순서를 설정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="예: 부활절 설교"
              />
            </div>
            <div className="space-y-2">
              <Label>slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="예: easter"
              />
            </div>
            <div className="space-y-2">
              <Label>표시 순서</Label>
              <Input
                type="number"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, displayOrder: Number(e.target.value) || 0 }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>취소</Button>
            <Button onClick={submit} disabled={isPending}>
              {isPending ? "저장 중..." : "저장"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
