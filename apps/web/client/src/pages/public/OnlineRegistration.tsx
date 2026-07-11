import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import PublicPageLayout from "@/components/PublicPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { CheckCircle } from "lucide-react";

export default function OnlineRegistration() {
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const { data: pageData } = useQuery({
    queryKey: ["content-pages", "public", "canaan", "online-registration"],
    queryFn: () => api.get<any>("/content-pages/public/canaan/online-registration"),
  });

  const { data: fields } = useQuery({
    queryKey: ["form-fields", "active", "registration"],
    queryFn: () => api.get<any[]>("/form-fields?activeOnly=true&formType=registration"),
  });

  const submitMutation = useMutation({
    mutationFn: (fieldData: Record<string, string>) =>
      api.post("/form-submissions", { formType: "registration", fieldData }),
    onSuccess: () => setSubmitted(true),
    onError: () => toast.error("제출 중 오류가 발생했습니다. 다시 시도해 주세요."),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (const f of fields ?? []) {
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
          <h2 className="text-2xl font-bold mb-3">등록 신청이 완료되었습니다!</h2>
          <p className="text-muted-foreground">담당 목사님께서 곧 연락드리겠습니다. 영신교회에 오신 것을 환영합니다.</p>
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">{pageData?.title ?? "온라인 성도 등록"}</h1>
        <p className="text-muted-foreground text-lg mb-12">영신교회 성도로 등록해 주세요</p>

        <div className="grid gap-10 md:grid-cols-2">
          <div className="space-y-6">
            {pageData?.content ? (
              <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: pageData.content }} />
            ) : null}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">성도 등록 신청</h2>
            <form onSubmit={handleSubmit} className="space-y-4 p-6 border rounded-xl bg-muted/20">
              {(fields ?? []).map((field: any) => (
                <div key={field.id}>
                  <Label htmlFor={`f-${field.id}`}>
                    {field.label}
                    {field.required ? <span className="text-destructive ml-1">*</span> : <span className="text-muted-foreground ml-1 text-xs">(선택)</span>}
                  </Label>
                  {field.fieldType === "text" && (
                    <Input id={`f-${field.id}`} className="mt-1" placeholder={field.placeholder} value={fieldValues[field.label] ?? ""} onChange={(e) => setValue(field.label, e.target.value)} />
                  )}
                  {field.fieldType === "number" && (
                    <Input id={`f-${field.id}`} type="tel" className="mt-1" placeholder={field.placeholder} value={fieldValues[field.label] ?? ""} onChange={(e) => setValue(field.label, e.target.value)} />
                  )}
                  {field.fieldType === "dropdown" && (
                    <Select value={fieldValues[field.label] ?? ""} onValueChange={(v) => setValue(field.label, v)}>
                      <SelectTrigger id={`f-${field.id}`} className="mt-1"><SelectValue placeholder={field.placeholder} /></SelectTrigger>
                      <SelectContent>
                        {(field.options ?? []).map((opt: string) => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                  {field.fieldType === "textarea" && (
                    <Textarea id={`f-${field.id}`} className="mt-1" rows={4} placeholder={field.placeholder} value={fieldValues[field.label] ?? ""} onChange={(e) => setValue(field.label, e.target.value)} />
                  )}
                </div>
              ))}
              <Button type="submit" className="w-full mt-2" disabled={submitMutation.isPending}>
                {submitMutation.isPending ? "제출 중..." : "등록 신청하기"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
