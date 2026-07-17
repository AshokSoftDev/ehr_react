import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/lib/toast';
import { patientAllergyService } from '../services/patientAllergy.service';
import type { PatientAllergyPayload, PatientAllergyUpdatePayload } from '../types/patientAllergy.types';

const key = (patientId: number) => ['patient-allergies', patientId];

export function usePatientAllergies(patientId: number) {
  return useQuery({
    queryKey: key(patientId),
    queryFn: () => patientAllergyService.list(patientId),
    enabled: !!patientId,
  });
}

export function useCreatePatientAllergy(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientAllergyPayload) => patientAllergyService.create(patientId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(patientId) });
      toast.success('Patient allergy added');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add allergy');
    },
  });
}

export function useUpdatePatientAllergy(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ paId, payload }: { paId: number; payload: PatientAllergyUpdatePayload }) =>
      patientAllergyService.update(patientId, paId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(patientId) });
      toast.success('Patient allergy updated');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update allergy');
    },
  });
}

export function useDeletePatientAllergy(patientId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (paId: number) => patientAllergyService.remove(patientId, paId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: key(patientId) });
      toast.success('Patient allergy removed');
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove allergy');
    },
  });
}
