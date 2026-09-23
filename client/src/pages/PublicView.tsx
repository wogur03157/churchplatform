import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  X,
  ExternalLink,
  MapPin,
  Clock,
  UserPlus,
  Youtube,
  ChevronLeft,
  ChevronRight,
  Church,
  MonitorPlay,
  Copy,
  Check,
  Heart,
  Wind,
  Leaf,
  Phone,
  Instagram,
  Facebook,
  MessageSquare,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PublicHeader from "@/components/PublicHeader";
import QuickActionFab from "@/components/QuickActionFab";
import FontSizePicker from "@/components/FontSizePicker";
import VideoModal from "@/components/home/VideoModal";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getYoutubeEmbed(url: string): string {
  try {
    if (url.includes("youtu.be")) {
      return `https://www.youtube.com/embed/${url.split("/").pop()}`;
    }
    const v = new URL(url).searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
  } catch {
    // ignore
  }
  return url;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
}

// ─── Hero Carousel ─────────────────────────────────────────────────────────────

function HeroCarousel({
  slides,
  onLinkAction,
}: {
  slides: any[];
  onLinkAction?: (link: string) => void;
}) {
  // bgIdx: 배경 이미지 인덱스 (crossfade 즉시 시작)
  // textIdx: 텍스트 콘텐츠 인덱스 (exit 후 교체)
  const [bgIdx, setBgIdx] = useState(0);
  const [textIdx, setTextIdx] = useState(0);
  const [isExiting, setIsExiting] = useState(false);
  const lockedRef = useRef(false);

  const navigate = useCallback(
    (nextIdx: number, _dir?: "right" | "left") => {
      if (lockedRef.current || nextIdx === bgIdx) return;
      lockedRef.current = true;
      setBgIdx(nextIdx);
      setIsExiting(true);

      setTimeout(() => {
        setTextIdx(nextIdx);
        setIsExiting(false);
        setTimeout(() => {
          lockedRef.current = false;
        }, 900);
      }, 380);
    },
    [bgIdx]
  );

  const prev = useCallback(() => {
    navigate((bgIdx - 1 + slides.length) % slides.length, "left");
  }, [bgIdx, slides.length, navigate]);

  const next = useCallback(() => {
    navigate((bgIdx + 1) % slides.length, "right");
  }, [bgIdx, slides.length, navigate]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setInterval(next, 6000);
    return () => clearInterval(id);
  }, [next, slides.length]);

  const slide = slides[textIdx];
  const isTextType = slide.type === "text";

  return (
    <>
      <style>{`
        @keyframes heroEnterUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes heroImgScale {
          from { transform: scale(1.06); }
          to   { transform: scale(1.0);  }
        }
      `}</style>

      <div className="relative h-screen overflow-hidden">
        {/* ── 배경 레이어 (crossfade + Ken Burns scale) ── */}
        {slides.map((s, i) => (
          <div
            key={s.id ?? i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === bgIdx ? 1 : 0 }}
          >
            {s.type === "text" ? (
              <div className="absolute inset-0 bg-[var(--color-brand-cream)]" />
            ) : (
              <>
                {s.imageUrl && (
                  <img
                    key={i === bgIdx ? `active-${bgIdx}` : `idle-${i}`}
                    src={s.imageUrl}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover brightness-75"
                    style={
                      i === bgIdx
                        ? { animation: "heroImgScale 8s ease-out both" }
                        : undefined
                    }
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-brand-brown)]/40 via-transparent to-[var(--color-brand-cream)]" />
              </>
            )}
          </div>
        ))}

        {/* ── 텍스트 레이어 (상하 애니메이션) ── */}
        <div
          key={textIdx}
          className="absolute inset-0 z-10 flex items-center justify-center"
          style={
            isExiting
              ? {
                  opacity: 0,
                  transform: "translateY(-25px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                }
              : { animation: "heroEnterUp 0.8s ease-out both" }
          }
        >
          <div className="text-center px-6 max-w-4xl w-full mx-auto">
            {isTextType ? (
              /* 텍스트 전용 슬라이드 */
              <>
                {slide.subtitle && (
                  <p className="text-[var(--color-brand-sage)] text-sm md:text-base font-medium tracking-[0.2em] mb-3">
                    {slide.subtitle}
                  </p>
                )}
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[var(--color-brand-brown)] leading-[1.15] whitespace-pre-line mb-5">
                  {slide.title || "영신교회에 오신 것을 환영합니다"}
                </h1>
                {slide.description && (
                  <p className="text-[var(--color-brand-brown)]/70 text-sm md:text-base lg:text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed whitespace-pre-line">
                    {slide.description}
                  </p>
                )}
                {(slide.primaryButtonText || slide.secondaryButtonText) && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    {slide.primaryButtonText && (
                      <button
                        onClick={() =>
                          onLinkAction?.(slide.primaryButtonLink ?? "")
                        }
                        className="bg-[var(--color-brand-gold)] text-[var(--color-brand-brown)] px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition-all shadow-xl hover:-translate-y-1 cursor-pointer"
                      >
                        {slide.primaryButtonText}
                      </button>
                    )}
                    {slide.secondaryButtonText && (
                      <button
                        onClick={() =>
                          onLinkAction?.(slide.secondaryButtonLink ?? "")
                        }
                        className="px-6 py-3 rounded-full text-sm font-medium transition-all border border-[var(--color-brand-brown)]/30 text-[var(--color-brand-brown)] hover:bg-[var(--color-brand-brown)]/10 cursor-pointer"
                      >
                        {slide.secondaryButtonText}
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* 이미지 슬라이드 */
              <>
                {slide.subtitle && (
                  <p className="text-[var(--color-brand-gold)] text-sm md:text-base font-medium tracking-[0.2em] mb-3 drop-shadow-md">
                    {slide.subtitle}
                  </p>
                )}
                {slide.title && (
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-white leading-[1.15] mb-5 drop-shadow-lg whitespace-pre-line">
                    {slide.title}
                  </h1>
                )}
                {slide.description && (
                  <p className="text-white/90 text-sm md:text-base lg:text-lg font-light max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-md whitespace-pre-line">
                    {slide.description}
                  </p>
                )}
                {(slide.primaryButtonText || slide.secondaryButtonText) && (
                  <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                    {slide.primaryButtonText && (
                      <button
                        onClick={() =>
                          onLinkAction?.(slide.primaryButtonLink ?? "")
                        }
                        className="bg-[var(--color-brand-gold)] text-[var(--color-brand-brown)] px-6 py-3 rounded-full text-sm font-medium hover:bg-white transition-all shadow-xl hover:-translate-y-1 cursor-pointer"
                      >
                        {slide.primaryButtonText}
                      </button>
                    )}
                    {slide.secondaryButtonText && (
                      <button
                        onClick={() =>
                          onLinkAction?.(slide.secondaryButtonLink ?? "")
                        }
                        className="px-6 py-3 rounded-full text-sm font-medium transition-all border border-white/50 text-white hover:bg-white/10 backdrop-blur-sm cursor-pointer"
                      >
                        {slide.secondaryButtonText}
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* ── 좌우 화살표 ── */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/15 hover:bg-black/45 border border-white/10 hover:border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
              aria-label="이전"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-black/15 hover:bg-black/45 border border-white/10 hover:border-white/20 flex items-center justify-center text-white transition-all hover:scale-105 cursor-pointer"
              aria-label="다음"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </>
        )}

        {/* ── 점 인디케이터 ── */}
        {slides.length > 1 && (
          <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2.5 z-20">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => navigate(i, i > bgIdx ? "right" : "left")}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  i === bgIdx
                    ? "bg-[var(--color-brand-gold)] w-8"
                    : "bg-white/40 w-2 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}

        {/* ── 하단 장식 곡선 ── */}
        <div className="absolute bottom-0 left-0 w-full h-16 bg-[var(--color-brand-cream)] curve-top z-10" />
      </div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function PublicView() {
  const [popup, setPopup] = useState<any>(null);
  const [floatingMessage, setFloatingMessage] = useState<any>(null);
  const [activeVideo, setActiveVideo] = useState<{
    title: string;
    embedUrl: string;
  } | null>(null);
  const [isPrayerModalOpen, setIsPrayerModalOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [prayerName, setPrayerName] = useState("");
  const [prayerContact, setPrayerContact] = useState("");
  const [prayerTopic, setPrayerTopic] = useState("영적 성장 및 믿음");
  const [prayerContent, setPrayerContent] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeCoreValue, setActiveCoreValue] = useState(0);
  const [nextGenIndex, setNextGenIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [currentHash, setCurrentHash] = useState(
    typeof window !== "undefined" ? window.location.hash : ""
  );

  // ─ window listeners
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
      const match = window.location.hash.match(/^#nextgen\/(\d+)/);
      if (match) window.scrollTo({ top: 0, behavior: "instant" });
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    if (activeVideo || isPrayerModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeVideo, isPrayerModalOpen]);

  // ─ carousel
  const visibleCount = windowWidth < 640 ? 1 : windowWidth < 1024 ? 2 : 3;
  const maxNextGenIndex = (nextGenItemsLength: number) =>
    Math.max(0, nextGenItemsLength - visibleCount);

  // ─ data
  const { data: homeData } = useQuery({
    queryKey: ["public", "home-data"],
    queryFn: () => api.get<any>("/public/home-data"),
    staleTime: 60 * 1000,
  });

  const { data: ministryItems = [] } = useQuery<any[]>({
    queryKey: ["home-ministry"],
    queryFn: () => api.get("/home-ministry"),
    staleTime: 60 * 1000,
  });

  const { data: nextGenItems = [] } = useQuery<any[]>({
    queryKey: ["home-next-gen"],
    queryFn: () => api.get("/home-next-gen"),
    staleTime: 60 * 1000,
  });

  const { data: canaanData } = useQuery<any>({
    queryKey: ["home-canaan"],
    queryFn: () => api.get("/home-canaan"),
    staleTime: 60 * 1000,
  });

  const { data: worshipSchedule = [] } = useQuery<any[]>({
    queryKey: ["home-worship"],
    queryFn: () => api.get("/home-worship"),
    staleTime: 60 * 1000,
  });

  const { data: sundayVideos = [] } = useQuery<any[]>({
    queryKey: ["videos", "sunday"],
    queryFn: () => api.get("/videos?category=sunday&publishedOnly=true"),
    staleTime: 60 * 1000,
  });

  const { data: fridayVideos = [] } = useQuery<any[]>({
    queryKey: ["videos", "friday"],
    queryFn: () => api.get("/videos?category=friday&publishedOnly=true"),
    staleTime: 60 * 1000,
  });

  const siteConfigs: any[] = homeData?.siteConfigs ?? [];
  const heroSlides: any[] = homeData?.heroSlides ?? [];
  const categoryForest: any[] = homeData?.categoryForest ?? [];
  const popups: any[] = homeData?.popups ?? [];
  const floatingMessages: any[] = homeData?.floatingMessages ?? [];

  const cfg = (key: string) =>
    siteConfigs.find((c: any) => c.key === key)?.value ?? "";

  useEffect(() => {
    if (floatingMessages?.length > 0) setFloatingMessage(floatingMessages[0]);
  }, [floatingMessages]);

  useEffect(() => {
    if (popups?.length > 0) {
      const current = popups[0];
      const until = localStorage.getItem(`popup_hide_${current.id}`);
      if (!until || Date.now() > parseInt(until)) setPopup(current);
    }
  }, [popups]);

  const handleClosePopup = (dontShowToday = false) => {
    if (dontShowToday && popup) {
      localStorage.setItem(
        `popup_hide_${popup.id}`,
        (Date.now() + 86400000).toString()
      );
    }
    setPopup(null);
  };

  const handleCopyAddress = () => {
    const address = cfg("map_address") || "서울특별시 양천구 목동로 19길 28";
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setPrayerName("");
    setPrayerContact("");
    setPrayerTopic("영적 성장 및 믿음");
    setPrayerContent("");
  };

  // ─ next gen subpage
  const nextGenSubpageMatch = currentHash.match(/^#nextgen\/(\d+)/);
  const nextGenSubpageId = nextGenSubpageMatch
    ? parseInt(nextGenSubpageMatch[1], 10)
    : null;
  const isNextGenActive =
    nextGenSubpageId !== null &&
    nextGenSubpageId >= 0 &&
    nextGenSubpageId < nextGenItems.length;

  // ─ Next Gen subpage render
  if (isNextGenActive && nextGenItems.length > 0) {
    const item = nextGenItems[nextGenSubpageId!];

    return (
      <div className="min-h-screen bg-[var(--color-brand-cream)]/40 font-sans pb-16">
        <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md py-4 border-b border-[var(--color-brand-gold)]/15">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <button
              onClick={() => {
                window.location.hash = "";
              }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <span className="font-serif text-lg font-semibold tracking-tight text-[var(--color-brand-brown)]">
                영신교회 다음세대
              </span>
              <span className="text-xs text-[var(--color-brand-sage)] font-medium">
                {item.title}
              </span>
            </button>
            <button
              onClick={() => {
                window.location.hash = "#다음세대";
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[var(--color-brand-gold)]/20 text-[var(--color-brand-brown)] hover:bg-[var(--color-brand-brown)] hover:text-white transition-all text-sm font-medium cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>메인 홈으로</span>
            </button>
          </div>
        </nav>

        <div className="pt-[72px]">
          <div className="relative h-[45vh] md:h-[50vh] w-full overflow-hidden">
            {item.imageUrl && (
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover brightness-[0.7]"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
              <div className="max-w-7xl mx-auto w-full px-6 pb-8 md:pb-12 text-left">
                {item.subtitle && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[var(--color-brand-sage)] text-white text-[11px] font-bold tracking-wider mb-2">
                    {item.subtitle}
                  </span>
                )}
                <h1 className="text-3xl md:text-5xl font-serif text-white font-bold leading-tight mb-2">
                  {item.title}
                </h1>
                <p className="text-white/85 text-xs md:text-sm font-light max-w-2xl leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-8 md:mt-12">
          <button
            onClick={() => {
              window.location.hash = "#다음세대";
            }}
            className="text-[var(--color-brand-sage)] hover:text-[var(--color-brand-brown)] text-sm font-medium inline-flex items-center gap-1 mb-6 cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>이전 페이지로 돌아가기</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 space-y-6">
              {item.motto && (
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[var(--color-brand-gold)]/15 shadow-sm">
                  <span className="inline-block p-2 rounded-full bg-[var(--color-brand-sage)]/10 text-[var(--color-brand-sage)] mb-4">
                    <Sparkles className="w-5 h-5" />
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[var(--color-brand-brown)] mb-3">
                    부서 비전 및 주제
                  </h3>
                  <blockquote className="border-l-4 border-[var(--color-brand-sage)]/60 pl-3 text-sm text-[var(--color-brand-brown)]/80 italic leading-relaxed">
                    "{item.motto}"
                  </blockquote>
                </div>
              )}
              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[var(--color-brand-gold)]/15 shadow-sm">
                <span className="inline-block p-2 rounded-full bg-[var(--color-brand-gold)]/10 text-[var(--color-brand-gold)] mb-4">
                  <Clock className="w-5 h-5" />
                </span>
                <h3 className="font-serif text-xl font-bold text-[var(--color-brand-brown)] mb-4">
                  모임안내
                </h3>
                <div className="space-y-3 text-sm">
                  {[
                    {
                      label: "대상",
                      value: item.targetAge,
                      color:
                        "text-[var(--color-brand-sage)] bg-[var(--color-brand-sage)]/10",
                    },
                    {
                      label: "시간",
                      value: item.worshipTime,
                      color:
                        "text-[var(--color-brand-gold)] bg-[var(--color-brand-gold)]/10",
                    },
                    {
                      label: "장소",
                      value: item.location,
                      color:
                        "text-[var(--color-brand-brown)] bg-[var(--color-brand-brown)]/10",
                    },
                    {
                      label: "담당",
                      value: item.staffInfo,
                      color:
                        "text-[var(--color-brand-sage)]/80 bg-[var(--color-brand-sage)]/5",
                    },
                  ].map(({ label, value, color }) =>
                    value ? (
                      <div key={label} className="flex items-start gap-2.5">
                        <span
                          className={`w-12 shrink-0 text-xs font-semibold uppercase tracking-wider ${color} px-2 py-0.5 rounded text-center`}
                        >
                          {label}
                        </span>
                        <span className="text-[var(--color-brand-brown)]/80">
                          {value}
                        </span>
                      </div>
                    ) : null
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
              {Array.isArray(item.scheduleJson) &&
                item.scheduleJson.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[var(--color-brand-gold)]/15 shadow-sm">
                    <h3 className="font-serif text-xl font-bold text-[var(--color-brand-brown)] mb-6 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--color-brand-sage)]" />
                      <span>주일 예배 순서 및 프로그램</span>
                    </h3>
                    <div className="space-y-4">
                      {item.scheduleJson.map((step: any, sIdx: number) => (
                        <div
                          key={sIdx}
                          className="flex gap-4 p-4 rounded-2xl bg-[var(--color-brand-cream)]/20 hover:bg-[var(--color-brand-cream)]/40 transition-colors border border-[var(--color-brand-gold)]/5"
                        >
                          <div className="shrink-0 flex flex-col items-center justify-start pt-0.5">
                            <span className="font-mono text-xs font-semibold text-[var(--color-brand-sage)] px-2 py-1 bg-[var(--color-brand-sage)]/10 rounded-full whitespace-nowrap">
                              {step.time}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-sm md:text-base font-semibold text-[var(--color-brand-brown)]">
                              {step.activity}
                            </h4>
                            <p className="text-xs md:text-sm text-[var(--color-brand-brown)]/65 font-light">
                              {step.detail}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {Array.isArray(item.calendarJson) &&
                item.calendarJson.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[var(--color-brand-gold)]/15 shadow-sm">
                    <h3 className="font-serif text-xl font-bold text-[var(--color-brand-brown)] mb-6 flex items-center gap-2">
                      <Heart className="w-5 h-5 text-[var(--color-brand-gold)]" />
                      <span>연간 주요 사역 및 활동</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {item.calendarJson.map((event: any, eIdx: number) => (
                        <div
                          key={eIdx}
                          className="p-4 rounded-2xl border border-[var(--color-brand-gold)]/10 hover:border-[var(--color-brand-sage)]/30 hover:bg-[var(--color-brand-cream)]/10 transition-all flex gap-3"
                        >
                          <div className="w-10 h-10 shrink-0 rounded-full bg-[var(--color-brand-sage)]/10 text-[var(--color-brand-sage)] flex items-center justify-center font-serif font-bold text-sm">
                            {event.month}
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-[var(--color-brand-brown)] leading-tight">
                              {event.title}
                            </h4>
                            <p className="text-xs text-[var(--color-brand-brown)]/65 font-light leading-snug mt-0.5">
                              {event.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              <div className="bg-[var(--color-brand-sage)]/10 p-6 md:p-8 rounded-[2rem] border border-[var(--color-brand-sage)]/20 relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-[var(--color-brand-sage)]/10 rounded-full blur-2xl" />
                <h3 className="font-serif text-lg font-bold text-[var(--color-brand-brown)] mb-3">
                  처음 방문하는 분을 환영합니다!
                </h3>
                <p className="text-xs text-[var(--color-brand-brown)]/80 font-light leading-relaxed mb-4">
                  영신교회 다음세대는 새로운 분들을 따뜻하게 초대하며
                  환대합니다. 주일날 시간과 장소에 맞춰 방문해 주시거나 본당
                  로비 안내 데스크로 알려주시면 자세한 안내를 도와드립니다.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => {
                      window.location.hash = "#예배안내";
                    }}
                    className="px-4 py-2 bg-[var(--color-brand-sage)] text-white font-medium text-xs rounded-full hover:bg-[var(--color-brand-brown)] transition-colors cursor-pointer"
                  >
                    예배 안내 보기
                  </button>
                  <button
                    onClick={() => {
                      window.location.hash = "#다음세대";
                    }}
                    className="px-4 py-2 border border-[var(--color-brand-sage)]/30 text-[var(--color-brand-sage)] font-medium text-xs rounded-full bg-white hover:bg-[var(--color-brand-sage)] hover:text-white transition-all cursor-pointer"
                  >
                    다른 부서 보기
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 py-10 bg-[var(--color-brand-cream)] border-t border-[var(--color-brand-gold)]/20">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <p className="text-sm text-[var(--color-brand-brown)]/50">
              © 2026 영신교회. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  const heroSlidesData =
    heroSlides && heroSlides.length > 0
      ? heroSlides
      : [
          {
            id: 0,
            type: "text",
            title: "영신교회에 오신 것을 환영합니다",
            subtitle: "하나님을 기쁘시게, 사람을 행복하게",
          },
        ];

  const handleHeroAction = (link: string) => {
    if (!link) return;
    if (link.startsWith("video:")) {
      const url = link.slice(6);
      setActiveVideo({ title: "", embedUrl: getYoutubeEmbed(url) });
    } else if (link.startsWith("#")) {
      window.location.hash = link;
    } else if (link.startsWith("http")) {
      window.open(link, "_blank");
    } else {
      window.location.href = link;
    }
  };

  const churchAddress =
    cfg("map_address") || "서울특별시 양천구 목동로 19길 28";
  const mapEmbedUrl =
    cfg("map_embed_url") ||
    `https://maps.google.com/maps?q=${encodeURIComponent(churchAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  const quickMenuItems = [
    {
      icon: Church,
      label: "예배안내",
      href: "/church/worship",
      iconUrl: cfg("hero_icon_1_url"),
    },
    {
      icon: MapPin,
      label: "오시는길",
      href: "/church/directions",
      iconUrl: cfg("hero_icon_2_url"),
    },
    {
      icon: UserPlus,
      label: "새가족안내",
      href: "/community/new-member",
      iconUrl: cfg("hero_icon_3_url"),
    },
    {
      icon: Youtube,
      label: "온라인예배",
      href: "/sermons/sunday",
      iconUrl: cfg("hero_icon_4_url"),
    },
  ];

  const activeMinistryItems = ministryItems.filter(
    (m: any) => m.status !== "inactive"
  );
  const activeNextGenItems = nextGenItems.filter(
    (n: any) => n.status !== "inactive"
  );
  const activeWorshipSchedule = worshipSchedule.filter(
    (w: any) => w.status !== "inactive"
  );

  const sundayVideo = sundayVideos[0];
  const fridayVideo = fridayVideos[0];

  return (
    <div className="min-h-screen bg-white">
      <PublicHeader
        preloadedSiteConfigs={siteConfigs}
        preloadedCategoryForest={categoryForest}
        transparent
      />

      <main>
        {/* 1. Hero */}
        <section className="bg-[var(--color-brand-cream)] overflow-hidden">
          <HeroCarousel
            slides={heroSlidesData}
            onLinkAction={handleHeroAction}
          />
        </section>

        {/* 2. Quick Links */}
        <section className="relative z-20 bg-[var(--color-brand-cream)] px-6 pb-8 md:pb-16">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 lg:gap-8">
            {quickMenuItems.map((item, idx) => (
              <Link key={idx} href={item.href}>
                <div className="group bg-white p-4 md:p-5 lg:p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-between text-center border border-[var(--color-brand-gold)]/10 min-h-[140px] sm:min-h-[160px] md:min-h-[158px] lg:min-h-[220px] transition-all duration-300 hover:-translate-y-2 cursor-pointer">
                  <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 w-full">
                    <div className="text-[var(--color-brand-gold)] transition-transform group-hover:scale-110 duration-500 mb-1 sm:mb-4 md:mb-1.5 lg:mb-4 scale-75 sm:scale-100">
                      {item.iconUrl ? (
                        <img
                          src={item.iconUrl}
                          alt={item.label}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <item.icon className="w-12 h-12" />
                      )}
                    </div>
                    <div className="flex flex-col justify-center items-center w-full">
                      <h3 className="font-serif text-sm sm:text-lg md:text-lg lg:text-2xl font-bold text-[var(--color-brand-brown)] mb-0.5 sm:mb-2 tracking-tight">
                        {item.label}
                      </h3>
                    </div>
                  </div>
                  <div className="mt-2 sm:mt-4">
                    <div className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-[var(--color-brand-gold)] rounded-full flex items-center justify-center text-white shadow-lg transition-all group-hover:bg-[var(--color-brand-sage)] group-hover:scale-110">
                      <ChevronRight className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 3. 설교 말씀 */}
        <section
          id="설교말씀"
          className="py-14 md:py-20 bg-white overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-6 md:mb-10">
              <div className="flex items-center gap-2 text-[var(--color-brand-sage)] font-medium mb-3">
                <MonitorPlay className="w-5 h-5" />
                <span className="text-sm">설교 말씀</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif text-[var(--color-brand-brown)]">
                  말씀의 은혜
                </h2>
                <Link href="/sermons/sunday">
                  <button className="flex-shrink-0 inline-flex items-center gap-1.5 px-4 py-2 bg-[var(--color-brand-cream)] border border-[var(--color-brand-gold)]/20 text-[var(--color-brand-brown)] rounded-full hover:bg-[var(--color-brand-brown)] hover:text-[var(--color-brand-cream)] transition-all group font-medium shadow-sm text-xs mt-1">
                    설교 말씀 더보기{" "}
                    <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
              {/* Sunday Sermon */}
              <div
                className="group cursor-pointer"
                onClick={() =>
                  sundayVideo &&
                  setActiveVideo({
                    title: sundayVideo.title,
                    embedUrl: getYoutubeEmbed(sundayVideo.url),
                  })
                }
              >
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-5 md:mb-8">
                  <img
                    src={
                      sundayVideo?.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt="Sunday Sermon"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500">
                      <div className="w-16 h-16 bg-[var(--color-brand-gold)] rounded-full flex items-center justify-center shadow-lg">
                        <MonitorPlay className="w-8 h-8 fill-current text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 px-4 py-2 bg-[var(--color-brand-brown)]/80 backdrop-blur-sm text-[var(--color-brand-cream)] text-[10px] uppercase tracking-widest rounded-full">
                    이번주 주일 설교
                  </div>
                </div>
                <h3 className="text-xl md:text-base lg:text-2xl font-serif text-[var(--color-brand-brown)] mb-2 group-hover:text-[var(--color-brand-sage)] transition-colors leading-tight">
                  {sundayVideo?.title || "주일 설교"}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-[var(--color-brand-brown)]/50 text-sm">
                  {(sundayVideo?.sermonDate || sundayVideo?.createdAt) && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(
                        sundayVideo.sermonDate || sundayVideo.createdAt
                      )}
                    </span>
                  )}
                  {sundayVideo?.scripture && (
                    <span className="flex items-center gap-1 text-[var(--color-brand-sage)]">
                      <Sparkles className="w-3.5 h-3.5" />
                      {sundayVideo.scripture}
                    </span>
                  )}
                </div>
              </div>

              {/* Friday Prayer */}
              <div
                className="hidden md:block group cursor-pointer"
                onClick={() =>
                  fridayVideo &&
                  setActiveVideo({
                    title: fridayVideo.title,
                    embedUrl: getYoutubeEmbed(fridayVideo.url),
                  })
                }
              >
                <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-5 md:mb-8">
                  <img
                    src={
                      fridayVideo?.thumbnailUrl ||
                      "https://images.unsplash.com/photo-1510563800743-aed236490d08?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt="Friday Prayer"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center scale-90 group-hover:scale-100 transition-transform duration-500">
                      <div className="w-16 h-16 bg-[var(--color-brand-sage)] rounded-full flex items-center justify-center shadow-lg">
                        <MonitorPlay className="w-8 h-8 fill-current text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-6 left-6 px-4 py-2 bg-[var(--color-brand-brown)]/80 backdrop-blur-sm text-[var(--color-brand-cream)] text-[10px] uppercase tracking-widest rounded-full">
                    금요 기도회
                  </div>
                </div>
                <h3 className="text-xl md:text-base lg:text-2xl font-serif text-[var(--color-brand-brown)] mb-2 group-hover:text-[var(--color-brand-sage)] transition-colors leading-tight">
                  {fridayVideo?.title || "금요 기도회"}
                </h3>
                <div className="flex flex-wrap items-center gap-3 text-[var(--color-brand-brown)]/50 text-sm">
                  {(fridayVideo?.sermonDate || fridayVideo?.createdAt) && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDate(
                        fridayVideo.sermonDate || fridayVideo.createdAt
                      )}
                    </span>
                  )}
                  {fridayVideo?.scripture && (
                    <span className="flex items-center gap-1 text-[var(--color-brand-sage)]">
                      <Sparkles className="w-3.5 h-3.5" />
                      {fridayVideo.scripture}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. 사역 소개 */}
        {activeMinistryItems.length > 0 && (
          <section
            id="사역소개"
            className="hidden md:block py-16 bg-[var(--color-brand-cream)] overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-6">
              <div className="grid md:grid-cols-2 gap-10 items-stretch">
                {/* Left: Active image */}
                <div className="relative h-full">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-[var(--color-brand-sage)]/10 rounded-full blur-3xl" />
                  <div className="relative z-10 rounded-[4rem] overflow-hidden shadow-2xl h-full w-full">
                    <img
                      key={activeCoreValue}
                      src={
                        activeMinistryItems[activeCoreValue]?.imageUrl ||
                        "https://images.unsplash.com/photo-1516062423079-7ca13cdc7f5a?q=80&w=800&auto=format&fit=crop"
                      }
                      alt={activeMinistryItems[activeCoreValue]?.title}
                      className="h-full w-full object-cover aspect-[4/3] transition-opacity duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent flex flex-col justify-start p-8 md:p-10 pointer-events-none">
                      <div className="text-white text-left">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] md:text-xs font-semibold tracking-wider mb-2 border border-white/10 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-brand-gold)] animate-pulse" />
                          CORE VALUE
                        </span>
                        <h3 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mb-2 drop-shadow-md">
                          {activeMinistryItems[activeCoreValue]?.title}
                        </h3>
                        <p className="text-white/85 text-xs md:text-sm font-light max-w-xs md:max-w-md leading-relaxed drop-shadow-md whitespace-pre-line">
                          {activeMinistryItems[activeCoreValue]?.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: List */}
                <div className="flex flex-col justify-center">
                  <div className="flex items-center gap-2 text-[var(--color-brand-sage)] font-medium mb-4">
                    <Leaf className="w-5 h-5" />
                    <span className="text-sm">영신교회의 핵심 가치</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-serif mb-4 text-[var(--color-brand-brown)] leading-tight">
                    따뜻한 환대와 깊이 있는 영적 성장
                  </h2>
                  <p className="text-sm text-[var(--color-brand-brown)]/80 leading-relaxed italic mb-6">
                    "세상의 차가운 그늘 아래 있는 이들에게 하나님의 따뜻한 빛을
                    전합니다."
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {activeMinistryItems.map((item: any, idx: number) => {
                      const isActive = activeCoreValue === idx;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveCoreValue(idx)}
                          className={`flex gap-4 py-4 px-5 text-left rounded-3xl transition-all duration-300 border cursor-pointer outline-none ${
                            isActive
                              ? "bg-[var(--color-brand-sage)] border-[var(--color-brand-sage)] text-white shadow-lg scale-[1.02]"
                              : "bg-white border-transparent hover:border-[var(--color-brand-gold)]/30 shadow-sm hover:shadow-md text-[var(--color-brand-brown)] hover:scale-[1.01]"
                          }`}
                        >
                          <div>
                            <h4
                              className={`font-serif text-base mb-1 ${isActive ? "text-white" : "text-[var(--color-brand-brown)]"}`}
                            >
                              {item.title}
                            </h4>
                            <p
                              className={`text-xs leading-relaxed whitespace-pre-line ${isActive ? "text-white/80" : "text-[var(--color-brand-brown)]/70"}`}
                            >
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. 가나안쉼터 */}
        <section
          id="가나안쉼터"
          className="pt-14 pb-20 md:py-20 relative overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            {canaanData?.backgroundImageUrl && (
              <img
                src={canaanData.backgroundImageUrl}
                alt="Canaan"
                className="w-full h-full object-cover opacity-30"
              />
            )}
          </div>
          <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-brand-gold)]/10 text-[var(--color-brand-sage)] rounded-full text-sm font-medium mb-6">
              <Wind className="w-4 h-4" />
              <span>당신의 쉼을 위한 공간</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-[var(--color-brand-brown)] mb-6 leading-tight whitespace-pre-line">
              {canaanData?.title ||
                "언제나 찾아오셔도 좋습니다.\n당신의 영혼이 잠시 머물 수 있는 곳이기를."}
            </h2>
            {canaanData?.description && (
              <p className="hidden sm:block text-base text-[var(--color-brand-brown)]/70 mb-10 leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
                {canaanData.description}
              </p>
            )}
            <div className="grid md:grid-cols-2 gap-6 text-left">
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[var(--color-brand-gold)]/20 hover:border-[var(--color-brand-sage)] transition-all group">
                <h3 className="font-serif text-xl mb-3 group-hover:text-[var(--color-brand-sage)] transition-colors">
                  {canaanData?.button1Text || "Digital Prayer Room"}
                </h3>
                <p className="text-sm text-[var(--color-brand-brown)]/70 mb-4 font-light">
                  익명으로 기도를 부탁하시거나, 마음의 짐을 털어놓으세요. 저희가
                  함께 마음을 모으겠습니다.
                </p>
                <button
                  onClick={() => {
                    setIsPrayerModalOpen(true);
                    setIsSubmitted(false);
                  }}
                  className="text-[var(--color-brand-sage)] flex items-center gap-2 font-medium text-sm hover:underline cursor-pointer"
                >
                  기명/무기명 기도요청 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-[var(--color-brand-gold)]/20 hover:border-[var(--color-brand-sage)] transition-all group">
                <h3 className="font-serif text-xl mb-3 group-hover:text-[var(--color-brand-sage)] transition-colors">
                  {canaanData?.button2Text || "Open Conversation"}
                </h3>
                <p className="text-sm text-[var(--color-brand-brown)]/70 mb-4 font-light">
                  신앙에 대한 의문이나 삶의 고민들, 교적과 상관없이 언제든
                  따뜻한 대화가 가능합니다.
                </p>
                <a
                  href={
                    canaanData?.button2Link || "/canaan/online-consultation"
                  }
                  className="text-[var(--color-brand-sage)] flex items-center gap-2 font-medium text-sm hover:underline"
                >
                  대화 신청하기 <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 6. 다음세대 */}
        {activeNextGenItems.length > 0 && (
          <section
            id="다음세대"
            className="pt-10 pb-6 md:pt-20 md:pb-8 bg-[var(--color-brand-cream)]/40 relative overflow-hidden border-t border-[var(--color-brand-gold)]/10"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-brand-sage)]/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[var(--color-brand-gold)]/5 rounded-full blur-3xl" />
            <div className="max-w-7xl mx-auto px-6 relative z-10">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-4 md:mb-8">
                <div className="text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[var(--color-brand-sage)]/10 text-[var(--color-brand-sage)] rounded-full text-xs font-semibold tracking-wide mb-3">
                    <Heart className="w-3.5 h-3.5" />
                    <span>영신교회 다음세대</span>
                  </span>
                  <h2 className="text-2xl md:text-3xl font-serif text-[var(--color-brand-brown)] leading-tight">
                    아이들의 꿈이 자라고, 믿음이 깊어지는 품
                  </h2>
                </div>
                <div className="flex gap-2.5 mt-4 md:mt-0">
                  <button
                    onClick={() =>
                      setNextGenIndex(prev =>
                        prev <= 0
                          ? maxNextGenIndex(activeNextGenItems.length)
                          : prev - 1
                      )
                    }
                    className="w-11 h-11 rounded-full border border-[var(--color-brand-gold)]/30 hover:border-[var(--color-brand-sage)] bg-white flex items-center justify-center text-[var(--color-brand-brown)] hover:text-[var(--color-brand-sage)] transition-all shadow-sm cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setNextGenIndex(prev =>
                        prev >= maxNextGenIndex(activeNextGenItems.length)
                          ? 0
                          : prev + 1
                      )
                    }
                    className="w-11 h-11 rounded-full bg-[var(--color-brand-sage)] flex items-center justify-center text-white hover:bg-[var(--color-brand-brown)] transition-all shadow-md cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden pt-2 pb-4 -mx-3 px-3">
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{
                    transform: `translateX(-${nextGenIndex * (100 / visibleCount)}%)`,
                  }}
                >
                  {activeNextGenItems.map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      className="w-full sm:w-1/2 lg:w-1/3 shrink-0 p-3"
                    >
                      <button
                        onClick={() => {
                          window.location.hash = `#nextgen/${idx}`;
                        }}
                        className="w-full text-left rounded-[2rem] overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-[var(--color-brand-gold)]/30 flex flex-col h-full group cursor-pointer outline-none"
                      >
                        <div className="relative aspect-[4/3] md:aspect-[16/10] w-full overflow-hidden">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-serif text-lg text-[var(--color-brand-brown)] mb-1 md:mb-2 group-hover:text-[var(--color-brand-sage)] transition-colors">
                              {item.title}
                            </h3>
                            <p className="text-xs text-[var(--color-brand-brown)]/75 leading-relaxed font-light mb-4 line-clamp-2 hidden md:block whitespace-pre-line">
                              {item.description}
                            </p>
                          </div>
                          <div className="pt-2 md:pt-4 border-t border-[var(--color-brand-gold)]/10 space-y-1.5">
                            {item.targetAge && (
                              <div className="flex items-center gap-2 text-[11px] text-[var(--color-brand-brown)]/65">
                                <span className="font-semibold text-[var(--color-brand-sage)] shrink-0 bg-[var(--color-brand-sage)]/10 px-1.5 py-0.5 rounded">
                                  대상
                                </span>
                                <span className="truncate">
                                  {item.targetAge}
                                </span>
                              </div>
                            )}
                            {item.worshipTime && (
                              <div className="flex items-center gap-2 text-[11px] text-[var(--color-brand-brown)]/65">
                                <span className="font-semibold text-[var(--color-brand-gold)]/90 shrink-0 bg-[var(--color-brand-gold)]/10 px-1.5 py-0.5 rounded">
                                  시간
                                </span>
                                <span className="truncate">
                                  {item.worshipTime}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 7. 예배안내 + 오시는길 */}
        <section
          id="예배안내"
          className="pt-10 pb-12 md:pt-24 md:pb-14 bg-[var(--color-brand-brown)] text-[var(--color-brand-cream)] relative overflow-hidden"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-6 md:mb-10">
              <h2 className="text-4xl md:text-5xl font-serif mb-2">
                예배 시간 및 장소
              </h2>
              <p className="text-[var(--color-brand-gold)]/80 font-light tracking-widest uppercase text-xs">
                Worship Schedule
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-8 items-stretch">
              {/* Left: directions card */}
              <div className="md:col-span-3 order-2 md:order-1 bg-white p-6 md:p-8 lg:p-10 rounded-[2.5rem] text-[var(--color-brand-brown)] shadow-2xl flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-xl lg:text-2xl mb-4 text-[var(--color-brand-brown)] text-left">
                    찾아오시는 길
                  </h3>
                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-start gap-2.5 text-[var(--color-brand-brown)]/85 text-sm lg:text-base leading-relaxed">
                      <MapPin className="w-5 h-5 text-[var(--color-brand-sage)] shrink-0 mt-1" />
                      <span className="flex items-center flex-wrap gap-2">
                        <span>주소: {churchAddress}</span>
                        <button
                          onClick={handleCopyAddress}
                          className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-[var(--color-brand-cream)] hover:bg-[var(--color-brand-sage)] hover:text-white text-[var(--color-brand-brown)]/80 transition-all border border-[var(--color-brand-gold)]/20 active:scale-95 cursor-pointer shrink-0"
                        >
                          {copied ? (
                            <>
                              <Check className="w-3 h-3 text-[var(--color-brand-sage)]" />
                              <span className="text-[11px]">복사완료</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span className="text-[11px]">복사</span>
                            </>
                          )}
                        </button>
                      </span>
                    </div>
                    <div className="flex items-start gap-2.5 text-[var(--color-brand-brown)]/85 text-sm lg:text-base leading-relaxed">
                      <Phone className="w-5 h-5 text-[var(--color-brand-sage)] shrink-0 mt-1" />
                      <span>연락처: 02-123-4567</span>
                    </div>
                  </div>
                </div>
                <div className="w-full aspect-[4/3] md:flex-1 md:aspect-auto md:min-h-[160px] bg-gray-100 rounded-[2rem] overflow-hidden border border-[var(--color-brand-gold)]/10 shadow-inner">
                  <iframe
                    src={mapEmbedUrl}
                    className="w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    title="영신교회 지도"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Right: worship schedule */}
              <div className="md:col-span-2 order-1 md:order-2 grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-2 md:self-center">
                {(activeWorshipSchedule.length > 0
                  ? activeWorshipSchedule
                  : [
                      {
                        id: 1,
                        name: "주일 1부 예배",
                        time: "09:30",
                        location: "본당 2층",
                      },
                      {
                        id: 2,
                        name: "주일 2부 예배",
                        time: "11:30",
                        location: "본당 2층",
                      },
                      {
                        id: 3,
                        name: "주일 청년부 예배",
                        time: "14:30",
                        location: "본당 2층",
                      },
                      {
                        id: 4,
                        name: "수요 성경 대학",
                        time: "19:30",
                        location: "본당 2층",
                      },
                      {
                        id: 5,
                        name: "금요 기도회",
                        time: "20:30",
                        location: "본당 2층",
                      },
                    ]
                ).map((item: any, idx: number) => (
                  <div
                    key={item.id ?? idx}
                    className={`bg-white/5 backdrop-blur-sm px-4 py-3 md:py-2.5 lg:py-4 rounded-xl md:rounded-2xl border border-white/10 hover:bg-white/15 transition-all flex flex-row items-center justify-between ${idx === 4 ? "hidden md:flex" : "flex"}`}
                  >
                    <div className="flex flex-col text-left">
                      <div className="text-[var(--color-brand-gold)]/70 text-xs uppercase tracking-widest font-semibold leading-none mb-1">
                        {item.name}
                      </div>
                      {item.location && (
                        <div className="flex items-center gap-1 text-white/40 text-[10px] leading-none">
                          <MapPin className="w-3 h-3 text-[var(--color-brand-gold)]/40 shrink-0" />
                          <span>{item.location}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-lg md:text-base lg:text-2xl font-mono tracking-tight text-[var(--color-brand-gold)] font-light leading-none whitespace-nowrap ml-3">
                      {item.time}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 bg-[var(--color-brand-cream)] border-t border-[var(--color-brand-gold)]/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-[var(--color-brand-brown)] mb-1">
              영신교회
            </span>
            <p className="text-xs md:text-sm text-[var(--color-brand-gold)] font-medium tracking-wider">
              하나님을 기쁘시게 사람을 행복하게
            </p>
          </div>
          <p className="text-sm md:text-base text-[var(--color-brand-brown)]/50 mb-8 max-w-xl mx-auto leading-relaxed">
            영신교회는 하나님을 향한 바른 예배와 이웃을 향한 사랑의 실천을
            추구하는 믿음의 공동체입니다.
          </p>
          <div className="flex justify-center gap-5 mb-10">
            {[
              { name: "Instagram", icon: <Instagram className="w-5 h-5" /> },
              { name: "YouTube", icon: <Youtube className="w-5 h-5" /> },
              { name: "Facebook", icon: <Facebook className="w-5 h-5" /> },
              { name: "Kakao", icon: <MessageSquare className="w-5 h-5" /> },
            ].map(s => (
              <a
                key={s.name}
                href="#"
                className="w-11 h-11 flex items-center justify-center rounded-full bg-[var(--color-brand-gold)]/10 text-[var(--color-brand-brown)]/60 hover:bg-[var(--color-brand-sage)] hover:text-white transition-all duration-300"
                aria-label={s.name}
              >
                {s.icon}
              </a>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <FontSizePicker />
          </div>
          <div className="flex items-center justify-center gap-6 text-xs text-[var(--color-brand-brown)]/40 font-medium">
            <Link
              href="/privacy"
              className="hover:text-[var(--color-brand-brown)] transition-colors"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/admin"
              className="hover:text-[var(--color-brand-brown)] transition-colors"
            >
              관리자 로그인
            </Link>
          </div>
          <p className="text-[10px] uppercase tracking-tighter text-[var(--color-brand-brown)]/30 mt-6">
            © 2026 YOUNGSHIN CHURCH. ALL RIGHTS RESERVED.
          </p>
        </div>
      </footer>

      {/* Popup Modal */}
      {popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => handleClosePopup()}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300 border border-[var(--color-brand-gold)]/20"
            onClick={e => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 z-10 h-8 w-8 p-0 bg-black/10 hover:bg-black/20 rounded-full"
              onClick={() => handleClosePopup()}
            >
              <X className="h-4 w-4 text-white" />
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
            <div className="p-5 flex items-center justify-between gap-4 bg-white border-t border-[var(--color-brand-gold)]/20">
              <div className="flex flex-col gap-1">
                <p className="font-bold text-[var(--color-brand-brown)]">
                  {popup.title}
                </p>
                <button
                  className="text-xs text-[var(--color-brand-brown)]/50 hover:text-[var(--color-brand-brown)] transition-colors text-left font-medium"
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
                    className="text-sm font-bold text-[var(--color-brand-sage)] hover:underline flex items-center gap-1"
                    onClick={() => handleClosePopup()}
                  >
                    자세히 보기 <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  className="text-sm font-bold text-[var(--color-brand-brown)]/50 hover:text-[var(--color-brand-brown)] transition-colors"
                  onClick={() => handleClosePopup()}
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Modal */}
      {activeVideo && (
        <VideoModal
          title={activeVideo.title}
          embedUrl={activeVideo.embedUrl}
          onClose={() => setActiveVideo(null)}
        />
      )}

      {/* Prayer Request Modal */}
      {isPrayerModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[var(--color-brand-brown)]/65 backdrop-blur-sm"
            onClick={() => setIsPrayerModalOpen(false)}
          />
          <div className="relative bg-[var(--color-brand-cream)] w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-[var(--color-brand-gold)]/20 flex flex-col max-h-[90vh] z-10 animate-in zoom-in duration-200">
            <div className="p-6 pb-4 border-b border-[var(--color-brand-gold)]/10 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-[var(--color-brand-brown)]">
                  Digital Prayer Room
                </h3>
                <p className="text-xs text-[var(--color-brand-brown)]/50">
                  마음의 기도 제목을 보내주시면 함께 기도하겠습니다.
                </p>
              </div>
              <button
                onClick={() => setIsPrayerModalOpen(false)}
                className="w-10 h-10 rounded-full bg-[var(--color-brand-cream)] flex items-center justify-center text-[var(--color-brand-brown)] hover:bg-[var(--color-brand-sage)] hover:text-white transition-all shadow-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              {isSubmitted ? (
                <div className="text-center py-12 px-4 flex flex-col items-center animate-in zoom-in duration-200">
                  <div className="w-16 h-16 bg-[var(--color-brand-sage)]/10 text-[var(--color-brand-sage)] rounded-full flex items-center justify-center mb-6">
                    <Heart className="w-8 h-8 fill-[var(--color-brand-sage)] text-[var(--color-brand-sage)]" />
                  </div>
                  <h4 className="font-serif text-2xl font-bold text-[var(--color-brand-brown)] mb-3">
                    소중한 기도가 접수되었습니다
                  </h4>
                  <p className="text-[var(--color-brand-brown)]/70 text-sm leading-relaxed max-w-xs mx-auto mb-8">
                    익명 또는 남겨주신 마음 그대로, 영신교회 교역자들이 소중히
                    마음을 모아 기도하겠습니다.
                  </p>
                  <button
                    onClick={() => {
                      setIsPrayerModalOpen(false);
                      setIsSubmitted(false);
                    }}
                    className="bg-[var(--color-brand-brown)] text-white hover:bg-[var(--color-brand-sage)] px-8 py-3 rounded-full text-sm font-medium transition-all shadow-lg active:scale-95 cursor-pointer"
                  >
                    닫기
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePrayerSubmit} className="space-y-5">
                  <div>
                    <label className="text-[11px] font-semibold text-[var(--color-brand-brown)]/70 block mb-2">
                      작성 방식
                    </label>
                    <div className="grid grid-cols-2 gap-2 bg-[var(--color-brand-gold)]/10 p-1.5 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(true)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${isAnonymous ? "bg-[var(--color-brand-brown)] text-white shadow-md" : "text-[var(--color-brand-brown)]/60 hover:text-[var(--color-brand-brown)]"}`}
                      >
                        무기명 (익명 기재)
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAnonymous(false)}
                        className={`py-2.5 px-4 rounded-xl text-xs font-semibold transition-all ${!isAnonymous ? "bg-[var(--color-brand-brown)] text-white shadow-md" : "text-[var(--color-brand-brown)]/60 hover:text-[var(--color-brand-brown)]"}`}
                      >
                        기명 (이름 기재)
                      </button>
                    </div>
                  </div>
                  {!isAnonymous && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-[var(--color-brand-brown)]/70 block">
                        이름
                      </label>
                      <input
                        type="text"
                        required={!isAnonymous}
                        value={prayerName}
                        onChange={e => setPrayerName(e.target.value)}
                        placeholder="기도요청자 성함을 입력해 주세요"
                        className="w-full bg-white border border-[var(--color-brand-gold)]/20 rounded-2xl px-4 py-3 text-sm text-[var(--color-brand-brown)] focus:outline-none focus:border-[var(--color-brand-sage)] transition-all placeholder:text-[var(--color-brand-brown)]/30"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--color-brand-brown)]/70 block">
                      연락처
                    </label>
                    <input
                      type="tel"
                      value={prayerContact}
                      onChange={e => setPrayerContact(e.target.value)}
                      placeholder="예: 010-1234-5678"
                      className="w-full bg-white border border-[var(--color-brand-gold)]/20 rounded-2xl px-4 py-3 text-sm text-[var(--color-brand-brown)] focus:outline-none focus:border-[var(--color-brand-sage)] transition-all placeholder:text-[var(--color-brand-brown)]/30"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--color-brand-brown)]/70 block">
                      기도 분야
                    </label>
                    <select
                      value={prayerTopic}
                      onChange={e => setPrayerTopic(e.target.value)}
                      className="w-full bg-white border border-[var(--color-brand-gold)]/20 rounded-2xl px-4 py-3 text-sm text-[var(--color-brand-brown)] focus:outline-none focus:border-[var(--color-brand-sage)] transition-all cursor-pointer"
                    >
                      <option value="영적 성장 및 믿음">
                        영적 성장 및 믿음
                      </option>
                      <option value="가정과 자녀">가정과 자녀</option>
                      <option value="건강 및 치유">건강 및 치유</option>
                      <option value="직장과 사업/진로">직장과 사업/진로</option>
                      <option value="기타 기도제목">기타 기도제목</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-[var(--color-brand-brown)]/70 block">
                      기도 내용
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={prayerContent}
                      onChange={e => setPrayerContent(e.target.value)}
                      placeholder="함께 기도가 필요한 고충이나 소중한 기도제목을 적어주세요."
                      className="w-full bg-white border border-[var(--color-brand-gold)]/20 rounded-2xl px-4 py-3 text-sm text-[var(--color-brand-brown)] focus:outline-none focus:border-[var(--color-brand-sage)] transition-all resize-none placeholder:text-[var(--color-brand-brown)]/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[var(--color-brand-brown)] hover:bg-[var(--color-brand-sage)] text-white rounded-2xl text-sm font-semibold transition-all shadow-lg hover:-translate-y-0.5 active:translate-y-0 mt-2 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                    기도 요청 보내기
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Message */}
      {floatingMessage && (
        <div
          className={`fixed ${floatingMessage.displayPosition === "top" ? "top-20" : floatingMessage.displayPosition === "bottom" ? "bottom-8" : "top-1/2 -translate-y-1/2"} right-4 z-50 max-w-sm w-full animate-in slide-in-from-right duration-500`}
        >
          <Card className="shadow-2xl border-none rounded-2xl overflow-hidden bg-white border border-[var(--color-brand-gold)]/20">
            <div className="p-5 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-black/5"
                onClick={() => setFloatingMessage(null)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <h4 className="font-bold pr-6 text-[var(--color-brand-brown)]">
                  {floatingMessage.title}
                </h4>
                <p className="text-sm leading-relaxed text-[var(--color-brand-brown)]/70">
                  {floatingMessage.content}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      <QuickActionFab />
    </div>
  );
}
