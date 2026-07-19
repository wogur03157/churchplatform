import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Download, FileCheck2, Printer, ScrollText } from "lucide-react";
import { ConfirmDialog } from "@/components/ReasonDialog";
import { memberMeta } from "@/lib/memberLabel";

type AggregateRow = {
  memberId: number;
  count: number;
  total: number;
  receiptId: number | null;
  receiptNo: string | null;
  hasRrn: boolean;
};
type Receipt = {
  id: number;
  receiptNo: string;
  memberId: number;
  donorName: string;
  year: number;
  totalAmount: string;
  breakdown: { name: string; total: number }[] | null;
  hasRrn: boolean;
  issuedAt: string;
  canceledAt: string | null;
};
type ReceiptDetail = Receipt & {
  donorRrnMasked: string | null;
  orgName: string | null;
  orgTaxId: string | null;
};
type MemberOption = {
  id: number;
  name: string;
  code?: string | null;
  birthDate?: string | null;
  phone?: string | null;
};

const won = (n: number | string) => Number(n).toLocaleString("ko-KR") + "원";

/** raw HTML 삽입 전 이스케이프 — 교인 이름·단체명에 섞인 태그가 실행되는 것 방지 */
function esc(value: string | null | undefined): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 영수증 인쇄 — 새 창에 소득세법 서식 기반 간이 양식 렌더 */
function printReceipt(detail: ReceiptDetail) {
  const rows = (detail.breakdown ?? [])
    .map(
      (b) =>
        `<tr><td style="border:1px solid #999;padding:6px 10px;">${esc(b.name)}</td><td style="border:1px solid #999;padding:6px 10px;text-align:right;">${b.total.toLocaleString("ko-KR")}원</td></tr>`
    )
    .join("");
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>기부금영수증 ${esc(detail.receiptNo)}</title></head>
<body style="font-family:'Malgun Gothic',sans-serif;max-width:640px;margin:40px auto;color:#111;">
  <h1 style="text-align:center;letter-spacing:8px;">기부금영수증</h1>
  <p style="text-align:right;">일련번호: ${esc(detail.receiptNo)}</p>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><td style="border:1px solid #999;padding:6px 10px;width:30%;background:#f5f5f5;">기부자 성명</td><td style="border:1px solid #999;padding:6px 10px;">${esc(detail.donorName)}</td></tr>
    <tr><td style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">주민등록번호</td><td style="border:1px solid #999;padding:6px 10px;">${esc(detail.donorRrnMasked ?? "(미기재)")}</td></tr>
    <tr><td style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">귀속 연도</td><td style="border:1px solid #999;padding:6px 10px;">${detail.year}년 1월 1일 ~ ${detail.year}년 12월 31일</td></tr>
    <tr><td style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">기부 유형</td><td style="border:1px solid #999;padding:6px 10px;">종교단체 지정기부금 (코드 41)</td></tr>
  </table>
  <table style="width:100%;border-collapse:collapse;margin:16px 0;">
    <tr><th style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">내역</th><th style="border:1px solid #999;padding:6px 10px;background:#f5f5f5;">금액</th></tr>
    ${rows}
    <tr><td style="border:1px solid #999;padding:8px 10px;font-weight:bold;">합계</td><td style="border:1px solid #999;padding:8px 10px;text-align:right;font-weight:bold;">${Number(detail.totalAmount).toLocaleString("ko-KR")}원</td></tr>
  </table>
  <p>위와 같이 기부금을 수령하였음을 증명합니다.</p>
  <p style="text-align:center;margin-top:32px;">${new Date(detail.issuedAt).getFullYear()}년 ${new Date(detail.issuedAt).getMonth() + 1}월 ${new Date(detail.issuedAt).getDate()}일</p>
  <div style="text-align:center;margin-top:24px;">
    <p style="font-size:18px;font-weight:bold;">${esc(detail.orgName ?? "(단체명 미설정)")} <span style="border:1px solid #999;padding:4px 10px;margin-left:8px;font-size:13px;">직인</span></p>
    <p>고유번호: ${esc(detail.orgTaxId ?? "(미설정)")}</p>
  </div>
  <script>window.onload = () => window.print();</script>
</body></html>`;
  const w = window.open("", "_blank", "width=720,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}

export default function AdminFinanceReceipts() {
  const queryClient = useQueryClient();
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(String(currentYear));
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [rrnDrafts, setRrnDrafts] = useState<Map<number, string>>(new Map());
  const [org, setOrg] = useState<{ orgName: string; orgTaxId: string } | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Receipt | null>(null);

  const { data: aggregate = [] } = useQuery({
    queryKey: ["receipt-aggregate", year],
    queryFn: () => api.get<AggregateRow[]>(`/finance/receipts/aggregate?year=${year}`),
  });
  const { data: receipts = [] } = useQuery({
    queryKey: ["receipts", year],
    queryFn: () => api.get<Receipt[]>(`/finance/receipts?year=${year}`),
  });
  const { data: orgInfo } = useQuery({
    queryKey: ["receipt-org-info"],
    queryFn: () => api.get<{ orgName: string | null; orgTaxId: string | null }>("/finance/receipts/org-info"),
  });
  // 교인 이름 매핑 (재적 API)
  const { data: roster } = useQuery({
    queryKey: ["members", "receipt-roster"],
    queryFn: async () => {
      try {
        return await api.get<{ items: MemberOption[] }>("/members?limit=1000");
      } catch {
        return { items: [] as MemberOption[] };
      }
    },
  });
  // 이름을 못 찾으면 null — 잘못된 이름("교인 #3")이 영수증 성명 스냅샷으로 저장되는 것을 방지
  const memberOf = (id: number) => roster?.items.find((m) => m.id === id);
  const resolvedName = (id: number): string | null => memberOf(id)?.name ?? null;
  const memberName = (id: number) => resolvedName(id) ?? `교인 #${id}`;

  const orgDraft = org ?? {
    orgName: orgInfo?.orgName ?? "",
    orgTaxId: orgInfo?.orgTaxId ?? "",
  };

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["receipt-aggregate"] });
    queryClient.invalidateQueries({ queryKey: ["receipts"] });
  };

  const orgMutation = useMutation({
    mutationFn: () => api.put("/finance/receipts/org-info", orgDraft),
    onSuccess: () => {
      toast.success("단체 정보가 저장되었습니다");
      queryClient.invalidateQueries({ queryKey: ["receipt-org-info"] });
      setOrg(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const issueMutation = useMutation({
    mutationFn: () =>
      api.post<{ issued: number; skipped: { memberId: number; reason: string }[] }>(
        "/finance/receipts/issue",
        {
          year: parseInt(year),
          items: Array.from(selected)
            .filter((memberId) => resolvedName(memberId) !== null)
            .map((memberId) => ({
              memberId,
              donorName: resolvedName(memberId)!,
              rrn: rrnDrafts.get(memberId) || null,
            })),
        }
      ),
    onSuccess: (result) => {
      toast.success(`${result.issued}건 발급되었습니다`);
      result.skipped.forEach((s) =>
        toast.warning(`${memberName(s.memberId)}: ${s.reason}`, { duration: 6000 })
      );
      setSelected(new Set());
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const cancelMutation = useMutation({
    mutationFn: (id: number) => api.post(`/finance/receipts/${id}/cancel`),
    onSuccess: () => {
      toast.success("영수증이 취소되었습니다 (대장에는 보존)");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const openPrint = async (id: number) => {
    try {
      const detail = await api.get<ReceiptDetail>(`/finance/receipts/${id}`);
      printReceipt(detail);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "영수증을 불러오지 못했습니다");
    }
  };

  const unissued = useMemo(() => aggregate.filter((r) => !r.receiptId), [aggregate]);
  const activeReceipts = receipts.filter((r) => !r.canceledAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">기부금영수증</h1>
          <p className="text-muted-foreground">
            교적 연결 헌금의 연간 집계로 발급합니다. 주민번호는 암호화 저장되며 발급 외 용도로 쓰이지 않습니다
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[currentYear, currentYear - 1].map((y) => (
                <SelectItem key={y} value={String(y)}>{y}년 귀속</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => window.open(`/api/finance/receipts/nts-file?year=${year}`, "_blank")}
          >
            <Download className="mr-2 h-4 w-4" /> 국세청 제출 파일
          </Button>
        </div>
      </div>

      {/* 단체 정보 */}
      <Card>
        <CardContent className="flex flex-wrap items-end gap-3 pt-6">
          <div className="space-y-1">
            <Label className="text-xs">단체명 (영수증 발급인)</Label>
            <Input
              className="w-52"
              value={orgDraft.orgName}
              onChange={(e) => setOrg({ ...orgDraft, orgName: e.target.value })}
              placeholder="OO교회"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">고유번호 (세무서 발급)</Label>
            <Input
              className="w-44"
              value={orgDraft.orgTaxId}
              onChange={(e) => setOrg({ ...orgDraft, orgTaxId: e.target.value })}
              placeholder="000-82-00000"
            />
          </div>
          <Button variant="outline" disabled={!org} onClick={() => orgMutation.mutate()}>
            저장
          </Button>
        </CardContent>
      </Card>

      {/* 발급 대상 (미발급) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileCheck2 className="h-4 w-4" /> 발급 대상 ({unissued.length}명)
          </CardTitle>
          <Button
            disabled={selected.size === 0 || issueMutation.isPending}
            onClick={() => issueMutation.mutate()}
          >
            {selected.size}명 일괄 발급
          </Button>
        </CardHeader>
        <CardContent className="space-y-1">
          {unissued.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              발급 대상이 없습니다 (모두 발급됐거나 교적 연결 헌금이 없음)
            </p>
          )}
          {unissued.map((row) => (
            <div key={row.memberId} className="flex flex-wrap items-center gap-3 rounded-md border px-3 py-2">
              <label className="flex flex-1 cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(row.memberId)}
                  disabled={resolvedName(row.memberId) === null}
                  onChange={(e) => {
                    const next = new Set(selected);
                    e.target.checked ? next.add(row.memberId) : next.delete(row.memberId);
                    setSelected(next);
                  }}
                />
                <span className="font-medium">
                  {resolvedName(row.memberId) ?? `교인 #${row.memberId} (이름 확인 필요)`}
                  {memberOf(row.memberId) && memberMeta(memberOf(row.memberId)!) && (
                    <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                      {memberMeta(memberOf(row.memberId)!)}
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground">{row.count}건</span>
                <span className="font-semibold">{won(row.total)}</span>
              </label>
              <Input
                className="w-48"
                placeholder="주민번호 (선택, 000000-0000000)"
                value={rrnDrafts.get(row.memberId) ?? ""}
                onChange={(e) => {
                  const next = new Map(rrnDrafts);
                  next.set(row.memberId, e.target.value);
                  setRrnDrafts(next);
                }}
              />
            </div>
          ))}
          {unissued.length > 0 && (
            <p className="pt-2 text-xs text-muted-foreground">
              주민번호 없이도 발급할 수 있지만, 국세청 제출 파일에는 주민번호가 있는 영수증만 포함됩니다.
            </p>
          )}
        </CardContent>
      </Card>

      {/* 발급 대장 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ScrollText className="h-4 w-4" /> 발급 대장 ({activeReceipts.length}건 · 5년 보관)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          {receipts.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">발급 이력이 없습니다</p>
          )}
          {receipts.map((r) => (
            <div
              key={r.id}
              className={`flex flex-wrap items-center gap-3 rounded-md border px-3 py-2 text-sm ${
                r.canceledAt ? "opacity-50" : ""
              }`}
            >
              <span className="w-24 text-xs text-muted-foreground">{r.receiptNo}</span>
              <span className={`w-20 font-medium ${r.canceledAt ? "line-through" : ""}`}>
                {r.donorName}
              </span>
              <span className="font-semibold">{won(r.totalAmount)}</span>
              {r.hasRrn ? (
                <Badge variant="secondary">주민번호 등록</Badge>
              ) : (
                <Badge variant="outline">주민번호 없음</Badge>
              )}
              {r.canceledAt && <Badge variant="destructive">취소됨</Badge>}
              <div className="ml-auto flex gap-1">
                {!r.canceledAt && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => openPrint(r.id)}>
                      <Printer className="mr-1 h-3.5 w-3.5" /> 인쇄
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground"
                      onClick={() => setCancelTarget(r)}
                    >
                      취소
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <ConfirmDialog
        open={cancelTarget !== null}
        title="영수증 취소"
        description={
          cancelTarget
            ? `${cancelTarget.receiptNo} (${cancelTarget.donorName})를 취소합니다. 대장에는 취소 기록이 남고, 재발급할 수 있습니다.`
            : undefined
        }
        confirmLabel="취소"
        destructive
        onConfirm={() => cancelTarget && cancelMutation.mutate(cancelTarget.id)}
        onClose={() => setCancelTarget(null)}
      />
    </div>
  );
}
