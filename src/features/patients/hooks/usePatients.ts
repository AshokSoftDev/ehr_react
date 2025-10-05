import { useQuery } from '@tanstack/react-query';
import { patientService } from '../services/patient.service';

export const usePatients = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ['patients', page, limit, search],
    queryFn: () => patientService.getPatients(page, limit, search),
  });
};
