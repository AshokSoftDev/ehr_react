import { useEffect, useMemo, useState } from "react";
import { format, differenceInYears } from "date-fns";
import {
  Outlet,
  useLocation,
  useNavigate,
  useParams,
  NavLink,
} from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { patientService } from "../services/patient.service";
import type { Patient } from "../types/patient.types";
import {
  ArrowLeft,
  FileText,
  HeartPulse,
  History,
  LayoutDashboard,
  NotebookPen,
  ShieldCheck,
  Stethoscope,
  CalendarDays,
  Wallet,
  ShieldAlert,
  Loader2,
  Receipt,
  ExternalLink,
} from "lucide-react";
import { usePatientAllergies } from "@/features/patients/hooks/usePatientAllergies";
import { useAdvanceBalance, usePatientPendingInvoices } from "@/features/billing/hooks/useBilling";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function PatientDetailsLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = Number(id);

  const [viewAllergiesOpen, setViewAllergiesOpen] = useState(false);

  const { data: patient } = useQuery<Patient>({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  // Dynamic Clinical & Financial Data Hooks
  const { data: allergies, isLoading: allergiesLoading } = usePatientAllergies(patientId);
  const { data: advanceData, isLoading: advanceLoading } = useAdvanceBalance(patientId);
  const { data: pendingInvoices, isLoading: pendingLoading } = usePatientPendingInvoices(patientId);

  const activeDrugAllergies = useMemo(() => {
    return (allergies ?? []).filter(
      (a) =>
        a.status === 1 &&
        (!a.allergy ||
          a.allergy.allergyType?.toLowerCase() === "drug" ||
          a.allergyName?.toLowerCase().includes("drug"))
    );
  }, [allergies]);

  const advanceBalance = advanceData?.balance ?? 0;

  const pendingTotal = useMemo(() => {
    return (pendingInvoices ?? []).reduce(
      (acc, inv) => acc + (Number(inv.balance_amount) || 0),
      0
    );
  }, [pendingInvoices]);

  const allergyDisplayText = useMemo(() => {
    if (activeDrugAllergies.length === 0) return "No Drug Allergies";
    const names = activeDrugAllergies.map((a) => a.allergyName);
    if (names.length <= 5) {
      return `Drug Allergies: ${names.join(", ")}`;
    }
    return `Drug Allergies: ${names.slice(0, 5).join(", ")} +${names.length - 5} more...`;
  }, [activeDrugAllergies]);

  const initials = useMemo(() => {
    const f = patient?.firstName?.[0] ?? "P";
    const l = patient?.lastName?.[0] ?? "";
    return `${f}${l}`.toUpperCase();
  }, [patient]);

  useEffect(() => {
    const base = `/main/patients/${patientId}`;
    if (location.pathname === base) {
      navigate(`${base}/dashboard`, { replace: true });
    }
  }, [location.pathname, navigate, patientId]);

  const items = [
    { to: `/main/patients/${patientId}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { to: `/main/patients/${patientId}/visit`, label: "Visit", icon: CalendarDays },
    { to: `/main/patients/${patientId}/history`, label: "History", icon: History },
    { to: `/main/patients/${patientId}/vitals`, label: "Vitals", icon: HeartPulse },
    { to: `/main/patients/${patientId}/document`, label: "Document", icon: FileText },
    { to: `/main/patients/${patientId}/prescription`, label: "Prescription", icon: Stethoscope },
    { to: `/main/patients/${patientId}/notes`, label: "Clinical Notes", icon: NotebookPen },
  ] as const;

  return (
    <div className="w-full h-[calc(100vh-4rem)] overflow-hidden">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-12 h-full">
        {/* Sidebar - Fixed with internal scroll */}
        <aside className="rounded-lg border border-border bg-card p-3 shadow-sm md:col-span-3 lg:col-span-2 flex flex-col overflow-hidden">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/main/patients")}
            className="mb-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Patients
          </button>

          {/* Patient Avatar & Info */}
          <div className="flex flex-col items-center text-center pb-3 shrink-0">
            <Avatar className="h-16 w-16 rounded-lg">
              <AvatarFallback className="bg-primary text-primary-foreground rounded-lg text-lg font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-2 text-sm font-semibold text-foreground leading-tight">
              {patient ? `${patient.firstName} ${patient.lastName}` : "Patient"}
            </h3>
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-1.5">
              {patient?.mrn && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {patient.mrn}
                </Badge>
              )}
              {patient?.gender && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  {patient.gender}
                </Badge>
              )}
              {patient?.dateOfBirth && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  {format(new Date(patient.dateOfBirth), 'dd/MM/yyyy')}
                </Badge>
              )}
              {(patient?.age !== undefined || patient?.dateOfBirth) && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                  {patient.age !== undefined
                    ? `${patient.age} yrs`
                    : `${differenceInYears(new Date(), new Date(patient.dateOfBirth as string))} yrs`}
                </Badge>
              )}
            </div>
          </div>

          {/* Navigation - Scrollable if needed */}
          <nav className="space-y-0.5 border-t border-border pt-3 flex-1 overflow-y-auto">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-150 ${isActive
                    ? "text-primary bg-primary/5"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-primary rounded-r-full" />
                    )}
                    <Icon
                      className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"
                        }`}
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="md:col-span-9 lg:col-span-10 flex flex-col overflow-hidden">
          {/* Dynamic Compact Status Bar - Fixed */}
          <div className="flex flex-wrap items-center gap-2.5 p-2.5 rounded-lg border border-border bg-card shrink-0 mb-3 shadow-2xs">
            {/* Drug Allergies Section */}
            {allergiesLoading ? (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted text-muted-foreground text-xs font-medium">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Checking allergies...</span>
              </div>
            ) : activeDrugAllergies.length > 0 ? (
              <button
                type="button"
                onClick={() => setViewAllergiesOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-500/20 text-xs font-semibold transition-colors shadow-2xs group cursor-pointer"
                title="Click to view complete allergy details"
              >
                <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400 shrink-0 animate-pulse" />
                <span>{allergyDisplayText}</span>
                <ExternalLink className="h-3 w-3 opacity-60 group-hover:opacity-100 transition-opacity ml-0.5" />
              </button>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-medium border border-emerald-500/20">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>No Drug Allergies</span>
              </div>
            )}

            {/* Financial Status Group */}
            <div className="flex flex-wrap items-center gap-2.5 ml-auto">
              {/* Advance Balance */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs font-medium shadow-2xs">
                <Wallet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                {advanceLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-emerald-600" />
                ) : (
                  <span>
                    Advance:{" "}
                    <span className="font-bold text-emerald-700 dark:text-emerald-300">
                      ₹{advanceBalance.toFixed(2)}
                    </span>
                  </span>
                )}
              </div>

              {/* Pending Invoices Total */}
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium border shadow-2xs ${pendingTotal > 0
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-900 dark:text-amber-300"
                    : "bg-muted border-border/60 text-muted-foreground"
                  }`}
              >
                <Receipt
                  className={`h-3.5 w-3.5 shrink-0 ${pendingTotal > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
                    }`}
                />
                {pendingLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span>
                    Pending Dues:{" "}
                    <span
                      className={`font-bold ${pendingTotal > 0
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-foreground"
                        }`}
                    >
                      ₹{pendingTotal.toFixed(2)}
                    </span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-1">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Active Drug Allergies Modal Dialog */}
      <Dialog open={viewAllergiesOpen} onOpenChange={setViewAllergiesOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden flex flex-col max-h-[85vh]">
          <DialogHeader className="px-5 py-4 border-b bg-red-50/50 dark:bg-red-950/20 shrink-0">
            <DialogTitle className="flex items-center gap-2.5 text-red-700 dark:text-red-400 text-base font-bold">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
              Patient Drug Allergies & Reactions
            </DialogTitle>
          </DialogHeader>

          <div className="p-5 overflow-y-auto space-y-3 flex-1">
            <p className="text-xs text-muted-foreground mb-2">
              The following active drug allergies are recorded for this patient. Please exercise caution during prescribing and clinical administration.
            </p>
            <div className="divide-y divide-border border rounded-xl bg-card overflow-hidden shadow-2xs">
              {activeDrugAllergies.map((allergy) => (
                <div
                  key={allergy.id}
                  className="p-3.5 flex flex-col gap-2 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-foreground">
                        {allergy.allergyName}
                      </span>
                      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-none text-[10px] h-5 px-1.5 rounded-sm">
                        Active Alert
                      </Badge>
                      {allergy.allergy?.allergyType && (
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 px-1.5 rounded-sm text-muted-foreground"
                        >
                          {allergy.allergy.allergyType}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {allergy.notes ? (
                    <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg p-2.5 border border-border/50">
                      <span className="font-semibold text-foreground">Clinical Note:</span>{" "}
                      {allergy.notes}
                    </div>
                  ) : (
                    <span className="text-[11px] text-muted-foreground italic">
                      No additional reaction notes recorded.
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PatientDetailsLayout;
