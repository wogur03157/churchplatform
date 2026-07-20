import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
import type { FloatingMessage } from "@shared/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Edit, Trash2, MessageSquare } from "lucide-react";

export default function AdminFloatingMessages() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState<"info" | "warning" | "success" | "announcement">("info");
  const [displayPosition, setDisplayPosition] = useState<"top" | "bottom" | "center">("center");
  const [status, setStatus] = useState<"active" | "inactive">("inactive");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const resetForm = () => {
    setTitle("");
    setContent("");
    setMessageType("info");
    setDisplayPosition("center");
    setStatus("inactive");
    setStartDate("");
    setEndDate("");
    setEditingId(null);
    setIsCreateOpen(false);
    setIsEditOpen(false);
  };

  const { createMutation, updateMutation, confirmDelete } = useCRUD({
    queryKey: "floating-messages",
    path: "floating-messages",
    entityName: "플로팅 메시지",
    onSuccess: resetForm,
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ["floating-messages"],
    queryFn: () => api.get<FloatingMessage[]>("/floating-messages"),
  });

  const handleCreate = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요");
      return;
    }
    createMutation.mutate({
      title, content, messageType, displayPosition, status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const handleEdit = (message: any) => {
    setEditingId(message.id);
    setTitle(message.title);
    setContent(message.content);
    setMessageType(message.messageType);
    setDisplayPosition(message.displayPosition);
    setStatus(message.status);
    setStartDate(message.startDate ? new Date(message.startDate).toISOString().slice(0, 16) : "");
    setEndDate(message.endDate ? new Date(message.endDate).toISOString().slice(0, 16) : "");
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !title.trim() || !content.trim()) {
      toast.error("제목과 내용을 입력해주세요");
      return;
    }
    updateMutation.mutate({
      id: editingId, title, content, messageType, displayPosition, status,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "info": return "bg-blue-100 text-blue-800";
      case "warning": return "bg-yellow-100 text-yellow-800";
      case "success": return "bg-green-100 text-green-800";
      case "announcement": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const formFields = (prefix = "") => (
    <div className="space-y-4">
      <div>
        <Label htmlFor={`${prefix}title`}>제목</Label>
        <Input id={`${prefix}title`} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="메시지 제목" />
      </div>
      <div>
        <Label htmlFor={`${prefix}content`}>내용</Label>
        <Textarea id={`${prefix}content`} value={content} onChange={(e) => setContent(e.target.value)} placeholder="메시지 내용" rows={4} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${prefix}messageType`}>메시지 유형</Label>
          <Select value={messageType} onValueChange={(v: any) => setMessageType(v)}>
            <SelectTrigger id={`${prefix}messageType`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="info">정보</SelectItem>
              <SelectItem value="warning">경고</SelectItem>
              <SelectItem value="success">성공</SelectItem>
              <SelectItem value="announcement">공지</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor={`${prefix}displayPosition`}>표시 위치</Label>
          <Select value={displayPosition} onValueChange={(v: any) => setDisplayPosition(v)}>
            <SelectTrigger id={`${prefix}displayPosition`}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="top">상단</SelectItem>
              <SelectItem value="center">중앙</SelectItem>
              <SelectItem value="bottom">하단</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor={`${prefix}startDate`}>시작 일시</Label>
          <Input id={`${prefix}startDate`} type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div>
          <Label htmlFor={`${prefix}endDate`}>종료 일시</Label>
          <Input id={`${prefix}endDate`} type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id={`${prefix}active`} checked={status === "active"} onCheckedChange={(v) => setStatus(v ? "active" : "inactive")} />
        <Label htmlFor={`${prefix}active`}>활성화</Label>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">플로팅 메시지 관리</h1>
          <p className="text-muted-foreground mt-2">방문자에게 표시할 팝업 메시지를 관리하세요</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}><Plus className="mr-2 h-4 w-4" />새 메시지</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>새 플로팅 메시지</DialogTitle>
              <DialogDescription>방문자에게 표시할 메시지를 작성하세요</DialogDescription>
            </DialogHeader>
            {formFields()}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
              <Button onClick={handleCreate} disabled={createMutation.isPending}>
                {createMutation.isPending ? "생성 중..." : "생성"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">로딩 중...</p></div>
      ) : messages && messages.length > 0 ? (
        <div className="grid gap-4">
          {messages.map((message) => (
            <Card key={message.id} className="elegant-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {message.title}
                      <span className={`text-xs px-2 py-1 rounded ${getTypeColor(message.messageType)}`}>{message.messageType}</span>
                      {message.status === "active" && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">활성</span>}
                    </CardTitle>
                    <CardDescription>
                      위치: {message.displayPosition === "top" ? "상단" : message.displayPosition === "center" ? "중앙" : "하단"}
                      {message.startDate && ` · ${new Date(message.startDate).toLocaleDateString("ko-KR")}`}
                      {message.endDate && ` ~ ${new Date(message.endDate).toLocaleDateString("ko-KR")}`}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(message)}><Edit className="h-4 w-4" /></Button>
                    <Button variant="outline" size="sm" onClick={() => confirmDelete(message.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{message.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="elegant-shadow">
          <CardContent className="py-12 text-center">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 플로팅 메시지가 없습니다. 첫 메시지를 작성해보세요!</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>플로팅 메시지 수정</DialogTitle>
            <DialogDescription>메시지 내용을 수정하세요</DialogDescription>
          </DialogHeader>
          {formFields("edit-")}
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
