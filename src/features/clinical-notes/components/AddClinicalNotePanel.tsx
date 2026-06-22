import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  Mic,
  Pill,
  Save,
  Stethoscope,
  Type,
  Upload,
  User,
} from "lucide-react";
import type { VisitItem } from "@/features/visits/types/visit.types";
import { useCreateClinicalNote } from "@/features/visits/hooks/useClinicalNotes";
import { useCreatePrescription } from "@/features/visits/hooks/usePrescriptions";
import DictationRecorder from "@/features/patients/components/DictationRecorder";
import MedicalNoteEditor from "@/features/patients/components/MedicalNoteEditor";
import { PrescriptionForm } from "@/features/patients/components/PrescriptionForm";
import type { CreatePrescriptionPayload } from "@/features/visits/types/prescription.types";
import { toast } from "@/lib/toast";

const formatDate = (dt?: string | Date) =>
  dt ? new Date(dt).toLocaleDateString() : "";

interface AddClinicalNotePanelProps {
  visit: VisitItem;
  onBack: () => void;
  onComplete: () => void;
}

type MedicalNoteEditorHandle = {
  getContent: () => string;
  setContent: (html: string) => void;
};

export function AddClinicalNotePanel({
  visit,
  onBack,
  onComplete,
}: AddClinicalNotePanelProps) {
  const [activeTab, setActiveTab] = useState<"text" | "audio">("text");
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [noteSaved, setNoteSaved] = useState(false);
  const [isPrescriptionSaving, setIsPrescriptionSaving] = useState(false);

  const editorRef = useRef<MedicalNoteEditorHandle>(null);

  const createNote = useCreateClinicalNote(visit.visit_id);
  const createPrescription = useCreatePrescription(visit.visit_id);

  const handleSaveNote = async () => {
    setIsSaving(true);
    try {
      if (activeTab === "text") {
        const content = editorRef.current?.getContent() || "";
        if (!content || content === "<h2>Clinical Note</h2><p><em>Click into the editor and start typing...</em></p>") {
          toast.error("Please enter clinical notes");
          setIsSaving(false);
          return;
        }
        await createNote.mutateAsync({ notes_type: "text", editor_notes: content });
      } else {
        const file = uploadFile
          ? uploadFile
          : audioBlob
            ? new File([audioBlob], `clinical-${Date.now()}.webm`, {
              type: audioBlob.type || "audio/webm",
            })
            : null;

        if (!file) {
          toast.error("Record or upload audio first");
          setIsSaving(false);
          return;
        }
        await createNote.mutateAsync({ notes_type: "audio", file });
      }
      toast.success("Clinical note saved!");
      setNoteSaved(true);
    } catch {
      toast.error("Failed to save clinical note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSavePrescription = async (data: CreatePrescriptionPayload) => {
    setIsPrescriptionSaving(true);
    try {
      await createPrescription.mutateAsync(data);
      toast.success("Prescription saved!");
      onComplete();
    } catch {
      toast.error("Failed to save prescription");
    } finally {
      setIsPrescriptionSaving(false);
    }
  };

  const handleSkipPrescription = () => {
    onComplete();
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">
          {noteSaved ? "Add Prescription" : "Add Clinical Notes"}
        </h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel - Visit Details */}
        <Card className="w-[280px] shrink-0">
          <CardHeader className="pb-2 pt-3 px-3">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold truncate">
                  {visit.patient?.firstName} {visit.patient?.lastName}
                </CardTitle>
                {visit.patient?.mrn && (
                  <Badge variant="secondary" className="text-[10px] mt-0.5">
                    MRN: {visit.patient.mrn}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-3 pb-3 pt-0">
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

              {visit.reason_for_visit && (
                <div className="pt-2 border-t mt-2">
                  <p className="text-[10px] text-muted-foreground mb-0.5">Reason</p>
                  <p className="text-xs line-clamp-2">{visit.reason_for_visit}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Notes/Prescription */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            {!noteSaved ? (
              /* Clinical Notes Input */
              <Card className="mr-2">
                <CardHeader className="pb-2 pt-3 px-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <CardTitle className="text-base">Clinical Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 pt-0">
                  {/* Custom Tabs - Left aligned below heading */}
                  <nav className="flex items-center gap-0 border-b border-border mb-4">
                    {[
                      { id: "text" as const, label: "Text", icon: Type },
                      { id: "audio" as const, label: "Audio", icon: Mic },
                    ].map(({ id, label, icon: Icon }) => {
                      const isActive = activeTab === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setActiveTab(id)}
                          className={`
                            group relative flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium transition-all duration-150 whitespace-nowrap
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

                  {activeTab === "text" && (
                    <MedicalNoteEditor ref={editorRef} className="min-h-[350px]" />
                  )}

                  {activeTab === "audio" && (
                    <div className="space-y-4">
                      {/* Modern Recording Section */}
                      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-violet-500/10 via-purple-500/10 to-fuchsia-500/10 p-4 border border-purple-200/50 dark:border-purple-800/50">
                        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
                        <div className="relative">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-8 w-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                              <Mic className="h-4 w-4 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">Voice Recording</p>
                              <p className="text-[10px] text-muted-foreground">Record clinical notes using your microphone</p>
                            </div>
                          </div>
                          <DictationRecorder
                            onRecorded={(blob) => {
                              setAudioBlob(blob);
                              setUploadFile(null);
                            }}
                          />
                          {audioBlob && (
                            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-xs font-medium text-green-700 dark:text-green-300">Recording ready</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Modern Upload Section */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-border" />
                        </div>
                        <div className="relative flex justify-center text-xs">
                          <span className="bg-background px-3 text-muted-foreground">or upload file</span>
                        </div>
                      </div>

                      <div className="group relative rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 transition-colors p-4 text-center cursor-pointer">
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
                        <div className="flex flex-col items-center gap-2">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                            <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Drop audio file here</p>
                            <p className="text-[10px] text-muted-foreground">Supports WAV, MP3, M4A, WebM, OGG</p>
                          </div>
                        </div>
                        {uploadFile && (
                          <div className="mt-3 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                            <FileText className="h-3.5 w-3.5 text-blue-600" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300 truncate max-w-[200px]">{uploadFile.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-3 mt-3">
                    <Button onClick={handleSaveNote} disabled={isSaving} size="sm" className="min-w-[140px]">
                      {isSaving ? (
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                      ) : (
                        <Save className="h-3.5 w-3.5 mr-1.5" />
                      )}
                      Save Clinical Note
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* Prescription Form - Matching Visit Prescription Design */
              <div className="space-y-3 mr-2">
                {/* Header Bar with gradient - matching visit prescription style */}
                <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Pill className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Add Prescription</p>
                      <p className="text-[10px] text-amber-600 dark:text-amber-400">Clinical note saved successfully</p>
                    </div>
                  </div>

                  <div className="flex-1" />

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSkipPrescription}
                    className="h-8 text-xs border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50"
                  >
                    Skip & Finish
                  </Button>
                </div>

                {/* Prescription Form Card */}
                <Card>
                  <CardContent className="p-4">
                    <PrescriptionForm
                      onSubmit={handleSavePrescription}
                      isSubmitting={isPrescriptionSaving}
                    />
                  </CardContent>
                </Card>
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}

export default AddClinicalNotePanel;

