import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link, useParams } from "wouter";
import { ArrowLeft } from "lucide-react";

const GROUP_LABELS: Record<string, { title: string; subtitle: string }> = {
  "god-love":      { title: "하나님사랑",  subtitle: "하나님과 깊이 연결되는 사역과 양육 프로그램" },
  "neighbor-love": { title: "이웃사랑",    subtitle: "지역사회와 이웃을 섬기는 사역 프로그램" },
};

interface MinistryProps {
  groupKey: "god-love" | "neighbor-love";
}

export default function Ministry({ groupKey }: MinistryProps) {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug;
  const label = GROUP_LABELS[groupKey] ?? { title: groupKey, subtitle: "" };
  const basePath = `/ministry/${groupKey}`;

  const { data: groups, isLoading } = useQuery({
    queryKey: ["page-groups", groupKey],
    queryFn: () => api.get<any[]>(`/page-groups?groupKey=${groupKey}`),
  });

  if (slug) {
    const group = (groups ?? []).find((g: any) => g.slug === slug);
    return (
      <PublicPageLayout>
        <div className="container py-16 max-w-3xl">
          <Link href={basePath}>
            <a className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
              <ArrowLeft className="h-4 w-4" /> {label.title}으로 돌아가기
            </a>
          </Link>
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-4 w-full bg-muted rounded" />
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
                <div className="prose prose-sm max-w-none text-muted-foreground">{group.content}</div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground">해당 프로그램을 찾을 수 없습니다.</p>
          )}
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">{label.title}</h1>
        <p className="text-muted-foreground mb-10">{label.subtitle}</p>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {(groups ?? []).map((group: any) => (
              <Link key={group.id} href={`${basePath}/${group.slug}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  {group.imageUrl && (
                    <div className="aspect-video overflow-hidden rounded-t-xl">
                      <img src={group.imageUrl} alt={group.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                    </div>
                  )}
                  <CardHeader>
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    {group.description && (
                      <CardDescription className="line-clamp-2">{group.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
