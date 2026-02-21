import { Outlet, useNavigate } from "react-router-dom";
import { Suspense, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Toolbar } from "./Toolbar";
import { PageSkeleton } from "./PageSkeleton";
import { Card } from "@/components/ui/card";
import { AIChatWidget } from "@/components/ai-chat-widget";

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!isMobile);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarExpanded(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    // Clear all auth data from both storages
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    localStorage.removeItem("refresh_token");
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("refresh_token");
    setIsAIChatOpen(false);
    navigate("/login", { replace: true });
  };

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <div className="h-14 w-full flex-shrink-0 border-b z-10 relative bg-card">
        <Toolbar
          isMobile={isMobile}
          isSidebarExpanded={isSidebarExpanded}
          toggleSidebar={toggleSidebar}
          handleLogout={handleLogout}
          onToggleAIChat={() => setIsAIChatOpen((prev) => !prev)}
          isAIChatOpen={isAIChatOpen}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isMobile={isMobile}
          isSidebarExpanded={isSidebarExpanded}
          setIsSidebarExpanded={setIsSidebarExpanded}
        />
        <div className="flex-1 flex flex-col overflow-hidden bg-background">
          <Card className="flex-1 overflow-auto py-0 p-2 border-none bg-background">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </Card>
        </div>
      </div>

      {/* AI Chat Widget — controlled by toolbar button */}
      <AIChatWidget
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
      />
    </div>
  );
};

export default Layout;
