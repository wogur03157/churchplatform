import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Video as VideoIcon } from "lucide-react";

export default function AdminVideos() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoType, setVideoType] = useState<"upload" | "youtube" | "vimeo" | "url">("youtube");
  const [url, setUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [category, setCategory] = useState<string>("");

  const queryClientInstance = useQueryClient();

  const { data: videoCategories } = useQuery({
    queryKey: ["video-categories"],
    queryFn: () => api.get<any[]>("/video-categories"),
  });
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: () => api.get<any[]>("/videos"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post<{ success: boolean; id: number }>("/videos", data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["videos"] });
      toast.success("영상이 등록되었습니다");
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch<{ success: boolean }>(`/videos/${id}`, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["videos"] });
      toast.success("영상이 수정되었습니다");
      resetForm();
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete<{ success: boolean }>(`/videos/${id}`),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["videos"] });
      toast.success("영상이 삭제되었습니다");
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoType("youtube");
    setUrl("");
    setThumbnailUrl("");
    setIsPublished(false);
    setDisplayOrder(0);
    setCategory("");
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!title.trim() || !url.trim()) {
      toast.error("제목과 URL을 입력해주세요");
      return;
    }
    createMutation.mutate({ title, description, videoType, url, thumbnailUrl: thumbnailUrl || undefined, isPublished, displayOrder, category: category || null });
  };

  const handleEdit = (video: any) => {
    setEditingId(video.id);
    setTitle(video.title);
    setDescription(video.description || "");
    setVideoType(video.videoType);
    setUrl(video.url);
    setThumbnailUrl(video.thumbnailUrl || "");
    setIsPublished(video.isPublished === 1);
    setDisplayOrder(video.displayOrder);
    setCategory(video.category ?? "");
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !title.trim() || !url.trim()) {
      toast.error("제목과 URL을 입력해주세요");
      return;
    }
    updateMutation.mutate({ id: editingId, title, description, url, thumbnailUrl: thumbnailUrl || undefined, isPublished, displayOrder, category: category || null });
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
  };

  const getVideoEmbed = (video: any) => {
    if (video.videoType === "youtube") {
      const videoId = video.url.includes("youtu.be")
        ? video.url.split("/").pop()
        : new URL(video.url).searchParams.get("v");
      return `https://www.youtube.com/embed/${videoId}`;
    } else if (video.videoType === "vimeo") {
      const videoId = video.url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return video.url;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">영상 관리</h1>
          <p className="text-muted-foreground mt-2">영상을 등록하고 관리하세요</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />영상 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>영상 추가</DialogTitle>
              <DialogDescription>새 영상을 등록하세요</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="videoType">영상 유형</Label>
                <Select value={videoType} onValueChange={(v: any) => setVideoType(v)}>
                  <SelectTrigger id="videoType"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="youtube">YouTube</SelectItem>
                    <SelectItem value="vimeo">Vimeo</SelectItem>
                    <SelectItem value="url">직접 URL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="url">영상 URL</Label>
                <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <Label htmlFor="title">제목</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="영상 제목" />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="영상 설명 (선택사항)" rows={3} />
              </div>
              <div>
                <Label htmlFor="thumbnailUrl">썸네일 URL (선택사항)</Label>
                <Input id="thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <Label htmlFor="category">카테고리</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category"><SelectValue placeholder="카테고리 선택 (선택사항)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">없음</SelectItem>
                    {(videoCategories ?? []).map((c: any) => (
                      <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="displayOrder">표시 순서</Label>
                <Input id="displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} placeholder="0" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                <Label htmlFor="published">즉시 발행</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "등록 중..." : "등록"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">로딩 중...</p></div>
      ) : videos && videos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {videos.map((video) => (
            <Card key={video.id} className="elegant-shadow overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted">
                {video.videoType === "youtube" || video.videoType === "vimeo" ? (
                  <iframe src={getVideoEmbed(video)} className="w-full h-full" allowFullScreen title={video.title} />
                ) : video.thumbnailUrl ? (
                  <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <VideoIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {video.title}
                      {video.isPublished === 1 && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">발행됨</span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-2">
                      {video.videoType.toUpperCase()} · 순서: {video.displayOrder}
                      {video.category && <Badge variant="outline" className="text-xs">{video.category}</Badge>}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {video.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{video.description}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(video)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />수정
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(video.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="elegant-shadow">
          <CardContent className="py-12 text-center">
            <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 영상이 없습니다. 첫 영상을 추가해보세요!</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>영상 수정</DialogTitle>
            <DialogDescription>영상 정보를 수정하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-url">영상 URL</Label>
              <Input id="edit-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
            </div>
            <div>
              <Label htmlFor="edit-title">제목</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="영상 제목" />
            </div>
            <div>
              <Label htmlFor="edit-description">설명</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="영상 설명 (선택사항)" rows={3} />
            </div>
            <div>
              <Label htmlFor="edit-thumbnailUrl">썸네일 URL (선택사항)</Label>
              <Input id="edit-thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
            </div>
            <div>
              <Label htmlFor="edit-category">카테고리</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="edit-category"><SelectValue placeholder="카테고리 선택 (선택사항)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">없음</SelectItem>
                  {(videoCategories ?? []).map((c: any) => (
                    <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-displayOrder">표시 순서</Label>
              <Input id="edit-displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} placeholder="0" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="edit-published" checked={isPublished} onCheckedChange={setIsPublished} />
              <Label htmlFor="edit-published">발행 상태</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>취소</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
