import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn, Lock, Mail } from "lucide-react";

export default function AdminLogin() {
  const { isAuthenticated, user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
    // 이미 로그인된 관리자는 대시보드로 리다이렉트
    window.location.href = "/admin";
    return null;
  }

  const handleManusoLogin = () => {
    window.location.href = getLoginUrl();
  };

  const handleLocalLogin = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("이메일과 비밀번호를 입력하세요");
      return;
    }

    setIsLoading(true);
    try {
      // 실제 로그인 로직은 백엔드에서 구현
      // 현재는 Manus OAuth를 통한 로그인만 지원
      toast.error("현재 Manus OAuth 로그인만 지원됩니다");
    } finally {
      setIsLoading(false);
    }
  };

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
            {/* Manus OAuth Login */}
            <div className="space-y-4">
              <Button
                onClick={handleManusoLogin}
                className="w-full h-11 rounded-lg"
                size="lg"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Manus로 로그인
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Manus 계정으로 안전하게 로그인하세요
              </p>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">또는</span>
              </div>
            </div>

            {/* Local Login Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                onClick={handleLocalLogin}
                disabled={isLoading}
                className="w-full h-11 rounded-lg"
                variant="outline"
                size="lg"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                현재 Manus OAuth 로그인만 지원됩니다
              </p>
            </div>

            {/* Info Box */}
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs text-blue-900">
                <strong>팁:</strong> 관리자 계정으로 로그인하려면 Manus 계정이 필요합니다. 계정이 없으신 경우 관리자에게 문의하세요.
              </p>
            </div>
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
