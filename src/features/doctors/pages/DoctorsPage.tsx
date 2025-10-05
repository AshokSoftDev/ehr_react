import React from 'react';
import { Plus, Download, Users } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../../components/ui/card';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
import { Skeleton } from '../../../components/ui/skeleton';
import { useDoctorManagement } from '../hooks';
import { 
  DoctorFormSheet, 
  DoctorList, 
  DoctorFilters, 
  DoctorDeleteDialog 
} from '../components';

export const DoctorsPage: React.FC = () => {
  const {
    // Data
    doctors,
    total,
    page,
    totalPages,
    
    // State
    filters,
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
    hasNextPage,
    hasPreviousPage,
  } = useDoctorManagement({
    initialPagination: { page: 1, limit: 10 },
  });

  // Generate pagination items
  const getPaginationItems = () => {
    const items = [];
    const maxVisible = 5;
    const halfVisible = Math.floor(maxVisible / 2);
    
    let start = Math.max(1, page - halfVisible);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      items.push(i);
    }
    
    return items;
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-6">
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
          <Button onClick={openCreateForm}>
            <Plus className="mr-2 h-4 w-4" />
            Add Doctor
          </Button>
        </div>
      </div>

      {/* Filters */}
      <DoctorFilters filters={filters} onFiltersChange={updateFilters} />

      {/* Table */}
      {isLoading ? (
        <Card>
          <CardContent className="p-0">
            <div className="space-y-3 p-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <DoctorList
                doctors={doctors}
                onEdit={openEditForm}
                onDelete={openDeleteDialog}
                onView={viewDoctor}
              />
            </CardContent>
          </Card>

                    {/* Pagination */}
                    {totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => goToPage(page - 1)}
                      className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                  
                  {page > 3 && (
                    <>
                      <PaginationItem>
                        <PaginationLink onClick={() => goToPage(1)} className="cursor-pointer">
                          1
                        </PaginationLink>
                      </PaginationItem>
                      {page > 4 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                    </>
                  )}
                  
                  {getPaginationItems().map((pageNum) => (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => goToPage(pageNum)}
                        isActive={pageNum === page}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {page < totalPages - 2 && (
                    <>
                      {page < totalPages - 3 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      <PaginationItem>
                        <PaginationLink 
                          onClick={() => goToPage(totalPages)} 
                          className="cursor-pointer"
                        >
                          {totalPages}
                        </PaginationLink>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <PaginationNext 
                      onClick={() => goToPage(page + 1)}
                      className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      )}

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
