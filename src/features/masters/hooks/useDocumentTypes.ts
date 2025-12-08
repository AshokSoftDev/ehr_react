import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { CreateDocumentTypePayload, UpdateDocumentTypePayload } from '../types/documentType.types';
import { documentTypeService } from '../services/documentType.service';

const key = ['document-types'];

export function useDocumentTypes(search?: string) {
  return useQuery({
    queryKey: [...key, search],
    queryFn: () => documentTypeService.list(search),
  });
}

export function useCreateDocumentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDocumentTypePayload) => documentTypeService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Document type created');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create document type');
    },
  });
}

export function useUpdateDocumentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateDocumentTypePayload }) =>
      documentTypeService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Document type updated');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update document type');
    },
  });
}

export function useDeleteDocumentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => documentTypeService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Document type deleted');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete document type');
    },
  });
}
