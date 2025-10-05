import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback, useEffect } from 'react';
import { doctorService } from '../services/doctor.service';
import type { DoctorFiltersType, PaginationParams } from '../types/doctor.types';

interface UseDoctorsOptions {
  initialFilters?: DoctorFiltersType;
  initialPagination?: PaginationParams;
  refetchInterval?: number;
}

export const useDoctors = (options?: UseDoctorsOptions) => {
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<DoctorFiltersType>(
    options?.initialFilters || {}
  );
  
  const [pagination, setPagination] = useState<PaginationParams>(
    options?.initialPagination || { page: 1, limit: 10 }
  );

  // Query for doctors list
  const doctorsQuery = useQuery({
    queryKey: ['doctors', filters, pagination],
    queryFn: () => doctorService.getAllDoctors(filters, pagination),
    refetchInterval: options?.refetchInterval,
  });

  // Prefetch next page
  useEffect(() => {
    const { page = 1, limit = 10 } = pagination;
    const totalPages = doctorsQuery.data?.totalPages || 1;
    
    if (page < totalPages) {
      queryClient.prefetchQuery({
        queryKey: ['doctors', filters, { ...pagination, page: page + 1 }],
        queryFn: () => doctorService.getAllDoctors(filters, { ...pagination, page: page + 1 }),
      });
    }
  }, [pagination, filters, doctorsQuery.data?.totalPages, queryClient]);

  // Helper functions
  const updateFilters = useCallback((newFilters: DoctorFiltersType) => {
    setFilters(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to page 1 when filters change
  }, [pagination]);

  const updatePagination = useCallback((newPagination: PaginationParams) => {
    setPagination(newPagination);
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const nextPage = useCallback(() => {
    const currentPage = pagination.page || 1;
    const totalPages = doctorsQuery.data?.totalPages || 1;
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  }, [pagination.page, doctorsQuery.data?.totalPages, goToPage]);

  const previousPage = useCallback(() => {
    const currentPage = pagination.page || 1;
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  }, [pagination.page, goToPage]);

  const refetch = useCallback(() => {
    return doctorsQuery.refetch();
  }, [doctorsQuery]);

  return {
    // Data
    doctors: doctorsQuery.data?.doctors || [],
    total: doctorsQuery.data?.total || 0,
    page: doctorsQuery.data?.page || 1,
    totalPages: doctorsQuery.data?.totalPages || 1,
    
    // State
    filters,
    pagination,
    
    // Query state
    isLoading: doctorsQuery.isLoading,
    isFetching: doctorsQuery.isFetching,
    isError: doctorsQuery.isError,
    error: doctorsQuery.error,
    
    // Actions
    updateFilters,
    updatePagination,
    goToPage,
    nextPage,
    previousPage,
    refetch,
    
    // Computed
    hasNextPage: (pagination.page || 1) < (doctorsQuery.data?.totalPages || 1),
    hasPreviousPage: (pagination.page || 1) > 1,
  };
};
