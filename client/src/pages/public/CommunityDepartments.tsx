import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Link, useParams } from "wouter";
import { ArrowLeft, ArrowRight, Users } from "lucide-react";

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
        <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-10">
          <div className="container max-w-3xl">
            <Link href="/community/departments">
              <a className="inline-flex items-center gap-1.5 text-sm text-brand-sage hover:text-brand-sage/80 mb-4 font-medium transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> 부서소개로 돌아가기
              </a>
            </Link>
          </div>
        </div>
        <div className="container py-12 max-w-3xl">
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-8 w-48 bg-brand-cream rounded-xl" />
              <div className="h-4 w-full bg-brand-cream rounded-xl" />
              <div className="h-4 w-3/4 bg-brand-cream rounded-xl" />
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
            <p className="text-brand-brown/50">해당 부서를 찾을 수 없습니다.</p>
          )}
        </div>
      </PublicPageLayout>
    );
  }

  return (
    <PublicPageLayout>
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">COMMUNITY</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">부서 소개</h1>
          <p className="text-brand-brown/60 text-lg">영신교회의 각 부서를 소개합니다</p>
        </div>
      </div>

      <div className="container py-12 max-w-5xl">
        {isLoading ? (
          <div className="grid gap-5 md:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 rounded-2xl bg-brand-cream animate-pulse" />
            ))}
          </div>
        ) : (groups ?? []).length === 0 ? (
          <div className="py-20 text-center">
            <Users className="h-12 w-12 mx-auto text-brand-brown/20 mb-4" />
            <p className="text-brand-brown/50">등록된 부서가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {(groups ?? []).map((group: any) => (
              <Link key={group.id} href={`/community/departments/${group.slug}`}>
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
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="h-3.5 w-3.5 text-brand-sage" />
                        <h3 className="font-serif font-bold text-brand-brown">{group.name}</h3>
                      </div>
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
