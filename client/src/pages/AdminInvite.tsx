import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CheckCircle, LogIn, XCircle } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

type InvitationInfo = {
  valid: boolean;
  email: string;
  churchId: number;
  churchName: string | null;
  expiresAt: string;
  used: boolean;
};

function StatusCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
      <Card className="w-full max-w-md elegant-shadow-lg text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">{icon}</div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function AdminInvite() {
  const [, navigate] = useLocation();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [done, setDone] = useState(false);
  const [acceptError, setAcceptError] = useState<string | null>(null);

  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const { data: info, isLoading } = useQuery<InvitationInfo | null>({
    queryKey: ["invitation", token],
    queryFn: () => api.get<InvitationInfo>(`/invitations/${token}`),
    enabled: !!token,
    retry: false,
  });

  const acceptMutation = useMutation({
    mutationFn: () => api.post<{ success: boolean; message?: string }>(`/invitations/${token}/accept`),
    onSuccess: (res) => {
      if (res.success) {
        setDone(true);
        setTimeout(() => navigate("/admin"), 2000);
      } else {
        setAcceptError(res.message ?? "처리 중 오류가 발생했습니다");
      }
    },
    onError: (e: any) => setAcceptError(e.message),
  });

  if (authLoading || isLoading) return null;

  if (!token || !info) {
    return (
      <StatusCard
        icon={<XCircle className="h-12 w-12 text-destructive" />}
        title="유효하지 않은 초대"
        description="초대 링크가 올바르지 않습니다."
      />
    );
  }

  if (info.used) {
    return (
      <StatusCard
        icon={<XCircle className="h-12 w-12 text-muted-foreground" />}
        title="이미 사용된 초대"
        description="이 초대 링크는 이미 사용되었습니다."
      />
    );
  }

  if (!info.valid) {
    return (
      <StatusCard
        icon={<XCircle className="h-12 w-12 text-destructive" />}
        title="만료된 초대"
        description="초대 링크가 만료되었습니다. 슈퍼어드민에게 재초대를 요청하세요."
      />
    );
  }

  if (done) {
    return (
      <StatusCard
        icon={<CheckCircle className="h-12 w-12 text-green-500" />}
        title="관리자 등록 완료"
        description="잠시 후 관리자 페이지로 이동합니다."
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
      <Card className="w-full max-w-md elegant-shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>관리자 초대</CardTitle>
          <CardDescription>
            <span className="font-medium text-foreground">{info.churchName ?? "교회"}</span>의 관리자로 초대받으셨습니다
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted/50 px-4 py-3 text-sm text-muted-foreground text-center">
            초대 이메일: <span className="font-medium text-foreground">{info.email}</span>
          </div>
          {acceptError && <p className="text-sm text-destructive text-center">{acceptError}</p>}
          {!isAuthenticated ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                수락하려면 먼저 Google 계정으로 로그인하세요
              </p>
              <Button className="w-full" onClick={() => navigate("/admin/login")}>
                <LogIn className="mr-2 h-4 w-4" /> Google로 로그인
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              onClick={() => acceptMutation.mutate()}
              disabled={acceptMutation.isPending}
            >
              {acceptMutation.isPending ? "처리 중..." : "관리자로 참여하기"}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
