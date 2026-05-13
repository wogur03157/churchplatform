import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

const FORM_TYPES = [
  { value: "", label: "전체" },
  { value: "new-member", label: "새가족 신청" },
  { value: "consultation", label: "상담 신청" },
  { value: "registration", label: "성도 등록" },
];

export default function AdminFormSubmissions() {
  const [activeType, setActiveType] = useState("");

  const { data: submissions, isLoading } = useQuery({
    queryKey: ["form-submissions", activeType],
    queryFn: () => api.get<any[]>(`/form-submissions${activeType ? `?formType=${activeType}` : ""}`),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">신청 내역</h1>
        <p className="text-muted-foreground mt-1">폼 제출 내역을 조회합니다</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {FORM_TYPES.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeType === t.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            {t.label}
          </button>
        ))}
        <Badge variant="outline" className="ml-auto self-center">총 {(submissions ?? []).length}건</Badge>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 rounded-lg bg-muted animate-pulse" />)}
        </div>
      ) : (submissions ?? []).length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 신청 내역이 없습니다.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {(submissions ?? []).map((item: any) => {
            const fields = item.fieldData as Record<string, string>;
            const typeLabel = FORM_TYPES.find((t) => t.value === item.formType)?.label ?? item.formType ?? "새가족 신청";
            return (
              <Card key={item.id}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid gap-1.5 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">{typeLabel}</Badge>
                      </div>
                      {Object.entries(fields).map(([key, val]) => (
                        <div key={key} className="flex gap-3 text-sm">
                          <span className="text-muted-foreground w-20 shrink-0">{key}</span>
                          <span className="font-medium">{val}</span>
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground shrink-0">
                      {new Date(item.submittedAt).toLocaleString("ko-KR")}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
