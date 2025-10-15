import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientPrescriptionsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">No prescriptions available.</div>
      </CardContent>
    </Card>
  );
}

export default PatientPrescriptionsPage;

