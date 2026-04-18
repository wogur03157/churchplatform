import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useParams } from "wouter";
import { ArrowLeft, Users } from "lucide-react";

export default function CommunityDepartments() {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug;

  const { data: groups, isLoading } = useQuery({
    queryKey: ["page-groups", "departments"],
    queryFn: () => api.get<any[]>("/page-groups?groupKey=departments"),
  });

  if (slug) {
    const group = (groups ?? []).find((g: any) => g.slug === slug);
    return (
      <PublicPageLayout>
        <div className="container py-16 max-w-3xl">
          <Link href="/community/departments">
            <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" /> 부서소개로 돌아가기
            </a>
          </Link>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
              <div className="h-4 w-3/4 bg-muted rounded" />
            </div>
          ) : group ? (
            <>
              {group.imageUrl && (
                <img src={group.imageUrl} alt={group.name} className="w-full rounded-xl object-cover h-56 mb-8" />
              )}
              <h1 className="text-4xl font-bold mb-3">{group.name}</h1>
              {group.description && (
                <p className="text-muted-foreground text-lg mb-8 leading-relaxed">{group.description}</p>
              )}
              {group.content && (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: group.content }} />
              )}
            </>
          ) : (
            <p className="text-muted-foreground">해당 부서를 찾을 수 없습니다.</p>
          )}
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">부서 소개</h1>
        <p className="text-muted-foreground mb-10">영신교회의 각 부서를 소개합니다</p>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(groups ?? []).map((group: any) => (
              <Link key={group.id} href={`/community/departments/${group.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  {group.imageUrl && (
                    <div className="aspect-video overflow-hidden rounded-t-xl">
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      {group.name}
                    </CardTitle>
                    {group.description && (
                      <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {!isLoading && (groups ?? []).length === 0 && (
          <Card>
            <CardContent className="py-16 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">등록된 부서가 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicPageLayout>
  );
}
