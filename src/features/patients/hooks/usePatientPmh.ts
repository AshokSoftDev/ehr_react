import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientPmhService } from '../services/patientPmh.service';
import type { SyncPatientPmhPayload } from '../types/patientPmh.types';
import { toast } from '@/lib/toast';

export const PATIENT_PMH_QUERY_KEY = (patientId: number) => ['patientPmh', patientId];

export function usePatientPmh(patientId: number) {
  return useQuery({
    queryKey: PATIENT_PMH_QUERY_KEY(patientId),
    queryFn: () => patientPmhService.getByPatientId(patientId),
    enabled: !!patientId,
  });
}

export function useSyncPatientPmh(patientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payloads: SyncPatientPmhPayload[]) => patientPmhService.sync(patientId, payloads),
    onSuccess: () => {
      toast.success('Patient PMH updated successfully');
      queryClient.invalidateQueries({ queryKey: PATIENT_PMH_QUERY_KEY(patientId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update patient PMH');
    },
  });
}
