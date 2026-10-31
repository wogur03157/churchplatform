import PublicPageLayout from "@/components/PublicPageLayout";
import ChurchNavigation from "@/components/ChurchNavigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MapPin, ExternalLink, Bus, Train } from "lucide-react";

export default function ChurchDirections() {
  const { data: siteConfig } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => api.get<any[]>("/site-config"),
    staleTime: 5 * 60 * 1000,
  });

  const getConfig = (key: string) =>
    siteConfig?.find((c: any) => c.key === key)?.value ?? "";

  const address   = getConfig("map_address") || "서울특별시 양천구 목동로 19길 28";
  const embedUrl  = getConfig("map_embed_url");
  const searchUrl = `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;

  return (
    <PublicPageLayout>
      <ChurchNavigation />
      {/* Page header */}
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">DIRECTIONS</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">오시는 길</h1>
          <p className="text-brand-brown/60 text-lg">영신교회 위치를 안내해 드립니다</p>
        </div>
      </div>

      <div className="container py-14 max-w-4xl">
        {/* 주소 */}
        <div className="flex items-start gap-4 mb-8 p-5 rounded-2xl bg-white shadow-sm border border-brand-gold/20">
          <div className="w-10 h-10 rounded-full bg-brand-sage/10 flex items-center justify-center shrink-0">
            <MapPin className="h-5 w-5 text-brand-sage" />
          </div>
          <div>
            <p className="font-semibold text-brand-brown">{address}</p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-brand-sage hover:text-brand-sage/80 font-medium transition-colors"
            >
              카카오맵에서 보기 <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 지도 */}
        <div className="rounded-2xl overflow-hidden border border-brand-gold/20 bg-brand-cream/30 mb-10 aspect-video flex items-center justify-center">
          {embedUrl ? (
            <iframe src={embedUrl} className="w-full h-full" title="교회 위치 지도" />
          ) : (
            <div className="text-center p-8">
              <MapPin className="h-12 w-12 mx-auto text-brand-brown/25 mb-4" />
              <p className="text-brand-brown/50 mb-4 text-sm">지도 임베드 URL이 설정되지 않았습니다</p>
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-brown text-brand-cream rounded-full text-sm font-medium hover:bg-brand-brown/90 transition-colors"
              >
                카카오맵에서 찾기 <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>

        {/* 교통편 */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-brand-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-sage/10 flex items-center justify-center">
                <Train className="h-4 w-4 text-brand-sage" />
              </div>
              <h3 className="font-serif font-bold text-brand-brown">지하철</h3>
            </div>
            <ul className="text-sm text-brand-brown/65 space-y-2">
              <li>5호선 목동역 2번 출구 도보 10분</li>
              <li>2호선 합정역 환승 후 5호선 이용</li>
            </ul>
          </div>
          <div className="p-6 rounded-2xl bg-white shadow-sm border border-brand-gold/20">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-full bg-brand-gold/20 flex items-center justify-center">
                <Bus className="h-4 w-4 text-brand-brown/70" />
              </div>
              <h3 className="font-serif font-bold text-brand-brown">버스</h3>
            </div>
            <ul className="text-sm text-brand-brown/65 space-y-2">
              <li>목동로 정류장 하차</li>
              <li>6614, 6630, 양천01 이용</li>
            </ul>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
