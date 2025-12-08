import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { CreatePrescriptionTemplatePayload } from '../types/prescription.types';
import { prescriptionTemplateService, type BulkCreateTemplatePayload } from '../services/prescriptionTemplate.service';

const key = ['prescription-templates'];

export function usePrescriptionTemplates(templateId?: number, search?: string, enabled: boolean = true) {
  return useQuery({
    queryKey: templateId ? [...key, templateId] : search ? [...key, 'search', search] : key,
    queryFn: () => prescriptionTemplateService.list(templateId, search),
    enabled,
  });
}

export function useCreatePrescriptionTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePrescriptionTemplatePayload) => {
      return prescriptionTemplateService.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Template saved');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save template');
    },
  });
}

export function useBulkCreatePrescriptionTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCreateTemplatePayload) => {
      return prescriptionTemplateService.bulkCreate(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Template saved successfully');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save template');
    },
  });
}

export function useDeletePrescriptionTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tempId: number) => {
      return prescriptionTemplateService.remove(tempId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Template removed');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete template');
    },
  });
}
