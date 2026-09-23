import { MonitorPlay, Clock } from "lucide-react";
import React from "react";

interface VideoCardProps {
  imageUrl?: string | null;
  title: string;
  date?: string;
  scripture?: string;
  badge?: string;
  badgeColor?: "gold" | "sage";
  onClick?: () => void;
  className?: string;
}

export default function VideoCard({
  imageUrl,
  title,
  date,
  scripture,
  badge,
  badgeColor = "gold",
  onClick,
  className = "",
}: VideoCardProps) {
  const badgeStyle =
    badgeColor === "sage"
      ? "bg-[var(--color-brand-sage)] text-white"
      : "bg-[var(--color-brand-brown)]/80 text-[var(--color-brand-cream)]";

  const playBg =
    badgeColor === "sage"
      ? "bg-[var(--color-brand-sage)]"
      : "bg-[var(--color-brand-gold)]";

  return (
    <div
      className={`group cursor-pointer ${className}`}
      onClick={onClick}
    >
      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-5 md:mb-8">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-[var(--color-brand-brown)]/10" />
        )}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
            <div className={`w-16 h-16 ${playBg} rounded-full flex items-center justify-center shadow-lg`}>
              <MonitorPlay className="w-8 h-8 fill-current text-white" />
            </div>
          </div>
        </div>
        {badge && (
          <div
            className={`absolute bottom-6 left-6 px-4 py-2 ${badgeStyle} backdrop-blur-sm text-[10px] uppercase tracking-widest rounded-full`}
          >
            {badge}
          </div>
        )}
      </div>
      <h3 className="text-xl md:text-base lg:text-2xl font-serif text-[var(--color-brand-brown)] mb-3 group-hover:text-[var(--color-brand-sage)] transition-colors leading-tight">
        {title}
      </h3>
      <div className="flex items-center gap-4 text-[var(--color-brand-brown)]/50 text-sm">
        {date && (
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {date}
          </span>
        )}
        {date && scripture && (
          <span className="w-px h-3 bg-[var(--color-brand-gold)]/30" />
        )}
        {scripture && <span>{scripture}</span>}
      </div>
    </div>
  );
}
