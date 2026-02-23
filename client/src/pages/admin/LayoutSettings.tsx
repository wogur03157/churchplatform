import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Save, Layout } from "lucide-react";

export default function AdminLayoutSettings() {
  const [settings, setSettings] = useState<Record<string, any>>({});
  
  const utils = trpc.useUtils();
  const { data: layoutSettings, isLoading } = trpc.layoutSettings.list.useQuery();
  
  const updateMutation = trpc.layoutSettings.update.useMutation({
    onSuccess: () => {
      utils.layoutSettings.list.invalidate();
      toast.success("레이아웃 설정이 저장되었습니다");
    },
    onError: (error) => {
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
        <p className="text-muted-foreground mt-2">
          공개 페이지의 레이아웃을 구성하세요
        </p>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => {
            const setting = settings[section.type];
            if (!setting) return null;

            return (
              <Card key={section.type} className="elegant-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Layout className="h-5 w-5" />
                        {section.name}
                      </CardTitle>
                      <CardDescription>{section.description}</CardDescription>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleSave(section.type)}
                      disabled={updateMutation.isPending}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      저장
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id={`${section.type}-visible`}
                      checked={setting.isVisible === 1}
                      onCheckedChange={(checked) =>
                        handleUpdate(section.type, "isVisible", checked ? 1 : 0)
                      }
                    />
                    <Label htmlFor={`${section.type}-visible`}>표시</Label>
                  </div>
                  <div>
                    <Label htmlFor={`${section.type}-order`}>표시 순서</Label>
                    <Input
                      id={`${section.type}-order`}
                      type="number"
                      value={setting.displayOrder}
                      onChange={(e) =>
                        handleUpdate(section.type, "displayOrder", parseInt(e.target.value) || 0)
                      }
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${section.type}-title`}>섹션 제목 (선택사항)</Label>
                    <Input
                      id={`${section.type}-title`}
                      value={setting.title || ""}
                      onChange={(e) =>
                        handleUpdate(section.type, "title", e.target.value)
                      }
                      placeholder={`${section.name} 제목`}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`${section.type}-subtitle`}>섹션 부제목 (선택사항)</Label>
                    <Textarea
                      id={`${section.type}-subtitle`}
                      value={setting.subtitle || ""}
                      onChange={(e) =>
                        handleUpdate(section.type, "subtitle", e.target.value)
                      }
                      placeholder={`${section.name} 부제목`}
                      rows={2}
                    />
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
