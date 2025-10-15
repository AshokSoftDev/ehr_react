import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PatientHistoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-muted-foreground">No history available.</div>
      </CardContent>
    </Card>
  );
}

export default PatientHistoryPage;

