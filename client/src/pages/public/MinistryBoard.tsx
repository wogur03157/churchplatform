import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, ChevronLeft, Heart } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import ChurchNavigation from "@/components/ChurchNavigation";
import { DEFAULT_MINISTRY_POSTS } from "@/data/siteContent";
import { ministryContent } from "@/content/news";

const MINISTRY_POSTS = DEFAULT_MINISTRY_POSTS;

export default function MinistryBoard() {
  const [ministryLikeCount] = useState<Record<number, number>>({});
  // 화면 너비에 따라 한 번에 보이는 개수 (디자인과 동일: 모바일 5, 태블릿 6, 데스크탑 12)
  const [windowWidth, setWindowWidth] = useState(() => (typeof window === "undefined" ? 1280 : window.innerWidth));
  const [visibleMinistryCount, setVisibleMinistryCount] = useState(12);
  const [hasExpanded, setHasExpanded] = useState(false);
  useEffect(() => {
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;
  const pageSize = isMobile ? 5 : isTablet ? 6 : 12;
  const currentCount = hasExpanded ? visibleMinistryCount : pageSize;
  return (
    <PublicPageLayout>
      <>
              <div className="subpage-hero info-hero relative h-[25vh] md:h-[23vh] w-full overflow-hidden">
                <img
                  src={ministryContent.hero.image}
                  alt={ministryContent.hero.imageAlt}
                  className="w-full h-full object-cover brightness-[0.7]"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex items-end">
                  <div className="max-w-[var(--content-max)] mx-auto w-full px-6 pb-6 md:pb-8 flex justify-between items-end">
                    <div className="text-left">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-brand-sage text-white text-sm font-bold tracking-wider mb-2 font-sans">
                        {ministryContent.hero.eyebrow}
                      </span>
                      <h1 className="text-3xl-compact md:text-5xl font-serif text-white font-bold leading-tight mb-2"><span className="subpage-title-mobile">{ministryContent.hero.title}</span><span className="subpage-title-desktop">{ministryContent.hero.titleDesktop}</span></h1>
                      <p className="hidden md:block text-white/80 text-base md:text-lg font-light max-w-[var(--reading-max)] mt-1 leading-relaxed">
                        {ministryContent.hero.description}
                      </p>
                    </div>
                    <button
                      onClick={() => { window.location.href='/'; }}
                      className="md:hidden flex items-center gap-1 text-white/90 hover:text-white text-sm font-medium shrink-0 mb-1 pb-1 border-b border-white/20 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                      <span>뒤로 가기</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="max-w-[var(--content-max)] mx-auto px-6 mt-8">
                {/* Header and action trigger */}
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-brand-gold/15 shadow-sm text-left">
                  <h2 className="ministry-board-heading font-serif font-normal text-brand-brown">{ministryContent.heading}</h2>
                  <p className="text-brand-brown/60 text-sm font-light mt-0.5">{ministryContent.intro}</p>
                </div>

                {/* Responsive ministry grid: 3 cards per row on large screens. */}
                <div className="ministry-card-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10 mt-8">
                  {MINISTRY_POSTS.slice(0, currentCount).map((post,index) => (
                    <motion.div
                      initial={{ opacity: 0,y: 15 }}
                      animate={{ opacity: 1,y: 0 }}
                      transition={{ delay: Math.min(index*0.04,0.4) }}
                      key={post.id}
                      className="group bg-white rounded-2xl overflow-hidden border border-brand-gold/15 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer text-left"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-brand-cream/10">
                        <img
                          src={post.img}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 flex gap-1">
                          <span className="bg-brand-brown/70 backdrop-blur-md text-white text-2xs font-semibold px-2 py-1 rounded-lg">
                            {post.category}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 pb-7 flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-1 text-xs text-brand-brown/50 mb-1.5 font-mono">
                            <Calendar className="w-3 h-3 text-brand-gold" /> {post.date}
                          </div>

                          <h3 className="board-card-title font-serif font-bold text-brand-brown group-hover:text-brand-sage transition-colors leading-snug line-clamp-2">
                            {post.title}
                          </h3>

                          <p className="board-card-description text-brand-brown/65 leading-relaxed mt-1.5 font-light line-clamp-2">
                            {post.desc}
                          </p>
                        </div>

                        <div className="pt-3 mt-2 border-t border-brand-gold/10 flex items-center justify-between text-xs text-brand-brown/40 font-mono">
                          <span>영신교회 동정</span>
                          <span className="group-hover:text-brand-sage transition-colors flex items-center gap-0.5 font-sans font-medium text-brand-brown/50">
                            귀하게 동참 <Heart className="w-3 h-3 inline text-red-500 fill-red-500" /> +{ministryLikeCount[post.id]||0}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                {MINISTRY_POSTS.length > currentCount && (
                  <div className="flex justify-center mt-10">
                    <button
                      type="button"
                      onClick={() => {
                        setVisibleMinistryCount(currentCount + pageSize);
                        setHasExpanded(true);
                      }}
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-white border border-brand-gold/20 hover:border-brand-sage hover:bg-brand-sage/5 text-brand-brown hover:text-brand-sage text-sm font-medium transition-all cursor-pointer shadow-sm"
                    >
                      사역과 섬김의 모습 더보기 <ChevronDown className="w-4 h-4 animate-bounce" />
                    </button>
                  </div>
                )}
              </div>

      </>
    </PublicPageLayout>
  );
}
