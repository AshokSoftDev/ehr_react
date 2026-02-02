import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, FileText, HeartPulse, History, LayoutDashboard, NotebookPen, ShieldCheck, Stethoscope } from "lucide-react";
import { patientService } from "../services/patient.service";
import type { Patient } from "../types/patient.types";
import { PatientPrescriptionsPage } from "./prescription/PatientPrescriptionsPage";
import { PatientClinicalNotesPage } from "./notes/PatientClinicalNotesPage";

type Section = "dashboard" | "history" | "vitals" | "document" | "prescription" | "notes" | "consent";

export function PatientDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const patientId = Number(params.id);
  const [section, setSection] = useState<Section>("dashboard");

  const { data: patient } = useQuery<Patient>({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  const initials = useMemo(() => {
    if (!patient) return "P";
    const f = patient.firstName?.[0] ?? "P";
    const l = patient.lastName?.[0] ?? "";
    return `${f}${l}`.toUpperCase();
  }, [patient]);

  return (
    <div className="h-full w-full p-4 md:p-8">
      <div className="mb-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[280px,1fr]">
        {/* Sidebar */}
        <aside className="rounded-lg border border-border bg-card p-4 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20">
              {/* Hook up to real profile in future */}
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="mt-3">
              <h3 className="text-lg font-semibold text-foreground">
                {patient ? `${patient.firstName} ${patient.lastName}` : "Loading..."}
              </h3>
              <p className="text-xs text-muted-foreground">MRN: {patient?.mrn ?? "—"}</p>
            </div>
          </div>

          <Separator className="my-4" />

          <nav className="space-y-1">
            {[
              { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
              { key: "history", label: "History", icon: History },
              { key: "vitals", label: "Vitals", icon: HeartPulse },
              { key: "document", label: "Document", icon: FileText },
              { key: "prescription", label: "Prescription", icon: Stethoscope },
              { key: "notes", label: "Clinical Notes", icon: NotebookPen },
              { key: "consent", label: "Consent", icon: ShieldCheck },
            ].map((item) => {
              const active = section === (item.key as Section);
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => setSection(item.key as Section)}
                  className={
                    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors " +
                    (active
                      ? "bg-primary/10 text-primary"
                      : "text-foreground hover:bg-muted/50")
                  }
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main>
          {section === "dashboard" && (
            <div className="space-y-4">
              {/* Header cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">Drug Allergy</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground text-xl font-semibold">None Reported</p>
                  </CardContent>
                </Card>
                <Card className="bg-card">
                  <CardHeader>
                    <CardTitle className="text-sm text-muted-foreground">Balance Due</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground text-xl font-semibold">$0.00</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tabs */}
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="bg-muted/30">
                  <TabsTrigger value="info">Patient Info</TabsTrigger>
                  <TabsTrigger value="emergency">Emergency</TabsTrigger>
                  <TabsTrigger value="appointment">Appointment</TabsTrigger>
                  <TabsTrigger value="visit">Visit</TabsTrigger>
                  <TabsTrigger value="prescription">Prescription</TabsTrigger>
                  <TabsTrigger value="notes">Clinical Notes</TabsTrigger>
                  <TabsTrigger value="billing">Billing</TabsTrigger>
                  <TabsTrigger value="insurances">Insurances</TabsTrigger>
                  <TabsTrigger value="occupation">Occupation</TabsTrigger>
                </TabsList>

                <TabsContent value="info">
                  <Card>
                    <CardHeader>
                      <CardTitle>Patient Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InfoItem label="Name" value={`${patient?.firstName ?? ""} ${patient?.lastName ?? ""}`} />
                        <InfoItem label="MRN" value={patient?.mrn ?? "—"} />
                        <InfoItem label="Age" value={String(patient?.age ?? "—")} />
                        <InfoItem label="Gender" value={patient?.gender ?? "—"} />
                        <InfoItem label="Mobile" value={patient?.mobileNumber ?? "—"} />
                        <InfoItem label="City" value={patient?.city ?? "—"} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="emergency">
                  <Placeholder title="Emergency Contacts" />
                </TabsContent>
                <TabsContent value="appointment">
                  <Placeholder title="Appointments" />
                </TabsContent>
                <TabsContent value="visit">
                  <Placeholder title="Visits" />
                </TabsContent>
                <TabsContent value="prescription">
                  <PatientPrescriptionsPage />
                </TabsContent>
                <TabsContent value="notes">
                  <PatientClinicalNotesPage />
                </TabsContent>
                <TabsContent value="billing">
                  <Placeholder title="Billing" />
                </TabsContent>
                <TabsContent value="insurances">
                  <Placeholder title="Insurances" />
                </TabsContent>
                <TabsContent value="occupation">
                  <Placeholder title="Occupation" />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {section !== "dashboard" && (
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{section.replace("-", " ")}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Content for {section} goes here.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">No data available.</div>
      </CardContent>
    </Card>
  );
}

export default PatientDetailsPage;
