import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import {
  CalendarCheck,
  Cake,
  HeartHandshake,
  Sprout,
  TriangleAlert,
  UserPlus,
} from "lucide-react";

type Summary = {
  statusCounts: Record<string, number>;
  absentees: { id: number; name: string; phone: string | null; status: string }[];
  birthdays: { id: number; name: string; birthDate: string }[];
  newcomers: { stageId: number; name: string; count: number }[];
  absentWeeks: number;
};

/** 재적 현황 — 재적 탭의 첫 화면. 목회의 눈으로 보는 요약 */
export default function AdminMemberDashboard() {
  const [, setLocation] = useLocation();

  const { data: summary } = useQuery({
    queryKey: ["members-dashboard"],
    queryFn: () => api.get<Summary>("/members/dashboard"),
  });

  const counts = summary?.statusCounts ?? {};
  const total = Object.values(counts).reduce((s, n) => s + n, 0);
  const newcomersInProgress = (summary?.newcomers ?? [])
    .filter((s) => s.name !== "정착")
    .reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">재적 현황</h1>
        <p className="text-muted-foreground">우리 교회 성도들의 오늘</p>
      </div>

      {/* 요약 카드 */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary">
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">전체 재적</p>
            <p className="text-2xl font-bold">{total}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">출석 교인</p>
            <p className="text-2xl font-bold">{counts.active ?? 0}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">장기결석 ({summary?.absentWeeks ?? 4}주 기준)</p>
            <p className="text-2xl font-bold text-amber-600">{summary?.absentees.length ?? 0}명</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-muted-foreground">새가족 정착 진행</p>
            <p className="text-2xl font-bold">{newcomersInProgress}명</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 장기결석 — 행동으로 연결 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <TriangleAlert className="h-4 w-4 text-amber-600" /> 돌봄이 필요한 성도
            </CardTitle>
            <Button size="sm" variant="outline" onClick={() => setLocation("/admin/members/visitations")}>
              <HeartHandshake className="mr-1 h-4 w-4" /> 심방 관리
            </Button>
          </CardHeader>
          <CardContent className="space-y-1">
            {(summary?.absentees ?? []).length === 0 && (
              <p className="py-6 text-center text-sm text-muted-foreground">
                최근 {summary?.absentWeeks ?? 4}주간 장기결석 감지된 성도가 없습니다 🙌
              </p>
            )}
            {(summary?.absentees ?? []).map((m) => (
              <div key={m.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                <span>
                  <span className="font-medium">{m.name}</span>
                  {m.phone && <span className="ml-2 text-muted-foreground">{m.phone}</span>}
                </span>
                <Badge variant="outline" className="text-amber-600">
                  {summary?.absentWeeks ?? 4}주+ 결석
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* 이번 주 생일 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Cake className="h-4 w-4" /> 이번 주 생일
              </CardTitle>
            </CardHeader>
            <CardContent>
              {(summary?.birthdays ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">이번 주 생일자가 없습니다</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {summary!.birthdays.map((b) => (
                    <Badge key={b.id} variant="secondary" className="px-3 py-1.5 text-sm">
                      🎂 {b.name} ({String(b.birthDate).slice(5, 10)})
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 새가족 단계 현황 */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <Sprout className="h-4 w-4" /> 새가족 정착 단계
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => setLocation("/admin/members/newcomers")}>
                보드 열기
              </Button>
            </CardHeader>
            <CardContent>
              {(summary?.newcomers ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">진행 중인 새가족이 없습니다</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {summary!.newcomers.map((s) => (
                    <Badge key={s.stageId} variant={s.name === "정착" ? "default" : "outline"} className="px-3 py-1.5 text-sm">
                      {s.name} {s.count}명
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 바로가기 */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-16" onClick={() => setLocation("/admin/members/attendance")}>
              <CalendarCheck className="mr-2 h-5 w-5" /> 출석 체크
            </Button>
            <Button variant="outline" className="h-16" onClick={() => setLocation("/admin/members")}>
              <UserPlus className="mr-2 h-5 w-5" /> 교인 등록·관리
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
