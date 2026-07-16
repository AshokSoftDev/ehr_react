import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { patientService } from '../services/patient.service';

export const usePatients = (page: number, limit: number, search: string) => {
  return useQuery({
    queryKey: ['patients', page, limit, search],
    queryFn: () => patientService.getPatients(page, limit, search),
  });
};

export const useInfinitePatients = (limit: number, search: string) => {
  return useInfiniteQuery({
    queryKey: ['patients', limit, search],
    queryFn: ({ pageParam = 1 }) => patientService.getPatients(pageParam as number, limit, search),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.limit);
      if (lastPage.page < totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
  });
};
