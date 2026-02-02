import React from "react";
import { Plus, Download } from "lucide-react";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { Button } from "@/components/ui/button";
import { useDoctorManagement } from "../hooks";
import {
  DoctorFormSheet,
  DoctorFilters,
  DoctorDeleteDialog,
} from "../components";
import { doctorColumns } from "./doctorColumns";
import type { Doctor } from "../types/doctor.types";

export const DoctorsPage: React.FC = () => {
  const {
    // Data
    doctors,
    total,
    page,
    
    // State
    filters,
    pagination,
    isFormOpen,
    isDeleteDialogOpen,
    selectedDoctor,

    // Loading states
    isLoading,
    // isFetching,
    isCreating,
    isUpdating,
    isDeleting,

    // Actions
    updateFilters,
    updatePagination,
    goToPage,
    openCreateForm,
    openEditForm,
    closeForm,
    openDeleteDialog,
    closeDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    viewDoctor,
  } = useDoctorManagement({
    initialPagination: { page: 1, limit: 10 },
  });

  const columns = React.useMemo(
    () => doctorColumns(openEditForm, openDeleteDialog),
    [openEditForm, openDeleteDialog]
  );

  return (
    <div className="flex-1 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
          <p className="text-muted-foreground mt-1">
            Manage your medical staff and their information
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <DoctorFilters filters={filters} onFiltersChange={updateFilters} />

      {/* Table */}
      <AdvancedDataTable<Doctor, unknown>
        columns={columns}
        data={doctors}
        isLoading={isLoading}
        page={page}
        limit={pagination.limit ?? 10}
        total={total}
        onPageChange={goToPage}
        onLimitChange={(limit) =>
          updatePagination({
            ...pagination,
            page: 1,
            limit,
          })
        }
        onRowClick={viewDoctor as (row: Doctor) => void}
      />

      {/* Form Sheet */}
      <DoctorFormSheet
        open={isFormOpen}
        onOpenChange={(open) => !open && closeForm()}
        doctor={selectedDoctor}
        onSubmit={selectedDoctor ? handleUpdate : handleCreate}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Dialog */}
      <DoctorDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        doctor={selectedDoctor}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
