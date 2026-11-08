import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChevronDown, ChevronLeft, Heart } from "lucide-react";
import PublicPageLayout from "@/components/PublicPageLayout";
import { DEFAULT_MINISTRY_POSTS } from "@/data/siteContent";
import { ministryContent } from "@/content/news";

const MINISTRY_POSTS = DEFAULT_MINISTRY_POSTS;

export default function MinistryBoard() {
  const [ministryLikeCount, setMinistryLikeCount] = useState<Record<number, number>>({});
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
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
  const selectedPost = selectedPostId === null ? null : MINISTRY_POSTS.find((post) => post.id === selectedPostId) ?? null;

  if (selectedPost) {
    const categoryImages: Record<string, string[]> = {
      "사랑나눔": [
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?q=80&w=600&auto=format&fit=crop",
      ],
      "다음세대": [
        "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1516627145497-ae6968895b74?q=80&w=600&auto=format&fit=crop",
      ],
      "문화/양육": [
        "https://images.unsplash.com/photo-1511067007398-7e4b90a6155e?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=800&auto=format&fit=crop",
      ],
      "주민사랑": [
        "https://images.unsplash.com/photo-1532996127006-29141084ca39?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1504159506876-f8338247a14a?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c3a9?q=80&w=600&auto=format&fit=crop",
      ],
      "교육/양육": [
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?q=80&w=600&auto=format&fit=crop",
      ],
      "선교": [
        "https://images.unsplash.com/photo-1526976721720-6fe210946884?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=600&auto=format&fit=crop",
      ],
      "찬양": [
        "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=600&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=600&auto=format&fit=crop",
      ],
    };
    const extraImgs = categoryImages[selectedPost.category] ?? categoryImages["사랑나눔"];
    const postImages = Array.from(new Set([selectedPost.img, ...extraImgs])).slice(0, 3);
    const likes = ministryLikeCount[selectedPost.id] ?? 0;
    const closeDetail = () => {
      setSelectedPostId(null);
      window.scrollTo(0, 0);
    };
    return (
      <PublicPageLayout>
        <div className="max-w-[var(--content-max)] mx-auto px-6 py-6 md:py-10">
          <div className="mb-6 flex items-center justify-between">
            <button type="button" onClick={closeDetail} className="inline-flex text-brand-sage hover:text-brand-brown text-sm font-semibold items-center gap-1 cursor-pointer font-sans">
              <ChevronLeft className="w-4 h-4 shrink-0" />
              <span>목록으로 돌아가기</span>
            </button>
            <span className="text-sm text-brand-brown/40 font-mono">영신 공동체 소식</span>
          </div>
          <div className="bg-white p-6 sm:p-10 md:p-14 rounded-3xl border border-brand-gold/10 shadow-sm text-left font-sans">
            <span className="inline-block text-brand-sage text-sm font-bold tracking-wider mb-3">{selectedPost.category} 사역</span>
            <h1 className="ministry-detail-title font-serif font-normal text-brand-brown leading-tight tracking-tight mb-5">{selectedPost.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-brand-brown/50 font-mono mb-8 border-b border-brand-gold/15 pb-6">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-brand-gold" /> {selectedPost.date}</span>
              <span className="hidden sm:inline text-brand-gold/40">•</span>
              <span>영신교회 동정</span>
            </div>
            <div className="mb-8 overflow-hidden rounded-2xl shadow-sm">
              <img src={postImages[0]} alt={selectedPost.title} className="w-full h-auto max-h-[31.25rem] object-cover" referrerPolicy="no-referrer" />
            </div>
            <p className="text-base sm:text-lg text-brand-brown/85 leading-relaxed mb-8 whitespace-pre-line font-light break-keep">{selectedPost.desc}</p>
            <h3 className="font-serif text-xl font-bold text-brand-brown mt-12 mb-4 leading-snug">나눔의 기쁨이 싹트는 은혜로운 순간들</h3>
            <p className="text-base text-brand-brown/75 leading-relaxed mb-8 font-light break-keep">영신교회 공동체 성도들의 기쁜 동참 속에 진행된 이번 사역은 일회성의 섬김을 넘어, 주님의 사랑을 삶의 자리에서 성실하게 구현하는 소중한 시간이었습니다. 우리의 작은 섬김이 씨앗이 되어 영과 육의 회복을 일구고, 마침내 풍성한 하늘의 열매들을 거둘 수 있기를 고대합니다.</p>
            {postImages[1] && (
              <div className="my-10 overflow-hidden rounded-2xl shadow-sm">
                <img src={postImages[1]} alt="사역 현장 상세 모습" className="w-full h-auto max-h-[28.125rem] object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <p className="text-base text-brand-brown/75 leading-relaxed mb-8 font-light break-keep">각 파트에서 보이지 않는 곳까지 수고해주신 모든 봉사자분들의 손길 위에 하늘의 위로와 기쁨이 충만하게 머무시길 기원합니다. 영신교회는 언제나 이웃을 사랑하며 영생의 소망을 나누는 따뜻한 소통의 사역을 멈추지 않고 이어가겠습니다.</p>
            {postImages[2] && (
              <div className="my-10 overflow-hidden rounded-2xl shadow-sm">
                <img src={postImages[2]} alt="사역 현장 스케치 모습" className="w-full h-auto max-h-[28.125rem] object-cover" referrerPolicy="no-referrer" />
              </div>
            )}
            <div className="bg-brand-cream/30 p-6 sm:p-8 rounded-2xl border border-brand-gold/10 my-12 text-center">
              <p className="font-serif italic text-base sm:text-lg text-brand-brown/80 leading-relaxed mb-2 break-keep">"서로 사랑하며 격려하고, 선한 일에 더욱 열심을 내는 복된 성도의 삶이 되기를 축복합니다."</p>
              <span className="text-xs text-brand-gold font-mono tracking-wider">영신교회 교우 일동</span>
            </div>
            <div className="pt-8 border-t border-brand-gold/15 flex flex-col sm:flex-row items-center justify-between gap-4 mt-12 font-sans">
              <button
                type="button"
                onClick={() => setMinistryLikeCount((prev) => ({ ...prev, [selectedPost.id]: (prev[selectedPost.id] ?? 0) + 1 }))}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-red-50/50 border border-brand-gold/15 hover:border-red-200 rounded-2xl text-sm font-semibold text-brand-brown transition-all cursor-pointer shadow-sm"
              >
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span>은혜감사 격려하기 (+{likes + 1})</span>
              </button>
              <button type="button" onClick={closeDetail} className="w-full sm:w-auto px-6 py-3 bg-brand-brown hover:bg-brand-sage text-white text-sm font-semibold rounded-2xl text-center transition-all cursor-pointer shadow-md">
                사역갤러리 목록으로
              </button>
            </div>
          </div>
        </div>
      </PublicPageLayout>
    );
  }

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
                      onClick={() => {
                        setSelectedPostId(post.id);
                        window.scrollTo(0, 0);
                      }}
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
                      className="flex items-center gap-1.5 px-6 py-2.5 bg-white border border-brand-gold/20 hover:border-brand-sage hover:bg-brand-sage/5 text-brand-brown hover:text-brand-sage text-sm font-semibold rounded-full shadow-sm transition-all duration-200 cursor-pointer"
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
