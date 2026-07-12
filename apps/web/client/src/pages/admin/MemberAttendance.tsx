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
import { CalendarCheck, Check, Save } from "lucide-react";

type Session = { id: number; name: string; displayOrder: number };
type Member = { id: number; name: string; status: string };
type AttendanceRecord = { memberId: number; status: "present" | "absent" | "online" };
type StatRow = { date: string; sessionId: number; presentCount: number };

const today = () => new Date().toISOString().slice(0, 10);

export default function AdminMemberAttendance() {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string>("");
  const [date, setDate] = useState(today());
  const [checked, setChecked] = useState<Map<number, AttendanceRecord["status"]>>(new Map());
  const [dirty, setDirty] = useState(false);

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
    queryFn: () => api.get<{ items: Member[] }>("/members?status=active&limit=100"),
  });
  const members = memberList?.items ?? [];

  const { data: recordsData } = useQuery({
    queryKey: ["attendance-records", sessionId, date],
    queryFn: () =>
      api.get<AttendanceRecord[]>(`/members/attendance/records?sessionId=${sessionId}&date=${date}`),
    enabled: !!sessionId && !!date,
  });

  // 서버 기록 → 체크 상태 초기화 (기본값 []를 deps에 넣으면 무한루프 — 쿼리 결과 원본만 사용)
  useEffect(() => {
    if (!recordsData) return;
    setChecked(new Map(recordsData.map((r) => [r.memberId, r.status])));
    setDirty(false);
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

  const saveMutation = useMutation({
    mutationFn: () =>
      api.post("/members/attendance/check", {
        sessionId: parseInt(sessionId),
        date,
        records: Array.from(checked.entries()).map(([memberId, status]) => ({ memberId, status })),
      }),
    onSuccess: () => {
      toast.success("출석이 저장되었습니다");
      setDirty(false);
      queryClient.invalidateQueries({ queryKey: ["attendance-records"] });
      queryClient.invalidateQueries({ queryKey: ["attendance-stats"] });
    },
    onError: (err: Error) => toast.error(`저장 실패: ${err.message}`),
  });

  const toggle = (memberId: number) => {
    const next = new Map(checked);
    if (next.has(memberId)) next.delete(memberId);
    else next.set(memberId, "present");
    setChecked(next);
    setDirty(true);
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
        <Button onClick={() => saveMutation.mutate()} disabled={!dirty || !sessionId}>
          <Save className="mr-2 h-4 w-4" />
          저장 {dirty && `(${presentCount}명)`}
        </Button>
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
              출석(active) 상태의 교인이 없습니다
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
