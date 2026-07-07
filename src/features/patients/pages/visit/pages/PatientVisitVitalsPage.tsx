import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Activity } from 'lucide-react';
import { PatientVitalsList } from '../../../components/vitals/PatientVitalsList';
import { PatientVitalsSheet } from '../../../components/vitals/PatientVitalsSheet';
import { usePatientVitals, useDeleteVital } from '../../../hooks/useVitals';
import type { PatientVital } from '../../../types/vital.types';

export function PatientVisitVitalsPage({ isReadOnly = false }: { isReadOnly?: boolean }) {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);
  const [searchParams] = useSearchParams();
  const visitIdStr = searchParams.get('visitId');
  const visitId = visitIdStr ? Number(visitIdStr) : null;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVital, setEditingVital] = useState<PatientVital | null>(null);

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

  const handleDelete = (vital: PatientVital) => {
    if (confirm('Are you sure you want to delete this vital record?')) {
      deleteVital.mutate({ patientId, vitalId: vital.vital_id });
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
    <div className="space-y-4 h-full flex flex-col">
      <Card className={`border-border shadow-sm overflow-hidden flex flex-col h-full ${isReadOnly ? 'border-0 shadow-none' : ''}`}>
        {!isReadOnly && (
          <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-orange-500" />
              <h2 className="text-sm font-semibold">Visit Vitals</h2>
            </div>
            <Button size="sm" onClick={handleAdd} className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white">
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Vitals
            </Button>
          </div>
        )}
        <CardContent className="p-0 flex-1 overflow-hidden">
          <PatientVitalsList 
            vitals={vitals} 
            isLoading={isLoading} 
            onEdit={handleEdit} 
            onDelete={handleDelete} 
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
    </div>
  );
}

export default PatientVisitVitalsPage;
