import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientClinicalNotesPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clinical Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">No clinical notes available.</div>
      </CardContent>
    </Card>
  );
}

export default PatientClinicalNotesPage;

