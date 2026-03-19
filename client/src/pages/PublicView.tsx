import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "wouter";
import {
  FileText,
  Video as VideoIcon,
  X,
  ArrowRight,
  Calendar,
  ExternalLink,
  MapPin,
  Clock,
  UserPlus,
  Youtube,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

// colSpan(12열 기준) → Tailwind col-span 클래스
const COL_SPAN_CLASS: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  12: "lg:col-span-12",
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
  const { data: siteConfigs } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => api.get<any[]>("/site-config"),
    staleTime: 5 * 60 * 1000,
  });
  const cfg = (key: string) =>
    (siteConfigs ?? []).find((c: any) => c.key === key)?.value ?? "";

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
      const currentPopup = popups[0];
      const dontShowUntil = localStorage.getItem(
        `popup_hide_${currentPopup.id}`
      );

      if (!dontShowUntil || new Date().getTime() > parseInt(dontShowUntil)) {
        setPopup(currentPopup);
        setShowPopup(true);
      }
    }
  }, [popups]);

  const handleClosePopup = (dontShowToday: boolean = false) => {
    if (dontShowToday && popup) {
      // 24시간 뒤의 타임스탬프 저장
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem(`popup_hide_${popup.id}`, expiry.toString());
    }
    setShowPopup(false);
  };

  const visibleSections =
    layoutSettings
      ?.filter(s => s.status === "visible")
      .sort((a, b) => a.displayOrder - b.displayOrder) || [];

  const heroSection = visibleSections.find(s => s.sectionType === "hero");
  const dataSections = visibleSections.filter(s => s.sectionType !== "hero");

  // 섹션 → 행 인덱스 매핑 (colSpan 합이 12 되면 다음 행)
  const sectionRowIndex: Record<string, number> = {};
  let rowIdx = 0,
    rowSum = 0;
  for (const s of dataSections) {
    sectionRowIndex[s.sectionType] = rowIdx;
    rowSum += s.colSpan ?? 12;
    if (rowSum >= 12) {
      rowIdx++;
      rowSum = 0;
    }
  }

  const ROW_BG = ["bg-white", "bg-secondary/40"] as const;

  // ── 렌더러 ──────────────────────────────────────────────────────────────────

  const renderHero = (section: any) => (
    <section
      key="hero"
      className="relative py-24 lg:py-32 overflow-hidden bg-white"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_25%)] opacity-[0.03]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--accent-gold)_0%,transparent_25%)] opacity-[0.05]" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold tracking-widest uppercase animate-in fade-in slide-in-from-bottom-2 duration-700">
            Love God, Love Neighbors
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            {section.title || "영신교회에 오신 것을\n환영합니다"}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
            {section.subtitle ||
              "하나님을 사랑하고 이웃을 사랑하는 행복한 공동체"}
          </p>

          {/* 퀵 메뉴 (왕버튼) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {[
              {
                icon: Clock,
                label: "예배 안내",
                color: "bg-primary",
                href: "/church/worship",
                iconUrl: cfg("hero_icon_1_url"),
              },
              {
                icon: MapPin,
                label: "오시는 길",
                color: "bg-accent-gold",
                href: "/church/directions",
                iconUrl: cfg("hero_icon_2_url"),
              },
              {
                icon: UserPlus,
                label: "새가족 안내",
                color: "bg-primary/80",
                href: "/community/new-member",
                iconUrl: cfg("hero_icon_3_url"),
              },
              {
                icon: Youtube,
                label: "온라인 예배",
                color: "bg-red-500",
                href: "/sermons/sunday",
                iconUrl: cfg("hero_icon_4_url"),
              },
            ].map((item, idx) => (
              <Link key={idx} href={item.href}>
                <div className="group cursor-pointer flex flex-col items-center gap-4 p-6 rounded-3xl bg-white border border-border/50 elegant-shadow hover:elegant-shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {item.iconUrl ? (
                      <img
                        src={item.iconUrl}
                        alt={item.label}
                        className="h-14 w-14 object-contain"
                      />
                    ) : (
                      <div
                        className={`p-4 rounded-2xl ${item.color} text-white shadow-lg shadow-current/10`}
                      >
                        <item.icon className="h-8 w-8" />
                      </div>
                    )}
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

  const renderSection = (section: any, rowBg: string) => {
    const span: number = section.colSpan ?? 12;
    const narrow = span <= 4; // ≤ 1/3
    const mid = span <= 6; // ≤ 1/2
    const full = span >= 12;

    // 배경은 section(풀블리드), 콘텐츠는 inner div에서 패딩으로 정렬
    const innerCls = full
      ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      : "px-4 sm:px-6 lg:px-8";

    switch (section.sectionType) {
      case "announcements":
        if (!announcements || announcements.length === 0) return null;
        return (
          <section
            key="announcements"
            id="announcements"
            className={`py-12 lg:py-16 h-full ${rowBg}`}
          >
            <div className={innerCls}>
              {/* 헤더 */}
              <div
                className={`flex items-center justify-between gap-3 ${narrow ? "mb-4" : "mb-8"}`}
              >
                <h2
                  className={`font-bold leading-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}
                >
                  {section.title || "교회 소식"}
                </h2>
                <Link href="/news/announcements">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group text-primary font-bold shrink-0 text-xs"
                  >
                    전체보기{" "}
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* narrow: 컴팩트 리스트 */}
              {narrow && (
                <ul className="divide-y divide-border">
                  {announcements.slice(0, 5).map(item => (
                    <li key={item.id}>
                      <Link href={`/announcements/${item.id}`}>
                        <div className="flex items-center gap-3 py-2.5 group hover:text-primary transition-colors">
                          <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                            {new Date(item.createdAt).toLocaleDateString(
                              "ko-KR",
                              { month: "2-digit", day: "2-digit" }
                            )}
                          </span>
                          <span className="text-sm font-medium line-clamp-1 group-hover:text-primary">
                            {item.title}
                          </span>
                          <ArrowRight className="h-3 w-3 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* mid: 타이틀+날짜 카드, 1열 */}
              {!narrow && mid && (
                <div className="grid gap-2">
                  {announcements.slice(0, 4).map(item => (
                    <Link key={item.id} href={`/announcements/${item.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {stripHtml(item.content)}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* full: 풀 카드, auto-fit (항목 수에 따라 크기 조정) */}
              {!narrow && !mid && (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                  {announcements.slice(0, 6).map(item => (
                    <Link key={item.id} href={`/announcements/${item.id}`}>
                      <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl h-full">
                        <CardHeader className="bg-white pb-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(item.createdAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors line-clamp-1 text-lg">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-white">
                          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-3">
                            {stripHtml(item.content)}
                          </p>
                          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-wider">
                            자세히 보기{" "}
                            <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case "images":
        if (!images || images.length === 0) return null;
        return (
          <section key="images" className={`py-12 lg:py-16 h-full ${rowBg}`}>
            <div className={innerCls}>
              <div
                className={`${full ? "text-center" : ""} mb-6 lg:mb-10 space-y-1`}
              >
                <h2
                  className={`font-bold tracking-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}
                >
                  {section.title || "교회 갤러리"}
                </h2>
                {section.subtitle && !narrow && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {section.subtitle}
                  </p>
                )}
              </div>
              <div
                className={`grid gap-2 ${narrow ? "grid-cols-2" : mid ? "grid-cols-3" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}
              >
                {images.slice(0, narrow ? 4 : mid ? 6 : 8).map(item => (
                  <div
                    key={item.id}
                    className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer border border-border/50 elegant-shadow"
                  >
                    <img
                      src={item.url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                      <p className="text-white font-bold text-xs line-clamp-1">
                        {item.title}
                      </p>
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
          <section key="videos" className={`py-12 lg:py-16 h-full ${rowBg}`}>
            <div className={innerCls}>
              <div
                className={`${full ? "text-center" : ""} mb-6 lg:mb-10 space-y-1`}
              >
                <h2
                  className={`font-bold tracking-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}
                >
                  {section.title || "최신 설교"}
                </h2>
                {section.subtitle && !narrow && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {section.subtitle}
                  </p>
                )}
              </div>
              <div className={full ? "max-w-2xl mx-auto w-full" : "w-full"}>
                {videos.slice(0, 1).map(item => {
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
                    <div key={item.id} className="space-y-3">
                      <div
                        className={`aspect-video overflow-hidden shadow-xl ring-1 ring-black/10 ${narrow ? "rounded-xl" : "rounded-2xl"}`}
                      >
                        <iframe
                          src={getEmbed()}
                          className="w-full h-full"
                          allowFullScreen
                          title={item.title}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3
                          className={`font-bold ${narrow ? "text-base" : "text-xl"}`}
                        >
                          {item.title}
                        </h3>
                        {item.description && !narrow && (
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {item.description}
                          </p>
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
          <section
            key={section.sectionType}
            className={`py-8 lg:py-12 h-full ${rowBg}`}
          >
            <div className={innerCls}>
              <img
                src={section.imageUrl}
                alt={section.title || ""}
                className={`w-full object-contain shadow-lg ${narrow ? "rounded-xl" : "rounded-2xl"}`}
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
      case "top":
        return "top-20";
      case "bottom":
        return "bottom-8";
      default:
        return "top-1/2 -translate-y-1/2";
    }
  };

  const getFloatingColor = () => {
    switch (floatingMessage?.messageType) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "announcement":
        return "bg-purple-50 border-purple-200 text-purple-900";
      default:
        return "bg-white border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader />

      <main>
        {heroSection && renderHero(heroSection)}

        {/* 데이터 섹션 그리드 - 12열 기준 colSpan */}
        <div className="grid lg:grid-cols-12">
          {dataSections.map((section, idx) => {
            const rowBg = ROW_BG[sectionRowIndex[section.sectionType] % 2];
            const content = renderSection(section, rowBg);
            if (!content) return null;
            const prevSection = dataSections[idx - 1];
            const isFirstInRow =
              !prevSection ||
              sectionRowIndex[prevSection.sectionType] !== sectionRowIndex[section.sectionType];
            return (
              <div
                key={section.sectionType}
                className={`${COL_SPAN_CLASS[section.colSpan] ?? "lg:col-span-12"} ${!isFirstInRow ? "lg:border-l border-border/30" : ""}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="bg-white border-t py-20">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6 col-span-1 lg:col-span-2">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">
                  영신교회
                </span>
                <span className="text-sm font-medium text-muted-foreground tracking-tighter">
                  하나님사랑 이웃사랑
                </span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                영신교회는 하나님을 향한 뜨거운 예배와 이웃을 향한 따뜻한 섬김이
                있는 행복한 공동체입니다.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-lg">교회 안내</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li>
                  <Link href="/church/about">교회 소개</Link>
                </li>
                <li>
                  <Link href="/church/worship">예배 안내</Link>
                </li>
                <li>
                  <Link href="/church/directions">오시는 길</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-lg">연락처</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> 주소: 경기도 어디시 무엇동 123
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> 전화: 02-123-4567
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
            <p>© 2026 영신교회. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/admin">관리자 로그인</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* 팝업 모달 */}
      {showPopup && popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => handleClosePopup()}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 z-10 h-8 w-8 p-0 bg-black/10 hover:bg-black/20 rounded-full"
              onClick={() => handleClosePopup()}
            >
              <X className="h-4 w-4" />
            </Button>
            {popup.imageUrl &&
              (popup.linkUrl ? (
                <a
                  href={popup.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClosePopup()}
                >
                  <img
                    src={popup.imageUrl}
                    alt={popup.title}
                    className="w-full object-contain cursor-pointer"
                  />
                </a>
              ) : (
                <img
                  src={popup.imageUrl}
                  alt={popup.title}
                  className="w-full object-contain"
                />
              ))}
            <div className="p-6 flex items-center justify-between gap-4 bg-white border-t">
              <div className="flex flex-col gap-1">
                <p className="font-bold">{popup.title}</p>
                <button
                  className="text-xs text-muted-foreground hover:text-primary transition-colors text-left font-medium"
                  onClick={() => handleClosePopup(true)}
                >
                  오늘 하루 보지 않기
                </button>
              </div>
              <div className="flex items-center gap-4">
                {popup.linkUrl && (
                  <a
                    href={popup.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                    onClick={() => handleClosePopup()}
                  >
                    자세히 보기 <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleClosePopup()}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 플로팅 메시지 */}
      {showFloating && floatingMessage && (
        <div
          className={`fixed ${getFloatingPosition()} right-4 z-50 max-w-sm w-full animate-in slide-in-from-right duration-500`}
        >
          <Card
            className={`shadow-2xl border-none rounded-2xl overflow-hidden ${getFloatingColor()}`}
          >
            <div className="p-5 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-black/5"
                onClick={() => setShowFloating(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <h4 className="font-bold pr-6">{floatingMessage.title}</h4>
                <p className="text-sm leading-relaxed">
                  {floatingMessage.content}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
