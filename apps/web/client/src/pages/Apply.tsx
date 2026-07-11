import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { Church, CheckCircle, LogIn } from "lucide-react";

export default function Apply() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    phone: "",
    email: "",
  });

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // slug 자동 생성
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9가-힣\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    setForm((f) => ({ ...f, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/churches/apply", form);
      setDone(true);
    } catch (err: any) {
      setError(err.message ?? "신청 중 오류가 발생했습니다");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
        <Card className="w-full max-w-md elegant-shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-primary/10 rounded-lg"><Church className="h-8 w-8 text-primary" /></div>
            </div>
            <CardTitle>교회 홈페이지 신청</CardTitle>
            <CardDescription>신청하려면 먼저 Google 계정으로 로그인하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={() => navigate("/admin/login")}>
              <LogIn className="mr-2 h-4 w-4" /> 로그인 후 신청하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-background p-4">
        <Card className="w-full max-w-md elegant-shadow-lg text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>신청이 완료되었습니다</CardTitle>
            <CardDescription>
              관리자 검토 후 승인 시 이메일로 안내해 드립니다.<br />
              승인까지 영업일 기준 1~3일이 소요될 수 있습니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild className="w-full">
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-primary/5 to-background py-12 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-lg"><Church className="h-8 w-8 text-primary" /></div>
          </div>
          <h1 className="text-3xl font-bold">교회 홈페이지 신청</h1>
          <p className="text-muted-foreground mt-2">아래 정보를 입력하면 관리자 검토 후 승인됩니다</p>
        </div>

        <Card className="elegant-shadow-lg">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <Label htmlFor="name">교회명 <span className="text-destructive">*</span></Label>
                <Input id="name" value={form.name} onChange={handleNameChange} placeholder="은혜교회" required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">
                  URL 슬러그 <span className="text-destructive">*</span>
                  <span className="text-xs text-muted-foreground ml-2">홈페이지 주소: /{form.slug || "slug"}</span>
                </Label>
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={set("slug")}
                  placeholder="grace-church"
                  pattern="[a-z0-9-]+"
                  title="소문자, 숫자, 하이픈만 사용 가능"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="description">교회 소개</Label>
                <Textarea id="description" value={form.description} onChange={set("description")} placeholder="교회를 간단히 소개해주세요" rows={3} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="phone">연락처</Label>
                  <Input id="phone" value={form.phone} onChange={set("phone")} placeholder="02-0000-0000" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">이메일</Label>
                  <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="church@example.com" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="address">주소</Label>
                <Input id="address" value={form.address} onChange={set("address")} placeholder="서울시 강남구..." />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "신청 중..." : "신청하기"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
