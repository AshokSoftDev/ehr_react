import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialService } from '../services/social.service';
import type { CreateSocialPayload, UpdateSocialPayload } from '../types/social.types';

export const SOCIAL_MASTER_QUERY_KEY = ['socialMaster'] as const;

export function useSocialMaster(search?: string) {
  return useQuery({
    queryKey: search ? [...SOCIAL_MASTER_QUERY_KEY, { search }] : SOCIAL_MASTER_QUERY_KEY,
    queryFn: () => socialService.list(search),
  });
}

export function useCreateSocialMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSocialPayload) => socialService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_MASTER_QUERY_KEY });
    },
  });
}

export function useUpdateSocialMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateSocialPayload }) =>
      socialService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_MASTER_QUERY_KEY });
    },
  });
}

export function useDeleteSocialMaster() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => socialService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SOCIAL_MASTER_QUERY_KEY });
    },
  });
}
