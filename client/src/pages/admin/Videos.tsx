import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
import { getVideoEmbedUrl } from "@/lib/video-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Video as VideoIcon } from "lucide-react";
import { toast } from "sonner";
import type { Video, VideoCategory } from "@shared/entities";
import { compareSermonVideos } from "@shared/sermon-order";

type VideoType = "upload" | "youtube" | "vimeo" | "url";

interface VideoForm {
  title: string;
  description: string;
  scripture: string;
  sermonDate: string;
  preacher: string;
  videoType: VideoType;
  url: string;
  thumbnailUrl: string;
  status: "published" | "draft";
  displayOrder: number;
  category: string;
}

const DEFAULT_FORM: VideoForm = {
  title: "",
  description: "",
  scripture: "",
  sermonDate: "",
  preacher: "",
  videoType: "youtube",
  url: "",
  thumbnailUrl: "",
  status: "draft" as "published" | "draft",
  displayOrder: 0,
  category: "none",
};

export default function AdminVideos() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<VideoForm>(DEFAULT_FORM);

  const setField = <K extends keyof VideoForm>(key: K, value: VideoForm[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetForm = () => {
    setForm(DEFAULT_FORM);
    setEditingId(null);
    setIsCreateOpen(false);
    setIsEditOpen(false);
  };

  const { createMutation, updateMutation, confirmDelete } = useCRUD({
    queryKey: "videos",
    path: "videos",
    entityName: "영상",
    onSuccess: resetForm,
  });

  const { data: videoCategories } = useQuery({
    queryKey: ["video-categories"],
    queryFn: () => api.get<VideoCategory[]>("/video-categories"),
  });

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos"],
    queryFn: () => api.get<Video[]>("/videos"),
  });
  const sortedVideos = useMemo(() => [...(videos ?? [])].sort(compareSermonVideos), [videos]);

  const [fetchingInfo, setFetchingInfo] = useState(false);

  const handleFetchYoutube = async () => {
    setFetchingInfo(true);
    try {
      const info = await api.post<{
        title: string | null;
        sermonDate: string | null;
        scripture: string | null;
        preacher: string | null;
        thumbnailUrl: string | null;
      }>("/videos/youtube-info", { url: form.url.trim() });
      setForm((prev) => ({
        ...prev,
        title: info.title ?? prev.title,
        sermonDate: info.sermonDate ?? prev.sermonDate,
        scripture: info.scripture ?? prev.scripture,
        preacher: info.preacher ?? prev.preacher,
        thumbnailUrl: prev.thumbnailUrl || info.thumbnailUrl || "",
      }));
      toast.success("유튜브 정보를 가져왔습니다. 확인 후 저장하세요.");
    } catch (e) {
      toast.error((e as Error).message || "가져오지 못했습니다.");
    } finally {
      setFetchingInfo(false);
    }
  };

  const handleCreate = () => {
    if (!form.title.trim() || !form.url.trim()) {
      toast.error("제목과 URL을 입력해주세요");
      return;
    }
    createMutation.mutate({
      ...form,
      sermonDate: form.sermonDate || null,
      scripture: form.scripture || null,
      preacher: form.preacher || null,
      thumbnailUrl: form.thumbnailUrl || undefined,
      category: form.category === "none" ? null : form.category || null,
    });
  };

  const handleEdit = (video: Video) => {
    setEditingId(video.id);
    setForm({
      title: video.title,
      description: video.description ?? "",
      scripture: (video as any).scripture ?? "",
      sermonDate: (video as any).sermonDate ?? "",
      preacher: (video as any).preacher ?? "",
      videoType: video.videoType as VideoType,
      url: video.url,
      thumbnailUrl: video.thumbnailUrl ?? "",
      status: video.status,
      displayOrder: video.displayOrder,
      category: video.category ?? "none",
    });
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !form.title.trim() || !form.url.trim()) {
      toast.error("제목과 URL을 입력해주세요");
      return;
    }
    updateMutation.mutate({
      id: editingId,
      ...form,
      sermonDate: form.sermonDate || null,
      scripture: form.scripture || null,
      preacher: form.preacher || null,
      thumbnailUrl: form.thumbnailUrl || undefined,
      category: form.category === "none" ? null : form.category || null,
    });
  };

  const formFields = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="videoType">영상 유형</Label>
        <Select value={form.videoType} onValueChange={(v: VideoType) => setField("videoType", v)}>
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
        <div className="flex gap-2">
          <Input id="url" value={form.url} onChange={(e) => setField("url", e.target.value)} placeholder="https://www.youtube.com/watch?v=..." />
          <Button type="button" variant="outline" className="shrink-0" disabled={!form.url.trim() || fetchingInfo} onClick={handleFetchYoutube}>
            {fetchingInfo ? "가져오는 중..." : "유튜브에서 가져오기"}
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="title">제목</Label>
        <Input id="title" value={form.title} onChange={(e) => setField("title", e.target.value)} placeholder="영상 제목" />
      </div>
      <div>
        <Label htmlFor="description">설명</Label>
        <Textarea id="description" value={form.description} onChange={(e) => setField("description", e.target.value)} placeholder="영상 설명 (선택사항)" rows={3} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="sermonDate">설교 날짜</Label>
          <Input id="sermonDate" type="date" value={form.sermonDate} onChange={(e) => setField("sermonDate", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="scripture">설교 본문</Label>
          <Input id="scripture" value={form.scripture} onChange={(e) => setField("scripture", e.target.value)} placeholder="예: 요한복음 4:14" />
        </div>
        <div>
          <Label htmlFor="preacher">설교자</Label>
          <Input id="preacher" value={form.preacher} onChange={(e) => setField("preacher", e.target.value)} placeholder="예: 김상호 담임목사" />
        </div>
      </div>
      <div>
        <Label htmlFor="thumbnailUrl">썸네일 URL (선택사항)</Label>
        <Input id="thumbnailUrl" value={form.thumbnailUrl} onChange={(e) => setField("thumbnailUrl", e.target.value)} placeholder="https://..." />
      </div>
      <div>
        <Label htmlFor="category">카테고리</Label>
        <Select value={form.category} onValueChange={(v) => setField("category", v)}>
          <SelectTrigger id="category"><SelectValue placeholder="카테고리 선택 (선택사항)" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="none">없음</SelectItem>
            {(videoCategories ?? []).map((c) => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="displayOrder">표시 순서</Label>
        <p className="text-xs text-muted-foreground mb-1">0이면 설교 날짜 최신순입니다. 1 이상을 넣으면 그 숫자 순서로 목록 앞에 둡니다.</p>
        <Input id="displayOrder" type="number" value={form.displayOrder} onChange={(e) => setField("displayOrder", parseInt(e.target.value) || 0)} />
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="published" checked={form.status === "published"} onCheckedChange={(v) => setField("status", v ? "published" : "draft")} />
        <Label htmlFor="published">발행 상태</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">영상 관리</h1>
          <p className="text-muted-foreground mt-2">영상을 등록하고 관리하세요</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsCreateOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(DEFAULT_FORM); setIsCreateOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />영상 추가
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>영상 추가</DialogTitle>
              <DialogDescription>새 영상을 등록하세요</DialogDescription>
            </DialogHeader>
            {formFields}
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>취소</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "등록 중..." : "등록"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">로딩 중...</p></div>
      ) : sortedVideos.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedVideos.map((video) => {
            const embedUrl = getVideoEmbedUrl(video);
            return (
              <Card key={video.id} className="elegant-shadow overflow-hidden">
                <div className="aspect-video relative overflow-hidden bg-muted">
                  {embedUrl ? (
                    <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={video.title} />
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
                        {video.status === "published" && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">발행됨</span>
                        )}
                      </CardTitle>
                      <CardDescription className="text-xs flex items-center gap-2">
                        {video.videoType.toUpperCase()}
                        {video.sermonDate ? ` · ${String(video.sermonDate).slice(0, 10)}` : ""}
                        {video.displayOrder ? ` · 순서 ${video.displayOrder}` : ""}
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
                    <Button variant="outline" size="sm" onClick={() => confirmDelete(video.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="elegant-shadow">
          <CardContent className="py-12 text-center">
            <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 영상이 없습니다. 첫 영상을 추가해보세요!</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>영상 수정</DialogTitle>
            <DialogDescription>영상 정보를 수정하세요</DialogDescription>
          </DialogHeader>
          {formFields}
          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>취소</Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
