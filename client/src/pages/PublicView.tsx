import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Video as VideoIcon, X, ArrowRight, Calendar, ExternalLink } from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

// colSpan → Tailwind col-span 클래스
const COL_SPAN_CLASS: Record<number, string> = {
  1: "lg:col-span-1",
  2: "lg:col-span-2",
  3: "lg:col-span-3",
};

export default function PublicView() {
  const [floatingMessage, setFloatingMessage] = useState<any>(null);
  const [showFloating, setShowFloating] = useState(false);
  const [popup, setPopup] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);

  const { data: layoutSettings } = useQuery({
    queryKey: ["layout-settings"],
    queryFn: () => api.get<any[]>("/layout-settings"),
  });
  const { data: announcements } = useQuery({
    queryKey: ["announcements", { publishedOnly: true }],
    queryFn: () => api.get<any[]>("/announcements?publishedOnly=true"),
  });
  const { data: images } = useQuery({
    queryKey: ["images", { publishedOnly: true }],
    queryFn: () => api.get<any[]>("/images?publishedOnly=true"),
  });
  const { data: videos } = useQuery({
    queryKey: ["videos", { publishedOnly: true }],
    queryFn: () => api.get<any[]>("/videos?publishedOnly=true"),
  });
  const { data: floatingMessages } = useQuery({
    queryKey: ["floating-messages", { activeOnly: true }],
    queryFn: () => api.get<any[]>("/floating-messages?activeOnly=true"),
  });
  const { data: popups } = useQuery({
    queryKey: ["popups", { activeOnly: true }],
    queryFn: () => api.get<any[]>("/popups?activeOnly=true"),
  });

  useEffect(() => {
    if (floatingMessages && floatingMessages.length > 0) {
      setFloatingMessage(floatingMessages[0]);
      setShowFloating(true);
    }
  }, [floatingMessages]);

  useEffect(() => {
    if (popups && popups.length > 0) {
      setPopup(popups[0]);
      setShowPopup(true);
    }
  }, [popups]);

  const visibleSections = layoutSettings
    ?.filter((s) => s.status === "visible")
    .sort((a, b) => a.displayOrder - b.displayOrder) || [];

  const heroSection = visibleSections.find((s) => s.sectionType === "hero");
  const dataSections = visibleSections.filter((s) => s.sectionType !== "hero");

  // ── 렌더러 ──────────────────────────────────────────────────────────────────

  const renderHero = (section: any) => (
    <section key="hero" className="relative py-32 lg:py-6 overflow-hidden lg:border-b lg:flex-none">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48 lg:hidden" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48 lg:hidden" />
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-6xl md:text-7xl lg:text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60 mb-4 lg:mb-1">
            {section.title || "환영합니다"}
          </h1>
          <p className="text-xl md:text-2xl lg:text-sm text-muted-foreground font-light">
            {section.subtitle || "우아하고 완벽한 정보 관리 시스템"}
          </p>
        </div>
      </div>
    </section>
  );

  const renderSection = (section: any) => {
    switch (section.sectionType) {
      case "announcements":
        if (!announcements || announcements.length === 0) return null;
        return (
          <section key="announcements" id="announcements" className="py-20 lg:py-4 bg-muted/30 lg:bg-transparent">
            <div className="container lg:px-4">
              <div className="text-center mb-16 lg:mb-4">
                <h2 className="text-4xl md:text-5xl lg:text-base font-bold mb-4 lg:mb-0">
                  {section.title || "공지사항"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg lg:text-xs text-muted-foreground">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-6 lg:gap-3 md:grid-cols-2 lg:grid-cols-1 max-w-6xl lg:max-w-none mx-auto">
                {announcements.slice(0, 6).map((item) => (
                  <Link key={item.id} href={`/announcements/${item.id}`}>
                    <Card className="elegant-shadow hover:elegant-shadow-lg transition-all duration-300 h-full hover:translate-y-[-2px] cursor-pointer">
                      <CardHeader className="lg:p-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 lg:p-1.5 bg-primary/10 rounded-lg flex-shrink-0">
                            <FileText className="h-5 w-5 lg:h-3.5 lg:w-3.5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg lg:text-sm line-clamp-1">{item.title}</CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-1 lg:mt-0.5 text-xs">
                              <Calendar className="h-3 w-3" />
                              {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="lg:px-3 lg:pb-3 lg:pt-0">
                        <p className="text-sm lg:text-xs text-muted-foreground line-clamp-2 lg:line-clamp-1 mb-3 lg:mb-1.5">
                          {stripHtml(item.content)}
                        </p>
                        <div className="flex items-center text-primary text-sm lg:text-xs font-medium">
                          자세히 보기 <ArrowRight className="h-4 w-4 lg:h-3 lg:w-3 ml-1.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );

      case "images":
        if (!images || images.length === 0) return null;
        return (
          <section key="images" className="py-20 lg:py-4">
            <div className="container lg:px-4">
              <div className="text-center mb-16 lg:mb-4">
                <h2 className="text-4xl md:text-5xl lg:text-base font-bold mb-4 lg:mb-0">
                  {section.title || "갤러리"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg lg:text-xs text-muted-foreground">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-6 lg:gap-3 md:grid-cols-3 lg:grid-cols-2 max-w-6xl lg:max-w-none mx-auto">
                {images.map((item) => (
                  <Card key={item.id} className="elegant-shadow overflow-hidden group cursor-pointer">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={item.url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    <CardHeader className="p-4 lg:p-2">
                      <CardTitle className="text-sm lg:text-xs line-clamp-1">{item.title}</CardTitle>
                      {item.description && (
                        <CardDescription className="text-xs line-clamp-1">{item.description}</CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );

      case "videos":
        if (!videos || videos.length === 0) return null;
        return (
          <section key="videos" className="py-20 lg:py-4 bg-muted/30 lg:bg-transparent">
            <div className="container lg:px-4">
              <div className="text-center mb-16 lg:mb-4">
                <h2 className="text-4xl md:text-5xl lg:text-base font-bold mb-4 lg:mb-0">
                  {section.title || "영상"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg lg:text-xs text-muted-foreground">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-8 lg:gap-3 md:grid-cols-2 lg:grid-cols-1 max-w-5xl lg:max-w-none mx-auto">
                {videos.map((item) => {
                  const getEmbed = () => {
                    if (item.videoType === "youtube") {
                      const id = item.url.includes("youtu.be")
                        ? item.url.split("/").pop()
                        : new URL(item.url).searchParams.get("v");
                      return `https://www.youtube.com/embed/${id}`;
                    }
                    if (item.videoType === "vimeo") {
                      return `https://player.vimeo.com/video/${item.url.split("/").pop()}`;
                    }
                    return item.url;
                  };
                  return (
                    <Card key={item.id} className="elegant-shadow overflow-hidden group">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {item.videoType === "youtube" || item.videoType === "vimeo" ? (
                          <iframe src={getEmbed()} className="w-full h-full" allowFullScreen title={item.title} />
                        ) : item.thumbnailUrl ? (
                          <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <VideoIcon className="h-16 w-16 lg:h-10 lg:w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardHeader className="lg:p-3">
                        <CardTitle className="lg:text-sm">{item.title}</CardTitle>
                        {item.description && (
                          <CardDescription className="lg:text-xs line-clamp-1">{item.description}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "image_a":
      case "image_b":
        if (!section.imageUrl) return null;
        return (
          <section key={section.sectionType} className="lg:h-full overflow-hidden">
            <img
              src={section.imageUrl}
              alt={section.title || ""}
              className="w-full h-64 lg:h-full object-cover"
            />
          </section>
        );

      default:
        return null;
    }
  };

  const getFloatingPosition = () => {
    switch (floatingMessage?.displayPosition) {
      case "top": return "top-20";
      case "bottom": return "bottom-8";
      default: return "top-1/2 -translate-y-1/2";
    }
  };

  const getFloatingColor = () => {
    switch (floatingMessage?.messageType) {
      case "info":         return "bg-blue-50 border-blue-200 text-blue-900";
      case "warning":      return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "success":      return "bg-green-50 border-green-200 text-green-900";
      case "announcement": return "bg-purple-50 border-purple-200 text-purple-900";
      default:             return "bg-white border-border";
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:flex lg:flex-col bg-background">

      {/* ── 헤더 ── */}
      <div className="flex-none">
        <PublicHeader />
      </div>

      {/* ── 본문 ── */}
      <main className="lg:flex-1 lg:flex lg:flex-col lg:overflow-hidden">

        {heroSection && renderHero(heroSection)}

        {/* 데이터 섹션 그리드 — colSpan은 레이아웃 설정에서 관리 */}
        <div className="lg:grid lg:grid-cols-3 lg:flex-1 lg:overflow-hidden lg:divide-x lg:divide-border">
          {dataSections.map((section) => (
            <div
              key={section.sectionType}
              className={`lg:overflow-y-auto lg:min-w-0 ${COL_SPAN_CLASS[section.colSpan ?? 1] ?? "lg:col-span-1"}`}
            >
              {renderSection(section)}
            </div>
          ))}
        </div>
      </main>

      {/* ── 푸터: 모바일만 ── */}
      <footer className="border-t py-12 mt-20 bg-muted/50 lg:hidden">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div>
              <h3 className="font-semibold mb-3">정보 관리 시스템</h3>
              <p className="text-sm text-muted-foreground">우아하고 완벽한 콘텐츠 관리 플랫폼</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">정보</h3>
              <p className="text-sm text-muted-foreground">최신 콘텐츠를 확인하세요</p>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 정보 관리 시스템. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ── 팝업 모달 ── */}
      {showPopup && popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="relative bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 z-10 h-7 w-7 p-0 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={() => setShowPopup(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            {popup.imageUrl ? (
              popup.linkUrl ? (
                <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShowPopup(false)}>
                  <img src={popup.imageUrl} alt={popup.title} className="w-full object-contain cursor-pointer" />
                </a>
              ) : (
                <img src={popup.imageUrl} alt={popup.title} className="w-full object-contain" />
              )
            ) : null}
            <div className="p-4 flex items-center justify-between gap-3">
              <p className="font-medium text-sm">{popup.title}</p>
              <div className="flex items-center gap-2 flex-shrink-0">
                {popup.linkUrl && (
                  <a
                    href={popup.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                    onClick={() => setShowPopup(false)}
                  >
                    자세히 보기 <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowPopup(false)}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 플로팅 메시지 ── */}
      {showFloating && floatingMessage && (
        <div className={`fixed ${getFloatingPosition()} right-4 z-50 max-w-md w-full mx-auto`}>
          <Card className={`elegant-shadow-lg ${getFloatingColor()} border-2`}>
            <CardHeader className="relative pb-3">
              <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-6 w-6 p-0" onClick={() => setShowFloating(false)}>
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="pr-8">{floatingMessage.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{floatingMessage.content}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
