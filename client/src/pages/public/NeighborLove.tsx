import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BookOpen, ChevronLeft, Clock, Heart, Send, Sparkles, Users } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import { useHashSlug } from "@/hooks/useHashSlug";
import { NEIGHBOR_LOVE_SLUGS } from "@/content/subpages";
import { neighborLoveItems as neighborItems, neighborLoveLabels as L } from "@/content/neighbor-love";

const fill = (text: string, title: string) => text.replace("{title}", title);
import NeighborAppForm from "@/components/NeighborAppForm";

export default function NeighborLove() {
  const [neighborSubpageId, setNeighborSubpageId] = useHashSlug(NEIGHBOR_LOVE_SLUGS);
  return (
    <PublicPageLayout>
        <div className="min-h-screen bg-brand-cream/40 font-sans pb-16">
          {/* Hero Section Container */}
          <div className="subpage-hero ministry-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
            <img
              src={neighborItems[neighborSubpageId].image}
              alt={neighborItems[neighborSubpageId].alt}
              className="w-full h-full object-cover brightness-[0.7]"
              style={neighborSubpageId===0? { objectPosition: 'top' }:undefined}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
              <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
                <div className="text-left">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-gold text-brand-brown text-sm font-bold tracking-wider mb-2 uppercase">
                    {neighborItems[neighborSubpageId].sub}
                  </span>
                  <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2"><span className="subpage-title-mobile">이웃사랑 - {neighborItems[neighborSubpageId].title}</span><span className="subpage-title-desktop">{neighborItems[neighborSubpageId].title}</span></h1>
                  <p className="hidden md:block text-white/85 text-base md:text-lg font-light max-w-[var(--reading-max)] leading-relaxed">
                    {neighborItems[neighborSubpageId].desc}
                  </p>
                </div>
                <button
                  onClick={() => {
                    window.location.href='/';
                  }}
                  className="md:hidden flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium shrink-0 mb-1 pb-1 border-b border-white/20 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 shrink-0" />
                  <span>{L.back}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subpage Contents Grid */}
          <div className="max-w-[var(--content-max)] mx-auto px-6 mt-6 md:mt-12">
            {/* Back button and Breadcrumb */}
            <div className="hidden md:flex mb-2.5 md:mb-6 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 md:gap-4">
              <button
                onClick={() => {
                  window.location.href='/';
                }}
                className="text-brand-sage hover:text-brand-brown text-lg font-medium inline-flex items-center gap-1 cursor-pointer overflow-hidden leading-none"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>{L.home}</span>
              </button>

              <div className="text-base text-brand-brown/50 font-medium">
                {L.breadcrumb} <span className="text-brand-sage">{neighborItems[neighborSubpageId].title}</span>
              </div>
            </div>

            <div className="flex flex-col gap-10 md:gap-8">
              {/* Horizontal ministry navigation */}
              <div className="w-full min-w-0 space-y-6">
                <div className="w-full min-w-0">
                  <nav aria-label="이웃사랑 사역목록" className="neighbor-navigation flex gap-2 overflow-x-auto pb-1 md:pb-0 font-sans">
                    {neighborItems.map((item,idx) => {
                      const isActive=neighborSubpageId===idx;
                      return (
                        <button
                          key={item.title}
                          onClick={() => {
                            setNeighborSubpageId(idx);
                          }}
                          aria-current={isActive? 'page':undefined}
                          className={`shrink-0 md:flex-1 text-center whitespace-nowrap py-3 px-4 rounded-2xl text-sm sm:text-lg font-medium transition-all border cursor-pointer ${isActive
                              ? 'bg-[#8E9775] text-white border-[#8E9775] shadow-sm font-semibold'
                              :'bg-white border-brand-gold/15 text-brand-brown hover:bg-brand-cream/30 hover:border-brand-sage'
                            }`}
                        >
                          {item.title}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* Subpage Info Quick Card */}
                {neighborSubpageId!==0&&neighborSubpageId!==1&&neighborSubpageId!==2&&neighborSubpageId!==3&&(
                  <div className="p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left bg-[#F1F3EC]">
                    <span className="inline-block p-2 rounded-full bg-brand-gold/10 text-brand-gold mb-4">
                      <Clock className="w-5 h-5" />
                    </span>
                    <h3 className="font-serif text-2xl font-bold text-brand-brown mb-4">모임 안내</h3>
                    <div className="space-y-4 text-lg">
                      <div className="flex items-start gap-2.5">
                        <span className="w-16 shrink-0 text-sm font-semibold tracking-wider text-brand-sage bg-brand-sage/10 px-2.5 py-1 rounded text-center">대상</span>
                        <span className="text-brand-brown/80 text-sm sm:text-lg">{neighborItems[neighborSubpageId].target}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-16 shrink-0 text-sm font-semibold tracking-wider text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded text-center">시간</span>
                        <span className="text-brand-brown/80 text-sm sm:text-lg">{neighborItems[neighborSubpageId].time}</span>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="w-16 shrink-0 text-sm font-semibold tracking-wider text-brand-brown bg-brand-brown/10 px-2.5 py-1 rounded text-center font-bold">장소</span>
                        <span className="text-brand-brown/80 text-sm sm:text-lg">{neighborItems[neighborSubpageId].location}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Full-width ministry details and application form */}
              <div className="w-full min-w-0 space-y-6">
                {/* Content Details Block */}
                <div className="neighbor-content-card p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left bg-[#F1F3EC]">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-sage/10 text-brand-sage rounded-full text-sm font-semibold mb-4">
                    {L.overview}
                  </span>

                  <blockquote className="border-l-4 border-brand-sage pl-4 py-1 my-4 not-italic text-brand-brown/85 font-serif text-xl leading-relaxed">
                    "{neighborItems[neighborSubpageId].desc}"
                  </blockquote>

                  {/* Worship/Group Info placement below Ministry Introduction */}
                  {(neighborSubpageId===1||neighborSubpageId===2||neighborSubpageId===3)&&(
                    <div className="mt-4 mb-8 p-5 rounded-2xl border border-brand-gold/15 text-left bg-[#F1F3EC]">
                      <h4 className="font-serif text-lg font-bold text-brand-brown mb-3 flex items-center gap-1.5">
                        <Clock className="w-4.5 h-4.5 text-brand-sage" />
                        <span>{L.schedule}</span>
                      </h4>
                      <div className="flex flex-col gap-3 text-sm md:text-lg">
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 px-2 py-0.5 rounded bg-brand-sage/10 text-brand-sage font-semibold text-sm tracking-wide">대상</span>
                          <span className="text-brand-brown/80 leading-snug text-sm md:text-lg">{neighborItems[neighborSubpageId].target}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 px-2 py-0.5 rounded bg-brand-gold/15 text-brand-gold/90 font-semibold text-sm tracking-wide">시간</span>
                          <span className="text-brand-brown/80 leading-snug text-sm md:text-lg">{neighborItems[neighborSubpageId].time}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="shrink-0 px-2 py-0.5 rounded bg-brand-brown/10 text-brand-brown font-bold text-sm tracking-wide">장소</span>
                          <span className="text-brand-brown/80 leading-snug text-sm md:text-lg">{neighborItems[neighborSubpageId].location}</span>
                        </div>
                        {neighborSubpageId===1&&(
                          <div className="flex items-start gap-2">
                            <span className="shrink-0 px-2 py-0.5 rounded bg-brand-sage/10 text-brand-sage font-semibold text-sm tracking-wide">문의</span>
                            <span className="text-brand-brown/80 leading-snug font-medium text-sm md:text-lg">사무실 : 02-2602-8002</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <h3 className={`neighbor-program-heading font-serif font-bold text-brand-brown mb-4 flex items-center gap-2 ${neighborSubpageId===0? 'mt-10':''}`}>
                    <Heart className="w-5 h-5 text-brand-sage" />
                    <span>{L.activities}</span>
                  </h3>
                  <div className="space-y-4">
                    {neighborItems[neighborSubpageId].details.map((detailText,dIdx) => {
                      const [title,desc]=detailText.split(": ");
                      return (
                        <div
                          key={dIdx}
                          className="p-4 rounded-2xl bg-brand-cream/20 border border-brand-gold/5 flex gap-3 hover:bg-brand-cream/35 transition-colors"
                        >
                          <div className="w-6 h-6 shrink-0 rounded-full bg-brand-sage text-white flex items-center justify-center font-bold text-sm mt-0.5">
                            {dIdx+1}
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-brand-brown mb-1">{title}</h4>
                            <p className="text-sm md:text-lg text-brand-brown/70 leading-relaxed font-light whitespace-pre-line">{desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* Interactive Application Form for Service/Volunteering */}
                {neighborSubpageId!==2&&neighborSubpageId!==3&&(
                  <div className="p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left relative overflow-hidden bg-[#F1F3EC]">
                    <div className="absolute right-0 top-0 w-32 h-32 bg-brand-sage/5 rounded-full blur-2xl pointer-events-none"></div>
                    <h3 className="font-serif text-2xl font-bold text-brand-brown mb-2 flex items-center gap-2">
                      <Send className="w-5 h-5 text-brand-sage" />
                      <span>{neighborSubpageId===1 ? L.academyApply : L.supportApply}</span>
                    </h3>
                    <p className="text-sm md:text-lg text-brand-brown/65 font-light leading-relaxed mb-6">
                      {fill(neighborSubpageId===1 ? L.applyIntroAcademy : L.applyIntroDefault, neighborItems[neighborSubpageId].title)}
                    </p>

                    {neighborSubpageId===1&&(
                      <div className="mb-6 p-4 rounded-2xl border border-brand-gold/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm text-left bg-[#F1F3EC]">
                        <div className="text-sm md:text-lg text-brand-brown">
                          <span className="font-bold">세부 안내 및 신청 링크 : </span>
                          <a
                            href="https://forms.gle/13j7yMGbBd6Kc6g88"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-sage hover:underline font-semibold break-all inline-flex items-center gap-1"
                          >
                            https://forms.gle/13j7yMGbBd6Kc6g88
                          </a>
                        </div>
                        <a
                          href="https://forms.gle/13j7yMGbBd6Kc6g88"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 px-4 py-2 bg-brand-sage text-white font-medium text-sm rounded-full hover:bg-brand-brown transition-all text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <span>{L.openLink}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    <NeighborAppForm
                      ministryName={neighborItems[neighborSubpageId].title}
                      hideTypeSelection={neighborSubpageId===1}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
    </PublicPageLayout>
  );
}
