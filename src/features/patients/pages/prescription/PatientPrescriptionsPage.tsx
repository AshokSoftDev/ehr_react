import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  Loader2,
  Pill,
  User,
} from "lucide-react";
import { patientService } from "@/features/patients/services/patient.service";
import { visitService } from "@/features/visits/services/visit.service";
import type { VisitItem } from "@/features/visits/types/visit.types";
import { usePrescriptions } from "@/features/visits/hooks/usePrescriptions";

/**
 * PatientPrescriptionsPage
 * Used in: /patient/:id/prescription
 * 
 * Read-only view of prescriptions.
 * Shows visits list -> select visit -> view prescriptions (read-only).
 * To edit, user is redirected to Visit page prescription tab.
 */
export function PatientPrescriptionsPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const navigate = useNavigate();
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);

  const { data: patient } = useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  const visitFilters = useMemo(() => {
    if (!patient) return undefined;
    return {
      patient: patient.mrn || `${patient.firstName} ${patient.lastName}`,
      status: "1",
      page: 1,
      limit: 50,
    };
  }, [patient]);

  const { data: visitsData, isLoading: visitsLoading } = useQuery({
    queryKey: ["patient-visits", visitFilters],
    queryFn: () => visitService.list(visitFilters!),
    enabled: !!visitFilters,
  });

  const visits: VisitItem[] = visitsData?.visits ?? [];
  const selectedVisit = visits.find((v) => v.visit_id === selectedVisitId) || null;

  const { data: prescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions(
    selectedVisitId || undefined
  );

  const handleGoToEdit = () => {
    if (selectedVisitId) {
      navigate(`/main/patients/${patientId}/visit?tab=prescription&visitId=${selectedVisitId}&edit=true`);
    }
  };

  // Visits List View
  if (!selectedVisit) {
    return (
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-emerald-500" />
            <h2 className="text-sm font-semibold">Prescriptions</h2>
          </div>
          {visitsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-3">
            Select a visit to view its prescriptions
          </p>

          {visitsLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
            </div>
          ) : visits.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">No visits found</p>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {visits.map((v) => {
                const date = new Date(v.visit_date);
                return (
                  <button
                    key={v.visit_id}
                    onClick={() => setSelectedVisitId(v.visit_id)}
                    className="group rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <Badge variant={v.status === 1 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {v.status === 1 ? "Active" : "Done"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">#{v.visit_id}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                      {v.visit_type}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                      <CalendarDays className="h-3 w-3" />
                      <span>{date.toLocaleDateString()}</span>
                    </div>
                    {v.doctor?.displayName && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{v.doctor.displayName}</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Selected Visit Prescriptions View (Read-Only)
  return (
    <Card className="border-border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setSelectedVisitId(null)} className="h-7 px-2">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{selectedVisit.visit_type}</h2>
            <div className="text-[11px] text-muted-foreground">
              {new Date(selectedVisit.visit_date).toLocaleDateString()}
              {selectedVisit.doctor?.displayName && ` | ${selectedVisit.doctor.displayName}`}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={handleGoToEdit} className="h-7 text-xs">
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          Edit Prescriptions
        </Button>
      </div>

      <CardContent className="p-3">
        {prescriptionsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
            <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">No prescriptions</p>
            <p className="text-xs text-muted-foreground mb-3">This visit has no prescriptions yet</p>
            <Button variant="outline" size="sm" onClick={handleGoToEdit} className="h-8">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Go to Visit to Add
            </Button>
          </div>
        ) : (
          <ScrollArea className="max-h-[500px]">
            <div className="divide-y divide-border border rounded-lg bg-card overflow-hidden">
              {prescriptions.map((prescription) => {
                const times: string[] = [];
                if (prescription.morning_bf) times.push("Morning (BF)");
                if (prescription.morning_af) times.push("Morning (AF)");
                if (prescription.noon_bf) times.push("Noon (BF)");
                if (prescription.noon_af) times.push("Noon (AF)");
                if (prescription.evening_bf) times.push("Evening (BF)");
                if (prescription.evening_af) times.push("Evening (AF)");
                if (prescription.night_bf) times.push("Night (BF)");
                if (prescription.night_af) times.push("Night (AF)");
                const schedule = times.length > 0 ? times.join(", ") : "No schedule";
                const notes = prescription.instruction || prescription.notes;

                return (
                  <div
                    key={prescription.prescription_id}
                    className="flex flex-col p-3 hover:bg-muted/30 transition-colors gap-2"
                  >
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap items-center gap-2">
                          <Pill className="h-4 w-4 text-emerald-500" />
                          <h4 className="font-semibold text-sm text-foreground">
                            {prescription.drug_name}
                          </h4>
                          {prescription.drug_dosage && (
                            <>
                              <span className="text-muted-foreground/40 font-normal">|</span>
                              <span className="font-medium text-xs text-foreground">
                                {prescription.drug_dosage} {prescription.drug_measure}
                              </span>
                            </>
                          )}
                          {prescription.drug_type && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 border-none bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                              {prescription.drug_type}
                            </Badge>
                          )}
                          {prescription.drug_generic && (
                            <span className="text-xs text-muted-foreground">
                              ({prescription.drug_generic})
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                        {(prescription.quantity || prescription.duration) && (
                          <>
                            <span>
                              <strong className="text-foreground font-medium">Qty:</strong> {prescription.quantity || '-'}
                              {prescription.duration && ` (${prescription.duration} ${prescription.duration_type || 'Days'})`}
                            </span>
                          </>
                        )}

                        <span className="text-muted-foreground/40 hidden sm:inline">|</span>
                        <span>
                          <strong className="text-foreground font-medium">Freq:</strong> {schedule}
                        </span>

                        {notes && (
                          <span
                            className="text-xs text-muted-foreground italic border-l pl-2 border-border/50 line-clamp-1 max-w-[250px] mt-0.5 sm:mt-0"
                            title={notes}
                          >
                            <strong className="text-foreground font-medium not-italic">
                              Notes:
                            </strong>{" "}
                            {notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default PatientPrescriptionsPage;
