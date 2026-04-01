import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { stripHtml } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Link } from "wouter";
import {
  FileText,
  Video as VideoIcon,
  X,
  ArrowRight,
  Calendar,
  ExternalLink,
  MapPin,
  Clock,
  UserPlus,
  Youtube,
} from "lucide-react";
import PublicHeader from "@/components/PublicHeader";

// ?대?吏 媛ㅻ윭由??곗뒪?ы깙 ??????Tailwind ?대옒??
const GALLERY_COLS_CLASS: Record<number, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6",
};

// colSpan(12??湲곗?) ??Tailwind col-span ?대옒??
const COL_SPAN_CLASS: Record<number, string> = {
  3: "lg:col-span-3",
  4: "lg:col-span-4",
  6: "lg:col-span-6",
  8: "lg:col-span-8",
  9: "lg:col-span-9",
  12: "lg:col-span-12",
};

// ??? ?덉뼱濡?罹먮윭? ????????????????????????????????????????????????????????????

function HeroCarousel({ slides }: { slides: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIdx, setSelectedIdx] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    if (!emblaApi || slides.length <= 1) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [emblaApi, slides.length]);

  return (
    <div className="relative overflow-hidden">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {slides.map((slide, i) => (
            <div key={slide.id ?? i} className="flex-none w-full">

              {/* ?? ?띿뒪?몃쭔 ?? */}
              {slide.type === "text" && (
                <div className="relative py-24 lg:py-32">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,var(--color-primary)_0%,transparent_25%)] opacity-[0.03]" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,var(--accent-gold)_0%,transparent_25%)] opacity-[0.05]" />
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                        Love God, Love Neighbors
                      </div>
                      <h1 className="text-5xl md:text-7xl font-black tracking-tight text-foreground leading-[1.1]">
                        {slide.title || "영신교회에 오신 것을 환영합니다"}
                      </h1>
                      {slide.subtitle && (
                        <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ?? 醫뚯슦 遺꾪븷: ?대?吏 ?쇱そ / ?띿뒪???ㅻⅨ履??? */}
              {slide.type === "image_split" && (
                <div className="flex flex-col md:flex-row min-h-[480px] lg:min-h-[520px]">
                  <div className="flex-1 relative overflow-hidden min-h-[240px]">
                    {slide.imageUrl && (
                      <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 flex items-center justify-center bg-white px-8 py-12 md:py-0">
                    <div className="max-w-sm space-y-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold tracking-widest uppercase">
                        Love God, Love Neighbors
                      </div>
                      {slide.title && (
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.15]">
                          {slide.title}
                        </h1>
                      )}
                      {slide.subtitle && (
                        <p className="text-lg text-muted-foreground font-medium">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ?? ?띿뒪???섎떒: ?대?吏 ?꾩껜 + 洹몃씪?붿뼵??+ ?띿뒪???섎떒 怨좎젙 ?? */}
              {slide.type === "image_bottom" && (
                <div className="relative min-h-[480px] lg:min-h-[520px] flex items-end">
                  {slide.imageUrl && (
                    <img src={slide.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="relative z-10 text-white w-full px-8 pb-12 lg:px-16 lg:pb-16">
                    {slide.title && (
                      <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.15]">
                        {slide.title}
                      </h1>
                    )}
                    {slide.subtitle && (
                      <p className="text-lg md:text-xl font-medium mt-2 opacity-90 max-w-2xl">
                        {slide.subtitle}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ?? ?대?吏 (?띿뒪???좏깮???ㅻ쾭?덉씠) ?? */}
              {slide.type === "image" && slide.imageUrl && (
                <div className="relative">
                  <img src={slide.imageUrl} alt={slide.title || ""} className="w-full object-cover max-h-[580px]" />
                  {(slide.title || slide.subtitle) && (
                    <>
                      <div className="absolute inset-0 bg-black/40" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                        {slide.title && (
                          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-[1.15] drop-shadow-lg">
                            {slide.title}
                          </h1>
                        )}
                        {slide.subtitle && (
                          <p className="text-lg md:text-xl font-medium mt-3 opacity-90 max-w-2xl drop-shadow">
                            {slide.subtitle}
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}

            </div>
          ))}
        </div>
      </div>

      {/* ?꾪듃 ?몃뵒耳?댄꽣 */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${i === selectedIdx ? "bg-primary w-6" : "bg-primary/30 w-2"}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ??? ?대?吏 媛ㅻ윭由?罹먮윭? (紐⑤컮???꾩슜) ??????????????????????????????????????

function GalleryCarousel({ images }: { images: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIdx, setSelectedIdx] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIdx(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
    return () => { emblaApi.off("select", onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div ref={emblaRef} className="overflow-hidden">
        <div className="flex touch-pan-y">
          {images.map((item, i) => (
            <div key={item.id ?? i} className="flex-none w-full px-1">
              <div className="aspect-square relative overflow-hidden rounded-xl elegant-shadow">
                <img src={item.url} alt={item.title}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-3">
                  <p className="text-white font-bold text-sm line-clamp-1">{item.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {images.length > 1 && (
        <div className="flex justify-center gap-1.5 mt-3">
          {images.map((_, i) => (
            <button key={i} onClick={() => emblaApi?.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === selectedIdx ? "bg-primary w-5" : "bg-primary/30 w-1.5"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

// ?????????????????????????????????????????????????????????????????????????????

export default function PublicView() {
  const [floatingMessage, setFloatingMessage] = useState<any>(null);
  const [showFloating, setShowFloating] = useState(false);
  const [popup, setPopup] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);

  const { data: homeData } = useQuery({
    queryKey: ["public", "home-data"],
    queryFn: () => api.get<any>("/public/home-data"),
    staleTime: 60 * 1000,
  });

  const layoutSettings: any[] = homeData?.layoutSettings ?? [];
  const announcements: any[] = homeData?.announcements ?? [];
  const images: any[] = homeData?.images ?? [];
  const videos: any[] = homeData?.videos ?? [];
  const siteConfigs: any[] = homeData?.siteConfigs ?? [];
  const heroSlides: any[] = homeData?.heroSlides ?? [];
  const floatingMessages: any[] = homeData?.floatingMessages ?? [];
  const popups: any[] = homeData?.popups ?? [];
  const categoryForest: any[] = homeData?.categoryForest ?? [];
  const sectionDataById: Record<string, any> = homeData?.sectionDataById ?? {};

  const cfg = (key: string) =>
    siteConfigs.find((c: any) => c.key === key)?.value ?? "";
  useEffect(() => {
    if (floatingMessages && floatingMessages.length > 0) {
      setFloatingMessage(floatingMessages[0]);
      setShowFloating(true);
    }
  }, [floatingMessages]);

  useEffect(() => {
    if (popups && popups.length > 0) {
      const currentPopup = popups[0];
      const dontShowUntil = localStorage.getItem(
        `popup_hide_${currentPopup.id}`
      );

      if (!dontShowUntil || new Date().getTime() > parseInt(dontShowUntil)) {
        setPopup(currentPopup);
        setShowPopup(true);
      }
    }
  }, [popups]);

  const handleClosePopup = (dontShowToday: boolean = false) => {
    if (dontShowToday && popup) {
      // 24?쒓컙 ?ㅼ쓽 ??꾩뒪?ы봽 ???
      const expiry = new Date().getTime() + 24 * 60 * 60 * 1000;
      localStorage.setItem(`popup_hide_${popup.id}`, expiry.toString());
    }
    setShowPopup(false);
  };

  const visibleSections =
    layoutSettings
      ?.filter(s => s.status === "visible")
      .sort((a, b) => a.displayOrder - b.displayOrder) || [];

  const heroSection = visibleSections.find(s => s.sectionType === "hero");
  const dataSections = visibleSections.filter(s => s.sectionType !== "hero");
  const getSectionKey = (section: any) => String(section.id ?? section.sectionType);

  // ?뱀뀡 ?????몃뜳??留ㅽ븨 (colSpan ?⑹씠 12 ?섎㈃ ?ㅼ쓬 ??
  const sectionRowIndex: Record<string, number> = {};
  let rowIdx = 0,
    rowSum = 0;
  for (const s of dataSections) {
    sectionRowIndex[getSectionKey(s)] = rowIdx;
    rowSum += s.colSpan ?? 12;
    if (rowSum >= 12) {
      rowIdx++;
      rowSum = 0;
    }
  }

  const ROW_BG = ["bg-white", "bg-secondary/40"] as const;

  // ?? ?뚮뜑????????????????????????????????????????????????????????????????????

  const renderHero = (section: any) => {
    const slides =
      heroSlides && heroSlides.length > 0
        ? heroSlides
        : [{ id: 0, type: "text", title: section.title, subtitle: section.subtitle, imageUrl: null }];

    const quickMenuItems = [
      { icon: Clock,    label: "예배 안내",   color: "bg-primary",    href: "/church/worship",      iconUrl: cfg("hero_icon_1_url") },
      { icon: MapPin,   label: "오시는 길",   color: "bg-accent-gold", href: "/church/directions",   iconUrl: cfg("hero_icon_2_url") },
      { icon: UserPlus, label: "새가족 안내", color: "bg-primary/80", href: "/community/new-member", iconUrl: cfg("hero_icon_3_url") },
      { icon: Youtube,  label: "온라인 예배", color: "bg-red-500",    href: "/sermons/sunday",       iconUrl: cfg("hero_icon_4_url") },
    ];

    return (
      <section key={getSectionKey(section)} className="bg-white overflow-hidden">
        <HeroCarousel slides={slides} />

        {/* ??硫붾돱 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickMenuItems.map((item, idx) => (
              <Link key={idx} href={item.href}>
                <div className="group cursor-pointer flex flex-col items-center gap-4 p-6 rounded-3xl bg-white border border-border/50 elegant-shadow hover:elegant-shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <div className="group-hover:scale-110 transition-transform duration-300">
                    {item.iconUrl ? (
                      <img src={item.iconUrl} alt={item.label} className="h-14 w-14 object-contain" />
                    ) : (
                      <div className={`p-4 rounded-2xl ${item.color} text-white shadow-lg shadow-current/10`}>
                        <item.icon className="h-8 w-8" />
                      </div>
                    )}
                  </div>
                  <span className="font-bold text-lg">{item.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  };

  const renderContentCategorySection = (section: any, innerCls: string, narrow: boolean, mid: boolean, full: boolean, rowBg: string) => {
    const data = sectionDataById[String(section.id)];
    if (!data || data.kind !== "content_category") return null;

    const title = section.title || data.category?.name || "카테고리";
    const subtitle = section.subtitle || null;
    const categoryHref = data.category?.href;
    const children: any[] = data.children ?? [];
    const page = data.page;
    const variant = section.displayVariant ?? (narrow ? "links" : "grid");

    return (
      <section key={getSectionKey(section)} className={`py-12 lg:py-16 h-full ${rowBg}`}>
        <div className={innerCls}>
          <div className={`mb-6 lg:mb-8 space-y-2 ${full ? "text-center" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={`font-bold tracking-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}>
                {title}
              </h2>
              {categoryHref && (
                <Link href={categoryHref}>
                  <Button variant="ghost" size="sm" className="shrink-0 text-primary font-bold">
                    전체보기
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          {children.length > 0 ? (
            variant === "links" ? (
              <div className="divide-y divide-border rounded-2xl border bg-white">
                {children.map((item) => (
                  <Link key={item.id} href={item.href ?? "#"}>
                    <div className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        {item.pageTitle && (
                          <p className="text-sm text-muted-foreground">{item.pageTitle}</p>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className={`grid gap-4 ${narrow ? "grid-cols-1" : mid ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
                {children.map((item) => (
                  <Link key={item.id} href={item.href ?? "#"}>
                    <Card className="h-full border-none shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">{item.name}</CardTitle>
                        {item.pageTitle && (
                          <CardDescription>{item.pageTitle}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center text-primary text-sm font-semibold">
                          페이지 보기
                          <ArrowRight className="ml-2 h-3.5 w-3.5" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )
          ) : page?.href ? (
            <Link href={page.href}>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle>{page.title}</CardTitle>
                  <CardDescription>{title} 페이지로 이동합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-primary text-sm font-semibold">
                    페이지 열기
                    <ArrowRight className="ml-2 h-3.5 w-3.5" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : null}
        </div>
      </section>
    );
  };

  const renderMediaCategorySection = (section: any, innerCls: string, narrow: boolean, mid: boolean, full: boolean, rowBg: string) => {
    const data = sectionDataById[String(section.id)];
    if (!data || data.kind !== "media_category" || !data.items?.length) return null;

    const title = section.title || data.category?.name || "미디어";
    const subtitle = section.subtitle || null;
    const moreHref = data.category?.href;
    const variant = section.displayVariant ?? (narrow ? "list" : "featured");
    const items: any[] = data.items;

    const getEmbedUrl = (item: any) => {
      if (item.videoType === "youtube") {
        const id = item.url.includes("youtu.be")
          ? item.url.split("/").pop()
          : new URL(item.url).searchParams.get("v");
        return id ? `https://www.youtube.com/embed/${id}` : item.url;
      }
      if (item.videoType === "vimeo") {
        const id = item.url.split("/").pop();
        return id ? `https://player.vimeo.com/video/${id}` : item.url;
      }
      return item.url;
    };

    return (
      <section key={getSectionKey(section)} className={`py-12 lg:py-16 h-full ${rowBg}`}>
        <div className={innerCls}>
          <div className={`mb-6 lg:mb-8 space-y-2 ${full ? "text-center" : ""}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className={`font-bold tracking-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}>
                {title}
              </h2>
              {moreHref && (
                <Link href={moreHref}>
                  <Button variant="ghost" size="sm" className="shrink-0 text-primary font-bold">
                    전체보기
                    <ArrowRight className="ml-1 h-3 w-3" />
                  </Button>
                </Link>
              )}
            </div>
            {subtitle && <p className="text-muted-foreground">{subtitle}</p>}
          </div>

          {variant === "featured" && items[0]?.mediaType === "video" ? (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10">
                <iframe
                  src={getEmbedUrl(items[0])}
                  className="h-full w-full"
                  allowFullScreen
                  title={items[0].title}
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold">{items[0].title}</h3>
                {items[0].description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{items[0].description}</p>
                )}
              </div>
              {items.length > 1 && (
                <div className={`grid gap-3 ${mid ? "md:grid-cols-2" : "md:grid-cols-3"}`}>
                  {items.slice(1).map((item) => (
                    <Card key={item.id} className="border-none shadow-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                        {item.description && (
                          <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                        )}
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={`grid gap-4 ${narrow ? "grid-cols-1" : mid ? "md:grid-cols-2" : "md:grid-cols-2 xl:grid-cols-3"}`}>
              {items.map((item) => (
                <Card key={item.id} className="overflow-hidden border-none shadow-sm">
                  {item.mediaType === "image" ? (
                    <div className="aspect-square overflow-hidden bg-muted">
                      <img src={item.url} alt={item.title} className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="aspect-video overflow-hidden bg-muted">
                      <iframe src={getEmbedUrl(item)} className="h-full w-full" allowFullScreen title={item.title} />
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base line-clamp-2">{item.title}</CardTitle>
                    {item.description && (
                      <CardDescription className="line-clamp-2">{item.description}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderSection = (section: any, rowBg: string) => {
    const span: number = section.colSpan ?? 12;
    const narrow = span <= 4; // ??1/3
    const mid = span <= 6; // ??1/2
    const full = span >= 12;

    // 諛곌꼍? section(?釉붾━??, 肄섑뀗痢좊뒗 inner div?먯꽌 ?⑤뵫?쇰줈 ?뺣젹
    const innerCls = full
      ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      : "px-4 sm:px-6 lg:px-8";

    switch (section.sectionType) {
      case "announcements":
        if (!announcements || announcements.length === 0) return null;
        return (
          <section
            key="announcements"
            id="announcements"
            className={`py-12 lg:py-16 h-full ${rowBg}`}
          >
            <div className={innerCls}>
              {/* ?ㅻ뜑 */}
              <div
                className={`flex items-center justify-between gap-3 ${narrow ? "mb-4" : "mb-8"}`}
              >
                <h2
                  className={`font-bold leading-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}
                >
                  {section.title || "援먰쉶 ?뚯떇"}
                </h2>
                <Link href="/news/announcements">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group text-primary font-bold shrink-0 text-xs"
                  >
                    ?꾩껜蹂닿린{" "}
                    <ArrowRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* narrow: 而댄뙥??由ъ뒪??*/}
              {narrow && (
                <ul className="divide-y divide-border">
                  {announcements.slice(0, 5).map(item => (
                    <li key={item.id}>
                      <Link href={`/announcements/${item.id}`}>
                        <div className="flex items-center gap-3 py-2.5 group hover:text-primary transition-colors">
                          <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                            {new Date(item.createdAt).toLocaleDateString(
                              "ko-KR",
                              { month: "2-digit", day: "2-digit" }
                            )}
                          </span>
                          <span className="text-sm font-medium line-clamp-1 group-hover:text-primary">
                            {item.title}
                          </span>
                          <ArrowRight className="h-3 w-3 shrink-0 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {/* mid: ??댄?+?좎쭨 移대뱶, 1??*/}
              {!narrow && mid && (
                <div className="grid gap-2">
                  {announcements.slice(0, 4).map(item => (
                    <Link key={item.id} href={`/announcements/${item.id}`}>
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow group cursor-pointer">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold line-clamp-1 group-hover:text-primary transition-colors">
                            {item.title}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {stripHtml(item.content)}
                          </p>
                        </div>
                        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
                          {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* full: ? 移대뱶, auto-fit (??ぉ ?섏뿉 ?곕씪 ?ш린 議곗젙) */}
              {!narrow && !mid && (
                <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(260px,1fr))]">
                  {announcements.slice(0, 6).map(item => (
                    <Link key={item.id} href={`/announcements/${item.id}`}>
                      <Card className="border-none shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer overflow-hidden rounded-2xl h-full">
                        <CardHeader className="bg-white pb-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-primary mb-2">
                            <Calendar className="h-3.5 w-3.5" />
                            {new Date(item.createdAt).toLocaleDateString(
                              "ko-KR"
                            )}
                          </div>
                          <CardTitle className="group-hover:text-primary transition-colors line-clamp-1 text-lg">
                            {item.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="bg-white">
                          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed mb-3">
                            {stripHtml(item.content)}
                          </p>
                          <div className="flex items-center text-primary text-xs font-bold uppercase tracking-wider">
                            ?먯꽭??蹂닿린{" "}
                            <ArrowRight className="h-3 w-3 ml-2 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        );

      case "images": {
        const displayImages = (images ?? []).filter((img: any) => img.showOnHome);
        if (displayImages.length === 0) return null;
        const gridCols: number = section.gridCols ?? 4;
        const toShow = displayImages;
        const desktopCols = narrow ? "sm:grid-cols-2" : mid ? "sm:grid-cols-3" : (GALLERY_COLS_CLASS[gridCols] ?? "sm:grid-cols-4");
        return (
          <section key="images" className={`py-12 lg:py-16 h-full ${rowBg}`}>
            <div className={innerCls}>
              <div className={`${full ? "text-center" : ""} mb-6 lg:mb-8 space-y-1`}>
                <h2 className={`font-bold tracking-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}>
                  {section.title || "교회 갤러리"}
                </h2>
                {section.subtitle && !narrow && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">{section.subtitle}</p>
                )}
              </div>

              {/* 紐⑤컮?? 罹먮윭? */}
              <div className="sm:hidden">
                <GalleryCarousel images={toShow} />
              </div>

              {/* ?곗뒪?ы깙: 洹몃━??*/}
              <div className={`hidden sm:grid gap-2 grid-cols-2 ${desktopCols}`}>
                {toShow.map((item: any) => (
                  <div key={item.id}
                    className="aspect-square relative overflow-hidden rounded-lg group cursor-pointer border border-border/50 elegant-shadow"
                  >
                    <img src={item.url} alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2">
                      <p className="text-white font-bold text-xs line-clamp-1">{item.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      }

      case "videos":
        if (!videos || videos.length === 0) return null;
        return (
          <section key="videos" className={`py-12 lg:py-16 h-full ${rowBg}`}>
            <div className={innerCls}>
              <div
                className={`${full ? "text-center" : ""} mb-6 lg:mb-10 space-y-1`}
              >
                <h2
                  className={`font-bold tracking-tight ${narrow ? "text-lg" : mid ? "text-xl" : "text-3xl md:text-4xl"}`}
                >
                  {section.title || "理쒖떊 ?ㅺ탳"}
                </h2>
                {section.subtitle && !narrow && (
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    {section.subtitle}
                  </p>
                )}
              </div>
              <div className={full ? "max-w-2xl mx-auto w-full" : "w-full"}>
                {videos.slice(0, 1).map(item => {
                  const getEmbed = () => {
                    if (item.videoType === "youtube") {
                      const id = item.url.includes("youtu.be")
                        ? item.url.split("/").pop()
                        : new URL(item.url).searchParams.get("v");
                      return `https://www.youtube.com/embed/${id}`;
                    }
                    return item.url;
                  };
                  return (
                    <div key={item.id} className="space-y-3">
                      <div
                        className={`aspect-video overflow-hidden shadow-xl ring-1 ring-black/10 ${narrow ? "rounded-xl" : "rounded-2xl"}`}
                      >
                        <iframe
                          src={getEmbed()}
                          className="w-full h-full"
                          allowFullScreen
                          title={item.title}
                        />
                      </div>
                      <div className="space-y-1">
                        <h3
                          className={`font-bold ${narrow ? "text-base" : "text-xl"}`}
                        >
                          {item.title}
                        </h3>
                        {item.description && !narrow && (
                          <p className="text-muted-foreground line-clamp-2 text-sm">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );

      case "image_a":
      case "image_b":
        if (!section.imageUrl) return null;
        return (
          <section
            key={getSectionKey(section)}
            className={`py-8 lg:py-12 h-full ${rowBg}`}
          >
            <div className={innerCls}>
              <img
                src={section.imageUrl}
                alt={section.title || ""}
                className={`w-full object-contain shadow-lg ${narrow ? "rounded-xl" : "rounded-2xl"}`}
              />
            </div>
          </section>
        );

      case "content_category":
        return renderContentCategorySection(section, innerCls, narrow, mid, full, rowBg);

      case "media_category":
        return renderMediaCategorySection(section, innerCls, narrow, mid, full, rowBg);

      default:
        return null;
    }
  };

  const getFloatingPosition = () => {
    switch (floatingMessage?.displayPosition) {
      case "top":
        return "top-20";
      case "bottom":
        return "bottom-8";
      default:
        return "top-1/2 -translate-y-1/2";
    }
  };

  const getFloatingColor = () => {
    switch (floatingMessage?.messageType) {
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-900";
      case "success":
        return "bg-green-50 border-green-200 text-green-900";
      case "announcement":
        return "bg-purple-50 border-purple-200 text-purple-900";
      default:
        return "bg-white border-border";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicHeader preloadedSiteConfigs={siteConfigs} preloadedCategoryForest={categoryForest} />

      <main>
        {heroSection && renderHero(heroSection)}

        {/* ?곗씠???뱀뀡 洹몃━??- 12??湲곗? colSpan */}
        <div className="grid lg:grid-cols-12">
          {dataSections.map((section, idx) => {
            const sectionKey = getSectionKey(section);
            const rowBg = ROW_BG[sectionRowIndex[sectionKey] % 2];
            const content = renderSection(section, rowBg);
            if (!content) return null;
            const prevSection = dataSections[idx - 1];
            const isFirstInRow =
              !prevSection ||
              sectionRowIndex[getSectionKey(prevSection)] !== sectionRowIndex[sectionKey];
            return (
              <div
                key={sectionKey}
                className={`${COL_SPAN_CLASS[section.colSpan] ?? "lg:col-span-12"} ${!isFirstInRow ? "lg:border-l border-border/30" : ""}`}
              >
                {content}
              </div>
            );
          })}
        </div>
      </main>

      <footer className="bg-white border-t py-20">
        <div className="container">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-6 col-span-1 lg:col-span-2">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">
                  영신교회
                </span>
                <span className="text-sm font-medium text-muted-foreground tracking-tighter">
                  하나님 사랑 이웃 사랑
                </span>
              </div>
              <p className="text-muted-foreground max-w-sm">
                영신교회는 하나님을 향한 바른 예배와 이웃을 향한 사랑의 실천을 추구하는
                믿음의 공동체입니다.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-lg">교회 안내</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li>
                  <Link href="/church/about">교회 소개</Link>
                </li>
                <li>
                  <Link href="/church/worship">예배 안내</Link>
                </li>
                <li>
                  <Link href="/church/directions">오시는 길</Link>
                </li>
              </ul>
            </div>
            <div className="space-y-6">
              <h3 className="font-bold text-lg">연락처</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" /> 주소: 서울특별시 양천구 목동로 19길 28
                </li>
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" /> 전화: 02-123-4567
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground font-medium">
            <p>© 2026 영신교회. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy">개인정보처리방침</Link>
              <Link href="/admin">관리자 로그인</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ?앹뾽 紐⑤떖 */}
      {showPopup && popup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => handleClosePopup()}
        >
          <div
            className="relative bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in duration-300"
            onClick={e => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4 z-10 h-8 w-8 p-0 bg-black/10 hover:bg-black/20 rounded-full"
              onClick={() => handleClosePopup()}
            >
              <X className="h-4 w-4" />
            </Button>
            {popup.imageUrl &&
              (popup.linkUrl ? (
                <a
                  href={popup.linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => handleClosePopup()}
                >
                  <img
                    src={popup.imageUrl}
                    alt={popup.title}
                    className="w-full object-contain cursor-pointer"
                  />
                </a>
              ) : (
                <img
                  src={popup.imageUrl}
                  alt={popup.title}
                  className="w-full object-contain"
                />
              ))}
            <div className="p-6 flex items-center justify-between gap-4 bg-white border-t">
              <div className="flex flex-col gap-1">
                <p className="font-bold">{popup.title}</p>
                <button
                  className="text-xs text-muted-foreground hover:text-primary transition-colors text-left font-medium"
                  onClick={() => handleClosePopup(true)}
                >
                  ?ㅻ뒛 ?섎（ 蹂댁? ?딄린
                </button>
              </div>
              <div className="flex items-center gap-4">
                {popup.linkUrl && (
                  <a
                    href={popup.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                    onClick={() => handleClosePopup()}
                  >
                    ?먯꽭??蹂닿린 <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                <button
                  className="text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => handleClosePopup()}
                >
                  ?リ린
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ?뚮줈??硫붿떆吏 */}
      {showFloating && floatingMessage && (
        <div
          className={`fixed ${getFloatingPosition()} right-4 z-50 max-w-sm w-full animate-in slide-in-from-right duration-500`}
        >
          <Card
            className={`shadow-2xl border-none rounded-2xl overflow-hidden ${getFloatingColor()}`}
          >
            <div className="p-5 relative">
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-black/5"
                onClick={() => setShowFloating(false)}
              >
                <X className="h-4 w-4" />
              </Button>
              <div className="space-y-2">
                <h4 className="font-bold pr-6">{floatingMessage.title}</h4>
                <p className="text-sm leading-relaxed">
                  {floatingMessage.content}
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}




