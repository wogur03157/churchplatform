import { useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Lock, LockOpen, ReceiptText, Undo2 } from "lucide-react";
import { ConfirmDialog, ReasonDialog } from "@/components/ReasonDialog";
import { monthRange, OFFERING_METHOD_LABELS as METHOD_LABELS, won } from "@/lib/format";

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
type ClosingLock = { id: number; year: number; month: number | null };
type Summary = {
  byAccount: { accountId: number; accountName: string; count: number; total: number }[];
  grandTotal: number;
};

export default function AdminFinanceLedger() {
  const queryClient = useQueryClient();
  const [{ from, to }, setRange] = useState(monthRange());
  const [showVoided, setShowVoided] = useState(false);
  const [voidTarget, setVoidTarget] = useState<number | null>(null);
  const [lockConfirm, setLockConfirm] = useState<{ month: number; lockId: number | null } | null>(null);

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

  // ── 월 마감 ──
  const year = new Date().getFullYear();
  const { data: closings = [] } = useQuery({
    queryKey: ["closings", year],
    queryFn: () => api.get<ClosingLock[]>(`/finance/closings?year=${year}`),
  });
  const lockMutation = useMutation({
    mutationFn: (month: number) => api.post("/finance/closings", { year, month }),
    onSuccess: () => {
      toast.success("마감되었습니다 — 해당 월 기록이 잠겼습니다");
      queryClient.invalidateQueries({ queryKey: ["closings"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  const unlockMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/finance/closings/${id}`),
    onSuccess: () => {
      toast.success("마감이 해제되었습니다");
      queryClient.invalidateQueries({ queryKey: ["closings"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });
  const lockOf = (month: number) =>
    closings.find((c) => c.month === month) ?? closings.find((c) => c.month === null) ?? null;

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

      {/* 월 마감 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="h-4 w-4" /> {year}년 월 마감
            <span className="text-xs font-normal text-muted-foreground">
              — 마감된 월은 헌금 입력·취소·지급이 차단됩니다 (잠금·해제는 승인 권한)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-12">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
              const lock = lockOf(month);
              return (
                <button
                  key={month}
                  onClick={() => setLockConfirm({ month, lockId: lock?.id ?? null })}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-2.5 text-sm transition-colors ${
                    lock ? "border-primary bg-primary/10 font-medium" : "hover:bg-accent"
                  }`}
                >
                  {lock ? <Lock className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5 text-muted-foreground" />}
                  {month}월
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

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
              {o.status === "confirmed" && (() => {
                const locked = lockOf(parseInt(o.date.slice(5, 7))) !== null;
                return (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-muted-foreground disabled:opacity-30"
                    disabled={locked}
                    title={locked ? "마감된 월 — 해제 후 취소할 수 있습니다" : "취소 (사유 필요)"}
                    onClick={() => setVoidTarget(o.id)}
                  >
                    <Undo2 className="h-3.5 w-3.5" />
                  </Button>
                );
              })()}
            </div>
          ))}
        </CardContent>
      </Card>

      <ReasonDialog
        open={voidTarget !== null}
        title="헌금 기록 취소"
        description="취소 사유는 감사 기록에 남습니다. 정정이 필요하면 취소 후 다시 입력하세요."
        submitLabel="취소 처리"
        destructive
        onSubmit={(reason) => voidTarget && voidMutation.mutate({ id: voidTarget, reason })}
        onClose={() => setVoidTarget(null)}
      />
      <ConfirmDialog
        open={lockConfirm !== null}
        title={lockConfirm?.lockId ? `${lockConfirm.month}월 마감 해제` : `${lockConfirm?.month}월 마감`}
        description={
          lockConfirm?.lockId
            ? "해제하면 해당 월 기록을 다시 수정할 수 있습니다. 해제 이력은 기록에 남습니다."
            : "마감하면 해당 월의 헌금 입력·취소·지급이 잠깁니다."
        }
        confirmLabel={lockConfirm?.lockId ? "해제" : "마감"}
        destructive={!!lockConfirm?.lockId}
        onConfirm={() => {
          if (!lockConfirm) return;
          if (lockConfirm.lockId) unlockMutation.mutate(lockConfirm.lockId);
          else lockMutation.mutate(lockConfirm.month);
        }}
        onClose={() => setLockConfirm(null)}
      />
    </div>
  );
}
