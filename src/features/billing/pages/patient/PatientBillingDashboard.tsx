import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { patientService } from "@/features/patients/services/patient.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, User, Wallet, FileText, CreditCard, Receipt as ReceiptIcon } from "lucide-react";
import { useAdvanceBalance } from "../../hooks/useBilling";
import { PageSkeleton } from "@/layouts/PageSkeleton";

import InvoiceTab from "./tabs/InvoiceTab";
import PaymentTab from "./tabs/PaymentTab";
import LedgerTab from "./tabs/LedgerTab";

const tabs = [
  { id: "invoice", label: "Invoice", icon: FileText },
  { id: "payment", label: "Payment", icon: CreditCard },
  { id: "ledger", label: "Ledger", icon: ReceiptIcon },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function PatientBillingDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = (searchParams.get("tab") as TabId) || "invoice";

  const patientId = Number(id);

  // Fetch Patient Details
  const { data: patient, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: !!patientId,
  });

  // Fetch Advance Balance
  const { data: advanceData } = useAdvanceBalance(patientId);
  const advanceBalance = advanceData?.balance || 0;

  const handleTabChange = (tabId: TabId) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  if (patientLoading) return <PageSkeleton />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate("/main/billing")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing - {patient?.firstName} {patient?.lastName}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <User className="h-3 w-3" />
              <span>MRN: {patient?.mrn}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-md border border-green-200">
            <Wallet className="h-4 w-4" />
            <div className="text-xs font-semibold">
              <span className="block opacity-80 uppercase text-[10px] tracking-wider">Available Advance</span>
              ₹{advanceBalance.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
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

        <CardContent className="p-4 sm:p-6">
          {currentTab === "invoice" && <InvoiceTab patientId={patientId} />}
          {currentTab === "payment" && <PaymentTab patientId={patientId} advanceBalance={advanceBalance} />}
          {currentTab === "ledger" && <LedgerTab patientId={patientId} />}
        </CardContent>
      </Card>
    </div>
  );
}
