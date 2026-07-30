import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { surgeryService } from '../services/surgery.service';
import type { SurgeryPayload, SurgeryUpdatePayload } from '../types/surgery.types';
import { toast } from '@/lib/toast';

export const SURGERY_MASTER_QUERY_KEY = ['surgeryMaster'];

export function useSurgeryMaster() {
  return useQuery({
    queryKey: SURGERY_MASTER_QUERY_KEY,
    queryFn: () => surgeryService.list(),
  });
}

export function useCreateSurgeryMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SurgeryPayload) => surgeryService.create(payload),
    onSuccess: () => {
      toast.success('Surgery procedure created successfully');
      queryClient.invalidateQueries({ queryKey: SURGERY_MASTER_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create surgery procedure');
    },
  });
}

export function useUpdateSurgeryMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surgeryId, payload }: { surgeryId: number; payload: SurgeryUpdatePayload }) => 
      surgeryService.update(surgeryId, payload),
    onSuccess: () => {
      toast.success('Surgery procedure updated successfully');
      queryClient.invalidateQueries({ queryKey: SURGERY_MASTER_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update surgery procedure');
    },
  });
}

export function useDeleteSurgeryMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (surgeryId: number) => surgeryService.remove(surgeryId),
    onSuccess: () => {
      toast.success('Surgery procedure removed');
      queryClient.invalidateQueries({ queryKey: SURGERY_MASTER_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove surgery procedure');
    },
  });
}
