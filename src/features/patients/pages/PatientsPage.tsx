import { useNavigate } from "react-router-dom";
import { useInfinitePatients } from "../hooks/usePatients";
import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { PatientFormSheet } from "../components/PatientFormSheet";
import { usePatientManagement } from "../hooks/usePatientManagement";
import type { Patient } from "../types/patient.types";
import type { PatientFormData } from "../schemas/patient.schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { PatientFilters } from "../components/PatientFilters";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PatientList } from "../components/PatientList";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

export function PatientsPage() {
  const navigate = useNavigate();
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | undefined>();

  const listQuery = useInfinitePatients(limit, search);

  const patients = useMemo(() => {
    return listQuery.data?.pages.flatMap(page => page.patients) || [];
  }, [listQuery.data]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage && !listQuery.isLoading) {
          listQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage, listQuery.isLoading, listQuery.fetchNextPage]);

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-2 py-2">
        <div className="">
          <div className="flex items-center justify-between mb-2 mt-2">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Patients
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
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
            }}
            onReset={() => setSearch("")}
            hasActiveFilters={!!search}
          />
        </div>
      </div>

      {/* Main Content */}
      <ScrollArea className="flex-1 px-2 pb-6">
        <div className="pt-2">
          <PatientList
            patients={patients}
            isLoading={listQuery.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            navigate={navigate}
          />

          {listQuery.hasNextPage && (
            <div ref={observerTarget} className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
        </div>
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

export default PatientsPage;
