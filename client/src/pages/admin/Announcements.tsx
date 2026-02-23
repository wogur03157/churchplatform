import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Sparkles, Eye } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import PreviewPanel from "@/components/PreviewPanel";

export default function AdminAnnouncements() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [aiAction, setAiAction] = useState<"improve" | "summarize" | "translate_en" | "translate_ko">("improve");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const utils = trpc.useUtils();
  const { data: announcements, isLoading } = trpc.announcements.list.useQuery();
  
  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("공지사항이 생성되었습니다");
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const updateMutation = trpc.announcements.update.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("공지사항이 수정되었습니다");
      resetForm();
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      utils.announcements.list.invalidate();
      toast.success("공지사항이 삭제되었습니다");
    },
    onError: (error) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const aiAssistMutation = trpc.aiAssistant.improveText.useMutation({
    onSuccess: (data) => {
      if (typeof data.result === 'string') {
        setContent(data.result);
      }
      toast.success("AI 처리가 완료되었습니다");
      setIsAiProcessing(false);
    },
    onError: (error) => {
      toast.error(`AI 오류: ${error.message}`);
      setIsAiProcessing(false);
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setIsPublished(false);
    setEditingId(null);
  };

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력하세요");
      return;
    }
    createMutation.mutate({ title, content, isPublished });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력하세요");
      return;
    }
    updateMutation.mutate({ id: editingId, title, content, isPublished });
  };

  const handleAiAssist = () => {
    if (!content.trim()) {
      toast.error("먼저 내용을 입력하세요");
      return;
    }
    setIsAiProcessing(true);
    aiAssistMutation.mutate({ text: content, action: aiAction });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">공지사항 관리</h1>
          <p className="text-muted-foreground mt-2">
            공지사항을 작성하고 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-2 h-4 w-4" />
            미리보기
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                새 공지사항
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>새 공지사항 작성</DialogTitle>
                <DialogDescription>
                  공지사항의 제목과 내용을 입력하세요
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">제목</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="공지사항 제목"
                  />
                </div>
                <div>
                  <Label htmlFor="content">내용</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="공지사항 내용"
                    rows={8}
                  />
                </div>
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div className="flex-1">
                    <Label htmlFor="ai-action">AI 콘텐츠 지원</Label>
                    <Select value={aiAction} onValueChange={(v: any) => setAiAction(v)}>
                      <SelectTrigger id="ai-action" className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="improve">문구 개선</SelectItem>
                        <SelectItem value="summarize">요약</SelectItem>
                        <SelectItem value="translate_en">영어로 번역</SelectItem>
                        <SelectItem value="translate_ko">한국어로 번역</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAiAssist}
                    disabled={isAiProcessing}
                  >
                    {isAiProcessing ? "처리 중..." : "AI 적용"}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={isPublished}
                    onCheckedChange={setIsPublished}
                  />
                  <Label htmlFor="published">즉시 발행</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  취소
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "생성 중..." : "생성"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="elegant-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1">
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription>
                    {new Date(announcement.createdAt).toLocaleDateString("ko-KR")} • 
                    {announcement.isPublished ? <span className="text-green-600">발행됨</span> : <span className="text-yellow-600">미발행</span>}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(announcement.id);
                      setTitle(announcement.title);
                      setContent(announcement.content);
                      setIsPublished(announcement.isPublished === 1);
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ id: announcement.id })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="elegant-shadow">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">공지사항이 없습니다</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <DialogDescription>
              공지사항의 내용을 수정하세요
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">제목</Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지사항 제목"
              />
            </div>
            <div>
              <Label htmlFor="edit-content">내용</Label>
              <Textarea
                id="edit-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="공지사항 내용"
                rows={8}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-published"
                checked={isPublished}
                onCheckedChange={setIsPublished}
              />
              <Label htmlFor="edit-published">발행</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              취소
            </Button>
            <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "수정 중..." : "수정"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Panel */}
      <PreviewPanel isOpen={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  );
}
