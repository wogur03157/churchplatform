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
import AdminSiteSettings from "./pages/admin/SiteSettings";
import AdminContentCategories from "./pages/admin/ContentCategories";
import AdminContentPages from "./pages/admin/ContentPages";
import PublicView from "./pages/PublicView";
import AnnouncementDetail from "./pages/AnnouncementDetail";
import AdminLogin from "./pages/AdminLogin";
import Apply from "./pages/Apply";
import SuperAdminDashboard from "./pages/super-admin/SuperAdminDashboard";
import ChurchDetail from "./pages/super-admin/ChurchDetail";
import AdminInvite from "./pages/AdminInvite";
import DynamicContentPage from "./pages/public/DynamicContentPage";
import SundaySermons from "./pages/public/SundaySermons";
import MidweekSermons from "./pages/public/MidweekSermons";
import SpecialSermons from "./pages/public/SpecialSermons";
import NewMember from "./pages/public/NewMember";
import NewsAnnouncements from "./pages/public/NewsAnnouncements";
import MinistryBoard from "./pages/public/MinistryBoard";

function Router() {
  return (
    <Switch>
      <Route path="/super-admin/churches/:id" component={ChurchDetail} />
      <Route path="/super-admin" component={SuperAdminDashboard} />

      <Route path="/apply" component={Apply} />

      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/invite" component={AdminInvite} />
      <Route path="/admin/announcements">
        <DashboardLayout><AdminAnnouncements /></DashboardLayout>
      </Route>
      <Route path="/admin/images">
        <DashboardLayout><AdminImages /></DashboardLayout>
      </Route>
      <Route path="/admin/videos">
        <DashboardLayout><AdminVideos /></DashboardLayout>
      </Route>
      <Route path="/admin/floating-messages">
        <DashboardLayout><AdminFloatingMessages /></DashboardLayout>
      </Route>
      <Route path="/admin/popups">
        <DashboardLayout><AdminPopups /></DashboardLayout>
      </Route>
      <Route path="/admin/layout">
        <DashboardLayout><AdminLayoutSettings /></DashboardLayout>
      </Route>
      <Route path="/admin/video-categories">
        <DashboardLayout><AdminVideoCategories /></DashboardLayout>
      </Route>
      <Route path="/admin/page-groups">
        <DashboardLayout><AdminPageGroups /></DashboardLayout>
      </Route>
      <Route path="/admin/form-config">
        <DashboardLayout><AdminFormConfig /></DashboardLayout>
      </Route>
      <Route path="/admin/form-submissions">
        <DashboardLayout><AdminFormSubmissions /></DashboardLayout>
      </Route>
      <Route path="/admin/site-settings">
        <DashboardLayout><AdminSiteSettings /></DashboardLayout>
      </Route>
      <Route path="/admin/content-categories">
        <DashboardLayout><AdminContentCategories /></DashboardLayout>
      </Route>
      <Route path="/admin/content-pages">
        <DashboardLayout><AdminContentPages /></DashboardLayout>
      </Route>
      <Route path="/admin">
        <DashboardLayout><Home /></DashboardLayout>
      </Route>

      <Route path="/church/:slug1/:slug2/:slug3" component={DynamicContentPage} />
      <Route path="/church/:slug1/:slug2" component={DynamicContentPage} />
      <Route path="/church/:slug1" component={DynamicContentPage} />
      <Route path="/sermons/sunday" component={SundaySermons} />
      <Route path="/sermons/midweek" component={MidweekSermons} />
      <Route path="/sermons/special" component={SpecialSermons} />
      <Route path="/community/new-member" component={NewMember} />
      <Route path="/community/:slug1/:slug2/:slug3">
        {() => <DynamicContentPage rootSlug="community" />}
      </Route>
      <Route path="/community/:slug1/:slug2">
        {() => <DynamicContentPage rootSlug="community" />}
      </Route>
      <Route path="/community/:slug1">
        {() => <DynamicContentPage rootSlug="community" />}
      </Route>
      <Route path="/ministry/:slug1/:slug2/:slug3">
        {() => <DynamicContentPage rootSlug="ministry" />}
      </Route>
      <Route path="/ministry/:slug1/:slug2">
        {() => <DynamicContentPage rootSlug="ministry" />}
      </Route>
      <Route path="/ministry/:slug1">
        {() => <DynamicContentPage rootSlug="ministry" />}
      </Route>
      <Route path="/news/announcements" component={NewsAnnouncements} />
      <Route path="/news/ministry-board" component={MinistryBoard} />

      <Route path="/" component={PublicView} />
      <Route path="/:churchSlug" component={PublicView} />
      <Route path="/:churchSlug/announcements/:id" component={AnnouncementDetail} />
      <Route path="/announcements/:id" component={AnnouncementDetail} />

      <Route path="/404" component={NotFound} />
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
