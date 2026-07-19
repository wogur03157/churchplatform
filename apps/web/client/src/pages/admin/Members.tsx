import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { Camera, Download, Edit, Link2, Plus, Trash2, Unlink, Upload, Users, X } from "lucide-react";
import { duplicateNames, memberMeta } from "@/lib/memberLabel";

type Member = {
  id: number;
  code: string | null;
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
  photoUrl: string | null;
  familyId: number | null;
  familyRole: string | null;
};

type FamilyDetail = {
  id: number;
  label: string | null;
  headMemberId: number | null;
  members: Member[];
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

const FAMILY_ROLE_LABELS: Record<string, string> = {
  head: "가장",
  spouse: "배우자",
  child: "자녀",
  parent: "부모",
  etc: "기타",
};

const BAPTISM_LABELS: Record<string, string> = {
  visitor: "방문",
  wonip: "원입",
  haksup: "학습",
  baptized: "세례",
  confirmed: "입교",
  infant: "유아세례",
};

/** 숫자만 남기고 010-0000-0000 형태로 자동 하이픈 */
function formatPhone(value: string): string {
  const digits = value.replace(/[^0-9]/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

const EMPTY_FORM = {
  code: "",
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
  familyRole: "",
};

/** 인증 쿠키로 접근하는 사진 URL — v로 업로드 직후 캐시 무효화 */
const photoSrc = (id: number, v: number) => `/api/members/${id}/photo?v=${v}`;

function MemberAvatar({ member, version, size = "h-9 w-9" }: { member: Member; version: number; size?: string }) {
  if (member.photoUrl) {
    return (
      <img
        src={photoSrc(member.id, version)}
        alt={member.name}
        className={`${size} shrink-0 rounded-full object-cover border`}
      />
    );
  }
  return (
    <div className={`${size} shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium`}>
      {member.name.slice(0, 1)}
    </div>
  );
}

export default function AdminMembers() {
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Member | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [photoVersion, setPhotoVersion] = useState(() => Date.now());
  const [familySearch, setFamilySearch] = useState("");

  const closeAll = () => {
    setIsCreateOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFamilySearch("");
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
      code: member.code ?? "",
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
      familyRole: member.familyRole ?? "",
    });
    setFamilySearch("");
    setEditTarget(member);
  };

  // ── 사진 ──
  const refreshAfterPhoto = () => {
    setPhotoVersion(Date.now());
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["member-family"] });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editTarget) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("사진은 JPG/PNG/WebP 형식만 가능합니다");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        await api.post(`/members/${editTarget.id}/photo`, {
          fileBase64: ev.target?.result as string,
          mimeType: file.type,
        });
        toast.success("사진이 등록되었습니다");
        setEditTarget({ ...editTarget, photoUrl: "uploaded" });
        refreshAfterPhoto();
      } catch (err: any) {
        toast.error(err.message);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handlePhotoDelete = async () => {
    if (!editTarget) return;
    try {
      await api.delete(`/members/${editTarget.id}/photo`);
      toast.success("사진이 삭제되었습니다");
      setEditTarget({ ...editTarget, photoUrl: null });
      refreshAfterPhoto();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // ── 가족 ──
  const { data: family } = useQuery({
    queryKey: ["member-family", editTarget?.familyId],
    queryFn: () => api.get<FamilyDetail>(`/members/families/${editTarget!.familyId}`),
    enabled: editTarget !== null && editTarget.familyId !== null,
  });

  const { data: familyCandidates = [] } = useQuery({
    queryKey: ["members", "family-search", familySearch],
    queryFn: () =>
      api.get<{ items: Member[] }>(
        `/members?query=${encodeURIComponent(familySearch)}&limit=8`
      ),
    select: (d) => d.items.filter((m) => m.id !== editTarget?.id),
    enabled: editTarget !== null && familySearch.trim().length > 0,
  });

  const refreshFamily = () => {
    queryClient.invalidateQueries({ queryKey: ["members"] });
    queryClient.invalidateQueries({ queryKey: ["member-family"] });
  };

  /**
   * 다른 교인과 가족으로 묶기.
   * - 편집 중인 교인에게 가족이 있으면: 상대를 이 가족에 추가 (기존 가족 유지)
   * - 없고 상대에게 가족이 있으면: 이 교인이 상대 가족에 합류
   * - 둘 다 없으면: 새 가족을 만들고 함께 소속
   */
  // 서버 트랜잭션 단일 호출 — 가족 생성·연결이 원자적으로 처리돼 고아 레코드가 안 생긴다.
  // editTarget에 가족이 있으면 상대를 그 가족에 합류시키고, 없으면 editTarget을 상대 가족에 합류시킨다.
  const linkFamilyMutation = useMutation({
    mutationFn: (other: Member) => {
      if (!editTarget) throw new Error("대상 교인이 없습니다");
      const payload = editTarget.familyId
        ? { memberId: other.id, withMemberId: editTarget.id, role: other.familyRole || "etc" }
        : { memberId: editTarget.id, withMemberId: other.id, role: form.familyRole || "etc" };
      return api.post<{ familyId: number }>("/members/families/link", payload);
    },
    onSuccess: (res) => {
      toast.success("가족으로 연결되었습니다");
      if (editTarget) setEditTarget({ ...editTarget, familyId: res.familyId });
      setFamilySearch("");
      refreshFamily();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const unlinkFamilyMutation = useMutation({
    mutationFn: () =>
      api.patch(`/members/${editTarget!.id}`, { familyId: null, familyRole: null }),
    onSuccess: () => {
      toast.success("가족 관계가 해제되었습니다");
      if (editTarget) setEditTarget({ ...editTarget, familyId: null, familyRole: null });
      refreshFamily();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const buildPayload = () => ({
    code: form.code.trim() || undefined, // 빈 값이면 서버가 자동 발번
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
    familyRole: form.familyRole || null,
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
  const dupNames = duplicateNames(data?.items ?? []);

  const formDialog = (
    <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editTarget ? "교인 정보 수정" : "새 교인 등록"}</DialogTitle>
      </DialogHeader>
      {/* 사진 — 등록된 교인만 (id 필요) */}
      {editTarget && (
        <div className="flex items-center gap-4">
          <MemberAvatar member={editTarget} version={photoVersion} size="h-20 w-20" />
          <div className="space-y-1.5">
            <input
              ref={photoRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => photoRef.current?.click()}>
                <Camera className="mr-1 h-4 w-4" /> 사진 {editTarget.photoUrl ? "변경" : "등록"}
              </Button>
              {editTarget.photoUrl && (
                <Button type="button" size="sm" variant="ghost" onClick={handlePhotoDelete}>
                  <X className="mr-1 h-4 w-4" /> 삭제
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">JPG/PNG/WebP, 5MB 이하</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>이름 *</Label>
          <Input value={form.name} onChange={(e) => set("name", e.target.value)} />
        </div>
        <div>
          <Label>교적번호</Label>
          <Input
            value={form.code}
            onChange={(e) => set("code", e.target.value)}
            placeholder={editTarget ? "" : "비우면 자동 발번"}
          />
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
          <Input value={form.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} placeholder="010-0000-0000" />
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

      {/* 가족 — 등록된 교인만 */}
      {editTarget && (
        <div className="space-y-3 rounded-lg border p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium flex items-center gap-1.5">
              <Users className="h-4 w-4" /> 가족
              {family?.label && <span className="text-muted-foreground font-normal">— {family.label}</span>}
            </p>
            {editTarget.familyId && (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="h-7 text-muted-foreground"
                onClick={() => unlinkFamilyMutation.mutate()}
              >
                <Unlink className="mr-1 h-3.5 w-3.5" /> 관계 해제
              </Button>
            )}
          </div>

          <div>
            <Label className="text-xs">이 교인의 가족 내 관계</Label>
            <Select value={form.familyRole} onValueChange={(v) => set("familyRole", v)}>
              <SelectTrigger className="h-9"><SelectValue placeholder="선택" /></SelectTrigger>
              <SelectContent>
                {Object.entries(FAMILY_ROLE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editTarget.familyId ? (
            <div className="space-y-1">
              {(family?.members ?? [])
                .filter((m) => m.id !== editTarget.id)
                .map((m) => (
                  <div key={m.id} className="flex items-center gap-2 rounded-md border px-2 py-1.5 text-sm">
                    <MemberAvatar member={m} version={photoVersion} size="h-7 w-7" />
                    <span className="font-medium">{m.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {m.familyRole ? FAMILY_ROLE_LABELS[m.familyRole] ?? m.familyRole : "관계 미지정"}
                    </Badge>
                  </div>
                ))}
              {(family?.members ?? []).filter((m) => m.id !== editTarget.id).length === 0 && (
                <p className="text-xs text-muted-foreground">아직 다른 구성원이 없습니다 — 아래에서 교인을 검색해 추가하세요</p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">연결된 가족이 없습니다 — 교인을 검색해 가족으로 묶으세요</p>
          )}

          <div>
            <Input
              placeholder="이름으로 교인 검색 (가족 연결)"
              value={familySearch}
              onChange={(e) => setFamilySearch(e.target.value)}
              className="h-9"
            />
            {familySearch.trim() && (
              <div className="mt-1 space-y-1">
                {familyCandidates.length === 0 && (
                  <p className="px-1 text-xs text-muted-foreground">검색 결과가 없습니다</p>
                )}
                {familyCandidates.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    disabled={linkFamilyMutation.isPending || m.familyId === editTarget.familyId && editTarget.familyId !== null}
                    onClick={() => linkFamilyMutation.mutate(m)}
                    className="flex w-full items-center gap-2 rounded-md border px-2 py-1.5 text-left text-sm hover:bg-accent disabled:opacity-50"
                  >
                    <MemberAvatar member={m} version={photoVersion} size="h-7 w-7" />
                    <span className="flex-1">{m.name}</span>
                    {m.familyId && editTarget.familyId === m.familyId ? (
                      <span className="text-xs text-muted-foreground">이미 같은 가족</span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs text-primary">
                        <Link2 className="h-3.5 w-3.5" />
                        {editTarget.familyId
                          ? "이 가족에 추가"
                          : m.familyId
                            ? "상대 가족에 합류"
                            : "가족으로 묶기"}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
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
          <Button onClick={() => { setForm({ ...EMPTY_FORM, registeredAt: new Date().toISOString().slice(0, 10) }); setIsCreateOpen(true); }}>
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
                  <tr
                    key={member.id}
                    className="cursor-pointer border-b last:border-0 hover:bg-muted/50"
                    onClick={() => openEdit(member)}
                  >
                    <td className="p-3 font-medium">
                      <div className="flex items-center gap-2.5">
                        <MemberAvatar member={member} version={photoVersion} />
                        <div>
                          <div className="flex items-center">
                            {member.name}
                            {member.gender && (
                              <span className="ml-1 text-xs text-muted-foreground">
                                ({member.gender === "m" ? "남" : "여"})
                              </span>
                            )}
                            {dupNames.has(member.name) && (
                              <Badge variant="outline" className="ml-1.5 h-4 px-1 text-[10px] text-amber-600">
                                동명이인
                              </Badge>
                            )}
                            {member.familyId && (
                              <span className="ml-1.5 inline-flex items-center text-xs text-muted-foreground">
                                <Users className="mr-0.5 h-3 w-3" />
                                가족
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-normal text-muted-foreground">
                            {memberMeta(member) || "—"}
                          </div>
                        </div>
                      </div>
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
                      <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(member); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.stopPropagation(); confirmDelete(member.id); }}
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
