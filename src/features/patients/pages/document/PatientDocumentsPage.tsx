import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarDays,
  Download,
  Eye,
  File,
  FileText,
  Image,
  Loader2,
  User,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { patientService } from "@/features/patients/services/patient.service";
import { usePatientDocuments, useDeletePatientDocument } from "@/features/patients/hooks/usePatientDocuments";
import { patientDocumentService } from "@/features/patients/services/patientDocument.service";
import { visitDocumentService } from "@/features/visits/services/visitDocument.service";
import { PatientDocumentUploadSheet } from "@/features/patients/components/PatientDocumentUploadSheet";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import type { VisitDocument } from "@/features/visits/types/visitDocument.types";

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

export function PatientDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const [viewingDoc, setViewingDoc] = useState<VisitDocument | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [showUploadSheet, setShowUploadSheet] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<VisitDocument | null>(null);

  useQuery({
    queryKey: ["patient", patientId],
    queryFn: () => patientService.getPatient(patientId),
    enabled: Number.isFinite(patientId) && patientId > 0,
  });

  const { data: patientDocuments = [], isLoading: patientDocumentsLoading } = usePatientDocuments(patientId);
  const deletePatientDocMutation = useDeletePatientDocument(patientId);

  // Load blob URL when viewing document
  useEffect(() => {
    if (viewingDoc) {
      setIsLoadingPreview(true);
      const promise = viewingDoc.visit_id 
        ? visitDocumentService.getFileBlob(viewingDoc.visit_id, viewingDoc.document_id)
        : patientDocumentService.getFileBlob(patientId, viewingDoc.document_id);

      promise
        .then(url => setBlobUrl(url))
        .catch(err => console.error('Failed to load file:', err))
        .finally(() => setIsLoadingPreview(false));
    } else {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
        setBlobUrl(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewingDoc, patientId]);

  const handleDownload = (doc: VisitDocument) => {
    const url = doc.visit_id
      ? visitDocumentService.getFileUrl(doc.visit_id, doc.document_id)
      : patientDocumentService.getFileUrl(patientId, doc.document_id);
    window.open(url, "_blank");
  };

  const handleDeletePatientDoc = (doc: VisitDocument) => {
    setDocumentToDelete(doc);
  };

  return (
    <div className="space-y-4">
      <Card className="border-border shadow-sm overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold">Documents</h2>
          </div>
          <Button size="sm" onClick={() => setShowUploadSheet(true)} className="h-7 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Document
          </Button>
        </div>
        <CardContent className="px-0">
          {patientDocumentsLoading ? (
            <div className="p-4 space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : patientDocuments.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/10 p-6 text-center m-4">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">No documents found for this patient.</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {patientDocuments.map((doc) => (
                <div key={doc.document_id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-2 group">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      {getFileIcon(doc.mime_type)}
                      <span className="font-semibold text-sm truncate max-w-[300px]">
                        {doc.description || doc.file_name}
                      </span>
                      <span className="text-xs text-muted-foreground">|</span>
                      <Badge variant="outline" className="text-[10px] uppercase font-semibold bg-primary/10 text-primary border-primary/20">
                        {doc.documentType?.type_name || 'Unknown'}
                      </Badge>
                      {doc.visit && (
                        <Badge variant="secondary" className="text-[10px] uppercase font-semibold">
                          Visit: {doc.visit.visit_type}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground">
                        {formatFileSize(doc.file_size)}
                      </span>
                      <span className="text-xs text-muted-foreground border-l pl-2 border-border/50">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-muted-foreground border-l pl-2 border-border/50 truncate max-w-[200px]">
                        {doc.file_name}
                      </span>
                      {doc.visit && doc.visit.doctor?.displayName && (
                        <span className="text-xs text-muted-foreground border-l pl-2 border-border/50 flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {doc.visit.doctor.displayName}
                        </span>
                      )}
                      {doc.visit && (
                        <span className="text-xs text-muted-foreground border-l pl-2 border-border/50 flex items-center gap-1">
                          <CalendarDays className="h-3 w-3" />
                          {new Date(doc.visit.visit_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 sm:self-start opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-1 border-l pl-3 border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setViewingDoc(doc)}
                        className="h-8 w-8 p-0 hover:bg-blue-50"
                        title="View Document"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(doc)}
                        className="h-8 w-8 p-0 hover:bg-green-50"
                        title="Download Document"
                      >
                        <Download className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePatientDoc(doc)}
                        disabled={deletePatientDocMutation.isPending}
                        className="h-8 w-8 p-0 hover:bg-red-50"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      <PatientDocumentUploadSheet
        patientId={patientId}
        open={showUploadSheet}
        onOpenChange={setShowUploadSheet}
      />

      {/* Delete Patient Document Confirmation */}
      <ConfirmDeleteDialog
        open={!!documentToDelete}
        onOpenChange={(open) => !open && setDocumentToDelete(null)}
        onConfirm={() => {
          if (documentToDelete) {
            deletePatientDocMutation.mutateAsync(documentToDelete.document_id);
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
        isDeleting={deletePatientDocMutation.isPending}
      />
      
      {/* Document Preview Dialog (for Patient Documents) */}
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
    </div>
  );
}
