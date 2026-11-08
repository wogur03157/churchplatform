import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Video } from "@shared/entities";
import { toSermon } from "@/pages/public/SermonsPage";
import { Wind, ArrowRight, Calendar, ChevronDown, ChevronLeft, ChevronRight, Church, Cross, Eye, GraduationCap, Heart, Music, Users, Sparkles, MapPin, MonitorPlay, UserPlus, Leaf, Compass, Clock, Play, X, Search, ArrowUpRight, Check, Copy, Bus, Train, Phone } from "lucide-react";
import IconLogo from "@/components/IconLogo";
import SermonCard, { type SermonItem } from "@/components/SermonCard";
import { nextGenItems } from "@/data/nextGen";
import { DEPARTMENT_SLUGS, NEIGHBOR_LOVE_SLUGS } from "@/content/subpages";

export type HomeSermons = { sunday: SermonItem[]; friday: SermonItem[]; wednesday: SermonItem[]; special: SermonItem[] };

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

function HomeSermonCard({
  sermon,
  badge,
  delay,
  className,
  onPlay,
}: {
  sermon: SermonItem;
  badge: string;
  delay: number;
  className: string;
  onPlay: (v: { title: string; embedUrl: string }) => void;
}) {
  return (
    <motion.div
      {...fadeIn}
      transition={{ delay }}
      className={className}
      onClick={() => onPlay({ title: sermon.title, embedUrl: sermon.embedUrl })}
    >
      <div className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl mb-4 md:mb-8">
        <img
          src={sermon.imageUrl}
          alt={sermon.sermonTitle}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform duration-500">
            <div className="w-16 h-16 bg-brand-gold rounded-full flex items-center justify-center shadow-lg">
              <MonitorPlay className="w-8 h-8 fill-current" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-6 left-6 px-4 py-2 bg-brand-brown/80 backdrop-blur-sm text-brand-cream text-2xs uppercase tracking-widest rounded-full">
          {badge}
        </div>
      </div>
      <h3 className="main-sermon-title text-2xl md:text-base lg:text-3xl-compact font-serif text-brand-brown mb-1.5 md:mb-3 group-hover:text-brand-sage transition-colors leading-tight">
        {sermon.sermonTitle}
      </h3>
      <div className="flex items-center gap-4 text-brand-brown/60 text-sm">
        <span className="flex items-center gap-1">
          <Clock className="w-4 h-4" /> {sermon.date}
        </span>
        {sermon.passage && (
          <>
            <span className="w-px h-3 bg-brand-gold/30"></span>
            <span>{sermon.passage}</span>
          </>
        )}
      </div>
    </motion.div>
  );
}

export default function HomeSections({
  onPlayVideo,
  onPrayerRequest,
}: {
  onPlayVideo: (v: { title: string; embedUrl: string }) => void;
  onPrayerRequest: () => void;
}) {
  const [, navigate] = useLocation();
  // DB: 공개 영상 중 가장 최근 주일/금요 설교
  const { data: videos = [] } = useQuery({
    queryKey: ["videos", "public-sermons"],
    queryFn: () => api.get<Video[]>("/videos?publishedOnly=true"),
  });
  const newestFirst = [...videos].sort((a, b) =>
    String(b.sermonDate ?? b.createdAt).localeCompare(String(a.sermonDate ?? a.createdAt)),
  );
  const sundayVideo = newestFirst.find((v) => v.category === "sunday");
  const fridayVideo = newestFirst.find((v) => v.category === "friday");
  const sundaySermon = sundayVideo ? toSermon(sundayVideo) : null;
  const fridaySermon = fridayVideo ? toSermon(fridayVideo) : null;

  const [isScrolled, setIsScrolled] = useState(false);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const handleCopyAddress = () => {
    navigator.clipboard?.writeText("서울특별시 양천구 목동로 19길 28");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  const [activeCoreValue, setActiveCoreValue] = useState(0);
  const [selectedNextGen, setSelectedNextGen] = useState<number | null>(0);
  const [nextGenIndex, setNextGenIndex] = useState(0);
  const visibleCount = 3;
  const maxNextGenIndex = Math.max(0, nextGenItems.length - visibleCount);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const isDragging = useRef(false);
  const hasDragged = useRef(false);
  const handleNextGenSlide = () => setNextGenIndex((prev) => (prev >= maxNextGenIndex ? 0 : prev + 1));
  const handlePrevGenSlide = () => setNextGenIndex((prev) => (prev <= 0 ? maxNextGenIndex : prev - 1));
  const coreValueRoutes = [
    `/ministry/neighbor-love#${NEIGHBOR_LOVE_SLUGS[2]}`,
    `/ministry/neighbor-love#${NEIGHBOR_LOVE_SLUGS[1]}`,
    `/ministry/neighbor-love#${NEIGHBOR_LOVE_SLUGS[0]}`,
  ];
  const quickLinks = [
    { title: "예배안내", desc: "예배시간과 다양한 예배를 안내합니다.", icon: <Church className="w-12 h-12" />, color: "text-brand-gold", bgClass: "bg-brand-gold/6 hover:bg-brand-brown/20", href: "/church/worship" },
    { title: "오시는길", desc: "영신교회로 오시는 길을 상세히 안내합니다.", icon: <MapPin className="w-12 h-12" />, color: "text-brand-gold", bgClass: "bg-brand-sage/6 hover:bg-brand-brown/20", href: "/church/directions" },
    { title: "새가족안내", desc: "영신교회의 새가족이 되신 것을 환영합니다.", icon: <UserPlus className="w-12 h-12" />, color: "text-brand-gold", bgClass: "bg-brand-cream/80 hover:bg-brand-brown/20", href: "/community/new-member" },
    { title: "온라인예배", desc: "언제 어디서나 함께 드리는 온라인 예배입니다.", icon: <MonitorPlay className="w-12 h-12" />, color: "text-brand-brown", bgClass: "bg-brand-brown/5 hover:bg-brand-brown/20", href: "/sermons/sunday" },
  ];
  const coreValues=[
    {
      title: "행복한대학",
      desc: "배움과 웃음이 가득한 시니어들을 위한 선교 공동체입니다. 영신교회 성도 포함 지역 주민 65세 이상 어르신들을 위해 다채로운 활동 및 프로그램들이 진행됩니다.",
      icon: <GraduationCap className="w-6 h-6" />,
      image: "/images/mission_03.png",
      alt: "8명의 아시안 남녀 노인들이 테이블에 마주 앉아 다정하게 손을 맞잡고, 따스한 온기의 주황빛 햇살 아래 깊은 미소와 정감 가득한 이야기꽃을 피우며 차를 즐기는 일상 속 행복한 동양 시니어 공동체의 모습"
    },
    {
      title: "뮤직아카데미",
      desc: "음악을 통해 재능을 나누며 영혼의 치유와 성장을 이룹니다. 지역주민과 성도를 위해 다양한 아카데미를 열어 교회와 지역 사회를 연결합니다.",
      icon: <Music className="w-6 h-6" />,
      image: "/images/mission_02.png",
      alt: "Violin, instruments and sheets of music representing the academy"
    },
    {
      title: "사랑나눔박스",
      desc: "영신교회가 동행하는 사랑나눔은 한사람을 찾아갑니다. 신정4동 주민센터와 연계하여 독거 어르신과 1인 청년세대를 섬깁니다.",
      icon: <Heart className="w-6 h-6" />,
      image: "/images/mission_01.png",
      alt: "Volunteering donation box and sharing with the local community"
    }
  ];

  const handleTouchStart = (e: React.TouchEvent) => { setDragStartX(e.touches[0].clientX); isDragging.current = true; hasDragged.current = false; };
  const handleTouchMove = (e: React.TouchEvent) => { if (!isDragging.current || dragStartX === null) return; const o = e.touches[0].clientX - dragStartX; setDragOffset(o); if (Math.abs(o) > 10) hasDragged.current = true; };
  const handleTouchEnd = () => { if (!isDragging.current) return; isDragging.current = false; setDragStartX(null); if (dragOffset < -50) handleNextGenSlide(); else if (dragOffset > 50) handlePrevGenSlide(); setDragOffset(0); setTimeout(() => { hasDragged.current = false; }, 50); };
  const handleMouseDown = (e: React.MouseEvent) => { if (e.button !== 0) return; setDragStartX(e.clientX); isDragging.current = true; hasDragged.current = false; };
  const handleMouseMove = (e: React.MouseEvent) => { if (!isDragging.current || dragStartX === null) return; const o = e.clientX - dragStartX; setDragOffset(o); if (Math.abs(o) > 10) hasDragged.current = true; };
  const handleMouseUpOrLeave = () => { if (!isDragging.current) return; isDragging.current = false; setDragStartX(null); if (dragOffset < -50) handleNextGenSlide(); else if (dragOffset > 50) handlePrevGenSlide(); setDragOffset(0); setTimeout(() => { hasDragged.current = false; }, 50); };

  return (
    <>
          <section className={`main-quick-links relative z-20 px-6 pt-[var(--section-space)] pb-[clamp(2.5rem,4vw,3.125rem)] bg-brand-cream transition-all duration-700 ease-out ${isScrolled? '-mt-24 sm:-mt-16 lg:-mt-24':'-mt-16'
            } md:-mt-16 lg:-mt-24`}>
            <div className="max-w-[var(--content-max)] mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-5 lg:gap-8">
              {quickLinks.map((item,idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0,y: 20 }}
                  whileInView={{ opacity: 1,y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx*0.1 }}
                  whileHover={{ y: -8 }}
                  whileTap={{ y: -8 }}
                  onClick={() => navigate(item.href)}
                  className={`quick-link-card ${item.bgClass} p-4 md:p-5 lg:p-8 rounded-[2.5rem] shadow-xl flex flex-col items-center justify-between text-center group transition-all border border-brand-gold/10 min-h-[10rem] sm:min-h-[10.5rem] md:min-h-[9.875rem] lg:min-h-[15rem] cursor-pointer`}
                >
                  <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 w-full">
                    <div className={`transition-transform group-hover:scale-110 group-active:scale-110 duration-500 flex-shrink-0 ${item.color} mb-1 sm:mb-4 md:mb-1.5 lg:mb-4`}>
                      <div className="scale-75 sm:scale-100">{item.icon}</div>
                    </div>

                    <div className="flex flex-col justify-center items-center w-full">
                      <h3 className="font-serif text-base sm:text-xl md:text-xl lg:text-2xl font-bold text-brand-brown mb-0.5 sm:mb-2 md:mb-0 lg:mb-2 tracking-tight">
                        {item.title}
                      </h3>
                      <p className="hidden sm:block md:hidden lg:block text-brand-brown/50 text-2xs sm:text-xs lg:text-base leading-tight whitespace-pre-line px-2">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 sm:mt-4 md:mt-2 lg:mt-4">
                    <a href={item.href} aria-label={item.title+' 페이지로 이동'} onClick={(event) => { event.preventDefault(); event.stopPropagation(); navigate(item.href); }} className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-brand-gold rounded-full flex items-center justify-center text-white shadow-lg transition-all group-hover:bg-brand-sage group-hover:shadow-brand-sage/20 group-hover:scale-110 group-active:bg-brand-sage group-active:shadow-brand-sage/20 group-active:scale-110">
                      <ArrowRight className="w-3 h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Sermons Section */}
          <section id="설교말씀" className="pt-[var(--section-space)] pb-[clamp(2rem,3vw,2.5rem)] bg-brand-cream overflow-hidden text-brand-brown">
            <div className="max-w-[var(--content-max)] mx-auto px-6">
              <div className="sermon-heading mb-[clamp(1.5rem,3vw,2.5rem)]">
                <motion.div {...fadeIn} className="text-left">
                  <div className="flex items-center gap-2 text-brand-sage text-2xs sm:text-sm font-medium mb-4">
                    <MonitorPlay className="w-5 h-5" />
                    <span className="main-section-subtitle">말씀의 은혜</span>
                  </div>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <h2 className="text-3xl-compact md:text-3xl-compact lg:text-5xl font-serif text-brand-brown text-left w-full">영신교회 설교</h2>
                    <a
                      href="/sermons/sunday"
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-5 py-2.5 bg-brand-cream border border-brand-gold/20 text-brand-brown rounded-full hover:bg-brand-brown hover:text-brand-cream transition-all group font-medium shadow-sm text-sm md:text-base mt-1 cursor-pointer"
                    >
                      말씀 더보기 <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                  </div>
                </motion.div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 landscape:lg:gap-16">
                {sundaySermon && (
                  <HomeSermonCard sermon={sundaySermon} badge="이번주 주일 설교" delay={0.1} className="group cursor-pointer" onPlay={onPlayVideo} />
                )}
                {fridaySermon && (
                  <HomeSermonCard sermon={fridaySermon} badge="금요 기도회" delay={0.2} className="hidden md:block group cursor-pointer" onPlay={onPlayVideo} />
                )}
              </div>
            </div>
          </section>

          {/* Intro Section */}
          <section id="핵심사역" className="block pt-[var(--section-space)] pb-[clamp(2rem,3vw,2.5rem)] bg-white overflow-hidden">
            <div className="max-w-[var(--content-max)] mx-auto px-4 md:px-6">
              <motion.div {...fadeIn} className="ministry-heading text-center mb-[var(--section-heading-gap)]">
                <div className="flex items-center justify-center gap-2 text-brand-sage text-2xs sm:text-sm font-medium mb-4">
                  <Leaf className="w-5 h-5" />
                  <span className="main-section-subtitle">이웃 사랑의 실천</span>
                </div>
                <h2 className="text-3xl-compact md:text-4xl lg:text-5xl font-serif mb-4 text-brand-brown leading-tight mx-auto text-center w-full">
                  영신교회 지역선교사역
                </h2>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2 md:gap-10 md:items-stretch md:h-[25rem]">
                <motion.div {...fadeIn} className="relative h-[13.75rem] md:h-[26.25rem]">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-brand-sage/10 rounded-full blur-3xl"></div>
                  <div
                    className="relative z-10 rounded-[2rem] overflow-hidden shadow-2xl h-full w-full group hover:shadow-brand-sage/20 hover:shadow-2xl transition-all duration-300 cursor-pointer"
                    onClick={() => navigate(coreValueRoutes[activeCoreValue])}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if(e.key==='Enter'||e.key===' ') {
                        e.preventDefault();
                        navigate(coreValueRoutes[activeCoreValue]);
                      }
                    }}
                  >
                    {/* Active Core Value Image */}
                    <motion.img
                      key={activeCoreValue}
                      initial={{ opacity: 0,scale: 0.98 }}
                      animate={{ opacity: 1,scale: 1 }}
                      transition={{ duration: 0.35,ease: "easeOut" }}
                      src={coreValues[activeCoreValue].image}
                      alt={coreValues[activeCoreValue].alt}
                      className="h-full w-full object-cover aspect-[4/3] group-hover:scale-[1.03] transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      id="core-value-active-img"
                    />

                    {/* Elegant Overlay Layer */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/55 via-black/20 to-transparent flex flex-col justify-start p-5 md:p-10">
                      <motion.div
                        key={`${activeCoreValue}-overlay`}
                        initial={{ opacity: 0,y: -12 }}
                        animate={{ opacity: 1,y: 0 }}
                        transition={{ duration: 0.45,ease: "easeOut" }}
                        className="text-white text-left"
                      >
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-2xs md:text-sm font-semibold tracking-wider mb-2 border border-white/10 shadow-sm" id="overlay-badge">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse"></span>
                          CORE SERVICE
                        </span>
                        <h3 className="font-serif text-xl md:text-4xl font-medium tracking-tight mb-2 drop-shadow-md text-white group-hover:text-brand-gold transition-colors" id="overlay-title">
                          {coreValues[activeCoreValue].title}
                        </h3>
                      </motion.div>

                      <a
                        href={coreValueRoutes[activeCoreValue]}
                        onClick={(event) => { event.preventDefault(); event.stopPropagation(); navigate(coreValueRoutes[activeCoreValue]); }}
                        className="absolute bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur-sm text-white shadow-lg transition-all hover:scale-105 hover:bg-white/25"
                        aria-label={`${coreValues[activeCoreValue].title} 서브페이지로 이동`}
                      >
                        <ArrowRight className="h-5 w-5" />
                      </a>
                    </div>
                  </div>
                </motion.div>
                <motion.div {...fadeIn} transition={{ delay: 0.1 }} className="flex flex-col justify-center h-full">
                  <div className="grid grid-cols-1 grid-rows-3 gap-3 h-full">
                    {coreValues.map((item,idx) => {
                      const isActive=activeCoreValue===idx;
                      return (
                        <button
                          key={item.title}
                          onClick={() => {
                            setActiveCoreValue(idx);
                          }}
                          className={`flex h-full items-center justify-between gap-4 py-4 px-5 text-left rounded-3xl transition-all duration-300 border ${isActive
                              ? "bg-brand-sage border-brand-sage text-white shadow-lg scale-[1.02]"
                              :"bg-white border-transparent hover:border-brand-gold/30 shadow-sm hover:shadow-md text-brand-brown hover:scale-[1.01]"
                            } cursor-pointer outline-none`}
                          id={`core-value-btn-${idx}`}
                        >
                          <div className={isActive? "text-white":"text-brand-sage"}>
                            {item.icon}
                          </div>
                          <div className="core-value-copy flex-1 min-w-0">
                            <h4 className={`font-serif text-lg md:text-2xl mb-1 ${isActive? "text-white":"text-brand-brown"}`}>{item.title}</h4>
                            <p className={`text-xs md:text-base leading-relaxed ${isActive? "text-white/80":"text-brand-brown/70"}`}>{item.desc}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Canaan Section (Special Section for Non-attenders) */}
          <section id="가나안쉼터" className="pt-[var(--section-space)] pb-[clamp(2rem,3vw,2.5rem)] relative overflow-hidden md:min-h-[50rem]">
            <div className="absolute inset-0 z-0 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop"
                alt="Warm rest space"
                className="w-full h-full object-cover opacity-25 scale-150 md:scale-[1.8] origin-center"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="max-w-[var(--content-max)] mx-auto px-4 md:px-6 relative z-10 text-center">
              <motion.div {...fadeIn}>
                <div className="faith-subtitle inline-flex items-center gap-1 sm:gap-2 px-2.5 py-1 sm:px-4 sm:py-2 bg-brand-gold/10 text-brand-sage rounded-full text-2xs sm:text-sm font-medium mb-3 sm:mb-6">
                  <Wind className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span>당신의 쉼을 위한 공간</span>
                </div>
                <h2 className="text-3xl-compact md:text-4xl lg:text-5xl font-serif text-brand-brown mb-6 leading-tight mx-auto text-center w-full">
                  신앙의 고민과 질문
                </h2>
                <p className="faith-description text-base text-brand-brown/70 mb-[var(--section-heading-gap)] leading-relaxed max-w-2xl mx-auto">
                  신앙이 고민되거나 나와 예수님이 어떤 관계가 있는지 궁금할 때,<br />
                  혹은 삶이 지쳤을 때 부담 없이 메세지를 남겨주세요.<br />
                  당신을 위해 기도하고 필요하시다면 메세지에 응답해드립니다.
                </p>

                <div className="faith-cards grid md:grid-cols-2 gap-[var(--card-grid-gap)] text-left">
                  <div className="bg-white p-8 md:p-10 lg:p-12 rounded-[2rem] shadow-sm border border-brand-gold/20 hover:border-brand-sage transition-all group">
                    <div className="w-12 h-12 mb-4 rounded-full bg-brand-gold/10 text-brand-gold flex items-center justify-center group-hover:bg-brand-gold group-hover:text-white transition-colors">
                      <Church className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-sm md:text-xl mb-3 group-hover:text-brand-sage transition-colors">기도의 집</h3>
                    <p className="text-xs md:text-lg text-brand-brown/70 mb-4 font-light">익명으로 기도를 부탁하시거나, 마음의 짐을 털어놓으세요. 저희가 함께 마음을 모으겠습니다.</p>
                    <button
                      onClick={() => {
                        onPrayerRequest();
                      }}
                      className="text-brand-sage flex items-center gap-2 font-medium text-2xs md:text-sm hover:underline cursor-pointer"
                    >
                      기명/무기명 기도요청 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-white p-8 md:p-10 lg:p-12 rounded-[2rem] shadow-sm border border-brand-gold/20 hover:border-brand-sage transition-all group">
                    <div className="w-12 h-12 mb-4 rounded-full bg-brand-sage/10 text-brand-sage flex items-center justify-center group-hover:bg-brand-sage group-hover:text-white transition-colors">
                      <Cross className="w-6 h-6" />
                    </div>
                    <h3 className="font-serif text-sm md:text-xl mb-3 group-hover:text-brand-sage transition-colors">예수님은 누구이신가</h3>
                    <p className="text-xs md:text-lg text-brand-brown/70 mb-4 font-light">예수님이 누구신지, 그분이 우리에게 어떤 의미인지 쉽고 따뜻하게 알아볼 수 있습니다.</p>
                    <button
                      onClick={() => navigate("/jesus")}
                      className="text-brand-sage flex items-center gap-2 font-medium text-2xs md:text-sm cursor-pointer"
                    >
                      더 알아보기 <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Next Generation Section */}
          <section id="다음세대" className="pt-[var(--section-space)] pb-[clamp(1.1875rem,2.5vw,2.375rem)] bg-brand-cream/40 relative overflow-hidden border-t border-brand-gold/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-sage/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-gold/5 rounded-full blur-3xl"></div>

            <div className="nextgen-layout max-w-[var(--content-max)] mx-auto px-6 relative z-10">
              <div className="nextgen-heading flex flex-col md:flex-row md:items-end justify-between mb-2 md:mb-4 lg:mb-4">
                <motion.div {...fadeIn} className="text-left">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-sage/10 text-brand-sage rounded-full text-2xs sm:text-sm font-medium tracking-wide mb-3" id="nextgen-section-badge">
                    <Heart className="w-3.5 h-3.5" />
                    <span>꿈과 믿음이 자라가요</span>
                  </span>
                  <h2 className="text-3xl-compact md:text-4xl lg:text-5xl font-serif text-brand-brown leading-tight animate-fade-in text-left w-full">
                    영신교회 다음세대
                  </h2>
                </motion.div>

                {/* Slide Arrows */}
                <motion.div {...fadeIn} className="flex gap-2.5 mt-4 md:mt-0" id="nextgen-arrows">
                  <button
                    onClick={handlePrevGenSlide}
                    className="w-11 h-11 rounded-full border border-brand-gold/30 hover:border-brand-sage bg-white flex items-center justify-center text-brand-brown hover:text-brand-sage transition-all shadow-sm hover:shadow active:scale-90 cursor-pointer"
                    aria-label="이전 부서"
                    id="nextgen-prev-arrow"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextGenSlide}
                    className="w-11 h-11 rounded-full bg-brand-sage flex items-center justify-center text-white hover:bg-brand-brown transition-all shadow-md active:scale-90 cursor-pointer"
                    aria-label="다음 부서"
                    id="nextgen-next-arrow"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              </div>

              {/* Slider Container with absolute sizing */}
              <div className="nextgen-carousel relative overflow-hidden pt-2 pb-4 md:pt-4 md:pb-2 lg:py-4 -mx-3 px-3">
                <motion.div
                  className={`flex select-none ${isDragging.current? 'cursor-grabbing':'cursor-grab'}`}
                  style={{
                    transform: `translateX(calc(-${nextGenIndex*(100/visibleCount)}% + ${dragOffset}px))`,
                    transition: isDragging.current? 'none':'transform 500ms cubic-bezier(0.25, 1, 0.5, 1)'
                  }}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  id="nextgen-slider-tray"
                >
                  {nextGenItems.map((item,idx) => {
                    const isSelected=selectedNextGen===idx;
                    return (
                      <div
                        key={item.title}
                        className="w-full sm:w-1/2 lg:w-1/3 shrink-0 p-4"
                        id={`nextgen-slide-col-${idx}`}
                      >
                        <button
                          onClick={(e) => {
                            if(hasDragged.current) {
                              e.preventDefault();
                              return;
                            }
                            setSelectedNextGen(idx);
                            navigate(`/community/departments#${DEPARTMENT_SLUGS[idx]}`);
                          }}
                          className={`w-full text-left rounded-[2rem] overflow-hidden bg-white shadow-md hover:shadow-xl transition-all duration-300 border-2 flex flex-col h-full group ${isSelected
                              ? "border-brand-sage ring-4 ring-brand-sage/10"
                              :"border-transparent hover:border-brand-gold/30"
                            } cursor-pointer outline-none`}
                          id={`nextgen-card-btn-${idx}`}
                        >
                          {/* Image Button with Zoom Effect */}
                          <div className="relative aspect-[2/1] md:aspect-[12/5] w-full overflow-hidden select-none pointer-events-none">
                            <img
                              src={item.image}
                              alt={item.alt}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                              draggable="false"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                            />
                          </div>

                          {/* Content Panel */}
                          <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                              <h3 className="font-serif text-xl md:text-lg text-brand-brown mb-1 md:mb-2 group-hover:text-brand-sage transition-colors">
                                {item.title}
                              </h3>
                              <p className="text-sm text-brand-brown/75 leading-relaxed font-light mb-4 line-clamp-2 lg:line-clamp-3">
                                {item.desc}
                              </p>
                            </div>

                            {/* Quick Spec Badge */}
                            <div className="nextgen-card-spec pt-2 md:pt-4 border-t border-brand-gold/10 space-y-1.5 text-left">
                              <div className="flex items-center gap-2 text-base md:text-base text-brand-brown/65">
                                <span className="font-semibold text-brand-sage shrink-0 bg-brand-sage/10 px-1.5 py-0.5 rounded">대상</span>
                                <span className="truncate">{item.target}</span>
                              </div>
                              <div className="flex items-center gap-2 text-base md:text-base text-brand-brown/65">
                                <span className="font-semibold text-brand-gold/90 shrink-0 bg-brand-gold/10 px-1.5 py-0.5 rounded">시간</span>
                                <span className="truncate">{item.time}</span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </motion.div>
              </div>
            </div>
          </section>

          {/* Worship Info */}
          <section id="예배안내" className="pt-[var(--section-space)] pb-12 bg-brand-brown text-brand-cream relative overflow-hidden">
            {/* Curvy background effect */}
            <div className="absolute top-0 left-0 w-full h-6 md:h-24 bg-brand-cream curve-bottom"></div>

            <div className="max-w-[var(--content-max)] mx-auto px-6 pt-[clamp(1.125rem,4vw,3.625rem)]">
              <motion.div {...fadeIn} className="worship-heading text-center mb-[var(--section-heading-gap)]">
                <div className="flex items-center justify-center gap-2 text-brand-sage text-2xs sm:text-sm font-medium mb-4">
                  <Calendar className="w-5 h-5" />
                  <span className="tracking-widest uppercase text-2xs sm:text-sm font-medium">Worship Schedule</span>
                </div>
                <h2 className="text-4xl md:text-4xl lg:text-5xl font-serif mb-2 md:mb-4 mx-auto text-center w-full">예배 시간 및 장소</h2>
              </motion.div>

              <div className="worship-columns grid grid-cols-1 md:grid-cols-5 lg:grid-cols-5 gap-8 items-stretch mt-5">
                {/* Left Column: 찾아오시는 길 */}
                <div id="오시는길" className="md:col-span-3 lg:col-span-3 order-2 md:order-1 lg:order-1 bg-white p-6 md:p-6 lg:p-10 rounded-[2rem] md:rounded-[2.5rem] lg:rounded-[3rem] text-brand-brown shadow-2xl flex flex-col justify-between md:h-[26.875rem] lg:h-[26.875rem]">
                  <div>
                    <div className="space-y-3 md:space-y-1.5 mb-6 md:mb-3 lg:mb-6 text-left">
                      <div className="flex items-start gap-2.5 text-brand-brown/85 text-base md:text-xs lg:text-base font-normal leading-relaxed">
                        <MapPin className="w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 text-brand-sage shrink-0 mt-1" id="directions-map-icon" />
                        <span className="flex items-center flex-wrap gap-2">
                          <span>주소 : 서울특별시 양천구 목동로 19길 28</span>
                          <button
                            onClick={handleCopyAddress}
                            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md bg-brand-cream hover:bg-brand-sage hover:text-white text-brand-brown/80 transition-all border border-brand-gold/20 active:scale-95 cursor-pointer shrink-0 ml-1"
                            title="주소 복사"
                            id="copy-address-btn"
                          >
                            {copied? (
                              <>
                                <Check className="w-3 h-3 text-brand-sage" />
                                <span className="text-xs">복사완료</span>
                              </>
                            ):(
                              <>
                                <Copy className="w-3 h-3" />
                                <span className="text-xs">복사</span>
                              </>
                            )}
                          </button>
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5 text-brand-brown/85 text-base md:text-xs lg:text-base font-normal leading-relaxed">
                        <Phone className="w-4 h-4 md:w-4 md:h-4 lg:w-5 lg:h-5 text-brand-sage shrink-0 mt-1" id="directions-phone-icon" />
                        <span>연락처 : 02-123-4567</span>
                      </div>
                    </div>
                  </div>

                  {/* Map */}
                  <div className="worship-map w-full aspect-[4/3] md:flex-1 md:aspect-auto lg:aspect-auto lg:flex-1 lg:min-h-[10rem] bg-gray-100 rounded-[2rem] overflow-hidden border border-brand-gold/10 shadow-inner">
                    <iframe
                      src="https://maps.google.com/maps?q=%EC%84%9C%EC%9A%B8%ED%8A%B9%EB%B3%84%EC%8B%9C%20%EC%96%91%EC%B2%9C%EA%B5%AC%20%EB%AA%A9%EB%8F%99%EB%A1%9C%2019%EA%B8%B8%2028&t=&z=16&ie=UTF8&iwloc=&output=embed"
                      className="w-full h-full border-0"
                      allowFullScreen
                      loading="lazy"
                      title="영신교회 지도"
                      referrerPolicy="no-referrer"
                      id="google-maps-iframe"
                    ></iframe>
                  </div>
                </div>

                {/* Right Column: 예배시간 정보 리스트 */}
                <div className="md:col-span-2 lg:col-span-2 order-1 md:order-2 lg:order-2 grid grid-cols-2 md:grid-cols-1 md:grid-rows-5 lg:grid-cols-1 gap-3 md:gap-1.5 lg:gap-3 lg:justify-center justify-between md:self-center md:h-[26.875rem] lg:h-[24.375rem]">
                  {[
                    { type: "주일 1부 예배",time: "09:30",place: "교회 2층 본당" },
                    { type: "주일 2부 예배",time: "11:30",place: "교회 2층 본당" },
                    { type: "청년부 예배",time: "14:00",place: "교회 2층 본당" },
                    { type: "금요 기도회",time: "20:30",place: "교회 2층 본당" },
                    { type: "수요 성경대학",time: "19:30",place: "교회 2층 본당" }
                  ].map((item,idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.02 }}
                      className={`bg-white/15 backdrop-blur-sm px-4 md:px-4 lg:px-6 py-2.5 md:py-0.5 lg:py-4 rounded-[1.75rem] border border-white/15 hover:bg-white/20 transition-all items-center justify-between md:justify-between lg:justify-between h-[3.625rem] sm:h-[3.875rem] md:h-full lg:h-full md:min-h-0 lg:min-h-0 ${idx===4? 'hidden md:flex':'flex'
                        } flex-row md:flex-row lg:flex-row md:gap-0 lg:gap-0`}
                      id={`worship-schedule-item-${idx}`}
                    >
                      {/* PC Version Layout (Hidden on Mobile) */}
                      <div className="hidden md:flex flex-row items-center justify-between text-left gap-4 w-full">
                        {/* Left: Worship Type */}
                        <div className="worship-schedule-title text-brand-gold/60 text-lg md:text-lg xl:text-xl min-[1400px]:text-xl lg:text-xl uppercase tracking-widest font-semibold leading-none whitespace-nowrap">
                          <span className="hidden lg:inline">{item.type}</span>
                          <span className="lg:hidden">
                            {item.type==="주일 1부 예배"? "1부예배":
                              item.type==="주일 2부 예배"? "2부예배":
                                item.type===" 예배"? "청년부":
                                  item.type==="수요 성경대학"? "수요 성경대학":item.type}
                          </span>
                        </div>
                        {/* Right: Place & Time side by side */}
                        <div className="flex flex-row items-center gap-4 whitespace-nowrap">
                          {/* Place */}
                          <div className="flex text-white/40 items-center gap-1 text-sm leading-none">
                            <MapPin className="w-3.5 h-3.5 text-brand-gold/40 shrink-0" />
                            <span>
                              <span className="hidden lg:inline">{item.place}</span>
                              <span className="lg:hidden">
                                {item.place==="교회 2층 본당"? "2층 본당":item.place}
                              </span>
                            </span>
                          </div>
                          {/* Time */}
                          <div className="text-xl md:text-lg xl:text-lg min-[1400px]:text-2xl lg:text-2xl font-mono tracking-tight text-brand-gold font-light leading-none">
                            {item.time}
                          </div>
                        </div>
                      </div>

                      {/* Mobile Version Layout (Hidden on PC) */}
                      <div className="flex md:hidden items-center justify-between w-full h-full gap-2">
                        <div className="text-left">
                          <div className="text-brand-gold/60 text-base sm:text-lg uppercase tracking-widest font-semibold leading-none">
                            {item.type==="주일 1부 예배"? "1부예배":
                              item.type==="주일 2부 예배"? "2부예배":
                                item.type==="주일 청년부 예배"? "청년부":
                                  item.type==="금요 기도회"? "금요기도":
                                    item.type==="수요 성경대학"? "수요 성경대학":item.type}
                          </div>
                        </div>
                        <div className="text-right flex items-center shrink-0">
                          <div className="text-base sm:text-xl font-mono tracking-tight text-brand-gold font-light leading-none">
                            {item.time}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

    </>
  );
}
