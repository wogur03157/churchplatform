import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, Heart, Sparkles, Users } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import { useHashSlug } from "@/hooks/useHashSlug";
import { GOD_LOVE_SLUGS } from "@/content/subpages";
import { godsLoveHero, godsLovePrograms } from "@/content/gods-love";

const PROGRAM_ICON = {
  users: Users,
  book: BookOpen,
  sparkles: Sparkles,
  heart: Heart,
} as const;

export default function GodsLove() {
  const [index, setIndex] = useHashSlug(GOD_LOVE_SLUGS);
  const program = godsLovePrograms[index];
  const Icon = PROGRAM_ICON[program.icon];

  const selectProgram = (i: number) => setIndex(i);

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-brand-cream/40 font-sans pb-16">
        {/* Hero Section Container */}
        <div className="subpage-hero ministry-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
          <img src={godsLoveHero.image} alt={godsLoveHero.imageAlt} className="w-full h-full object-cover brightness-[0.7]" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
            <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
              <div className="text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#8E9775] text-white text-sm font-bold tracking-wider mb-2 font-sans">
                  {godsLoveHero.eyebrow}
                </span>
                <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2">
                  <span className="subpage-title-mobile">{program.name ?? godsLoveHero.fallbackTitle}</span>
                  <span className="subpage-title-desktop">{program.name ?? godsLoveHero.fallbackTitle}</span>
                </h1>
                <p className="hidden md:block text-white/85 text-base md:text-lg font-light max-w-[var(--reading-max)] leading-relaxed w-full">
                  {program.heroDescription}
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

        {/* Subpage Contents Grid */}
        <div className="max-w-[var(--content-max)] mx-auto px-6 mt-3 md:mt-12">
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
              {godsLoveHero.breadcrumb} <span className="text-brand-sage">{program.name}</span>
            </div>
          </div>

          {/* Top navigation and full-width content */}
          <div className="flex flex-col gap-[4.1667rem] md:gap-25">
            {/* Horizontal training navigation */}
            <div className="w-full min-w-0">
              <div className="w-full min-w-0">
                <nav aria-label="하나님사랑 훈련목록" className="gods-love-navigation flex gap-2 overflow-x-auto pb-1 md:pb-0 font-sans">
                  {godsLovePrograms.map((item, idx) => {
                    const isActive = index === idx;
                    return (
                      <button
                        key={item.slug}
                        onClick={() => selectProgram(idx)}
                        aria-current={isActive ? "page" : undefined}
                        className={`shrink-0 md:flex-1 text-center whitespace-nowrap py-3 px-4 rounded-2xl text-sm sm:text-lg font-medium transition-all border cursor-pointer ${
                          isActive
                            ? "bg-[#8E9775] text-white border-[#8E9775] shadow-sm font-semibold"
                            : "bg-white border-brand-gold/15 text-brand-brown hover:bg-brand-cream/30 hover:border-brand-sage"
                        }`}
                      >
                        {item.name}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Full-width program details */}
            <div className="w-full min-w-0">
              <motion.div
                key={program.slug}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full min-w-0 bg-transparent border-none shadow-none p-0 text-left space-y-8"
              >
                {/* Header Details */}
                <div className="mb-3">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-2xl">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="font-serif text-3xl-compact md:text-4xl font-medium text-brand-brown">
                      {program.headingTitleMobile ? (
                        <>
                          <span className="hidden md:inline">{program.headingTitle}</span>
                          <span className="inline md:hidden">{program.headingTitleMobile}</span>
                        </>
                      ) : (
                        program.headingTitle
                      )}
                    </h2>
                  </div>
                  <p className="text-brand-sage text-lg md:text-xl font-medium font-sans mb-0 select-none">{program.tagline}</p>
                </div>

                {/* Section intro block */}
                <div className="p-5 rounded-2xl border border-brand-gold/15 text-sm md:text-lg text-brand-brown/85 font-light leading-relaxed font-sans bg-[#F1F3EC]">
                  {program.intro}
                </div>

                {/* Program info */}
                <div className="space-y-4">
                  <h3 className="font-serif text-xl font-bold text-brand-brown border-b border-brand-gold/10 pb-2">
                    {godsLoveHero.infoTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {program.info.map((item) => (
                      <div
                        key={item.label}
                        className={`${program.infoPadding} rounded-2xl ${item.border === "15" ? "border-brand-gold/15" : "border-brand-gold/10"} bg-[#F1F3EC]${item.wide ? " md:col-span-2" : ""}`}
                      >
                        <span className="text-sm font-bold text-brand-sage block mb-1">{item.label}</span>
                        <span className="text-sm md:text-lg text-brand-brown font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-4 pt-2">
                  <h3 className="font-serif text-xl font-bold text-brand-brown border-b border-brand-gold/10 pb-2">
                    {godsLoveHero.featureTitle}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                    {program.features.map((feat, idx) => (
                      <div key={feat.title} className="border border-brand-gold/10 p-5 rounded-2xl bg-white hover:border-brand-sage transition-colors text-left flex gap-3 items-start">
                        <span className="p-1 rounded-lg bg-brand-sage/10 text-brand-sage text-sm font-bold shrink-0">0{idx + 1}</span>
                        <div>
                          <h4 className="text-sm md:text-lg font-semibold text-brand-brown mb-1">{feat.title}</h4>
                          <p className="text-sm md:text-sm text-brand-brown/70 leading-relaxed font-light">{feat.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
