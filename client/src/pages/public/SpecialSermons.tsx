import PublicPageLayout from "@/components/PublicPageLayout";
import SermonList from "./SermonList";

export default function SpecialSermons() {
  return (
    <PublicPageLayout>
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">SPECIAL</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">특별설교</h1>
          <p className="text-brand-brown/60 text-lg">부흥회와 절기, 특별 집회 설교 영상을 확인할 수 있습니다.</p>
        </div>
      </div>
      <div className="container py-12 max-w-5xl">
        <SermonList category="special" title="특별설교" />
      </div>
    </PublicPageLayout>
  );
}
