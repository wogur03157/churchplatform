import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FlaskConical, Lock, LogIn } from "lucide-react";

async function handleDevLogin() {
  await api.post("/auth/dev-login");
  window.location.href = "/super-admin";
}

async function handleDevChurchLogin() {
  await api.post("/auth/dev-church-login");
  window.location.href = "/admin";
}

export default function AdminLogin() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="text-center">
          <p className="text-muted-foreground">로그인 상태를 확인하는 중입니다.</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "super_admin") {
    window.location.href = "/super-admin";
    return null;
  }

  if (isAuthenticated && user?.role === "church_admin") {
    window.location.href = "/admin";
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
      <div className="w-full max-w-md">
        <Card className="elegant-shadow-lg">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Lock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">관리자 로그인</CardTitle>
            <CardDescription>
              관리자 대시보드 접근을 위해 로그인하세요.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                onClick={() => {
                  window.location.href = getLoginUrl();
                }}
                className="w-full h-11 rounded-lg"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Google로 로그인
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                로컬 개발 중이면 아래 개발용 로그인 버튼을 사용하면 됩니다.
              </p>
            </div>

            {import.meta.env.DEV && (
              <div className="border-t pt-4 space-y-3">
                <p className="text-xs text-muted-foreground text-center">
                  개발 환경 전용 로그인
                </p>
                <Button
                  variant="outline"
                  onClick={handleDevLogin}
                  className="w-full h-10 rounded-lg border-dashed border-orange-400 text-orange-600 hover:bg-orange-50"
                >
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Dev Super Admin
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDevChurchLogin}
                  className="w-full h-10 rounded-lg border-dashed border-blue-400 text-blue-600 hover:bg-blue-50"
                >
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Dev Church Admin
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            <a href="/" className="text-primary hover:underline">
              공개 페이지로 돌아가기
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
