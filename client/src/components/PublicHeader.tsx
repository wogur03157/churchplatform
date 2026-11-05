import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, UserPlus, X } from "lucide-react";
import FontSizePicker from "./FontSizePicker";
import IconLogo from "./IconLogo";

/* 디자인 프로젝트(ys)의 사이트맵과 동일한 메뉴 구조. 하위 항목은 페이지 안의 인덱스(#n)로 이동합니다. */
type SitemapItem = { name: string; href: string; subItems?: { name: string; href: string }[] };
type SitemapCategory = { title: string; items: SitemapItem[] };

export const SITEMAP: SitemapCategory[] = [
  {
    title: "교회소개",
    items: [
      { name: "영신교회", href: "/church/about" },
      { name: "예배안내", href: "/church/worship" },
      { name: "오시는길", href: "/church/directions" },
    ],
  },
  {
    title: "설교",
    items: [
      { name: "주일/금요 설교", href: "/sermons/sunday" },
      { name: "수요/특별 설교", href: "/sermons/midweek" },
    ],
  },
  {
    title: "공동체",
    items: [
      {
        name: "다음세대",
        href: "/community/departments",
        subItems: [
          { name: "유아부", href: "/community/departments#toddler" },
          { name: "유치부", href: "/community/departments#kindergarten" },
          { name: "초등부", href: "/community/departments#elementary" },
          { name: "청소년부", href: "/community/departments#youth" },
          { name: "청년부", href: "/community/departments#young-adult" },
        ],
      },
      { name: "작은교회", href: "/community/small-church" },
      { name: "새가족안내", href: "/community/new-member" },
    ],
  },
  {
    title: "사역과양육",
    items: [
      {
        name: "하나님사랑",
        href: "/ministry/god-love",
        subItems: [
          { name: "제자반/사역반", href: "/ministry/god-love#disciple-training" },
          { name: "성경대학", href: "/ministry/god-love#bible-college" },
          { name: "온라인 독서모임", href: "/ministry/god-love#online-reading" },
          { name: "마더와이즈/파더와이즈", href: "/ministry/god-love#mothers-fathers-wise" },
        ],
      },
      {
        name: "이웃사랑",
        href: "/ministry/neighbor-love",
        subItems: [
          { name: "사랑나눔박스", href: "/ministry/neighbor-love#sarang-nanum-box" },
          { name: "뮤직아카데미", href: "/ministry/neighbor-love#music-academy" },
          { name: "행복한대학", href: "/ministry/neighbor-love#happy-university" },
          { name: "결혼예비학교", href: "/ministry/neighbor-love#wedding-school" },
        ],
      },
    ],
  },
  {
    title: "교회소식",
    items: [
      { name: "공지사항", href: "/news/announcements" },
      { name: "사역게시판", href: "/news/ministry-board" },
    ],
  },
];

type PublicHeaderProps = {
  /** 기존 호출부 호환용 (메뉴는 정적 사이트맵을 사용합니다) */
  preloadedSiteConfigs?: unknown[];
  preloadedCategoryForest?: unknown[];
  /** true면 최상단에서 투명, 스크롤 시 솔리드. 홈화면용. */
  transparent?: boolean;
};

export default function PublicHeader({ transparent = false }: PublicHeaderProps = {}) {
  const [location, navigate] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSitemapOpen, setIsSitemapOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  // 경로가 바뀌면 메뉴를 닫습니다.
  useEffect(() => {
    setIsSitemapOpen(false);
    setIsMenuOpen(false);
  }, [location]);

  const isSolid = !transparent || isScrolled;
  const textMain = isSolid ? "text-brand-brown/85 hover:text-brand-sage" : "text-[#D3C7B5] hover:text-brand-gold";
  const barBg = isSolid
    ? "bg-brand-cream/95 backdrop-blur-md py-4 border-b border-brand-gold/20 shadow-lg"
    : "bg-transparent py-6";

  /* 같은 페이지의 하위 항목(#n)은 해시만 바꾸고, 다른 페이지는 라우팅합니다. */
  const go = (href: string) => {
    setIsSitemapOpen(false);
    setIsMenuOpen(false);
    const [path, hash] = href.split("#");
    if (window.location.pathname === path) {
      if (hash !== undefined) {
        window.location.hash = hash;
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }
    navigate(href);
  };

  return (
    <>
      <nav
        id="navbar"
        onMouseEnter={() => setIsSitemapOpen(true)}
        onMouseLeave={() => setIsSitemapOpen(false)}
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${barBg}`}
      >
        <div className="max-w-[var(--content-max)] mx-auto px-6 h-full flex items-center justify-between">
          <button
            type="button"
            id="logo"
            className="flex items-center gap-1.5 group cursor-pointer"
            onClick={() => go("/")}
          >
            <IconLogo size={30} />
            <div className="flex items-baseline gap-2">
              <span
                className={`font-serif text-3xl-compact font-semibold tracking-tight transition-colors duration-300 mt-1 ${
                  isSolid ? "text-brand-brown" : "text-brand-gold"
                }`}
              >
                영신교회
              </span>
              <span
                className={`header-tagline hidden sm:inline-block md:hidden lg:inline-block text-sm font-medium tracking-tight whitespace-nowrap transition-colors duration-300 ${
                  isSolid ? "text-brand-brown/50" : "text-[#B5A795]"
                }`}
              >
                하나님을 기쁘시게, 사람을 행복하게
              </span>
            </div>
          </button>

          {/* 데스크탑 메뉴 */}
          <div className="hidden md:flex items-center md:gap-4 lg:gap-8 xl:gap-10">
            {SITEMAP.map((category) => (
              <button
                key={category.title}
                type="button"
                onClick={() => setIsSitemapOpen(true)}
                className={`text-base font-medium transition-colors relative group whitespace-nowrap py-2 cursor-pointer ${textMain}`}
              >
                {category.title}
                <span
                  className={`absolute -bottom-1 left-0 w-0 h-0.5 transition-all group-hover:w-full ${
                    isSolid ? "bg-brand-sage" : "bg-brand-gold"
                  }`}
                />
              </button>
            ))}
            <button
              type="button"
              onClick={() => go("/community/new-member")}
              className="bg-brand-brown text-brand-cream md:px-4 md:py-2 lg:px-6 lg:py-2.5 rounded-full text-base font-medium hover:bg-brand-sage transition-all hover:shadow-lg whitespace-nowrap ml-2"
            >
              새가족 안내
            </button>
          </div>

          <button
            type="button"
            aria-label="메뉴 열기"
            className={`md:hidden p-2 transition-colors duration-300 ${isSolid ? "text-brand-brown" : "text-brand-gold"}`}
            onClick={() => setIsMenuOpen((v) => !v)}
          >
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* 데스크탑 전체 사이트맵 (마우스를 올리면 펼쳐짐) */}
        <AnimatePresence>
          {isSitemapOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute top-full left-0 w-full bg-brand-cream/98 backdrop-blur-md border-b border-brand-gold/15 shadow-2xl overflow-hidden hidden md:block"
            >
              <div className="max-w-[var(--content-max)] mx-auto px-8 py-10 grid grid-cols-5 gap-6 text-left">
                {SITEMAP.map((category) => (
                  <div key={category.title} className="flex flex-col gap-4">
                    <h4 className="font-serif text-lg font-bold text-brand-brown border-b border-brand-gold/25 pb-2 mb-1">
                      {category.title}
                    </h4>
                    <ul className="flex flex-col gap-3">
                      {category.items.map((item) => (
                        <li key={item.name} className="flex flex-col">
                          <button
                            type="button"
                            onClick={() => go(item.href)}
                            className="text-left text-sm lg:text-base font-semibold text-brand-brown/95 hover:text-brand-sage transition-colors leading-normal"
                          >
                            {item.name}
                          </button>
                          {item.subItems && (
                            <ul className="pl-2 border-l border-brand-gold/15 flex flex-col gap-1.5 mt-1.5 mb-1">
                              {item.subItems.map((sub) => (
                                <li key={sub.name}>
                                  <button
                                    type="button"
                                    onClick={() => go(sub.href)}
                                    className="text-left text-sm text-brand-brown/80 hover:text-brand-sage transition-colors block leading-tight font-normal"
                                  >
                                    • {sub.name}
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 모바일 메뉴 */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="absolute top-full left-0 w-full bg-brand-cream border-b border-brand-gold/20 px-6 pt-6 pb-8 md:hidden flex flex-col gap-4 shadow-xl overflow-y-auto max-h-[calc(100dvh-4rem)]"
            >
              {SITEMAP.map((category) => (
                <div key={category.title} className="flex flex-col gap-2 border-b border-brand-gold/10 pb-3 last:border-b-0">
                  <span className="text-xl font-serif font-bold text-brand-brown">{category.title}</span>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-1 pl-2">
                    {category.items.map((item) => (
                      <div key={item.name} className="flex flex-col gap-1">
                        <button
                          type="button"
                          onClick={() => go(item.href)}
                          className="text-left text-base font-semibold text-brand-brown/80"
                        >
                          {item.name}
                        </button>
                        {item.subItems?.map((sub) => (
                          <button
                            key={sub.name}
                            type="button"
                            onClick={() => go(sub.href)}
                            className="text-left text-sm text-brand-brown/70 pl-2"
                          >
                            • {sub.name}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => go("/community/new-member")}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-brown text-brand-cream text-base font-semibold"
                >
                  <UserPlus className="h-4 w-4" />
                  새가족 안내
                </button>
              </div>
              <div className="border-t border-brand-gold/15 pt-4">
                <FontSizePicker />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
