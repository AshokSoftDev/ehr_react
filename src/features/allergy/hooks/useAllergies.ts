import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { allergyService } from '../services/allergy.service';
import type { AllergyFilters, CreateAllergyInput, UpdateAllergyInput } from '../types/allergy.types';

const allergyKeys = {
  all: ['allergies'] as const,
  lists: () => [...allergyKeys.all, 'list'] as const,
  list: (filters: AllergyFilters) => [...allergyKeys.lists(), filters] as const,
};

export function useAllergies(filters: AllergyFilters = {}) {
  return useQuery({
    queryKey: allergyKeys.list(filters),
    queryFn: () => allergyService.list(filters),
  });
}

export function useCreateAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAllergyInput) => allergyService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allergyKeys.lists() });
      toast.success('Allergy created successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create allergy');
    },
  });
}

export function useUpdateAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAllergyInput }) =>
      allergyService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allergyKeys.lists() });
      toast.success('Allergy updated successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update allergy');
    },
  });
}

export function useDeleteAllergy() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => allergyService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: allergyKeys.lists() });
      toast.success('Allergy deleted successfully');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete allergy');
    },
  });
}
