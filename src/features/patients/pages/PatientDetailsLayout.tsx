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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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

  // Redirect base path to dashboard, but keep other sections intact.
  useEffect(() => {
    const base = `/main/patients/${patientId}`;
    if (location.pathname === base) {
      navigate(`${base}/dashboard`, { replace: true });
    }
  }, [location.pathname, navigate, patientId]);

  const items = [
    {
      to: `/main/patients/${patientId}/dashboard`,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      to: `/main/patients/${patientId}/visit`,
      label: "Visit",
      icon: CalendarDays,
    },
    {
      to: `/main/patients/${patientId}/history`,
      label: "History",
      icon: History,
    },
    {
      to: `/main/patients/${patientId}/vitals`,
      label: "Vitals",
      icon: HeartPulse,
    },
    {
      to: `/main/patients/${patientId}/document`,
      label: "Document",
      icon: FileText,
    },
    {
      to: `/main/patients/${patientId}/prescription`,
      label: "Prescription",
      icon: Stethoscope,
    },
    {
      to: `/main/patients/${patientId}/notes`,
      label: "Clinical Notes",
      icon: NotebookPen,
    },
    {
      to: `/main/patients/${patientId}/consent`,
      label: "Consent",
      icon: ShieldCheck,
    },
  ] as const;

  return (
    <div className=" max-h-full w-full">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <aside className="rounded-lg border border-border bg-card p-4 shadow-sm md:col-span-3 lg:col-span-2">
          {/* Back button inside sidebar */}
          <div className="mb-3">
            <button
              type="button"
              onClick={() => navigate("/main/patients")}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Patients
            </button>
          </div>
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-[140px] sm:w-[160px] rounded-md mx-auto">
              <AvatarFallback className="bg-primary text-primary-foreground rounded-md">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-foreground">
                {patient
                  ? `${patient.firstName} ${patient.lastName}`
                  : "Patient"}
              </h3>
              {patient?.mrn && (
                <p className="text-xs text-muted-foreground">{patient.mrn}</p>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-1">
            {items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="md:col-span-9 lg:col-span-10 space-y-4">
          {/* Fixed snapshot cards across all patient subpages */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Drug Allergy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-xl font-semibold">
                  None Reported
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">
                  Balance Due
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-xl font-semibold">$0.00</p>
              </CardContent>
            </Card>
          </div>

          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default PatientDetailsLayout;
