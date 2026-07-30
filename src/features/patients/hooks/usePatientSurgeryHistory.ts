import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { patientSurgeryHistoryService } from '../services/patientSurgeryHistory.service';
import type { SyncPatientSurgeryHistoryPayload } from '../types/patientSurgeryHistory.types';
import { toast } from '@/lib/toast';

export const PATIENT_SURGERY_HISTORY_QUERY_KEY = (patientId: number) => ['patientSurgeryHistory', patientId];

export function usePatientSurgeryHistory(patientId: number) {
  return useQuery({
    queryKey: PATIENT_SURGERY_HISTORY_QUERY_KEY(patientId),
    queryFn: () => patientSurgeryHistoryService.getByPatientId(patientId),
    enabled: !!patientId,
  });
}

export function useSyncPatientSurgeryHistory(patientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payloads: SyncPatientSurgeryHistoryPayload[]) => patientSurgeryHistoryService.sync(patientId, payloads),
    onSuccess: () => {
      toast.success('Patient surgical history updated successfully');
      queryClient.invalidateQueries({ queryKey: PATIENT_SURGERY_HISTORY_QUERY_KEY(patientId) });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update patient surgical history');
    },
  });
}
