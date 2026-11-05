import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronLeft, Clock, Heart, Users } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import { useHashSlug } from "@/hooks/useHashSlug";
import { DEPARTMENT_SLUGS } from "@/content/subpages";
import { departmentLabels, departments } from "@/content/departments";

export default function Departments() {
  const [index, setIndex] = useHashSlug(DEPARTMENT_SLUGS);
  const dept = departments[index];
  const L = departmentLabels;
  const customStaffPhotos: Record<number, string> = {};
  const staffPhoto = customStaffPhotos[index] || dept.staffPhoto;

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-brand-cream/40 font-sans pb-16">
        {/* Hero Section Container */}
        <div className="subpage-hero nextgen-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
          <img src={dept.heroImage} alt={dept.heroAlt} className="w-full h-full object-cover brightness-[0.7]" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
            <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
              <div className="text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-sage text-white text-sm font-bold tracking-wider mb-2">
                  {dept.badge}
                </span>
                <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2">
                  <span className="subpage-title-mobile">{dept.heroTitleMobile}</span>
                  <span className="subpage-title-desktop">{dept.heroTitle}</span>
                </h1>
                <p className="hidden md:block text-white/85 text-base md:text-lg font-light max-w-[var(--reading-max)] leading-relaxed border-none break-keep">
                  {dept.heroDescription}
                </p>
              </div>
              <button
                onClick={() => { window.location.href = "/community/departments"; }}
                className="md:hidden flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium shrink-0 mb-1 pb-1 border-b border-white/20 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 shrink-0" />
                <span>{L.back}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subpage Contents Grid */}
        <div className="max-w-[var(--content-max)] mx-auto px-6 mt-3 md:mt-12">
          {/* Back button link in content context */}
          <div className="h-6 md:h-auto mb-4 md:mb-6 flex items-center gap-2">
            <button
              onClick={() => { window.location.href = "/community/departments"; }}
              className="hidden md:inline-flex text-brand-sage hover:text-brand-brown text-sm font-medium items-center gap-1 cursor-pointer overflow-hidden leading-none animate-fade-in"
            >
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>{L.backLink}</span>
            </button>
          </div>

          {/* Next Gen Department Segmented Control */}
          <div className="flex flex-col md:flex-row md:justify-center mb-8 md:mb-12 items-center gap-2">
            {/* Mobile horizontal department navigation */}
            <nav aria-label="다음세대 부서목록" className="nextgen-navigation flex md:hidden gap-2 overflow-x-auto w-full min-w-0 font-sans">
              {departments.map((d, idx) => (
                <button
                  key={d.slug}
                  onClick={() => setIndex(idx)}
                  aria-current={index === idx ? "page" : undefined}
                  className={`shrink-0 text-center whitespace-nowrap py-3 px-4 rounded-2xl text-sm font-medium transition-all border cursor-pointer ${
                    index === idx
                      ? "bg-brand-sage text-white border-brand-sage shadow-sm font-semibold"
                      : "bg-white border-brand-gold/15 text-brand-brown hover:bg-brand-cream/30 hover:border-brand-sage"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </nav>

            {/* Desktop View */}
            <div className="hidden md:inline-flex p-1.5 bg-brand-cream/80 border border-brand-gold/15 rounded-2xl shadow-sm md:w-auto gap-1 md:gap-0">
              {departments.map((d, idx) => (
                <button
                  key={d.slug}
                  onClick={() => setIndex(idx)}
                  className={`flex-initial text-center whitespace-nowrap px-8 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    index === idx
                      ? "bg-brand-sage text-white shadow-md shadow-brand-sage/20 border border-brand-sage"
                      : "text-brand-brown/80 hover:text-brand-sage hover:bg-brand-sage/5 border border-transparent"
                  }`}
                >
                  {d.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-10 gap-8 items-stretch">
            {/* Left Column: Staff */}
            <div className="md:col-span-3 space-y-6 md:flex md:h-full md:flex-col">
              <div className="bg-transparent lg:bg-white p-0 lg:p-8 rounded-[2rem] border-none border-brand-gold/15 lg:border shadow-none lg:shadow-sm text-left md:h-full md:flex md:flex-col">
                {/* Shared staff introduction heading */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="inline-block p-2 rounded-full bg-brand-sage/10 text-brand-sage">
                    <Users className="w-5 h-5" />
                  </span>
                  <h3 className="font-serif text-xl font-medium text-brand-brown">{L.staffHeading}</h3>
                </div>
                {/* Photo container (Static) */}
                <div
                  className={`nextgen-staff-photo relative w-full ${
                    dept.photoTall
                      ? "h-[22.375rem] min-h-[22.375rem] max-h-[22.375rem] shrink-0"
                      : "h-[30rem] min-h-[30rem] max-h-[30rem] md:h-auto md:min-h-0 md:max-h-none md:flex-1"
                  } rounded-2xl overflow-hidden border border-brand-gold/10 shadow-sm`}
                >
                  <img
                    src={staffPhoto}
                    alt={L.staffAlt}
                    className="w-full h-full object-cover grayscale-[10%] contrast-[105%] hover:grayscale-0 transition-all duration-300"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Introduction, schedule, calendar */}
            <div className="md:col-span-7 space-y-6">
              <AnimatePresence mode="wait">
                <motion.div key={dept.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                  {/* Ministry Introduction Card */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-block p-2 rounded-full bg-brand-sage/10 text-brand-sage">
                        <BookOpen className="w-5 h-5" />
                      </span>
                      <h3 className="font-serif text-xl md:text-2xl font-medium text-brand-brown">{L.introHeading}</h3>
                    </div>
                    <p className="text-base md:text-lg text-brand-brown/80 font-normal leading-relaxed break-keep">{dept.intro}</p>
                  </div>

                  {/* Worship Info Card */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-block p-2 rounded-full bg-brand-gold/10 text-brand-gold">
                        <Clock className="w-5 h-5" />
                      </span>
                      <h3 className="font-serif text-xl md:text-2xl font-medium text-brand-brown">{L.scheduleHeading}</h3>
                    </div>
                    <div className="space-y-4 text-base md:text-lg font-normal">
                      <div className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-xs md:text-sm font-normal uppercase tracking-wider text-brand-sage bg-brand-sage/10 px-2.5 py-1 rounded text-center">{L.target}</span>
                        <span className="text-brand-brown/80 font-normal">{dept.target}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-xs md:text-sm font-normal uppercase tracking-wider text-brand-gold bg-brand-gold/10 px-2.5 py-1 rounded text-center">{L.time}</span>
                        <span className="text-brand-brown/80 font-normal">{dept.time}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-20 shrink-0 text-xs md:text-sm font-normal uppercase tracking-wider text-brand-brown bg-brand-brown/10 px-2.5 py-1 rounded text-center">{L.location}</span>
                        <span className="text-brand-brown/80 font-normal">{dept.location}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="w-20 shrink-0 text-xs md:text-sm font-normal uppercase tracking-wider text-brand-sage/80 bg-brand-sage/5 px-2.5 py-1 rounded text-center">{L.staff}</span>
                        <span className="text-brand-brown/85 font-normal leading-relaxed">{dept.staff}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Bottom Section: Yearly Activities & Join Guide */}
          <div className="mt-8 space-y-6">
            {/* Yearly Activities */}
            <div className="bg-transparent border-none shadow-none p-0 w-[95%] mx-auto md:bg-white md:p-8 md:rounded-[2rem] md:border md:border-brand-gold/15 md:shadow-sm text-left md:w-full">
              <h3 className="font-serif text-xl md:text-2xl font-medium text-brand-brown mb-6 flex items-center gap-2">
                <Heart className="w-5 h-5 text-brand-gold" />
                <span>{L.calendarHeading}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {dept.calendar.map((event, eIdx) => (
                  <div
                    key={eIdx}
                    className="p-5 rounded-2xl border border-brand-gold/10 hover:border-brand-sage/30 hover:bg-brand-cream/10 transition-all flex gap-4"
                  >
                    <div className="w-12 h-12 shrink-0 rounded-full bg-brand-sage/10 text-brand-sage flex items-center justify-center font-serif font-extrabold text-base">
                      {event.month}
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-base md:text-lg font-medium text-brand-brown leading-tight">{event.title}</h4>
                      <p className="text-xs md:text-base text-brand-brown/70 font-normal leading-relaxed">{event.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Join Guide Card */}
            {dept.showWelcome && (
              <div className="bg-brand-sage/10 p-6 md:p-8 rounded-[2rem] border border-brand-sage/20 text-left relative overflow-hidden">
                <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-brand-sage/10 rounded-full blur-2xl"></div>
                <h3 className="font-serif text-lg md:text-xl font-medium text-brand-brown mb-3">{L.welcomeTitle}</h3>
                <p className="text-xs md:text-sm text-brand-brown/80 font-light leading-relaxed mb-4">{L.welcomeBody}</p>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => { window.location.href = "/church/worship"; }}
                    className="px-4 py-2 bg-brand-sage text-white font-medium text-xs rounded-full hover:bg-brand-brown transition-colors cursor-pointer"
                  >
                    {L.welcomeCta}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
