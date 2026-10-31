import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MonitorPlay, X } from "lucide-react";
import SermonCard from "@/components/SermonCard";
import type { Video } from "@shared/entities";

interface SermonListProps {
  category: string;
  title: string;
}

function VideoModal({ embedUrl, title, onClose }: { embedUrl: string; title: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl bg-brand-brown rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3">
          <p className="text-brand-cream font-serif font-semibold text-sm line-clamp-1 pr-4">{title}</p>
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
            src={`${embedUrl}?autoplay=1&rel=0`}
            className="w-full h-full"
            allowFullScreen
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      </div>
    </div>
  );
}

export default function SermonList({ category, title }: SermonListProps) {
  const [playing, setPlaying] = useState<{ embedUrl: string; title: string } | null>(null);

  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", category],
    queryFn: () => api.get<Video[]>(`/videos?publishedOnly=true&category=${category}`),
  });

  const sorted = [...(videos ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  if (isLoading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="rounded-[2rem] bg-brand-cream animate-pulse aspect-video" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <div className="py-20 text-center">
        <MonitorPlay className="h-12 w-12 mx-auto text-brand-brown/20 mb-4" />
        <p className="text-brand-brown/50">등록된 {title} 영상이 없습니다.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((video, index) => (
          <SermonCard
            key={video.id}
            video={video}
            index={index}
            goldAccent={index % 2 === 1}
            onPlay={(embedUrl, title) => setPlaying({ embedUrl, title })}
          />
        ))}
      </div>
      {playing && (
        <VideoModal
          embedUrl={playing.embedUrl}
          title={playing.title}
          onClose={() => setPlaying(null)}
        />
      )}
    </>
  );
}
