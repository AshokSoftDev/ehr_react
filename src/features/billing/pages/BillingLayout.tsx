import { useEffect } from "react";
import { Outlet, useLocation, useNavigate, NavLink } from "react-router-dom";
import { FileText, Receipt } from "lucide-react";

export function BillingLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const base = "/main/billing";
    if (location.pathname === base || location.pathname === `${base}/`) {
      navigate(`${base}/invoice`, { replace: true });
    }
  }, [location.pathname, navigate]);

  const tabs = [
    { to: "/main/billing/invoice", label: "Invoice", icon: FileText },
    { to: "/main/billing/receipt", label: "Receipt", icon: Receipt },
  ] as const;

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="shrink-0 mb-4">
          <h1 className="text-xl font-semibold text-foreground">Billing</h1>
          <p className="text-sm text-muted-foreground">
            Manage invoices and receipts
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="shrink-0 border-b border-border mb-4">
          <nav className="flex gap-6">
            {tabs.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-2 pb-3 text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-primary"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4 w-4 ${
                        isActive
                          ? "text-primary"
                          : "group-hover:scale-110 transition-transform"
                      }`}
                    />
                    <span>{label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default BillingLayout;
