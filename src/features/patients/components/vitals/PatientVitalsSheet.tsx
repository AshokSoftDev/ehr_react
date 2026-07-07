import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { PatientVitalsForm } from './PatientVitalsForm';
import { useCreateVital, useUpdateVital } from '../../hooks/useVitals';
import type { PatientVital, CreateVitalPayload } from '../../types/vital.types';

interface PatientVitalsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  visitId?: number; // Pass this if opening from a specific visit
  vitalToEdit?: PatientVital | null;
}

export function PatientVitalsSheet({
  open,
  onOpenChange,
  patientId,
  visitId,
  vitalToEdit,
}: PatientVitalsSheetProps) {
  const createVital = useCreateVital();
  const updateVital = useUpdateVital();

  const isEditing = !!vitalToEdit;
  const isLoading = createVital.isPending || updateVital.isPending;

  const handleSubmit = (data: CreateVitalPayload) => {
    // Inject visitId if provided (creating from visit context)
    const payload = {
      ...data,
      visit_id: visitId || data.visit_id || null,
    };

    if (isEditing && vitalToEdit) {
      updateVital.mutate(
        { patientId, vitalId: vitalToEdit.vital_id, data: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    } else {
      createVital.mutate(
        { patientId, data: payload },
        { onSuccess: () => onOpenChange(false) }
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[90vw] sm:max-w-[700px] p-0 flex flex-col">
        <SheetHeader className="px-6 py-4 border-b">
          <SheetTitle>{isEditing ? 'Edit Vitals' : 'Add Vitals'}</SheetTitle>
        </SheetHeader>
        
        <div className="flex-1 overflow-hidden relative">
          <PatientVitalsForm
            initialData={vitalToEdit}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
