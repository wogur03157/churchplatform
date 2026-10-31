import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContentCategory, ContentPage } from "@shared/entities";
import { ChevronDown, Menu, UserPlus, X } from "lucide-react";
import FontSizePicker from "./FontSizePicker";
import IconLogo from "./IconLogo";

type CategoryNode = ContentCategory & {
  page: Pick<ContentPage, "id" | "status" | "title" | "templateCode"> | null;
  children: CategoryNode[];
};

type NavGrandChild = { label: string; href: string };
type NavChild = { label: string; href: string; children: NavGrandChild[] };
type NavItem = { label: string; children: NavChild[] };

type PublicHeaderProps = {
  preloadedSiteConfigs?: any[];
  preloadedCategoryForest?: CategoryNode[];
  /** true면 최상단에서 투명, 스크롤 시 솔리드. 홈화면용. */
  transparent?: boolean;
};

const MENU_COLUMN_WIDTH_REM = 11.5;

function buildNavigationMenu(roots: CategoryNode[] | undefined): NavItem[] {
  return (roots ?? [])
    .filter((root) => root.status === "active")
    .map((root) => ({
      label: root.name,
      children: (root.children ?? [])
        .filter((child) => child.status === "active")
        .map((child) => ({
          label: child.name,
          href: `/${root.slug}/${child.slug}`,
          children: (child.children ?? [])
            .filter((gc) => gc.status === "active")
            .map((gc) => ({
              label: gc.name,
              href: `/${root.slug}/${child.slug}/${gc.slug}`,
            })),
        })),
    }))
    .filter((item) => item.children.length > 0);
}

export default function PublicHeader({
  preloadedSiteConfigs,
  preloadedCategoryForest,
  transparent = false,
}: PublicHeaderProps = {}) {
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [openMenu, setOpenMenu]         = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [isScrolled, setIsScrolled]     = useState(false);
  const [location]                      = useLocation();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* 스크롤 감지 */
  useEffect(() => {
    if (!transparent) return;
    const onScroll = () => setIsScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  const { data: fetchedSiteConfigs } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => api.get<any[]>("/site-config"),
    staleTime: 5 * 60 * 1000,
    enabled: !preloadedSiteConfigs,
  });

  const { data: fetchedCategoryForest } = useQuery<CategoryNode[]>({
    queryKey: ["content-pages", "tree", "forest"],
    queryFn: () => api.get<CategoryNode[]>("/content-pages/categories/tree"),
    staleTime: 5 * 60 * 1000,
    enabled: !preloadedCategoryForest,
  });

  const siteConfigs    = preloadedSiteConfigs    ?? fetchedSiteConfigs    ?? [];
  const categoryForest = preloadedCategoryForest ?? fetchedCategoryForest ?? [];
  const cfg = (key: string) => siteConfigs.find((item: any) => item.key === key)?.value ?? "";

  const churchName = cfg("church_name") || "영신교회";
  const logoUrl    = cfg("church_logo_url");
  const navMenu    = useMemo(() => buildNavigationMenu(categoryForest), [categoryForest]);
  const menuWidthRem = navMenu.length * MENU_COLUMN_WIDTH_REM + 4;

  const cancelClose  = () => { if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; } };
  const scheduleClose = () => { cancelClose(); closeTimer.current = setTimeout(() => setOpenMenu(null), 180); };

  useEffect(() => {
    setMobileOpen(false); setOpenMenu(null); setOpenAccordion(null); cancelClose();
  }, [location]);
  useEffect(() => () => cancelClose(), []);

  /* 헤더 스타일 결정 — 참고자료 기준: 텍스트는 항상 brand-brown, 배경만 전환 */
  const isSolid = !transparent || isScrolled;
  const headerBg = isSolid
    ? "bg-[var(--color-brand-cream)]/80 backdrop-blur-md shadow-sm border-b border-[var(--color-brand-gold)]/20"
    : "bg-transparent";
  const activeBtn   = "bg-brand-sage/15 text-brand-sage";
  const inactiveBtn = "text-brand-brown/80 hover:text-brand-sage hover:bg-brand-sage/10";

  const megaContent = (
    <div
      className="grid gap-8 px-8 py-6"
      style={{ gridTemplateColumns: `repeat(${navMenu.length}, ${MENU_COLUMN_WIDTH_REM}rem)` }}
    >
      {navMenu.map((menuItem, menuIndex) => {
        const isActive = openMenu === menuIndex;
        return (
          <div key={menuItem.label} onMouseEnter={() => { cancelClose(); setOpenMenu(menuIndex); }}>
            <p className={`mb-3 text-base font-bold ${isActive ? "text-brand-sage" : "text-brand-brown"}`}>
              {menuItem.label}
            </p>
            <div className="space-y-4">
              {menuItem.children.map((child) => (
                <div key={`${menuItem.label}-${child.href}`} className="space-y-2">
                  <Link href={child.href} className="block py-1 text-sm font-medium text-brand-brown/80 transition-colors hover:text-brand-sage">
                    {child.label}
                  </Link>
                  {child.children.length > 0 && (
                    <div className="space-y-1 pl-3">
                      {child.children.map((gc) => (
                        <Link key={gc.href} href={gc.href} className="flex items-center gap-1.5 py-0.5 text-xs text-brand-brown/50 transition-colors hover:text-brand-brown">
                          <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                          {gc.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${headerBg}`}>
        <div className="container flex h-16 items-center justify-between">
          {/* 로고 */}
          <Link href="/">
            <div className="group flex cursor-pointer items-center gap-2.5">
              {logoUrl ? (
                <img src={logoUrl} alt={churchName} className="h-9 w-9 shrink-0 object-contain" />
              ) : (
                <IconLogo size={36} />
              )}
              <div className="flex flex-col justify-center -space-y-0.5">
                <span className="font-serif text-xl font-semibold leading-tight tracking-tight text-brand-brown">
                  {churchName}
                </span>
                <span className="whitespace-nowrap text-[0.6rem] font-medium tracking-tight leading-tight text-brand-brown/50">
                  하나님 사랑 이웃 사랑
                </span>
              </div>
            </div>
          </Link>

          {/* 데스크탑 메뉴 */}
          <div className="relative hidden items-center gap-1 lg:gap-2 lg:flex" onMouseLeave={scheduleClose}>

            {navMenu.map((item, index) => (
              <button
                key={item.label}
                className={`flex items-center justify-center gap-1 rounded-full px-3 py-2 text-base font-medium transition-all duration-200 whitespace-nowrap ${
                  openMenu === index ? activeBtn : inactiveBtn
                }`}
                onMouseEnter={() => { cancelClose(); setOpenMenu(index); }}
              >
                {item.label}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${openMenu === index ? "rotate-180" : ""}`} />
              </button>
            ))}

            {openMenu !== null && (
              <div
                className="absolute right-0 top-full z-50 animate-in fade-in slide-in-from-top-2 pt-2 duration-200"
                onMouseEnter={cancelClose}
              >
                <div
                  className="max-w-[calc(100vw-3rem)] overflow-hidden rounded-[1.5rem] border border-brand-gold/15 bg-white/95 shadow-xl backdrop-blur-md"
                  style={{ width: `${menuWidthRem}rem` }}
                >
                  {megaContent}
                </div>
              </div>
            )}

            {/* 새가족 안내 CTA 버튼 */}
            <Link href="/community/new-member">
              <a className="ml-2 flex items-center gap-1.5 rounded-full bg-brand-brown px-4 py-2 text-sm font-medium text-brand-cream whitespace-nowrap hover:bg-brand-sage transition-colors duration-200 shadow-sm">
                <UserPlus className="h-3.5 w-3.5" />
                새가족 안내
              </a>
            </Link>
          </div>

          {/* 모바일 햄버거 */}
          <button
            className="rounded-md p-2 transition-colors lg:hidden text-brand-brown hover:bg-brand-sage/10"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* 모바일 오버레이 */}
      <div
        className={`fixed inset-0 z-50 bg-black/40 transition-opacity duration-300 lg:hidden ${
          mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
      />

      {/* 모바일 사이드 드로어 */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-72 bg-white shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-brand-gold/20">
          <span className="font-serif text-base font-bold text-brand-brown">메뉴</span>
          <button
            className="rounded-md p-1.5 text-brand-brown hover:bg-brand-sage/10 transition-colors"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {navMenu.map((item, index) => (
            <div key={item.label} className="border-b border-brand-gold/10 last:border-b-0">
              <button
                className="flex w-full items-center justify-between px-5 py-3.5 text-left text-base font-semibold text-brand-brown transition-colors hover:bg-brand-sage/10"
                onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 text-brand-sage transition-transform duration-200 ${openAccordion === index ? "rotate-180" : ""}`} />
              </button>
              {openAccordion === index && (
                <div className="bg-brand-cream/50 pb-2">
                  {item.children.map((child) => (
                    <div key={`${item.label}-${child.href}`}>
                      <Link href={child.href} className="block px-7 py-2.5 text-base font-medium text-brand-brown/70 transition-colors hover:text-brand-sage">
                        {child.label}
                      </Link>
                      {child.children.map((gc) => (
                        <Link key={gc.href} href={gc.href} className="block py-1.5 pl-10 pr-5 text-sm text-brand-brown/40 transition-colors hover:text-brand-brown">
                          {gc.label}
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="px-5 pt-4 pb-2">
            <Link href="/community/new-member">
              <a className="flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-brand-brown text-brand-cream text-base font-semibold hover:bg-brand-sage transition-colors">
                <UserPlus className="h-4 w-4" />
                새가족 안내
              </a>
            </Link>
          </div>

          <div className="border-t border-brand-gold/15 px-5 py-4">
            <FontSizePicker />
          </div>
        </div>
      </div>
    </>
  );
}
