import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronLeft, MonitorPlay, X } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import SermonCard, { type SermonItem } from "@/components/SermonCard";
import { api } from "@/lib/api";
import type { Video } from "@shared/entities";
import { compareSermonVideos } from "@shared/sermon-order";

export type SermonTab = "주일_금요" | "수요_특별";

const TYPE_LABEL: Record<string, string> = {
  sunday: "주일 대예배",
  friday: "금요 기도회",
  wednesday: "수요예배",
  special: "특별 설교",
};

const TAB_CATEGORIES: Record<SermonTab, string[]> = {
  주일_금요: ["sunday", "friday"],
  수요_특별: ["wednesday", "special"],
};

function getYoutubeEmbed(url: string): string {
  try {
    if (url.includes("youtu.be")) {
      const id = url.split("/").pop()?.split("?")[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    const v = new URL(url).searchParams.get("v");
    if (v) return `https://www.youtube.com/embed/${v}`;
  } catch {
    // ignore
  }
  return url;
}

function getYoutubeThumbnail(url: string): string | null {
  try {
    let id: string | null = null;
    if (url.includes("youtu.be")) {
      id = url.split("/").pop()?.split("?")[0] ?? null;
    } else {
      id = new URL(url).searchParams.get("v");
    }
    if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  } catch {
    // ignore
  }
  return null;
}

function formatDate(value: string | null | undefined, fallback: string | Date): string {
  const raw = value ? String(value) : String(fallback);
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return raw.slice(0, 10).replace(/-/g, ". ");
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}. ${m}. ${day}`;
}

export function toSermon(video: Video): SermonItem {
  const type = TYPE_LABEL[video.category ?? ""] ?? "설교";
  return {
    title: `${type}: ${video.title}`,
    sermonTitle: video.title,
    type,
    date: formatDate(video.sermonDate, video.createdAt),
    passage: video.scripture ?? "",
    embedUrl: getYoutubeEmbed(video.url),
    imageUrl: video.thumbnailUrl ?? getYoutubeThumbnail(video.url) ?? "/images/sea.png",
  };
}

function VideoModal({ video, onClose }: { video: { title: string; embedUrl: string }; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-brand-brown rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-brand-cream font-serif font-semibold text-sm line-clamp-1 pr-4 flex items-center gap-2">
            <MonitorPlay className="w-4 h-4" /> {video.title}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-brand-cream transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="aspect-video">
          <iframe
            src={`${video.embedUrl}?autoplay=1&rel=0`}
            className="w-full h-full"
            allowFullScreen
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </motion.div>
  );
}

const PAGE_SIZE = 6;

export default function SermonsPage({ initialTab = "주일_금요" }: { initialTab?: SermonTab }) {
  const [sermonTab, setSermonTab] = useState<SermonTab>(initialTab);
  const [sundayLimit, setSundayLimit] = useState(PAGE_SIZE);
  const [wednesdayLimit, setWednesdayLimit] = useState(PAGE_SIZE);
  const [activeVideo, setActiveVideo] = useState<{ title: string; embedUrl: string } | null>(null);

  // DB: 공개된 영상 전체 (카테고리별 탭으로 나눠서 표시)
  const { data: videos = [] } = useQuery({
    queryKey: ["videos", "public-sermons"],
    queryFn: () => api.get<Video[]>("/videos?publishedOnly=true"),
  });

  const sorted = useMemo(() => [...videos].sort(compareSermonVideos), [videos]);

  const sundayFriday = useMemo(
    () => sorted.filter((v) => TAB_CATEGORIES["주일_금요"].includes(v.category ?? "")).map(toSermon),
    [sorted],
  );
  const wednesdaySpecial = useMemo(
    () => sorted.filter((v) => TAB_CATEGORIES["수요_특별"].includes(v.category ?? "")).map(toSermon),
    [sorted],
  );

  const tabLabel = sermonTab === "주일_금요" ? "주일/금요 설교" : "수요/특별 설교";

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-brand-cream/40 font-sans pb-16">
        {/* Sermons Hero */}
        <div className="subpage-hero info-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
          <img
            src="/images/sea.png"
            alt="성경책과 은은한 빛, 은혜로운 예배와 평강"
            className="w-full h-full object-cover brightness-[0.7]"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
            <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
              <div className="text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-gold text-brand-brown text-sm font-bold tracking-wider mb-2 font-sans">
                  SERMONS
                </span>
                <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2">
                  <span className="subpage-title-mobile">설교</span>
                  <span className="subpage-title-desktop">{sermonTab === "주일_금요" ? "주일/금요 설교" : "수요/특별 설교"}</span>
                </h1>
                <p className="hidden md:block text-white/85 text-base md:text-lg font-light max-w-[var(--reading-max)] leading-relaxed w-full">
                  선포되는 보배로운 하나님의 말씀을 통해 세상을 이길 지혜와 하늘의 신령한 평정을 누리시길 기도합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={() => (window.location.href = "/")}
                className="md:hidden flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium shrink-0 mb-1 pb-1 border-b border-white/20 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>뒤로 가기</span>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-[var(--content-max)] mx-auto px-6 mt-10 md:mt-12 text-left">
          {/* Back button and Breadcrumb */}
          <div className="hidden md:flex mb-3 md:mb-8 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 md:gap-4">
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="text-brand-sage hover:text-brand-brown text-sm font-medium inline-flex items-center gap-1 cursor-pointer overflow-hidden leading-none border-none bg-transparent py-1 px-0"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>메인 화면으로 돌아가기</span>
            </button>
            <div className="text-sm text-brand-brown/50 font-medium font-sans">
              설교 &gt; <span className="text-brand-sage">{tabLabel}</span>
            </div>
          </div>

          {/* Segmented Control */}
          <div className="flex md:justify-center mb-8 md:mb-12">
            <div className="flex md:inline-flex p-1.5 bg-brand-cream/80 border border-brand-gold/15 rounded-2xl shadow-sm w-full md:w-auto overflow-x-auto pb-1.5 md:pb-0 gap-1 md:gap-0">
              {(
                [
                  { tab: "주일_금요", label: "주일/금요 설교" },
                  { tab: "수요_특별", label: "수요/특별 설교" },
                ] as { tab: SermonTab; label: string }[]
              ).map(({ tab, label }) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setSermonTab(tab)}
                  className={`flex-1 md:flex-initial text-center whitespace-nowrap px-4 md:px-8 py-3 rounded-xl text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                    sermonTab === tab
                      ? "bg-brand-sage text-white shadow-md shadow-brand-sage/20 border border-brand-sage"
                      : "text-brand-brown/80 hover:text-brand-sage hover:bg-brand-sage/5 border border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content cards */}
          {sermonTab === "주일_금요" ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sundayFriday.slice(0, sundayLimit).map((sermon, idx) => (
                  <SermonCard
                    key={`sf-${idx}`}
                    sermon={sermon}
                    index={idx}
                    goldAccent={sermon.type.includes("주일")}
                    onPlay={setActiveVideo}
                  />
                ))}
              </div>
              {sundayLimit < sundayFriday.length && (
                <div className="flex justify-center mt-12 mb-6">
                  <button
                    type="button"
                    onClick={() => setSundayLimit((prev) => prev + PAGE_SIZE)}
                    className="px-8 py-3.5 rounded-xl bg-brand-sage text-white font-semibold text-xs md:text-sm hover:bg-brand-brown transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>설교 더보기</span>
                    <ChevronDown className="w-4 h-4 shrink-0 animate-bounce" />
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {wednesdaySpecial.slice(0, wednesdayLimit).map((sermon, idx) => (
                  <SermonCard
                    key={`ws-${idx}`}
                    sermon={sermon}
                    index={idx}
                    goldAccent={sermon.type.includes("특별")}
                    onPlay={setActiveVideo}
                  />
                ))}
              </div>
              {wednesdayLimit < wednesdaySpecial.length && (
                <div className="flex justify-center mt-12 mb-6">
                  <button
                    type="button"
                    onClick={() => setWednesdayLimit((prev) => prev + PAGE_SIZE)}
                    className="px-8 py-3.5 rounded-xl bg-brand-sage text-white font-semibold text-xs md:text-sm hover:bg-brand-brown transition-all shadow-md flex items-center gap-2 cursor-pointer"
                  >
                    <span>설교 더보기</span>
                    <ChevronDown className="w-4 h-4 shrink-0 animate-bounce" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {activeVideo && <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />}
      </AnimatePresence>
    </PublicPageLayout>
  );
}
