import { useEffect, useMemo } from "react";
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
  AlertTriangle,
  Wallet,
} from "lucide-react";

export function PatientDetailsLayout() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const patientId = Number(id);

  const { data: patient } = useQuery<Patient>({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

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
    { to: `/main/patients/${patientId}/consent`, label: "Consent", icon: ShieldCheck },
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
            {patient?.mrn && (
              <Badge variant="secondary" className="mt-1 text-[10px] px-1.5 py-0">
                {patient.mrn}
              </Badge>
            )}
          </div>

          {/* Navigation - Scrollable if needed */}
          <nav className="space-y-0.5 border-t border-border pt-3 flex-1 overflow-y-auto">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium transition-all duration-150 ${
                    isActive
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
                    <Icon className={`h-3.5 w-3.5 ${isActive ? "text-primary" : "group-hover:scale-110 transition-transform"}`} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content - Scrollable */}
        <main className="md:col-span-9 lg:col-span-10 flex flex-col overflow-hidden">
          {/* Compact Status Bar - Fixed */}
          <div className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card shrink-0 mb-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-500/10 text-emerald-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="text-xs font-medium">No Drug Allergies</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted">
              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Balance: <span className="text-foreground">$0.00</span></span>
            </div>
          </div>

          {/* Content Area - Scrollable */}
          <div className="flex-1 overflow-y-auto pr-1">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default PatientDetailsLayout;
