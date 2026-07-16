import { useMutation, useQuery, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { groupService } from '../services/group.service';

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useGroups = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['groups', params],
    queryFn: () => groupService.getGroups(params || {}),
  });
};

export const useInfiniteGroups = (params?: QueryParams) => {
  return useInfiniteQuery({
    queryKey: ['groups', 'infinite', params],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await groupService.getGroups({ ...params, page: pageParam as number });
      return response as any;
    },
    getNextPageParam: (lastPage) => {
      const pagination = lastPage?.data?.pagination;
      if (pagination && pagination.page < pagination.totalPages) {
        return pagination.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

export const useGroup = (id: string) => {
  return useQuery({
    queryKey: ['group', id],
    queryFn: () => groupService.getGroup(id),
    enabled: !!id,
  });
};

export const useCreateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Record<string, unknown>) => groupService.createGroup(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group created successfully');
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to create group');
    },
  });
};

export const useUpdateGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) => 
      groupService.updateGroup(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      queryClient.invalidateQueries({ queryKey: ['group', variables.id] });
      toast.success('Group updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to update group');
    },
  });
};

export const useDeleteGroup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupService.deleteGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success('Group deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to delete group');
    },
  });
};

export const useModules = () => {
  return useQuery({
    queryKey: ['modules'],
    queryFn: () => groupService.getModules(),
    staleTime: 5 * 60 * 1000,
  });
};
