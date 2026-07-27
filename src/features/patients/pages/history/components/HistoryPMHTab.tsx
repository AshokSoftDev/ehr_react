import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HeartPulse, Pencil, Search, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePatientPmh, useSyncPatientPmh } from "../../../hooks/usePatientPmh";
import { PatientPmhFormSheet, type PatientPmhFormValues } from "./PatientPmhFormSheet";
import { Loader2 } from "lucide-react";

export default function HistoryPMHTab({ patientId }: { patientId: number }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: pmhs = [], isLoading } = usePatientPmh(patientId);
  const syncMutation = useSyncPatientPmh(patientId);

  const filteredPmhs = useMemo(() => {
    if (!searchQuery) return pmhs;
    const query = searchQuery.toLowerCase();
    return pmhs.filter((p) => 
      p.pmh?.conditionName.toLowerCase().includes(query) ||
      p.comments?.toLowerCase().includes(query)
    );
  }, [pmhs, searchQuery]);

  const handleSubmit = (values: PatientPmhFormValues) => {
    // Filter only selected ones and convert strings back to numbers
    const selected = values.pmhs
      .filter(p => p.selected)
      .map(p => ({
        ...p,
        month: p.month ? Number(p.month) : null,
        year: p.year ? Number(p.year) : null,
      }));
    syncMutation.mutate(selected, {
      onSuccess: () => {
        setSheetOpen(false);
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-2">
      <div className="flex items-center justify-between p-2">
        <div>
          <h3 className="text-lg font-medium">Past Medical History</h3>
          <p className="text-muted-foreground text-sm">
            Manage the patient's past medical history conditions
          </p>
        </div>
        
        <Button 
          onClick={() => setSheetOpen(true)}
          size="sm"
          className="bg-primary-gradient shadow-sm"
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit PMH
        </Button>
      </div>

      <div className="flex items-center gap-2 pb-2 border-b px-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search PMH conditions..."
            className="pl-8 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-md">
        {pmhs.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg bg-card/50 mx-2 mt-2">
            <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">No PMH conditions recorded</h3>
            <p className="text-sm text-muted-foreground mb-4">Click edit to add conditions from the master list</p>
            <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit PMH
            </Button>
          </div>
        ) : filteredPmhs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No PMH conditions found matching "{searchQuery}"
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredPmhs.map((pmh) => (
              <div key={pmh.id} className="group/item relative flex flex-col sm:flex-row justify-between p-2 transition-colors gap-4 bg-card items-start sm:items-center">
                <div className="flex-1 flex gap-3 min-w-0 items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center mt-1">
                    <HeartPulse className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-medium text-foreground break-words">
                      {pmh.pmh?.conditionName || 'Unknown Condition'}
                    </h4>
                    {pmh.comments && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {pmh.comments}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                  {(pmh.month || pmh.year) && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      <span>{pmh.month ? `${String(pmh.month).padStart(2, '0')}/` : ''}{pmh.year}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PatientPmhFormSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        initialData={pmhs}
        onSubmit={handleSubmit}
        isLoading={syncMutation.isPending}
      />
    </div>
  );
}
