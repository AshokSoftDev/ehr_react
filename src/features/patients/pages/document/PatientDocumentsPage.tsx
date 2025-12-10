import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Eye,
  ExternalLink,
  File,
  FileText,
  Image,
  Loader2,
  User,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { patientService } from "@/features/patients/services/patient.service";
import { visitService } from "@/features/visits/services/visit.service";
import type { VisitItem } from "@/features/visits/types/visit.types";
import { useVisitDocuments } from "@/features/visits/hooks/useVisitDocuments";
import { visitDocumentService } from "@/features/visits/services/visitDocument.service";
import type { VisitDocument } from "@/features/visits/types/visitDocument.types";
import { useEffect } from "react";

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

/**
 * PatientDocumentsPage
 * Used in: /patient/:id/document
 * 
 * Read-only view of documents.
 * Shows visits list -> select visit -> view documents (read-only).
 * To edit, user is redirected to Visit page document tab.
 */
export function PatientDocumentsPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const navigate = useNavigate();
  const [selectedVisitId, setSelectedVisitId] = useState<number | null>(null);
  const [viewingDoc, setViewingDoc] = useState<VisitDocument | null>(null);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

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

  const { data: documents = [], isLoading: documentsLoading } = useVisitDocuments(
    selectedVisitId || undefined
  );

  // Load blob URL when viewing document
  useEffect(() => {
    if (viewingDoc && selectedVisitId) {
      setIsLoadingPreview(true);
      visitDocumentService.getFileBlob(selectedVisitId, viewingDoc.document_id)
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
  }, [viewingDoc, selectedVisitId]);

  const handleGoToEdit = () => {
    if (selectedVisitId) {
      navigate(`/main/patients/${patientId}/visit?tab=document&visitId=${selectedVisitId}`);
    }
  };

  const handleDownload = (doc: VisitDocument) => {
    if (!selectedVisitId) return;
    const url = visitDocumentService.getFileUrl(selectedVisitId, doc.document_id);
    window.open(url, "_blank");
  };

  // Visits List View
  if (!selectedVisit) {
    return (
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-blue-500" />
            <h2 className="text-sm font-semibold">Documents</h2>
          </div>
          {visitsLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
        </div>
        <CardContent className="p-3">
          <p className="text-xs text-muted-foreground mb-3">
            Select a visit to view its documents
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

  // Selected Visit Documents View (Read-Only)
  return (
    <>
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
            Add Documents
          </Button>
        </div>

        <CardContent className="p-3">
          {documentsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          ) : documents.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border bg-muted/20 p-6 text-center">
              <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium">No documents</p>
              <p className="text-xs text-muted-foreground mb-3">This visit has no documents yet</p>
              <Button variant="outline" size="sm" onClick={handleGoToEdit} className="h-8">
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                Go to Visit to Add
              </Button>
            </div>
          ) : (
            <ScrollArea className="max-h-[500px]">
              <div className="space-y-1.5 pr-1">
                <div className="text-[11px] font-medium text-muted-foreground mb-2">
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
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

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
    </>
  );
}

export default PatientDocumentsPage;
