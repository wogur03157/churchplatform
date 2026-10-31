import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
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
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">NEWS</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">공지사항</h1>
          <p className="text-brand-brown/60 text-lg">영신교회 공지사항입니다</p>
        </div>
      </div>

      <div className="container py-12 max-w-4xl">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-brand-cream animate-pulse" />)}
          </div>
        ) : (announcements ?? []).length === 0 ? (
          <div className="py-20 text-center">
            <FileText className="h-12 w-12 mx-auto text-brand-brown/20 mb-4" />
            <p className="text-brand-brown/50">등록된 공지사항이 없습니다.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {(announcements ?? []).map((item: any) => (
              <Link key={item.id} href={`/announcements/${item.id}`}>
                <a className="group flex items-start gap-4 p-5 rounded-2xl bg-white shadow-sm border border-brand-gold/20 hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-brand-cream border border-brand-gold/30 flex items-center justify-center shrink-0">
                    <FileText className="h-4 w-4 text-brand-sage" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-semibold text-brand-brown line-clamp-1 mb-1">{item.title}</h3>
                    <p className="text-sm text-brand-brown/55 line-clamp-2 mb-2">{stripHtml(item.content)}</p>
                    <div className="flex items-center gap-3 text-xs text-brand-brown/45">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-brand-sage/60 shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform" />
                </a>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
