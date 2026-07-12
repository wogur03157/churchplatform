import { useState } from "react";
import { api } from "@/lib/api";
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
import { Archive, Landmark, Plus } from "lucide-react";

type Account = {
  id: number;
  kind: "income" | "expense";
  name: string;
  departmentId: number | null;
  isBuiltIn: number;
};
type Department = { id: number; name: string; isBuiltIn: number };
type FiscalYear = { id: number; year: number; status: "open" | "closed" };

export default function AdminFinanceSettings() {
  const queryClient = useQueryClient();
  const [newIncome, setNewIncome] = useState("");
  const [newExpense, setNewExpense] = useState("");
  const [newExpenseDept, setNewExpenseDept] = useState("");
  const [newDept, setNewDept] = useState("");

  const { data: accounts = [] } = useQuery({
    queryKey: ["finance-accounts", "all"],
    queryFn: () => api.get<Account[]>("/finance/accounts"),
  });
  const { data: departments = [] } = useQuery({
    queryKey: ["finance-departments"],
    queryFn: () => api.get<Department[]>("/finance/departments"),
  });
  const { data: fiscalYears = [] } = useQuery({
    queryKey: ["fiscal-years"],
    queryFn: () => api.get<FiscalYear[]>("/finance/fiscal-years"),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["finance-accounts"] });
    queryClient.invalidateQueries({ queryKey: ["finance-departments"] });
  };

  const addAccount = useMutation({
    mutationFn: (data: { kind: "income" | "expense"; name: string; departmentId?: number }) =>
      api.post("/finance/accounts", data),
    onSuccess: () => {
      toast.success("계정과목이 추가되었습니다");
      setNewIncome("");
      setNewExpense("");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const archiveAccount = useMutation({
    mutationFn: (id: number) => api.patch(`/finance/accounts/${id}`, { status: "archived" }),
    onSuccess: () => {
      toast.success("보관되었습니다 (기존 기록은 유지)");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const addDepartment = useMutation({
    mutationFn: (name: string) => api.post("/finance/departments", { name }),
    onSuccess: () => {
      toast.success("부서가 추가되었습니다");
      setNewDept("");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deptName = (id: number | null) =>
    id === null ? null : departments.find((d) => d.id === id)?.name ?? null;

  const income = accounts.filter((a) => a.kind === "income");
  const expense = accounts.filter((a) => a.kind === "expense");

  const renderAccount = (a: Account) => (
    <div key={a.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
      <span>
        {a.name}
        {deptName(a.departmentId) && (
          <Badge variant="outline" className="ml-2">{deptName(a.departmentId)}</Badge>
        )}
        {a.isBuiltIn === 1 && <Badge variant="secondary" className="ml-2">기본</Badge>}
      </span>
      {a.isBuiltIn === 0 && (
        <Button
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0 text-muted-foreground"
          title="보관 (삭제 대신)"
          onClick={() => archiveAccount.mutate(a.id)}
        >
          <Archive className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">재정 설정</h1>
        <p className="text-muted-foreground">
          계정과목·부서를 관리합니다. 회계연도: {fiscalYears.map((f) => `${f.year}(${f.status === "open" ? "진행" : "마감"})`).join(", ") || "-"}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* 수입 계정 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="h-4 w-4" /> 수입 (헌금 종류)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {income.map(renderAccount)}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="새 헌금 종류"
                value={newIncome}
                onChange={(e) => setNewIncome(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && newIncome.trim() && addAccount.mutate({ kind: "income", name: newIncome.trim() })
                }
              />
              <Button
                size="icon"
                variant="outline"
                disabled={!newIncome.trim()}
                onClick={() => addAccount.mutate({ kind: "income", name: newIncome.trim() })}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 지출 계정 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">지출 항목</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {expense.map(renderAccount)}
            <div className="space-y-2 pt-2">
              <Input
                placeholder="새 지출 항목"
                value={newExpense}
                onChange={(e) => setNewExpense(e.target.value)}
              />
              <div className="flex gap-2">
                <Select value={newExpenseDept || "none"} onValueChange={(v) => setNewExpenseDept(v === "none" ? "" : v)}>
                  <SelectTrigger><SelectValue placeholder="부서" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">(부서 없음)</SelectItem>
                    {departments.map((d) => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  disabled={!newExpense.trim()}
                  onClick={() =>
                    addAccount.mutate({
                      kind: "expense",
                      name: newExpense.trim(),
                      departmentId: newExpenseDept ? parseInt(newExpenseDept) : undefined,
                    })
                  }
                >
                  <Plus className="mr-1 h-4 w-4" /> 추가
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 부서 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">부서</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {departments.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>{d.name}</span>
                {d.isBuiltIn === 1 && <Badge variant="secondary">기본</Badge>}
              </div>
            ))}
            <div className="flex gap-2 pt-2">
              <Input
                placeholder="새 부서"
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && newDept.trim() && addDepartment.mutate(newDept.trim())}
              />
              <Button
                size="icon"
                variant="outline"
                disabled={!newDept.trim()}
                onClick={() => addDepartment.mutate(newDept.trim())}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
