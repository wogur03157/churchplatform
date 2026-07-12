import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import PublicPageLayout from "@/components/PublicPageLayout";

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

const won = (n: number) => n.toLocaleString("ko-KR") + "원";

/** 재정 투명성 공개 페이지 — 교회가 공개를 켠 경우에만 데이터가 보인다 */
export default function Transparency() {
  const now = new Date();
  const defaultYear = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const defaultMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const [year, setYear] = useState(defaultYear);
  const [month, setMonth] = useState(defaultMonth);

  const { data: report, error, isLoading } = useQuery({
    queryKey: ["public-monthly-report", year, month],
    queryFn: () =>
      api.get<MonthlyReport>(`/finance/public/monthly-report?year=${year}&month=${month}`),
    retry: false,
  });

  const moveMonth = (delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
  };

  return (
    <PublicPageLayout>
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold">재정 공개</h1>
          <p className="mt-2 text-muted-foreground">교회 재정을 투명하게 공개합니다</p>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => moveMonth(-1)}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            ← 이전 달
          </button>
          <span className="text-lg font-semibold">
            {year}년 {month}월
          </span>
          <button
            onClick={() => moveMonth(1)}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-accent"
          >
            다음 달 →
          </button>
        </div>

        {isLoading && <p className="py-12 text-center text-muted-foreground">불러오는 중…</p>}

        {error && (
          <div className="rounded-lg border bg-muted/40 py-12 text-center text-muted-foreground">
            <p>해당 월의 공개 자료가 없거나, 교회가 재정 공개를 사용하지 않습니다.</p>
          </div>
        )}

        {report && (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">전월 이월</p>
                <p className="text-lg font-semibold">{won(report.openingBalance)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">수입</p>
                <p className="text-lg font-semibold">{won(report.income.total)}</p>
              </div>
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">지출</p>
                <p className="text-lg font-semibold">{won(report.expense.total)}</p>
              </div>
              <div className="rounded-lg border-2 border-foreground/20 p-4">
                <p className="text-xs text-muted-foreground">잔액</p>
                <p className="text-lg font-bold">{won(report.closingBalance)}</p>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 font-semibold">수입 (헌금)</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {report.income.rows.map((r) => (
                      <tr key={r.name} className="border-b">
                        <td className="py-2">{r.name}</td>
                        <td className="py-2 text-right font-medium">{won(r.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div>
                <h3 className="mb-3 font-semibold">지출</h3>
                <table className="w-full text-sm">
                  <tbody>
                    {report.expense.rows.map((r) => (
                      <tr key={r.name} className="border-b">
                        <td className="py-2">
                          {r.name}
                          {r.departmentName && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({r.departmentName})
                            </span>
                          )}
                        </td>
                        <td className="py-2 text-right font-medium">{won(r.total)}</td>
                      </tr>
                    ))}
                    {report.expense.rows.length === 0 && (
                      <tr>
                        <td className="py-2 text-muted-foreground">지출 없음</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="pt-4 text-center text-xs text-muted-foreground">
              본 자료는 집계 요약이며, 개인별 헌금 내역은 포함되지 않습니다.
            </p>
          </>
        )}
      </div>
    </PublicPageLayout>
  );
}
