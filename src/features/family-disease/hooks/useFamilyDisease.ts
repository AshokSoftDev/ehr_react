import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { familyDiseaseService } from '../services/familyDisease.service';
import type { FamilyDiseasePayload, FamilyDiseaseUpdatePayload } from '../types/familyDisease.types';
import { toast } from '@/lib/toast';

export const FAMILY_DISEASE_QUERY_KEY = ['familyDiseaseMaster'];

export function useFamilyDiseases() {
  return useQuery({
    queryKey: FAMILY_DISEASE_QUERY_KEY,
    queryFn: () => familyDiseaseService.list(),
  });
}

export function useCreateFamilyDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: FamilyDiseasePayload) => familyDiseaseService.create(payload),
    onSuccess: () => {
      toast.success('Family disease condition created successfully');
      queryClient.invalidateQueries({ queryKey: FAMILY_DISEASE_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create family disease condition');
    },
  });
}

export function useUpdateFamilyDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: FamilyDiseaseUpdatePayload }) => 
      familyDiseaseService.update(id, payload),
    onSuccess: () => {
      toast.success('Family disease condition updated successfully');
      queryClient.invalidateQueries({ queryKey: FAMILY_DISEASE_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update family disease condition');
    },
  });
}

export function useDeleteFamilyDisease() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => familyDiseaseService.remove(id),
    onSuccess: () => {
      toast.success('Family disease condition removed');
      queryClient.invalidateQueries({ queryKey: FAMILY_DISEASE_QUERY_KEY });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to remove family disease condition');
    },
  });
}
