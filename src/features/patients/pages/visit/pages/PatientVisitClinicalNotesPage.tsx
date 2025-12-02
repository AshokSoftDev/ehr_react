import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AudioLines,
  ArrowLeft,
  CalendarDays,
  Edit3,
  Loader2,
  Mic,
  Save,
  Trash2,
  Type,
} from "lucide-react";
import MedicalNoteEditor from "@/features/patients/components/MedicalNoteEditor";
import DictationRecorder from "@/features/patients/components/DictationRecorder";
import { patientService } from "@/features/patients/services/patient.service";
import { visitService } from "@/features/visits/services/visit.service";
import type { VisitItem } from "@/features/visits/types/visit.types";
import {
  useClinicalNotes,
  useCreateClinicalNote,
  useDeleteClinicalNote,
  useUpdateClinicalNote,
} from "@/features/visits/hooks/useClinicalNotes";
import { toast } from "@/lib/toast";

const stripHtml = (html?: string | null) =>
  (html || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const formatDate = (dt?: string) => (dt ? new Date(dt).toLocaleString() : "");

export function PatientVisitClinicalNotesPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const editorRef = useRef<{ getContent: () => string; setContent: (html: string) => void } | null>(null);
  const [mode, setMode] = useState<"text" | "dictate">("text");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
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
    queryFn: () => visitService.list(visitFilters as any),
    enabled: !!visitFilters,
  });

  const visits: VisitItem[] = visitsData?.visits ?? visitsData ?? [];
  const selectedVisit = visits.find((v) => v.visit_id === selectedVisitId) || null;

  const { data: notes = [], isLoading: notesLoading, isFetching: notesFetching } = useClinicalNotes(
    selectedVisitId || undefined
  );
  const createNote = useCreateClinicalNote(selectedVisitId || undefined);
  const updateNote = useUpdateClinicalNote(selectedVisitId || undefined);
  const deleteNote = useDeleteClinicalNote(selectedVisitId || undefined);

  const activeNote = useMemo(
    () => notes.find((n) => n.cn_id === editingId) || null,
    [editingId, notes]
  );

  useEffect(() => {
    if (activeNote) {
      const seed = activeNote.editor_notes || activeNote.transcription || "<p></p>";
      editorRef.current?.setContent(seed);
      setMode("text");
    } else {
      editorRef.current?.setContent("<p></p>");
    }
    setAudioBlob(null);
    setUploadFile(null);
  }, [activeNote]);

  const handleSelectVisit = (visitId: number) => {
    setSelectedVisitId(visitId);
    const next = new URLSearchParams(searchParams);
    next.set("visitId", String(visitId));
    next.set("tab", "notes");
    setSearchParams(next, { replace: true });
    setEditingId(null);
    editorRef.current?.setContent("<p></p>");
    setMode("text");
  };

  const handleSave = async () => {
    if (!selectedVisitId) {
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
        await updateNote.mutateAsync({ noteId: editingId, payload: { editor_notes: html } });
      } else {
        await createNote.mutateAsync({ notes_type: "text", editor_notes: html });
      }
      setEditingId(null);
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
      await createNote.mutateAsync({ notes_type: "audio", file });
      setAudioBlob(null);
      setUploadFile(null);
      setMode("text");
    }
  };

  const startNewNote = (nextMode: "text" | "dictate") => {
    if (!selectedVisitId) {
      toast.error("Select a visit first");
      return;
    }
    setEditingId(null);
    setMode(nextMode);
    editorRef.current?.setContent("<p></p>");
    if (nextMode === "dictate") {
      setAudioBlob(null);
      setUploadFile(null);
    }
  };

  const isSaving = createNote.isPending || updateNote.isPending;
  const isDeleting = deleteNote.isPending;
  const emptyNotes = !notesLoading && notes.length === 0;

  const VisitsList = (
    <div className="rounded-xl border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground">Visits</p>
        <span className="text-xs text-muted-foreground">{visits.length ? `${visits.length} total` : ""}</span>
      </div>
      {visitsLoading ? (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-48 rounded-lg" />
          ))}
        </div>
      ) : visits.length === 0 ? (
        <div className="text-sm text-muted-foreground">No visits found for this patient.</div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {visits.map((v) => {
            const active = v.visit_id === selectedVisitId;
            const date = new Date(v.visit_date).toLocaleDateString();
            return (
              <button
                key={v.visit_id}
                onClick={() => handleSelectVisit(v.visit_id)}
                className={`rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? "border-primary bg-primary/10 text-foreground shadow-sm ring-1 ring-primary/30"
                    : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/50 hover:shadow"
                }`}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {date}
                  </span>
                  <Badge variant={v.status === 1 ? "default" : "secondary"} className="text-[10px]">
                    {v.status === 1 ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <div className="font-semibold leading-tight">{v.visit_type}</div>
                  {v.doctor?.displayName && (
                    <span className="text-xs text-muted-foreground">{v.doctor.displayName}</span>
                  )}
                </div>
                {v.reason_for_visit && (
                  <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                    Reason: {v.reason_for_visit}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {!selectedVisit && (
        <Card className="border-border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold">Visits</CardTitle>
            {visitsLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          </CardHeader>
          <CardContent>{VisitsList}</CardContent>
        </Card>
      )}

      {selectedVisit && (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_1fr]">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedVisitId(null)}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to visits
                </Button>
                <CardTitle className="text-lg font-semibold">Visits & Notes</CardTitle>
              </div>
              {notesFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
            </CardHeader>
            <CardContent className="space-y-4">
              {VisitsList}

              <div className="space-y-3">
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary">Visit #{selectedVisit.visit_id}</Badge>
                    <span>{new Date(selectedVisit.visit_date).toLocaleString()}</span>
                    {selectedVisit.visit_type && <span>Type: {selectedVisit.visit_type}</span>}
                    {selectedVisit.reason_for_visit && <span>Reason: {selectedVisit.reason_for_visit}</span>}
                  </div>
                </div>
                {notesLoading ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-8 w-20" />
                        </div>
                        <Skeleton className="mt-3 h-3 w-3/4" />
                        <Skeleton className="mt-2 h-3 w-2/3" />
                      </div>
                    ))}
                  </div>
                ) : emptyNotes ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center shadow-inner">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <AudioLines className="h-5 w-5" />
                    </div>
                    <p className="text-base font-medium">No clinical notes yet</p>
                    <p className="text-sm text-muted-foreground">
                      Start with a structured text note or dictate to transcribe automatically.
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="max-h-[520px] pr-2">
                    <div className="space-y-2">
                      {notes.map((note) => {
                        const snippet = stripHtml(note.editor_notes) || stripHtml(note.transcription) || "No content yet.";
                        const isAudio = note.notes_type === "audio";
                        return (
                          <div
                            key={note.cn_id}
                            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
                          >
                            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/60 via-secondary/60 to-primary/60 opacity-70" />
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={isAudio ? "secondary" : "default"} className="rounded-full px-2 py-0.5">
                                    {isAudio ? "Dictation" : "Text"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{formatDate(note.createdAt)}</span>
                                </div>
                                <p className="mt-2 line-clamp-2 text-sm text-foreground">{snippet}</p>
                                {isAudio && note.transcription && (
                                  <p className="mt-1 text-xs text-muted-foreground">Transcribed</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8"
                                  onClick={() => setEditingId(note.cn_id)}
                                  aria-label="Edit note"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-8 w-8 text-destructive"
                                  disabled={isDeleting}
                                  onClick={() => deleteNote.mutate(note.cn_id)}
                                  aria-label="Delete note"
                                >
                                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-lg font-semibold">
                  {editingId ? "Edit clinical note" : mode === "dictate" ? "Dictate note" : "Write clinical note"}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  {editingId ? "Editing" : "New"}
                </Badge>
                <Button size="sm" variant="secondary" onClick={() => startNewNote("text")}>
                  New note
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={mode} onValueChange={(v) => setMode(v as "text" | "dictate")}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="text" className="flex items-center gap-1">
                    <Type className="h-4 w-4" /> Text
                  </TabsTrigger>
                  <TabsTrigger value="dictate" className="flex items-center gap-1" disabled={!!activeNote}>
                    <Mic className="h-4 w-4" /> Dictate
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="mt-4">
                  <MedicalNoteEditor ref={editorRef} />
                </TabsContent>
                <TabsContent value="dictate" className="mt-4">
                  <div className="space-y-4">
                    <DictationRecorder
                      onRecorded={(blob) => {
                        setAudioBlob(blob);
                        setUploadFile(null);
                      }}
                    />
                    <Separator />
                    <div className="space-y-2 rounded-lg border border-dashed border-border bg-muted/30 p-3">
                      <p className="text-sm font-medium text-foreground">Or upload audio</p>
                      <p className="text-xs text-muted-foreground">Supported: wav, mp3, m4a, webm, ogg.</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setUploadFile(file);
                            if (file) setAudioBlob(null);
                          }}
                          className="text-sm"
                        />
                        {uploadFile && (
                          <Badge variant="secondary" className="gap-2">
                            {uploadFile.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              <Separator />
              <div className="flex flex-wrap items-center justify-end gap-2">
                {activeNote && (
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Cancel edit
                  </Button>
                )}
                <Button
                  className="gap-2"
                  onClick={handleSave}
                  disabled={isSaving || !selectedVisitId}
                >
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editingId ? "Update note" : mode === "dictate" ? "Save dictation" : "Save note"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default PatientVisitClinicalNotesPage;
