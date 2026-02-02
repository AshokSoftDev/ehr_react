import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctor } from './useDoctor';
import { useDoctors } from './useDoctors';
import type { Doctor, CreateDoctorDto, UpdateDoctorDto, DoctorFiltersType, PaginationParams } from '../types/doctor.types';

interface UseDoctorManagementOptions {
  initialFilters?: DoctorFiltersType;
  initialPagination?: PaginationParams;
  navigateOnCreate?: boolean;
  navigateOnUpdate?: boolean;
}

export const useDoctorManagement = (options?: UseDoctorManagementOptions) => {
  const navigate = useNavigate();
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Use doctors list hook
  const doctorsHook = useDoctors({
    initialFilters: options?.initialFilters,
    initialPagination: options?.initialPagination,
  });

  // Use single doctor hook
  const doctorHook = useDoctor(selectedDoctor?.id, {
    onCreateSuccess: (doctor) => {
      setIsFormOpen(false);
      setSelectedDoctor(null);
      if (options?.navigateOnCreate) {
        navigate(`/doctors/${doctor.id}`);
      }
    },
    onUpdateSuccess: (doctor) => {
      setIsFormOpen(false);
      setSelectedDoctor(null);
      if (options?.navigateOnUpdate) {
        navigate(`/doctors/${doctor.id}`);
      }
    },
    onDeleteSuccess: () => {
      setIsDeleteDialogOpen(false);
      setSelectedDoctor(null);
    },
  });

  // Form handlers
  const openCreateForm = useCallback(() => {
    setSelectedDoctor(null);
    setIsFormOpen(true);
  }, []);

  const openEditForm = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedDoctor(null);
  }, []);

  // Delete handlers
  const openDeleteDialog = useCallback((doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedDoctor(null);
  }, []);

  // CRUD operations
  const handleCreate = useCallback((data: CreateDoctorDto) => {
    doctorHook.createDoctor(data);
  }, [doctorHook]);

  const handleUpdate = useCallback((data: UpdateDoctorDto) => {
    if (selectedDoctor) {
      doctorHook.updateDoctor(selectedDoctor.id, data);
    }
  }, [doctorHook, selectedDoctor]);

  const handleDelete = useCallback(() => {
    if (selectedDoctor) {
      doctorHook.deleteDoctor(selectedDoctor.id);
    }
  }, [doctorHook, selectedDoctor]);

  // Navigation
  const viewDoctor = useCallback((doctor: Doctor) => {
    navigate(`/main/doctor/${doctor.id}`);
  }, [navigate]);

  return {
    // List data
    ...doctorsHook,
    
    // Selected doctor
    selectedDoctor,
    
    // UI state
    isFormOpen,
    isDeleteDialogOpen,
    
    // Form actions
    openCreateForm,
    openEditForm,
    closeForm,
    
    // Delete actions
    openDeleteDialog,
    closeDeleteDialog,
    
    // CRUD operations
    handleCreate,
    handleUpdate,
    handleDelete,
    viewDoctor,
    
    // Loading states
    isCreating: doctorHook.isCreating,
    isUpdating: doctorHook.isUpdating,
    isDeleting: doctorHook.isDeleting,
    
    // Errors
    createError: doctorHook.createError,
    updateError: doctorHook.updateError,
    deleteError: doctorHook.deleteError,
  };
};
