import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useIsMobile } from "@/hooks/useMobile";
import {
  ClipboardList,
  FileText,
  FormInput,
  Globe,
  Image as ImageIcon,
  CalendarCheck,
  FolderTree,
  HandCoins,
  HeartHandshake,
  Landmark,
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  PanelLeft,
  ReceiptText,
  Settings,
  Sprout,
  Tag,
  Users,
  Video,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";
import { Button } from "./ui/button";

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "대시보드", path: "/admin", permKey: null },
  { icon: Users, label: "교인 관리", path: "/admin/members", permKey: "members" },
  { icon: FolderTree, label: "조직 관리", path: "/admin/members/groups", permKey: "members" },
  { icon: CalendarCheck, label: "출석 체크", path: "/admin/members/attendance", permKey: "members" },
  { icon: Sprout, label: "새가족 정착", path: "/admin/members/newcomers", permKey: "members" },
  { icon: HeartHandshake, label: "심방 관리", path: "/admin/members/visitations", permKey: "members" },
  { icon: HandCoins, label: "헌금 계수", path: "/admin/finance/offerings", permKey: "finance" },
  { icon: ClipboardList, label: "지출결의", path: "/admin/finance/expenses", permKey: "finance" },
  { icon: ReceiptText, label: "재정 장부", path: "/admin/finance/ledger", permKey: "finance" },
  { icon: Landmark, label: "재정 설정", path: "/admin/finance/settings", permKey: "finance" },
  { icon: FileText, label: "공지사항", path: "/admin/announcements", permKey: "announcements" },
  { icon: ImageIcon, label: "이미지", path: "/admin/images", permKey: "images" },
  { icon: Video, label: "영상", path: "/admin/videos", permKey: "videos" },
  { icon: Tag, label: "미디어 카테고리", path: "/admin/video-categories", permKey: "video_categories" },
  { icon: MessageSquare, label: "플로팅 메시지", path: "/admin/floating-messages", permKey: "floating_messages" },
  { icon: Layers, label: "팝업", path: "/admin/popups", permKey: "popups" },
  { icon: Settings, label: "레이아웃 설정", path: "/admin/layout", permKey: "layout_settings" },
  { icon: Users, label: "그룹 관리", path: "/admin/page-groups", permKey: "page_groups" },
  { icon: FormInput, label: "폼 설정", path: "/admin/form-config", permKey: "form_config" },
  { icon: ClipboardList, label: "신청 내역", path: "/admin/form-submissions", permKey: "form_submissions" },
  { icon: FileText, label: "페이지 카테고리", path: "/admin/content-categories", permKey: null },
  { icon: FileText, label: "페이지 내용", path: "/admin/content-pages", permKey: null },
  { icon: Globe, label: "사이트 설정", path: "/admin/site-settings", permKey: "layout_settings" },
] as const;

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

type DashboardUser = {
  id: number;
  name?: string | null;
  email?: string | null;
  role?: string;
  enabledFeatures?: string[];
  permissions?: string[];
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user, logout } = useAuth();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex w-full max-w-md flex-col items-center gap-8 p-8">
          <div className="space-y-3 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in to continue</h1>
            <p className="text-sm text-muted-foreground">
              Access to this dashboard requires authentication.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = "/admin/login";
            }}
            size="lg"
            className="w-full"
          >
            Sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <DashboardLayoutContent user={user as DashboardUser} logout={logout} setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  user: DashboardUser;
  logout: () => Promise<void>;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({ children, user, logout, setSidebarWidth }: DashboardLayoutContentProps) {
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  type NavState = "visible" | "locked" | "hidden";
  const getNavState = (permKey: string | null): NavState => {
    if (!permKey || user?.role === "super_admin") return "visible";

    const enabledFeatures = Array.isArray(user?.enabledFeatures) ? user.enabledFeatures : null;
    const permissions = Array.isArray(user?.permissions) ? user.permissions : null;

    if (enabledFeatures === null && permissions === null) {
      return "visible";
    }

    const featureOn = !enabledFeatures || enabledFeatures.includes(permKey);
    if (!featureOn) return "locked";

    if (!permissions) {
      return "visible";
    }

    return permissions.includes(permKey) ? "visible" : "hidden";
  };

  const navItems = NAV_ITEMS.map((item) => ({ ...item, state: getNavState(item.permKey) })).filter(
    (item) => item.state !== "hidden"
  );

  const activeMenuItem = navItems.find((item) => item.path === location);

  useEffect(() => {
    if (isCollapsed) setIsResizing(false);
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = event.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0" disableTransition={isResizing}>
          <SidebarHeader className="h-16 justify-center">
            <div className="flex w-full items-center gap-3 px-2 transition-all">
              <button
                onClick={toggleSidebar}
                className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed && <span className="truncate font-semibold tracking-tight">Navigation</span>}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0">
            <SidebarMenu className="px-2 py-1">
              {navItems.map((item) => {
                const isActive = location === item.path;
                const isLocked = item.state === "locked";
                const button = (
                  <SidebarMenuButton
                    isActive={isActive}
                    onClick={() => !isLocked && setLocation(item.path)}
                    tooltip={isLocked ? "잠긴 기능" : item.label}
                    className={`h-10 font-normal transition-all ${isLocked ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    {isLocked ? <Lock className="h-4 w-4" /> : <item.icon className={`h-4 w-4 ${isActive ? "text-primary" : ""}`} />}
                    <span>{item.label}</span>
                    {isLocked && !isCollapsed && (
                      <span className="ml-auto text-[10px] font-medium text-muted-foreground/60">잠김</span>
                    )}
                  </SidebarMenuButton>
                );

                return (
                  <SidebarMenuItem key={item.path}>
                    {isLocked ? (
                      <Tooltip>
                        <TooltipTrigger asChild>{button}</TooltipTrigger>
                        <TooltipContent side="right">현재 교회에서 비활성화된 기능입니다.</TooltipContent>
                      </Tooltip>
                    ) : (
                      button
                    )}
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="mt-auto border-t border-sidebar-border/70 p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-sidebar-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-primary/10 text-primary">
                      {user?.name?.slice(0, 1) || user?.email?.slice(0, 1) || "A"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium leading-none">{user?.name || "Admin"}</p>
                      <p className="truncate text-xs text-muted-foreground mt-1">{user?.email || "admin@church.local"}</p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        {!isCollapsed && !isMobile && (
          <button
            type="button"
            aria-label="Resize sidebar"
            className="absolute inset-y-0 right-0 hidden w-1 cursor-col-resize bg-transparent transition hover:bg-border/70 lg:block"
            onMouseDown={() => setIsResizing(true)}
          />
        )}
      </div>

      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-md lg:px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-muted-foreground">
              {activeMenuItem?.label ?? "Dashboard"}
            </p>
          </div>
        </header>
        <main className="min-h-[calc(100vh-4rem)] bg-muted/20 p-4 lg:p-6">{children}</main>
      </SidebarInset>
    </>
  );
}
