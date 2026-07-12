import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ReceiptText, Undo2 } from "lucide-react";

type Account = { id: number; name: string };
type Offering = {
  id: number;
  date: string;
  accountId: number;
  memberId: number | null;
  donorName: string | null;
  amount: string;
  method: "cash" | "check" | "transfer";
  status: "confirmed" | "voided";
  voidReason: string | null;
};
type Summary = {
  byAccount: { accountId: number; accountName: string; count: number; total: number }[];
  grandTotal: number;
};

const METHOD_LABELS = { cash: "현금", check: "수표", transfer: "이체" } as const;
const won = (n: number | string) => Number(n).toLocaleString("ko-KR") + "원";

function monthRange() {
  const now = new Date();
  const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return { from, to: now.toISOString().slice(0, 10) };
}

export default function AdminFinanceLedger() {
  const queryClient = useQueryClient();
  const [{ from, to }, setRange] = useState(monthRange());
  const [showVoided, setShowVoided] = useState(false);

  const { data: accounts = [] } = useQuery({
    queryKey: ["finance-accounts", "income"],
    queryFn: () => api.get<Account[]>("/finance/accounts?kind=income"),
  });

  const { data: summary } = useQuery({
    queryKey: ["offering-summary", from, to],
    queryFn: () => api.get<Summary>(`/finance/offerings/summary?from=${from}&to=${to}`),
    enabled: !!from && !!to,
  });

  const { data: offerings = [] } = useQuery({
    queryKey: ["offerings-ledger", from, to, showVoided],
    queryFn: () =>
      api.get<Offering[]>(
        `/finance/offerings?from=${from}&to=${to}${showVoided ? "&includeVoided=true" : ""}`
      ),
    enabled: !!from && !!to,
  });

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.post(`/finance/offerings/${id}/void`, { reason }),
    onSuccess: () => {
      toast.success("취소되었습니다 (기록은 보존됨)");
      queryClient.invalidateQueries({ queryKey: ["offerings-ledger"] });
      queryClient.invalidateQueries({ queryKey: ["offering-summary"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const accountName = (id: number) => accounts.find((a) => a.id === id)?.name ?? "?";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">재정 장부 — 수입</h1>
        <p className="text-muted-foreground">기간별 헌금 내역과 종류별 집계 (주보·월간 보고 원천)</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Input type="date" className="w-40" value={from} onChange={(e) => setRange({ from: e.target.value, to })} />
        <span className="text-muted-foreground">~</span>
        <Input type="date" className="w-40" value={to} onChange={(e) => setRange({ from, to: e.target.value })} />
        <label className="ml-2 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showVoided} onChange={(e) => setShowVoided(e.target.checked)} />
          취소 건 표시
        </label>
      </div>

      {/* 종류별 집계 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">기간 총액</p>
            <p className="text-2xl font-bold">{won(summary?.grandTotal ?? 0)}</p>
          </CardContent>
        </Card>
        {(summary?.byAccount ?? []).map((row) => (
          <Card key={row.accountId}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{row.accountName} ({row.count}건)</p>
              <p className="text-xl font-semibold">{won(row.total)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 내역 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ReceiptText className="h-4 w-4" /> 내역 ({offerings.length}건)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {offerings.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">기간 내 기록이 없습니다</p>
          )}
          {offerings.map((o) => (
            <div
              key={o.id}
              className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                o.status === "voided" ? "opacity-50" : ""
              }`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-muted-foreground">{o.date}</span>
                <Badge variant="outline">{accountName(o.accountId)}</Badge>
                <span className={o.status === "voided" ? "line-through" : "font-medium"}>
                  {won(o.amount)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {o.memberId ? "교적 연결" : o.donorName || "무기명"} · {METHOD_LABELS[o.method]}
                </span>
                {o.status === "voided" && (
                  <Badge variant="destructive" className="text-[10px]">취소: {o.voidReason}</Badge>
                )}
              </div>
              {o.status === "confirmed" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 w-7 p-0 text-muted-foreground"
                  title="취소 (사유 필요)"
                  onClick={() => {
                    const reason = prompt("취소 사유를 입력해주세요 (기록에 남습니다)");
                    if (reason) voidMutation.mutate({ id: o.id, reason });
                  }}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
