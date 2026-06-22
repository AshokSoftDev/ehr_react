import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  Save,
  Stethoscope,
  User,
} from "lucide-react";
import type { VisitItem } from "@/features/visits/types/visit.types";
import { useClinicalNotes, useUpdateClinicalNote } from "@/features/visits/hooks/useClinicalNotes";
import MedicalNoteEditor from "@/features/patients/components/MedicalNoteEditor";
import { toast } from "@/lib/toast";

const formatDate = (dt?: string | Date) =>
  dt ? new Date(dt).toLocaleDateString() : "";

interface EditClinicalNotePanelProps {
  visit: VisitItem;
  noteId: number;
  onBack: () => void;
  onComplete: () => void;
}

type MedicalNoteEditorHandle = {
  getContent: () => string;
  setContent: (html: string) => void;
};

export function EditClinicalNotePanel({
  visit,
  noteId,
  onBack,
  onComplete,
}: EditClinicalNotePanelProps) {
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<MedicalNoteEditorHandle>(null);
  const [initialContentSet, setInitialContentSet] = useState(false);

  const { data: notes = [] } = useClinicalNotes(visit.visit_id);
  const updateNote = useUpdateClinicalNote(visit.visit_id);

  // Find the note to edit
  const note = notes.find((n) => n.cn_id === noteId);

  // Set initial content once when note is loaded
  useEffect(() => {
    if (note && editorRef.current && !initialContentSet) {
      const content = note.editor_notes || note.transcription || "";
      if (content) {
        editorRef.current.setContent(content);
        setInitialContentSet(true);
      }
    }
  }, [note, initialContentSet]);

  const handleSave = async () => {
    if (!note) return;

    setIsSaving(true);
    try {
      const content = editorRef.current?.getContent() || "";
      if (!content || content.trim() === "") {
        toast.error("Please enter clinical notes");
        setIsSaving(false);
        return;
      }

      await updateNote.mutateAsync({
        noteId: note.cn_id,
        payload: { editor_notes: content },
      });

      toast.success("Clinical note updated!");
      onComplete();
    } catch {
      toast.error("Failed to update clinical note");
    } finally {
      setIsSaving(false);
    }
  };

  if (!note) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Edit Clinical Note</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel - Visit Details */}
        <Card className="w-[280px] shrink-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {visit.patient?.firstName} {visit.patient?.lastName}
                </p>
                {visit.patient?.mrn && (
                  <Badge variant="secondary" className="text-[10px] mt-0.5">
                    MRN: {visit.patient.mrn}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{formatDate(visit.visit_date)}</span>
              </div>

              {visit.doctor?.displayName && (
                <div className="flex items-center gap-2 text-xs">
                  <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-medium truncate">{visit.doctor.displayName}</span>
                </div>
              )}

              {visit.visit_type && (
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{visit.visit_type}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Text Editor Only */}
        <div className="flex-1 overflow-auto">
          <Card className="h-full flex flex-col">
            <CardContent className="p-4 flex-1 flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200/50 dark:border-blue-800/50 mb-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 dark:text-blue-200">Edit Clinical Note</p>
                    <p className="text-[10px] text-blue-600 dark:text-blue-400">
                      {note.notes_type === "audio" ? "Transcription from audio" : "Text note"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Editor */}
              <div className="flex-1 min-h-[300px]">
                <MedicalNoteEditor ref={editorRef} />
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-3 mt-3 border-t">
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="min-w-[140px]">
                  {isSaving ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default EditClinicalNotePanel;
