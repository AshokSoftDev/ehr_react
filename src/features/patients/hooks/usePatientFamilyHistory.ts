import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientFamilyHistoryService } from '../services/patientFamilyHistory.service';
import type { SyncPatientFamilyHistoryPayload } from '../types/patientFamilyHistory.types';
import { toast } from '@/lib/toast';

export const PATIENT_FAMILY_HISTORY_QUERY_KEY = (patientId: number) => ['patientFamilyHistory', patientId];

export function usePatientFamilyHistory(patientId: number) {
  return useQuery({
    queryKey: PATIENT_FAMILY_HISTORY_QUERY_KEY(patientId),
    queryFn: () => patientFamilyHistoryService.getByPatientId(patientId),
    enabled: Boolean(patientId && !isNaN(patientId)),
  });
}

export function useSyncPatientFamilyHistory(patientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payloads: SyncPatientFamilyHistoryPayload[]) => 
      patientFamilyHistoryService.sync(patientId, payloads),
    onSuccess: () => {
      toast.success('Patient family history updated successfully');
      queryClient.invalidateQueries({ queryKey: PATIENT_FAMILY_HISTORY_QUERY_KEY(patientId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update patient family history');
    },
  });
}
