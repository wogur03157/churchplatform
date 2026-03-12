import PublicPageLayout from "@/components/PublicPageLayout";
import SermonList from "./SermonList";

export default function SundaySermons() {
  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-5xl">
        <h1 className="text-4xl font-bold mb-2">주일설교</h1>
        <p className="text-muted-foreground mb-10">주일예배 설교 영상입니다</p>
        <SermonList category="sunday" title="주일설교" />
      </div>
    </PublicPageLayout>
  );
}
