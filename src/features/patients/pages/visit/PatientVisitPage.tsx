import { useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import {
  ArrowLeft,
  CalendarDays,
  ClipboardList,
  FileText,
  NotebookPen,
  Pill,
  Receipt,
  Stethoscope,
  User,
  Plus,
} from "lucide-react";
import { patientService } from "@/features/patients/services/patient.service";
import { visitService } from "@/features/visits/services/visit.service";
import type { VisitItem } from "@/features/visits/types/visit.types";
import { HPIDentalChart } from "./hpi/HPIDentalChart";
import { PatientVisitPrescriptionPage } from "./pages/PatientVisitPrescriptionPage";
import { PatientVisitClinicalNotesPage } from "./pages/PatientVisitClinicalNotesPage";
import { PatientVisitDocumentPage } from "./pages/PatientVisitDocumentPage";
import { CreateInvoiceSheet } from "@/features/billing/components/CreateInvoiceSheet";
import { CreateVisitSheet } from "@/features/visits/components/CreateVisitSheet";

const tabs = [
  { id: "overview", label: "Overview", icon: ClipboardList },
  { id: "hpi", label: "HPI", icon: Stethoscope },
  // { id: "treatment", label: "Treatment", icon: Stethoscope },
  { id: "prescription", label: "Prescription", icon: Pill },
  { id: "document", label: "Document", icon: FileText },
  { id: "notes", label: "Clinical Notes", icon: NotebookPen },
] as const;

type TabId = (typeof tabs)[number]["id"];

export function PatientVisitPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();

  const initialVisitId = searchParams.get("visitId");
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(
    initialVisitId ? Number(initialVisitId) : null
  );
  const currentTab = (searchParams.get("tab") as TabId) || "overview";
  const [showInvoiceSheet, setShowInvoiceSheet] = useState(false);
  const [showCreateSheet, setShowCreateSheet] = useState(false);

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

  const handleSelectVisit = (visitId: number) => {
    setSelectedVisitId(visitId);
    const next = new URLSearchParams(searchParams);
    next.set("visitId", String(visitId));
    if (!next.get("tab")) next.set("tab", "overview");
    setSearchParams(next, { replace: true });
  };

  const handleTabChange = (tabId: TabId) => {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tabId);
    setSearchParams(next, { replace: true });
  };

  const handleBackToVisits = () => {
    setSelectedVisitId(null);
    const next = new URLSearchParams(searchParams);
    next.delete("visitId");
    next.delete("tab");
    setSearchParams(next, { replace: true });
  };

  // Visit List View
  if (!selectedVisit) {
    return (
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Patient Visits</h2>
            <Badge variant="secondary" className="text-[10px] h-5 px-1.5 ml-2">
              {visits.length}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <Button size="sm" onClick={() => setShowCreateSheet(true)} className="h-7 px-2 text-xs">
              <Plus className="h-3 w-3 mr-1" />
              Create Visit
            </Button>
          </div>
        </div>
        <CardContent className="p-3">
          {visitsLoading ? (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
          ) : visits.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <CalendarDays className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm font-medium">No visits yet</p>
              <Button variant="outline" size="sm" onClick={() => setShowCreateSheet(true)} className="mt-3 text-xs h-8">
                <Plus className="h-3 w-3 mr-1.5" />
                Create a visit to start
              </Button>
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {visits.map((visit) => {
                const date = new Date(visit.visit_date);
                return (
                  <button
                    key={visit.visit_id}
                    onClick={() => handleSelectVisit(visit.visit_id)}
                    className="group relative rounded-lg border border-border bg-card p-3 text-left transition-all hover:border-primary/50 hover:shadow-md"
                  >
                    <div className="absolute inset-x-0 top-0 h-0.5 rounded-t-lg bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center justify-between mb-1.5">
                      {/* <Badge variant={visit.status === 1 ? "default" : "secondary"} className="text-[10px] px-1.5 py-0">
                        {visit.status === 1 ? "Active" : "Done"}
                      </Badge> */}
                      {/* <span className="text-[10px] text-muted-foreground">#{visit.visit_id}</span> */}
                    </div>
                    <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {date.toLocaleDateString()}
                    </h3>
                    {visit.doctor?.displayName && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-muted-foreground">
                        <User className="h-3 w-3" />
                        <span>{visit.doctor.displayName}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-muted-foreground">
                      <ClipboardList className="h-3 w-3" />
                      <span>{visit.visit_type}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
        <CreateVisitSheet
          open={showCreateSheet}
          onOpenChange={setShowCreateSheet}
          patientId={patientId}
        />
      </Card>
    );
  }

  // Tab View
  return (
    <Card className="border-border shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackToVisits} className="h-7 px-2 text-xs">
            <ArrowLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
          <div>
            <h2 className="text-sm font-semibold">{selectedVisit.visit_type}</h2>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span>{new Date(selectedVisit.visit_date).toLocaleDateString()}</span>
              {selectedVisit.doctor?.displayName && (
                <>
                  <span>|</span>
                  <span>{selectedVisit.doctor.displayName}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowInvoiceSheet(true)}
            className="h-7 px-2 text-xs gap-1"
          >
            <Receipt className="h-3 w-3" />
            Create Invoice
          </Button>
          <Badge variant="secondary" className="text-[10px]">#{selectedVisit.visit_id}</Badge>
        </div>
      </div>

      {/* Tabs */}
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
                  ${isActive ? "text-primary" : "text-muted-foreground hover:text-primary hover:bg-primary/5"}
                `}
              >
                <Icon className={`h-3.5 w-3.5 ${!isActive && "group-hover:scale-110 transition-transform"}`} />
                <span>{label}</span>
                {isActive && <span className="absolute inset-x-0 -bottom-[1px] h-[2px] bg-primary rounded-t-full" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <CardContent className="p-3">
        {currentTab === "overview" && (
          <div className="-mx-3 -mt-3">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="hpi" className="border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="font-semibold">HPI</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <HPIDentalChart visitId={selectedVisitId ?? undefined} isReadOnly={true} />
                </AccordionContent>
              </AccordionItem>
              {/* 
              <AccordionItem value="treatment" className="border-t border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Treatment</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center pointer-events-none">
                    <Stethoscope className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Treatment Plan</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Coming soon</p>
                  </div>
                </AccordionContent>
              </AccordionItem> */}

              <AccordionItem value="prescription" className="border-t border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Pill className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Prescription</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PatientVisitPrescriptionPage isReadOnly={true} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="document" className="border-t border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Document</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PatientVisitDocumentPage isReadOnly={true} />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="notes" className="border-t border-b-0">
                <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 data-[state=open]:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Clinical Notes</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <PatientVisitClinicalNotesPage isReadOnly={true} />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        )}

        {currentTab === "hpi" && <HPIDentalChart visitId={selectedVisitId ?? undefined} />}

        {/* {currentTab === "treatment" && (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
            <Stethoscope className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm font-medium">Treatment Plan</p>
            <p className="text-xs text-muted-foreground mt-0.5">Coming soon</p>
          </div>
        )} */}

        {currentTab === "prescription" && <PatientVisitPrescriptionPage />}
        {currentTab === "document" && <PatientVisitDocumentPage />}
        {currentTab === "notes" && <PatientVisitClinicalNotesPage />}
      </CardContent>

      {/* Invoice Sheet */}
      <CreateInvoiceSheet
        open={showInvoiceSheet}
        onOpenChange={setShowInvoiceSheet}
        visitId={selectedVisitId}
        patientId={patientId}
      />
    </Card>
  );
}

export default PatientVisitPage;
