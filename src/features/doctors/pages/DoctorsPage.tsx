import React from "react";
import { Plus } from "lucide-react";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDoctorManagement } from "../hooks";
import {
  DoctorFormSheet,
  DoctorFilters,
} from "../components";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
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
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Doctors
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                Manage your medical staff and their information
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={openCreateForm} className="bg-primary-gradient hover:opacity-90 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Doctor
              </Button>
            </div>
          </div>

          {/* Filters */}
          <DoctorFilters filters={filters} onFiltersChange={updateFilters} />
        </div>
      </div>

      {/* Table */}
      <ScrollArea className="flex-1">
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
          hideRowsPerPage
        />
      </ScrollArea>

      {/* Form Sheet */}
      <DoctorFormSheet
        open={isFormOpen}
        onOpenChange={(open) => !open && closeForm()}
        doctor={selectedDoctor}
        onSubmit={selectedDoctor ? handleUpdate : handleCreate}
        isLoading={isCreating || isUpdating}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        onConfirm={handleDelete}
        title="Delete Doctor"
        description={
          selectedDoctor ? (
            <span>
              Are you sure you want to delete{" "}
              <span className="font-bold">{selectedDoctor.displayName}</span>?
              <br />
              <span className="text-muted-foreground text-xs mt-0.5 block">
                {selectedDoctor.specialty} • {selectedDoctor.degree}
              </span>
              <span className="block mt-2">This action cannot be undone.</span>
            </span>
          ) : (
            "This action cannot be undone."
          )
        }
        isDeleting={isDeleting}
      />
    </div>
  );
};
