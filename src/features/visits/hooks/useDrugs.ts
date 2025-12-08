import { useQuery } from '@tanstack/react-query';
import { drugService } from '../services/drug.service';

export function useDrugSearch(search: string) {
  return useQuery({
    queryKey: ['drugs', 'search', search],
    queryFn: () => drugService.search(search),
    enabled: search.length >= 2,
    staleTime: 60000, // Cache for 1 minute
  });
}

export function useDrugs() {
  return useQuery({
    queryKey: ['drugs'],
    queryFn: () => drugService.list(),
  });
}
