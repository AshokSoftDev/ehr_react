import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useParams, useSearchParams } from 'react-router-dom';

export function PatientVisitPage() {
  const { id } = useParams();
  const patientId = Number(id);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'overview';

  return (
    <div className="space-y-4">
      <Tabs
        value={currentTab}
        onValueChange={(val) => {
          const next = new URLSearchParams(searchParams);
          next.set('tab', val);
          setSearchParams(next, { replace: true });
        }}
        className="w-full"
      >
        <TabsList className="bg-muted/30">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Overview</TabsTrigger>
          <TabsTrigger value="hpi" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">HPI</TabsTrigger>
          <TabsTrigger value="treatment" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Treatment</TabsTrigger>
          <TabsTrigger value="treatment2" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Treatment 2</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="capitalize">Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Overview content for patient #{patientId}.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hpi" className="mt-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="capitalize">HPI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">History of Present Illness details.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment" className="mt-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="capitalize">Treatment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Treatment plan and procedures.</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatment2" className="mt-4">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle className="capitalize">Treatment 2</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-muted-foreground">Additional treatment notes.</div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PatientVisitPage;
