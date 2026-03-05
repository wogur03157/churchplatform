import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Menu, X, ChevronDown } from "lucide-react";

type NavChild = { label: string; href: string; groupKey?: string };
type NavItem  = { label: string; children: NavChild[] };

// ─── 드롭다운 스타일 ─────────────────────────────────────────────────────────
//   "full" : 브라우저 전체 너비 (full-bleed mega menu)
//   "nav"  : 내비게이션 버튼 영역 너비에 맞춤
const DROPDOWN_STYLE: "full" | "nav" = "nav";
// ─────────────────────────────────────────────────────────────────────────────

const NAV_MENU: NavItem[] = [
  { label: "교회소개", children: [
    { label: "영신교회",   href: "/church/about" },
    { label: "예배안내",   href: "/church/worship" },
    { label: "오시는길",   href: "/church/directions" },
  ]},
  { label: "설교", children: [
    { label: "주일설교",       href: "/sermons/sunday" },
    { label: "수요/금요 설교", href: "/sermons/midweek" },
    { label: "특별설교",       href: "/sermons/special" },
  ]},
  { label: "공동체", children: [
    { label: "부서소개",    href: "/community/departments", groupKey: "departments" },
    { label: "작은교회",    href: "/community/small-church" },
    { label: "새가족 안내", href: "/community/new-member" },
  ]},
  { label: "사역과양육", children: [
    { label: "하나님사랑", href: "/ministry/god-love",      groupKey: "god-love" },
    { label: "이웃사랑",   href: "/ministry/neighbor-love", groupKey: "neighbor-love" },
  ]},
  { label: "교회소식", children: [
    { label: "공지사항",   href: "/news/announcements" },
    { label: "사역게시판", href: "/news/ministry-board" },
  ]},
];

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen]       = useState(false);
  const [openMenu, setOpenMenu]           = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [location] = useLocation();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: pageGroups } = useQuery({
    queryKey: ["page-groups"],
    queryFn: () => api.get<any[]>("/page-groups"),
    staleTime: 5 * 60 * 1000,
  });

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };

  useEffect(() => {
    setMobileOpen(false);
    cancelClose();
    setOpenMenu(null);
  }, [location]);

  useEffect(() => () => cancelClose(), []);

  const getGroupItems = (groupKey: string) =>
    (pageGroups ?? []).filter((g: any) => g.groupKey === groupKey && g.isVisible !== 0);

  /* ── 드롭다운 컨텐츠 (두 스타일 공통) ────────────────────── */
  const megaContent = (
    <div className="grid grid-cols-5 gap-6 py-6 px-4">
      {NAV_MENU.map((menuItem, menuIdx) => {
        const isActive = openMenu === menuIdx;
        return (
          <div
            key={menuIdx}
            className={`transition-opacity duration-150 ${isActive ? "opacity-100" : "opacity-40"}`}
            onMouseEnter={() => { cancelClose(); setOpenMenu(menuIdx); }}
          >
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {menuItem.label}
            </p>
            <div className="space-y-0.5">
              {menuItem.children.map((child, cidx) => {
                const subItems = child.groupKey ? getGroupItems(child.groupKey) : [];
                return (
                  <div key={cidx} className="mb-1">
                    <Link href={child.href}>
                      <a className="block py-1 text-sm font-medium hover:text-primary transition-colors">
                        {child.label}
                      </a>
                    </Link>
                    {subItems.map((group: any) => (
                      <Link key={group.id} href={`${child.href}/${group.slug ?? group.id}`}>
                        <a className="flex items-center gap-1.5 pl-3 py-0.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                          <span className="w-1 h-1 rounded-full bg-current shrink-0 opacity-60" />
                          {group.name}
                        </a>
                      </Link>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <header className="sticky top-0 z-50 w-full relative">

      {/* ── 상단 바 ──────────────────────────────────────────── */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">

          {/* 로고 */}
          <Link href="/">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60 cursor-pointer">
              영신교회
            </span>
          </Link>

          {/* ── 데스크탑 내비게이션 ──────────────────────────── */}
          {DROPDOWN_STYLE === "nav" ? (
            /* NAV 스타일: nav 컨테이너가 포지셔닝 기준 */
            <div
              className="relative hidden md:flex items-center gap-0.5"
              onMouseLeave={scheduleClose}
            >
              {NAV_MENU.map((item, idx) => (
                <button
                  key={idx}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    openMenu === idx ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onMouseEnter={() => { cancelClose(); setOpenMenu(idx); }}
                >
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu !== null ? "rotate-180" : ""}`} />
                </button>
              ))}

              {/* 드롭다운: nav 오른쪽 끝 기준 정렬, 너비는 컨텐츠에 맞게 */}
              {openMenu !== null && (
                <div
                  className="absolute top-full right-0 z-50 pt-1"
                  onMouseEnter={cancelClose}
                >
                  <div className="bg-background border rounded-xl shadow-lg w-max">
                    {megaContent}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* FULL 스타일: 버튼만, 드롭다운은 header 기준으로 아래에 따로 렌더 */
            <nav
              className="hidden md:flex items-center gap-0.5"
              onMouseLeave={scheduleClose}
            >
              {NAV_MENU.map((item, idx) => (
                <button
                  key={idx}
                  className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    openMenu === idx ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onMouseEnter={() => { cancelClose(); setOpenMenu(idx); }}
                >
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${openMenu !== null ? "rotate-180" : ""}`} />
                </button>
              ))}
            </nav>
          )}

          {/* 모바일 햄버거 */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="메뉴 열기/닫기"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* ── FULL 스타일 전용: 헤더 전체 너비 드롭다운 ──────────── */}
      {DROPDOWN_STYLE === "full" && openMenu !== null && (
        <div
          className="absolute top-full left-0 right-0 z-50 border-b bg-background shadow-lg"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="container">
            {megaContent}
          </div>
        </div>
      )}

      {/* ── 모바일 슬라이드 패널 ─────────────────────────────── */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background max-h-[80vh] overflow-y-auto">
          {NAV_MENU.map((item, idx) => (
            <div key={idx} className="border-b last:border-b-0">
              <button
                className="flex items-center justify-between w-full px-4 py-3 text-sm font-medium text-left hover:bg-accent/50 transition-colors"
                onClick={() => setOpenAccordion(openAccordion === idx ? null : idx)}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openAccordion === idx ? "rotate-180" : ""}`} />
              </button>

              {openAccordion === idx && (
                <div className="bg-muted/30 pb-1">
                  {item.children.map((child, cidx) => {
                    const subItems = child.groupKey ? getGroupItems(child.groupKey) : [];
                    return (
                      <div key={cidx}>
                        <Link href={child.href}>
                          <a className="block px-6 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                            {child.label}
                          </a>
                        </Link>
                        {subItems.map((group: any) => (
                          <Link key={group.id} href={`${child.href}/${group.slug ?? group.id}`}>
                            <a className="flex items-center gap-2 pl-10 pr-4 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
                              <span className="w-1 h-1 rounded-full bg-current shrink-0 opacity-60" />
                              {group.name}
                            </a>
                          </Link>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}
