import { useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCRUD } from "@/hooks/useCRUD";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ChevronRight, FolderTree, Plus, Trash2, UserMinus, UserPlus } from "lucide-react";

type Group = {
  id: number;
  parentId: number | null;
  type: "parish" | "cell" | "department" | "team";
  name: string;
  leaderMemberId: number | null;
  displayOrder: number;
  memberCount: number;
};

type GroupMember = { id: number; name: string; status: string; role?: string };
type MemberOption = { id: number; name: string };

const TYPE_LABELS: Record<Group["type"], string> = {
  parish: "교구",
  cell: "구역/셀",
  department: "부서",
  team: "팀",
};

const EMPTY_FORM = { name: "", type: "department" as Group["type"], parentId: "" };

export default function AdminMemberGroups() {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignIds, setAssignIds] = useState<Set<number>>(new Set());
  const [memberSearch, setMemberSearch] = useState("");

  const { data: groups = [] } = useQuery({
    queryKey: ["member-groups"],
    queryFn: () => api.get<Group[]>("/members/groups"),
  });

  const { data: groupMembers = [] } = useQuery({
    queryKey: ["member-groups", selectedId, "members"],
    queryFn: () => api.get<GroupMember[]>(`/members/groups/${selectedId}/members`),
    enabled: selectedId !== null,
  });

  const { data: memberOptions } = useQuery({
    queryKey: ["members", "options", memberSearch],
    queryFn: () =>
      api.get<{ items: MemberOption[] }>(
        `/members?limit=50${memberSearch ? `&query=${encodeURIComponent(memberSearch)}` : ""}`
      ),
    enabled: isAssignOpen,
  });

  const { createMutation, confirmDelete } = useCRUD({
    queryKey: "member-groups",
    path: "members/groups",
    entityName: "조직",
    onSuccess: () => setIsCreateOpen(false),
  });

  // parentId 기준 트리 정렬 (깊이 우선)
  const tree = useMemo(() => {
    const byParent = new Map<number | null, Group[]>();
    for (const g of groups) {
      const list = byParent.get(g.parentId) ?? [];
      list.push(g);
      byParent.set(g.parentId, list);
    }
    const result: Array<Group & { depth: number }> = [];
    const walk = (parentId: number | null, depth: number) => {
      for (const g of byParent.get(parentId) ?? []) {
        result.push({ ...g, depth });
        walk(g.id, depth + 1);
      }
    };
    walk(null, 0);
    return result;
  }, [groups]);

  const selected = groups.find((g) => g.id === selectedId) ?? null;

  const handleCreate = () => {
    if (!form.name.trim()) return toast.error("조직 이름을 입력해주세요");
    createMutation.mutate({
      name: form.name.trim(),
      type: form.type,
      parentId: form.parentId ? parseInt(form.parentId) : null,
    });
    setForm(EMPTY_FORM);
  };

  const handleAssign = async () => {
    if (!selectedId || assignIds.size === 0) return;
    try {
      await api.post(`/members/groups/${selectedId}/members`, {
        memberIds: Array.from(assignIds),
      });
      toast.success(`${assignIds.size}명이 배정되었습니다`);
      setIsAssignOpen(false);
      setAssignIds(new Set());
      queryClient.invalidateQueries({ queryKey: ["member-groups"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "배정에 실패했습니다");
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!selectedId) return;
    try {
      await api.delete(`/members/groups/${selectedId}/members/${memberId}`);
      toast.success("조직에서 제외되었습니다");
      queryClient.invalidateQueries({ queryKey: ["member-groups"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "제외에 실패했습니다");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">조직 관리</h1>
          <p className="text-muted-foreground">교구·구역·부서·팀을 트리로 관리하고 교인을 배정합니다</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> 조직 추가
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 조직 트리 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FolderTree className="h-4 w-4" /> 조직도
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {tree.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                아직 조직이 없습니다. 교구/부서부터 추가해보세요.
              </p>
            )}
            {tree.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedId(g.id)}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent ${
                  selectedId === g.id ? "bg-accent font-medium" : ""
                }`}
                style={{ paddingLeft: `${g.depth * 20 + 8}px` }}
              >
                {g.depth > 0 && <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground" />}
                <span className="truncate">{g.name}</span>
                <Badge variant="outline" className="ml-auto shrink-0">
                  {TYPE_LABELS[g.type]}
                </Badge>
                <span className="shrink-0 text-xs text-muted-foreground">{g.memberCount}명</span>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* 선택 조직 명단 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">
              {selected ? `${selected.name} 명단` : "조직을 선택하세요"}
            </CardTitle>
            {selected && (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setIsAssignOpen(true)}>
                  <UserPlus className="mr-1 h-4 w-4" /> 교인 배정
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => {
                    confirmDelete(selected.id);
                    setSelectedId(null);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {selected && groupMembers.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">배정된 교인이 없습니다</p>
            )}
            <div className="space-y-1">
              {groupMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border px-3 py-2 text-sm"
                >
                  <span>
                    {m.name}
                    {m.role === "leader" && (
                      <Badge className="ml-2" variant="secondary">
                        리더
                      </Badge>
                    )}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 text-muted-foreground"
                    onClick={() => handleRemoveMember(m.id)}
                  >
                    <UserMinus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 조직 추가 다이얼로그 */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>조직 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>이름</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="예: 1교구, 유치부, 찬양대"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>유형</Label>
                <Select
                  value={form.type}
                  onValueChange={(v) => setForm({ ...form, type: v as Group["type"] })}
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
                <Label>상위 조직</Label>
                <Select
                  value={form.parentId || "none"}
                  onValueChange={(v) => setForm({ ...form, parentId: v === "none" ? "" : v })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">(최상위)</SelectItem>
                    {tree.map((g) => (
                      <SelectItem key={g.id} value={String(g.id)}>
                        {" ".repeat(g.depth * 2)}{g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>취소</Button>
            <Button onClick={handleCreate} disabled={createMutation.isPending}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 교인 배정 다이얼로그 */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}에 교인 배정</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="이름 검색"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
          />
          <div className="max-h-72 space-y-1 overflow-y-auto">
            {(memberOptions?.items ?? []).map((m) => (
              <label
                key={m.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <input
                  type="checkbox"
                  checked={assignIds.has(m.id)}
                  onChange={(e) => {
                    const next = new Set(assignIds);
                    e.target.checked ? next.add(m.id) : next.delete(m.id);
                    setAssignIds(next);
                  }}
                />
                {m.name}
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>취소</Button>
            <Button onClick={handleAssign} disabled={assignIds.size === 0}>
              {assignIds.size}명 배정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
