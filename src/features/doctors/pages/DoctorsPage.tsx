import React, { useEffect, useRef } from "react";
import { Plus, Mail, Stethoscope, GraduationCap, Edit, Trash2, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useDoctorManagement } from "../hooks";
import {
  DoctorFormSheet,
  DoctorFilters,
} from "../components";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import type { Doctor } from "../types/doctor.types";

export const DoctorsPage: React.FC = () => {
  const {
    // Data
    doctors,

    // State
    filters,
    isFormOpen,
    isDeleteDialogOpen,
    selectedDoctor,

    // Loading states
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isFetchingNextPage,

    // Actions
    updateFilters,
    openCreateForm,
    openEditForm,
    closeForm,
    openDeleteDialog,
    closeDeleteDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    viewDoctor,
    fetchNextPage,
    hasNextPage,
  } = useDoctorManagement({
    initialPagination: { page: 1, limit: 10 },
  });

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage && !isLoading) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

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

      {/* List View */}
      <ScrollArea className="flex-1 mt-4 pr-3">
        <Card className="bg-card h-full flex flex-col mb-4">
          <CardContent className="p-0">
            {isLoading && doctors.length === 0 ? (
              <div className="flex justify-center p-8 text-sm text-muted-foreground">Loading doctors...</div>
            ) : doctors.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Stethoscope className="h-10 w-10 opacity-20 mb-3" />
                <p className="text-sm">No doctors found.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {doctors.map((doctor: Doctor) => (
                  <div
                    key={doctor.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-2 cursor-pointer"
                    onClick={() => viewDoctor(doctor)}
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-medium text-base text-foreground pr-1">
                          {doctor.displayName}
                        </div>
                        <div className="flex items-center gap-1.5 ml-1">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 border-none bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            {doctor.specialty}
                          </Badge>
                          {doctor.status === 1 ? (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-none bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-200">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[9px] px-1.5 py-0 h-4 border-none bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-200">
                              Inactive
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs flex-wrap mt-1">
                        {doctor.degree && (
                          <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                            <GraduationCap className="h-3.5 w-3.5" />
                            {doctor.degree}
                          </span>
                        )}
                        {doctor.email && (
                          <>
                            <span className="text-xs text-muted-foreground/50">|</span>
                            <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                              <Mail className="h-3.5 w-3.5" />
                              {doctor.email}
                            </span>
                          </>
                        )}
                        {doctor.licenceNo && (
                          <>
                            <span className="text-xs text-muted-foreground/50">|</span>
                            <span className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                              <Award className="h-3.5 w-3.5" />
                              {doctor.licenceNo}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(doctor);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/50"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(doctor);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </CardContent>
        </Card>
        {/* Infinite Scroll Target */}
        <div ref={observerTarget} className="h-10 flex items-center justify-center">
          {isFetchingNextPage && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading more...
            </div>
          )}
        </div>
        {!hasNextPage && doctors.length > 0 && (
          <div className="py-6 flex items-center justify-center gap-4 opacity-70">
            <div className="h-px bg-border flex-1 max-w-[60px]"></div>
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              End of list
            </span>
            <div className="h-px bg-border flex-1 max-w-[60px]"></div>
          </div>
        )}
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
