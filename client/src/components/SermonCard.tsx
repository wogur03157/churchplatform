import { motion } from "framer-motion";
import { Clock, MonitorPlay } from "lucide-react";
import type { Video } from "@shared/entities";

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

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  const date = d instanceof Date ? d : new Date(d);
  return `${date.getFullYear()}. ${String(date.getMonth() + 1).padStart(2, "0")}. ${String(date.getDate()).padStart(2, "0")}`;
}

export default function SermonCard({
  video,
  index,
  goldAccent = false,
  onPlay,
}: {
  video: Video & { sermonDate?: string | null; scripture?: string | null };
  index: number;
  goldAccent?: boolean;
  onPlay: (embedUrl: string, title: string) => void;
}) {
  const embedUrl = getYoutubeEmbed(video.url);
  const thumbnail = video.thumbnailUrl ?? getYoutubeThumbnail(video.url);
  const date = (video as any).sermonDate
    ? formatDate((video as any).sermonDate)
    : formatDate(video.createdAt);
  const passage = (video as any).scripture ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(0.05 + (index % 6) * 0.05, 0.4) }}
      className="group cursor-pointer text-left bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-md transition-shadow"
      onClick={() => onPlay(embedUrl, video.title)}
    >
      <div className="relative aspect-video rounded-[1.5rem] overflow-hidden mb-2 md:mb-4">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={video.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-brand-brown/10 flex items-center justify-center">
            <MonitorPlay className="w-10 h-10 text-brand-brown/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/15 group-hover:bg-black/5 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
            <div
              className={`w-11 h-11 ${
                goldAccent ? "bg-brand-gold" : "bg-brand-sage"
              } rounded-full flex items-center justify-center shadow-md`}
            >
              <MonitorPlay className="w-5 h-5 fill-current" />
            </div>
          </div>
        </div>
        {video.category && (
          <div className="absolute bottom-4 left-4 px-3 py-1 bg-brand-brown/85 backdrop-blur-sm text-brand-cream text-[0.5625rem] uppercase tracking-wider rounded-full font-medium">
            {video.category}
          </div>
        )}
      </div>
      <div className="px-1">
        <h3 className="sermon-card-title font-serif text-brand-brown font-bold mb-1 md:mb-2 group-hover:text-brand-sage transition-colors leading-snug line-clamp-1">
          {video.title}
        </h3>
        <div className="flex items-center gap-3 text-brand-brown/65 text-xs">
          <span className="flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5" /> {date}
          </span>
          {passage && (
            <>
              <span className="w-px h-2.5 bg-brand-gold/40" />
              <span className="font-semibold text-brand-sage">{passage}</span>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
