import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientConsentPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Consent</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">No consent records available.</div>
      </CardContent>
    </Card>
  );
}

export default PatientConsentPage;

