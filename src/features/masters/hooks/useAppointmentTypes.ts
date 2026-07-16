import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import type { CreateAppointmentTypePayload, UpdateAppointmentTypePayload } from '../types/appointmentType.types';
import { appointmentTypeService } from '../services/appointmentType.service';

const key = ['appointment-types'];

export function useAppointmentTypes(search?: string, status?: number) {
  return useQuery({
    queryKey: [...key, search, status],
    queryFn: () => appointmentTypeService.list(search, status),
  });
}

export function useCreateAppointmentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAppointmentTypePayload) => appointmentTypeService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Appointment type created');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create appointment type');
    },
  });
}

export function useUpdateAppointmentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateAppointmentTypePayload }) =>
      appointmentTypeService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Appointment type updated');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update appointment type');
    },
  });
}

export function useDeleteAppointmentType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => appointmentTypeService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key });
      toast.success('Appointment type deleted');
    },
    onError: (err: Error & { response?: { data?: { message?: string } } }) => {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete appointment type');
    },
  });
}
