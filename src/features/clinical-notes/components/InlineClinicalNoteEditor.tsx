import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
    FileText,
    Loader2,
    Mic,
    Save,
    Sparkles,
    Type,
    Upload,
    X,
} from "lucide-react";
import { useCreateClinicalNote, useCreateClinicalNoteWithSoap } from "@/features/visits/hooks/useClinicalNotes";
import DictationRecorder from "@/features/patients/components/DictationRecorder";
import MedicalNoteEditor, { MEDICAL_NOTE_PLACEHOLDER } from "@/features/patients/components/MedicalNoteEditor";
import { toast } from "@/lib/toast";

interface InlineClinicalNoteEditorProps {
    visitId: number;
    onNoteSaved: () => void;
    onCancel: () => void;
}

type MedicalNoteEditorHandle = {
    getContent: () => string;
    setContent: (html: string) => void;
};

export function InlineClinicalNoteEditor({
    visitId,
    onNoteSaved,
    onCancel,
}: InlineClinicalNoteEditorProps) {
    const [activeTab, setActiveTab] = useState<"text" | "audio">("text");
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isGeneratingSoap, setIsGeneratingSoap] = useState(false);

    const editorRef = useRef<MedicalNoteEditorHandle>(null);
    const createNote = useCreateClinicalNote(visitId);
    const createSoapNote = useCreateClinicalNoteWithSoap(visitId);

    const handleGenerateSoapNotes = async () => {
        const file = uploadFile
            ? uploadFile
            : audioBlob
                ? new File([audioBlob], `clinical-${Date.now()}.webm`, {
                    type: audioBlob.type || "audio/webm",
                })
                : null;

        if (!file) {
            toast.error("Record or upload audio first");
            return;
        }

        setIsGeneratingSoap(true);
        try {
            await createSoapNote.mutateAsync(file);
            toast.success("SOAP notes generated!");
            onNoteSaved();
        } catch {
            toast.error("Failed to generate SOAP notes");
        } finally {
            setIsGeneratingSoap(false);
        }
    };

    const handleSaveNote = async () => {
        setIsSaving(true);
        try {
            if (activeTab === "text") {
                const content = editorRef.current?.getContent()?.trim() || "";
                if (!content || content === MEDICAL_NOTE_PLACEHOLDER || content === '<p><br></p>' || content === '<p></p>') {
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
            onNoteSaved();
        } catch {
            toast.error("Failed to save clinical note");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header with tabs */}
            {/* <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Add Clinical Note</span>
                </div>
            </div> */}

            {/* Tabs */}
            <nav className="flex items-center gap-0 border-b border-border">
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
                group relative flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-all duration-150 whitespace-nowrap
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

            {/* Content */}
            {activeTab === "text" && (
                <MedicalNoteEditor ref={editorRef} className="min-h-[250px]" />
            )}

            {activeTab === "audio" && (
                <div className="grid grid-cols-2 gap-4">
                    {/* Recording Section */}
                    <div className="rounded-xl border border-border bg-gradient-to-b from-card to-muted/10 p-4">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-purple-500/20">
                                <Mic className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">Voice Recording</h3>
                                <p className="text-[10px] text-muted-foreground">Record using microphone</p>
                            </div>
                        </div>

                        <DictationRecorder
                            onRecorded={(blob) => {
                                setAudioBlob(blob);
                                setUploadFile(null);
                            }}
                        />

                        {audioBlob && (
                            <div className="mt-3 flex items-center gap-2 py-2 px-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">Recording ready</span>
                            </div>
                        )}
                    </div>

                    {/* Upload Section */}
                    <div className="group relative">
                        <div className={`
                            h-full rounded-xl border-2 border-dashed p-4 flex flex-col justify-center cursor-pointer transition-all duration-200
                            ${uploadFile
                                ? "border-blue-400 bg-blue-50/50 dark:bg-blue-950/20"
                                : "border-muted-foreground/20 hover:border-primary/40 hover:bg-muted/20"
                            }
                        `}>
                            <input
                                type="file"
                                accept="audio/*,.mp3,.wav,.m4a,.webm,.ogg,.aac,.flac"
                                onChange={(e) => {
                                    const file = e.target.files?.[0] || null;
                                    if (file) {
                                        // Check if file is audio type
                                        if (!file.type.startsWith('audio/')) {
                                            toast.error("Please upload an audio file only");
                                            e.target.value = '';
                                            return;
                                        }
                                        // Check file size (90MB max)
                                        const maxSize = 90 * 1024 * 1024; // 90MB in bytes
                                        if (file.size > maxSize) {
                                            toast.error("File size must be less than 90MB");
                                            e.target.value = '';
                                            return;
                                        }
                                        setUploadFile(file);
                                        setAudioBlob(null);
                                    }
                                }}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />

                            {!uploadFile ? (
                                <div className="text-center">
                                    <div className="h-10 w-10 mx-auto rounded-xl bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors mb-2">
                                        <Upload className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">Upload Audio</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">WAV, MP3, M4A, WebM, OGG (max 90MB)</p>
                                </div>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center shrink-0">
                                        <FileText className="h-4 w-4 text-blue-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground truncate">{uploadFile.name}</p>
                                        <p className="text-[10px] text-muted-foreground">{(uploadFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 shrink-0 text-muted-foreground hover:text-destructive"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setUploadFile(null);
                                        }}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-2 border-t">
                <Button variant="outline" size="sm" onClick={onCancel} disabled={isSaving}>
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                </Button>
                {activeTab === "text" && (
                    <Button onClick={handleSaveNote} disabled={isSaving} size="sm">
                        {isSaving ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <Save className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        Save Note
                    </Button>
                )}
                {activeTab === "audio" && (
                    <Button
                        variant="secondary"
                        size="sm"
                        className="bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700"
                        onClick={handleGenerateSoapNotes}
                        disabled={isGeneratingSoap || isSaving || (!audioBlob && !uploadFile)}
                    >
                        {isGeneratingSoap ? (
                            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        ) : (
                            <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                        )}
                        {isGeneratingSoap ? "Generating..." : "Generate SOAP Notes"}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default InlineClinicalNoteEditor;
