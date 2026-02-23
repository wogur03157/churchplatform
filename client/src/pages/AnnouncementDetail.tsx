import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function AnnouncementDetail() {
  const params = useParams();
  const id = parseInt(params.id || "0");

  const { data: announcement, isLoading } = useQuery({
    queryKey: ["announcements", id],
    queryFn: () => api.get<any>(`/announcements/${id}`),
    enabled: id > 0,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">공지사항을 찾을 수 없습니다</p>
            <Button asChild>
              <Link href="/">홈으로 돌아가기</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">관리자 대시보드</h1>
          </div>
          <nav className="flex gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              홈
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              관리자
            </Link>
          </nav>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" className="mb-6" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록으로 돌아가기
            </Link>
          </Button>

          <Card className="elegant-shadow-lg">
            <CardHeader className="space-y-4">
              <div>
                <CardTitle className="text-3xl mb-2">{announcement.title}</CardTitle>
                <CardDescription className="text-base">
                  {new Date(announcement.createdAt).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                  {announcement.publishedAt && (
                    <span className="ml-2">
                      · 발행일: {new Date(announcement.publishedAt).toLocaleDateString("ko-KR")}
                    </span>
                  )}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-foreground leading-relaxed">
                  {announcement.content}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2026 관리자 대시보드. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
