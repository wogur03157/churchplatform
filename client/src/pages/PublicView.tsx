import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Video as VideoIcon, X, ArrowRight, Calendar, ExternalLink, MapPin, Clock, UserPlus, Youtube } from "lucide-react";
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
    <section key="hero" className="relative py-24 lg:py-32 overflow-hidden bg-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_25%)] opacity-[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--accent-gold)_0%,transparent_25%)] opacity-[0.05]" />
      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold tracking-widest uppercase animate-in fade-in slide-in-from-bottom-2 duration-700">
            Love God, Love Neighbors
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {section.title || "영광교회에 오신 것을\n환영합니다"}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            {section.subtitle || "하나님을 사랑하고 이웃을 사랑하는 행복한 공동체"}
          </p>
          
          {/* 퀵 메뉴 (왕버튼) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {[
              { icon: Clock, label: "예배 안내", color: "bg-primary", href: "/church/worship" },
              { icon: MapPin, label: "오시는 길", color: "bg-accent-gold", href: "/church/directions" },
              { icon: UserPlus, label: "새가족 안내", color: "bg-primary/80", href: "/community/new-member" },
              { icon: Youtube, label: "온라인 예배", color: "bg-red-500", href: "/sermons/sunday" },
            ].map((item, idx) => (
              <Link key={idx} href={item.href}>
                <div className="group cursor-pointer flex flex-col items-center gap-4 p-6 rounded-3xl bg-white border border-border/50 elegant-shadow hover:elegant-shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className={`p-4 rounded-2xl ${item.color} text-white group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-current/10`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <span className="font-bold text-lg">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderSection = (section: any) => {
    switch (section.sectionType) {
      case "announcements":
        if (!announcements || announcements.length === 0) return null;
        return (
          <section key="announcements" id="announcements" className="py-20 bg-secondary/30">
            <div className="container">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-bold">
                    {section.title || "교회 소식"}
                  </h2>
                  {section.subtitle && (
                    <p className="text-lg text-muted-foreground">{section.subtitle}</p>
                  )}
                </div>
                <Link href="/news/announcements">
                  <Button variant="ghost" className="group text-primary font-bold">
                    전체보기 <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {announcements.slice(0, 6).map((item) => (
                  <Link key={item.id} href={`/announcements/${item.id}`}>
                    <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl">
                      <CardHeader className="bg-white pb-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-primary mb-3">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-1">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="bg-white">
                        <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-4">
                          {stripHtml(item.content)}
                        </p>
                        <div className="flex items-center text-primary text-xs font-bold uppercase tracking-wider">
                          자세히 보기 <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
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
          <section key="images" className="py-20">
            <div className="container">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {section.title || "교회 갤러리"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
                {images.map((item) => (
                  <div key={item.id} className="aspect-square relative overflow-hidden rounded-2xl group cursor-pointer border border-border/50 elegant-shadow">
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <p className="text-white font-bold text-sm line-clamp-1">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "videos":
        if (!videos || videos.length === 0) return null;
        return (
          <section key="videos" className="py-20 bg-primary text-primary-foreground">
            <div className="container">
              <div className="text-center space-y-4 mb-16">
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                  {section.title || "최신 설교"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-primary-foreground/70 max-w-2xl mx-auto">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
                {videos.slice(0, 2).map((item) => {
                  const getEmbed = () => {
                    if (item.videoType === "youtube") {
                      const id = item.url.includes("youtu.be")
                        ? item.url.split("/").pop()
                        : new URL(item.url).searchParams.get("v");
                      return `https://www.youtube.com/embed/${id}`;
                    }
                    return item.url;
                  };
                  return (
                    <div key={item.id} className="space-y-6">
                      <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl border-4 border-white/10">
                        <iframe src={getEmbed()} className="w-full h-full" allowFullScreen title={item.title} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold">{item.title}</h3>
                        {item.description && (
                          <p className="text-primary-foreground/70 line-clamp-2">{item.description}</p>
                        )}
                      </div>
                    </div>
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
          <section key={section.sectionType} className="py-12">
            <div className="container">
              <img
                src={section.imageUrl}
                alt={section.title || ""}
                className="w-full h-[400px] object-cover rounded-[2rem] shadow-xl"
              />
            </div>
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
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {heroSection && renderHero(heroSection)}

        {/* 데이터 섹션 그리드 - 세로 배치를 기본으로 트렌디하게 변경 */}
        <div className="flex flex-col">
          {dataSections.map((section) => renderSection(section))}
        </div>
      </main>

      <footer className="bg-white border-t py-20">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6 col-span-1 lg:col-span-2">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">영광교회</span>
                <span className="text-sm font-medium text-muted-foreground tracking-tighter">하나님사랑 이웃사랑</span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                영광교회는 하나님을 향한 뜨거운 예배와 이웃을 향한 따뜻한 섬김이 있는 행복한 공동체입니다.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-lg">교회 안내</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="/church/about">교회 소개</Link></li>
                <li><Link href="/church/worship">예배 안내</Link></li>
                <li><Link href="/church/directions">오시는 길</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-lg">연락처</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> 주소: 경기도 어디시 무엇동 123</li>
                <li className="flex items-center gap-2"><Clock className="h-4 w-4" /> 전화: 02-123-4567</li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
            <p>© 2026 영광교회. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/admin">관리자 로그인</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* 팝업 모달 */}
      {showPopup && popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPopup(false)}>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300" onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="sm" className="absolute right-4 top-4 z-10 h-8 w-8 p-0 bg-black/10 hover:bg-black/20 rounded-full" onClick={() => setShowPopup(false)}>
              <X className="h-4 w-4" />
            </Button>
            {popup.imageUrl && (
              popup.linkUrl ? (
                <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" onClick={() => setShowPopup(false)}>
                  <img src={popup.imageUrl} alt={popup.title} className="w-full object-contain cursor-pointer" />
                </a>
              ) : (
                <img src={popup.imageUrl} alt={popup.title} className="w-full object-contain" />
              )
            )}
            <div className="p-6 flex items-center justify-between gap-4 bg-white border-t">
              <p className="font-bold">{popup.title}</p>
              <div className="flex items-center gap-4">
                {popup.linkUrl && (
                  <a href={popup.linkUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-primary hover:underline flex items-center gap-1" onClick={() => setShowPopup(false)}>
                    자세히 보기 <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors" onClick={() => setShowPopup(false)}>닫기</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 메시지 */}
      {showFloating && floatingMessage && (
        <div className={`fixed ${getFloatingPosition()} right-4 z-50 max-w-sm w-full animate-in slide-in-from-right duration-500`}>
          <Card className={`shadow-2xl border-none rounded-2xl overflow-hidden ${getFloatingColor()}`}>
            <div className="p-5 relative">
              <Button variant="ghost" size="sm" className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-black/5" onClick={() => setShowFloating(false)}>
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <h4 className="font-bold pr-6">{floatingMessage.title}</h4>
                <p className="text-sm leading-relaxed">{floatingMessage.content}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
