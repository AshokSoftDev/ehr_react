import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  AudioLines,
  CalendarDays,
  ExternalLink,
  FileText,
  Loader2,
  Mic,
  Type,
  User,
} from "lucide-react";
import { patientService } from "@/features/patients/services/patient.service";
import { visitService } from "@/features/visits/services/visit.service";
import type { VisitItem } from "@/features/visits/types/visit.types";
import { useClinicalNotes } from "@/features/visits/hooks/useClinicalNotes";

const formatDate = (dt?: string) => (dt ? new Date(dt).toLocaleDateString() : "");

/**
 * PatientClinicalNotesPage
 * Used in: /patient/:id/notes
 * 
 * Read-only view of clinical notes.
 * Shows visits list -> select visit -> view notes (read-only).
 * To edit, user is redirected to Visit page notes tab.
 */
export function PatientClinicalNotesPage() {
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

  const { data: notes = [], isLoading: notesLoading } = useClinicalNotes(
    selectedVisitId || undefined
  );

  const handleGoToEdit = () => {
    if (selectedVisitId) {
      navigate(`/main/patients/${patientId}/visit?tab=notes&visitId=${selectedVisitId}`);
    }
  };

  // Visits List View
  if (!selectedVisit) {
    return (
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold">Clinical Notes</h2>
          </div>
          {visitsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-3">
            Select a visit to view its clinical notes
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
                        <span>Dr. {v.doctor.displayName}</span>
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

  // Selected Visit Notes View (Read-Only)
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
              {selectedVisit.doctor?.displayName && ` • Dr. ${selectedVisit.doctor.displayName}`}
            </div>
          </div>
        </div>
        <Button size="sm" onClick={handleGoToEdit} className="h-7 text-xs">
          <ExternalLink className="h-3.5 w-3.5 mr-1" />
          Edit Notes
        </Button>
      </div>

      <CardContent className="p-3">
        {notesLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
            <AudioLines className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium">No clinical notes</p>
            <p className="text-xs text-muted-foreground mb-3">This visit has no notes yet</p>
            <Button variant="outline" size="sm" onClick={handleGoToEdit} className="h-8">
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Go to Visit to Add
            </Button>
          </div>
        ) : (
          <Accordion type="multiple" className="space-y-2">
            {notes.map((note) => {
              const isAudio = note.notes_type === "audio";

              return (
                <AccordionItem
                  key={note.cn_id}
                  value={String(note.cn_id)}
                  className="border border-border rounded-lg bg-card px-3 data-[state=open]:bg-muted/30"
                >
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 w-full">
                      {/* Icon */}
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isAudio 
                          ? "bg-purple-100 dark:bg-purple-900/50" 
                          : "bg-blue-100 dark:bg-blue-900/50"
                      }`}>
                        {isAudio ? (
                          <Mic className="h-4 w-4 text-purple-600" />
                        ) : (
                          <Type className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      
                      {/* Header Info */}
                      <div className="flex items-center gap-2 flex-1 text-left">
                        <Badge 
                          variant={isAudio ? "secondary" : "default"} 
                          className="px-1.5 py-0 text-[10px]"
                        >
                          {isAudio ? "Dictation" : "Text"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pt-2 pb-4">
                    <div 
                      className="prose prose-sm dark:prose-invert max-w-none text-sm [&>p]:my-1.5 [&>ul]:my-1.5 [&>ol]:my-1.5 [&>h1]:text-lg [&>h2]:text-base [&>h3]:text-sm"
                      dangerouslySetInnerHTML={{ 
                        __html: note.editor_notes || note.transcription || '<p class="text-muted-foreground">No content</p>' 
                      }}
                    />
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        )}
      </CardContent>
    </Card>
  );
}

export default PatientClinicalNotesPage;
