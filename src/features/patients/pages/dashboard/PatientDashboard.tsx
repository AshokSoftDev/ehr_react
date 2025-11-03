import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useSearchParams } from "react-router-dom";
import PatientInfoTab from "./components/PatientInfoTab";
import PatientEmergencyTab from "./components/PatientEmergencyTab";

export function PatientDashboard() {
  const { id } = useParams();
  const patientId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'info';

  return (
    <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={(val) => {
        const next = new URLSearchParams(searchParams);
        next.set('tab', val);
        setSearchParams(next, { replace: true });
      }} className="w-full">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Patient Info</TabsTrigger>
          <TabsTrigger value="emergency" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Emergency</TabsTrigger>
          <TabsTrigger value="appointment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Appointment</TabsTrigger>
          <TabsTrigger value="billing" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Billing</TabsTrigger>
          <TabsTrigger value="insurances" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Insurances</TabsTrigger>
          <TabsTrigger value="occupation" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Occupation</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <PatientInfoTab patientId={patientId} />
        </TabsContent>

        <TabsContent value="emergency" className="mt-4">
          <PatientEmergencyTab patientId={patientId} />
        </TabsContent>

        {["appointment", "billing", "insurances", "occupation"].map((key) => (
          <TabsContent key={key} value={key} className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="capitalize">{key}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground">No data available.</div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

export default PatientDashboard;
