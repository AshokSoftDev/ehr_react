import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vitalService } from '../services/vital.service';
import type { VitalFilters, CreateVitalPayload, UpdateVitalPayload } from '../types/vital.types';
import { toast } from '@/lib/toast';

export function usePatientVitals(filters: VitalFilters, enabled = true) {
  return useQuery({
    queryKey: ['patient-vitals', filters],
    queryFn: () => vitalService.list(filters),
    enabled: enabled && !!filters.patientId,
  });
}

export function useCreateVital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, data }: { patientId: number; data: CreateVitalPayload }) => 
      vitalService.create(patientId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-vitals', { patientId: variables.patientId }] });
      toast.success('Vitals recorded successfully');
    },
    onError: () => {
      toast.error('Failed to record vitals');
    }
  });
}

export function useUpdateVital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, vitalId, data }: { patientId: number; vitalId: number; data: UpdateVitalPayload }) => 
      vitalService.update(patientId, vitalId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-vitals', { patientId: variables.patientId }] });
      toast.success('Vitals updated successfully');
    },
    onError: () => {
      toast.error('Failed to update vitals');
    }
  });
}

export function useDeleteVital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patientId, vitalId }: { patientId: number; vitalId: number }) => 
      vitalService.delete(patientId, vitalId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['patient-vitals', { patientId: variables.patientId }] });
      toast.success('Vitals deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete vitals');
    }
  });
}
