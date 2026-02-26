import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Layout } from "lucide-react";

export default function AdminLayoutSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});

  const queryClientInstance = useQueryClient();
  const { data: layoutSettings, isLoading } = useQuery({
    queryKey: ["layout-settings"],
    queryFn: () => api.get<any[]>("/layout-settings"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) =>
      api.patch<{ success: boolean }>(`/layout-settings/${id}`, data),
    onSuccess: () => {
      queryClientInstance.invalidateQueries({ queryKey: ["layout-settings"] });
      toast.success("레이아웃 설정이 저장되었습니다");
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  useEffect(() => {
    if (layoutSettings) {
      const settingsMap: Record<string, any> = {};
      layoutSettings.forEach((setting) => {
        settingsMap[setting.sectionType] = setting;
      });
      setSettings(settingsMap);
    }
  }, [layoutSettings]);

  const handleUpdate = (sectionType: string, field: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [sectionType]: {
        ...prev[sectionType],
        [field]: value,
      },
    }));
  };

  const handleSave = (sectionType: string) => {
    const setting = settings[sectionType];
    if (!setting) return;

    updateMutation.mutate({
      id: setting.id,
      isVisible: setting.isVisible === 1,
      displayOrder: setting.displayOrder,
      title: setting.title || undefined,
      subtitle: setting.subtitle || undefined,
    });
  };

  const sections = [
    { type: "hero", name: "히어로 섹션", description: "메인 배너 영역" },
    { type: "announcements", name: "공지사항", description: "공지사항 목록 표시" },
    { type: "images", name: "이미지 갤러리", description: "이미지 갤러리 표시" },
    { type: "videos", name: "영상", description: "영상 목록 표시" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">레이아웃 설정</h1>
        <p className="text-muted-foreground mt-2">공개 페이지의 레이아웃을 구성하세요</p>
      </div>

      {isLoading ? (
        <div className="text-center py-12"><p className="text-muted-foreground">로딩 중...</p></div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => {
            const setting = settings[section.type];
            if (!setting) return null;

            return (
              <Card key={section.type} className="elegant-shadow">
                <CardContent className="pt-4 pb-4">
                  {/* 헤더 행: 섹션명 + 컨트롤 */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Layout className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="font-medium text-sm">{section.name}</p>
                        <p className="text-xs text-muted-foreground">{section.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Switch
                          id={`${section.type}-visible`}
                          checked={setting.isVisible === 1}
                          onCheckedChange={(checked) =>
                            handleUpdate(section.type, "isVisible", checked ? 1 : 0)
                          }
                        />
                        <Label htmlFor={`${section.type}-visible`} className="text-sm cursor-pointer">표시</Label>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Label htmlFor={`${section.type}-order`} className="text-sm whitespace-nowrap">순서</Label>
                        <Input
                          id={`${section.type}-order`}
                          type="number"
                          min={0}
                          value={setting.displayOrder}
                          onChange={(e) =>
                            handleUpdate(section.type, "displayOrder", Math.max(0, parseInt(e.target.value) || 0))
                          }
                          className="w-16 h-8 text-sm"
                        />
                      </div>
                      <Button size="sm" onClick={() => handleSave(section.type)} disabled={updateMutation.isPending}>
                        <Save className="h-3.5 w-3.5 mr-1" />저장
                      </Button>
                    </div>
                  </div>
                  {/* 제목 / 부제목 */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`${section.type}-title`} className="text-xs">제목</Label>
                      <Input
                        id={`${section.type}-title`}
                        value={setting.title || ""}
                        onChange={(e) => handleUpdate(section.type, "title", e.target.value)}
                        placeholder={`${section.name} 제목`}
                        className="h-8 text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${section.type}-subtitle`} className="text-xs">부제목</Label>
                      <Input
                        id={`${section.type}-subtitle`}
                        value={setting.subtitle || ""}
                        onChange={(e) => handleUpdate(section.type, "subtitle", e.target.value)}
                        placeholder="부제목 (선택사항)"
                        className="h-8 text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="elegant-shadow bg-muted/50">
        <CardHeader>
          <CardTitle>레이아웃 설정 안내</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• <strong>표시</strong>: 해당 섹션을 공개 페이지에 표시할지 여부를 설정합니다</p>
          <p>• <strong>표시 순서</strong>: 숫자가 작을수록 위쪽에 표시됩니다 (0이 가장 위)</p>
          <p>• <strong>섹션 제목/부제목</strong>: 각 섹션의 제목과 설명을 커스터마이징할 수 있습니다</p>
          <p>• 변경사항은 각 섹션의 <strong>저장</strong> 버튼을 눌러야 적용됩니다</p>
        </CardContent>
      </Card>
    </div>
  );
}
