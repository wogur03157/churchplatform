import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Image as ImageIcon } from "lucide-react";

export default function MinistryBoard() {
  const { data: images, isLoading } = useQuery({
    queryKey: ["images", { publishedOnly: true }],
    queryFn: () => api.get<any[]>("/images?publishedOnly=true"),
  });

  return (
    <PublicPageLayout>
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">MINISTRY</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">사역게시판</h1>
          <p className="text-brand-brown/60 text-lg">영신교회 사역 현장을 나눕니다</p>
        </div>
      </div>

      <div className="container py-12 max-w-5xl">
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-2xl bg-brand-cream animate-pulse" />
            ))}
          </div>
        ) : (images ?? []).length === 0 ? (
          <div className="py-20 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-brand-brown/20 mb-4" />
            <p className="text-brand-brown/50">등록된 사역 이미지가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {(images ?? []).map((item: any) => (
              <div key={item.id} className="group rounded-2xl overflow-hidden bg-white shadow-sm border border-brand-gold/20">
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-brand-brown/0 group-hover:bg-brand-brown/15 transition-colors duration-300" />
                </div>
                {(item.title || item.description) && (
                  <div className="px-4 py-3">
                    {item.title && <p className="font-serif font-semibold text-brand-brown text-sm line-clamp-1">{item.title}</p>}
                    {item.description && <p className="text-xs text-brand-brown/55 line-clamp-1 mt-0.5">{item.description}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
