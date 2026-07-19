import { useState } from "react";
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
import { HeartHandshake, Lock, Plus } from "lucide-react";

type Visitation = {
  id: number;
  memberId: number;
  type: "regular" | "hospital" | "new" | "event" | "urgent";
  status: "requested" | "assigned" | "done" | "canceled";
  scheduledAt: string | null;
  reason: string | null;
  content: string | null;
  hasContent?: boolean;
  createdAt: string;
};

type MemberOption = { id: number; name: string };

const TYPE_LABELS: Record<Visitation["type"], string> = {
  regular: "정기",
  hospital: "병원",
  new: "새가족",
  event: "경조사",
  urgent: "긴급",
};

const STATUS_LABELS: Record<Visitation["status"], { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  requested: { label: "요청됨", variant: "secondary" },
  assigned: { label: "배정됨", variant: "default" },
  done: { label: "완료", variant: "outline" },
  canceled: { label: "취소", variant: "destructive" },
};

const EMPTY_FORM = { memberId: "", type: "regular" as Visitation["type"], reason: "", scheduledAt: "" };

export default function AdminMemberVisitations() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [memberSearch, setMemberSearch] = useState("");
  const [recordTarget, setRecordTarget] = useState<Visitation | null>(null);
  const [recordDraft, setRecordDraft] = useState("");

  const { data: visitations = [] } = useQuery({
    queryKey: ["visitations", statusFilter],
    queryFn: () =>
      api.get<Visitation[]>(
        `/members/visitations${statusFilter !== "all" ? `?status=${statusFilter}` : ""}`
      ),
  });

  const { data: memberOptions } = useQuery({
    queryKey: ["members", "visit-options", memberSearch],
    queryFn: () =>
      api.get<{ items: MemberOption[] }>(
        `/members?limit=30${memberSearch ? `&query=${encodeURIComponent(memberSearch)}` : ""}`
      ),
    enabled: isCreateOpen,
  });

  // 목록에 교인 이름 표시용 명단 (id → name)
  const { data: roster } = useQuery({
    queryKey: ["members", "roster-names"],
    queryFn: () => api.get<{ items: MemberOption[] }>("/members?limit=100"),
  });
  const memberName = (id: number) =>
    roster?.items.find((m) => m.id === id)?.name ?? `교인 #${id}`;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["visitations"] });

  const createMutation = useMutation({
    mutationFn: (data: unknown) => api.post("/members/visitations", data),
    onSuccess: () => {
      toast.success("심방 요청이 등록되었습니다");
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number } & Record<string, unknown>) =>
      api.patch(`/members/visitations/${id}`, data),
    onSuccess: () => {
      toast.success("저장되었습니다");
      setRecordTarget(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">심방 관리</h1>
          <p className="text-muted-foreground">
            요청 → 배정 → 완료 흐름으로 관리합니다. 심방 기록은 교역자 권한에서만 열람됩니다
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 심방 요청
        </Button>
      </div>

      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">전체</SelectItem>
          {Object.entries(STATUS_LABELS).map(([value, { label }]) => (
            <SelectItem key={value} value={value}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="space-y-3">
        {visitations.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              심방 요청이 없습니다
            </CardContent>
          </Card>
        )}
        {visitations.map((v) => (
          <Card key={v.id}>
            <CardContent className="flex flex-wrap items-center gap-3 py-4">
              <HeartHandshake className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div className="min-w-40 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{memberName(v.memberId)}</span>
                  <Badge variant="outline">{TYPE_LABELS[v.type]}</Badge>
                  <Badge variant={STATUS_LABELS[v.status].variant}>
                    {STATUS_LABELS[v.status].label}
                  </Badge>
                  {v.scheduledAt && (
                    <span className="text-xs text-muted-foreground">예정 {v.scheduledAt}</span>
                  )}
                </div>
                {v.reason && <p className="mt-1 text-sm text-muted-foreground">{v.reason}</p>}
                {v.content ? (
                  <p className="mt-1 rounded bg-muted px-2 py-1 text-sm">{v.content}</p>
                ) : v.hasContent ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Lock className="h-3 w-3" /> 심방 기록 있음 (교역자 권한 필요)
                  </p>
                ) : null}
              </div>
              <div className="flex shrink-0 gap-2">
                {v.status === "done" ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setRecordTarget(v);
                      setRecordDraft(v.content ?? "");
                    }}
                  >
                    기록 보기·수정
                  </Button>
                ) : v.status === "canceled" ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => updateMutation.mutate({ id: v.id, status: "requested" })}
                  >
                    되돌리기
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setRecordTarget(v);
                        setRecordDraft(v.content ?? "");
                      }}
                    >
                      기록 작성
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => updateMutation.mutate({ id: v.id, status: "canceled" })}
                    >
                      취소
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 심방 요청 다이얼로그 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>심방 요청</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>교인 검색</Label>
              <Input
                placeholder="이름 검색"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
              <div className="max-h-36 space-y-1 overflow-y-auto">
                {(memberOptions?.items ?? []).map((m) => (
                  <button
                    key={m.id}
                    className={`w-full rounded-md px-3 py-1.5 text-left text-sm hover:bg-accent ${
                      form.memberId === String(m.id) ? "bg-accent font-medium" : ""
                    }`}
                    onClick={() => setForm({ ...form, memberId: String(m.id) })}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>유형</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Visitation["type"] })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>예정일 (선택)</Label>
                <Input
                  type="date"
                  value={form.scheduledAt}
                  onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>요청 사유</Label>
              <Input
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                placeholder="예: 병원 입원, 장기결석 팔로업"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
            <Button
              disabled={!form.memberId}
              onClick={() =>
                createMutation.mutate({
                  memberId: parseInt(form.memberId),
                  type: form.type,
                  reason: form.reason || undefined,
                  scheduledAt: form.scheduledAt || undefined,
                })
              }
            >
              요청 등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 기록 작성·수정 다이얼로그 (교역자 권한 필요 — 권한 없으면 서버가 403) */}
      <Dialog open={recordTarget !== null} onOpenChange={(open) => !open && setRecordTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {recordTarget?.status === "done" ? "심방 기록 (완료됨)" : "심방 기록 작성"}
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            기록은 교역자(members_sensitive) 권한자만 작성·열람할 수 있습니다.
            {recordTarget?.status === "done"
              ? " 완료 후에도 내용을 보완하거나 정정할 수 있습니다."
              : " 다녀온 뒤 메모만 먼저 저장하고, 마무리될 때 완료 처리하세요."}
          </p>
          <Textarea
            rows={5}
            value={recordDraft}
            onChange={(e) => setRecordDraft(e.target.value)}
            placeholder="심방 내용, 기도제목 등"
          />
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:justify-between">
            <div>
              {recordTarget?.status === "done" && (
                <Button
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() =>
                    recordTarget &&
                    updateMutation.mutate({
                      id: recordTarget.id,
                      content: recordDraft,
                      status: "assigned",
                    })
                  }
                >
                  완료 취소 (재오픈)
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setRecordTarget(null)}>닫기</Button>
              {recordTarget?.status === "done" ? (
                <Button
                  onClick={() =>
                    recordTarget &&
                    updateMutation.mutate({ id: recordTarget.id, content: recordDraft })
                  }
                >
                  기록 저장
                </Button>
              ) : (
                <>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      recordTarget &&
                      updateMutation.mutate({ id: recordTarget.id, content: recordDraft })
                    }
                  >
                    저장
                  </Button>
                  <Button
                    onClick={() =>
                      recordTarget &&
                      updateMutation.mutate({
                        id: recordTarget.id,
                        content: recordDraft,
                        status: "done",
                      })
                    }
                  >
                    완료 처리
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
