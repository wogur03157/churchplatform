import { useState } from "react";
import { api } from "@/lib/api";
import { won } from "@/lib/format";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { FileBarChart, Globe, Printer } from "lucide-react";

type MonthlyReport = {
  year: number;
  month: number;
  openingBalance: number;
  income: { rows: { name: string; count: number; total: number }[]; total: number };
  expense: {
    rows: { name: string; departmentName: string | null; count: number; total: number }[];
    total: number;
  };
  closingBalance: number;
};
type WeeklyReport = {
  date: string;
  byAccount: { name: string; count: number; total: number }[];
  grandTotal: number;
};


/** 가장 최근 주일 날짜 */
function lastSunday(): string {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
}

export default function AdminFinanceReports() {
  const queryClient = useQueryClient();
  const now = new Date();
  const [year, setYear] = useState(String(now.getFullYear()));
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const [weekDate, setWeekDate] = useState(lastSunday());

  const { data: report } = useQuery({
    queryKey: ["monthly-report", year, month],
    queryFn: () => api.get<MonthlyReport>(`/finance/reports/monthly?year=${year}&month=${month}`),
  });

  const { data: weekly } = useQuery({
    queryKey: ["weekly-report", weekDate],
    queryFn: () => api.get<WeeklyReport>(`/finance/reports/weekly?date=${weekDate}`),
    enabled: !!weekDate,
  });

  const { data: transparency } = useQuery({
    queryKey: ["transparency"],
    queryFn: () => api.get<{ enabled: boolean }>("/finance/reports/transparency"),
  });

  const transparencyMutation = useMutation({
    mutationFn: (enabled: boolean) => api.put("/finance/reports/transparency", { enabled }),
    onSuccess: (_, enabled) => {
      toast.success(
        enabled
          ? "재정 공개가 켜졌습니다 — 홈페이지 /transparency에서 월간 요약이 공개됩니다"
          : "재정 공개가 꺼졌습니다"
      );
      queryClient.invalidateQueries({ queryKey: ["transparency"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl font-bold">재정 보고서</h1>
          <p className="text-muted-foreground">제직회용 월간 보고와 주보용 주간 요약</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[now.getFullYear(), now.getFullYear() - 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}년</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={month} onValueChange={setMonth}>
            <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
            <SelectContent>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <SelectItem key={m} value={String(m)}>{m}월</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> 인쇄
          </Button>
        </div>
      </div>

      {/* 월간 보고서 (인쇄 대상) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileBarChart className="h-4 w-4" /> {year}년 {month}월 재정 보고
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-4">
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">전월 이월</p>
                  <p className="text-lg font-semibold">{won(report.openingBalance)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">당월 수입</p>
                  <p className="text-lg font-semibold text-blue-700">+{won(report.income.total)}</p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-xs text-muted-foreground">당월 지출</p>
                  <p className="text-lg font-semibold text-red-700">-{won(report.expense.total)}</p>
                </div>
                <div className="rounded-lg border border-primary p-3">
                  <p className="text-xs text-muted-foreground">월말 잔액</p>
                  <p className="text-lg font-bold">{won(report.closingBalance)}</p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h3 className="mb-2 font-semibold">수입 (헌금)</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {report.income.rows.map((r) => (
                        <tr key={r.name} className="border-b">
                          <td className="py-1.5">{r.name}</td>
                          <td className="py-1.5 text-right text-muted-foreground">{r.count}건</td>
                          <td className="py-1.5 text-right font-medium">{won(r.total)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td className="py-2 font-bold">수입 합계</td>
                        <td />
                        <td className="py-2 text-right font-bold">{won(report.income.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">지출</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      {report.expense.rows.map((r) => (
                        <tr key={r.name} className="border-b">
                          <td className="py-1.5">
                            {r.name}
                            {r.departmentName && (
                              <span className="ml-1 text-xs text-muted-foreground">({r.departmentName})</span>
                            )}
                          </td>
                          <td className="py-1.5 text-right text-muted-foreground">{r.count}건</td>
                          <td className="py-1.5 text-right font-medium">{won(r.total)}</td>
                        </tr>
                      ))}
                      {report.expense.rows.length === 0 && (
                        <tr><td className="py-2 text-muted-foreground">지출 없음</td></tr>
                      )}
                      <tr>
                        <td className="py-2 font-bold">지출 합계</td>
                        <td />
                        <td className="py-2 text-right font-bold">{won(report.expense.total)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 주보용 주간 요약 */}
      <Card className="print:hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">주보용 헌금 요약</CardTitle>
          <Input
            type="date"
            className="w-40"
            value={weekDate}
            onChange={(e) => setWeekDate(e.target.value)}
          />
        </CardHeader>
        <CardContent>
          {weekly && weekly.byAccount.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {weekly.byAccount.map((r) => (
                <Badge key={r.name} variant="secondary" className="px-3 py-1.5 text-sm">
                  {r.name} {won(r.total)}
                </Badge>
              ))}
              <Badge className="px-3 py-1.5 text-sm">합계 {won(weekly.grandTotal)}</Badge>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">해당 날짜의 헌금 기록이 없습니다</p>
          )}
        </CardContent>
      </Card>

      {/* 투명성 공개 */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="h-4 w-4" /> 재정 투명성 공개
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            켜면 교회 홈페이지 <code className="rounded bg-muted px-1">/transparency</code>에서
            누구나 월간 재정 요약(집계 금액만)을 볼 수 있습니다. 개인별 헌금 내역은 공개되지 않습니다.
          </p>
          <Button
            variant={transparency?.enabled ? "destructive" : "default"}
            onClick={() => transparencyMutation.mutate(!transparency?.enabled)}
          >
            {transparency?.enabled ? "공개 끄기" : "공개 켜기 (승인 권한)"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
