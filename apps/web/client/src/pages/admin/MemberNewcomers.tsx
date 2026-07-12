import { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Plus, Sprout, Trash2 } from "lucide-react";

type Card_ = {
  id: number;
  memberId: number;
  memberName: string;
  registeredAt: string | null;
  note: string | null;
  daysInStage: number;
  completedAt: string | null;
};

type Stage = {
  id: number;
  name: string;
  displayOrder: number;
  isFinal: number;
  cards: Card_[];
};

type MemberOption = { id: number; name: string };

export default function AdminMemberNewcomers() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");
  const [noteTarget, setNoteTarget] = useState<Card_ | null>(null);
  const [noteDraft, setNoteDraft] = useState("");

  const { data: board = [] } = useQuery({
    queryKey: ["newcomers"],
    queryFn: () => api.get<Stage[]>("/members/newcomers"),
  });

  const { data: memberOptions } = useQuery({
    queryKey: ["members", "newcomer-options", memberSearch],
    queryFn: () =>
      api.get<{ items: MemberOption[] }>(
        `/members?limit=30${memberSearch ? `&query=${encodeURIComponent(memberSearch)}` : ""}`
      ),
    enabled: isAddOpen,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["newcomers"] });

  const addMutation = useMutation({
    mutationFn: (memberId: number) => api.post("/members/newcomers", { memberId }),
    onSuccess: () => {
      toast.success("새가족 카드가 추가되었습니다");
      setIsAddOpen(false);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, stageId }: { id: number; stageId: number }) =>
      api.patch(`/members/newcomers/${id}`, { stageId }),
    onSuccess: invalidate,
    onError: (err: Error) => toast.error(err.message),
  });

  const noteMutation = useMutation({
    mutationFn: ({ id, note }: { id: number; note: string }) =>
      api.patch(`/members/newcomers/${id}`, { note }),
    onSuccess: () => {
      toast.success("메모가 저장되었습니다");
      setNoteTarget(null);
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/members/newcomers/${id}`),
    onSuccess: () => {
      toast.success("카드가 삭제되었습니다");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const move = (card: Card_, fromIndex: number, direction: -1 | 1) => {
    const target = board[fromIndex + direction];
    if (!target) return;
    moveMutation.mutate({ id: card.id, stageId: target.id });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">새가족 정착</h1>
          <p className="text-muted-foreground">
            등록부터 정착까지 단계를 따라 새가족을 관리합니다 — 카드의 화살표로 단계 이동
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 새가족 등록
        </Button>
      </div>

      {/* 칸반 보드 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {board.map((stage, stageIndex) => (
          <Card key={stage.id} className={stage.isFinal ? "border-green-300" : ""}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  {stage.isFinal === 1 && <Sprout className="h-4 w-4 text-green-600" />}
                  {stage.name}
                </span>
                <Badge variant="secondary">{stage.cards.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stage.cards.length === 0 && (
                <p className="py-4 text-center text-xs text-muted-foreground">비어 있음</p>
              )}
              {stage.cards.map((card) => (
                <div key={card.id} className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{card.memberName}</span>
                    <span
                      className={`text-xs ${
                        card.daysInStage >= 21 && stage.isFinal !== 1
                          ? "font-semibold text-red-600"
                          : "text-muted-foreground"
                      }`}
                    >
                      {card.daysInStage}일째
                    </span>
                  </div>
                  {card.note && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{card.note}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        disabled={stageIndex === 0}
                        onClick={() => move(card, stageIndex, -1)}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 w-7 p-0"
                        disabled={stageIndex === board.length - 1}
                        onClick={() => move(card, stageIndex, 1)}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={() => {
                          setNoteTarget(card);
                          setNoteDraft(card.note ?? "");
                        }}
                      >
                        메모
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-muted-foreground"
                        onClick={() => {
                          if (confirm("이 카드를 삭제하시겠습니까?")) removeMutation.mutate(card.id);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 새가족 등록 다이얼로그 */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새가족 등록</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            교적에 등록된 교인을 첫 단계 카드로 추가합니다. 교적에 없다면 먼저 교인 관리에서
            등록해주세요.
          </p>
          <Input
            placeholder="이름 검색"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          />
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {(memberOptions?.items ?? []).map((m) => (
              <button
                key={m.id}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent"
                onClick={() => addMutation.mutate(m.id)}
              >
                {m.name}
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* 메모 다이얼로그 */}
      <Dialog open={noteTarget !== null} onOpenChange={(open) => !open && setNoteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{noteTarget?.memberName} — 정착 메모</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label>메모</Label>
            <Textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              rows={4}
              placeholder="새가족반 출석 상황, 연락 내용 등"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNoteTarget(null)}>취소</Button>
            <Button
              onClick={() => noteTarget && noteMutation.mutate({ id: noteTarget.id, note: noteDraft })}
            >
              저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
