import PublicPageLayout from "@/components/PublicPageLayout";
import ChurchNavigation from "@/components/ChurchNavigation";
import { Calendar, ChevronLeft, Clock, MapPin } from "lucide-react";
import { worshipContent } from "@/content/worship";
import type { WeekdayWorshipRow, WorshipGroup, WorshipServiceRow } from "@/content/types";

const BADGE_TONE = {
  sage: "bg-brand-sage/10 text-brand-sage",
  gold: "bg-brand-gold/10 text-brand-gold",
} as const;

function ServiceCard({ group }: { group: WorshipGroup<WorshipServiceRow> }) {
  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-3 mb-4 w-full">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-2xl">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-brown">{group.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-brand-brown/60">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs md:text-sm font-sans font-medium">{group.location}</span>
        </div>
      </div>

      <div className="divide-y divide-brand-gold/10 font-sans">
        {group.rows.map((row) => (
          <div key={row.badge + row.title} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center justify-between sm:justify-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 text-xs font-semibold rounded shrink-0 ${BADGE_TONE[row.badgeTone]}`}>{row.badge}</span>
                <span className="sunday-worship-title text-lg font-normal text-brand-brown">{row.title}</span>
              </div>
              <span className="sm:hidden text-xs font-bold bg-brand-cream px-2 py-1 rounded text-brand-brown/85 whitespace-nowrap">{row.timeShort}</span>
            </div>
            <div className="hidden sm:flex items-center text-brand-brown/85">
              <span className="text-xs md:text-sm font-bold bg-brand-cream px-2 py-1 rounded">{row.timeLong}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekdayTime({ row }: { row: WeekdayWorshipRow }) {
  if (row.timeShort === row.timeLong) return <>{row.timeLong}</>;
  return (
    <>
      <span className="md:hidden">{row.timeShort.slice(0, 1)}</span>
      <span className="hidden md:inline">{row.timeLong.slice(0, row.timeLong.indexOf(" "))}</span>
      {row.timeLong.slice(row.timeLong.indexOf(" "))}
    </>
  );
}

function WeekdayCard({ group }: { group: WorshipGroup<WeekdayWorshipRow> }) {
  return (
    <div className="weekday-worship-card bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left hover:shadow-md transition-all">
      <div className="flex items-center justify-between gap-2 mb-4 w-full">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="weekday-worship-heading font-serif text-xl md:text-2xl font-bold text-brand-brown whitespace-nowrap">{group.title}</h3>
        </div>
        <div className="flex items-center gap-1 text-brand-brown/60 shrink-0">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="text-xs md:text-sm font-sans font-medium whitespace-nowrap">{group.location}</span>
        </div>
      </div>

      <div className="divide-y divide-brand-gold/10 font-sans">
        {group.rows.map((row) => (
          <div key={row.badge} className="weekday-worship-row py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center justify-start gap-3 w-full sm:w-auto">
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="min-w-[4.5rem] sm:min-w-[5.25rem] px-2 sm:px-2.5 py-0.5 text-center text-xs sm:text-sm md:text-xs font-semibold rounded bg-brand-brown/5 text-brand-brown/80 shrink-0 whitespace-nowrap">
                  {row.badge}
                </span>
                <span className="weekday-worship-title block text-xs sm:text-lg font-normal text-brand-brown leading-relaxed whitespace-nowrap">{row.title}</span>
              </div>
            </div>
            <div className="flex items-center text-brand-brown/85">
              <span className="text-xs md:text-sm font-bold bg-brand-cream/80 px-2 py-1 rounded text-brand-sage">
                <WeekdayTime row={row} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChurchWorship() {
  const { hero, sunday, weekday } = worshipContent;

  return (
    <PublicPageLayout>
      <div className="worship-guide-page min-h-screen bg-brand-cream/40 font-sans pb-16">
        {/* Hero Section Container */}
        <div className="subpage-hero info-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
          <img src={hero.image} alt={hero.imageAlt} className="w-full h-full object-cover brightness-[0.7]" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
            <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
              <div className="text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-gold text-brand-brown text-xs font-bold tracking-wider mb-2 font-sans">
                  {hero.eyebrow}
                </span>
                <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2">
                  <span className="subpage-title-mobile">{hero.title}</span>
                  <span className="subpage-title-desktop">{hero.titleDesktop}</span>
                </h1>
                <p className="hidden md:block text-white/85 text-sm md:text-base font-light max-w-[var(--reading-max)] leading-relaxed w-full">
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

        {/* Subpage Contents Grid */}
        <div className="max-w-[var(--content-max)] mx-auto px-6 mt-10 md:mt-12">
          {/* Back button and Breadcrumb */}
          <div className="hidden md:flex mb-6 md:mb-6 flex-wrap items-center justify-between gap-x-4 gap-y-1.5 md:gap-4">
            <button
              onClick={() => { window.location.href = "/"; }}
              className="text-brand-sage hover:text-brand-brown text-sm font-medium inline-flex items-center gap-1 cursor-pointer overflow-hidden leading-none border-none bg-transparent py-1 px-0"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>메인 화면으로 돌아가기</span>
            </button>

            <div className="text-sm text-brand-brown/50 font-medium font-sans">
              교회소개 &gt; <span className="text-brand-sage">예배안내</span>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 gap-[var(--subpage-section-gap)] items-start">
            <div className="w-full min-w-0 space-y-6">
              <div className="text-left">
                <ChurchNavigation activePage="예배안내" />
              </div>
            </div>

            {/* Right Column: Worship Schedules */}
            <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
              <ServiceCard group={sunday} />
              <WeekdayCard group={weekday} />
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
