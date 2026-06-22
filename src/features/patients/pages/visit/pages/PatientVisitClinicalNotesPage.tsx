import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import {
  AudioLines,
  Edit3,
  FileText,
  Loader2,
  Mic,
  Plus,
  Printer,
  Save,
  Trash2,
  Type,
  Upload,
  X,
} from "lucide-react";
import { AudioPlayer } from "@/features/clinical-notes/components/AudioPlayer";
import MedicalNoteEditor from "@/features/patients/components/MedicalNoteEditor";
import DictationRecorder from "@/features/patients/components/DictationRecorder";
import {
  useClinicalNotes,
  useCreateClinicalNote,
  useDeleteClinicalNote,
  useUpdateClinicalNote,
} from "@/features/visits/hooks/useClinicalNotes";
import { appointmentService } from "@/features/appointments/services/appointment.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";


const formatDate = (dt?: string) => (dt ? new Date(dt).toLocaleString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : "");

export function PatientVisitClinicalNotesPage() {
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get("visitId") ? Number(searchParams.get("visitId")) : null;

  const editorRef = useRef<{ getContent: () => string; setContent: (html: string) => void } | null>(null);
  const [mode, setMode] = useState<"text" | "dictate">("text");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const queryClient = useQueryClient();
  const currentVisit = useMemo(() => {
    if (!visitId) return null;
    const queries = queryClient.getQueriesData({ queryKey: ["patient-visits"] });
    for (const [, data] of queries) {
      const visits = (data as any)?.visits;
      if (visits) {
        const found = visits.find((v: any) => v.visit_id === visitId);
        if (found) return found;
      }
    }
    return null;
  }, [queryClient, visitId]);

  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");

  const { data: doctors = [] } = useQuery({
    queryKey: ["appointment-doctors"],
    queryFn: () => appointmentService.getDoctors(),
  });

  const { data: notes = [], isLoading: notesLoading } = useClinicalNotes(visitId || undefined);
  const createNote = useCreateClinicalNote(visitId || undefined);
  const updateNote = useUpdateClinicalNote(visitId || undefined);
  const deleteNote = useDeleteClinicalNote(visitId || undefined);

  const activeNote = useMemo(
    () => notes.find((n) => n.cn_id === editingId) || null,
    [editingId, notes]
  );

  // When editing a note, open editor and set content after a small delay to ensure editor is mounted
  useEffect(() => {
    if (activeNote) {
      setMode("text");
      setSelectedDoctorId(activeNote.doctor_id || currentVisit?.doctor_id || "");
      setIsEditorOpen(true);

      // Use setTimeout to ensure editor is mounted before setting content
      const timer = setTimeout(() => {
        const seed = activeNote.editor_notes || activeNote.transcription || "<p></p>";
        editorRef.current?.setContent(seed);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [activeNote]);

  const handleSave = async () => {
    if (!visitId) {
      toast.error("Select a visit first");
      return;
    }

    if (mode === "dictate" && activeNote) {
      toast.error("Dictation is only for new notes. Edit using text.");
      setMode("text");
      return;
    }

    if (mode === "text" || activeNote) {
      const html = (editorRef.current?.getContent() || "").trim();
      if (!html) {
        toast.error("Please add some text before saving");
        return;
      }
      if (editingId) {
        await updateNote.mutateAsync({
          noteId: editingId,
          payload: {
            editor_notes: html,
            ...(selectedDoctorId && selectedDoctorId !== "none" && { doctor_id: selectedDoctorId })
          }
        });
      } else {
        await createNote.mutateAsync({
          notes_type: "text",
          editor_notes: html,
          ...(selectedDoctorId && selectedDoctorId !== "none" && { doctor_id: selectedDoctorId })
        });
      }
      setEditingId(null);
      setIsEditorOpen(false);
      editorRef.current?.setContent("<p></p>");
    } else {
      const file = uploadFile
        ? uploadFile
        : audioBlob
          ? new File([audioBlob], `clinical-${Date.now()}.webm`, {
            type: audioBlob.type || "audio/webm",
          })
          : null;
      if (!file) {
        toast.error("Record or upload audio before saving");
        return;
      }
      await createNote.mutateAsync({
        notes_type: "audio",
        file,
        ...(selectedDoctorId && selectedDoctorId !== "none" && { doctor_id: selectedDoctorId })
      });
      setAudioBlob(null);
      setUploadFile(null);
      setIsEditorOpen(false);
      setMode("text");
    }
  };

  const startNewNote = () => {
    if (!visitId) {
      toast.error("Select a visit first");
      return;
    }
    setEditingId(null);
    setMode("text");
    setSelectedDoctorId(currentVisit?.doctor_id || "");
    setIsEditorOpen(true);
    editorRef.current?.setContent("<p></p>");
    setAudioBlob(null);
    setUploadFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setSelectedDoctorId("");
    setIsEditorOpen(false);
    editorRef.current?.setContent("<p></p>");
    setAudioBlob(null);
    setUploadFile(null);
  };

  const handlePrint = (note: typeof notes[0]) => {
    const printContent = note.editor_notes || note.transcription || "No content";
    const noteDate = note.createdAt ? formatDate(note.createdAt) : "N/A";

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

      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    }
  };

  const isSaving = createNote.isPending || updateNote.isPending;

  if (!visitId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">No visit selected</p>
      </div>
    );
  }

  if (notesLoading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Header Bar - Similar to Prescription */}
      <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
            <FileText className="h-4 w-4 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Clinical Notes</span>
        </div>

        <div className="flex-1" />

        {/* Add New Note Button */}
        {!isEditorOpen && (
          <Button
            size="sm"
            onClick={startNewNote}
            className="h-8 text-xs"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Note
          </Button>
        )}
      </div>

      {/* Editor Section (shown when adding/editing) */}
      {isEditorOpen && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-muted/50 px-3 py-2 flex items-center justify-between border-b">
            <div className="flex items-center gap-2">
              {editingId && (
                <Badge variant="secondary" className="text-xs">
                  Editing
                </Badge>
              )}
              <FormFloatingSelect
                value={selectedDoctorId}
                onValueChange={setSelectedDoctorId}
                label="Doctor"
                options={doctors.map(d => ({
                  label: `${d.displayName} ${d.specialty ? `(${d.specialty})` : ''}`,
                  value: d.id
                }))}
                className="w-[200px]"
                triggerClassName="h-8 min-h-[32px] text-xs pt-2 pb-1 bg-background"
              />
            </div>
            <Button variant="ghost" size="sm" onClick={cancelEdit} className="h-7 w-7 p-0">
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="p-3 space-y-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as "text" | "dictate")}>
              <TabsList className="grid grid-cols-2 h-8">
                <TabsTrigger value="text" className="text-xs gap-1 h-7">
                  <Type className="h-3.5 w-3.5" /> Text
                </TabsTrigger>
                <TabsTrigger value="dictate" className="text-xs gap-1 h-7" disabled={!!activeNote}>
                  <Mic className="h-3.5 w-3.5" /> Audio
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text" className="mt-3">
                <MedicalNoteEditor ref={editorRef} />
              </TabsContent>

              <TabsContent value="dictate" className="mt-4 space-y-6 py-4 px-6 md:px-12">
                <DictationRecorder
                  onRecorded={(blob) => {
                    setAudioBlob(blob);
                    setUploadFile(null);
                  }}
                />
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-3 text-muted-foreground">or upload file</span>
                  </div>
                </div>

                <div className="group relative rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors p-8 text-center cursor-pointer">
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setUploadFile(file);
                      if (file) setAudioBlob(null);
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {!uploadFile ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Drop audio file here</p>
                        <p className="text-[10px] text-muted-foreground">Supports WAV, MP3, M4A, WebM, OGG</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                      <FileText className="h-3.5 w-3.5 text-blue-600" />
                      <span className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate max-w-[200px]">{uploadFile.name}</span>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={cancelEdit} className="h-8 text-xs">
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="h-8 text-xs"
              >
                {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
                {editingId ? "Update" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List - hidden when editor is open */}
      {!isEditorOpen && (
        notes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
            <AudioLines className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No clinical notes yet</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              Click "Add Note" to create your first note
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <div className="text-[11px] font-medium text-muted-foreground">
              {notes.length} note{notes.length !== 1 ? "s" : ""}
            </div>
            <Accordion type="multiple" className="space-y-2">
              {notes.map((note) => {
                const isAudio = note.notes_type === "audio";
                const isActive = editingId === note.cn_id;
                const doctorName = note.doctor ? note.doctor.displayName : "Unknown Doctor";

                return (
                  <AccordionItem
                    key={note.cn_id}
                    value={String(note.cn_id)}
                    className={`border rounded-lg px-3 transition-colors ${isActive
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-muted/30"
                      }`}
                  >
                    <AccordionTrigger className="hover:no-underline py-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${isAudio
                          ? "bg-purple-100 dark:bg-purple-900/50"
                          : "bg-blue-100 dark:bg-blue-900/50"
                          }`}>
                          {isAudio ? (
                            <Mic className="h-3.5 w-3.5 text-purple-600" />
                          ) : (
                            <Type className="h-3.5 w-3.5 text-blue-600" />
                          )}
                        </div>

                        <span className="text-xs font-medium text-foreground ml-1">
                          {doctorName}
                        </span>
                        <span className="text-muted-foreground/40 text-[10px] mx-1.5">|</span>
                        <Badge
                          variant={isAudio ? "secondary" : "default"}
                          className="px-1.5 py-0 text-[9px]"
                        >
                          {isAudio ? "Audio" : "Text"}
                        </Badge>
                        <span className="text-muted-foreground/40 text-[10px] mx-1.5">|</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDate(note.createdAt)}
                        </span>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 ml-auto mr-2 shrink-0">
                          {/* Print Button */}
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
                          {/* Edit Button */}
                          <div
                            role="button"
                            tabIndex={0}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingId(note.cn_id);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && setEditingId(note.cn_id)}
                            title="Edit"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </div>
                          {/* Delete Button */}
                          <div
                            role="button"
                            tabIndex={0}
                            className="h-7 w-7 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-red-100 dark:hover:bg-red-900/50 text-destructive cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              deleteNote.mutate(note.cn_id);
                            }}
                            onKeyDown={(e) => e.key === 'Enter' && deleteNote.mutate(note.cn_id)}
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
                            '<p class="text-muted-foreground">No content</p>',
                        }}
                      />
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </div>
        ))}
    </div>
  );
}

export default PatientVisitClinicalNotesPage;
