import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { ContentCategory, ContentPage } from "@shared/entities";
import { ChevronDown, Menu, X } from "lucide-react";

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
};

const DROPDOWN_STYLE: "full" | "nav" = "nav";
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
            .filter((grandChild) => grandChild.status === "active")
            .map((grandChild) => ({
              label: grandChild.name,
              href: `/${root.slug}/${child.slug}/${grandChild.slug}`,
            })),
        })),
    }))
    .filter((item) => item.children.length > 0);
}

export default function PublicHeader({
  preloadedSiteConfigs,
  preloadedCategoryForest,
}: PublicHeaderProps = {}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [openAccordion, setOpenAccordion] = useState<number | null>(null);
  const [location] = useLocation();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const siteConfigs = preloadedSiteConfigs ?? fetchedSiteConfigs ?? [];
  const categoryForest = preloadedCategoryForest ?? fetchedCategoryForest ?? [];

  const cfg = (key: string) =>
    siteConfigs.find((item: any) => item.key === key)?.value ?? "";

  const churchName = cfg("church_name") || "영신교회";
  const logoUrl = cfg("church_logo_url");
  const navMenu = useMemo(() => buildNavigationMenu(categoryForest), [categoryForest]);
  const menuWidthRem = navMenu.length * MENU_COLUMN_WIDTH_REM + 4;
  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenMenu(null), 180);
  };

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
    setOpenAccordion(null);
    cancelClose();
  }, [location]);

  useEffect(() => () => cancelClose(), []);

  const megaContent = (
    <div className="grid gap-8 px-8 py-6" style={{ gridTemplateColumns: `repeat(${navMenu.length}, ${MENU_COLUMN_WIDTH_REM}rem)` }}>
      {navMenu.map((menuItem, menuIndex) => {
        const isActive = openMenu === menuIndex;

        return (
          <div
            key={menuItem.label}
            onMouseEnter={() => {
              cancelClose();
              setOpenMenu(menuIndex);
            }}
          >
            <p className={`mb-3 text-sm font-semibold ${isActive ? "text-primary" : "text-foreground"}`}>
              {menuItem.label}
            </p>
            <div className="space-y-4">
              {menuItem.children.map((child) => (
                <div key={`${menuItem.label}-${child.href}`} className="space-y-2">
                  <Link href={child.href}>
                    <a className="block py-1 text-sm font-medium transition-colors hover:text-primary">
                      {child.label}
                    </a>
                  </Link>
                  {child.children.length > 0 && (
                    <div className="space-y-1 pl-3">
                      {child.children.map((grandChild) => (
                        <Link key={grandChild.href} href={grandChild.href}>
                          <a className="flex items-center gap-1.5 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
                            <span className="h-1 w-1 rounded-full bg-current opacity-60" />
                            {grandChild.label}
                          </a>
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
    <header className="sticky top-0 z-50 relative w-full">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="group flex cursor-pointer items-center gap-2">
              {logoUrl && <img src={logoUrl} alt={churchName} className="h-9 w-9 object-contain" />}
              <div className="flex flex-col">
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-xl font-bold text-transparent">
                  {churchName}
                </span>
                <span className="text-[0.625rem] font-medium tracking-tighter text-muted-foreground transition-colors group-hover:text-primary">
                  하나님 사랑 이웃 사랑
                </span>
              </div>
            </div>
          </Link>

          {DROPDOWN_STYLE === "nav" ? (
            <div className="relative hidden items-center gap-6 lg:gap-8 md:flex" onMouseLeave={scheduleClose}>
              {navMenu.map((item, index) => (
                <button
                  key={item.label}
                  className={`flex items-center justify-center gap-1 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                    openMenu === index
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-accent hover:text-accent-foreground"
                  }`}
                  style={{ minWidth: `${MENU_COLUMN_WIDTH_REM}rem` }}
                  onMouseEnter={() => {
                    cancelClose();
                    setOpenMenu(index);
                  }}
                >
                  {item.label}
                  <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${openMenu === index ? "rotate-180" : ""}`} />
                </button>
              ))}

              {openMenu !== null && (
                <div className="absolute right-0 top-full z-50 animate-in fade-in slide-in-from-top-2 pt-2 duration-200" onMouseEnter={cancelClose}>
                  <div className="max-w-[calc(100vw-3rem)] overflow-hidden rounded-2xl border border-border/50 bg-white/95 shadow-xl backdrop-blur-md" style={{ width: `${menuWidthRem}rem` }}>
                    {megaContent}
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <button
            className="rounded-md p-2 transition-colors hover:bg-accent md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label="메뉴 열기"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t bg-background md:hidden">
          {navMenu.map((item, index) => (
            <div key={item.label} className="border-b last:border-b-0">
              <button
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-accent/50"
                onClick={() => setOpenAccordion(openAccordion === index ? null : index)}
              >
                {item.label}
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openAccordion === index ? "rotate-180" : ""}`} />
              </button>

              {openAccordion === index && (
                <div className="bg-muted/30 pb-1">
                  {item.children.map((child) => (
                    <div key={`${item.label}-${child.href}`} className="border-t border-border/30 px-2 py-1 first:border-t-0">
                      <Link href={child.href}>
                        <a className="block px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                          {child.label}
                        </a>
                      </Link>
                      {child.children.map((grandChild) => (
                        <Link key={grandChild.href} href={grandChild.href}>
                          <a className="block py-1.5 pl-8 pr-4 text-xs text-muted-foreground transition-colors hover:text-foreground">
                            {grandChild.label}
                          </a>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
}



