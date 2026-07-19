import { useMemo, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Banknote, CheckCircle2, HandCoins, Plus, Printer, Trash2, Undo2 } from "lucide-react";
import { ConfirmDialog, ReasonDialog } from "@/components/ReasonDialog";
import { memberMeta } from "@/lib/memberLabel";
import { escapeHtml, OFFERING_METHOD_LABELS as METHOD_LABELS, today, won } from "@/lib/format";

type Account = { id: number; name: string; kind: "income" | "expense" };
type Batch = {
  id: number;
  date: string;
  serviceType: string;
  counters: string[] | null;
  totalAmount: string;
  status: "counting" | "confirmed";
};
type Offering = {
  id: number;
  accountId: number;
  memberId: number | null;
  donorName: string | null;
  amount: string;
  method: "cash" | "check" | "transfer";
  envelopeNo: string | null;
  status: "confirmed" | "voided";
};
type Sheet = {
  batch: Batch;
  byAccount: { accountName: string; count: number; total: number }[];
  byMethod: { method: string; total: number }[];
  grandTotal: number;
};
type MemberOption = {
  id: number;
  name: string;
  code?: string | null;
  birthDate?: string | null;
  phone?: string | null;
};


export default function AdminFinanceOfferings() {
  const queryClient = useQueryClient();
  const amountRef = useRef<HTMLInputElement>(null);

  // 세션
  const [activeBatch, setActiveBatch] = useState<Batch | null>(null);
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [startForm, setStartForm] = useState({ date: today(), serviceType: "주일예배", counters: "" });
  const [sheetTarget, setSheetTarget] = useState<number | null>(null);
  const [voidTarget, setVoidTarget] = useState<number | null>(null);
  const [discardTarget, setDiscardTarget] = useState<Batch | null>(null);

  // 계수 입력 폼
  const [accountId, setAccountId] = useState<number | null>(null);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<Offering["method"]>("cash");
  const [envelopeNo, setEnvelopeNo] = useState("1");
  const [donorQuery, setDonorQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);

  const { data: accounts = [] } = useQuery({
    queryKey: ["finance-accounts", "income"],
    queryFn: () => api.get<Account[]>("/finance/accounts?kind=income"),
  });

  const { data: batches = [] } = useQuery({
    queryKey: ["offering-batches"],
    queryFn: () => api.get<Batch[]>("/finance/offering-batches"),
  });

  const { data: entries = [] } = useQuery({
    queryKey: ["offerings", activeBatch?.id],
    queryFn: () => api.get<Offering[]>(`/finance/offerings?batchId=${activeBatch!.id}&includeVoided=true`),
    enabled: activeBatch !== null,
  });

  // 교인 자동완성 — 재적 권한이 없어도 계수는 가능해야 하므로 실패는 조용히 무시
  const { data: memberMatches } = useQuery({
    queryKey: ["members", "donor-search", donorQuery],
    queryFn: async () => {
      try {
        return await api.get<{ items: MemberOption[] }>(
          `/members?limit=6&query=${encodeURIComponent(donorQuery)}`
        );
      } catch {
        // 재적 미구독/권한 없음 — 이름 직접 기록으로 동작 (안내만)
        return { items: [] as MemberOption[], unavailable: true } as never;
      }
    },
    enabled: donorQuery.length >= 1 && !selectedMember,
  });

  const { data: sheet } = useQuery({
    queryKey: ["offering-sheet", sheetTarget],
    queryFn: () => api.get<Sheet>(`/finance/offering-batches/${sheetTarget}/sheet`),
    enabled: sheetTarget !== null,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["offerings"] });
    queryClient.invalidateQueries({ queryKey: ["offering-batches"] });
  };

  const startMutation = useMutation({
    mutationFn: () =>
      api.post<{ id: number }>("/finance/offering-batches", {
        date: startForm.date,
        serviceType: startForm.serviceType,
        counters: startForm.counters
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: (result) => {
      toast.success("계수를 시작합니다");
      setIsStartOpen(false);
      setActiveBatch({
        id: result.id,
        date: startForm.date,
        serviceType: startForm.serviceType,
        counters: null,
        totalAmount: "0",
        status: "counting",
      });
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const entryMutation = useMutation({
    mutationFn: () =>
      api.post("/finance/offerings", {
        date: activeBatch!.date,
        serviceType: activeBatch!.serviceType,
        batchId: activeBatch!.id,
        accountId,
        amount: parseInt(amount.replace(/[^0-9]/g, "")),
        memberId: selectedMember?.id ?? null,
        donorName: selectedMember ? null : donorQuery.trim() || null,
        method,
        envelopeNo: envelopeNo || null,
      }),
    onSuccess: () => {
      // 다음 봉투로: 금액·헌금자만 리셋, 종류·방법은 유지 (연속 계수 관행)
      setAmount("");
      setDonorQuery("");
      setSelectedMember(null);
      setEnvelopeNo((n) => String((parseInt(n) || 0) + 1));
      invalidate();
      amountRef.current?.focus();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const voidMutation = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      api.post(`/finance/offerings/${id}/void`, { reason }),
    onSuccess: () => {
      toast.success("취소되었습니다 (기록은 보존됨)");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const discardMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/finance/offering-batches/${id}`),
    onSuccess: () => {
      toast.success("계수 세션이 폐기되었습니다");
      setActiveBatch(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const confirmMutation = useMutation({
    mutationFn: (id: number) => api.post(`/finance/offering-batches/${id}/confirm`),
    onSuccess: () => {
      toast.success("계수가 확정되었습니다");
      setActiveBatch(null);
      setSheetTarget(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submitEntry = () => {
    if (!accountId) return toast.error("헌금 종류를 선택해주세요");
    const parsed = parseInt(amount.replace(/[^0-9]/g, ""));
    if (!parsed || parsed <= 0) return toast.error("금액을 입력해주세요");
    entryMutation.mutate();
  };

  const confirmedEntries = entries.filter((e) => e.status === "confirmed");
  const runningTotal = useMemo(
    () => confirmedEntries.reduce((sum, e) => sum + Number(e.amount), 0),
    [confirmedEntries]
  );
  const accountName = (id: number) => accounts.find((a) => a.id === id)?.name ?? "?";

  // ── 계수 모드 ────────────────────────────────────────────────
  if (activeBatch) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">
              헌금 계수 — {activeBatch.date} {activeBatch.serviceType}
            </h1>
            <p className="text-muted-foreground">봉투 순서대로 입력하고 Enter를 누르세요</p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
            <span className="mr-auto text-lg font-bold sm:mr-0">{won(runningTotal)}</span>
            <Button variant="outline" size="sm" onClick={() => setActiveBatch(null)}>나가기</Button>
            <Button size="sm" onClick={() => setSheetTarget(activeBatch.id)}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> 계수 완료
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-5">
          {/* 입력 폼 */}
          <Card className="lg:col-span-3">
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label>헌금 종류</Label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {accounts.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => setAccountId(a.id)}
                      className={`rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                        accountId === a.id
                          ? "border-primary bg-primary text-primary-foreground"
                          : "hover:bg-accent"
                      }`}
                    >
                      {a.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>금액</Label>
                  <Input
                    ref={amountRef}
                    inputMode="numeric"
                    className="h-12 text-xl font-bold"
                    placeholder="0"
                    value={amount ? Number(amount.replace(/[^0-9]/g, "")).toLocaleString("ko-KR") : ""}
                    onChange={(e) => setAmount(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && submitEntry()}
                  />
                </div>
                <div className="space-y-2">
                  <Label>봉투번호</Label>
                  <Input
                    className="h-12"
                    value={envelopeNo}
                    onChange={(e) => setEnvelopeNo(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>헌금자 (비우면 무기명)</Label>
                {selectedMember ? (
                  <div className="flex items-center gap-2">
                    <Badge className="px-3 py-1.5 text-sm">
                      교적: {selectedMember.name}
                      {memberMeta(selectedMember) && (
                        <span className="ml-1.5 font-normal opacity-80">{memberMeta(selectedMember)}</span>
                      )}
                    </Badge>
                    <Button size="sm" variant="ghost" onClick={() => setSelectedMember(null)}>
                      변경
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      placeholder="이름 입력 → 교적 연결 또는 그대로 기록"
                      value={donorQuery}
                      onChange={(e) => setDonorQuery(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && submitEntry()}
                    />
                    {donorQuery && (memberMatches?.items.length ?? 0) > 0 && (
                      <div className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-md">
                        {memberMatches!.items.map((m) => (
                          <button
                            key={m.id}
                            className="flex w-full items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-accent"
                            onClick={() => {
                              setSelectedMember(m);
                              setDonorQuery(m.name);
                            }}
                          >
                            <span>
                              {m.name}
                              {memberMeta(m) && (
                                <span className="ml-1.5 text-xs text-muted-foreground">{memberMeta(m)}</span>
                              )}
                            </span>
                            <Badge variant="outline">교적 연결</Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex gap-1">
                  {(Object.keys(METHOD_LABELS) as Offering["method"][]).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`rounded-md border px-3 py-1.5 text-sm ${
                        method === m ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"
                      }`}
                    >
                      {METHOD_LABELS[m]}
                    </button>
                  ))}
                </div>
                <Button size="lg" onClick={submitEntry} disabled={entryMutation.isPending}>
                  <Banknote className="mr-2 h-4 w-4" /> 입력 (Enter)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 입력 내역 */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">
                입력 내역 ({confirmedEntries.length}건)
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[28rem] space-y-1 overflow-y-auto">
              {entries.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">아직 입력이 없습니다</p>
              )}
              {[...entries].reverse().map((e) => (
                <div
                  key={e.id}
                  className={`flex items-center justify-between rounded-md border px-3 py-2 text-sm ${
                    e.status === "voided" ? "opacity-50" : ""
                  }`}
                >
                  <div>
                    <span className="mr-2 text-xs text-muted-foreground">#{e.envelopeNo ?? "-"}</span>
                    <Badge variant="outline" className="mr-2">{accountName(e.accountId)}</Badge>
                    <span className={e.status === "voided" ? "line-through" : "font-medium"}>
                      {won(e.amount)}
                    </span>
                    <span className="ml-2 text-xs text-muted-foreground">
                      {e.memberId ? "교적" : e.donorName || "무기명"} · {METHOD_LABELS[e.method]}
                    </span>
                  </div>
                  {e.status === "confirmed" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground"
                      title="취소 (사유 필요)"
                      onClick={() => setVoidTarget(e.id)}
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <ReasonDialog
          open={voidTarget !== null}
          title="헌금 기록 취소"
          description="취소 사유는 감사 기록에 남습니다. 정정이 필요하면 취소 후 다시 입력하세요."
          submitLabel="취소 처리"
          destructive
          onSubmit={(reason) => voidTarget && voidMutation.mutate({ id: voidTarget, reason })}
          onClose={() => setVoidTarget(null)}
        />
        <SheetDialog
          sheet={sheet}
          open={sheetTarget !== null}
          onClose={() => setSheetTarget(null)}
          onConfirm={
            activeBatch.status === "counting"
              ? () => confirmMutation.mutate(activeBatch.id)
              : undefined
          }
        />
      </div>
    );
  }

  // ── 세션 목록 ────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">헌금 계수</h1>
          <p className="text-muted-foreground">
            예배 후 계수 세션을 시작하고 봉투를 연속 입력하세요. 확정 후에는 취소+재입력만 가능합니다
          </p>
        </div>
        <Button onClick={() => setIsStartOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 계수 시작
        </Button>
      </div>

      <div className="space-y-3">
        {batches.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              계수 기록이 없습니다. 첫 계수를 시작해보세요.
            </CardContent>
          </Card>
        )}
        {batches.map((b) => (
          <Card key={b.id}>
            <CardContent className="flex flex-wrap items-center gap-3 py-4">
              <HandCoins className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium"><span className="whitespace-nowrap">{b.date}</span> {b.serviceType}</span>
                  <Badge variant={b.status === "confirmed" ? "outline" : "default"}>
                    {b.status === "confirmed" ? "확정됨" : "계수 중"}
                  </Badge>
                </div>
                {b.counters && b.counters.length > 0 && (
                  <p className="mt-0.5 text-xs text-muted-foreground">계수자: {b.counters.join(", ")}</p>
                )}
              </div>
              {b.status === "confirmed" && (
                <span className="font-bold">{won(b.totalAmount)}</span>
              )}
              <div className="flex gap-2">
                {b.status === "counting" ? (
                  <>
                    <Button size="sm" onClick={() => setActiveBatch(b)}>이어서 입력</Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      title="세션 폐기 (입력 내역 포함 삭제)"
                      onClick={() => setDiscardTarget(b)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setSheetTarget(b.id)}>
                    계수표
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 계수 시작 다이얼로그 */}
      <Dialog open={isStartOpen} onOpenChange={setIsStartOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>계수 시작</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>날짜</Label>
                <Input
                  type="date"
                  value={startForm.date}
                  onChange={(e) => setStartForm({ ...startForm, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>예배</Label>
                <Input
                  value={startForm.serviceType}
                  onChange={(e) => setStartForm({ ...startForm, serviceType: e.target.value })}
                  placeholder="주일예배"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>계수자 (쉼표로 구분, 2인 이상 권장)</Label>
              <Input
                value={startForm.counters}
                onChange={(e) => setStartForm({ ...startForm, counters: e.target.value })}
                placeholder="김집사, 박권사"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStartOpen(false)}>취소</Button>
            <Button onClick={() => startMutation.mutate()} disabled={startMutation.isPending}>
              시작
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SheetDialog sheet={sheet} open={sheetTarget !== null} onClose={() => setSheetTarget(null)} />
      <ConfirmDialog
        open={discardTarget !== null}
        title="계수 세션 폐기"
        description={
          discardTarget
            ? `${discardTarget.date} ${discardTarget.serviceType} 세션과 입력된 내역이 모두 삭제됩니다. 되돌릴 수 없습니다.`
            : undefined
        }
        confirmLabel="폐기"
        destructive
        onConfirm={() => discardTarget && discardMutation.mutate(discardTarget.id)}
        onClose={() => setDiscardTarget(null)}
      />
    </div>
  );
}

const escHtml = escapeHtml;

/** 계수표 인쇄 — 계수자 서명란 포함 (실물 보관용) */
function printSheet(sheet: Sheet) {
  const rows = sheet.byAccount
    .map(
      (r) =>
        `<tr><td style="border:1px solid #999;padding:6px 10px;">${escHtml(r.accountName)}</td><td style="border:1px solid #999;padding:6px 10px;text-align:right;">${r.count}건</td><td style="border:1px solid #999;padding:6px 10px;text-align:right;">${r.total.toLocaleString("ko-KR")}원</td></tr>`
    )
    .join("");
  const methods = sheet.byMethod
    .map((m) => `${METHOD_LABELS[m.method as keyof typeof METHOD_LABELS] ?? m.method} ${m.total.toLocaleString("ko-KR")}원`)
    .join(" · ");
  const counters = (sheet.batch.counters ?? [])
    .map((name) => `<span style="display:inline-block;min-width:160px;margin-right:24px;">${escHtml(name)}: ______________ (서명)</span>`)
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>계수표 ${sheet.batch.date}</title></head>
<body style="font-family:'Malgun Gothic',sans-serif;max-width:640px;margin:40px auto;color:#111;">
  <h1 style="text-align:center;letter-spacing:6px;">헌금 계수표</h1>
  <p style="text-align:center;">${sheet.batch.date} ${escHtml(sheet.batch.serviceType)}</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><th style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">헌금 종류</th><th style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">건수</th><th style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">금액</th></tr>
    ${rows}
    <tr><td style="border:1px solid #999;padding:8px 10px;font-weight:bold;">합계</td><td style="border:1px solid #999;"></td><td style="border:1px solid #999;padding:8px 10px;text-align:right;font-weight:bold;">${sheet.grandTotal.toLocaleString("ko-KR")}원</td></tr>
  </table>
  <p>지급 방법별: ${methods || "-"}</p>
  <p style="margin-top:40px;">계수자 확인</p>
  <p style="margin-top:16px;">${counters || "______________ (서명) &nbsp;&nbsp; ______________ (서명)"}</p>
  <script>window.onload = () => window.print();</script>
</body></html>`;
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

/** 계수표 다이얼로그 — 확정 전이면 확정 버튼 포함 */
function SheetDialog({
  sheet,
  open,
  onClose,
  onConfirm,
}: {
  sheet: Sheet | undefined;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            계수표 {sheet && `— ${sheet.batch.date} ${sheet.batch.serviceType}`}
          </DialogTitle>
        </DialogHeader>
        {sheet && (
          <div className="space-y-4 text-sm">
            <table className="w-full">
              <tbody>
                {sheet.byAccount.map((row) => (
                  <tr key={row.accountName} className="border-b">
                    <td className="py-1.5">{row.accountName}</td>
                    <td className="py-1.5 text-right text-muted-foreground">{row.count}건</td>
                    <td className="py-1.5 text-right font-medium">{won(row.total)}</td>
                  </tr>
                ))}
                <tr>
                  <td className="py-2 font-bold">합계</td>
                  <td />
                  <td className="py-2 text-right text-lg font-bold">{won(sheet.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
            <div className="flex gap-2">
              {sheet.byMethod.map((m) => (
                <Badge key={m.method} variant="secondary">
                  {METHOD_LABELS[m.method as keyof typeof METHOD_LABELS] ?? m.method}: {won(m.total)}
                </Badge>
              ))}
            </div>
            {sheet.batch.counters && sheet.batch.counters.length > 0 && (
              <p className="text-xs text-muted-foreground">계수자: {sheet.batch.counters.join(", ")}</p>
            )}
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>닫기</Button>
          {sheet && (
            <Button variant="outline" onClick={() => printSheet(sheet)}>
              <Printer className="mr-2 h-4 w-4" /> 인쇄
            </Button>
          )}
          {onConfirm && (
            <Button onClick={onConfirm}>
              <CheckCircle2 className="mr-2 h-4 w-4" /> 이 금액으로 확정
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
