import { useState } from "react";
import { Plus, ShieldAlert, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  usePatientAllergies,
  useCreatePatientAllergy,
  useUpdatePatientAllergy,
  useDeletePatientAllergy
} from "@/features/patients/hooks/usePatientAllergies";
import { PatientAllergyFormSheet, type PatientAllergyFormValues } from "./PatientAllergyFormSheet";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import type { PatientAllergyItem } from "@/features/patients/types/patientAllergy.types";

export default function HistoryAllergyTab({ patientId }: { patientId: number }) {
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<PatientAllergyItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PatientAllergyItem | null>(null);

  const { data: allergies = [], isLoading } = usePatientAllergies(patientId);
  
  const createMutation = useCreatePatientAllergy(patientId);
  const updateMutation = useUpdatePatientAllergy(patientId);
  const deleteMutation = useDeletePatientAllergy(patientId);

  const handleEdit = (allergy: PatientAllergyItem) => {
    setEditItem(allergy);
    setOpenForm(true);
  };

  const handleDelete = (allergy: PatientAllergyItem) => {
    setDeleteItem(allergy);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = (values: PatientAllergyFormValues) => {
    const payload = {
      allergyName: values.allergyName,
      allergyId: values.allergyId && values.allergyId !== "none" ? Number(values.allergyId) : undefined,
    };

    if (editItem) {
      updateMutation.mutate({ paId: editItem.id, payload });
      setEditItem(null);
    } else {
      createMutation.mutate(payload);
    }
    setOpenForm(false);
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Allergies</h3>
          <p className="text-muted-foreground text-sm">Manage patient allergies and reactions</p>
        </div>
        <Button onClick={() => setOpenForm(true)} size="sm" className="bg-primary-gradient">
          <Plus className="h-4 w-4 mr-1" /> Add Allergy
        </Button>
      </div>

      <div className="flex-1 overflow-auto rounded-md border">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : allergies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <ShieldAlert className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No allergies recorded</h3>
            <p className="text-sm">Click "Add Allergy" to add one</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {allergies.map((allergy) => (
              <div key={allergy.id} className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-4 bg-card">
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="min-w-0 flex items-center gap-3">
                      <h3 className="font-semibold text-base truncate">{allergy.allergyName}</h3>
                      {allergy.status === 1 ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none text-[10px] h-5 px-1.5 rounded-sm">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="shadow-none text-[10px] h-5 px-1.5 rounded-sm">Inactive</Badge>
                      )}
                      {allergy.allergy && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-sm text-muted-foreground">Master: {allergy.allergy.allergyType}</Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center sm:pl-4 sm:border-l border-border/50 shrink-0 gap-2 opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary hover:bg-blue-50 hover:text-blue-600 rounded-full"
                    onClick={() => handleEdit(allergy)}
                    title="Edit Allergy"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-red-50 rounded-full"
                    onClick={() => handleDelete(allergy)}
                    title="Delete Allergy"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PatientAllergyFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditItem(null);
        }}
        onSubmit={handleSubmit}
        initial={editItem || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (deleteItem) {
            deleteMutation.mutate(deleteItem.id);
            setDeleteDialogOpen(false);
          }
        }}
        title="Delete Patient Allergy"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to remove <span className="font-bold">{deleteItem.allergyName}</span> from this patient?
            </span>
          ) : (
            "Are you sure you want to delete this allergy?"
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}
