import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Image, Video, MessageSquare } from "lucide-react";

export default function Home() {
  const { data: announcements } = useQuery({ queryKey: ["announcements"], queryFn: () => api.get<any[]>("/announcements") });
  const { data: images } = useQuery({ queryKey: ["images"], queryFn: () => api.get<any[]>("/images") });
  const { data: videos } = useQuery({ queryKey: ["videos"], queryFn: () => api.get<any[]>("/videos") });
  const { data: floatingMessages } = useQuery({ queryKey: ["floating-messages"], queryFn: () => api.get<any[]>("/floating-messages") });

  const stats = [
    {
      title: "공지사항",
      value: announcements?.length || 0,
      icon: FileText,
      description: "전체 공지사항 수",
      color: "text-blue-600",
    },
    {
      title: "이미지",
      value: images?.length || 0,
      icon: Image,
      description: "업로드된 이미지 수",
      color: "text-green-600",
    },
    {
      title: "영상",
      value: videos?.length || 0,
      icon: Video,
      description: "등록된 영상 수",
      color: "text-purple-600",
    },
    {
      title: "플로팅 메시지",
      value: floatingMessages?.length || 0,
      icon: MessageSquare,
      description: "활성 메시지 수",
      color: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-muted-foreground mt-2">
          콘텐츠 관리 시스템 개요
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="elegant-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="elegant-shadow">
        <CardHeader>
          <CardTitle>시작하기</CardTitle>
          <CardDescription>
            콘텐츠 관리 시스템의 주요 기능을 살펴보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold">📢 공지사항 관리</h3>
            <p className="text-sm text-muted-foreground">
              중요한 공지사항을 작성하고 발행하세요. AI 기반 문구 개선 기능으로 더 나은 콘텐츠를 만들 수 있습니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">🖼️ 이미지 갤러리</h3>
            <p className="text-sm text-muted-foreground">
              사진을 업로드하고 갤러리를 구성하세요. 드래그 앤 드롭으로 순서를 변경할 수 있습니다.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">🎬 영상 관리</h3>
            <p className="text-sm text-muted-foreground">
              영상 파일을 업로드하거나 YouTube, Vimeo 링크를 추가하세요.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold">💬 플로팅 메시지</h3>
            <p className="text-sm text-muted-foreground">
              방문자에게 표시할 팝업 메시지를 설정하고 일정을 관리하세요.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
