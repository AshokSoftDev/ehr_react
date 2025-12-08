import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type {
  CreatePrescriptionPayload,
  UpdatePrescriptionPayload,
  BulkCreatePrescriptionPayload,
  BulkUpdatePrescriptionPayload,
  BulkDeletePrescriptionPayload,
} from '../types/prescription.types';
import { prescriptionService } from '../services/prescription.service';

const key = (visitId: number) => ['prescriptions', visitId];

export function usePrescriptions(visitId?: number) {
  return useQuery({
    queryKey: visitId ? key(visitId) : ['prescriptions'],
    queryFn: () => prescriptionService.list(visitId as number),
    enabled: !!visitId,
  });
}

export function useCreatePrescription(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePrescriptionPayload) => {
      if (!visitId) throw new Error('visitId is required');
      return prescriptionService.create(visitId, payload);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Prescription saved');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save');
    },
  });
}

// Bulk create multiple prescriptions
export function useBulkCreatePrescription(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkCreatePrescriptionPayload) => {
      if (!visitId) throw new Error('visitId is required');
      return prescriptionService.bulkCreate(visitId, payload);
    },
    onSuccess: (data) => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success(`${data.length} prescriptions created`);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save prescriptions');
    },
  });
}

// Bulk update multiple prescriptions
export function useBulkUpdatePrescription(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkUpdatePrescriptionPayload) => {
      if (!visitId) throw new Error('visitId is required');
      return prescriptionService.bulkUpdate(visitId, payload);
    },
    onSuccess: (data) => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success(`${data.length} prescriptions updated`);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update prescriptions');
    },
  });
}

// Bulk delete multiple prescriptions
export function useBulkDeletePrescription(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: BulkDeletePrescriptionPayload) => {
      if (!visitId) throw new Error('visitId is required');
      return prescriptionService.bulkDelete(visitId, payload);
    },
    onSuccess: (data) => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success(`${data.length} prescriptions deleted`);
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete prescriptions');
    },
  });
}

export function useUpdatePrescription(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      prescriptionId,
      payload,
    }: {
      prescriptionId: number;
      payload: UpdatePrescriptionPayload;
    }) => {
      if (!visitId) throw new Error('visitId is required');
      return prescriptionService.update(visitId, prescriptionId, payload);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Prescription updated');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update');
    },
  });
}

export function useDeletePrescription(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prescriptionId: number) => {
      if (!visitId) throw new Error('visitId is required');
      return prescriptionService.remove(visitId, prescriptionId);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('Prescription removed');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete');
    },
  });
}

