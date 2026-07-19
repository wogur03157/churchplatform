import { api } from "@/lib/api";
import { won } from "@/lib/format";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  ClipboardList,
  FileBarChart,
  HandCoins,
  PiggyBank,
  TriangleAlert,
} from "lucide-react";

type MonthlyReport = {
  openingBalance: number;
  income: { total: number };
  expense: { total: number };
  closingBalance: number;
};
type Expense = {
  id: number;
  requestNo: string;
  title: string;
  amount: string;
  status: string;
};
type Batch = { id: number; date: string; serviceType: string; status: string };
type BudgetStatus = { totals: { budget: number; spent: number } };


/** 재정 현황 — 재정 탭의 첫 화면. 이번 달 요약과 할 일이 한눈에 */
export default function AdminFinanceDashboard() {
  const [, setLocation] = useLocation();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: report } = useQuery({
    queryKey: ["monthly-report", String(year), String(month)],
    queryFn: () => api.get<MonthlyReport>(`/finance/reports/monthly?year=${year}&month=${month}`),
  });
  const { data: pending = [] } = useQuery({
    queryKey: ["expenses", "pending"],
    queryFn: () => api.get<Expense[]>("/finance/expenses?status=pending"),
  });
  const { data: batches = [] } = useQuery({
    queryKey: ["offering-batches"],
    queryFn: () => api.get<Batch[]>("/finance/offering-batches"),
  });
  const { data: budget } = useQuery({
    queryKey: ["budgets", String(year)],
    queryFn: () => api.get<BudgetStatus>(`/finance/budgets?year=${year}`),
  });

  const countingBatches = batches.filter((b) => b.status === "counting");
  const budgetRatio =
    budget && budget.totals.budget > 0
      ? Math.round((budget.totals.spent / budget.totals.budget) * 100)
      : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">재정 현황</h1>
        <p className="text-muted-foreground">{year}년 {month}월 요약과 처리할 일</p>
      </div>

      {/* 확정 못 한 계수 세션 경고 */}
      {countingBatches.length > 0 && (
        <button
          onClick={() => setLocation("/admin/finance/offerings")}
          className="flex w-full items-center gap-3 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-left text-sm hover:bg-amber-100"
        >
          <TriangleAlert className="h-4 w-4 shrink-0 text-amber-600" />
          <span>
            <b>확정하지 않은 계수 세션 {countingBatches.length}건</b>이 있습니다 —{" "}
            {countingBatches.map((b) => `${b.date} ${b.serviceType}`).join(", ")}.
            이어서 입력하거나 폐기해주세요.
          </span>
        </button>
      )}

      {/* 이번 달 요약 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">전월 이월</p>
            <p className="text-2xl font-bold">{won(report?.openingBalance ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">이번 달 수입</p>
            <p className="text-2xl font-bold text-blue-700">+{won(report?.income.total ?? 0)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">이번 달 지출</p>
            <p className="text-2xl font-bold text-red-700">-{won(report?.expense.total ?? 0)}</p>
          </CardContent>
        </Card>
        <Card className="border-primary">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">현재 잔액</p>
            <p className="text-2xl font-bold">{won(report?.closingBalance ?? 0)}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 승인 대기 지출 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardList className="h-4 w-4" /> 승인 대기 지출 ({pending.length}건)
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setLocation("/admin/finance/expenses")}>
              전체 보기
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {pending.length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">대기 중인 결의서가 없습니다</p>
            )}
            {pending.slice(0, 5).map((e) => (
              <button
                key={e.id}
                onClick={() => setLocation("/admin/finance/expenses")}
                className="flex w-full items-center justify-between rounded-md border px-3 py-2 text-left text-sm hover:bg-accent"
              >
                <span>
                  <span className="mr-2 text-xs text-muted-foreground">{e.requestNo}</span>
                  {e.title}
                </span>
                <span className="font-semibold">{won(e.amount)}</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* 예산 + 바로가기 */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <PiggyBank className="h-4 w-4" /> {year}년 예산 집행률
              </CardTitle>
            </CardHeader>
            <CardContent>
              {budgetRatio === null ? (
                <p className="text-sm text-muted-foreground">
                  예산이 편성되지 않았습니다 —{" "}
                  <button className="underline" onClick={() => setLocation("/admin/finance/budget")}>
                    편성하러 가기
                  </button>
                </p>
              ) : (
                <div className="space-y-2">
                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${budgetRatio >= 100 ? "bg-red-500" : budgetRatio >= 80 ? "bg-amber-500" : "bg-primary"}`}
                      style={{ width: `${Math.min(100, budgetRatio)}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {won(budget!.totals.spent)} / {won(budget!.totals.budget)}
                    <Badge variant="secondary" className="ml-2">{budgetRatio}%</Badge>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16" onClick={() => setLocation("/admin/finance/offerings")}>
              <HandCoins className="mr-2 h-5 w-5" /> 헌금 계수 시작
            </Button>
            <Button variant="outline" className="h-16" onClick={() => setLocation("/admin/finance/reports")}>
              <FileBarChart className="mr-2 h-5 w-5" /> 월간 보고서
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
