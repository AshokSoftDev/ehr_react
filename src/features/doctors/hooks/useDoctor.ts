import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { toast } from 'react-toastify';
import { doctorService } from '../services/doctor.service';
import type { 
  Doctor, 
  CreateDoctorDto, 
  UpdateDoctorDto
} from '../types/doctor.types';

interface UseDoctorOptions {
  onCreateSuccess?: (doctor: Doctor) => void;
  onUpdateSuccess?: (doctor: Doctor) => void;
  onDeleteSuccess?: (doctor: Doctor) => void;
  onError?: (error: Error) => void;
}

interface ApiError extends Error {
  response?: {
    data?: {
      message?: string;
    };
  };
}

export const useDoctor = (id?: string, options?: UseDoctorOptions) => {
  const queryClient = useQueryClient();

  // Query for single doctor
  const doctorQuery = useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctorService.getDoctor(id!),
    enabled: !!id,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateDoctorDto) => doctorService.createDoctor(data),
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor created successfully');
      options?.onCreateSuccess?.(doctor);
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to create doctor';
      toast.error(message);
      options?.onError?.(error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDoctorDto }) =>
      doctorService.updateDoctor(id, data),
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      queryClient.invalidateQueries({ queryKey: ['doctor', doctor.id] });
      toast.success('Doctor updated successfully');
      options?.onUpdateSuccess?.(doctor);
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to update doctor';
      toast.error(message);
      options?.onError?.(error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => doctorService.deleteDoctor(id),
    onSuccess: (doctor) => {
      queryClient.invalidateQueries({ queryKey: ['doctors'] });
      toast.success('Doctor deleted successfully');
      options?.onDeleteSuccess?.(doctor);
    },
    onError: (error: ApiError) => {
      const message = error.response?.data?.message || 'Failed to delete doctor';
      toast.error(message);
      options?.onError?.(error);
    },
  });

  // Helper functions
  const createDoctor = useCallback((data: CreateDoctorDto) => {
    return createMutation.mutate(data);
  }, [createMutation]);

  const updateDoctor = useCallback((id: string, data: UpdateDoctorDto) => {
    return updateMutation.mutate({ id, data });
  }, [updateMutation]);

  const deleteDoctor = useCallback((id: string) => {
    return deleteMutation.mutate(id);
  }, [deleteMutation]);

  return {
    // Query state
    doctor: doctorQuery.data,
    isLoading: doctorQuery.isLoading,
    isError: doctorQuery.isError,
    error: doctorQuery.error,
    
    // Mutations
    createDoctor,
    updateDoctor,
    deleteDoctor,
    
    // Mutation states
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    
    // Mutation errors
    createError: createMutation.error,
    updateError: updateMutation.error,
    deleteError: deleteMutation.error,
  };
};
