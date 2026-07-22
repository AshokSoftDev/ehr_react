import { useState, useMemo } from "react";
import { Plus, ShieldAlert, Pencil, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  usePatientAllergies,
  useSyncPatientAllergies
} from "@/features/patients/hooks/usePatientAllergies";
import { PatientAllergyFormSheet } from "./PatientAllergyFormSheet";
import type { PatientAllergyPayload } from "@/features/patients/types/patientAllergy.types";
import { SyncPatientAllergyPayload } from "@/features/patients/types/patientAllergy.types";

export default function HistoryAllergyTab({ patientId }: { patientId: number }) {
  const [openForm, setOpenForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: allergies = [], isLoading } = usePatientAllergies(patientId);
  const syncMutation = useSyncPatientAllergies(patientId);

  const handleSubmit = (values: SyncPatientAllergyPayload[]) => {
    syncMutation.mutate(values);
    setOpenForm(false);
  };

  const filteredAllergies = useMemo(() => {
    if (!searchQuery.trim()) return allergies;
    const query = searchQuery.toLowerCase();
    return allergies.filter(
      (a) =>
        a.allergyName.toLowerCase().includes(query) ||
        a.notes?.toLowerCase().includes(query) ||
        a.allergy?.allergyType.toLowerCase().includes(query)
    );
  }, [allergies, searchQuery]);

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Allergies</h3>
          <p className="text-muted-foreground text-sm">Manage patient allergies and reactions</p>
        </div>
        <Button onClick={() => setOpenForm(true)} size="sm" variant="outline" className="border-primary/20 text-primary hover:bg-primary/10">
          <Pencil className="h-4 w-4 mr-1" /> Edit Allergies
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search allergies..."
            className="pl-8 bg-card"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto rounded-md border">
        {isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md"></div>
            ))}
          </div>
        ) : filteredAllergies.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <ShieldAlert className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-1">
              {searchQuery ? "No matching allergies found" : "No allergies recorded"}
            </h3>
            <p className="text-sm">
              {searchQuery ? "Try adjusting your search filter" : 'Click "Edit Allergies" to add one'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredAllergies.map((allergy) => (
              <div key={allergy.id} className="group/item relative flex flex-col sm:flex-row justify-between p-4 transition-colors gap-4 bg-card items-start sm:items-center">
                <div className="flex-1 flex gap-3 min-w-0 items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center mt-1">
                    <ShieldAlert className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="min-w-0 flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-base truncate">{allergy.allergyName}</h3>
                      {allergy.status === 1 ? (
                        <Badge className="bg-green-100 text-green-700 border-none shadow-none text-[10px] h-5 px-1.5 rounded-sm">Active</Badge>
                      ) : (
                        <Badge variant="secondary" className="shadow-none text-[10px] h-5 px-1.5 rounded-sm">Inactive</Badge>
                      )}
                      {allergy.allergy && (
                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 rounded-sm text-muted-foreground">Master: {allergy.allergy.allergyType}</Badge>
                      )}
                    </div>
                    {allergy.notes && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        <span className="font-medium text-foreground">Notes:</span> {allergy.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <PatientAllergyFormSheet
        open={openForm}
        onOpenChange={setOpenForm}
        onSubmit={handleSubmit}
        initialAllergies={allergies}
        isLoading={syncMutation.isPending}
      />
    </div>
  );
}
