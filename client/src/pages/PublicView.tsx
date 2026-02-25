import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { FileText, Image as ImageIcon, Video as VideoIcon, X, ArrowRight, Calendar } from "lucide-react";

export default function PublicView() {
  const [floatingMessage, setFloatingMessage] = useState<any>(null);
  const [showFloating, setShowFloating] = useState(false);

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

  useEffect(() => {
    if (floatingMessages && floatingMessages.length > 0) {
      setFloatingMessage(floatingMessages[0]);
      setShowFloating(true);
    }
  }, [floatingMessages]);

  const visibleSections = layoutSettings
    ?.filter((s) => s.isVisible === 1)
    .sort((a, b) => a.displayOrder - b.displayOrder) || [];

  const renderSection = (section: any) => {
    switch (section.sectionType) {
      case "hero":
        return (
          <section key="hero" className="relative py-32 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -ml-48 -mb-48" />
            
            <div className="container relative z-10">
              <div className="max-w-3xl mx-auto text-center space-y-8">
                <div className="space-y-4">
                  <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-primary/60">
                    {section.title || "환영합니다"}
                  </h1>
                  <p className="text-xl md:text-2xl text-muted-foreground font-light">
                    {section.subtitle || "우아하고 완벽한 정보 관리 시스템"}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                  <Button size="lg" asChild className="rounded-full shadow-lg hover:shadow-xl transition-shadow">
                    <Link href="#announcements">공지사항 보기</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="rounded-full">
                    <Link href="/admin">관리자 로그인</Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );

      case "announcements":
        if (!announcements || announcements.length === 0) return null;
        return (
          <section key="announcements" id="announcements" className="py-20 bg-muted/30">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {section.title || "공지사항"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-muted-foreground">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {announcements.slice(0, 6).map((announcement) => (
                  <Link key={announcement.id} href={`/announcements/${announcement.id}`}>
                    <Card className="elegant-shadow hover:elegant-shadow-lg transition-all duration-300 h-full hover:translate-y-[-4px] cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2">
                              {announcement.title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-1 mt-2">
                              <Calendar className="h-4 w-4" />
                              {new Date(announcement.createdAt).toLocaleDateString("ko-KR")}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {stripHtml(announcement.content)}
                        </p>
                        <div className="flex items-center text-primary text-sm font-medium">
                          자세히 보기 <ArrowRight className="h-4 w-4 ml-2" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        );

      case "images":
        if (!images || images.length === 0) return null;
        return (
          <section key="images" className="py-20">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {section.title || "갤러리"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-muted-foreground">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 max-w-6xl mx-auto">
                {images.map((image) => (
                  <Card key={image.id} className="elegant-shadow overflow-hidden group cursor-pointer">
                    <div className="aspect-square relative overflow-hidden bg-muted">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </div>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm line-clamp-1">{image.title}</CardTitle>
                      {image.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {image.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        );

      case "videos":
        if (!videos || videos.length === 0) return null;
        return (
          <section key="videos" className="py-20 bg-muted/30">
            <div className="container">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold mb-4">
                  {section.title || "영상"}
                </h2>
                {section.subtitle && (
                  <p className="text-lg text-muted-foreground">{section.subtitle}</p>
                )}
              </div>
              <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
                {videos.map((video) => {
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
                    <Card key={video.id} className="elegant-shadow overflow-hidden group">
                      <div className="aspect-video relative overflow-hidden bg-muted">
                        {video.videoType === "youtube" || video.videoType === "vimeo" ? (
                          <iframe
                            src={getVideoEmbed()}
                            className="w-full h-full"
                            allowFullScreen
                            title={video.title}
                          />
                        ) : video.thumbnailUrl ? (
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <VideoIcon className="h-16 w-16 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle>{video.title}</CardTitle>
                        {video.description && (
                          <CardDescription>{video.description}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
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

  const getFloatingPosition = () => {
    if (!floatingMessage) return "";
    switch (floatingMessage.displayPosition) {
      case "top": return "top-20";
      case "bottom": return "bottom-8";
      case "center": return "top-1/2 -translate-y-1/2";
      default: return "top-1/2 -translate-y-1/2";
    }
  };

  const getFloatingColor = () => {
    if (!floatingMessage) return "";
    switch (floatingMessage.messageType) {
      case "info": return "bg-blue-50 border-blue-200 text-blue-900";
      case "warning": return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "success": return "bg-green-50 border-green-200 text-green-900";
      case "announcement": return "bg-purple-50 border-purple-200 text-purple-900";
      default: return "bg-white border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              정보 관리 시스템
            </h1>
          </div>
          <nav className="flex gap-8">
            <Link href="#announcements" className="text-sm font-medium hover:text-primary transition-colors">
              공지사항
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors">
              관리자
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {visibleSections.map((section) => renderSection(section))}
      </main>

      {/* Footer */}
      <footer className="border-t py-12 mt-20 bg-muted/50">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-3 mb-8">
            <div>
              <h3 className="font-semibold mb-3">정보 관리 시스템</h3>
              <p className="text-sm text-muted-foreground">우아하고 완벽한 콘텐츠 관리 플랫폼</p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">빠른 링크</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#announcements" className="text-muted-foreground hover:text-primary transition-colors">공지사항</Link></li>
                <li><Link href="/admin" className="text-muted-foreground hover:text-primary transition-colors">관리자 로그인</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">정보</h3>
              <p className="text-sm text-muted-foreground">최신 콘텐츠를 확인하세요</p>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 정보 관리 시스템. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Message */}
      {showFloating && floatingMessage && (
        <div className={`fixed ${getFloatingPosition()} right-4 z-50 max-w-md w-full mx-auto`}>
          <Card className={`elegant-shadow-lg ${getFloatingColor()} border-2`}>
            <CardHeader className="relative pb-3">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0"
                onClick={() => setShowFloating(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="pr-8">{floatingMessage.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{floatingMessage.content}</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
