import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Sparkles, Eye } from "lucide-react";
import PreviewPanel from "@/components/PreviewPanel";
import RichTextEditor from "@/components/RichTextEditor";
import { stripHtml } from "@/lib/utils";
import type { Announcement } from "@shared/entities";

export default function AdminAnnouncements() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [aiAction, setAiAction] = useState<"improve" | "summarize" | "translate_en" | "translate_ko">("improve");
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setStatus("draft");
    setEditingId(null);
    setIsCreateOpen(false);
    setIsEditOpen(false);
  };

  const { createMutation, updateMutation, confirmDelete } = useCRUD({
    queryKey: "announcements",
    path: "announcements",
    entityName: "공지사항",
    onSuccess: resetForm,
  });

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => api.get<Announcement[]>("/announcements"),
  });

  const aiAssistMutation = useMutation({
    mutationFn: (data: { text: string; action: string }) =>
      api.post<{ result: string }>("/ai-assistant/improve-text", data),
    onSuccess: (data) => {
      if (typeof data.result === "string") {
        const result = data.result.trim();
        const html = result.startsWith("<")
          ? result
          : result
              .split(/\n{2,}/)
              .filter(Boolean)
              .map((p) => `<p>${p.replace(/\n/g, "<br/>")}</p>`)
              .join("");
        setContent(html || `<p>${result}</p>`);
      }
      toast.success("AI 처리가 완료되었습니다");
      setIsAiProcessing(false);
    },
    onError: (error: any) => {
      toast.error(`AI 오류: ${error.message}`);
      setIsAiProcessing(false);
    },
  });

  const handleCreate = () => {
    if (!title.trim() || !stripHtml(content).trim()) {
      toast.error("제목과 내용을 입력하세요");
      return;
    }
    createMutation.mutate({ title, content, status });
  };

  const handleUpdate = () => {
    if (!editingId) return;
    if (!title.trim() || !stripHtml(content).trim()) {
      toast.error("제목과 내용을 입력하세요");
      return;
    }
    updateMutation.mutate({ id: editingId, title, content, status });
  };

  const handleAiAssist = () => {
    const plainText = stripHtml(content).trim();
    if (!plainText) {
      toast.error("먼저 내용을 입력하세요");
      return;
    }
    setIsAiProcessing(true);
    aiAssistMutation.mutate({ text: plainText, action: aiAction });
  };

  const formFields = (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">제목</Label>
        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="공지사항 제목" />
      </div>
      <div>
        <Label>내용</Label>
        <RichTextEditor content={content} onChange={setContent} placeholder="공지사항 내용을 입력하세요" className="mt-1.5" />
      </div>
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <Sparkles className="h-5 w-5 text-primary" />
        <div className="flex-1">
          <Label htmlFor="ai-action">AI 콘텐츠 지원</Label>
          <Select value={aiAction} onValueChange={(v: any) => setAiAction(v)}>
            <SelectTrigger id="ai-action" className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="improve">문구 개선</SelectItem>
              <SelectItem value="summarize">요약</SelectItem>
              <SelectItem value="translate_en">영어로 번역</SelectItem>
              <SelectItem value="translate_ko">한국어로 번역</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="button" variant="outline" onClick={handleAiAssist} disabled={isAiProcessing}>
          {isAiProcessing ? "처리 중..." : "AI 적용"}
        </Button>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="published" checked={status === "published"} onCheckedChange={(v) => setStatus(v ? "published" : "draft")} />
        <Label htmlFor="published">즉시 발행</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">공지사항 관리</h1>
          <p className="text-muted-foreground mt-2">공지사항을 작성하고 관리하세요</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-2 h-4 w-4" />미리보기
          </Button>
          <Dialog open={isCreateOpen} onOpenChange={(open) => { if (!open) resetForm(); else setIsCreateOpen(true); }}>
            <DialogTrigger asChild>
              <Button onClick={() => { setTitle(""); setContent(""); setStatus("draft"); setIsCreateOpen(true); }}>
                <Plus className="mr-2 h-4 w-4" />새 공지사항
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>새 공지사항 작성</DialogTitle>
                <DialogDescription>공지사항의 제목과 내용을 입력하세요</DialogDescription>
              </DialogHeader>
              {formFields}
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>취소</Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending ? "생성 중..." : "생성"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8"><p className="text-muted-foreground">로딩 중...</p></div>
      ) : announcements && announcements.length > 0 ? (
        <div className="grid gap-4">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="elegant-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div className="flex-1">
                  <CardTitle>{announcement.title}</CardTitle>
                  <CardDescription>
                    {new Date(announcement.createdAt).toLocaleDateString("ko-KR")} •
                    {announcement.status === "published" ? <span className="text-green-600">발행됨</span> : <span className="text-yellow-600">미발행</span>}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => {
                      setEditingId(announcement.id);
                      setTitle(announcement.title);
                      setContent(announcement.content);
                      setStatus(announcement.status);
                      setIsEditOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => confirmDelete(announcement.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(announcement.content)}</p>
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

      <Dialog open={isEditOpen} onOpenChange={(open) => { if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>공지사항 수정</DialogTitle>
            <DialogDescription>공지사항의 내용을 수정하세요</DialogDescription>
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

      <PreviewPanel isOpen={showPreview} onClose={() => setShowPreview(false)} />
    </div>
  );
}
