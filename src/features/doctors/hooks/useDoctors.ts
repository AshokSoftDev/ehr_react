import { useInfiniteQuery } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { doctorService } from '../services/doctor.service';
import type { DoctorFiltersType, PaginationParams } from '../types/doctor.types';

interface UseDoctorsOptions {
  initialFilters?: DoctorFiltersType;
  initialPagination?: PaginationParams;
  refetchInterval?: number;
}

export const useDoctors = (options?: UseDoctorsOptions) => {
  const [filters, setFilters] = useState<DoctorFiltersType>(
    options?.initialFilters || {}
  );

  const limit = options?.initialPagination?.limit || 10;

  // Query for doctors list using infinite query
  const doctorsQuery = useInfiniteQuery({
    queryKey: ['doctors', filters, limit],
    queryFn: ({ pageParam = 1 }) => doctorService.getAllDoctors(filters, { page: pageParam as number, limit }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.totalPages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    refetchInterval: options?.refetchInterval,
  });

  // Flatten the doctors array from all pages
  const doctors = doctorsQuery.data?.pages.flatMap((page) => page.doctors) || [];
  const total = doctorsQuery.data?.pages[0]?.total || 0;

  // Helper functions
  const updateFilters = useCallback((newFilters: DoctorFiltersType) => {
    setFilters(newFilters);
  }, []);

  const refetch = useCallback(() => {
    return doctorsQuery.refetch();
  }, [doctorsQuery]);

  return {
    // Data
    doctors,
    total,

    // State
    filters,

    // Query state
    isLoading: doctorsQuery.isLoading,
    isFetching: doctorsQuery.isFetching,
    isFetchingNextPage: doctorsQuery.isFetchingNextPage,
    isError: doctorsQuery.isError,
    error: doctorsQuery.error,

    // Actions
    updateFilters,
    fetchNextPage: doctorsQuery.fetchNextPage,
    refetch,

    // Computed
    hasNextPage: !!doctorsQuery.hasNextPage,
  };
};
