export default function HistoryMedicationTab( { patientId: _patientId }: { patientId: number }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Medications</h3>
      <div className="text-muted-foreground text-sm">
        Medication history content goes here...
      </div>
    </div>
  );
}
