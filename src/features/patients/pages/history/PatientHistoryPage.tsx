import { Card, CardContent } from "@/components/ui/card";
import { useParams, useSearchParams } from "react-router-dom";
import HistoryAllergyTab from "./components/HistoryAllergyTab";
import HistoryPMHTab from "./components/HistoryPMHTab";
import HistoryFamilyTab from "./components/HistoryFamilyTab";
import HistorySocialTab from "./components/HistorySocialTab";
import HistorySurgeryTab from "./components/HistorySurgeryTab";
import {
  ShieldAlert,
  Activity,
  Users,
  Coffee,
  Scissors
} from "lucide-react";

const tabs = [
  { id: "allergy", label: "Allergy", icon: ShieldAlert },
  { id: "pmh", label: "PMH", icon: Activity },
  { id: "family", label: "Family", icon: Users },
  { id: "social", label: "Social", icon: Coffee },
  { id: "surgery", label: "Surgery", icon: Scissors },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function PatientHistoryPage() {
  const { id } = useParams();
  const patientId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabId) || "allergy";

  const handleTabChange = (tabId: TabId) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  return (
    <Card className="border-border shadow-sm overflow-hidden pb-0">
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

      <CardContent className="p-0">
        {currentTab === "allergy" && <HistoryAllergyTab patientId={patientId} />}
        {currentTab === "pmh" && <HistoryPMHTab patientId={patientId} />}
        {currentTab === "family" && <HistoryFamilyTab patientId={patientId} />}
        {currentTab === "social" && <HistorySocialTab patientId={patientId} />}
        {currentTab === "surgery" && <HistorySurgeryTab patientId={patientId} />}
      </CardContent>
    </Card>
  );
}

export default PatientHistoryPage;
