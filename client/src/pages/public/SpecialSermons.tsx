import PublicPageLayout from "@/components/PublicPageLayout";
import SermonList from "./SermonList";

export default function SpecialSermons() {
  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">특별설교</h1>
        <p className="text-muted-foreground mb-10">부활절 · 성탄절 등 특별예배 설교 영상입니다</p>
        <SermonList category="special" title="특별설교" />
      </div>
    </PublicPageLayout>
  );
}
