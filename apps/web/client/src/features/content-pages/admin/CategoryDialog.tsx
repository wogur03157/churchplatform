import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { ContentTemplateCode } from "@shared/entities";
import { TEMPLATE_LABELS } from "./constants";
import type { CategoryFormState } from "./types";

type ParentOption = {
  id: number;
  label: string;
  depth: number;
};

type CategoryDialogProps = {
  open: boolean;
  isEditing: boolean;
  form: CategoryFormState;
  pending: boolean;
  parentOptions: ParentOption[];
  onOpenChange: (open: boolean) => void;
  onChange: (updater: (prev: CategoryFormState) => CategoryFormState) => void;
  onSubmit: () => void;
};

export function CategoryDialog({
  open,
  isEditing,
  form,
  pending,
  parentOptions,
  onOpenChange,
  onChange,
  onSubmit,
}: CategoryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "카테고리 수정" : "카테고리 추가"}</DialogTitle>
          <DialogDescription>
            홈은 제외하고 `/church/*` 일반 페이지 카테고리만 관리합니다.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>상위 카테고리</Label>
            <Select
              value={String(form.parentId ?? "")}
              onValueChange={(value) =>
                onChange((prev) => ({
                  ...prev,
                  parentId: value ? Number(value) : null,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="상위 카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                {parentOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>이름</Label>
            <Input
              value={form.name}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, name: event.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>slug</Label>
            <Input
              value={form.slug}
              onChange={(event) =>
                onChange((prev) => ({ ...prev, slug: event.target.value }))
              }
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>정렬 순서</Label>
              <Input
                type="number"
                value={form.sortOrder}
                onChange={(event) =>
                  onChange((prev) => ({
                    ...prev,
                    sortOrder: Number(event.target.value) || 0,
                  }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>기본 템플릿</Label>
              <Select
                value={form.templateCode}
                onValueChange={(value: ContentTemplateCode) =>
                  onChange((prev) => ({ ...prev, templateCode: value }))
                }
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={form.status === "active"}
              onCheckedChange={(checked) =>
                onChange((prev) => ({
                  ...prev,
                  status: checked ? "active" : "hidden",
                }))
              }
            />
            <Label>메뉴 노출</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button onClick={onSubmit} disabled={pending}>
            저장
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
