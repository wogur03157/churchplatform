import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

export default function AdminFormSubmissions() {
  const { data: submissions, isLoading } = useQuery({
    queryKey: ["form-submissions"],
    queryFn: () => api.get<any[]>("/form-submissions"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">신청 내역</h1>
        <p className="text-muted-foreground mt-1">새가족 신청 내역을 조회합니다</p>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">총 {(submissions ?? []).length}건</Badge>
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
          {(submissions ?? []).map((item: any, idx: number) => {
            const fields = item.fieldData as Record<string, string>;
            const entries = Object.entries(fields);
            return (
              <Card key={item.id}>
                <CardContent className="py-4 px-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid gap-1.5 flex-1">
                      {entries.map(([key, val]) => (
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
