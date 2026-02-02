import React, { useState, useEffect, useMemo } from "react";
import { NavLink } from "react-router-dom";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { type RouteConfig } from "../interface/routes.interface";
// import { filterRoutesByRole } from '../utils/routeUtils';
import { routes } from "../config/routes";
import { usePermissions } from "@/contexts/PermissionContext";
interface SidebarProps {
  isMobile: boolean;
  isSidebarExpanded: boolean;
  setIsSidebarExpanded: (expanded: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isMobile,
  isSidebarExpanded,
  setIsSidebarExpanded,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // const userRoles = [1];
  // const filteredRoutes = filterRoutesByRole(routes.filter(r => r.showInNav), userRoles);

  const { hasModuleAccess } = usePermissions();

  // Filter routes based on permissions (memoized to avoid re-computation on re-render)
  const accessibleRoutes = useMemo(
    () =>
      routes.filter(
        (route) => route.showInNav
        // && (!route.module || hasModuleAccess(route.module))
      ),
    [hasModuleAccess]
  );

  // console.log(accessibleRoutes);
  

  useEffect(() => {
    if (isMobile) {
      setIsExpanded(isSidebarExpanded);
    }
  }, [isMobile, isSidebarExpanded]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMobile && isExpanded) {
        const sidebar = document.getElementById("sidebar");

        if (sidebar && !sidebar.contains(event.target as Node)) {
          setIsExpanded(false);
          setIsSidebarExpanded(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobile, isExpanded, setIsSidebarExpanded]);

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const handleItemClick = (route: RouteConfig, e: React.MouseEvent) => {
    const hasChildren = route.children && route.children.length > 0;

    if (hasChildren) {
      e.preventDefault();
      toggleExpanded(route.id);
    }
  };

  const handleNavLinkClick = () => {
    if (isMobile) {
      setIsExpanded(false);
      setIsSidebarExpanded(false);
    }
  };

  const renderNavItem = (route: RouteConfig, level: number = 0) => {
    const navChildren = route.children?.filter((child) => child.showInNav) ?? [];
    const hasChildren = navChildren.length > 0;
    const isItemExpanded = expandedItems.includes(route.id);

    const isAnyChildActive = (route: RouteConfig): boolean => {
      if (!route.children) return false;
      return route.children.some((child) =>
        location.pathname.startsWith(child.path)
      );
    };

    const isActiveRoute = location.pathname.startsWith(route.path);

    return (
      <div key={route.id} className="relative">
        <div className="flex items-center group">
          {hasChildren ? (
            <button
              onClick={(e) => handleItemClick(route, e)}
              className={cn(
                "flex items-center justify-between align-middle px-3 py-2 rounded-lg transition-all duration-200 flex-1 text-left",
                level > 0 && "ml-6",
                isActiveRoute || isAnyChildActive(route)
                  ? "text-primary-sidebar-foreground bg-sidebar-active"
                  : "text-sidebar-foreground hover:bg-sidebar-hover"
              )}
              style={{
                paddingLeft: level > 0 ? `${level * 1.5 + 0.75}rem` : undefined,
              }}
            >
              <span className="flex items-center">
                <route.icon className="h-5 w-5 flex-shrink-0" />
                <span
                  className={cn(
                    "truncate transition-all duration-200",
                    !isExpanded && !isMobile && "opacity-0 w-0"
                  )}
                >
                  <span className="ps-2">{route.name}</span>
                </span>
              </span>

              {hasChildren && (isExpanded || isMobile) && (
                <span className="p-1 rounded">
                  {isItemExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </span>
              )}
            </button>
          ) : (
            <NavLink
              to={route.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-lg transition-all duration-200 flex-1",
                  isActive
                    ? "text-primary-sidebar-foreground bg-sidebar-active"
                    : "text-sidebar-foreground hover:bg-sidebar-hover",
                  level > 0 && "ml-6"
                )
              }
              style={{
                paddingLeft: level > 0 ? `${level * 0.5 + 0.75}rem` : undefined,
              }}
              onClick={handleNavLinkClick}
            >
              <route.icon className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "truncate transition-all duration-200",
                  !isExpanded && !isMobile && "opacity-0 w-0"
                )}
              >
                <span className="ps-2">{route.name}</span>
              </span>
            </NavLink>
          )}
        </div>

        {hasChildren && (isExpanded || isMobile) && isItemExpanded && (
          <div className="mt-1 space-y-1">
            {navChildren.map((child) => renderNavItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isExpanded && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm z-80 md:hidden"
          style={{ top: "3.5rem" }}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn("relative", isMobile ? "w-0" : "w-14")}>
        <div
          id="sidebar"
          className={cn(
            "bg-sidebar border-r border-sidebar-border transition-all duration-300 overflow-y-auto overflow-x-hidden",
            isMobile
              ? [
                  "fixed left-0 z-90 w-64 transform",
                  "h-[calc(100vh-3.5rem)]",
                  isExpanded ? "translate-x-0" : "-translate-x-full",
                ]
              : [
                  "absolute left-0 top-0 z-50 h-full",
                  isExpanded ? "w-64" : "w-14",
                ]
          )}
          style={{
            top: isMobile ? "3.5rem" : "0",
          }}
          onMouseEnter={() => !isMobile && setIsExpanded(true)}
          onMouseLeave={() => !isMobile && setIsExpanded(false)}
        >
          <nav className="flex-1 p-2 space-y-1">
            {accessibleRoutes.map((route) => renderNavItem(route))}
          </nav>
        </div>
      </div>
    </>
  );
};
