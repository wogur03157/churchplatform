import { useRef, useState, type ChangeEvent } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Edit, Home, Plus, Trash2, Upload } from "lucide-react";
import type { Image, VideoCategory } from "@shared/entities";

export default function AdminImages() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"published" | "draft">("draft");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [showOnHome, setShowOnHome] = useState(false);
  const [category, setCategory] = useState("none");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  const homeToggleMutation = useMutation({
    mutationFn: ({ id, value }: { id: number; value: boolean }) =>
      api.patch<Image>(`/images/${id}`, { showOnHome: value }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["images"] }),
    onError: (error: any) => toast.error(error.message),
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setStatus("draft");
    setDisplayOrder(0);
    setShowOnHome(false);
    setCategory("none");
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

  const { data: categories } = useQuery({
    queryKey: ["video-categories"],
    queryFn: () => api.get<VideoCategory[]>("/video-categories"),
  });

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!title.trim()) {
      toast.error("제목을 입력해 주세요.");
      return;
    }

    if (!selectedFile) {
      toast.error("이미지 파일을 선택해 주세요.");
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
        category: category === "none" ? null : category,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleEdit = (image: Image) => {
    setEditingId(image.id);
    setTitle(image.title);
    setDescription(image.description ?? "");
    setStatus(image.status);
    setDisplayOrder(image.displayOrder);
    setShowOnHome(image.showOnHome);
    setCategory(image.category ?? "none");
    setPreviewUrl(image.url);
    setIsEditOpen(true);
  };

  const handleUpdate = () => {
    if (!editingId || !title.trim()) {
      toast.error("제목을 입력해 주세요.");
      return;
    }

    updateMutation.mutate({
      id: editingId,
      title,
      description,
      status,
      displayOrder,
      showOnHome,
      category: category === "none" ? null : category,
    });
  };

  const categorySelect = (
    <div>
      <Label htmlFor="category">카테고리</Label>
      <Select value={category} onValueChange={setCategory}>
        <SelectTrigger id="category" className="mt-1">
          <SelectValue placeholder="카테고리 선택" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">없음</SelectItem>
          {(categories ?? []).map((item) => (
            <SelectItem key={item.id} value={item.slug}>
              {item.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">이미지 관리</h1>
          <p className="text-muted-foreground mt-2">이미지를 업로드하고 공통 카테고리와 함께 관리합니다.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />이미지 업로드
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>이미지 업로드</DialogTitle>
              <DialogDescription>새 이미지를 업로드합니다.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="file">이미지 파일</Label>
                <div className="mt-2">
                  <Input ref={fileInputRef} id="file" type="file" accept="image/*" onChange={handleFileChange} />
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
                <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="이미지 설명" rows={3} />
              </div>
              <div>
                <Label htmlFor="displayOrder">표시 순서</Label>
                <Input id="displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} />
              </div>
              {categorySelect}
              <div className="flex items-center space-x-2">
                <Switch id="published" checked={status === "published"} onCheckedChange={(value) => setStatus(value ? "published" : "draft")} />
                <Label htmlFor="published">즉시 공개</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="showOnHome" checked={showOnHome} onCheckedChange={setShowOnHome} />
                <Label htmlFor="showOnHome">메인 갤러리에 노출</Label>
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
        <div className="text-center py-12">
          <p className="text-muted-foreground">불러오는 중...</p>
        </div>
      ) : images && images.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id} className="elegant-shadow overflow-hidden">
              <div className="aspect-video relative overflow-hidden bg-muted">
                <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
              </div>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="flex items-center gap-2 text-base flex-wrap">
                      <span className="truncate">{image.title}</span>
                      {image.status === "published" && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">공개</span>
                      )}
                      {image.category && <Badge variant="outline" className="text-xs">{image.category}</Badge>}
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
                    title="메인 노출 여부"
                    disabled={homeToggleMutation.isPending}
                    onClick={() => homeToggleMutation.mutate({ id: image.id, value: !image.showOnHome })}
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
            <p className="text-muted-foreground">아직 등록된 이미지가 없습니다.</p>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>이미지 수정</DialogTitle>
            <DialogDescription>이미지 정보를 수정합니다.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {previewUrl && <img src={previewUrl} alt="Preview" className="max-w-full h-auto rounded-lg elegant-shadow" />}
            <div>
              <Label htmlFor="edit-title">제목</Label>
              <Input id="edit-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="이미지 제목" />
            </div>
            <div>
              <Label htmlFor="edit-description">설명</Label>
              <Textarea id="edit-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="이미지 설명" rows={3} />
            </div>
            <div>
              <Label htmlFor="edit-displayOrder">표시 순서</Label>
              <Input id="edit-displayOrder" type="number" value={displayOrder} onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)} />
            </div>
            {categorySelect}
            <div className="flex items-center space-x-2">
              <Switch id="edit-published" checked={status === "published"} onCheckedChange={(value) => setStatus(value ? "published" : "draft")} />
              <Label htmlFor="edit-published">공개 상태</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="edit-showOnHome" checked={showOnHome} onCheckedChange={setShowOnHome} />
              <Label htmlFor="edit-showOnHome">메인 갤러리에 노출</Label>
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

