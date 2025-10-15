import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientDocumentsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">No documents available.</div>
      </CardContent>
    </Card>
  );
}

export default PatientDocumentsPage;

