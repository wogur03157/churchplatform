import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export default function NewMember() {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted]     = useState(false);

  const { data: fields } = useQuery({
    queryKey: ["form-fields", "active"],
    queryFn:  () => api.get<any[]>("/form-fields?activeOnly=true"),
  });

  const submitMutation = useMutation({
    mutationFn: (fieldData: Record<string, string>) =>
      api.post("/form-submissions", { fieldData }),
    onSuccess: () => { setSubmitted(true); },
    onError:   () => { toast.error("제출 중 오류가 발생했습니다. 다시 시도해 주세요."); },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeFields = fields ?? [];
    for (const f of activeFields) {
      if (f.required && !fieldValues[f.label]?.trim()) {
        toast.error(`${f.label}을(를) 입력해주세요`);
        return;
      }
    }
    submitMutation.mutate(fieldValues);
  };

  const setValue = (label: string, value: string) =>
    setFieldValues((prev) => ({ ...prev, [label]: value }));

  if (submitted) {
    return (
      <PublicPageLayout>
        <div className="container py-24 max-w-lg text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h2 className="text-2xl font-bold mb-3">신청이 완료되었습니다!</h2>
          <p className="text-muted-foreground">담당 사역자가 곧 연락드리겠습니다. 영신교회에 오신 것을 환영합니다.</p>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">새가족 안내</h1>
        <p className="text-muted-foreground text-lg mb-12">영신교회에 오신 것을 환영합니다</p>

        <div className="grid gap-10 md:grid-cols-2">
          {/* 안내 */}
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-4">새가족 프로그램</h2>
              <div className="space-y-3">
                {[
                  { step: "01", title: "새가족 환영",     desc: "주일 예배 후 담당 사역자와 개별 상담" },
                  { step: "02", title: "새가족반 수강",   desc: "4주 과정으로 교회와 신앙을 배웁니다" },
                  { step: "03", title: "작은교회 배정",   desc: "지역과 상황에 맞는 소그룹에 합류합니다" },
                  { step: "04", title: "세례/입교",       desc: "세례 및 입교 교육 후 정식 교인 등록" },
                ].map((s) => (
                  <div key={s.step} className="flex gap-3 p-4 border rounded-lg">
                    <span className="text-xs font-bold text-primary bg-primary/10 rounded-full h-6 w-6 flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
                    <div>
                      <p className="font-medium text-sm">{s.title}</p>
                      <p className="text-xs text-muted-foreground">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* 신청 폼 */}
          <div>
            <h2 className="text-xl font-semibold mb-4">새가족 신청</h2>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-xl bg-muted/20">
              {(fields ?? []).map((field: any) => (
                <div key={field.id}>
                  <Label htmlFor={`field-${field.id}`}>
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {field.fieldType === "text" && (
                    <Input
                      id={`field-${field.id}`}
                      placeholder={field.placeholder}
                      value={fieldValues[field.label] ?? ""}
                      onChange={(e) => setValue(field.label, e.target.value)}
                      className="mt-1"
                    />
                  )}
                  {field.fieldType === "number" && (
                    <Input
                      id={`field-${field.id}`}
                      type="tel"
                      placeholder={field.placeholder}
                      value={fieldValues[field.label] ?? ""}
                      onChange={(e) => setValue(field.label, e.target.value)}
                      className="mt-1"
                    />
                  )}
                  {field.fieldType === "dropdown" && (
                    <Select
                      value={fieldValues[field.label] ?? ""}
                      onValueChange={(v) => setValue(field.label, v)}
                    >
                      <SelectTrigger id={`field-${field.id}`} className="mt-1">
                        <SelectValue placeholder={field.placeholder} />
                      </SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt: string) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                        {field.allowOther && <SelectItem value="기타">기타</SelectItem>}
                      </SelectContent>
                    </Select>
                  )}
                  {field.fieldType === "textarea" && (
                    <Textarea
                      id={`field-${field.id}`}
                      placeholder={field.placeholder}
                      value={fieldValues[field.label] ?? ""}
                      onChange={(e) => setValue(field.label, e.target.value)}
                      className="mt-1"
                      rows={3}
                    />
                  )}
                </div>
              ))}
              <Button type="submit" className="w-full mt-2" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "제출 중..." : "신청하기"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
