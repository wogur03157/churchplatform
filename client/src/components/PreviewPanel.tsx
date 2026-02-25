import { useState } from "react";
import { api } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, RefreshCw, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewPanel({ isOpen, onClose }: PreviewPanelProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

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

  const visibleSections = layoutSettings
    ?.filter((s) => s.isVisible === 1)
    .sort((a, b) => a.displayOrder - b.displayOrder) || [];

  const renderSection = (section: any) => {
    switch (section.sectionType) {
      case "hero":
        return (
          <section key="hero" className="relative py-20 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
            <div className="container relative z-10">
              <div className="max-w-2xl mx-auto text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                  {section.title || "환영합니다"}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {section.subtitle || "우아하고 완벽한 정보 관리 시스템"}
                </p>
              </div>
            </div>
          </section>
        );

      case "announcements":
        if (!announcements || announcements.length === 0) return null;
        return (
          <section key="announcements" className="py-12 bg-muted/30">
            <div className="container">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{section.title || "공지사항"}</h2>
                {section.subtitle && <p className="text-muted-foreground text-sm">{section.subtitle}</p>}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {announcements.slice(0, 3).map((announcement) => (
                  <Card key={announcement.id} className="elegant-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm line-clamp-2">{announcement.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(announcement.createdAt).toLocaleDateString("ko-KR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground line-clamp-2">{stripHtml(announcement.content)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );

      case "images":
        if (!images || images.length === 0) return null;
        return (
          <section key="images" className="py-12">
            <div className="container">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{section.title || "갤러리"}</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {images.slice(0, 4).map((image) => (
                  <div key={image.id} className="aspect-square rounded-lg overflow-hidden bg-muted">
                    <img src={image.url} alt={image.title} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "videos":
        if (!videos || videos.length === 0) return null;
        return (
          <section key="videos" className="py-12 bg-muted/30">
            <div className="container">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">{section.title || "영상"}</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {videos.slice(0, 2).map((video) => {
                  const getVideoEmbed = () => {
                    if (video.videoType === "youtube") {
                      const videoId = video.url.includes("youtu.be")
                        ? video.url.split("/").pop()
                        : new URL(video.url).searchParams.get("v");
                      return `https://www.youtube.com/embed/${videoId}`;
                    } else if (video.videoType === "vimeo") {
                      const videoId = video.url.split("/").pop();
                      return `https://player.vimeo.com/video/${videoId}`;
                    }
                    return video.url;
                  };

                  return (
                    <div key={video.id} className="aspect-video rounded-lg overflow-hidden bg-muted">
                      {video.videoType === "youtube" || video.videoType === "vimeo" ? (
                        <iframe src={getVideoEmbed()} className="w-full h-full" allowFullScreen title={video.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-muted-foreground">영상</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const previewContent = (
    <div className="bg-background min-h-screen">
      <header className="border-b bg-background/95">
        <div className="container flex h-12 items-center justify-between">
          <h1 className="text-sm font-bold">정보 관리 시스템</h1>
          <nav className="flex gap-4 text-xs">
            <a href="#" className="hover:text-primary transition-colors">공지사항</a>
            <a href="#" className="hover:text-primary transition-colors">관리자</a>
          </nav>
        </div>
      </header>
      <main>{visibleSections.map((section) => renderSection(section))}</main>
      <footer className="border-t py-6 mt-12 bg-muted/50">
        <div className="container text-center text-xs text-muted-foreground">
          <p>© 2026 정보 관리 시스템. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );

  if (fullscreen) {
    return (
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="max-w-6xl h-[90vh] p-0">
          <DialogHeader className="flex flex-row items-center justify-between p-4 border-b">
            <DialogTitle>공개 페이지 미리보기</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => setFullscreen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="overflow-auto flex-1">
            <div className="scale-75 origin-top-left w-[133.33%] h-[133.33%]">
              {previewContent}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full">
      <Card className="elegant-shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm">공개 페이지 미리보기</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRefreshKey((k) => k + 1)} className="h-8 w-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setFullscreen(true)} className="h-8 w-8 p-0">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div key={refreshKey} className="border-t bg-background rounded-b-lg overflow-hidden" style={{ height: "400px" }}>
            <div className="scale-50 origin-top-left w-[200%] h-[200%] bg-background">
              {previewContent}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
