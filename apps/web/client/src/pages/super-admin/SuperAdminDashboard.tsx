import { useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link, useLocation } from "wouter";
import { CheckCircle, XCircle, Building2, Settings, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Church = {
  id: number;
  name: string;
  slug: string;
  status: "pending" | "active" | "suspended" | "rejected";
  email: string | null;
  phone: string | null;
  createdAt: string;
  rejectedReason: string | null;
};

const STATUS_LABEL: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending:   { label: "검토 중",   variant: "secondary" },
  active:    { label: "운영 중",   variant: "default" },
  suspended: { label: "정지",      variant: "destructive" },
  rejected:  { label: "거절됨",    variant: "outline" },
};

export default function SuperAdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const [rejectTarget, setRejectTarget] = useState<Church | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data: allChurches = [] } = useQuery<Church[]>({
    queryKey: ["churches"],
    queryFn: () => api.get<Church[]>("/churches"),
    enabled: user?.role === "super_admin",
  });

  const reviewMutation = useMutation({
    mutationFn: ({ id, action, rejectedReason }: { id: number; action: "active" | "rejected"; rejectedReason?: string }) =>
      api.post(`/churches/${id}/review`, { action, rejectedReason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["churches"] });
      toast.success("처리되었습니다");
      setRejectTarget(null);
      setRejectReason("");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading) return null;
  if (!user || user.role !== "super_admin") {
    navigate("/admin/login");
    return null;
  }

  const pending  = allChurches.filter((c) => c.status === "pending");
  const active   = allChurches.filter((c) => c.status === "active");
  const others   = allChurches.filter((c) => c.status === "suspended" || c.status === "rejected");

  const ChurchRow = ({ church }: { church: Church }) => {
    const s = STATUS_LABEL[church.status] ?? STATUS_LABEL.pending;
    return (
      <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium truncate">{church.name}</p>
              <Badge variant={s.variant}>{s.label}</Badge>
            </div>
            <p className="text-xs text-muted-foreground">/{church.slug} · {church.email ?? "-"}</p>
            {church.rejectedReason && (
              <p className="text-xs text-destructive mt-0.5">거절 사유: {church.rejectedReason}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 ml-3">
          {church.status === "pending" && (
            <>
              <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50"
                onClick={() => reviewMutation.mutate({ id: church.id, action: "active" })}>
                <CheckCircle className="h-3.5 w-3.5 mr-1" /> 승인
              </Button>
              <Button size="sm" variant="outline" className="text-destructive border-destructive/30 hover:bg-destructive/10"
                onClick={() => setRejectTarget(church)}>
                <XCircle className="h-3.5 w-3.5 mr-1" /> 거절
              </Button>
            </>
          )}
          {church.status === "active" && (
            <Button size="sm" variant="ghost" asChild>
              <a href={`/${church.slug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-3.5 w-3.5 mr-1" /> 보기
              </a>
            </Button>
          )}
          <Button size="sm" variant="ghost" asChild>
            <Link href={`/super-admin/churches/${church.id}`}>
              <Settings className="h-3.5 w-3.5 mr-1" /> 설정
            </Link>
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <h1 className="text-xl font-bold">최고관리자</h1>
        </div>
      </header>

      <main className="container py-8 max-w-4xl">
        {/* 요약 카드 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">검토 대기</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{pending.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">운영 중</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold text-green-600">{active.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">전체</CardTitle></CardHeader>
            <CardContent><p className="text-3xl font-bold">{allChurches.length}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList className="mb-6">
            <TabsTrigger value="pending">검토 대기 ({pending.length})</TabsTrigger>
            <TabsTrigger value="active">운영 중 ({active.length})</TabsTrigger>
            <TabsTrigger value="others">기타 ({others.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <div className="space-y-3">
              {pending.length === 0 ? <p className="text-center text-muted-foreground py-12">대기 중인 신청이 없습니다</p>
                : pending.map((c) => <ChurchRow key={c.id} church={c} />)}
            </div>
          </TabsContent>
          <TabsContent value="active">
            <div className="space-y-3">
              {active.length === 0 ? <p className="text-center text-muted-foreground py-12">운영 중인 교회가 없습니다</p>
                : active.map((c) => <ChurchRow key={c.id} church={c} />)}
            </div>
          </TabsContent>
          <TabsContent value="others">
            <div className="space-y-3">
              {others.length === 0 ? <p className="text-center text-muted-foreground py-12">없습니다</p>
                : others.map((c) => <ChurchRow key={c.id} church={c} />)}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* 거절 사유 다이얼로그 */}
      <Dialog open={!!rejectTarget} onOpenChange={(o) => { if (!o) { setRejectTarget(null); setRejectReason(""); } }}>
        <DialogContent>
          <DialogHeader><DialogTitle>신청 거절 — {rejectTarget?.name}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">거절 사유 (선택)</Label>
            <Textarea id="reason" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="신청자에게 전달될 거절 사유를 입력하세요" rows={3} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>취소</Button>
            <Button variant="destructive"
              onClick={() => rejectTarget && reviewMutation.mutate({ id: rejectTarget.id, action: "rejected", rejectedReason: rejectReason || undefined })}>
              거절 확정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
