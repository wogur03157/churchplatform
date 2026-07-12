import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { PiggyBank, Save } from "lucide-react";

type BudgetRow = {
  accountId: number;
  accountName: string;
  departmentName: string | null;
  budget: number;
  spent: number;
  remaining: number;
  ratio: number | null;
};
type BudgetStatus = { year: number; rows: BudgetRow[]; totals: { budget: number; spent: number } };

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

export default function AdminFinanceBudget() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [drafts, setDrafts] = useState<Map<number, string>>(new Map());
  const [dirty, setDirty] = useState(false);

  const { data: status } = useQuery({
    queryKey: ["budgets", year],
    queryFn: () => api.get<BudgetStatus>(`/finance/budgets?year=${year}`),
  });

  // 서버 값 → 입력 초기화
  useEffect(() => {
    if (!status) return;
    setDrafts(new Map(status.rows.map((r) => [r.accountId, r.budget ? String(r.budget) : ""])));
    setDirty(false);
  }, [status]);

  const saveMutation = useMutation({
    mutationFn: () =>
      api.put("/finance/budgets", {
        year: parseInt(year),
        entries: Array.from(drafts.entries()).map(([accountId, value]) => ({
          accountId,
          amount: parseInt(value.replace(/[^0-9]/g, "")) || 0,
        })),
      }),
    onSuccess: () => {
      toast.success("예산이 저장되었습니다");
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setDraft = (accountId: number, value: string) => {
    const next = new Map(drafts);
    next.set(accountId, value);
    setDrafts(next);
    setDirty(true);
  };

  const totalBudgetDraft = Array.from(drafts.values()).reduce(
    (sum, v) => sum + (parseInt(v.replace(/[^0-9]/g, "")) || 0),
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">예산 편성·집행</h1>
          <p className="text-muted-foreground">
            지출 항목별 연간 예산을 편성하고 집행률을 확인합니다 (저장은 승인 권한 필요)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[currentYear + 1, currentYear, currentYear - 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => saveMutation.mutate()} disabled={!dirty || saveMutation.isPending}>
            <Save className="mr-2 h-4 w-4" /> 저장
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-primary">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">{year}년 예산 총액</p>
            <p className="text-2xl font-bold">{won(totalBudgetDraft)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">집행 총액</p>
            <p className="text-2xl font-bold">{won(status?.totals.spent ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">전체 집행률</p>
            <p className="text-2xl font-bold">
              {status && status.totals.budget > 0
                ? Math.round((status.totals.spent / status.totals.budget) * 100) + "%"
                : "-"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="space-y-3 pt-6">
          {(status?.rows ?? []).map((row) => {
            const draft = drafts.get(row.accountId) ?? "";
            const draftNum = parseInt(draft.replace(/[^0-9]/g, "")) || 0;
            const ratio = draftNum > 0 ? Math.min(100, Math.round((row.spent / draftNum) * 100)) : null;
            const over = draftNum > 0 && row.spent > draftNum;
            return (
              <div key={row.accountId} className="flex flex-wrap items-center gap-3 rounded-md border px-3 py-2.5">
                <div className="w-40">
                  <span className="text-sm font-medium">{row.accountName}</span>
                  {row.departmentName && (
                    <Badge variant="outline" className="ml-2">{row.departmentName}</Badge>
                  )}
                </div>
                <Input
                  inputMode="numeric"
                  className="w-40"
                  placeholder="예산 미편성"
                  value={draft ? Number(draft.replace(/[^0-9]/g, "")).toLocaleString("ko-KR") : ""}
                  onChange={(e) => setDraft(row.accountId, e.target.value)}
                />
                <div className="min-w-40 flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    {ratio !== null && (
                      <div
                        className={`h-full rounded-full ${over ? "bg-red-500" : ratio >= 80 ? "bg-amber-500" : "bg-primary"}`}
                        style={{ width: `${ratio}%` }}
                      />
                    )}
                  </div>
                </div>
                <div className="w-56 text-right text-sm">
                  <span className={over ? "font-semibold text-red-600" : ""}>
                    집행 {won(row.spent)}
                  </span>
                  {draftNum > 0 && (
                    <span className="ml-2 text-muted-foreground">
                      / 잔액 {won(draftNum - row.spent)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {status && status.rows.length === 0 && (
            <p className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <PiggyBank className="h-4 w-4" /> 지출 계정과목이 없습니다 — 재정 설정에서 먼저 추가하세요
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
