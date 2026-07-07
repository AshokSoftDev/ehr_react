import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Activity } from 'lucide-react';
import { PatientVitalsList } from '../../../components/vitals/PatientVitalsList';
import { PatientVitalsSheet } from '../../../components/vitals/PatientVitalsSheet';
import { usePatientVitals, useDeleteVital } from '../../../hooks/useVitals';
import type { PatientVital } from '../../../types/vital.types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function PatientVisitVitalsPage({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const [searchParams] = useSearchParams();
  const visitIdStr = searchParams.get('visitId');
  const visitId = visitIdStr ? Number(visitIdStr) : null;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVital, setEditingVital] = useState<PatientVital | null>(null);
  const [vitalToDelete, setVitalToDelete] = useState<PatientVital | null>(null);

  // We only fetch vitals for this specific visit
  const { data, isLoading } = usePatientVitals(
    { patientId, visitId: visitId || undefined },
    !!visitId
  );

  const deleteVital = useDeleteVital();

  const handleAdd = () => {
    setEditingVital(null);
    setIsSheetOpen(true);
  };

  const handleEdit = (vital: PatientVital) => {
    setEditingVital(vital);
    setIsSheetOpen(true);
  };

  const handleDeleteClick = (vital: PatientVital) => {
    setVitalToDelete(vital);
  };

  const confirmDelete = () => {
    if (vitalToDelete) {
      deleteVital.mutate({ patientId, vitalId: vitalToDelete.vital_id });
      setVitalToDelete(null);
    }
  };

  if (!visitId) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
        Please select a visit to view vitals
      </div>
    );
  }

  const vitals = data?.vitals || [];

  return (
    <div className="h-full flex flex-col">
      <Card className={`p-0 shadow-sm overflow-hidden flex flex-col h-full ${isReadOnly ? 'border-0 shadow-none' : ''}`}>
        {!isReadOnly && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold">Vitals</h2>
            </div>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleAdd} className="h-7 text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Vitals
              </Button>
            </div>
          </div>
        )}
        <CardContent className="p-0 flex-1 overflow-hidden">
          <PatientVitalsList
            vitals={vitals}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteClick}
            isReadOnly={isReadOnly}
          />
        </CardContent>
      </Card>

      <PatientVitalsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        patientId={patientId}
        visitId={visitId}
        vitalToEdit={editingVital}
      />

      <AlertDialog open={!!vitalToDelete} onOpenChange={(open) => !open && setVitalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vitals</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vital record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default PatientVisitVitalsPage;
