import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video as VideoIcon } from "lucide-react";
import { getVideoEmbedUrl } from "@/lib/video-utils";
import type { Video } from "@shared/entities";

interface SermonListProps {
  /** "sunday" | "wednesday" | "friday" | "special" (special = 주일/수/금 외) */
  category: string;
  title: string;
}

export default function SermonList({ category, title }: SermonListProps) {
  const { data: videos, isLoading } = useQuery({
    queryKey: ["videos", category],
    queryFn: () => api.get<Video[]>(`/videos?publishedOnly=true&category=${category}`),
  });

  const sorted = [...(videos ?? [])].sort((a, b) => a.displayOrder - b.displayOrder);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-xl bg-muted animate-pulse aspect-video" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <Card>
        <CardContent className="py-16 text-center">
          <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">등록된 {title}가 없습니다.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sorted.map((video) => {
        const embedUrl = getVideoEmbedUrl(video);
        return (
          <Card key={video.id} className="overflow-hidden">
            <div className="aspect-video relative overflow-hidden bg-muted">
              {embedUrl ? (
                <iframe src={embedUrl} className="w-full h-full" allowFullScreen title={video.title} />
              ) : video.thumbnailUrl ? (
                <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <VideoIcon className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-base leading-snug">{video.title}</CardTitle>
              {video.description && (
                <CardDescription className="text-xs line-clamp-2">{video.description}</CardDescription>
              )}
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
}
