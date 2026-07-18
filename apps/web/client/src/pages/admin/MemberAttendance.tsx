import { useEffect, useMemo, useState } from "react";
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
import { CalendarCheck, Check } from "lucide-react";

type Session = { id: number; name: string; displayOrder: number };
type Member = { id: number; name: string; status: string };
type AttendanceRecord = { memberId: number; status: "present" | "absent" | "online" };
type StatRow = { date: string; sessionId: number; presentCount: number };

const today = () => new Date().toISOString().slice(0, 10);
/** 가장 가까운 주일(오늘이 일요일이면 오늘) — 예배 출석은 주일 기준이 기본 */
const lastSunday = () => {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  return d.toISOString().slice(0, 10);
};

export default function AdminMemberAttendance() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string>("");
  const [date, setDate] = useState(lastSunday());
  const [checked, setChecked] = useState<Map<number, AttendanceRecord["status"]>>(new Map());

  const { data: sessionsData } = useQuery({
    queryKey: ["attendance-sessions"],
    queryFn: () => api.get<Session[]>("/members/attendance/sessions"),
  });
  const sessions = sessionsData ?? [];

  // 첫 세션 자동 선택 (sessionsData는 쿼리 결과가 바뀔 때만 참조가 변한다)
  useEffect(() => {
    if (!sessionId && sessionsData && sessionsData.length > 0) {
      setSessionId(String(sessionsData[0].id));
    }
  }, [sessionsData, sessionId]);

  const { data: memberList } = useQuery({
    queryKey: ["members", "attendance-roster"],
    queryFn: () => api.get<{ items: Member[] }>("/members?limit=1000"),
  });
  // 출석 + 장기결석 교인만 (장기결석자가 다시 나오면 체크 → 자동 복귀)
  const members = (memberList?.items ?? []).filter(
    (m) => m.status === "active" || m.status === "absent_long"
  );

  const { data: recordsData } = useQuery({
    queryKey: ["attendance-records", sessionId, date],
    queryFn: () =>
      api.get<AttendanceRecord[]>(`/members/attendance/records?sessionId=${sessionId}&date=${date}`),
    enabled: !!sessionId && !!date,
  });

  // 서버 기록 → 체크 상태 초기화 (기본값 []를 deps에 넣으면 무한루프 — 쿼리 결과 원본만 사용)
  useEffect(() => {
    if (!recordsData) return;
    setChecked(new Map(recordsData.filter((r) => r.status !== "absent").map((r) => [r.memberId, r.status])));
  }, [recordsData]);

  const { data: stats = [] } = useQuery({
    queryKey: ["attendance-stats", sessionId],
    queryFn: () => {
      const from = new Date();
      from.setDate(from.getDate() - 28);
      return api.get<StatRow[]>(
        `/members/attendance/stats?from=${from.toISOString().slice(0, 10)}&to=${today()}&sessionId=${sessionId}`
      );
    },
    enabled: !!sessionId,
  });

  // 탭 즉시 저장 — 별도 저장 버튼 없이 누르는 순간 기록된다 (해제는 absent로 upsert)
  const checkMutation = useMutation({
    mutationFn: ({ memberId, status }: { memberId: number; status: AttendanceRecord["status"] | "absent" }) =>
      api.post("/members/attendance/check", {
        sessionId: parseInt(sessionId),
        date,
        records: [{ memberId, status }],
      }),
    onError: (err: Error, variables) => {
      toast.error(`저장 실패: ${err.message}`);
      // 실패 시 롤백
      setChecked((prev) => {
        const next = new Map(prev);
        if (variables.status === "absent") next.set(variables.memberId, "present");
        else next.delete(variables.memberId);
        return next;
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
    },
  });

  const toggle = (memberId: number) => {
    if (!sessionId) return toast.error("예배를 먼저 선택해주세요");
    const next = new Map(checked);
    const wasChecked = next.has(memberId);
    if (wasChecked) next.delete(memberId);
    else next.set(memberId, "present");
    setChecked(next);
    checkMutation.mutate({ memberId, status: wasChecked ? "absent" : "present" });
  };

  const presentCount = useMemo(
    () => Array.from(checked.values()).filter((s) => s === "present" || s === "online").length,
    [checked]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">출석 체크</h1>
          <p className="text-muted-foreground">예배·모임을 선택하고 이름을 탭하면 출석 처리됩니다</p>
        </div>
        <Badge variant="secondary" className="self-center text-sm">
          자동 저장 — 탭하는 즉시 기록됩니다
        </Badge>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={sessionId} onValueChange={setSessionId}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="예배 선택" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
        <Badge variant="secondary" className="self-center">
          출석 {presentCount} / 재적 {members.length}
        </Badge>
      </div>

      {/* 모바일 우선: 이름 버튼 그리드로 빠른 체크 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarCheck className="h-4 w-4" /> 명단
          </CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              출석 체크할 교인이 없습니다
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {members.map((m) => {
                const isPresent = checked.has(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggle(m.id)}
                    className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-3 text-sm transition-colors ${
                      isPresent
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {isPresent && <Check className="h-3.5 w-3.5" />}
                    {m.name}
                    {m.status === "absent_long" && !isPresent && (
                      <span className="text-[10px] text-amber-600">장기결석</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 최근 4주 추이 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">최근 4주 출석 추이</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">기록이 없습니다</p>
          ) : (
            <div className="flex items-end gap-2 overflow-x-auto pb-2">
              {stats.map((row) => {
                const max = Math.max(...stats.map((r) => r.presentCount), 1);
                return (
                  <div key={row.date} className="flex min-w-14 flex-col items-center gap-1">
                    <span className="text-xs font-medium">{row.presentCount}</span>
                    <div
                      className="w-8 rounded-t bg-primary/70"
                      style={{ height: `${(row.presentCount / max) * 80 + 4}px` }}
                    />
                    <span className="text-[10px] text-muted-foreground">{String(row.date).slice(5, 10)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
