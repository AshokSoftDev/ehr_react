import { useMutation, useQueryClient } from '@tanstack/react-query';
import { patientService } from '../services/patient.service';
import type { PatientFormData } from '../schemas/patient.schema';

export const usePatientManagement = () => {
  const queryClient = useQueryClient();

  const { mutate: createPatient, isPending: isCreating } = useMutation({
    mutationFn: (data: PatientFormData) => patientService.createPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const { mutate: updatePatient, isPending: isUpdating } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PatientFormData> }) => patientService.updatePatient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  const { mutate: deletePatient, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) => patientService.deletePatient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  return {
    createPatient,
    updatePatient,
    deletePatient,
    isCreating,
    isUpdating,
    isDeleting,
  };
};
