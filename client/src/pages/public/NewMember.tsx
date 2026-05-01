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

  const { data: pageData } = useQuery({
    queryKey: ["content-pages", "public", "community", "new-member"],
    queryFn: () => api.get<any>("/content-pages/public/community/new-member"),
  });

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
        <h1 className="text-4xl font-bold mb-4">{pageData?.title ?? "새가족 안내"}</h1>
        <p className="text-muted-foreground text-lg mb-12">영신교회에 오신 것을 환영합니다</p>

        <div className="grid gap-10 md:grid-cols-2">
          {/* 안내 */}
          <div className="space-y-6">
            {pageData?.content ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: pageData.content }} />
            ) : null}
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
