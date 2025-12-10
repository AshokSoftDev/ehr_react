import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { CreateDentalHPIPayload, UpdateDentalHPIPayload } from '../types/dentalHpi.types';
import { dentalHpiService } from '../services/dentalHpi.service';

const key = (visitId: number) => ['dental-hpi', visitId];

export function useDentalHpiList(visitId?: number) {
  return useQuery({
    queryKey: visitId ? key(visitId) : ['dental-hpi'],
    queryFn: () => dentalHpiService.list(visitId as number),
    enabled: !!visitId,
  });
}

export function useDentalHpiOne(visitId?: number, hpiId?: number) {
  return useQuery({
    queryKey: visitId && hpiId ? [...key(visitId), hpiId] : ['dental-hpi'],
    queryFn: () => dentalHpiService.getOne(visitId as number, hpiId as number),
    enabled: !!visitId && !!hpiId,
  });
}

export function useCreateDentalHpi(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDentalHPIPayload) => {
      if (!visitId) throw new Error('visitId is required');
      return dentalHpiService.create(visitId, payload);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('HPI entry saved');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save HPI entry');
    },
  });
}

export function useUpdateDentalHpi(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hpiId, payload }: { hpiId: number; payload: UpdateDentalHPIPayload }) => {
      if (!visitId) throw new Error('visitId is required');
      return dentalHpiService.update(visitId, hpiId, payload);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('HPI entry updated');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update HPI entry');
    },
  });
}

export function useDeleteDentalHpi(visitId?: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hpiId: number) => {
      if (!visitId) throw new Error('visitId is required');
      return dentalHpiService.remove(visitId, hpiId);
    },
    onSuccess: () => {
      if (visitId) qc.invalidateQueries({ queryKey: key(visitId) });
      toast.success('HPI entry removed');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete HPI entry');
    },
  });
}
