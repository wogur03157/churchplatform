import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Calendar, ArrowRight } from "lucide-react";
import { stripHtml } from "@/lib/utils";

export default function NewsAnnouncements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements", { publishedOnly: true }],
    queryFn: () => api.get<any[]>("/announcements?publishedOnly=true"),
  });

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">공지사항</h1>
        <p className="text-muted-foreground mb-10">영신교회 공지사항입니다</p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        ) : (announcements ?? []).length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">등록된 공지사항이 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {(announcements ?? []).map((item: any) => (
              <Link key={item.id} href={`/announcements/${item.id}`}>
                <Card className="hover:shadow-md transition-all hover:translate-y-[-1px] cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg shrink-0">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base line-clamp-1">{item.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{stripHtml(item.content)}</p>
                    <span className="inline-flex items-center text-xs text-primary font-medium">
                      자세히 보기 <ArrowRight className="h-3 w-3 ml-1" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
