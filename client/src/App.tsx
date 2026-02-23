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

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path={"/"} component={PublicView} />
      <Route path={"/announcements/:id"} component={AnnouncementDetail} />
      <Route path={"/admin/login"} component={AdminLogin} />
      
      {/* Admin routes */}
      <Route path={"/admin"}>
        <DashboardLayout>
          <Home />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/announcements"}>
        <DashboardLayout>
          <AdminAnnouncements />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/images"}>
        <DashboardLayout>
          <AdminImages />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/videos"}>
        <DashboardLayout>
          <AdminVideos />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/floating-messages"}>
        <DashboardLayout>
          <AdminFloatingMessages />
        </DashboardLayout>
      </Route>
      <Route path={"/admin/layout"}>
        <DashboardLayout>
          <AdminLayoutSettings />
        </DashboardLayout>
      </Route>
      
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
