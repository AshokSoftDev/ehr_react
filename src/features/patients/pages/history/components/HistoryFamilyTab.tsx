import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Pencil, Plus, Check, Loader2, Save, X, Users, ShieldAlert } from "lucide-react";
import { useFamilyDiseases, useCreateFamilyDisease } from "@/features/family-disease/hooks/useFamilyDisease";
import { usePatientFamilyHistory, useSyncPatientFamilyHistory } from "@/features/patients/hooks/usePatientFamilyHistory";
import { FamilyDiseaseFormSheet, type FamilyDiseaseFormValues } from "@/features/family-disease/components/FamilyDiseaseFormSheet";
import type { SyncPatientFamilyHistoryPayload } from "@/features/patients/types/patientFamilyHistory.types";

interface FamilyHistoryRow {
  id?: number;
  familyDiseaseId: number;
  diseaseName: string;
  mother: boolean;
  father: boolean;
  sisters: boolean;
  brothers: boolean;
  maternalMother: boolean;
  maternalFather: boolean;
  paternalMother: boolean;
  paternalFather: boolean;
  otherRelatives: string;
  comments: string;
}

export default function HistoryFamilyTab({ patientId }: { patientId: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRows, setEditRows] = useState<FamilyHistoryRow[]>([]);
  const [masterSheetOpen, setMasterSheetOpen] = useState(false);

  const { data: masterDiseases = [], isLoading: isMasterLoading } = useFamilyDiseases();
  const { data: historyData = [], isLoading: isHistoryLoading } = usePatientFamilyHistory(patientId);
  const syncMutation = useSyncPatientFamilyHistory(patientId);
  const createMasterMutation = useCreateFamilyDisease();

  const isLoading = isMasterLoading || isHistoryLoading;

  const mergedRows = useMemo(() => {
    const activeMaster = masterDiseases.filter(d => d.status === 1);
    return activeMaster.map(disease => {
      const existing = historyData.find(h => h.family_disease_id === disease.family_disease_id);
      return {
        id: existing?.id,
        familyDiseaseId: disease.family_disease_id,
        diseaseName: disease.diseaseName,
        mother: Boolean(existing?.mother),
        father: Boolean(existing?.father),
        sisters: Boolean(existing?.sisters),
        brothers: Boolean(existing?.brothers),
        maternalMother: Boolean(existing?.maternalMother),
        maternalFather: Boolean(existing?.maternalFather),
        paternalMother: Boolean(existing?.paternalMother),
        paternalFather: Boolean(existing?.paternalFather),
        otherRelatives: existing?.otherRelatives || "",
        comments: existing?.comments || "",
      };
    });
  }, [masterDiseases, historyData]);

  useEffect(() => {
    if (isEditing) {
      setEditRows(prevRows => {
        if (prevRows.length === 0) return mergedRows;
        const existingIds = new Set(prevRows.map(r => r.familyDiseaseId));
        const newRows = mergedRows.filter(r => !existingIds.has(r.familyDiseaseId));
        return [...prevRows, ...newRows].sort((a, b) => a.diseaseName.localeCompare(b.diseaseName));
      });
    } else {
      setEditRows([]);
    }
  }, [isEditing, mergedRows]);

  const handleCheckChange = (index: number, field: keyof FamilyHistoryRow, checked: boolean) => {
    setEditRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: checked };
      return updated;
    });
  };

  const handleTextChange = (index: number, field: 'otherRelatives' | 'comments', value: string) => {
    setEditRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSave = () => {
    const payloads: SyncPatientFamilyHistoryPayload[] = editRows
      .filter(row => {
        return row.mother || row.father || row.sisters || row.brothers ||
          row.maternalMother || row.maternalFather || row.paternalMother ||
          row.paternalFather || Boolean(row.otherRelatives.trim()) || Boolean(row.comments.trim());
      })
      .map(row => ({
        id: row.id,
        familyDiseaseId: row.familyDiseaseId,
        mother: row.mother,
        father: row.father,
        sisters: row.sisters,
        brothers: row.brothers,
        maternalMother: row.maternalMother,
        maternalFather: row.maternalFather,
        paternalMother: row.paternalMother,
        paternalFather: row.paternalFather,
        otherRelatives: row.otherRelatives.trim() || null,
        comments: row.comments.trim() || null,
      }));

    syncMutation.mutate(payloads, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCreateMaster = (values: FamilyDiseaseFormValues) => {
    createMasterMutation.mutate(
      {
        diseaseName: values.diseaseName,
        notes: values.notes,
        status: values.status ? 1 : 0,
      },
      {
        onSuccess: () => {
          setMasterSheetOpen(false);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const rowsToRender = isEditing ? editRows : mergedRows;

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="flex items-center justify-between p-2">
        <div>
          <h3 className="text-lg font-medium flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Family Medical History
          </h3>
          <p className="text-muted-foreground text-sm">
            Record inherited conditions across patient's immediate and extended family members
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMasterSheetOpen(true)}
                className="border-primary/40 text-primary hover:bg-primary/10 shadow-sm text-xs"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Master Disease
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditRows([]);
                }}
                disabled={syncMutation.isPending}
                className="text-xs"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={syncMutation.isPending}
                className="bg-primary-gradient shadow-sm text-xs"
              >
                {syncMutation.isPending ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              size="sm"
              className="bg-primary-gradient shadow-sm text-xs"
            >
              <Pencil className="h-4 w-4 mr-1" />
              Edit History
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-auto border rounded-lg bg-card shadow-sm">
        {rowsToRender.length === 0 ? (
          <div className="text-center py-12 bg-card/50">
            <ShieldAlert className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
            <h3 className="font-medium text-foreground mb-1">No Family Diseases Available in Master</h3>
            <p className="text-sm text-muted-foreground mb-4">Add disease conditions to the Family Disease Master first.</p>
            <Button variant="outline" size="sm" onClick={() => setMasterSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Master Disease
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="min-w-[160px] pl-4 font-semibold text-foreground">Disease</TableHead>
                  <TableHead className="w-[65px] text-center font-semibold text-foreground">Mother</TableHead>
                  <TableHead className="w-[65px] text-center font-semibold text-foreground">Father</TableHead>
                  <TableHead className="w-[75px] text-center font-semibold text-foreground">Sister(s)</TableHead>
                  <TableHead className="w-[85px] text-center font-semibold text-foreground">Brother(s)</TableHead>
                  <TableHead className="w-[85px] text-center font-semibold text-foreground leading-tight">Maternal<br /><span className="text-[11px] font-normal text-muted-foreground">Mother</span></TableHead>
                  <TableHead className="w-[85px] text-center font-semibold text-foreground leading-tight">Maternal<br /><span className="text-[11px] font-normal text-muted-foreground">Father</span></TableHead>
                  <TableHead className="w-[85px] text-center font-semibold text-foreground leading-tight">Paternal<br /><span className="text-[11px] font-normal text-muted-foreground">Mother</span></TableHead>
                  <TableHead className="w-[85px] text-center font-semibold text-foreground leading-tight">Paternal<br /><span className="text-[11px] font-normal text-muted-foreground">Father</span></TableHead>
                  <TableHead className="min-w-[150px] font-semibold text-foreground">Other Relative(s)</TableHead>
                  <TableHead className="min-w-[180px] pr-4 font-semibold text-foreground">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {rowsToRender.map((row, idx) => (
                  <TableRow key={row.familyDiseaseId} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium pl-4 py-2 text-foreground">
                      {row.diseaseName}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.mother}
                            onCheckedChange={(checked) => handleCheckChange(idx, "mother", Boolean(checked))}
                          />
                        </div>
                      ) : row.mother ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.father}
                            onCheckedChange={(checked) => handleCheckChange(idx, "father", Boolean(checked))}
                          />
                        </div>
                      ) : row.father ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.sisters}
                            onCheckedChange={(checked) => handleCheckChange(idx, "sisters", Boolean(checked))}
                          />
                        </div>
                      ) : row.sisters ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.brothers}
                            onCheckedChange={(checked) => handleCheckChange(idx, "brothers", Boolean(checked))}
                          />
                        </div>
                      ) : row.brothers ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.maternalMother}
                            onCheckedChange={(checked) => handleCheckChange(idx, "maternalMother", Boolean(checked))}
                          />
                        </div>
                      ) : row.maternalMother ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.maternalFather}
                            onCheckedChange={(checked) => handleCheckChange(idx, "maternalFather", Boolean(checked))}
                          />
                        </div>
                      ) : row.maternalFather ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.paternalMother}
                            onCheckedChange={(checked) => handleCheckChange(idx, "paternalMother", Boolean(checked))}
                          />
                        </div>
                      ) : row.paternalMother ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="text-center py-2">
                      {isEditing ? (
                        <div className="flex justify-center">
                          <Checkbox
                            checked={row.paternalFather}
                            onCheckedChange={(checked) => handleCheckChange(idx, "paternalFather", Boolean(checked))}
                          />
                        </div>
                      ) : row.paternalFather ? (
                        <span className="flex justify-center"><Check className="h-4 w-4 text-green-600 font-bold" /></span>
                      ) : (
                        <span className="flex justify-center text-muted-foreground/30">-</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2">
                      {isEditing ? (
                        <Input
                          value={row.otherRelatives}
                          onChange={(e) => handleTextChange(idx, "otherRelatives", e.target.value)}
                          placeholder="e.g. Uncle, Cousin..."
                          className="h-8 text-xs bg-background"
                        />
                      ) : row.otherRelatives ? (
                        <span className="text-foreground text-xs">{row.otherRelatives}</span>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">-</span>
                      )}
                    </TableCell>

                    <TableCell className="py-2 pr-4">
                      {isEditing ? (
                        <Input
                          value={row.comments}
                          onChange={(e) => handleTextChange(idx, "comments", e.target.value)}
                          placeholder="Notes..."
                          className="h-8 text-xs bg-background"
                        />
                      ) : row.comments ? (
                        <span className="text-foreground text-xs">{row.comments}</span>
                      ) : (
                        <span className="text-muted-foreground/40 text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <FamilyDiseaseFormSheet
        open={masterSheetOpen}
        onOpenChange={setMasterSheetOpen}
        onSubmit={handleCreateMaster}
        isLoading={createMasterMutation.isPending}
      />
    </div>
  );
}
