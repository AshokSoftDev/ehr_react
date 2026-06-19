import { Card, CardContent } from "@/components/ui/card";
import { useParams, useSearchParams } from "react-router-dom";
import PatientInfoTab from "./components/PatientInfoTab";
import PatientEmergencyTab from "./components/PatientEmergencyTab";
import PatientAppointmentTab from "./components/PatientAppointmentTab";
import PatientBillingTab from "./components/PatientBillingTab";
import {
  User,
  Phone,
  Calendar,
  CreditCard,
  // Shield,
  // Briefcase,
} from "lucide-react";

const tabs = [
  { id: "info", label: "Patient Info", icon: User },
  { id: "emergency", label: "Emergency", icon: Phone },
  { id: "appointment", label: "Appointment", icon: Calendar },
  { id: "billing", label: "Billing", icon: CreditCard },
  // { id: "insurances", label: "Insurances", icon: Shield },
  // { id: "occupation", label: "Occupation", icon: Briefcase },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function PatientDashboard() {
  const { id } = useParams();
  const patientId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabId) || "info";

  const handleTabChange = (tabId: TabId) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden">
      {/* Compact Tabs */}
      <div className="px-1 border-b border-border">
        <nav
          className="flex items-center overflow-x-auto"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {tabs.map(({ id, label, icon: Icon }) => {
            const isActive = currentTab === id;
            return (
              <button
                key={id}
                onClick={() => handleTabChange(id)}
                className={`
                  group relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-all duration-150 whitespace-nowrap
                  ${isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }
                `}
              >
                <Icon className={`h-3.5 w-3.5 ${!isActive && "group-hover:scale-110 transition-transform"}`} />
                <span>{label}</span>
                {isActive && (
                  <span className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-primary rounded-t-full" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <CardContent className="p-4">
        {currentTab === "info" && <PatientInfoTab patientId={patientId} />}
        {currentTab === "emergency" && <PatientEmergencyTab patientId={patientId} />}
        {currentTab === "appointment" && <PatientAppointmentTab patientId={patientId} />}
        {currentTab === "billing" && <PatientBillingTab patientId={patientId} />}

        {["insurances", "occupation"].includes(currentTab) && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
              {(() => {
                const tab = tabs.find(t => t.id === currentTab);
                const TabIcon = tab?.icon || User;
                return <TabIcon className="h-4 w-4" />;
              })()}
            </div>
            <p className="text-sm font-medium capitalize">{currentTab}</p>
            <p className="text-xs text-muted-foreground mt-0.5">No data available.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default PatientDashboard;
