import { useState } from "react";
import { api } from "@/lib/api";
import { stripHtml } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Maximize2, RefreshCw, X } from "lucide-react";

interface PreviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PreviewPanel({ isOpen, onClose }: PreviewPanelProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: homeData } = useQuery({
    queryKey: ["public", "home-data", "preview", refreshKey],
    queryFn: () => api.get<any>("/public/home-data"),
    enabled: isOpen,
    staleTime: 60 * 1000,
  });

  const layoutSettings: any[] = homeData?.layoutSettings ?? [];
  const announcements: any[] = homeData?.announcements ?? [];
  const images: any[] = homeData?.images ?? [];
  const videos: any[] = homeData?.videos ?? [];
  const sectionDataById: Record<string, any> = homeData?.sectionDataById ?? {};

  const visibleSections = layoutSettings
    .filter((section: any) => section.status === "visible")
    .sort((a: any, b: any) => a.displayOrder - b.displayOrder);

  const renderDynamicSection = (section: any) => {
    const data = sectionDataById[String(section.id)];
    if (!data) return null;

    if (data.kind === "content_category") {
      const items = data.children ?? [];
      return (
        <section key={section.id} className="py-12">
          <div className="container space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{section.title || data.category?.name}</h2>
              {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.length > 0 ? (
                items.map((item: any) => (
                  <Card key={item.id} className="elegant-shadow">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      {item.pageTitle && <CardDescription>{item.pageTitle}</CardDescription>}
                    </CardHeader>
                  </Card>
                ))
              ) : data.page ? (
                <Card className="elegant-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{data.page.title}</CardTitle>
                    <CardDescription>단일 페이지 섹션</CardDescription>
                  </CardHeader>
                </Card>
              ) : null}
            </div>
          </div>
        </section>
      );
    }

    if (data.kind === "media_category") {
      const items = data.items ?? [];
      return (
        <section key={section.id} className="bg-muted/30 py-12">
          <div className="container space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold">{section.title || data.category?.name}</h2>
              {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {items.map((item: any) => (
                <Card key={item.id} className="overflow-hidden elegant-shadow">
                  <div className="aspect-video bg-muted">
                    {item.mediaType === "image" ? (
                      <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                        영상 섹션
                      </div>
                    )}
                  </div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    {item.description && <CardDescription className="line-clamp-2">{item.description}</CardDescription>}
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      );
    }

    return null;
  };

  const renderSection = (section: any) => {
    switch (section.sectionType) {
      case "hero":
        return (
          <section key={section.id ?? "hero"} className="relative overflow-hidden py-20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
            <div className="container relative z-10">
              <div className="mx-auto max-w-2xl space-y-6 text-center">
                <h1 className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl">
                  {section.title || "환영합니다"}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {section.subtitle || "공개 페이지 레이아웃 미리보기입니다."}
                </p>
              </div>
            </div>
          </section>
        );

      case "announcements":
        if (announcements.length === 0) return null;
        return (
          <section key={section.id ?? "announcements"} className="bg-muted/30 py-12">
            <div className="container">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">{section.title || "공지사항"}</h2>
                {section.subtitle && <p className="text-sm text-muted-foreground">{section.subtitle}</p>}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {announcements.slice(0, 3).map((announcement: any) => (
                  <Card key={announcement.id} className="elegant-shadow">
                    <CardHeader className="pb-2">
                      <CardTitle className="line-clamp-2 text-sm">{announcement.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(announcement.createdAt).toLocaleDateString("ko-KR")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{stripHtml(announcement.content)}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );

      case "images":
        if (images.length === 0) return null;
        return (
          <section key={section.id ?? "images"} className="py-12">
            <div className="container">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">{section.title || "교회 갤러리"}</h2>
              </div>
              <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
                {images.slice(0, 4).map((image: any) => (
                  <div key={image.id} className="aspect-square overflow-hidden rounded-lg bg-muted">
                    <img src={image.url} alt={image.title} className="h-full w-full object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "videos":
        if (videos.length === 0) return null;
        return (
          <section key={section.id ?? "videos"} className="bg-muted/30 py-12">
            <div className="container">
              <div className="mb-8 text-center">
                <h2 className="mb-2 text-2xl font-bold">{section.title || "영상"}</h2>
              </div>
              <div className="grid gap-6 md:grid-cols-2">
                {videos.slice(0, 2).map((video: any) => (
                  <div key={video.id} className="aspect-video overflow-hidden rounded-lg bg-muted">
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      {video.title}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );

      case "content_category":
      case "media_category":
        return renderDynamicSection(section);

      default:
        return null;
    }
  };

  const previewContent = (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95">
        <div className="container flex h-12 items-center justify-between">
          <h1 className="text-sm font-bold">공개 페이지 미리보기</h1>
          <nav className="flex gap-4 text-xs">
            <span className="text-muted-foreground">공지사항</span>
            <span className="text-muted-foreground">관리자</span>
          </nav>
        </div>
      </header>
      <main>{visibleSections.map((section: any) => renderSection(section))}</main>
      <footer className="mt-12 border-t bg-muted/50 py-6">
        <div className="container text-center text-xs text-muted-foreground">
          <p>© 2026 공개 페이지 미리보기. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );

  if (fullscreen) {
    return (
      <Dialog open={fullscreen} onOpenChange={setFullscreen}>
        <DialogContent className="h-[90vh] max-w-6xl p-0">
          <DialogHeader className="flex flex-row items-center justify-between border-b p-4">
            <DialogTitle>공개 페이지 미리보기</DialogTitle>
            <Button variant="ghost" size="sm" onClick={() => setFullscreen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <div className="h-[133.33%] w-[133.33%] origin-top-left scale-75">{previewContent}</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-full max-w-sm">
      <Card className="elegant-shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm">공개 페이지 미리보기</CardTitle>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setRefreshKey((key) => key + 1)} className="h-8 w-8 p-0">
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
          <div key={refreshKey} className="overflow-hidden rounded-b-lg border-t bg-background" style={{ height: "400px" }}>
            <div className="h-[200%] w-[200%] origin-top-left scale-50 bg-background">{previewContent}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
