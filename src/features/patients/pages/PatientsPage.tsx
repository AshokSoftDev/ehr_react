import { DataTableWIthFilter } from "../components/DataTableWIthFilter";
import { useNavigate } from "react-router-dom";
import { usePatients } from "../hooks/usePatients";
import { useEffect, useState } from "react";
import { PatientFormSheet } from "../components/PatientFormSheet";
import { usePatientManagement } from "../hooks/usePatientManagement";
import type { Patient } from "../types/patient.types";
import type { PatientFormData } from "../schemas/patient.schema";

export function PatientsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | undefined>();

  const { data, isLoading } = usePatients(page, limit, search);
  
  const { createPatient, updatePatient, deletePatient, isCreating, isUpdating } = usePatientManagement();

  const handleAdd = () => {
    setSelectedPatient(undefined);
    setSheetOpen(true);
  };

  const handleEdit = (patient: Patient) => {
    setSelectedPatient(patient);
    setSheetOpen(true);
  };

  const handleDelete = (patient: Patient) => {
    deletePatient(patient.patient_id);
  };

  const handleSubmit = (data: PatientFormData) => {
    if (selectedPatient) {
      updatePatient({ id: selectedPatient.patient_id, data });
    } else {
      createPatient(data);
    }
    setSheetOpen(false);
  };

  useEffect(()=>{
  console.log(data);

  }, [data])

  return (
    <div className="h-full w-full p-4 md:p-8">
      <h2 className="text-2xl font-bold mb-4">Patients</h2>
      <DataTableWIthFilter
        data={data?.patients ?? []}
        isLoading={isLoading}
        page={page}
        limit={limit}
        total={data?.total ?? 0}
        onPageChange={setPage}
        onLimitChange={setLimit}
        onSearch={setSearch}
        onAdd={handleAdd}
        onEdit={handleEdit}
        onDelete={handleDelete}
        // Navigate to patient details on row click
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        // @ts-expect-error generic passthrough to underlying table
        onRowClick={(row: Patient) => navigate(`/main/patients/${row.patient_id}/dashboard`)}
      />
      <PatientFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        patient={selectedPatient}
        onSubmit={handleSubmit}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
}
