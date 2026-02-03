import { useNavigate } from "react-router-dom";
import { usePatients } from "../hooks/usePatients";
import { useEffect, useState, useMemo, useCallback } from "react";
import { PatientFormSheet } from "../components/PatientFormSheet";
import { usePatientManagement } from "../hooks/usePatientManagement";
import type { Patient } from "../types/patient.types";
import type { PatientFormData } from "../schemas/patient.schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { patientColumns } from "./patientColumns";
import { PatientFilters } from "../components/PatientFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ColumnDef } from "@tanstack/react-table";

import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

export function PatientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | undefined>();

  const { data, isLoading } = usePatients(page, limit, search);

  const {
    createPatient,
    updatePatient,
    deletePatient,
    isCreating,
    isUpdating,
    isDeleting,
  } = usePatientManagement({
    onCreateSuccess: () => setSheetOpen(false),
    onUpdateSuccess: () => setSheetOpen(false),
    onDeleteSuccess: () => setDeleteDialogOpen(false),
  });

  const handleAdd = () => {
    setSelectedPatient(undefined);
    setSheetOpen(true);
  };

  const handleEdit = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setSheetOpen(true);
  }, []);

  const handleDelete = useCallback((patient: Patient) => {
    setPatientToDelete(patient);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = () => {
    if (patientToDelete?.patient_id) {
      deletePatient(patientToDelete.patient_id);
    }
  };

  const handleSubmit = (data: PatientFormData) => {
    if (selectedPatient) {
      updatePatient({ id: selectedPatient.patient_id ?? 0, data });
    } else {
      createPatient(data);
    }
  };

  const columns: ColumnDef<Patient, unknown>[] = useMemo(
    () => patientColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Patients
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage patient records and information
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button onClick={handleAdd} className="bg-primary-gradient hover:opacity-90 shadow-lg">
                <Plus className="mr-2 h-4 w-4" />
                Add Patient
              </Button>
            </div>
          </div>

          <PatientFilters
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onReset={() => setSearch("")}
            hasActiveFilters={!!search}
          />
        </div>
      </div>

      {/* Table Section */}
      <ScrollArea className="flex-1">
        <AdvancedDataTable<Patient, unknown>
          columns={columns}
          data={data?.patients ?? []}
          isLoading={isLoading}
          page={page}
          limit={limit}
          total={data?.total ?? 0}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onRowClick={(row: Patient) =>
            navigate(`/main/patients/${row.patient_id}/dashboard`)
          }
        />
      </ScrollArea>
      
      <PatientFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        patient={selectedPatient}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Patient"
        description={
          patientToDelete ? (
            <span>
              This action cannot be undone. This will permanently delete the patient record for{" "}
              <span className="font-bold">
                {patientToDelete.firstName} {patientToDelete.lastName}
              </span>
              .
            </span>
          ) : (
            "This action cannot be undone."
          )
        }
        isDeleting={isDeleting}
      />
    </div>
  );
}
