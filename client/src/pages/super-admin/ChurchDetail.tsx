import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";

type Church = { id: number; name: string; slug: string; status: string; email: string | null; phone: string | null; address: string | null };
type Feature = { id: number; churchId: number; featureKey: string; isEnabled: number };
type AdminUser = { id: number; name: string | null; email: string | null; role: string };

const FEATURE_LABELS: Record<string, string> = {
  announcements:    "공지사항",
  images:           "이미지 갤러리",
  videos:           "영상",
  floating_messages:"플로팅 메시지",
  layout_settings:  "레이아웃 설정",
  ai_assistant:     "AI 어시스턴트",
};

export default function ChurchDetail() {
  const { id } = useParams<{ id: string }>();
  const churchId = Number(id);
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const { data: church } = useQuery<Church>({
    queryKey: ["church", churchId],
    queryFn: () => api.get<Church>(`/churches/${churchId}`),
    enabled: !!churchId,
  });
  const { data: features = [] } = useQuery<Feature[]>({
    queryKey: ["church-features", churchId],
    queryFn: () => api.get<Feature[]>(`/churches/${churchId}/features`),
    enabled: !!churchId,
  });
  const { data: admins = [] } = useQuery<AdminUser[]>({
    queryKey: ["church-admins", churchId],
    queryFn: () => api.get<AdminUser[]>(`/churches/${churchId}/admins`),
    enabled: !!churchId,
  });

  const featureMutation = useMutation({
    mutationFn: ({ featureKey, isEnabled }: { featureKey: string; isEnabled: boolean }) =>
      api.patch(`/churches/${churchId}/features/${featureKey}`, { isEnabled }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["church-features", churchId] }),
    onError: (e: any) => toast.error(e.message),
  });

  const removeAdminMutation = useMutation({
    mutationFn: (userId: number) => api.delete(`/churches/${churchId}/admins/${userId}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["church-admins", churchId] });
      toast.success("관리자가 제거되었습니다");
    },
    onError: (e: any) => toast.error(e.message),
  });

  if (loading) return null;
  if (!user || user.role !== "super_admin") { navigate("/admin/login"); return null; }
  if (!church) return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;

  const getFeatureEnabled = (key: string) => (features.find((f) => f.featureKey === key)?.isEnabled ?? 1) === 1;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/super-admin"><ArrowLeft className="h-4 w-4 mr-1" /> 목록</Link>
          </Button>
          <h1 className="text-xl font-bold">{church.name}</h1>
          <span className="text-sm text-muted-foreground">/{church.slug}</span>
        </div>
      </header>

      <main className="container py-8 max-w-3xl space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>교회 정보</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-muted-foreground">이메일</span><p>{church.email ?? "-"}</p></div>
              <div><span className="text-muted-foreground">연락처</span><p>{church.phone ?? "-"}</p></div>
              <div className="col-span-2"><span className="text-muted-foreground">주소</span><p>{church.address ?? "-"}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* 기능 플래그 */}
        <Card>
          <CardHeader>
            <CardTitle>기능 설정</CardTitle>
            <CardDescription>비활성화하면 해당 교회 관리자 메뉴에서 숨겨집니다</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(FEATURE_LABELS).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={`feature-${key}`} className="cursor-pointer">{label}</Label>
                <Switch
                  id={`feature-${key}`}
                  checked={getFeatureEnabled(key)}
                  onCheckedChange={(checked) => featureMutation.mutate({ featureKey: key, isEnabled: checked })}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 관리자 목록 */}
        <Card>
          <CardHeader>
            <CardTitle>관리자</CardTitle>
            <CardDescription>이 교회를 관리할 수 있는 계정 목록</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-sm text-muted-foreground">등록된 관리자가 없습니다</p>
            ) : (
              admins.map((admin) => (
                <div key={admin.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-full"><User className="h-4 w-4 text-primary" /></div>
                    <div>
                      <p className="text-sm font-medium">{admin.name ?? "이름 없음"}</p>
                      <p className="text-xs text-muted-foreground">{admin.email ?? "-"}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => removeAdminMutation.mutate(admin.id)}
                  >
                    제거
                  </Button>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
