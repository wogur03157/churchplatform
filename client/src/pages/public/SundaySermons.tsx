import PublicPageLayout from "@/components/PublicPageLayout";
import SermonList from "./SermonList";

export default function SundaySermons() {
  return (
    <PublicPageLayout>
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-5xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">SUNDAY SERVICE</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">주일설교</h1>
          <p className="text-brand-brown/60 text-lg">주일예배 설교 영상을 모아 볼 수 있습니다.</p>
        </div>
      </div>
      <div className="container py-12 max-w-5xl">
        <SermonList category="sunday" title="주일설교" />
      </div>
    </PublicPageLayout>
  );
}
