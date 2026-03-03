import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Trash2, Lock } from "lucide-react";

export default function AdminVideoCategories() {
  const [isOpen, setIsOpen]   = useState(false);
  const [name, setName]       = useState("");
  const [slug, setSlug]       = useState("");
  const [order, setOrder]     = useState(99);
  const qc = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ["video-categories"],
    queryFn: () => api.get<any[]>("/video-categories"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/video-categories", data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["video-categories"] });
      toast.success("카테고리가 추가되었습니다");
      setIsOpen(false); setName(""); setSlug(""); setOrder(99);
    },
    onError: () => toast.error("오류가 발생했습니다"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/video-categories/${id}`),
    onSuccess: (res: any) => {
      if (res.success === false) { toast.error(res.message ?? "삭제할 수 없습니다"); return; }
      qc.invalidateQueries({ queryKey: ["video-categories"] });
      toast.success("삭제되었습니다");
    },
    onError: () => toast.error("오류가 발생했습니다"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">영상 카테고리</h1>
          <p className="text-muted-foreground mt-1">설교 영상 분류 카테고리를 관리합니다</p>
        </div>
        <Button onClick={() => setIsOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />카테고리 추가
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {(categories ?? []).map((cat: any) => (
                <div key={cat.id} className="flex items-center justify-between px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{cat.name}</span>
                    <code className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{cat.slug}</code>
                    {cat.isBuiltIn && <Badge variant="secondary" className="text-xs">기본</Badge>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">순서 {cat.displayOrder}</span>
                    {cat.isBuiltIn ? (
                      <Button variant="ghost" size="sm" disabled>
                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { if (confirm("삭제하시겠습니까?")) deleteMutation.mutate(cat.id); }}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>카테고리 추가</DialogTitle>
            <DialogDescription>새 영상 카테고리를 추가합니다</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>이름</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="예) 부활절" className="mt-1" />
            </div>
            <div>
              <Label>슬러그 (영문)</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="예) easter" className="mt-1" />
            </div>
            <div>
              <Label>표시 순서</Label>
              <Input type="number" value={order} onChange={(e) => setOrder(Number(e.target.value))} className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>취소</Button>
            <Button
              onClick={() => createMutation.mutate({ name, slug, displayOrder: order })}
              disabled={!name.trim() || !slug.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? "추가 중..." : "추가"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
