import RichTextEditor from "@/components/RichTextEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Save } from "lucide-react";
import type { ContentTemplateCode } from "@shared/entities";
import { SLOT_CONFIG, TEMPLATE_LABELS } from "./constants";
import { PageMediaEditor } from "./PageMediaEditor";
import type { CategoryNode, PageFormState } from "./types";

type PageEditorProps = {
  selectedCategory: CategoryNode | null;
  previewPath: string | null;
  pageForm: PageFormState;
  isLoading: boolean;
  isSaving: boolean;
  onChange: (updater: (prev: PageFormState) => PageFormState) => void;
  onSave: () => void;
};

export function PageEditor({
  selectedCategory,
  previewPath,
  pageForm,
  isLoading,
  isSaving,
  onChange,
  onSave,
}: PageEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{selectedCategory?.name ?? "페이지를 선택해 주세요"}</CardTitle>
        <CardDescription>
          {selectedCategory
            ? previewPath ?? "경로를 계산할 수 없습니다."
            : "왼쪽 목록에서 페이지를 선택하면 편집할 수 있습니다."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!selectedCategory && (
          <p className="text-sm text-muted-foreground">선택된 페이지가 없습니다.</p>
        )}

        {selectedCategory && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label>페이지 제목</Label>
                <Input
                  value={pageForm.title}
                  onChange={(event) =>
                    onChange((prev) => ({ ...prev, title: event.target.value }))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label>템플릿</Label>
                <Select
                  value={pageForm.templateCode}
                  onValueChange={(value) =>
                    onChange((prev) => ({
                      ...prev,
                      templateCode: value as ContentTemplateCode,
                      media: prev.media.filter((item) =>
                        SLOT_CONFIG[value as ContentTemplateCode].includes(item.slotKey),
                      ),
                    }))
                  }
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
                checked={pageForm.status === "published"}
                onCheckedChange={(checked) =>
                  onChange((prev) => ({
                    ...prev,
                    status: checked ? "published" : "draft",
                  }))
                }
              />
              <Label>공개</Label>
            </div>

            <div className="space-y-2">
              <Label>본문</Label>
              <RichTextEditor
                content={pageForm.content}
                onChange={(content) =>
                  onChange((prev) => ({ ...prev, content }))
                }
              />
            </div>

            <PageMediaEditor pageForm={pageForm} onChange={onChange} />

            <div className="flex justify-end">
              <Button onClick={onSave} disabled={isSaving || !selectedCategory.page?.id}>
                <Save className="mr-2 h-4 w-4" />저장
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
