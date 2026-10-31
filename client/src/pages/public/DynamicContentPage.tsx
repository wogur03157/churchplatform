import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { api } from "@/lib/api";
import PublicPageLayout from "@/components/PublicPageLayout";
import type { ContentCategory, ContentPage, ContentPageMedia } from "@shared/entities";

type PublicContentPage = ContentPage & {
  media: ContentPageMedia[];
  category: ContentCategory;
  rootCategory: ContentCategory;
  siblings: ContentCategory[];
  ancestors: ContentCategory[];
};

function renderVideo(url: string, title: string) {
  return <iframe src={url} className="h-full w-full" allowFullScreen title={title} />;
}

function renderContent(html: string | null) {
  if (!html) return null;
  return <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: html }} />;
}

export default function DynamicContentPage({ rootSlug = "church" }: { rootSlug?: string }) {
  const params = useParams<{ slug1?: string; slug2?: string; slug3?: string }>();
  const slugs = [params.slug1, params.slug2, params.slug3].filter(Boolean) as string[];
  const apiPath = slugs.join("/");

  const { data, isLoading } = useQuery<PublicContentPage | null>({
    queryKey: ["content-pages", "public", rootSlug, ...slugs],
    queryFn: () => api.get<PublicContentPage>(`/content-pages/public/${rootSlug}/${apiPath}`),
    enabled: slugs.length > 0,
  });

  const mediaBySlot = useMemo(() => {
    const bucket = new Map<string, ContentPageMedia[]>();
    for (const item of data?.media ?? []) {
      const list = bucket.get(item.slotKey) ?? [];
      list.push(item);
      bucket.set(item.slotKey, list);
    }
    return bucket;
  }, [data?.media]);

  const parentTrail = (data?.ancestors ?? []).slice(0, -1);
  const siblingBasePath = ["/" + rootSlug, ...parentTrail.map((item) => item.slug)].join("/");

  if (isLoading) {
    return (
      <PublicPageLayout>
        <div className="container py-16">
          <div className="mb-4 h-8 w-48 animate-pulse rounded bg-brand-cream" />
          <div className="h-4 w-96 animate-pulse rounded bg-brand-cream" />
        </div>
      </PublicPageLayout>
    );
  }

  if (!data) {
    return (
      <PublicPageLayout>
        <div className="container max-w-3xl py-16 text-center">
          <p className="text-brand-brown/50">아직 공개된 페이지가 없습니다.</p>
        </div>
      </PublicPageLayout>
    );
  }

  const hero = mediaBySlot.get("hero")?.[0] ?? null;
  const sideImage = mediaBySlot.get("side_img")?.[0] ?? null;
  const inlineImages = mediaBySlot.get("inline") ?? [];
  const gallery = mediaBySlot.get("gallery") ?? [];
  const boardItems = mediaBySlot.get("item_thumb") ?? [];

  return (
    <PublicPageLayout>
      {/* Page header */}
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-10">
        <div className="container max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">
            {[data.rootCategory.name, ...parentTrail.map((item) => item.name)].join(" · ")}
          </p>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-brand-brown">{data.title}</h1>
          {data.siblings.length > 1 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {data.siblings.map((item) => (
                <Link key={item.id} href={`${siblingBasePath}/${item.slug}`}>
                  <a className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    item.id === data.category.id
                      ? "bg-brand-brown text-brand-cream"
                      : "bg-white/70 text-brand-brown/70 hover:bg-white border border-brand-gold/30"
                  }`}>
                    {item.name}
                  </a>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="container space-y-10 py-12">

        {data.templateCode === "hero" && hero && (
          <div className="aspect-[16/7] overflow-hidden rounded-3xl border border-brand-gold/20 bg-brand-cream/50">
            {hero.mediaType === "video" ? renderVideo(hero.url, data.title) : <img src={hero.url} alt={hero.altText ?? data.title} className="h-full w-full object-cover" />}
          </div>
        )}

        {data.templateCode === "gallery" && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {gallery.map((item) => (
              <div key={item.id} className="aspect-[4/3] overflow-hidden rounded-2xl border border-brand-gold/20 bg-brand-cream/50">
                {item.mediaType === "video" ? renderVideo(item.url, data.title) : <img src={item.url} alt={item.altText ?? data.title} className="h-full w-full object-cover" />}
              </div>
            ))}
          </div>
        )}

        {data.templateCode === "board" && (
          <div className="grid gap-4 md:grid-cols-2">
            {boardItems.map((item) => (
              <div key={item.id} className="rounded-2xl overflow-hidden border border-brand-gold/20 bg-white shadow-sm">
                <div className="aspect-[16/9] overflow-hidden bg-brand-cream/50">
                  {item.mediaType === "video" ? renderVideo(item.url, data.title) : <img src={item.url} alt={item.altText ?? data.title} className="h-full w-full object-cover" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {data.templateCode === "content" && sideImage ? (
          <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              {renderContent(data.content)}
              {inlineImages.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {inlineImages.map((item) => (
                    <img key={item.id} src={item.url} alt={item.altText ?? data.title} className="w-full rounded-2xl border border-brand-gold/20 object-cover" />
                  ))}
                </div>
              )}
            </div>
            <div className="overflow-hidden rounded-2xl border border-brand-gold/20 bg-brand-cream/50">
              <img src={sideImage.url} alt={sideImage.altText ?? data.title} className="h-full w-full object-cover" />
            </div>
          </div>
        ) : (
          renderContent(data.content)
        )}
      </div>
    </PublicPageLayout>
  );
}
