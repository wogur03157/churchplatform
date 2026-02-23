import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Upload } from "lucide-react";

export default function AdminImages() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryClientInstance = useQueryClient();
  const { data: images, isLoading } = useQuery({
    queryKey: ["images"],
    queryFn: () => api.get<any[]>("/images"),
  });

  const uploadMutation = useMutation({
    mutationFn: (data: any) => api.post<{ success: boolean; id: number; url: string }>("/images", data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["images"] });
      toast.success("이미지가 업로드되었습니다");
      resetForm();
      setIsCreateOpen(false);
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch<{ success: boolean }>(`/images/${id}`, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["images"] });
      toast.success("이미지가 수정되었습니다");
      resetForm();
      setIsEditOpen(false);
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete<{ success: boolean }>(`/images/${id}`),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["images"] });
      toast.success("이미지가 삭제되었습니다");
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsPublished(false);
    setDisplayOrder(0);
    setSelectedFile(null);
    setPreviewUrl("");
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      uploadMutation.mutate({
        title,
        description,
        fileData: base64,
        mimeType: selectedFile.type,
        fileSize: selectedFile.size,
        isPublished,
        displayOrder,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleEdit = (image: any) => {
    setEditingId(image.id);
    setTitle(image.title);
    setDescription(image.description || "");
    setIsPublished(image.isPublished === 1);
    setDisplayOrder(image.displayOrder);
    setPreviewUrl(image.url);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !title.trim()) {
      toast.error("제목을 입력해주세요");
      return;
    }
    updateMutation.mutate({ id: editingId, title, description, isPublished, displayOrder });
  };

  const handleDelete = (id: number) => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteMutation.mutate(id);
    }
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
                <Switch id="published" checked={isPublished} onCheckedChange={setIsPublished} />
                <Label htmlFor="published">즉시 발행</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
              <Button onClick={handleUpload} disabled={uploadMutation.isPending}>
                {uploadMutation.isPending ? "업로드 중..." : "업로드"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">로딩 중...</p></div>
      ) : images && images.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="elegant-shadow overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 text-base">
                      {image.title}
                      {image.isPublished === 1 && (
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
                  <Button variant="outline" size="sm" onClick={() => handleEdit(image)} className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />수정
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(image.id)}>
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
