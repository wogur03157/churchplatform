import { useRef } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Clock, MapPin, UserPlus, Youtube, Globe } from "lucide-react";

type SiteConfig = { id: number; key: string; value: string; description: string };

const QUICK_MENU_META = [
  { key: "hero_icon_1_url", label: "예배 안내", FallbackIcon: Clock,    color: "bg-primary" },
  { key: "hero_icon_2_url", label: "오시는 길", FallbackIcon: MapPin,   color: "bg-accent-gold" },
  { key: "hero_icon_3_url", label: "새가족 안내", FallbackIcon: UserPlus, color: "bg-primary/80" },
  { key: "hero_icon_4_url", label: "온라인 예배", FallbackIcon: Youtube,  color: "bg-red-500" },
] as const;

export default function SiteSettings() {
  const qc = useQueryClient();
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const { data: configs = [] } = useQuery<SiteConfig[]>({
    queryKey: ["site-config"],
    queryFn: () => api.get<SiteConfig[]>("/site-config"),
  });

  const cfg = (key: string) => configs.find((c) => c.key === key)?.value ?? "";

  const patchMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      api.patch(`/site-config/${key}`, { value }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["site-config"] });
      toast.success("저장되었습니다");
    },
    onError: () => toast.error("저장 실패"),
  });

  const uploadImage = async (file: File, configKey: string) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다");
      return;
    }
    const res = await fetch("/api/layout-settings/upload-image", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!res.ok) { toast.error("이미지 업로드 실패"); return; }
    const { url } = await res.json() as { url: string };
    patchMutation.mutate({ key: configKey, value: url });
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>, configKey: string) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file, configKey);
    e.target.value = "";
  };

  const handleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    if (value && value !== cfg("church_name")) {
      patchMutation.mutate({ key: "church_name", value });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">사이트 설정</h1>
        <p className="text-muted-foreground mt-2">교회 이름, 로고, 퀵메뉴 아이콘을 설정하세요</p>
      </div>

      {/* 교회 기본 정보 */}
      <Card className="elegant-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            교회 기본 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 교회 이름 */}
          <div className="space-y-2">
            <Label>교회 이름</Label>
            <div className="flex gap-2">
              <Input
                key={cfg("church_name")}
                defaultValue={cfg("church_name")}
                onBlur={handleNameBlur}
                placeholder="교회 이름 입력"
              />
            </div>
            <p className="text-xs text-muted-foreground">헤더 로고 영역에 표시됩니다</p>
          </div>

          {/* 교회 로고 */}
          <div className="space-y-2">
            <Label>교회 로고 이미지</Label>
            <div className="flex items-start gap-4">
              {cfg("church_logo_url") ? (
                <div className="relative w-24 h-24 border rounded-xl overflow-hidden bg-muted/30 flex items-center justify-center group">
                  <img
                    src={cfg("church_logo_url")}
                    alt="교회 로고"
                    className="max-w-full max-h-full object-contain p-1"
                  />
                  <button
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    onClick={() => patchMutation.mutate({ key: "church_logo_url", value: "" })}
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ) : (
                <div className="w-24 h-24 border-2 border-dashed rounded-xl flex items-center justify-center bg-muted/30 text-muted-foreground">
                  <Globe className="h-8 w-8" />
                </div>
              )}
              <div className="space-y-2">
                <Button variant="outline" size="sm" onClick={() => logoInputRef.current?.click()}>
                  <Upload className="h-4 w-4 mr-2" />
                  로고 업로드
                </Button>
                <p className="text-xs text-muted-foreground">
                  PNG/SVG 권장 · 투명 배경 가능<br />
                  업로드하지 않으면 텍스트 로고가 표시됩니다
                </p>
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFile(e, "church_logo_url")}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 홈 퀵메뉴 아이콘 */}
      <Card className="elegant-shadow">
        <CardHeader>
          <CardTitle>홈 퀵메뉴 아이콘</CardTitle>
          <p className="text-sm text-muted-foreground">
            아이콘을 업로드하지 않으면 기본 아이콘이 표시됩니다
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {QUICK_MENU_META.map(({ key, label, FallbackIcon, color }, idx) => {
              const url = cfg(key);
              return (
                <div key={key} className="flex items-center gap-3 p-3 border rounded-xl bg-muted/20">
                  {/* 아이콘 미리보기 */}
                  <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group overflow-hidden ${url ? "bg-muted/40" : `${color}`}`}>
                    {url ? (
                      <>
                        <img src={url} alt={label} className="w-10 h-10 object-contain" />
                        <button
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                          onClick={() => patchMutation.mutate({ key, value: "" })}
                        >
                          <X className="h-4 w-4 text-white" />
                        </button>
                      </>
                    ) : (
                      <FallbackIcon className="h-6 w-6 text-white" />
                    )}
                  </div>

                  {/* 정보 + 업로드 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {url ? "커스텀 이미지 적용됨" : "기본 아이콘 사용 중"}
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => iconRefs[idx].current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5" />
                  </Button>
                  <input
                    ref={iconRefs[idx]}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e, key)}
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
