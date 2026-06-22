import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  CalendarDays,
  FileText,
  Loader2,
  Mic,
  Pill,
  Plus,
  Stethoscope,
  Type,
  User,
} from "lucide-react";
import type { VisitItem } from "@/features/visits/types/visit.types";
import { useClinicalNotes, useCreateClinicalNote } from "@/features/visits/hooks/useClinicalNotes";
import { usePrescriptions } from "@/features/visits/hooks/usePrescriptions";
import DictationRecorder from "@/features/patients/components/DictationRecorder";
import { PrescriptionCard } from "@/features/patients/components/PrescriptionCard";
import { AudioPlayer } from "./AudioPlayer";
import { toast } from "@/lib/toast";

const formatDate = (dt?: string | Date) => dt ? new Date(dt).toLocaleDateString() : "";

interface VisitDetailPanelProps {
  visit: VisitItem;
}

export function VisitDetailPanel({ visit }: VisitDetailPanelProps) {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { data: notes = [], isLoading: notesLoading } = useClinicalNotes(visit.visit_id);
  const { data: prescriptions = [], isLoading: prescriptionsLoading } = usePrescriptions(visit.visit_id);
  const createNote = useCreateClinicalNote(visit.visit_id);

  const hasNotes = notes.length > 0;
  const hasPrescriptions = prescriptions.length > 0;

  const handleSaveAudio = async () => {
    const file = uploadFile
      ? uploadFile
      : audioBlob
        ? new File([audioBlob], `clinical-${Date.now()}.webm`, { type: audioBlob.type || "audio/webm" })
        : null;

    if (!file) {
      toast.error("Record or upload audio first");
      return;
    }

    setIsSaving(true);
    try {
      await createNote.mutateAsync({ notes_type: "audio", file });
      setAudioBlob(null);
      setUploadFile(null);
      toast.success("Audio note saved");
    } catch {
      toast.error("Failed to save audio note");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      {/* Visit Header */}
      <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-base">
              {visit.patient?.firstName} {visit.patient?.lastName}
            </h2>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {visit.patient?.mrn && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  MRN: {visit.patient.mrn}
                </Badge>
              )}
              <span className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                {formatDate(visit.visit_date)}
              </span>
              {visit.doctor?.displayName && (
                <span className="flex items-center gap-1">
                  <Stethoscope className="h-3 w-3" />
                  {visit.doctor.displayName}
                </span>
              )}
            </div>
          </div>
          {visit.visit_type && (
            <Badge variant="outline" className="text-xs">
              {visit.visit_type}
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Clinical Notes Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-semibold">Clinical Notes</h3>
              {notesLoading && <Loader2 className="h-3 w-3 animate-spin" />}
            </div>

            {!hasNotes ? (
              /* No Notes - Show Recording UI */
              <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
                <p className="text-xs text-muted-foreground mb-3 text-center">
                  Record or upload audio to create clinical notes
                </p>

                <DictationRecorder
                  onRecorded={(blob) => {
                    setAudioBlob(blob);
                    setUploadFile(null);
                  }}
                />

                {/* Upload Option */}
                <div className="mt-3 pt-3 border-t">
                  <p className="text-[10px] text-muted-foreground mb-2">Or upload audio file:</p>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setUploadFile(file);
                      if (file) setAudioBlob(null);
                    }}
                    className="text-xs w-full"
                  />
                </div>

                {(audioBlob || uploadFile) && (
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={handleSaveAudio} disabled={isSaving} className="h-8">
                      {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                      Save Note
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              /* Notes Exist - Show Accordion */
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
                        <div className="flex items-center gap-2">
                          <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${isAudio ? "bg-purple-100 dark:bg-purple-900/50" : "bg-blue-100 dark:bg-blue-900/50"
                            }`}>
                            {isAudio ? <Mic className="h-3.5 w-3.5 text-purple-600" /> : <Type className="h-3.5 w-3.5 text-blue-600" />}
                          </div>
                          <Badge variant={isAudio ? "secondary" : "default"} className="text-[9px] px-1.5 py-0">
                            {isAudio ? "Dictation" : "Text"}
                          </Badge>
                          <span className="text-[10px] text-muted-foreground">
                            {formatDate(note.createdAt)}
                          </span>
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
                            __html: note.editor_notes || note.transcription || '<p class="text-muted-foreground">No transcription</p>'
                          }}
                        />
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            )}
          </div>

          {/* Prescription Section */}
          <Accordion type="single" collapsible defaultValue={hasPrescriptions ? "prescriptions" : undefined}>
            <AccordionItem value="prescriptions" className="border rounded-lg">
              <AccordionTrigger className="px-3 py-2 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-semibold">Prescriptions</span>
                  {prescriptionsLoading && <Loader2 className="h-3 w-3 animate-spin" />}
                  {hasPrescriptions && (
                    <Badge variant="secondary" className="text-[9px] ml-1">
                      {prescriptions.length}
                    </Badge>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3">
                {!hasPrescriptions ? (
                  <div className="text-center py-4">
                    <Pill className="h-6 w-6 mx-auto mb-2 text-muted-foreground/40" />
                    <p className="text-xs text-muted-foreground mb-2">No prescriptions yet</p>
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      <Plus className="h-3 w-3 mr-1" /> Add Prescription
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {prescriptions.map((rx) => (
                      <PrescriptionCard key={rx.prescription_id} prescription={rx} />
                    ))}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </ScrollArea>
    </Card>
  );
}

export default VisitDetailPanel;
