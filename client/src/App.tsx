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
import AdminPopups from "./pages/admin/Popups";
import AdminVideoCategories from "./pages/admin/VideoCategories";
import AdminPageGroups from "./pages/admin/PageGroups";
import AdminFormConfig from "./pages/admin/FormConfig";
import AdminFormSubmissions from "./pages/admin/FormSubmissions";
import PublicView from "./pages/PublicView";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AdminLogin from "./pages/AdminLogin";
import Apply from "./pages/Apply";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import ChurchDetail from "./pages/super-admin/ChurchDetail";

// 공개 페이지
import ChurchAbout from "./pages/public/ChurchAbout";
import ChurchWorship from "./pages/public/ChurchWorship";
import ChurchDirections from "./pages/public/ChurchDirections";
import SundaySermons from "./pages/public/SundaySermons";
import MidweekSermons from "./pages/public/MidweekSermons";
import SpecialSermons from "./pages/public/SpecialSermons";
import CommunityDepartments from "./pages/public/CommunityDepartments";
import SmallChurch from "./pages/public/SmallChurch";
import NewMember from "./pages/public/NewMember";
import Ministry from "./pages/public/Ministry";
import NewsAnnouncements from "./pages/public/NewsAnnouncements";
import MinistryBoard from "./pages/public/MinistryBoard";

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
      <Route path={"/admin/popups"}>
        <DashboardLayout><AdminPopups /></DashboardLayout>
      </Route>
      <Route path={"/admin/layout"}>
        <DashboardLayout><AdminLayoutSettings /></DashboardLayout>
      </Route>
      <Route path={"/admin/video-categories"}>
        <DashboardLayout><AdminVideoCategories /></DashboardLayout>
      </Route>
      <Route path={"/admin/page-groups"}>
        <DashboardLayout><AdminPageGroups /></DashboardLayout>
      </Route>
      <Route path={"/admin/form-config"}>
        <DashboardLayout><AdminFormConfig /></DashboardLayout>
      </Route>
      <Route path={"/admin/form-submissions"}>
        <DashboardLayout><AdminFormSubmissions /></DashboardLayout>
      </Route>

      {/* 공개 다중 페이지 — /:churchSlug 앞에 배치 (wouter는 1세그먼트만 매칭) */}
      <Route path={"/church/about"} component={ChurchAbout} />
      <Route path={"/church/worship"} component={ChurchWorship} />
      <Route path={"/church/directions"} component={ChurchDirections} />
      <Route path={"/sermons/sunday"} component={SundaySermons} />
      <Route path={"/sermons/midweek"} component={MidweekSermons} />
      <Route path={"/sermons/special"} component={SpecialSermons} />
      <Route path={"/community/departments/:slug"} component={CommunityDepartments} />
      <Route path={"/community/departments"} component={CommunityDepartments} />
      <Route path={"/community/small-church"} component={SmallChurch} />
      <Route path={"/community/new-member"} component={NewMember} />
      <Route path={"/ministry/god-love/:slug"}>
        {(params) => <Ministry groupKey="god-love" />}
      </Route>
      <Route path={"/ministry/god-love"}>
        {() => <Ministry groupKey="god-love" />}
      </Route>
      <Route path={"/ministry/neighbor-love/:slug"}>
        {(params) => <Ministry groupKey="neighbor-love" />}
      </Route>
      <Route path={"/ministry/neighbor-love"}>
        {() => <Ministry groupKey="neighbor-love" />}
      </Route>
      <Route path={"/news/announcements"} component={NewsAnnouncements} />
      <Route path={"/news/ministry-board"} component={MinistryBoard} />

      {/* 기존 홈·슬러그 공개 페이지 */}
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
