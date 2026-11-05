import { useState } from "react";
import PublicPageLayout from "@/components/PublicPageLayout";
import ChurchNavigation from "@/components/ChurchNavigation";
import { Bus, Check, Church, ChevronLeft, Copy, MapPin, Train } from "lucide-react";
import { directionsContent } from "@/content/directions";

const TRANSIT_ICON = { train: Train, bus: Bus } as const;
const TRANSIT_TONE = ["bg-brand-sage/10 text-brand-sage", "bg-brand-gold/10 text-brand-gold"];

export default function ChurchDirections() {
  const { hero, address, mapQuery, contact, transit, mapTitle } = directionsContent;
  const [copied, setCopied] = useState(false);
  const handleCopyAddress = () => {
    navigator.clipboard?.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PublicPageLayout>
      <div className="min-h-screen bg-brand-cream/40 font-sans pb-16">
        {/* Hero Section Container */}
        <div className="subpage-hero info-hero relative h-[45vh] md:h-[30vh] w-full overflow-hidden">
          <img src={hero.image} alt={hero.imageAlt} className="w-full h-full object-cover brightness-[0.7]" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
            <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-8 md:pb-12 flex justify-between items-end">
              <div className="text-left">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-sage text-white text-xs font-bold tracking-wider mb-2 font-sans">
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
              교회소개 &gt; <span className="text-brand-sage">오시는 길</span>
            </div>
          </div>

          {/* Layout Grid */}
          <div className="grid grid-cols-1 gap-[var(--subpage-section-gap)] items-start">
            <div className="w-full min-w-0 space-y-6">
              <div className="text-left">
                <ChurchNavigation activePage="오시는길" />
              </div>
            </div>

            {/* Directions contact, transit, and map */}
            <div className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6 items-stretch">
              <div className="min-w-0 space-y-6">
                {/* Info block */}
                <div className="bg-[#8E9775] text-white p-6 rounded-[2rem] shadow-md text-left">
                  <Church className="w-8 h-8 mb-4 text-[#E2C799]" />
                  <h4 className="font-serif text-xl font-bold mb-2">{contact.title}</h4>
                  <p className="text-sm md:text-xs text-white/95 leading-relaxed font-light">
                    전화 : {contact.phone} <br />
                    {contact.body}
                  </p>
                </div>

                {/* 대중교통 안내 Card */}
                <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left hover:shadow-md transition-all">
                  <h4 className="font-serif text-lg font-bold text-brand-brown mb-4 border-b border-brand-gold/5 pb-2">{transit.title}</h4>
                  <div className="space-y-4 font-sans">
                    {transit.items.map((item, idx) => {
                      const Icon = TRANSIT_ICON[item.icon];
                      return (
                        <div key={item.title} className="flex gap-4 items-start">
                          <div className={`p-2 ${TRANSIT_TONE[idx]} rounded-xl shrink-0`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h5 className="text-sm md:text-sm font-semibold text-brand-brown">{item.title}</h5>
                            <p className="text-xs md:text-xs text-brand-brown/70 leading-relaxed mt-0.5">{item.body}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-6 p-4 bg-brand-cream/30 rounded-xl border border-brand-gold/10 text-xs md:text-xs text-brand-brown/70 leading-relaxed">
                    {transit.tip}
                  </div>
                </div>
              </div>

              {/* 교회 위치 지도 */}
              <div className="directions-map-card min-w-0 flex flex-col bg-white p-6 md:p-8 rounded-[2rem] border border-brand-gold/15 shadow-sm text-left hover:shadow-md transition-all">
                <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-brand-sage/10 text-brand-sage rounded-2xl">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-xl md:text-2xl font-bold text-brand-brown">{mapTitle}</h3>
                  </div>
                  <button
                    onClick={handleCopyAddress}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-brand-cream hover:bg-brand-sage hover:text-white text-brand-brown transition-all border border-brand-gold/20 active:scale-95"
                    title="주소 복사"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-brand-sage" />
                        <span>주소 복사 완료</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>주소 복사하기</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="mb-4">
                  <p className="directions-address text-xs md:text-sm text-brand-brown font-medium">📍 {address} (영신교회)</p>
                </div>
                {/* Google maps interactive embedded iframe */}
                <div className="relative w-full aspect-[16/9] lg:aspect-auto lg:flex-1 bg-gray-100 rounded-2xl overflow-hidden border border-brand-gold/10 shadow-inner">
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                    className="absolute inset-0 w-full h-full border-0"
                    allowFullScreen
                    loading="lazy"
                    title="영신교회 상세지도"
                    referrerPolicy="no-referrer"
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  );
}
