import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import DashboardLayout from "./components/DashboardLayout";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminImages from "./pages/admin/Images";
import AdminVideos from "./pages/admin/Videos";
import AdminFloatingMessages from "./pages/admin/FloatingMessages";
import AdminLayoutSettings from "./pages/admin/LayoutSettings";
import PublicView from "./pages/PublicView";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AdminLogin from "./pages/AdminLogin";
import Apply from "./pages/Apply";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import ChurchDetail from "./pages/super-admin/ChurchDetail";

function Router() {
  return (
    <Switch>
      {/* 최고관리자 */}
      <Route path={"/super-admin"} component={SuperAdminDashboard} />
      <Route path={"/super-admin/churches/:id"} component={ChurchDetail} />

      {/* 교회 신청 */}
      <Route path={"/apply"} component={Apply} />

      {/* 관리자 */}
      <Route path={"/admin/login"} component={AdminLogin} />
      <Route path={"/admin"}>
        <DashboardLayout><Home /></DashboardLayout>
      </Route>
      <Route path={"/admin/announcements"}>
        <DashboardLayout><AdminAnnouncements /></DashboardLayout>
      </Route>
      <Route path={"/admin/images"}>
        <DashboardLayout><AdminImages /></DashboardLayout>
      </Route>
      <Route path={"/admin/videos"}>
        <DashboardLayout><AdminVideos /></DashboardLayout>
      </Route>
      <Route path={"/admin/floating-messages"}>
        <DashboardLayout><AdminFloatingMessages /></DashboardLayout>
      </Route>
      <Route path={"/admin/layout"}>
        <DashboardLayout><AdminLayoutSettings /></DashboardLayout>
      </Route>

      {/* 공개 페이지 — 특정 경로 뒤에 배치해야 충돌 없음 */}
      <Route path={"/"} component={PublicView} />
      <Route path={"/:churchSlug"} component={PublicView} />
      <Route path={"/:churchSlug/announcements/:id"} component={AnnouncementDetail} />
      <Route path={"/announcements/:id"} component={AnnouncementDetail} />

      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
