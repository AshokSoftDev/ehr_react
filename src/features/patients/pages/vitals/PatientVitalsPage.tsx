import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Activity } from 'lucide-react';
import { PatientVitalsList } from '../../components/vitals/PatientVitalsList';
import { PatientVitalsSheet } from '../../components/vitals/PatientVitalsSheet';
import { usePatientVitals, useDeleteVital } from '../../hooks/useVitals';
import type { PatientVital } from '../../types/vital.types';

export function PatientVitalsPage() {
  const { id } = useParams<{ id: string }>();
  const patientId = Number(id);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingVital, setEditingVital] = useState<PatientVital | null>(null);

  const { data, isLoading } = usePatientVitals({ patientId });
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

  const vitals = data?.vitals || [];

  return (
    <div className="space-y-4">
      <Card className="border-border shadow-sm overflow-hidden py-0">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-500" />
            <h2 className="text-sm font-semibold">Patient Vitals</h2>
          </div>
          <Button size="sm" onClick={handleAdd} className="h-7 text-xs bg-orange-500 hover:bg-orange-600 text-white">
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add Vitals
          </Button>
        </div>
        <CardContent className="px-0">
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
        vitalToEdit={editingVital}
      />
    </div>
  );
}

export default PatientVitalsPage;
