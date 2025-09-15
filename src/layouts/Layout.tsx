import { Outlet, useNavigate } from 'react-router-dom';
import { Suspense, useEffect, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Toolbar } from './Toolbar';
import {PageSkeleton} from './PageSkeleton';
import { Card } from '@/components/ui/card';
// import { useAuth } from '@/hooks/authHook';

const Layout = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(!isMobile);
  // const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    // logout();
    navigate('/login');
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
    </div>
  );
};

export default Layout;
