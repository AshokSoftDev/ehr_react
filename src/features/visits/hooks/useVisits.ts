import { useQuery } from '@tanstack/react-query';
import { visitService } from '../services/visit.service';
import type { VisitFilters } from '../types/visit.types';

export const useVisits = (filters: VisitFilters) => {
  return useQuery({
    queryKey: ['visits', filters],
    queryFn: () => visitService.list(filters),
  });
};

