import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus, Trash2, Save, GripVertical, Leaf, Users, Heart, Clock,
  ChevronDown, ChevronUp, Wind,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ImageInput } from "@/components/ImageInput";

// ─── Types ────────────────────────────────────────────────────────────────────

type MinistryItem = {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  displayOrder: number;
  status: "active" | "inactive";
};

type NextGenItem = {
  id: number;
  title: string;
  subtitle: string | null;
  targetAge: string | null;
  worshipTime: string | null;
  location: string | null;
  description: string | null;
  imageUrl: string | null;
  imageKey: string | null;
  displayOrder: number;
  status: "active" | "inactive";
  motto: string | null;
  staffInfo: string | null;
};

type CanaanData = {
  id?: number;
  backgroundImageUrl: string | null;
  title: string | null;
  description: string | null;
  button1Text: string | null;
  button1Link: string | null;
  button2Text: string | null;
  button2Link: string | null;
};

type WorshipItem = {
  id: number;
  name: string;
  time: string;
  location: string | null;
  displayOrder: number;
  status: "active" | "inactive";
};

// ─── Sub-Forms ────────────────────────────────────────────────────────────────

function MinistryForm({
  item,
  onSave,
  onDelete,
}: {
  item: Partial<MinistryItem>;
  onSave: (data: Partial<MinistryItem>) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<Partial<MinistryItem>>(item);
  const [expanded, setExpanded] = useState(!item.id);

  const set = (key: keyof MinistryItem, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="font-semibold flex-1">{form.title || "(새 항목)"}</span>
        <Badge variant={form.status === "active" ? "default" : "secondary"}>
          {form.status === "active" ? "활성" : "비활성"}
        </Badge>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {expanded && (
        <div className="p-4 border-t border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>제목</Label>
              <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="사역 이름" />
            </div>
            <div className="space-y-1.5">
              <Label>상태</Label>
              <select
                value={form.status ?? "active"}
                onChange={(e) => set("status", e.target.value as "active" | "inactive")}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>설명</Label>
            <Textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="사역 설명"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label>이미지</Label>
            <ImageInput
              value={form.imageUrl ?? null}
              onChange={(url, key) => setForm((f) => ({ ...f, imageUrl: url, imageKey: key ?? null }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>표시 순서</Label>
            <Input type="number" value={form.displayOrder ?? 0} onChange={(e) => set("displayOrder", Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-3 justify-end">
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-1" /> 삭제
              </Button>
            )}
            <Button size="sm" onClick={() => onSave(form)}>
              <Save className="w-4 h-4 mr-1" /> 저장
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function NextGenForm({
  item,
  onSave,
  onDelete,
}: {
  item: Partial<NextGenItem>;
  onSave: (data: Partial<NextGenItem>) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<Partial<NextGenItem>>(item);
  const [expanded, setExpanded] = useState(!item.id);

  const set = (key: keyof NextGenItem, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="font-semibold flex-1">{form.title || "(새 부서)"}</span>
        <Badge variant={form.status === "active" ? "default" : "secondary"}>
          {form.status === "active" ? "활성" : "비활성"}
        </Badge>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {expanded && (
        <div className="p-4 border-t border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>부서명</Label>
              <Input value={form.title ?? ""} onChange={(e) => set("title", e.target.value)} placeholder="예: 유아부" />
            </div>
            <div className="space-y-1.5">
              <Label>영문 부제 (subtitle)</Label>
              <Input value={form.subtitle ?? ""} onChange={(e) => set("subtitle", e.target.value)} placeholder="예: Yes Kids of Grace" />
            </div>
            <div className="space-y-1.5">
              <Label>대상 연령</Label>
              <Input value={form.targetAge ?? ""} onChange={(e) => set("targetAge", e.target.value)} placeholder="예: 4세 ~ 7세 유아" />
            </div>
            <div className="space-y-1.5">
              <Label>예배 시간</Label>
              <Input value={form.worshipTime ?? ""} onChange={(e) => set("worshipTime", e.target.value)} placeholder="예: 주일 오전 11:00" />
            </div>
            <div className="space-y-1.5">
              <Label>장소</Label>
              <Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="예: 본당 1층 영아실" />
            </div>
            <div className="space-y-1.5">
              <Label>담당자</Label>
              <Input value={form.staffInfo ?? ""} onChange={(e) => set("staffInfo", e.target.value)} placeholder="예: 김미래 전도사 | ..." />
            </div>
            <div className="space-y-1.5">
              <Label>상태</Label>
              <select
                value={form.status ?? "active"}
                onChange={(e) => set("status", e.target.value as "active" | "inactive")}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label>표시 순서</Label>
              <Input type="number" value={form.displayOrder ?? 0} onChange={(e) => set("displayOrder", Number(e.target.value))} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>부서 설명</Label>
            <Textarea value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} placeholder="부서 소개 내용" rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>비전 / 모토 (성경 구절 등)</Label>
            <Textarea value={form.motto ?? ""} onChange={(e) => set("motto", e.target.value)} placeholder="예: 마땅히 행할 길을 아이에게 가르치라..." rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>이미지</Label>
            <ImageInput
              value={form.imageUrl ?? null}
              onChange={(url, key) => setForm((f) => ({ ...f, imageUrl: url, imageKey: key ?? null }))}
            />
          </div>
          <div className="flex items-center gap-3 justify-end">
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-1" /> 삭제
              </Button>
            )}
            <Button size="sm" onClick={() => onSave(form)}>
              <Save className="w-4 h-4 mr-1" /> 저장
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function WorshipForm({
  item,
  onSave,
  onDelete,
}: {
  item: Partial<WorshipItem>;
  onSave: (data: Partial<WorshipItem>) => void;
  onDelete?: () => void;
}) {
  const [form, setForm] = useState<Partial<WorshipItem>>(item);
  const [expanded, setExpanded] = useState(!item.id);

  const set = (key: keyof WorshipItem, value: any) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="border border-border rounded-2xl overflow-hidden bg-card">
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className="font-semibold flex-1">{form.name || "(새 예배)"}</span>
        <span className="text-sm font-mono text-primary">{form.time}</span>
        <Badge variant={form.status === "active" ? "default" : "secondary"}>
          {form.status === "active" ? "활성" : "비활성"}
        </Badge>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </div>

      {expanded && (
        <div className="p-4 border-t border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>예배명</Label>
              <Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="예: 주일 1부 예배" />
            </div>
            <div className="space-y-1.5">
              <Label>시간</Label>
              <Input value={form.time ?? ""} onChange={(e) => set("time", e.target.value)} placeholder="예: 09:30" />
            </div>
            <div className="space-y-1.5">
              <Label>장소</Label>
              <Input value={form.location ?? ""} onChange={(e) => set("location", e.target.value)} placeholder="예: 본당 2층" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>표시 순서</Label>
              <Input type="number" value={form.displayOrder ?? 0} onChange={(e) => set("displayOrder", Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>상태</Label>
              <select
                value={form.status ?? "active"}
                onChange={(e) => set("status", e.target.value as "active" | "inactive")}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
              >
                <option value="active">활성</option>
                <option value="inactive">비활성</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-3 justify-end">
            {onDelete && (
              <Button variant="destructive" size="sm" onClick={onDelete}>
                <Trash2 className="w-4 h-4 mr-1" /> 삭제
              </Button>
            )}
            <Button size="sm" onClick={() => onSave(form)}>
              <Save className="w-4 h-4 mr-1" /> 저장
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

const TABS = [
  { id: "ministry", label: "사역 소개", icon: Leaf },
  { id: "canaan", label: "가나안쉼터", icon: Wind },
  { id: "nextgen", label: "다음세대", icon: Users },
  { id: "worship", label: "예배안내", icon: Clock },
] as const;

type TabId = typeof TABS[number]["id"];

// ─── Main Component ────────────────────────────────────────────────────────────

export default function HomeSettings() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabId>("ministry");

  // ── Ministry Items ──────────────────────────────────────────────────────────
  const { data: ministryItems = [] } = useQuery<MinistryItem[]>({
    queryKey: ["home-ministry"],
    queryFn: () => api.get("/home-ministry"),
  });

  const createMinistryMutation = useMutation({
    mutationFn: (data: Partial<MinistryItem>) => api.post("/home-ministry", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-ministry"] }); toast.success("추가되었습니다"); },
    onError: (e: any) => toast.error(`저장 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const updateMinistryMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MinistryItem> }) => api.patch(`/home-ministry/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-ministry"] }); toast.success("수정되었습니다"); },
    onError: (e: any) => toast.error(`저장 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const deleteMinistryMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/home-ministry/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-ministry"] }); toast.success("삭제되었습니다"); },
    onError: (e: any) => toast.error(`삭제 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const [newMinistry, setNewMinistry] = useState(false);

  // ── Canaan ──────────────────────────────────────────────────────────────────
  const { data: canaanData } = useQuery<CanaanData | null>({
    queryKey: ["home-canaan"],
    queryFn: () => api.get("/home-canaan"),
  });

  const [canaanForm, setCanaanForm] = useState<Partial<CanaanData>>({});
  const canaanMutation = useMutation({
    mutationFn: (data: Partial<CanaanData>) => api.patch("/home-canaan", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-canaan"] }); toast.success("저장되었습니다"); },
    onError: (e: any) => toast.error(`저장 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const canaanCurrent = { ...canaanData, ...canaanForm };
  const setCanaan = (key: keyof CanaanData, value: any) =>
    setCanaanForm((f) => ({ ...f, [key]: value }));

  // ── Next Gen Items ──────────────────────────────────────────────────────────
  const { data: nextGenItems = [] } = useQuery<NextGenItem[]>({
    queryKey: ["home-next-gen"],
    queryFn: () => api.get("/home-next-gen"),
  });

  const createNextGenMutation = useMutation({
    mutationFn: (data: Partial<NextGenItem>) => api.post("/home-next-gen", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-next-gen"] }); toast.success("추가되었습니다"); },
    onError: (e: any) => toast.error(`저장 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const updateNextGenMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<NextGenItem> }) => api.patch(`/home-next-gen/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-next-gen"] }); toast.success("수정되었습니다"); },
    onError: (e: any) => toast.error(`저장 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const deleteNextGenMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/home-next-gen/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-next-gen"] }); toast.success("삭제되었습니다"); },
    onError: (e: any) => toast.error(`삭제 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const [newNextGen, setNewNextGen] = useState(false);

  // ── Worship Schedule ────────────────────────────────────────────────────────
  const { data: worshipItems = [] } = useQuery<WorshipItem[]>({
    queryKey: ["home-worship"],
    queryFn: () => api.get("/home-worship"),
  });

  const createWorshipMutation = useMutation({
    mutationFn: (data: Partial<WorshipItem>) => api.post("/home-worship", data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-worship"] }); toast.success("추가되었습니다"); },
    onError: (e: any) => toast.error(`저장 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const updateWorshipMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<WorshipItem> }) => api.patch(`/home-worship/${id}`, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-worship"] }); toast.success("수정되었습니다"); },
    onError: (e: any) => toast.error(`저장 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const deleteWorshipMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/home-worship/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["home-worship"] }); toast.success("삭제되었습니다"); },
    onError: (e: any) => toast.error(`삭제 실패: ${e?.message ?? "알 수 없는 오류"}`),
  });

  const [newWorship, setNewWorship] = useState(false);

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">홈 섹션 관리</h1>
        <p className="text-sm text-muted-foreground mt-1">홈페이지 각 섹션의 콘텐츠를 편집합니다.</p>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── 사역 소개 Tab ── */}
      {activeTab === "ministry" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Leaf className="w-5 h-5" /> 사역 소개 항목</h2>
            <Button size="sm" onClick={() => setNewMinistry(true)}>
              <Plus className="w-4 h-4 mr-1" /> 추가
            </Button>
          </div>
          {newMinistry && (
            <MinistryForm
              item={{ displayOrder: (ministryItems.length + 1) * 10, status: "active" }}
              onSave={(data) => { createMinistryMutation.mutate(data); setNewMinistry(false); }}
              onDelete={() => setNewMinistry(false)}
            />
          )}
          {ministryItems.map((item) => (
            <MinistryForm
              key={item.id}
              item={item}
              onSave={(data) => updateMinistryMutation.mutate({ id: item.id, data })}
              onDelete={() => deleteMinistryMutation.mutate(item.id)}
            />
          ))}
          {ministryItems.length === 0 && !newMinistry && (
            <p className="text-sm text-muted-foreground py-8 text-center">아직 항목이 없습니다. 추가 버튼을 눌러 시작하세요.</p>
          )}
        </div>
      )}

      {/* ── 가나안쉼터 Tab ── */}
      {activeTab === "canaan" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Wind className="w-5 h-5" /> 가나안쉼터 섹션 설정</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label>배경 이미지</Label>
              <ImageInput
                value={canaanCurrent?.backgroundImageUrl ?? null}
                onChange={(url) => setCanaan("backgroundImageUrl", url)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>제목</Label>
              <Textarea
                value={canaanCurrent?.title ?? ""}
                onChange={(e) => setCanaan("title", e.target.value)}
                placeholder="섹션 메인 타이틀"
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>설명</Label>
              <Textarea
                value={canaanCurrent?.description ?? ""}
                onChange={(e) => setCanaan("description", e.target.value)}
                placeholder="섹션 설명 문구"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>버튼1 텍스트</Label>
                <Input value={canaanCurrent?.button1Text ?? ""} onChange={(e) => setCanaan("button1Text", e.target.value)} placeholder="예: Digital Prayer Room" />
              </div>
              <div className="space-y-1.5">
                <Label>버튼1 링크</Label>
                <Input value={canaanCurrent?.button1Link ?? ""} onChange={(e) => setCanaan("button1Link", e.target.value)} placeholder="#prayer" />
              </div>
              <div className="space-y-1.5">
                <Label>버튼2 텍스트</Label>
                <Input value={canaanCurrent?.button2Text ?? ""} onChange={(e) => setCanaan("button2Text", e.target.value)} placeholder="예: Open Conversation" />
              </div>
              <div className="space-y-1.5">
                <Label>버튼2 링크</Label>
                <Input value={canaanCurrent?.button2Link ?? ""} onChange={(e) => setCanaan("button2Link", e.target.value)} placeholder="/canaan/online-consultation" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => canaanMutation.mutate(canaanCurrent as CanaanData)}>
                <Save className="w-4 h-4 mr-1" /> 저장
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 다음세대 Tab ── */}
      {activeTab === "nextgen" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="w-5 h-5" /> 다음세대 부서 카드</h2>
            <Button size="sm" onClick={() => setNewNextGen(true)}>
              <Plus className="w-4 h-4 mr-1" /> 추가
            </Button>
          </div>
          {newNextGen && (
            <NextGenForm
              item={{ displayOrder: (nextGenItems.length + 1) * 10, status: "active" }}
              onSave={(data) => { createNextGenMutation.mutate(data); setNewNextGen(false); }}
              onDelete={() => setNewNextGen(false)}
            />
          )}
          {nextGenItems.map((item) => (
            <NextGenForm
              key={item.id}
              item={item}
              onSave={(data) => updateNextGenMutation.mutate({ id: item.id, data })}
              onDelete={() => deleteNextGenMutation.mutate(item.id)}
            />
          ))}
          {nextGenItems.length === 0 && !newNextGen && (
            <p className="text-sm text-muted-foreground py-8 text-center">아직 부서가 없습니다. 추가 버튼을 눌러 시작하세요.</p>
          )}
        </div>
      )}

      {/* ── 예배안내 Tab ── */}
      {activeTab === "worship" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-semibold flex items-center gap-2"><Clock className="w-5 h-5" /> 예배 시간표</h2>
            <Button size="sm" onClick={() => setNewWorship(true)}>
              <Plus className="w-4 h-4 mr-1" /> 추가
            </Button>
          </div>
          {newWorship && (
            <WorshipForm
              item={{ displayOrder: (worshipItems.length + 1) * 10, status: "active" }}
              onSave={(data) => { createWorshipMutation.mutate(data); setNewWorship(false); }}
              onDelete={() => setNewWorship(false)}
            />
          )}
          {worshipItems.map((item) => (
            <WorshipForm
              key={item.id}
              item={item}
              onSave={(data) => updateWorshipMutation.mutate({ id: item.id, data })}
              onDelete={() => deleteWorshipMutation.mutate(item.id)}
            />
          ))}
          {worshipItems.length === 0 && !newWorship && (
            <p className="text-sm text-muted-foreground py-8 text-center">아직 예배 항목이 없습니다. 추가 버튼을 눌러 시작하세요.</p>
          )}
        </div>
      )}
    </div>
  );
}
