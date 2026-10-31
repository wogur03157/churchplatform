import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";

const GROUP_LABELS: Record<string, { title: string; subtitle: string; eyebrow: string }> = {
  "god-love":      { title: "하나님사랑",  subtitle: "하나님과 깊이 연결되는 사역과 양육 프로그램", eyebrow: "MINISTRY" },
  "neighbor-love": { title: "이웃사랑",    subtitle: "지역사회와 이웃을 섬기는 사역 프로그램",       eyebrow: "MINISTRY" },
};

interface MinistryProps {
  groupKey: "god-love" | "neighbor-love";
}

export default function Ministry({ groupKey }: MinistryProps) {
  const params = useParams<{ slug?: string }>();
  const slug = params.slug;
  const label = GROUP_LABELS[groupKey] ?? { title: groupKey, subtitle: "", eyebrow: "MINISTRY" };
  const basePath = `/ministry/${groupKey}`;

  const { data: groups, isLoading } = useQuery({
    queryKey: ["page-groups", groupKey],
    queryFn: () => api.get<any[]>(`/page-groups?groupKey=${groupKey}`),
  });

  if (slug) {
    const group = (groups ?? []).find((g: any) => g.slug === slug);
    return (
      <PublicPageLayout>
        <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-10">
          <div className="container max-w-3xl">
            <Link href={basePath}>
              <a className="inline-flex items-center gap-1.5 text-sm text-brand-sage hover:text-brand-sage/80 mb-4 font-medium transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> {label.title}으로 돌아가기
              </a>
            </Link>
          </div>
        </div>
        <div className="container py-12 max-w-3xl">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-brand-cream rounded-xl" />
              <div className="h-4 w-full bg-brand-cream rounded-xl" />
            </div>
          ) : group ? (
            <>
              {group.imageUrl && (
                <img src={group.imageUrl} alt={group.name} className="w-full rounded-2xl object-cover h-60 mb-8" />
              )}
              <h1 className="font-serif text-4xl font-bold text-brand-brown mb-3">{group.name}</h1>
              {group.description && (
                <p className="text-brand-brown/65 text-lg mb-8 leading-relaxed">{group.description}</p>
              )}
              {group.content && (
                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: group.content }} />
              )}
            </>
          ) : (
            <p className="text-brand-brown/50">해당 프로그램을 찾을 수 없습니다.</p>
          )}
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">{label.eyebrow}</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">{label.title}</h1>
          <p className="text-brand-brown/60 text-lg">{label.subtitle}</p>
        </div>
      </div>

      <div className="container py-12 max-w-5xl">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-brand-cream animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {(groups ?? []).map((group: any) => (
              <Link key={group.id} href={`${basePath}/${group.slug}`}>
                <a className="group block rounded-2xl bg-white shadow-sm border border-brand-gold/20 overflow-hidden hover:shadow-md transition-shadow">
                  {group.imageUrl && (
                    <div className="aspect-video overflow-hidden">
                      <img
                        src={group.imageUrl}
                        alt={group.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-5 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-serif font-bold text-brand-brown mb-1">{group.name}</h3>
                      {group.description && (
                        <p className="text-sm text-brand-brown/60 line-clamp-2">{group.description}</p>
                      )}
                    </div>
                    <ArrowRight className="h-4 w-4 text-brand-sage shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
