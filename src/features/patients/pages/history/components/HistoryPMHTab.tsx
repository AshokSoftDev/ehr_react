export default function HistoryPMHTab( { patientId: _patientId }: { patientId: number }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Past Medical History (PMH)</h3>
      <div className="text-muted-foreground text-sm">
        PMH content goes here...
      </div>
    </div>
  );
}
