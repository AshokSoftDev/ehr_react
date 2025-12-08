import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { UpdateDocumentPayload } from '../types/visitDocument.types';
import { visitDocumentService } from '../services/visitDocument.service';

const key = (visitId: number) => ['visit-documents', visitId];

export function useVisitDocuments(visitId?: number) {
  return useQuery({
    queryKey: visitId ? key(visitId) : ['visit-documents'],
    queryFn: () => visitDocumentService.list(visitId as number),
    enabled: !!visitId,
  });
}

export function useUploadDocument(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, documentTypeId, description }: { file: File; documentTypeId: number; description?: string }) => {
      if (!visitId) throw new Error('visitId is required');
      return visitDocumentService.upload(visitId, file, documentTypeId, description);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Document uploaded successfully');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload document');
    },
  });
}

export function useUpdateDocument(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, payload }: { documentId: number; payload: UpdateDocumentPayload }) => {
      if (!visitId) throw new Error('visitId is required');
      return visitDocumentService.update(visitId, documentId, payload);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Document updated');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update document');
    },
  });
}

export function useDeleteDocument(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => {
      if (!visitId) throw new Error('visitId is required');
      return visitDocumentService.remove(visitId, documentId);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Document deleted');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete document');
    },
  });
}
