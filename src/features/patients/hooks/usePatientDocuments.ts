import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { UpdateDocumentPayload } from '@/features/visits/types/visitDocument.types';
import { patientDocumentService } from '../services/patientDocument.service';

const key = (patientId: number) => ['patient-documents', patientId];

export function usePatientDocuments(patientId?: number, filters?: { search?: string; dateFrom?: string; dateTo?: string }) {
  return useQuery({
    queryKey: patientId ? [...key(patientId), filters] : ['patient-documents', filters],
    queryFn: () => patientDocumentService.list(patientId as number, filters),
    enabled: !!patientId,
  });
}

export function useUploadPatientDocument(patientId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, documentTypeId, description }: { file: File; documentTypeId: number; description?: string }) => {
      if (!patientId) throw new Error('patientId is required');
      return patientDocumentService.upload(patientId, file, documentTypeId, description);
    },
    onSuccess: () => {
      if (patientId) qc.invalidateQueries({ queryKey: key(patientId) });
      toast.success('Document uploaded successfully');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to upload document');
    },
  });
}

export function useUpdatePatientDocument(patientId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentId, payload }: { documentId: number; payload: UpdateDocumentPayload }) => {
      if (!patientId) throw new Error('patientId is required');
      return patientDocumentService.update(patientId, documentId, payload);
    },
    onSuccess: () => {
      if (patientId) qc.invalidateQueries({ queryKey: key(patientId) });
      toast.success('Document updated');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update document');
    },
  });
}

export function useDeletePatientDocument(patientId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (documentId: number) => {
      if (!patientId) throw new Error('patientId is required');
      return patientDocumentService.remove(patientId, documentId);
    },
    onSuccess: () => {
      if (patientId) qc.invalidateQueries({ queryKey: key(patientId) });
      toast.success('Document deleted');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete document');
    },
  });
}
