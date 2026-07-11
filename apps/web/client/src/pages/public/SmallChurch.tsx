import PublicPageLayout from "@/components/PublicPageLayout";
import { Heart } from "lucide-react";

export default function SmallChurch() {
  return (
    <PublicPageLayout>
      <div className="container py-16 max-w-4xl">
        <h1 className="text-4xl font-bold mb-4">작은교회</h1>
        <p className="text-muted-foreground text-lg mb-12">가정 같은 따뜻한 공동체</p>

        <div className="space-y-10">
          <section className="p-8 bg-primary/5 border border-primary/20 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">작은교회란?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              작은교회는 5~12명이 모여 함께 예배하고, 말씀을 나누며, 서로의 삶을 돌보는 소그룹 공동체입니다.
              큰 교회 안의 작은 교회로서 진정한 교제와 영적 성장을 이루어 나갑니다.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-6">작은교회 활동</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { icon: "📖", title: "말씀 나눔", desc: "주일 설교 말씀을 함께 묵상하고 나눕니다" },
                { icon: "🙏", title: "기도 모임",  desc: "서로를 위해 함께 기도하며 중보합니다" },
                { icon: "🤝", title: "삶의 나눔",  desc: "일상의 기쁨과 어려움을 함께 나눕니다" },
              ].map((a) => (
                <div key={a.title} className="p-5 border rounded-xl text-center">
                  <div className="text-3xl mb-3">{a.icon}</div>
                  <h3 className="font-semibold mb-2">{a.title}</h3>
                  <p className="text-sm text-muted-foreground">{a.desc}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">참여 안내</h2>
            <div className="p-6 border rounded-xl space-y-3 text-sm text-muted-foreground">
              <p>• 작은교회는 지역별로 편성되어 있습니다</p>
              <p>• 주중 저녁 또는 주말에 모입니다 (목자에 따라 상이)</p>
              <p>• 참여를 원하시면 교회 사무실 또는 담당 목사님께 문의해 주세요</p>
              <p>• 새가족은 새가족반 수료 후 배정됩니다</p>
            </div>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}
