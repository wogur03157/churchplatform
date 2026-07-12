import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
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
import { Download, Edit, Plus, Trash2, Upload, Users } from "lucide-react";

type Member = {
  id: number;
  name: string;
  gender: "m" | "f" | null;
  birthDate: string | null;
  phone: string | null;
  address: string | null;
  email: string | null;
  baptismLevel: string | null;
  positionId: number | null;
  status: string;
  registeredAt: string | null;
  memo: string | null;
};

type Position = { id: number; name: string };

type Dashboard = {
  statusCounts: Record<string, number>;
  absentees: { id: number; name: string; phone: string | null }[];
  newcomers: { stageId: number; name: string; count: number }[];
  absentWeeks: number;
};

const STATUS_LABELS: Record<string, string> = {
  active: "출석",
  absent_long: "장기결석",
  transferred: "이명",
  deceased: "별세",
  removed: "제적",
};

const BAPTISM_LABELS: Record<string, string> = {
  visitor: "방문",
  wonip: "원입",
  haksup: "학습",
  baptized: "세례",
  confirmed: "입교",
  infant: "유아세례",
};

const EMPTY_FORM = {
  name: "",
  gender: "" as "" | "m" | "f",
  birthDate: "",
  phone: "",
  address: "",
  email: "",
  baptismLevel: "",
  positionId: "",
  status: "active",
  registeredAt: "",
  memo: "",
};

export default function AdminMembers() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const closeAll = () => {
    setIsCreateOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  };

  const { createMutation, updateMutation, confirmDelete } = useCRUD({
    queryKey: "members",
    path: "members",
    entityName: "교인",
    onSuccess: closeAll,
  });

  const listParams = new URLSearchParams();
  if (query) listParams.set("query", query);
  if (statusFilter !== "all") listParams.set("status", statusFilter);
  listParams.set("page", String(page));
  listParams.set("limit", "20");

  const { data, isLoading } = useQuery({
    queryKey: ["members", query, statusFilter, page],
    queryFn: () =>
      api.get<{ items: Member[]; total: number; page: number; limit: number }>(
        `/members?${listParams.toString()}`
      ),
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["member-positions"],
    queryFn: () => api.get<Position[]>("/members/positions"),
  });

  const { data: dashboard } = useQuery({
    queryKey: ["members-dashboard"],
    queryFn: () => api.get<Dashboard>("/members/dashboard"),
  });

  const positionName = (id: number | null) =>
    positions.find((p) => p.id === id)?.name ?? "-";

  const set = (k: keyof typeof EMPTY_FORM, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const openEdit = (member: Member) => {
    setForm({
      name: member.name,
      gender: member.gender ?? "",
      birthDate: member.birthDate ?? "",
      phone: member.phone ?? "",
      address: member.address ?? "",
      email: member.email ?? "",
      baptismLevel: member.baptismLevel ?? "",
      positionId: member.positionId ? String(member.positionId) : "",
      status: member.status,
      registeredAt: member.registeredAt ?? "",
      memo: member.memo ?? "",
    });
    setEditTarget(member);
  };

  const buildPayload = () => ({
    name: form.name.trim(),
    gender: form.gender || null,
    birthDate: form.birthDate || null,
    phone: form.phone.trim() || null,
    address: form.address.trim() || null,
    email: form.email.trim() || null,
    baptismLevel: form.baptismLevel || null,
    positionId: form.positionId ? parseInt(form.positionId) : null,
    status: form.status,
    registeredAt: form.registeredAt || null,
    memo: form.memo.trim() || null,
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      toast.error("이름을 입력해주세요");
      return;
    }
    if (editTarget) updateMutation.mutate({ id: editTarget.id, ...buildPayload() });
    else createMutation.mutate(buildPayload());
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = (ev.target?.result as string).split(",")[1];
      try {
        const result = await api.post<{
          created: number;
          duplicated: number;
          errors: { row: number; message: string }[];
        }>("/members/import", { fileBase64: base64 });
        toast.success(
          `등록 ${result.created}명 · 중복 ${result.duplicated}건 · 오류 ${result.errors.length}건`
        );
        if (result.errors.length > 0) {
          toast.warning(
            result.errors
              .slice(0, 3)
              .map((er) => `${er.row}행: ${er.message}`)
              .join(" / ")
          );
        }
        window.location.reload();
      } catch (err: any) {
        toast.error(`임포트 실패: ${err.message}`);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / 20));

  const formDialog = (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editTarget ? "교인 정보 수정" : "새 교인 등록"}</DialogTitle>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <Label>이름 *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label>성별</Label>
          <Select value={form.gender} onValueChange={(v) => set("gender", v)}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="m">남</SelectItem>
              <SelectItem value="f">여</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>생년월일</Label>
          <Input type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
        </div>
        <div>
          <Label>연락처</Label>
          <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="010-0000-0000" />
        </div>
        <div>
          <Label>이메일</Label>
          <Input value={form.email} onChange={(e) => set("email", e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label>주소</Label>
          <Input value={form.address} onChange={(e) => set("address", e.target.value)} />
        </div>
        <div>
          <Label>직분</Label>
          <Select value={form.positionId} onValueChange={(v) => set("positionId", v)}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {positions.map((p) => (
                <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>신급</Label>
          <Select value={form.baptismLevel} onValueChange={(v) => set("baptismLevel", v)}>
            <SelectTrigger><SelectValue placeholder="선택" /></SelectTrigger>
            <SelectContent>
              {Object.entries(BAPTISM_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>상태</Label>
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>등록일</Label>
          <Input type="date" value={form.registeredAt} onChange={(e) => set("registeredAt", e.target.value)} />
        </div>
        <div className="col-span-2">
          <Label>메모</Label>
          <Textarea value={form.memo} onChange={(e) => set("memo", e.target.value)} rows={2} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={closeAll}>취소</Button>
        <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
          {editTarget ? "수정" : "등록"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-6 w-6" />
          <h1 className="text-2xl font-bold">교인 관리</h1>
          <Badge variant="secondary">{total}명</Badge>
        </div>
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImport} />
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1" /> 엑셀 임포트
          </Button>
          <Button variant="outline" onClick={() => window.open("/api/members/export", "_blank")}>
            <Download className="h-4 w-4 mr-1" /> 엑셀 다운로드
          </Button>
          <Button onClick={() => { setForm(EMPTY_FORM); setIsCreateOpen(true); }}>
            <Plus className="h-4 w-4 mr-1" /> 교인 등록
          </Button>
        </div>
      </div>

      {/* 요약 카드 */}
      {dashboard && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card><CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">출석 교인</div>
            <div className="text-2xl font-bold">{dashboard.statusCounts.active ?? 0}명</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">장기결석 감지 ({dashboard.absentWeeks}주)</div>
            <div className="text-2xl font-bold text-orange-600">{dashboard.absentees.length}명</div>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">새가족 진행 중</div>
            <div className="text-2xl font-bold">
              {dashboard.newcomers.reduce((sum, s) => sum + s.count, 0)}명
            </div>
          </CardContent></Card>
          <Card><CardContent className="pt-4">
            <div className="text-sm text-muted-foreground">전체 재적</div>
            <div className="text-2xl font-bold">
              {Object.values(dashboard.statusCounts).reduce((a, b) => a + b, 0)}명
            </div>
          </CardContent></Card>
        </div>
      )}

      {/* 검색/필터 */}
      <div className="flex gap-2">
        <form
          className="flex gap-2 flex-1"
          onSubmit={(e) => { e.preventDefault(); setPage(1); setQuery(searchInput); }}
        >
          <Input
            placeholder="이름 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" variant="secondary">검색</Button>
        </form>
        <Select value={statusFilter} onValueChange={(v) => { setPage(1); setStatusFilter(v); }}>
          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* 목록 */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="p-3">이름</th>
                <th className="p-3 hidden md:table-cell">연락처</th>
                <th className="p-3 hidden lg:table-cell">직분</th>
                <th className="p-3 hidden lg:table-cell">신급</th>
                <th className="p-3">상태</th>
                <th className="p-3 hidden md:table-cell">등록일</th>
                <th className="p-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">불러오는 중…</td></tr>
              ) : (data?.items.length ?? 0) === 0 ? (
                <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">
                  교인이 없습니다. 엑셀 임포트로 기존 명단을 옮겨보세요.
                </td></tr>
              ) : (
                data!.items.map((member) => (
                  <tr key={member.id} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 font-medium">
                      {member.name}
                      {member.gender && (
                        <span className="ml-1 text-xs text-muted-foreground">
                          ({member.gender === "m" ? "남" : "여"})
                        </span>
                      )}
                    </td>
                    <td className="p-3 hidden md:table-cell">{member.phone ?? "-"}</td>
                    <td className="p-3 hidden lg:table-cell">{positionName(member.positionId)}</td>
                    <td className="p-3 hidden lg:table-cell">
                      {member.baptismLevel ? BAPTISM_LABELS[member.baptismLevel] : "-"}
                    </td>
                    <td className="p-3">
                      <Badge variant={member.status === "active" ? "default" : "secondary"}>
                        {STATUS_LABELS[member.status] ?? member.status}
                      </Badge>
                    </td>
                    <td className="p-3 hidden md:table-cell">{member.registeredAt ?? "-"}</td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(member)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(member.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            이전
          </Button>
          <span className="flex items-center text-sm text-muted-foreground">
            {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            다음
          </Button>
        </div>
      )}

      <Dialog open={isCreateOpen || editTarget !== null} onOpenChange={(open) => !open && closeAll()}>
        {formDialog}
      </Dialog>
    </div>
  );
}
