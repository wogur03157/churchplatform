import { useState } from "react";
import PublicPageLayout from "@/components/PublicPageLayout";
import ChurchNavigation from "@/components/ChurchNavigation";
import { ChevronDown, ChevronLeft, Compass, Users } from "lucide-react";
import { aboutContent } from "@/content/church-about";
import type { StaffMember } from "@/content/types";

function StaffCard({
  staff,
  index,
  isMobileActive,
  onMobileTap,
}: {
  staff: StaffMember;
  index: number;
  isMobileActive: boolean;
  onMobileTap: (index: number) => void;
}) {
  const photo = staff.img ? (
    <img
      src={staff.img}
      alt={staff.name}
      className={`w-full h-full object-cover${staff.link ? " group-hover:scale-105 transition-transform duration-300" : ""}`}
      referrerPolicy="no-referrer"
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center text-brand-brown/30 bg-brand-cream/30">
      <Users className="w-8 h-8 stroke-[1]" />
    </div>
  );

  return (
    <div className="flex flex-col items-center bg-brand-cream/10 p-3 rounded-2xl border-0 md:border border-brand-gold/10 hover:border-brand-sage/30 transition-all text-center">
      {staff.link ? (
        <a
          href={staff.link}
          onClick={(e) => {
            // 모바일: 첫 번째 터치는 안내 표시, 두 번째 터치에 이동
            if (window.innerWidth < 768) {
              if (!isMobileActive) {
                e.preventDefault();
                onMobileTap(index);
              } else {
                onMobileTap(-1);
              }
            }
          }}
          className="w-[115%] md:w-full aspect-[3/4] rounded-xl overflow-hidden border-0 md:border border-brand-gold/15 mb-3 bg-brand-cream/20 relative group block cursor-pointer"
        >
          {photo}
          <div
            className={`absolute inset-0 bg-black/55 flex items-center justify-center transition-opacity duration-300 ${
              isMobileActive ? "opacity-100" : "opacity-0 md:group-hover:opacity-100"
            }`}
          >
            <span className="text-white text-sm font-semibold text-center leading-tight px-4 py-2.5 bg-brand-sage rounded-lg shadow-sm">
              담당 사역 이동
            </span>
          </div>
        </a>
      ) : (
        <div className="w-[115%] md:w-full aspect-[3/4] rounded-xl overflow-hidden border-0 md:border border-brand-gold/15 mb-3 bg-brand-cream/20 relative">
          {photo}
        </div>
      )}
      <p className="font-serif text-lg font-bold text-brand-brown leading-tight">{staff.name}</p>
      <p className="text-sm text-brand-sage font-semibold mt-1">{staff.role}</p>
      <p className="staff-department text-xs text-brand-brown/50 mt-0.5">{staff.dept}</p>
    </div>
  );
}

export default function ChurchAbout() {
  const { hero, greeting, staff, vision } = aboutContent;
  const [expandedVision, setExpandedVision] = useState<number | null>(null);
  const [activeStaffMobileIdx, setActiveStaffMobileIdx] = useState<number | null>(null);

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-brand-cream/40 font-sans pb-16">
        {/* Hero Section Container */}
        <div className="subpage-hero info-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
          <img src={hero.image} alt={hero.imageAlt} className="w-full h-full object-cover brightness-[0.7]" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
            <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
              <div className="text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-sage text-white text-sm font-bold tracking-wider mb-2">
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

            <div className="text-sm text-brand-brown/50 font-medium">
              교회소개 &gt; <span className="text-brand-sage">영신교회</span>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 gap-[var(--subpage-section-gap)] items-start">
            <div className="w-full min-w-0 space-y-6">
              <div className="text-left">
                <ChurchNavigation activePage="영신교회" />
              </div>
            </div>

            {/* Right Column: Key Church Info (Pastor greeting, Staff, Vision) */}
            <div className="w-full min-w-0 space-y-6">
              {/* 담임목사 인사말 Card */}
              <div className="text-left">
                <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] gap-6 items-start">
                  <div className="min-w-0 flex flex-col items-center">
                    <div className="w-full h-[23.75rem] rounded-2xl overflow-hidden border border-brand-gold/15 shadow-sm">
                      <img
                        src={greeting.photo.src}
                        alt={greeting.photo.alt}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: greeting.photo.objectPosition }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="mt-6 text-center">
                      <p className="font-serif text-base font-bold text-brand-brown">{greeting.name}</p>
                      <p className="text-xs md:text-xs text-brand-brown/50">{greeting.role}</p>
                    </div>
                  </div>

                  <div className="min-w-0 space-y-4 p-4 md:p-6 mt-4 md:min-h-[23.75rem] md:flex md:flex-col md:justify-center">
                    <h4 className="font-serif text-base md:text-lg font-bold text-brand-brown leading-snug">
                      {greeting.quoteLines[0]}
                      <br className="hidden md:block" />
                      {greeting.quoteLines[1]}
                    </h4>
                    <p className="w-full text-xs md:text-sm text-brand-brown/85 font-light leading-relaxed whitespace-pre-line intro-body-text">
                      {greeting.body}
                    </p>
                    <p className="text-right font-serif text-xs md:text-sm text-brand-brown font-semibold mt-4">
                      {greeting.signature.prefix} <span className="text-base font-bold text-brand-brown">{greeting.signature.name}</span> {greeting.signature.suffix}
                    </p>
                  </div>
                </div>
              </div>

              {/* 교역자 소개 Card */}
              <div className="text-left">
                <div className="staff-heading flex items-center gap-3 mb-6">
                  <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-2xl">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-brown">교역자 소개</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  {staff.map((member, idx) => (
                    <StaffCard
                      key={member.name}
                      staff={member}
                      index={idx}
                      isMobileActive={activeStaffMobileIdx === idx}
                      onMobileTap={(i) => setActiveStaffMobileIdx(i < 0 ? null : i)}
                    />
                  ))}
                </div>
              </div>

              {/* 교회 비전 Card */}
              <div className="church-vision bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-brand-gold/10 text-brand-gold rounded-2xl">
                    <Compass className="w-6 h-6" />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-brown">{vision.title}</h3>
                </div>
                <ul className="space-y-8">
                  {vision.items.map((item, idx) => {
                    const n = idx + 1;
                    const open = expandedVision === n;
                    return (
                      <li key={item.title} className="flex gap-4 items-start">
                        <span className="w-6 h-6 rounded-full bg-brand-sage/10 text-brand-sage flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                          {n}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm md:text-base font-semibold text-brand-brown">
                            <span className="hidden md:block">{item.title}</span>
                            <button
                              type="button"
                              className="vision-toggle md:hidden flex w-full items-center justify-between gap-3 text-left cursor-pointer"
                              aria-expanded={open}
                              aria-controls={`church-vision-description-${n}`}
                              onClick={() => setExpandedVision((prev) => (prev === n ? null : n))}
                            >
                              <span>{item.title}</span>
                              <ChevronDown className={`w-4 h-4 shrink-0 transition-transform motion-reduce:transition-none ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                            </button>
                          </h4>
                          <p
                            id={`church-vision-description-${n}`}
                            className={`text-xs md:text-sm text-brand-brown/70 leading-relaxed mt-0.5 ${open ? "block" : "hidden"} md:block`}
                          >
                            {item.body}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
