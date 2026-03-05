import PublicPageLayout from "@/components/PublicPageLayout";
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

  const address    = getConfig("map_address") || "서울특별시 양천구 목동로 19길 28";
  const embedUrl   = getConfig("map_embed_url");
  const searchUrl  = `https://map.kakao.com/link/search/${encodeURIComponent(address)}`;

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">오시는 길</h1>
        <p className="text-muted-foreground text-lg mb-10">영신교회 위치를 안내해 드립니다</p>

        {/* 주소 */}
        <div className="flex items-start gap-3 mb-8 p-5 border rounded-xl bg-muted/30">
          <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">{address}</p>
            <a
              href={searchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-2 text-sm text-primary hover:underline"
            >
              카카오맵에서 보기 <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* 지도 영역 */}
        <div className="border rounded-xl overflow-hidden bg-muted mb-10 aspect-video flex items-center justify-center">
          {embedUrl ? (
            <iframe src={embedUrl} className="w-full h-full" title="교회 위치 지도" />
          ) : (
            <div className="text-center p-8">
              <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-3">지도 임베드 URL이 설정되지 않았습니다</p>
              <a
                href={searchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                카카오맵에서 찾기 <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>

        {/* 교통편 */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="p-5 border rounded-xl">
            <div className="flex items-center gap-2 mb-3 font-semibold">
              <Train className="h-4 w-4 text-primary" /> 지하철
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>5호선 목동역 2번 출구 도보 10분</li>
              <li>2호선 합정역 환승 후 5호선 이용</li>
            </ul>
          </div>
          <div className="p-5 border rounded-xl">
            <div className="flex items-center gap-2 mb-3 font-semibold">
              <Bus className="h-4 w-4 text-primary" /> 버스
            </div>
            <ul className="text-sm text-muted-foreground space-y-1.5">
              <li>목동로 정류장 하차</li>
              <li>6614, 6630, 양천01 이용</li>
            </ul>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
