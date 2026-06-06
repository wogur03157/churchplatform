import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, X, Clock, MapPin, UserPlus, Youtube, Globe, Palette, LayoutTemplate } from "lucide-react";

type SiteConfig = { id: number; key: string; value: string; description: string };

const QUICK_MENU_META = [
  { key: "hero_icon_1_url", bgKey: "hero_icon_1_bg_url", label: "예배 안내", FallbackIcon: Clock,    color: "bg-primary" },
  { key: "hero_icon_2_url", bgKey: "hero_icon_2_bg_url", label: "오시는 길", FallbackIcon: MapPin,   color: "bg-accent-gold" },
  { key: "hero_icon_3_url", bgKey: "hero_icon_3_bg_url", label: "새가족 안내", FallbackIcon: UserPlus, color: "bg-primary/80" },
  { key: "hero_icon_4_url", bgKey: "hero_icon_4_bg_url", label: "온라인 예배", FallbackIcon: Youtube,  color: "bg-red-500" },
] as const;

export default function SiteSettings() {
  const qc = useQueryClient();
  const [heroHeightLocal, setHeroHeightLocal] = useState<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const iconRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const iconBgRefs = [
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

  const handleConfigChange = (key: string, value: string) => {
    if (value !== cfg(key)) {
      patchMutation.mutate({ key, value });
    }
  };

  return (
    <div className="space-y-8 max-w-2xl pb-20">
      <div>
        <h1 className="text-3xl font-bold">사이트 설정</h1>
        <p className="text-muted-foreground mt-2">홈페이지의 전체적인 디자인과 정보를 관리합니다</p>
      </div>

      {/* 테마 및 디자인 설정 */}
      <Card className="elegant-shadow border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-primary" />
            테마 및 디자인
          </CardTitle>
          <p className="text-sm text-muted-foreground">홈페이지의 메인 색상과 배경을 설정하세요</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 메인 색상 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">메인 색상 (Navy 권장)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cfg("theme_primary_color") || "#002147"}
                  onChange={(e) => handleConfigChange("theme_primary_color", e.target.value)}
                  className="h-10 w-20 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                />
                <Input
                  value={cfg("theme_primary_color") || "#002147"}
                  onChange={(e) => handleConfigChange("theme_primary_color", e.target.value)}
                  className="font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">버튼, 포인트 텍스트, 헤더 강조 등에 사용됩니다</p>
            </div>

            {/* 강조 색상 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">강조 색상 (Yellow 권장)</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cfg("theme_accent_color") || "#facc15"}
                  onChange={(e) => handleConfigChange("theme_accent_color", e.target.value)}
                  className="h-10 w-20 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                />
                <Input
                  value={cfg("theme_accent_color") || "#facc15"}
                  onChange={(e) => handleConfigChange("theme_accent_color", e.target.value)}
                  className="font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">아이콘 배경, 배지, 주요 알림 포인트에 사용됩니다</p>
            </div>

            {/* 배경 색상 */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">배경 색상</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={cfg("theme_background_color") || "#ffffff"}
                  onChange={(e) => handleConfigChange("theme_background_color", e.target.value)}
                  className="h-10 w-20 rounded-lg cursor-pointer border-none p-0 overflow-hidden"
                />
                <Input
                  value={cfg("theme_background_color") || "#ffffff"}
                  onChange={(e) => handleConfigChange("theme_background_color", e.target.value)}
                  className="font-mono text-xs uppercase"
                />
              </div>
              <p className="text-[10px] text-muted-foreground">홈페이지의 전체 배경색입니다. 화이트(#FFFFFF)를 권장합니다</p>
            </div>

            {/* 테마 초기화 */}
            <div className="flex flex-col justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs"
                onClick={() => {
                   handleConfigChange("theme_primary_color", "#002147");
                   handleConfigChange("theme_accent_color", "#facc15");
                   handleConfigChange("theme_background_color", "#ffffff");
                }}
              >
                기본 테마(네이비&옐로우)로 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
                onBlur={(e) => handleConfigChange("church_name", e.target.value.trim())}
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

      {/* 레이아웃 크기 설정 */}
      <Card className="elegant-shadow border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5 text-primary" />
            레이아웃 크기
          </CardTitle>
          <p className="text-sm text-muted-foreground">배너와 퀵메뉴 아이콘의 크기를 조절하세요</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 배너 높이 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">배너 높이</Label>
              <span className="text-sm font-mono text-muted-foreground">{heroHeightLocal ?? (cfg("hero_height") || "480")}px</span>
            </div>
            <input
              type="range"
              min={280}
              max={750}
              step={10}
              value={heroHeightLocal ?? Number(cfg("hero_height") || 480)}
              onChange={(e) => setHeroHeightLocal(Number(e.target.value))}
              onPointerUp={(e) => {
                const val = (e.target as HTMLInputElement).value;
                patchMutation.mutate({ key: "hero_height", value: val });
                setHeroHeightLocal(null);
              }}
              className="w-full accent-primary"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>280px</span>
              <span>750px</span>
            </div>
          </div>

          {/* 퀵메뉴 크기 */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">퀵메뉴 아이콘 크기</Label>
            <div className="flex gap-2">
              {[
                { value: "sm", label: "소" },
                { value: "md", label: "중" },
                { value: "lg", label: "대" },
              ].map(({ value, label }) => {
                const active = (cfg("quick_menu_size") || "md") === value;
                return (
                  <button
                    key={value}
                    onClick={() => patchMutation.mutate({ key: "quick_menu_size", value })}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}
                  >
                    {label}
                  </button>
                );
              })}
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
            {QUICK_MENU_META.map(({ key, bgKey, label, FallbackIcon, color }, idx) => {
              const url = cfg(key);
              const bgUrl = cfg(bgKey);
              return (
                <div key={key} className="flex flex-col gap-2 p-3 border rounded-xl bg-muted/20">
                  <div className="flex items-center gap-3">
                    {/* 아이콘 미리보기 */}
                    <div
                      className={`relative w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group overflow-hidden ${!bgUrl && !url ? color : "bg-muted/40"}`}
                      style={bgUrl ? { backgroundImage: `url(${bgUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                    >
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

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {url ? "커스텀 아이콘 적용됨" : "기본 아이콘 사용 중"}
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => iconRefs[idx].current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      아이콘
                    </Button>
                    <input
                      ref={iconRefs[idx]}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e, key)}
                    />
                  </div>

                  {/* 배경 이미지 */}
                  <div className="flex items-center gap-2 pl-15">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground truncate">
                        배경: {bgUrl ? "이미지 적용됨" : "단색 사용 중"}
                      </p>
                    </div>
                    {bgUrl && (
                      <button
                        className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                        onClick={() => patchMutation.mutate({ key: bgKey, value: "" })}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0 text-xs"
                      onClick={() => iconBgRefs[idx].current?.click()}
                    >
                      <Upload className="h-3.5 w-3.5 mr-1" />
                      배경
                    </Button>
                    <input
                      ref={iconBgRefs[idx]}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFile(e, bgKey)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
