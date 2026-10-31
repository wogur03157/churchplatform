import PublicPageLayout from "@/components/PublicPageLayout";
import { Heart, BookOpen, Users2 } from "lucide-react";

const ACTIVITIES = [
  { icon: BookOpen, title: "말씀 나눔", desc: "주일 설교 말씀을 함께 묵상하고 나눕니다" },
  { icon: Heart,    title: "기도 모임", desc: "서로를 위해 함께 기도하며 중보합니다" },
  { icon: Users2,   title: "삶의 나눔", desc: "일상의 기쁨과 어려움을 함께 나눕니다" },
];

export default function SmallChurch() {
  return (
    <PublicPageLayout>
      {/* Page header */}
      <div className="bg-brand-cream/60 border-b border-brand-gold/20 py-12">
        <div className="container max-w-4xl">
          <p className="text-xs uppercase tracking-widest text-brand-sage font-medium mb-2">COMMUNITY</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold text-brand-brown mb-3">작은교회</h1>
          <p className="text-brand-brown/60 text-lg">가정 같은 따뜻한 공동체</p>
        </div>
      </div>

      <div className="container py-14 max-w-4xl">
        <div className="space-y-12">
          {/* 작은교회란? */}
          <section className="p-8 rounded-2xl bg-brand-sage/8 border border-brand-sage/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-brand-sage/15 flex items-center justify-center">
                <Heart className="h-5 w-5 text-brand-sage" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-brand-brown">작은교회란?</h2>
            </div>
            <p className="text-brand-brown/70 leading-relaxed">
              작은교회는 5~12명이 모여 함께 예배하고, 말씀을 나누며, 서로의 삶을 돌보는 소그룹 공동체입니다.
              큰 교회 안의 작은 교회로서 진정한 교제와 영적 성장을 이루어 나갑니다.
            </p>
          </section>

          {/* 활동 */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-brand-brown mb-6">작은교회 활동</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {ACTIVITIES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="p-6 rounded-2xl bg-white shadow-sm border border-brand-gold/20 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-cream border border-brand-gold/30 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-5 w-5 text-brand-sage" />
                  </div>
                  <h3 className="font-serif font-bold text-brand-brown mb-2">{title}</h3>
                  <p className="text-sm text-brand-brown/60 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 참여 안내 */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-brand-brown mb-4">참여 안내</h2>
            <div className="p-6 rounded-2xl bg-white shadow-sm border border-brand-gold/20 space-y-3 text-sm text-brand-brown/65">
              <p className="flex gap-2"><span className="text-brand-gold font-bold">•</span> 작은교회는 지역별로 편성되어 있습니다</p>
              <p className="flex gap-2"><span className="text-brand-gold font-bold">•</span> 주중 저녁 또는 주말에 모입니다 (목자에 따라 상이)</p>
              <p className="flex gap-2"><span className="text-brand-gold font-bold">•</span> 참여를 원하시면 교회 사무실 또는 담당 목사님께 문의해 주세요</p>
              <p className="flex gap-2"><span className="text-brand-gold font-bold">•</span> 새가족은 새가족반 수료 후 배정됩니다</p>
            </div>
          </section>
        </div>
      </div>
    </PublicPageLayout>
  );
}
