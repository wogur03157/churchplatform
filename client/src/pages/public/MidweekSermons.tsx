import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Video as VideoIcon } from "lucide-react";
import { getVideoEmbedUrl } from "@/lib/video-utils";
import type { Video } from "@shared/entities";

export default function MidweekSermons() {
  const { data: wed } = useQuery({
    queryKey: ["videos", "wednesday"],
    queryFn: () => api.get<Video[]>("/videos?publishedOnly=true&category=wednesday"),
  });
  const { data: fri } = useQuery({
    queryKey: ["videos", "friday"],
    queryFn: () => api.get<Video[]>("/videos?publishedOnly=true&category=friday"),
  });

  const videos = [...(wed ?? []), ...(fri ?? [])].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">수요/금요 설교</h1>
        <p className="text-muted-foreground mb-10">수요예배 · 금요기도회 설교 영상입니다</p>

        {videos.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <VideoIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">등록된 설교가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {videos.map((video) => {
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
                    <CardTitle className="text-base">{video.title}</CardTitle>
                    {video.description && (
                      <CardDescription className="text-xs line-clamp-2">{video.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
