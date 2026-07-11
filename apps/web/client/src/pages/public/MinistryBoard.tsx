import PublicPageLayout from "@/components/PublicPageLayout";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Image as ImageIcon } from "lucide-react";

export default function MinistryBoard() {
  const { data: images, isLoading } = useQuery({
    queryKey: ["images", { publishedOnly: true }],
    queryFn: () => api.get<any[]>("/images?publishedOnly=true"),
  });

  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">사역게시판</h1>
        <p className="text-muted-foreground mb-10">영신교회 사역 현장을 나눕니다</p>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (images ?? []).length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">등록된 사역 이미지가 없습니다.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {(images ?? []).map((item: any) => (
              <Card key={item.id} className="overflow-hidden group cursor-pointer">
                <div className="aspect-square relative overflow-hidden bg-muted">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
                <CardHeader className="p-3">
                  <CardTitle className="text-sm line-clamp-1">{item.title}</CardTitle>
                  {item.description && (
                    <CardDescription className="text-xs line-clamp-1">{item.description}</CardDescription>
                  )}
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicPageLayout>
  );
}
