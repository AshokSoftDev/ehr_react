import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { Form } from "@/components/ui/form";
import { FileText, Image as ImageIcon, File, Upload, Loader2, Plus } from "lucide-react";
import { useUploadPatientDocument } from "@/features/patients/hooks/usePatientDocuments";
import { useDocumentTypes, useCreateDocumentType } from "@/features/masters/hooks/useDocumentTypes";
import { DocumentTypeFormSheet, type DocumentTypeFormValues } from "@/features/document-types/components/DocumentTypeFormSheet";

const uploadFormSchema = z.object({
  document_name: z.string().min(1, "Document name is required"),
  description: z.string().optional(),
});

type UploadFormValues = z.infer<typeof uploadFormSchema>;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) {
    return <ImageIcon className="h-5 w-5 text-green-500" />;
  }
  if (mimeType === "application/pdf") {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
}

interface PatientDocumentUploadSheetProps {
  patientId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PatientDocumentUploadSheet({ patientId, open, onOpenChange }: PatientDocumentUploadSheetProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<{ id: number; name: string } | null>(null);
  const [showDocTypeSheet, setShowDocTypeSheet] = useState(false);
  const [docTypeSelectOpen, setDocTypeSelectOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: { document_name: "", description: "" },
  });

  const { data: documentTypes = [], refetch: refetchDocTypes } = useDocumentTypes();
  const uploadMutation = useUploadPatientDocument(patientId);
  const createDocTypeMutation = useCreateDocumentType();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/gif", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        alert("Only PDF and image files are allowed");
        return;
      }
      setSelectedFile(file);
      if (!form.getValues("document_name")) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        form.setValue("document_name", nameWithoutExt);
      }
    }
  };

  const resetForm = () => {
    setSelectedFile(null);
    setSelectedDocType(null);
    form.reset();
    onOpenChange(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async (values: UploadFormValues) => {
    if (!selectedFile || !selectedDocType) return;

    await uploadMutation.mutateAsync({
      file: selectedFile,
      documentTypeId: selectedDocType.id,
      description: `${values.document_name}${values.description ? ` - ${values.description}` : ""}`,
    });

    resetForm();
  };

  const handleDocTypeChange = (value: string) => {
    const docType = documentTypes.find((t) => String(t.document_type_id) === value);
    if (docType) {
      setSelectedDocType({ id: docType.document_type_id, name: docType.type_name });
    }
  };

  const handleCreateDocType = async (values: DocumentTypeFormValues) => {
    const result = await createDocTypeMutation.mutateAsync(values);
    await refetchDocTypes();
    if (result) {
      setSelectedDocType({ id: result.document_type_id, name: result.type_name });
    }
    setShowDocTypeSheet(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(val) => {
        if (!val) resetForm();
        else onOpenChange(true);
      }}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-xl font-semibold">Upload Document</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-5 p-4 pt-6">
              <FormFloatingInput control={form.control} name="document_name" label="Document Name *" />

              <div className="relative group">
                <label
                  className={cn(
                    "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                    "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "bg-background/0 group-focus-within:bg-background/100",
                    !selectedDocType ? "top-1/2 -translate-y-1/2" : "top-0 -translate-y-1/2 text-xs bg-card",
                    "group-focus-within:top-0 group-focus-within:-translate-y-1/2 group-focus-within:text-xs group-focus-within:bg-card"
                  )}
                >
                  Document Type *
                </label>
                <Select
                  value={selectedDocType ? String(selectedDocType.id) : ""}
                  onValueChange={handleDocTypeChange}
                  open={docTypeSelectOpen}
                  onOpenChange={setDocTypeSelectOpen}
                >
                  <SelectTrigger className="h-12 min-h-[48px] pt-3 pb-2 px-3 w-full border border-input bg-card rounded-md text-left">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 z-[9999]">
                    <div className="overflow-auto max-h-52">
                      {documentTypes.map((type) => (
                        <SelectItem key={type.document_type_id} value={String(type.document_type_id)}>
                          {type.type_name}
                        </SelectItem>
                      ))}
                    </div>
                    <div className="sticky bottom-0 border-t bg-background p-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDocTypeSelectOpen(false);
                          setShowDocTypeSheet(true);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        className="w-full flex items-center gap-2 px-2 py-2 text-sm text-primary hover:bg-muted rounded-sm transition-colors"
                      >
                        <Plus className="h-4 w-4" />
                        Add New Type
                      </button>
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <FormFloatingInput control={form.control} name="description" label="Description (Optional)" />

              <div className="space-y-2">
                <label className="text-sm font-medium">Select File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                >
                  {selectedFile ? (
                    <div className="flex items-center gap-3 justify-center">
                      {getFileIcon(selectedFile.type)}
                      <div className="text-left">
                        <p className="text-sm font-medium truncate max-w-[200px]">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to select file</p>
                      <p className="text-xs text-muted-foreground">PDF or Images (max 10MB)</p>
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!selectedFile || !selectedDocType || uploadMutation.isPending}>
                  {uploadMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <DocumentTypeFormSheet
        open={showDocTypeSheet}
        onOpenChange={setShowDocTypeSheet}
        onSubmit={handleCreateDocType}
      />
    </>
  );
}
