import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FileText,
  Upload,
  Trash2,
  Download,
  Image,
  File,
  Loader2,
  Plus,
  Eye,
} from "lucide-react";
import { useVisitDocuments, useUploadDocument, useDeleteDocument } from "@/features/visits/hooks/useVisitDocuments";
import type { VisitDocument } from "@/features/visits/types/visitDocument.types";
import { visitDocumentService } from "@/features/visits/services/visitDocument.service";
import { useDocumentTypes, useCreateDocumentType } from "@/features/masters/hooks/useDocumentTypes";
import { DocumentTypeFormSheet, type DocumentTypeFormValues } from "@/features/document-types/components/DocumentTypeFormSheet";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

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
    return <Image className="h-5 w-5 text-green-500" />;
  }
  if (mimeType === "application/pdf") {
    return <FileText className="h-5 w-5 text-red-500" />;
  }
  return <File className="h-5 w-5 text-gray-500" />;
}

export function PatientVisitDocumentPage() {
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get("visitId") ? Number(searchParams.get("visitId")) : null;

  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [showDocTypeSheet, setShowDocTypeSheet] = useState(false);
  const [docTypeSelectOpen, setDocTypeSelectOpen] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<VisitDocument | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDocType, setSelectedDocType] = useState<{ id: number; name: string } | null>(null);
  const [documentToDelete, setDocumentToDelete] = useState<VisitDocument | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load blob URL when viewing document
  useEffect(() => {
    if (viewingDoc && visitId) {
      setIsLoadingPreview(true);
      visitDocumentService.getFileBlob(visitId, viewingDoc.document_id)
        .then(url => setBlobUrl(url))
        .catch(err => console.error('Failed to load file:', err))
        .finally(() => setIsLoadingPreview(false));
    } else {
      // Cleanup blob URL when dialog closes
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingDoc, visitId]);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    defaultValues: { document_name: "", description: "" },
  });

  const { data: documents = [], isLoading } = useVisitDocuments(visitId || undefined);
  const { data: documentTypes = [], refetch: refetchDocTypes } = useDocumentTypes();
  const uploadMutation = useUploadDocument(visitId || undefined);
  const deleteMutation = useDeleteDocument(visitId || undefined);
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
    setShowUploadSheet(false);
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

  const handleDelete = (doc: VisitDocument) => {
    setDocumentToDelete(doc);
  };

  const handleDownload = (doc: VisitDocument) => {
    if (!visitId) return;
    const url = visitDocumentService.getFileUrl(visitId, doc.document_id);
    window.open(url, "_blank");
  };

  const handleDocTypeChange = (value: string) => {
    const docType = documentTypes.find(t => String(t.document_type_id) === value);
    if (docType) {
      setSelectedDocType({ id: docType.document_type_id, name: docType.type_name });
    }
  };

  const handleCreateDocType = async (values: DocumentTypeFormValues) => {
    const result = await createDocTypeMutation.mutateAsync(values);
    await refetchDocTypes();
    // Auto-select the newly created type
    if (result) {
      setSelectedDocType({ id: result.document_type_id, name: result.type_name });
    }
    setShowDocTypeSheet(false);
  };

  if (!visitId) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
        <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium">No visit selected</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with Add Document Button */}
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => setShowUploadSheet(true)}
          className="h-8 text-xs gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Document
        </Button>
      </div>

      {/* Upload Sheet */}
      <Sheet open={showUploadSheet} onOpenChange={setShowUploadSheet}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader className="pb-4 border-b">
            <SheetTitle className="text-xl font-semibold">Upload Document</SheetTitle>
          </SheetHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpload)} className="space-y-5 p-4 pt-6">
              <FormFloatingInput
                control={form.control}
                name="document_name"
                label="Document Name *"
              />

              {/* Document Type Floating Select */}
              <div className="relative group">
                <label
                  className={cn(
                    "pointer-events-none absolute left-3 z-10 px-1 text-muted-foreground rounded-sm",
                    "transition-[background-color,color,transform,top] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "bg-background/0 group-focus-within:bg-background/100",
                    !selectedDocType
                      ? "top-1/2 -translate-y-1/2"
                      : "top-0 -translate-y-1/2 text-xs bg-card",
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

              <FormFloatingInput
                control={form.control}
                name="description"
                label="Description (Optional)"
              />

              {/* File Input */}
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
                <Button
                  type="submit"
                  disabled={!selectedFile || !selectedDocType || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Upload
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      {/* Document Type Create Sheet */}
      <DocumentTypeFormSheet
        open={showDocTypeSheet}
        onOpenChange={setShowDocTypeSheet}
        onSubmit={handleCreateDocType}
      />

      {/* Documents List */}
      {documents.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center">
          <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">No documents yet</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Click "Add Document" to upload files
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="text-[11px] font-medium text-muted-foreground">
            {documents.length} document{documents.length !== 1 ? "s" : ""}
          </div>
          {documents.map((doc) => (
            <div
              key={doc.document_id}
              className="flex items-center gap-2.5 p-2.5 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              {/* File Icon */}
              <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
                {getFileIcon(doc.mime_type)}
              </div>

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-xs font-medium truncate">{doc.file_name}</p>
                  <span className="px-1.5 py-0.5 text-[9px] font-medium rounded bg-primary/10 text-primary shrink-0">
                    {doc.documentType?.type_name || 'Unknown'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                  <span>{formatFileSize(doc.file_size)}</span>
                  <span>•</span>
                  <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                  {doc.description && (
                    <>
                      <span>•</span>
                      <span className="truncate">{doc.description}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewingDoc(doc)}
                  className="h-7 w-7 p-0"
                  title="View"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  className="h-7 w-7 p-0"
                  title="Download"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(doc)}
                  disabled={deleteMutation.isPending}
                  className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  title="Delete"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Document Preview Dialog */}
      <Dialog open={!!viewingDoc} onOpenChange={(open) => !open && setViewingDoc(null)}>
        <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] flex flex-col">
          <DialogHeader className="pb-2 border-b">
            <DialogTitle className="flex items-center gap-2">
              {viewingDoc && getFileIcon(viewingDoc.mime_type)}
              <span className="truncate">{viewingDoc?.file_name}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto min-h-0">
            {isLoadingPreview ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : viewingDoc && blobUrl && (
              viewingDoc.mime_type.startsWith("image/") ? (
                <img
                  src={blobUrl}
                  alt={viewingDoc.file_name}
                  className="max-w-full h-auto mx-auto rounded-md"
                />
              ) : viewingDoc.mime_type === "application/pdf" ? (
                <iframe
                  src={blobUrl}
                  className="w-full h-[70vh] rounded-md border"
                  title={viewingDoc.file_name}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground">
                  <File className="h-12 w-12 mb-2" />
                  <p>Preview not available for this file type</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(viewingDoc)}
                    className="mt-4 gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download File
                  </Button>
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <ConfirmDeleteDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
        onConfirm={() => {
          if (documentToDelete) {
            deleteMutation.mutateAsync(documentToDelete.document_id);
            setDocumentToDelete(null);
          }
        }}
        title="Delete Document"
        description={
          documentToDelete ? (
            <span>
              Are you sure you want to delete{" "}
              <span className="font-bold">{documentToDelete.file_name}</span>?
              <br />
              <span className="text-muted-foreground text-xs mt-0.5 block">
                This action cannot be undone.
              </span>
            </span>
          ) : (
             "Are you sure you want to delete this document?"
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default PatientVisitDocumentPage;
