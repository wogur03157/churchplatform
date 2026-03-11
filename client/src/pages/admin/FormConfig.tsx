import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { GripVertical, Settings } from "lucide-react";

const FIELD_TYPE_LABEL: Record<string, string> = {
  text:     "텍스트",
  number:   "숫자/전화",
  dropdown: "드롭다운",
  textarea: "장문 텍스트",
};

export default function AdminFormConfig() {
  const qc = useQueryClient();

  const { data: fields, isLoading } = useQuery({
    queryKey: ["form-fields"],
    queryFn: () => api.get<any[]>("/form-fields"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/form-fields/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["form-fields"] });
      toast.success("저장되었습니다");
    },
    onError: () => toast.error("오류가 발생했습니다"),
  });

  const toggleActive = (field: any) => {
    updateMutation.mutate({ id: field.id, status: field.status === "active" ? "inactive" : "active" });
  };

  const updateOrder = (field: any, delta: number) => {
    updateMutation.mutate({ id: field.id, displayOrder: field.displayOrder + delta });
  };

  if (isLoading) {
    return <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>;
  }

  const sorted = [...(fields ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">폼 필드 설정</h1>
        <p className="text-muted-foreground mt-1">새가족 신청 폼의 필드를 설정합니다</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {sorted.map((field: any, idx) => (
              <div key={field.id} className={`flex items-center gap-4 px-5 py-3.5 ${field.status !== "active" ? "opacity-50" : ""}`}>
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{field.label}</span>
                    <Badge variant="outline" className="text-xs">{FIELD_TYPE_LABEL[field.fieldType] ?? field.fieldType}</Badge>
                    {field.required && <Badge variant="destructive" className="text-xs">필수</Badge>}
                    {field.allowOther === "text" && <Badge variant="secondary" className="text-xs">기타 허용</Badge>}
                  </div>
                  {field.placeholder && (
                    <p className="text-xs text-muted-foreground mt-0.5">{field.placeholder}</p>
                  )}
                  {field.options && (
                    <p className="text-xs text-muted-foreground mt-0.5">옵션: {(field.options as string[]).join(", ")}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col gap-0.5">
                    <button
                      className="text-muted-foreground hover:text-foreground text-xs leading-none disabled:opacity-30"
                      onClick={() => updateOrder(field, -1)}
                      disabled={idx === 0}
                    >▲</button>
                    <button
                      className="text-muted-foreground hover:text-foreground text-xs leading-none disabled:opacity-30"
                      onClick={() => updateOrder(field, 1)}
                      disabled={idx === sorted.length - 1}
                    >▼</button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch checked={field.status === "active"} onCheckedChange={() => toggleActive(field)} />
                    <span className="text-xs text-muted-foreground w-8">{field.status === "active" ? "활성" : "비활성"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-2 p-4 bg-muted/30 rounded-lg text-sm text-muted-foreground">
        <Settings className="h-4 w-4 shrink-0 mt-0.5" />
        <p>필드 추가·삭제·내용 변경은 추후 업데이트에서 지원됩니다. 현재는 활성화 여부와 순서만 변경 가능합니다.</p>
      </div>
    </div>
  );
}
