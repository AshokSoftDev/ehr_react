import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { startOfDay, endOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarDays,
  Edit,
  FileText,
  Loader2,
  Mic,
  NotebookPen,
  Pill,
  Plus,
  Printer,
  Stethoscope,
  Trash2,
  Type,
} from "lucide-react";
import { visitService } from "@/features/visits/services/visit.service";
import { appointmentService } from "@/features/appointments/services/appointment.service";
import type { VisitItem } from "@/features/visits/types/visit.types";
import AppointmentFormSheet, {
  type AppointmentFormValues,
} from "@/features/appointments/components/AppointmentFormSheet";
import type { CreateAppointmentInput } from "@/features/appointments/types/appointment.types";
import { useClinicalNotes, useDeleteClinicalNote } from "@/features/visits/hooks/useClinicalNotes";
import { usePrescriptions } from "@/features/visits/hooks/usePrescriptions";
import { PrescriptionCard } from "@/features/patients/components/PrescriptionCard";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { AudioPlayer } from "../components/AudioPlayer";
import { ClinicalNotesFilters } from "../components/ClinicalNotesFilters";
import { AddClinicalNotePanel } from "../components/AddClinicalNotePanel";
import { AddPrescriptionPanel } from "../components/AddPrescriptionPanel";
import { EditClinicalNotePanel } from "../components/EditClinicalNotePanel";
import { EditPrescriptionPanel } from "../components/EditPrescriptionPanel";
import { StatusCountCards } from "../components/StatusCountCards";

const formatDate = (dt: string | Date) => new Date(dt).toLocaleDateString();

// Visit Accordion Content Component
function VisitAccordionContent({
  visit,
  onAddClinicalNotes,
  onAddPrescription,
  onEditNote,
  onEditPrescription,
}: {
  visit: VisitItem;
  onAddClinicalNotes: () => void;
  onAddPrescription: () => void;
  onEditNote: (noteId: number) => void;
  onEditPrescription: () => void;
}) {
  const { data: notes = [], isLoading: notesLoading } = useClinicalNotes(visit.visit_id);
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions(visit.visit_id);
  const deleteNoteMutation = useDeleteClinicalNote(visit.visit_id);
  const [noteToDelete, setNoteToDelete] = useState<{ id: number; createdAt: string } | null>(null);

  const hasNotes = notes.length > 0;
  const hasPrescriptions = prescriptions.length > 0;

  const handleEdit = (noteId: number) => {
    onEditNote(noteId);
  };

  const handlePrint = (note: typeof notes[0]) => {
    const printContent = note.editor_notes || note.transcription || "No content";
    const noteDate = note.createdAt ? formatDate(note.createdAt) : "N/A";
    
    // Create a hidden iframe for printing
    const iframe = document.createElement("iframe");
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    iframe.style.left = "-9999px";
    document.body.appendChild(iframe);
    
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Clinical Note - ${noteDate}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; line-height: 1.6; }
              .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
              .header h1 { margin: 0 0 5px 0; font-size: 18px; }
              .header p { margin: 0; color: #666; font-size: 12px; }
              .content { font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Clinical Note</h1>
              <p>Date: ${noteDate} | Type: ${note.notes_type === "audio" ? "Audio" : "Text"}</p>
            </div>
            <div class="content">${printContent}</div>
          </body>
        </html>
      `);
      doc.close();
      
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      
      // Remove iframe after printing
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  const handleDelete = (noteId: number, createdAt: string) => {
    setNoteToDelete({ id: noteId, createdAt });
  };

  if (notesLoading || prescriptionsLoading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasNotes) {
    return (
      <div className="text-center py-6">
        <FileText className="h-10 w-10 mx-auto mb-3 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground mb-4">No clinical notes for this visit</p>
        <Button onClick={onAddClinicalNotes} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Clinical Notes
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {/* Clinical Notes */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <h4 className="text-sm font-semibold">Clinical Notes</h4>
            <Badge variant="secondary" className="text-xs">{notes.length}</Badge>
          </div>
          <Accordion type="multiple" className="space-y-2">
            {notes.map((note) => {
              const isAudio = note.notes_type === "audio";
              return (
                <AccordionItem
                  key={note.cn_id}
                  value={String(note.cn_id)}
                  className="border rounded-lg bg-card px-3"
                >
                  <AccordionTrigger className="hover:no-underline py-2">
                    <div className="flex items-center gap-2 flex-1">
                      <div
                        className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                          isAudio
                            ? "bg-purple-100 dark:bg-purple-900/50"
                            : "bg-blue-100 dark:bg-blue-900/50"
                        }`}
                      >
                        {isAudio ? (
                          <Mic className="h-3.5 w-3.5 text-purple-600" />
                        ) : (
                          <Type className="h-3.5 w-3.5 text-blue-600" />
                        )}
                      </div>
                      <Badge variant={isAudio ? "secondary" : "default"} className="text-[9px] px-1.5">
                        {isAudio ? "Audio" : "Text"}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {note.createdAt ? formatDate(note.createdAt) : "N/A"}
                      </span>
                      {/* Action Buttons in Header - using divs to avoid nested button error */}
                      <div className="flex items-center gap-1 ml-auto mr-2">
                        <div
                          role="button"
                          tabIndex={0}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(note.cn_id);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleEdit(note.cn_id)}
                          title="Edit"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-600 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handlePrint(note);
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handlePrint(note)}
                          title="Print"
                        >
                          <Printer className="h-3.5 w-3.5" />
                        </div>
                        <div
                          role="button"
                          tabIndex={0}
                          className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-red-100 dark:hover:bg-red-900/50 text-destructive cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(note.cn_id, note.createdAt || "");
                          }}
                          onKeyDown={(e) => e.key === 'Enter' && handleDelete(note.cn_id, note.createdAt || "")}
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </div>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-3">
                    {note.audio_url && (
                      <div className="mb-3">
                        <AudioPlayer src={note.audio_url} />
                      </div>
                    )}
                    <div
                      className="prose prose-sm dark:prose-invert max-w-none text-sm"
                      dangerouslySetInnerHTML={{
                        __html:
                          note.editor_notes ||
                          note.transcription ||
                          '<p class="text-muted-foreground">No transcription</p>',
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Prescriptions */}
        <Accordion type="single" collapsible className="pt-4 border-t">
          <AccordionItem value="prescriptions" className="border rounded-lg bg-card px-3">
            <AccordionTrigger className="hover:no-underline py-2">
              <div className="flex items-center gap-2 flex-1">
                <div className="h-7 w-7 rounded-lg flex items-center justify-center bg-amber-100 dark:bg-amber-900/50">
                  <Pill className="h-3.5 w-3.5 text-amber-600" />
                </div>
                <span className="font-medium text-sm">Prescriptions</span>
                {hasPrescriptions && (
                  <Badge variant="secondary" className="text-xs">{prescriptions.length}</Badge>
                )}
                {/* Edit Button for Prescriptions */}
                {hasPrescriptions && (
                  <div className="flex items-center gap-1 ml-auto mr-2">
                    <div
                      role="button"
                      tabIndex={0}
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onEditPrescription();
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && onEditPrescription()}
                      title="Edit Prescriptions"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </div>
                  </div>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-2 pb-3">
              {hasPrescriptions ? (
                <div className="space-y-2">
                  {prescriptions.map((rx) => (
                    <PrescriptionCard key={rx.prescription_id} prescription={rx} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-xs text-muted-foreground mb-2">No prescriptions added yet</p>
                  <Button size="sm" className="gap-2" onClick={onAddPrescription}>
                    <Plus className="h-4 w-4" />
                    Add Prescription
                  </Button>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>


      </div>
      
      <ConfirmDeleteDialog
        open={!!noteToDelete}
        onOpenChange={(open) => !open && setNoteToDelete(null)}
        onConfirm={() => {
          if (noteToDelete) {
             deleteNoteMutation.mutateAsync(noteToDelete.id);
             setNoteToDelete(null);
          }
        }}
        title="Delete Clinical Note"
        description={
          noteToDelete ? (
            <span>
              Are you sure you want to delete the clinical note from{" "}
              <span className="font-bold">{formatDate(noteToDelete.createdAt)}</span>?
              <br />
              <span className="text-muted-foreground text-sm mt-1 block">
                This action cannot be undone.
              </span>
            </span>
          ) : (
            "Are you sure you want to delete this clinical note?"
          )
        }
        isDeleting={deleteNoteMutation.isPending}
      />
    </div>
  );
}

export function ClinicalNotesPage() {
  const [showAppointmentSheet, setShowAppointmentSheet] = useState(false);
  const [addNoteForVisit, setAddNoteForVisit] = useState<VisitItem | null>(null);
  const [addPrescriptionForVisit, setAddPrescriptionForVisit] = useState<VisitItem | null>(null);
  // Edit Note state - stores visit and noteId
  const [editNoteState, setEditNoteState] = useState<{ visit: VisitItem; noteId: number } | null>(null);
  // Edit Prescription state - stores visit for bulk prescription editing
  const [editPrescriptionForVisit, setEditPrescriptionForVisit] = useState<VisitItem | null>(null);

  // Accordion state and auto-scroll logic
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleAccordionChange = (value: string[]) => {
    // specific logic to find the newly added item to scroll to it
    const newItems = value.filter((item) => !expandedItems.includes(item));
    setExpandedItems(value);

    // If an item was added (opened), scroll it into view
    if (newItems.length > 0) {
      const newItemId = newItems[0];
      // Small timeout to allow the accordion to start opening/rendering
      setTimeout(() => {
        const element = document.getElementById(`visit-accordion-${newItemId}`);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    }
  };

  // Input filter state (what user is typing/selecting)
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(new Date());
  const [patientSearch, setPatientSearch] = useState("");
  const [doctorFilter, setDoctorFilter] = useState<string>("all");

  // Applied filter state (what API uses - only updated on Search click)
  const [appliedFilters, setAppliedFilters] = useState({
    date: new Date() as Date | undefined,
    patient: "",
    doctor: "all",
  });

  // Helper to get doctor ID for API (returns undefined for "all")
  const getDoctorIdForApi = (doctorValue: string) => (doctorValue === "all" ? undefined : doctorValue);

  // Fetch visits with APPLIED filters (not input filters)
  const {
    data: visitsData,
    isLoading: visitsLoading,
    refetch: refetchVisits,
  } = useQuery({
    queryKey: ["clinical-notes-visits", appliedFilters],
    queryFn: () => visitService.list({
      status: "1",
      page: 1,
      limit: 100,
      dateFrom: appliedFilters.date ? startOfDay(appliedFilters.date).toISOString() : undefined,
      dateTo: appliedFilters.date ? endOfDay(appliedFilters.date).toISOString() : undefined,
      doctor_id: getDoctorIdForApi(appliedFilters.doctor),
      patient: appliedFilters.patient || undefined,
    }),
  });

  // Fetch status counts for APPLIED filters
  const { data: statusCounts, isLoading: statusCountsLoading } = useQuery({
    queryKey: ["status-counts", appliedFilters.date?.toISOString(), appliedFilters.doctor],
    queryFn: () => visitService.getStatusCounts({
      date: appliedFilters.date?.toISOString(),
      doctorId: getDoctorIdForApi(appliedFilters.doctor),
    }),
  });

  // Fetch doctors for filter and appointment form
  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors-list"],
    queryFn: () => appointmentService.getDoctors(),
  });

  const visits = useMemo<VisitItem[]>(() => visitsData?.visits ?? [], [visitsData]);

  // No client-side filtering needed - server handles it
  const filteredVisits = visits;

  // Apply current input filters to trigger API call
  const handleSearch = () => {
    setAppliedFilters({
      date: appointmentDate,
      patient: patientSearch,
      doctor: doctorFilter,
    });
  };

  const clearFilters = () => {
    // Reset input filters
    setAppointmentDate(new Date());
    setPatientSearch("");
    setDoctorFilter("all");
    // Reset and apply
    setAppliedFilters({
      date: new Date(),
      patient: "",
      doctor: "all",
    });
  };

  const handleAppointmentSubmit = async (data: AppointmentFormValues) => {
    console.log("Submitting appointment:", data);
    try {
      const payload: CreateAppointmentInput = {
        patient_id: data.patient_id,
        doctor_id: data.doctor_id,
        appointment_date: data.appointment_date,
        start_time: data.start_time,
        end_time: data.end_time,
        duration: data.duration,
        appointment_type: data.appointment_type,
        reason_for_visit: data.reason_for_visit,
        notes: data.notes,
        appointment_status: data.appointment_status,
      };
      console.log("API payload:", payload);
      await appointmentService.create(payload);
      setShowAppointmentSheet(false);
      refetchVisits();
    } catch (error) {
      console.error("Failed to create appointment", error);
    }
  };

  // Show Add Clinical Notes Panel
  if (addNoteForVisit) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden p-4">
        <AddClinicalNotePanel
          visit={addNoteForVisit}
          onBack={() => setAddNoteForVisit(null)}
          onComplete={() => {
            setAddNoteForVisit(null);
            refetchVisits();
          }}
        />
      </div>
    );
  }

  // Show Add Prescription Panel
  if (addPrescriptionForVisit) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden p-4">
        <AddPrescriptionPanel
          visit={addPrescriptionForVisit}
          onBack={() => setAddPrescriptionForVisit(null)}
          onComplete={() => {
            setAddPrescriptionForVisit(null);
            refetchVisits();
          }}
        />
      </div>
    );
  }

  // Show Edit Clinical Note Panel
  if (editNoteState) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden p-4">
        <EditClinicalNotePanel
          visit={editNoteState.visit}
          noteId={editNoteState.noteId}
          onBack={() => setEditNoteState(null)}
          onComplete={() => {
            setEditNoteState(null);
            refetchVisits();
          }}
        />
      </div>
    );
  }

  // Show Edit Prescription Panel
  if (editPrescriptionForVisit) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden p-4">
        <EditPrescriptionPanel
          visit={editPrescriptionForVisit}
          onBack={() => setEditPrescriptionForVisit(null)}
          onComplete={() => {
            setEditPrescriptionForVisit(null);
            refetchVisits();
          }}
        />
      </div>
    );
  }


  return (
    <>
      <div className="h-full flex flex-col bg-background">
        {/* Header Section */}
        <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Clinical Notes
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  Manage clinical notes and prescriptions for patient visits
                </p>
              </div>
              <div className="flex items-center gap-4">
                {/* Status Count Cards */}
                <StatusCountCards
                  counts={statusCounts ?? { scheduled: 0, pending: 0, notesGenerated: 0, postedToEHR: 0 }}
                  isLoading={statusCountsLoading}
                />
                {/* Add Appointment Button */}
                <Button
                  className="bg-primary-gradient hover:opacity-90 shadow-lg"
                  onClick={() => setShowAppointmentSheet(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Appointment
                </Button>
              </div>
            </div>

            {/* Filters Row */}
            <ClinicalNotesFilters
              appointmentDate={appointmentDate}
              onDateChange={setAppointmentDate}
              patientSearch={patientSearch}
              onPatientSearchChange={setPatientSearch}
              doctorFilter={doctorFilter}
              onDoctorFilterChange={setDoctorFilter}
              doctors={doctors}
              onSearch={handleSearch}
              onReset={clearFilters}
            />
          </div>
        </div>

        {/* Visit Accordion List */}
        <ScrollArea className="flex-1">
          <div className="space-y-2 pr-4 pt-4">
            {visitsLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))
            ) : filteredVisits.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                <p className="text-lg font-medium text-muted-foreground">No visits found</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Try adjusting your filters or add a new visit
                </p>
              </div>
            ) : (
              <Accordion 
                type="multiple" 
                className="space-y-2"
                value={expandedItems}
                onValueChange={handleAccordionChange}
              >
                {filteredVisits.map((visit) => (
                  <AccordionItem
                    key={visit.visit_id}
                    value={String(visit.visit_id)}
                    id={`visit-accordion-${visit.visit_id}`}
                    className="border rounded-lg bg-card px-4 scroll-mt-2" // scroll-mt-2 adds a little spacing from the top when scrolled
                  >
                    <AccordionTrigger className="hover:no-underline py-4">
                      <div className="flex items-center gap-4 flex-1 text-left">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <NotebookPen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-sm">
                              {visit.patient?.firstName} {visit.patient?.lastName}
                            </span>
                            {visit.patient?.mrn && (
                              <Badge variant="secondary" className="text-[10px] px-1.5">
                                {visit.patient.mrn}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3.5 w-3.5" />
                              {formatDate(visit.visit_date)}
                            </span>
                            {visit.doctor?.displayName && (
                              <span className="flex items-center gap-1">
                                <Stethoscope className="h-3.5 w-3.5" />
                                Dr. {visit.doctor.displayName}
                              </span>
                            )}
                            {visit.visit_type && (
                              <Badge variant="outline" className="text-[10px]">
                                {visit.visit_type}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div
                          className={`h-2.5 w-2.5 rounded-full shrink-0 ${
                            visit.status === 1 ? "bg-green-500" : "bg-muted"
                          }`}
                        />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-2 pb-4">
                      <VisitAccordionContent
                        visit={visit}
                        onAddClinicalNotes={() => setAddNoteForVisit(visit)}
                        onAddPrescription={() => setAddPrescriptionForVisit(visit)}
                        onEditNote={(noteId) => setEditNoteState({ visit, noteId })}
                        onEditPrescription={() => setEditPrescriptionForVisit(visit)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Appointment Form Sheet */}
      <AppointmentFormSheet
        open={showAppointmentSheet}
        onOpenChange={setShowAppointmentSheet}
        onSubmit={handleAppointmentSubmit}
        doctors={doctors}
        defaultStatus="WITH DOCTOR"
        hideStatus={true}
      />
      
    </>
  );
}

export default ClinicalNotesPage;
