import { useState } from "react";
import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { MonitorPlay, X } from "lucide-react";
import SermonCard from "@/components/SermonCard";
import type { Video } from "@shared/entities";

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

export default function MidweekSermons() {
  const [playing, setPlaying] = useState<{ embedUrl: string; title: string } | null>(null);

  const { data: wed } = useQuery({
    queryKey: ["videos", "wednesday"],
    queryFn: () => api.get<Video[]>("/videos?publishedOnly=true&category=wednesday"),
  });
  const { data: fri } = useQuery({
    queryKey: ["videos", "friday"],
    queryFn: () => api.get<Video[]>("/videos?publishedOnly=true&category=friday"),
  });

  const videos = [...(wed ?? []), ...(fri ?? [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <PublicPageLayout>
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">MIDWEEK SERVICE</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">수요/금요 설교</h1>
          <p className="text-brand-brown/60 text-lg">수요예배와 금요기도회 설교 영상을 확인할 수 있습니다.</p>
        </div>
      </div>

      <div className="container py-12 max-w-5xl">
        {videos.length === 0 ? (
          <div className="py-20 text-center">
            <MonitorPlay className="h-12 w-12 mx-auto text-brand-brown/20 mb-4" />
            <p className="text-brand-brown/50">등록된 설교 영상이 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((video, index) => (
              <SermonCard
                key={video.id}
                video={video}
                index={index}
                goldAccent={index % 2 === 1}
                onPlay={(embedUrl, title) => setPlaying({ embedUrl, title })}
              />
            ))}
          </div>
        )}
      </div>

      {playing && (
        <VideoModal
          embedUrl={playing.embedUrl}
          title={playing.title}
          onClose={() => setPlaying(null)}
        />
      )}
    </PublicPageLayout>
  );
}
