import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { GripVertical, Plus, Trash2 } from "lucide-react";

const FORM_TYPES = [
  { value: "new-member", label: "새가족 신청" },
  { value: "consultation", label: "상담 신청" },
  { value: "registration", label: "성도 등록" },
];

const FIELD_TYPE_LABEL: Record<string, string> = {
  text: "텍스트",
  number: "숫자/전화",
  dropdown: "드롭다운",
  textarea: "장문 텍스트",
};

type NewFieldState = {
  label: string;
  fieldType: string;
  placeholder: string;
  required: boolean;
  options: string;
};

const EMPTY_NEW_FIELD: NewFieldState = { label: "", fieldType: "text", placeholder: "", required: false, options: "" };

export default function AdminFormConfig() {
  const qc = useQueryClient();
  const [activeType, setActiveType] = useState("new-member");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newField, setNewField] = useState<NewFieldState>(EMPTY_NEW_FIELD);

  const { data: fields, isLoading } = useQuery({
    queryKey: ["form-fields", activeType],
    queryFn: () => api.get<any[]>(`/form-fields?formType=${activeType}`),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["form-fields", activeType] });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => api.patch(`/form-fields/${id}`, data),
    onSuccess: () => { invalidate(); toast.success("저장되었습니다"); },
    onError: () => toast.error("오류가 발생했습니다"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/form-fields", data),
    onSuccess: () => {
      invalidate();
      toast.success("필드가 추가되었습니다");
      setNewField(EMPTY_NEW_FIELD);
      setShowAddForm(false);
    },
    onError: () => toast.error("오류가 발생했습니다"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/form-fields/${id}`),
    onSuccess: () => { invalidate(); toast.success("삭제되었습니다"); },
    onError: () => toast.error("오류가 발생했습니다"),
  });

  const handleCreate = () => {
    if (!newField.label.trim()) return toast.error("필드 이름을 입력해주세요");
    if (!newField.fieldType) return toast.error("필드 타입을 선택해주세요");
    const sorted = [...(fields ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);
    const maxOrder = sorted.length > 0 ? sorted[sorted.length - 1].displayOrder : 0;
    createMutation.mutate({
      formType: activeType,
      label: newField.label.trim(),
      fieldType: newField.fieldType,
      placeholder: newField.placeholder.trim() || null,
      required: newField.required ? 1 : 0,
      options: (newField.fieldType === "dropdown") && newField.options.trim()
        ? newField.options.split(",").map((s) => s.trim()).filter(Boolean)
        : null,
      displayOrder: maxOrder + 10,
      status: "active",
    });
  };

  const sorted = [...(fields ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">폼 필드 설정</h1>
        <p className="text-muted-foreground mt-1">신청 폼별로 필드를 관리합니다</p>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 flex-wrap">
        {FORM_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => { setActiveType(t.value); setShowAddForm(false); }}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeType === t.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="h-14 rounded-lg bg-muted animate-pulse" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {sorted.map((field: any, idx) => (
                <div key={field.id} className={`flex items-center gap-4 px-5 py-3.5 ${field.status !== "active" ? "opacity-50" : ""}`}>
                  <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{field.label}</span>
                      <Badge variant="outline" className="text-xs">{FIELD_TYPE_LABEL[field.fieldType] ?? field.fieldType}</Badge>
                      {field.required ? <Badge variant="destructive" className="text-xs">필수</Badge> : <Badge variant="secondary" className="text-xs">선택</Badge>}
                    </div>
                    {field.placeholder && <p className="text-xs text-muted-foreground mt-0.5">{field.placeholder}</p>}
                    {field.options && <p className="text-xs text-muted-foreground mt-0.5">옵션: {(field.options as string[]).join(", ")}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex flex-col gap-0.5">
                      <button className="text-muted-foreground hover:text-foreground text-xs leading-none disabled:opacity-30" onClick={() => updateMutation.mutate({ id: field.id, displayOrder: field.displayOrder - 11 })} disabled={idx === 0}>▲</button>
                      <button className="text-muted-foreground hover:text-foreground text-xs leading-none disabled:opacity-30" onClick={() => updateMutation.mutate({ id: field.id, displayOrder: field.displayOrder + 11 })} disabled={idx === sorted.length - 1}>▼</button>
                    </div>
                    <Switch checked={field.status === "active"} onCheckedChange={() => updateMutation.mutate({ id: field.id, status: field.status === "active" ? "inactive" : "active" })} />
                    <button className="text-muted-foreground hover:text-red-500 transition-colors" onClick={() => deleteMutation.mutate(field.id)}>
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 필드 추가 */}
      {showAddForm ? (
        <Card>
          <CardContent className="pt-5 space-y-4">
            <h3 className="font-semibold">새 필드 추가</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>필드 이름 *</Label>
                <Input className="mt-1" placeholder="예) 이름" value={newField.label} onChange={(e) => setNewField((p) => ({ ...p, label: e.target.value }))} />
              </div>
              <div>
                <Label>필드 타입 *</Label>
                <Select value={newField.fieldType} onValueChange={(v) => setNewField((p) => ({ ...p, fieldType: v }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(FIELD_TYPE_LABEL).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>플레이스홀더</Label>
                <Input className="mt-1" placeholder="입력 힌트 텍스트" value={newField.placeholder} onChange={(e) => setNewField((p) => ({ ...p, placeholder: e.target.value }))} />
              </div>
              {newField.fieldType === "dropdown" && (
                <div>
                  <Label>옵션 (쉼표로 구분)</Label>
                  <Input className="mt-1" placeholder="예) 남, 여" value={newField.options} onChange={(e) => setNewField((p) => ({ ...p, options: e.target.value }))} />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newField.required} onCheckedChange={(v) => setNewField((p) => ({ ...p, required: v }))} />
              <span className="text-sm">필수 입력</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} disabled={createMutation.isPending}>추가</Button>
              <Button variant="outline" onClick={() => { setShowAddForm(false); setNewField(EMPTY_NEW_FIELD); }}>취소</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button variant="outline" onClick={() => setShowAddForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          필드 추가
        </Button>
      )}
    </div>
  );
}
