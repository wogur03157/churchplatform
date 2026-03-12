import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Link, useParams, useLocation } from "wouter";
import { ArrowLeft, User } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type Church = { id: number; name: string; slug: string; status: string; email: string | null; phone: string | null; address: string | null };
type Feature = { id: number; churchId: number; featureKey: string; isEnabled: number };
type AdminUser = { id: number; name: string | null; email: string | null; role: string };

const FEATURE_LABELS: Record<string, string> = {
  announcements:    "공지사항",
  images:           "이미지",
  videos:           "영상",
  video_categories: "영상 카테고리",
  floating_messages:"플로팅 메시지",
  popups:           "팝업",
  layout_settings:  "레이아웃 설정",
  page_groups:      "소그룹 관리",
  form_config:      "폼 필드 설정",
  form_submissions: "신청 내역",
  ai_assistant:     "AI 어시스턴트",
};

type PermItem = { permKey: string; label: string };
type PermGroup = { title: string; items: PermItem[] };

const PERM_GROUPS: PermGroup[] = [
  {
    title: "콘텐츠",
    items: [
      { permKey: "announcements",    label: "공지사항 관리" },
      { permKey: "images",           label: "이미지 관리" },
      { permKey: "videos",           label: "영상 관리" },
      { permKey: "video_categories", label: "영상 카테고리 관리" },
    ],
  },
  {
    title: "메시지",
    items: [
      { permKey: "floating_messages", label: "플로팅 메시지 관리" },
      { permKey: "popups",            label: "팝업 관리" },
    ],
  },
  {
    title: "설정",
    items: [
      { permKey: "layout_settings", label: "레이아웃 설정" },
      { permKey: "page_groups",     label: "소그룹 관리" },
      { permKey: "form_config",     label: "폼 필드 설정" },
    ],
  },
  {
    title: "데이터",
    items: [
      { permKey: "form_submissions", label: "신청 내역 조회" },
    ],
  },
];

const ALL_PERM_KEYS = PERM_GROUPS.flatMap((g) => g.items.map((i) => i.permKey));

export default function ChurchDetail() {
  const { id } = useParams<{ id: string }>();
  const churchId = Number(id);
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const [permAdminId, setPermAdminId] = useState<number | null>(null);

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

  const { data: permsData } = useQuery<{ permissions: string[] }>({
    queryKey: ["admin-permissions", permAdminId],
    queryFn: () => api.get<{ permissions: string[] }>(`/admins/${permAdminId}/permissions`),
    enabled: permAdminId !== null,
  });

  const updatePerm = useMutation({
    mutationFn: ({ permKey, isAllowed }: { permKey: string; isAllowed: boolean }) =>
      api.patch(`/admins/${permAdminId}/permissions`, { permKey, isAllowed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-permissions", permAdminId] }),
    onError: (e: any) => toast.error(e.message),
  });

  const handleBulkPerm = (isAllowed: boolean) => {
    ALL_PERM_KEYS.forEach((permKey) => updatePerm.mutate({ permKey, isAllowed }));
  };

  if (loading) return null;
  if (!user || user.role !== "super_admin") { navigate("/admin/login"); return null; }
  if (!church) return <div className="p-8 text-center text-muted-foreground">로딩 중...</div>;

  const getFeatureEnabled = (key: string) => (features.find((f) => f.featureKey === key)?.isEnabled ?? 1) === 1;

  const permAdmin = admins.find((a) => a.id === permAdminId);
  const allowedPerms = permsData?.permissions ?? [];
  const allAllowed = ALL_PERM_KEYS.every((k) => allowedPerms.includes(k));
  const noneAllowed = ALL_PERM_KEYS.every((k) => !allowedPerms.includes(k));

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
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPermAdminId(admin.id)}>
                      권한 설정
                    </Button>
                    <Button
                      size="sm" variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeAdminMutation.mutate(admin.id)}
                    >
                      제거
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </main>

      {/* 권한 설정 Sheet */}
      <Sheet open={permAdminId !== null} onOpenChange={(open) => { if (!open) setPermAdminId(null); }}>
        <SheetContent className="flex flex-col gap-0 p-0 overflow-y-auto">
          {/* 헤더 */}
          <SheetHeader className="px-6 pt-6 pb-4">
            <SheetTitle>메뉴 접근 권한</SheetTitle>
            <SheetDescription>허용된 메뉴에만 접근(등록·수정·삭제 포함)할 수 있습니다</SheetDescription>
          </SheetHeader>

          {/* 관리자 정보 */}
          {permAdmin && (
            <div className="mx-6 mb-4 flex items-center gap-3 rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">{permAdmin.name ?? "이름 없음"}</p>
                <p className="mt-1 text-xs text-muted-foreground truncate">{permAdmin.email ?? "-"}</p>
              </div>
            </div>
          )}

          {/* 전체 허용 / 해제 */}
          <div className="mx-6 mb-2 flex gap-2">
            <Button
              size="sm" variant="outline" className="flex-1"
              disabled={allAllowed || !permsData}
              onClick={() => handleBulkPerm(true)}
            >
              전체 허용
            </Button>
            <Button
              size="sm" variant="outline" className="flex-1"
              disabled={noneAllowed || !permsData}
              onClick={() => handleBulkPerm(false)}
            >
              전체 해제
            </Button>
          </div>

          <Separator className="mt-2" />

          {/* 권한 그룹 */}
          <div className="flex-1 px-6 py-4 space-y-6">
            {PERM_GROUPS.map((group, gi) => (
              <div key={gi}>
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                <div className="space-y-1">
                  {group.items.map(({ permKey, label }) => {
                    const allowed = allowedPerms.includes(permKey);
                    return (
                      <div
                        key={permKey}
                        className="flex items-center justify-between rounded-md px-3 py-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <Label htmlFor={`perm-${permKey}`} className="cursor-pointer text-sm font-normal">
                          {label}
                        </Label>
                        <Switch
                          id={`perm-${permKey}`}
                          checked={allowed}
                          disabled={!permsData}
                          onCheckedChange={(checked) => updatePerm.mutate({ permKey, isAllowed: checked })}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
