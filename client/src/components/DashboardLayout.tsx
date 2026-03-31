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
  Layers,
  LayoutDashboard,
  Lock,
  LogOut,
  MessageSquare,
  PanelLeft,
  Settings,
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

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

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
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({ children, setSidebarWidth }: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  type NavState = "visible" | "locked" | "hidden";
  const getNavState = (permKey: string | null): NavState => {
    if (!permKey || user?.role === "super_admin") return "visible";

    const enabledFeatures = Array.isArray(user?.enabledFeatures) ? (user.enabledFeatures as string[]) : null;
    const permissions = Array.isArray(user?.permissions) ? (user.permissions as string[]) : null;

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

          <SidebarFooter className="p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-9 w-9 border shrink-0">
                    <AvatarFallback className="text-xs font-medium">
                      {user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <p className="truncate text-sm font-medium leading-none">{user?.name || "-"}</p>
                    <p className="mt-1.5 truncate text-xs text-muted-foreground">{user?.email || "-"}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/20 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (!isCollapsed) setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background/95 px-2 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="h-9 w-9 rounded-lg bg-background" />
              <span className="tracking-tight text-foreground">{activeMenuItem?.label ?? "Menu"}</span>
            </div>
          </div>
        )}
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </>
  );
}
