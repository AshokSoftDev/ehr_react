import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientSocialHistoryService } from '../services/patientSocialHistory.service';
import type { SyncPatientSocialHistoryPayload } from '../types/patientSocialHistory.types';
import { toast } from '@/lib/toast';

export const PATIENT_SOCIAL_HISTORY_QUERY_KEY = (patientId: number) => ['patientSocialHistory', patientId];

export function usePatientSocialHistory(patientId: number) {
  return useQuery({
    queryKey: PATIENT_SOCIAL_HISTORY_QUERY_KEY(patientId),
    queryFn: () => patientSocialHistoryService.getByPatientId(patientId),
    enabled: Boolean(patientId && !isNaN(patientId)),
  });
}

export function useSyncPatientSocialHistory(patientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payloads: SyncPatientSocialHistoryPayload[]) => 
      patientSocialHistoryService.sync(patientId, payloads),
    onSuccess: () => {
      toast.success('Patient social history updated successfully');
      queryClient.invalidateQueries({ queryKey: PATIENT_SOCIAL_HISTORY_QUERY_KEY(patientId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update patient social history');
    },
  });
}
