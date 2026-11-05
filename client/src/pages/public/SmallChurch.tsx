import PublicPageLayout from "@/components/PublicPageLayout";
import { BookOpen, Check, ChevronLeft, Heart, Leaf, Users } from "lucide-react";
import { smallChurchContent } from "@/content/small-church";

const ACTIVITY_ICON = {
  book: BookOpen,
  heart: Heart,
  leaf: Leaf,
} as const;

export default function SmallChurch() {
  const { hero, intro, districts, activities, participation } = smallChurchContent;
  const districtLine = districts.map((d) => `${d.label} : ${d.target}`).join(" / ");

  return (
    <PublicPageLayout>
      <div className="small-church-page min-h-screen bg-brand-cream/40 font-sans pb-16">
        {/* Hero Section Container */}
        <div className="subpage-hero ministry-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
          <img src={hero.image} alt={hero.imageAlt} className="w-full h-full object-cover brightness-[0.7]" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
            <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
              <div className="text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-sage text-white text-sm font-bold tracking-wider mb-2 font-sans">
                  {hero.eyebrow}
                </span>
                <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2">
                  <span className="subpage-title-mobile">{hero.title}</span>
                  <span className="subpage-title-desktop">{hero.titleDesktop}</span>
                </h1>
                <p className="hidden md:block text-white/85 text-base md:text-lg font-light max-w-[var(--reading-max)] leading-relaxed w-full">
                  {hero.description}
                </p>
              </div>
              <button
                onClick={() => { window.location.href = "/"; }}
                className="md:hidden flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium shrink-0 mb-1 pb-1 border-b border-white/20 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>뒤로 가기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile spacing: half of the previous discipleship-aligned offset. */}
        <div className="max-w-[var(--content-max)] mx-auto px-6 mt-[5.30625rem] md:mt-12">
          {/* Back button and Breadcrumb */}
          <div className="hidden md:flex mb-2.5 md:mb-6 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 md:gap-4">
            <button
              onClick={() => { window.location.href = "/"; }}
              className="text-brand-sage hover:text-brand-brown text-lg font-medium inline-flex items-center gap-1 cursor-pointer overflow-hidden leading-none border-none bg-transparent py-1 px-0"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>메인 화면으로 돌아가기</span>
            </button>

            <div className="text-base text-brand-brown/50 font-medium font-sans">
              공동체 &gt; <span className="text-brand-sage">작은교회</span>
            </div>
          </div>

          {/* Small church introduction and activities */}
          <div className="w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <div className="min-w-0 space-y-6 lg:flex lg:flex-col">
                {/* 작은교회란? Card */}
                <div className="small-church-intro-card lg:flex-1 bg-[#8E9775] text-white p-6 md:p-8 rounded-[2rem] border border-[#8E9775]/10 shadow-sm text-left hover:shadow-md transition-all">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-white/10 text-[#E2C799] rounded-2xl">
                      <Users className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-2xl md:text-3xl-compact font-bold text-white">작은교회란?</h3>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm md:text-lg text-white/90 font-light leading-relaxed whitespace-pre-line">{intro}</p>
                    <div className="border-t border-white/20 pt-4 mt-4">
                      <div className="hidden md:block">
                        <h4 className="font-serif text-lg md:text-xl font-bold text-[#E2C799] leading-relaxed break-keep">{districtLine}</h4>
                      </div>
                      <div className="block md:hidden">
                        <ul className="space-y-2 text-base font-bold text-[#E2C799] font-sans text-left">
                          {districts.map((d) => (
                            <li key={d.label}>• {d.label} : {d.target}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="activity-card border-t border-white/20 pt-4 space-y-4">
                      {activities.map((a) => {
                        const Icon = ACTIVITY_ICON[a.icon];
                        return (
                          <p key={a.text} className="flex items-start gap-2 text-white/90 font-light">
                            <Icon className="w-4 h-4 shrink-0 mt-0.5 text-brand-gold" aria-hidden="true" />
                            <span>{a.text}</span>
                          </p>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* 참여 안내 Card */}
              <div className="min-w-0 bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-2xl">
                    <Check className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-2xl md:text-3xl-compact font-bold text-brand-brown">참여 안내</h3>
                </div>

                <ul className="participation-list space-y-4 font-sans text-left">
                  {participation.map((p) => (
                    <li key={p.mark} className="flex gap-4 items-start">
                      <span className={`w-6 h-6 rounded-full bg-brand-sage/10 text-brand-sage flex items-center justify-center text-sm font-bold shrink-0 mt-0.5${p.mark === "D" ? " font-sans" : ""}`}>
                        {p.mark}
                      </span>
                      <div>
                        <h4 className={`text-sm md:text-lg font-semibold text-brand-brown${p.mark === "D" ? " font-serif" : ""}`}>{p.title}</h4>
                        <p className="text-sm md:text-sm text-brand-brown/70 leading-relaxed mt-0.5">{p.body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
