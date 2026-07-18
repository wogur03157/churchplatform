import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CheckCircle2, ClipboardList, Paperclip, Plus, XCircle } from "lucide-react";
import { ReasonDialog } from "@/components/ReasonDialog";

type Department = { id: number; name: string };
type Account = { id: number; name: string; kind: string; departmentId: number | null };
type Expense = {
  id: number;
  requestNo: string;
  departmentId: number;
  accountId: number;
  amount: string;
  title: string;
  description: string | null;
  status: "pending" | "approved" | "rejected" | "paid" | "voided";
  approvals: { action: string; comment: string | null; at: string }[] | null;
  paidAt: string | null;
  paidMethod: "cash" | "transfer" | "card" | null;
  voidReason: string | null;
  attachmentCount: number;
  createdAt: string;
};
type Attachment = { id: number; fileKey: string; fileName: string };
type Summary = {
  byDepartment: { departmentId: number; departmentName: string; count: number; total: number }[];
  grandTotal: number;
};

const STATUS_META: Record<Expense["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "승인 대기", variant: "default" },
  approved: { label: "승인됨", variant: "secondary" },
  paid: { label: "지급 완료", variant: "outline" },
  rejected: { label: "반려", variant: "destructive" },
  voided: { label: "취소", variant: "destructive" },
};
const PAID_METHOD_LABELS = { cash: "현금", transfer: "이체", card: "카드" } as const;
const won = (n: number | string) => Number(n).toLocaleString("ko-KR") + "원";

function monthRange() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return {
    from: `${now.getFullYear()}-${month}-01`,
    to: `${now.getFullYear()}-${month}-${String(lastDay).padStart(2, "0")}`,
  };
}

const EMPTY_FORM = { departmentId: "", accountId: "", amount: "", title: "", description: "" };

export default function AdminFinanceExpenses() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [payTarget, setPayTarget] = useState<Expense | null>(null);
  const [payForm, setPayForm] = useState({ paidAt: new Date().toISOString().slice(0, 10), paidMethod: "transfer" as const });
  const [attachTarget, setAttachTarget] = useState<Expense | null>(null);
  const [reasonTarget, setReasonTarget] = useState<{ id: number; action: "reject" | "void" } | null>(null);

  const { from, to } = monthRange();

  const { data: departments = [] } = useQuery({
    queryKey: ["finance-departments"],
    queryFn: () => api.get<Department[]>("/finance/departments"),
  });
  const { data: accounts = [] } = useQuery({
    queryKey: ["finance-accounts", "expense"],
    queryFn: () => api.get<Account[]>("/finance/accounts?kind=expense"),
  });
  const { data: expenses = [] } = useQuery({
    queryKey: ["expenses", statusFilter],
    queryFn: () =>
      api.get<Expense[]>(`/finance/expenses${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`),
  });
  const { data: summary } = useQuery({
    queryKey: ["expense-summary", from, to],
    queryFn: () => api.get<Summary>(`/finance/expenses/summary?from=${from}&to=${to}`),
  });
  const { data: attachments = [] } = useQuery({
    queryKey: ["expense-attachments", attachTarget?.id],
    queryFn: () => api.get<Attachment[]>(`/finance/expenses/${attachTarget!.id}/attachments`),
    enabled: attachTarget !== null,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["expenses"] });
    queryClient.invalidateQueries({ queryKey: ["expense-summary"] });
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const result = await api.post<{ id: number; requestNo: string; budgetWarning: string | null }>("/finance/expenses", {
        departmentId: parseInt(form.departmentId),
        accountId: parseInt(form.accountId),
        amount: parseInt(form.amount.replace(/[^0-9]/g, "")),
        title: form.title,
        description: form.description || undefined,
      });
      // 영수증 파일이 있으면 이어서 첨부
      if (receiptFile) {
        const fileBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(receiptFile);
        });
        await api.post(`/finance/expenses/${result.id}/attachments`, {
          fileBase64,
          fileName: receiptFile.name,
          mimeType: receiptFile.type,
        });
      }
      return result;
    },
    onSuccess: (result) => {
      toast.success(`결의서 ${result.requestNo}가 기안되었습니다`);
      if (result.budgetWarning) toast.warning(result.budgetWarning, { duration: 8000 });
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      setReceiptFile(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action, body }: { id: number; action: string; body?: unknown }) =>
      api.post(`/finance/expenses/${id}/${action}`, body ?? {}),
    onSuccess: () => {
      toast.success("처리되었습니다");
      setPayTarget(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deptName = (id: number) => departments.find((d) => d.id === id)?.name ?? "?";
  const accountName = (id: number) => accounts.find((a) => a.id === id)?.name ?? "?";
  const deptAccounts = form.departmentId
    ? accounts.filter((a) => a.departmentId === null || a.departmentId === parseInt(form.departmentId))
    : accounts;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">지출결의</h1>
          <p className="text-muted-foreground">
            기안 → 승인(재정부장 권한) → 지급 순서로 처리됩니다. 지급된 기록은 수정할 수 없습니다
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 지출 기안
        </Button>
      </div>

      {/* 이번 달 지급 집계 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">이번 달 지급 총액</p>
            <p className="text-2xl font-bold">{won(summary?.grandTotal ?? 0)}</p>
          </CardContent>
        </Card>
        {(summary?.byDepartment ?? []).map((row) => (
          <Card key={row.departmentId}>
            <CardContent className="pt-5">
              <p className="text-sm text-muted-foreground">{row.departmentName} ({row.count}건)</p>
              <p className="text-xl font-semibold">{won(row.total)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {Object.entries(STATUS_META).map(([value, meta]) => (
            <SelectItem key={value} value={value}>{meta.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 목록 */}
      <div className="space-y-3">
        {expenses.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              결의서가 없습니다
            </CardContent>
          </Card>
        )}
        {expenses.map((e) => (
          <Card key={e.id}>
            <CardContent className="flex flex-wrap items-center gap-3 py-4">
              <ClipboardList className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-52 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">{e.requestNo}</span>
                  <span className="font-medium">{e.title}</span>
                  <Badge variant={STATUS_META[e.status].variant}>{STATUS_META[e.status].label}</Badge>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {deptName(e.departmentId)} · {accountName(e.accountId)} ·{" "}
                  <span className="font-semibold text-foreground">{won(e.amount)}</span>
                  {e.paidAt && ` · ${e.paidAt} ${PAID_METHOD_LABELS[e.paidMethod!]} 지급`}
                  {e.voidReason && ` · 사유: ${e.voidReason}`}
                  {e.approvals?.[0]?.comment && ` · ${e.approvals[0].comment}`}
                </p>
              </div>
              {e.attachmentCount > 0 && (
                <Button size="sm" variant="ghost" onClick={() => setAttachTarget(e)}>
                  <Paperclip className="mr-1 h-4 w-4" /> {e.attachmentCount}
                </Button>
              )}
              <div className="flex shrink-0 gap-2">
                {e.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => actionMutation.mutate({ id: e.id, action: "approve", body: {} })}
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4" /> 승인
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReasonTarget({ id: e.id, action: "reject" })}
                    >
                      <XCircle className="mr-1 h-4 w-4" /> 반려
                    </Button>
                  </>
                )}
                {e.status === "approved" && (
                  <Button size="sm" onClick={() => setPayTarget(e)}>지급 처리</Button>
                )}
                {(e.status === "pending" || e.status === "approved") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setReasonTarget({ id: e.id, action: "void" })}
                  >
                    취소
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 기안 다이얼로그 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지출 기안</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>부서</Label>
                <Select value={form.departmentId} onValueChange={(v) => setForm({ ...form, departmentId: v, accountId: "" })}>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>지출 항목</Label>
                <Select value={form.accountId} onValueChange={(v) => setForm({ ...form, accountId: v })}>
                  <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
                  <SelectContent>
                    {deptAccounts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>금액</Label>
                <Input
                  inputMode="numeric"
                  placeholder="0"
                  value={form.amount ? Number(form.amount.replace(/[^0-9]/g, "")).toLocaleString("ko-KR") : ""}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>영수증 첨부</Label>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full text-sm"
                  onChange={(e) => setReceiptFile(e.target.files?.[0] ?? null)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>제목</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="예: 여름성경학교 교재 구입"
              />
            </div>
            <div className="space-y-2">
              <Label>내용 (선택)</Label>
              <Textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
            <Button
              disabled={!form.departmentId || !form.accountId || !form.amount || !form.title || createMutation.isPending}
              onClick={() => createMutation.mutate()}
            >
              기안
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 지급 처리 다이얼로그 */}
      <Dialog open={payTarget !== null} onOpenChange={(o) => !o && setPayTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>지급 처리 — {payTarget?.requestNo} {payTarget?.title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>지급일</Label>
              <Input
                type="date"
                value={payForm.paidAt}
                onChange={(e) => setPayForm({ ...payForm, paidAt: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>지급 방법</Label>
              <Select
                value={payForm.paidMethod}
                onValueChange={(v) => setPayForm({ ...payForm, paidMethod: v as typeof payForm.paidMethod })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(PAID_METHOD_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">지급 처리 후에는 수정·취소할 수 없습니다.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayTarget(null)}>취소</Button>
            <Button
              onClick={() =>
                payTarget && actionMutation.mutate({ id: payTarget.id, action: "pay", body: payForm })
              }
            >
              지급 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ReasonDialog
        open={reasonTarget !== null}
        title={reasonTarget?.action === "reject" ? "결의서 반려" : "결의서 취소"}
        description={
          reasonTarget?.action === "reject"
            ? "반려 사유는 기안자에게 표시되고 기록에 남습니다."
            : "취소 사유는 기록에 남습니다."
        }
        submitLabel={reasonTarget?.action === "reject" ? "반려" : "취소 처리"}
        destructive
        onSubmit={(text) => {
          if (!reasonTarget) return;
          actionMutation.mutate({
            id: reasonTarget.id,
            action: reasonTarget.action,
            body: reasonTarget.action === "reject" ? { comment: text } : { reason: text },
          });
        }}
        onClose={() => setReasonTarget(null)}
      />

      {/* 첨부 보기 다이얼로그 */}
      <Dialog open={attachTarget !== null} onOpenChange={(o) => !o && setAttachTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>첨부 — {attachTarget?.requestNo}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {attachments.map((a) => (
              <a
                key={a.id}
                href={`/api/finance/expenses/attachments/${a.id}/download`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-accent"
              >
                <Paperclip className="h-4 w-4" /> {a.fileName}
              </a>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
