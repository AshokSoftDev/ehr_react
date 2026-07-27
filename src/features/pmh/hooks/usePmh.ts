import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pmhService } from '../services/pmh.service';
import type { PmhPayload, PmhUpdatePayload } from '../types/pmh.types';
import { toast } from '@/lib/toast';

export const PMH_QUERY_KEY = ['pmhMaster'];

export function usePmh() {
  return useQuery({
    queryKey: PMH_QUERY_KEY,
    queryFn: () => pmhService.list(),
  });
}

export function useCreatePmh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PmhPayload) => pmhService.create(payload),
    onSuccess: () => {
      toast.success('PMH condition created successfully');
      queryClient.invalidateQueries({ queryKey: PMH_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create PMH condition');
    },
  });
}

export function useUpdatePmh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ pmhId, payload }: { pmhId: number; payload: PmhUpdatePayload }) => 
      pmhService.update(pmhId, payload),
    onSuccess: () => {
      toast.success('PMH condition updated successfully');
      queryClient.invalidateQueries({ queryKey: PMH_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update PMH condition');
    },
  });
}

export function useDeletePmh() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pmhId: number) => pmhService.remove(pmhId),
    onSuccess: () => {
      toast.success('PMH condition removed');
      queryClient.invalidateQueries({ queryKey: PMH_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove PMH condition');
    },
  });
}
