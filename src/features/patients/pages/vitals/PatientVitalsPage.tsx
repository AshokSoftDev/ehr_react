import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientVitalsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitals</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">No vitals available.</div>
      </CardContent>
    </Card>
  );
}

export default PatientVitalsPage;

