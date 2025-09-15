import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { userService } from '../services/user.service';
import type{ UserFilters, CreateUserDto, UpdateUserDto } from '../types/user.types';

interface QueryParams extends UserFilters {
  page?: number;
  limit?: number;
}

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useUsers = (params?: QueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => userService.getUsers(params || {}),
  });
};

export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => userService.getUser(id),
    enabled: !!id,
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserDto) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User created successfully');
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to create user');
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', variables.id] });
      toast.success('User updated successfully');
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to update user');
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted successfully');
    },
    onError: (error: unknown) => {
      const err = error as ErrorResponse;
      toast.error(err.response?.data?.message || 'Failed to delete user');
    },
  });
};
