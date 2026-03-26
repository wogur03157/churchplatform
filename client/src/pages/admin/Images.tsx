import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload, Home } from "lucide-react";
import type { Image } from "@shared/entities";

export default function AdminImages() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [showOnHome, setShowOnHome] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const homeToggleMutation = useMutation({
    mutationFn: ({ id, v }: { id: number; v: boolean }) =>
      api.patch<Image>(`/images/${id}`, { showOnHome: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["images"] }),
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("draft");
    setDisplayOrder(0);
    setShowOnHome(false);
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingId(null);
    setIsCreateOpen(false);
    setIsEditOpen(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const { createMutation, updateMutation, confirmDelete } = useCRUD({
    queryKey: "images",
    path: "images",
    entityName: "이미지",
    onSuccess: resetForm,
  });

  const { data: images, isLoading } = useQuery({
    queryKey: ["images"],
    queryFn: () => api.get<Image[]>("/images"),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("파일 크기는 10MB 이하여야 합니다");
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해주세요");
      return;
    }
    if (!selectedFile) {
      toast.error("이미지를 선택해주세요");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(",")[1];
      createMutation.mutate({
        title,
        description,
        fileData: base64,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        status,
        displayOrder,
        showOnHome,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleEdit = (image: Image) => {
    setEditingId(image.id);
    setTitle(image.title);
    setDescription(image.description || "");
    setStatus(image.status);
    setDisplayOrder(image.displayOrder);
    setShowOnHome(image.showOnHome);
    setPreviewUrl(image.url);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !title.trim()) {
      toast.error("제목을 입력해주세요");
      return;
    }
    updateMutation.mutate({ id: editingId, title, description, status, displayOrder, showOnHome });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">이미지 갤러리 관리</h1>
          <p className="text-muted-foreground mt-2">
            이미지를 업로드하고 관리하세요
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              이미지 업로드
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>이미지 업로드</DialogTitle>
              <DialogDescription>새 이미지를 업로드하세요</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">이미지 파일</Label>
                <div className="mt-2">
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                {previewUrl && (
                  <div className="mt-4">
                    <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg elegant-shadow" />
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="title">제목</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="이미지 제목" />
              </div>
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="이미지 설명 (선택사항)" rows={3} />
              </div>
              <div>
                <Label htmlFor="displayOrder">표시 순서</Label>
                <Input id="displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} placeholder="0" />
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="published" checked={status === "published"} onCheckedChange={(v) => setStatus(v ? "published" : "draft")} />
                <Label htmlFor="published">즉시 발행</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="showOnHome" checked={showOnHome} onCheckedChange={setShowOnHome} />
                <Label htmlFor="showOnHome">홈화면 갤러리에 노출</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
              <Button onClick={handleUpload} disabled={createMutation.isPending}>
                {createMutation.isPending ? "업로드 중..." : "업로드"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">로딩 중...</p></div>
      ) : images && images.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {(images as Image[]).map((image) => (
            <Card key={image.id} className="elegant-shadow overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {image.title}
                      {image.status === "published" && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">발행됨</span>
                      )}
                    </CardTitle>
                    <CardDescription className="text-xs">순서: {image.displayOrder}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {image.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{image.description}</p>
                )}
                <div className="flex gap-2">
                  <Button
                    variant={image.showOnHome ? "default" : "outline"}
                    size="sm"
                    className="flex-shrink-0"
                    title="홈화면 노출 여부"
                    disabled={homeToggleMutation.isPending}
                    onClick={() => homeToggleMutation.mutate({ id: image.id, v: !image.showOnHome })}
                  >
                    <Home className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEdit(image)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />수정
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => confirmDelete(image.id)}>
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
            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 이미지가 없습니다. 첫 이미지를 업로드해보세요!</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>이미지 수정</DialogTitle>
            <DialogDescription>이미지 정보를 수정하세요</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl && <div><img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg elegant-shadow" /></div>}
            <div>
              <Label htmlFor="edit-title">제목</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="이미지 제목" />
            </div>
            <div>
              <Label htmlFor="edit-description">설명</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="이미지 설명 (선택사항)" rows={3} />
            </div>
            <div>
              <Label htmlFor="edit-displayOrder">표시 순서</Label>
              <Input id="edit-displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} placeholder="0" />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="edit-published" checked={status === "published"} onCheckedChange={(v) => setStatus(v ? "published" : "draft")} />
              <Label htmlFor="edit-published">발행 상태</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="edit-showOnHome" checked={showOnHome} onCheckedChange={setShowOnHome} />
              <Label htmlFor="edit-showOnHome">홈화면 갤러리에 노출</Label>
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
