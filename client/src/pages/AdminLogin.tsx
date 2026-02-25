import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, Lock, FlaskConical } from "lucide-react";

async function handleDevLogin() {
  await api.post("/auth/dev-login");
  window.location.href = "/admin";
}

export default function AdminLogin() {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background">
        <div className="text-center">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user?.role === "admin") {
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
              관리 시스템에 접근하려면 로그인하세요
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Button
                onClick={() => { window.location.href = getLoginUrl(); }}
                className="w-full h-11 rounded-lg"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Google로 로그인
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Google 계정으로 안전하게 로그인하세요
              </p>
            </div>

            {import.meta.env.DEV && (
              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground text-center mb-3">
                  🛠 개발 환경 전용
                </p>
                <Button
                  variant="outline"
                  onClick={handleDevLogin}
                  className="w-full h-10 rounded-lg border-dashed border-orange-400 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"
                >
                  <FlaskConical className="mr-2 h-4 w-4" />
                  Dev Admin으로 로그인 (테스트용)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
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
