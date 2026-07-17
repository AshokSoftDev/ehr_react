export default function HistoryFamilyTab( { patientId: _patientId }: { patientId: number }) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium mb-4">Family History</h3>
      <div className="text-muted-foreground text-sm">
        Family history content goes here...
      </div>
    </div>
  );
}
