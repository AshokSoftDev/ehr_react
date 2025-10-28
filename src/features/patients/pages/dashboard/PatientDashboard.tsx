import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams } from "react-router-dom";
import PatientInfoTab from "./components/PatientInfoTab";
import PatientEmergencyTab from "./components/PatientEmergencyTab";

export function PatientDashboard() {
  const { id } = useParams();
  const patientId = Number(id);

  return (
    <div className="space-y-4">
      {/* Snapshot cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Drug Allergy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-xl font-semibold">None Reported</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">Balance Due</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground text-xl font-semibold">$0.00</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Patient Info</TabsTrigger>
          <TabsTrigger value="emergency" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Emergency</TabsTrigger>
          <TabsTrigger value="appointment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Appointment</TabsTrigger>
          <TabsTrigger value="visit" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Visit</TabsTrigger>
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

        {["appointment", "visit", "billing", "insurances", "occupation"].map((key) => (
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

