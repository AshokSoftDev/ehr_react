import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Pencil, Plus, Loader2, Save, X, Coffee, ShieldAlert, RotateCcw } from "lucide-react";
import { useSocialMaster, useCreateSocialMaster } from "@/features/social/hooks/useSocialMaster";
import { usePatientSocialHistory, useSyncPatientSocialHistory } from "@/features/patients/hooks/usePatientSocialHistory";
import { SocialFormSheet, type SocialFormValues } from "@/features/social/components/SocialFormSheet";
import type { SyncPatientSocialHistoryPayload } from "@/features/patients/types/patientSocialHistory.types";

interface SocialHistoryRow {
  id?: number;
  socialMasterId: number;
  socialName: string;
  option1: string;
  option2: string;
  selectedOption: number | null;
  comments: string;
}

export default function HistorySocialTab({ patientId }: { patientId: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editRows, setEditRows] = useState<SocialHistoryRow[]>([]);
  const [masterSheetOpen, setMasterSheetOpen] = useState(false);

  const { data: masterItems = [], isLoading: isMasterLoading } = useSocialMaster();
  const { data: historyData = [], isLoading: isHistoryLoading } = usePatientSocialHistory(patientId);
  const syncMutation = useSyncPatientSocialHistory(patientId);
  const createMasterMutation = useCreateSocialMaster();

  const isLoading = isMasterLoading || isHistoryLoading;

  const mergedRows = useMemo(() => {
    const activeMaster = masterItems.filter(d => d.status === 1);
    return activeMaster.map(item => {
      const existing = historyData.find(h => h.social_master_id === item.social_master_id);
      return {
        id: existing?.id,
        socialMasterId: item.social_master_id,
        socialName: item.socialName,
        option1: item.option1,
        option2: item.option2,
        selectedOption: existing?.selectedOption ?? null,
        comments: existing?.comments || "",
      };
    });
  }, [masterItems, historyData]);

  useEffect(() => {
    if (isEditing) {
      setEditRows(prevRows => {
        if (prevRows.length === 0) return mergedRows;
        const existingIds = new Set(prevRows.map(r => r.socialMasterId));
        const newRows = mergedRows.filter(r => !existingIds.has(r.socialMasterId));
        return [...prevRows, ...newRows].sort((a, b) => a.socialName.localeCompare(b.socialName));
      });
    } else {
      setEditRows([]);
    }
  }, [isEditing, mergedRows]);

  const handleOptionChange = (index: number, option: number | null) => {
    setEditRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], selectedOption: option };
      return updated;
    });
  };

  const handleTextChange = (index: number, value: string) => {
    setEditRows(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], comments: value };
      return updated;
    });
  };

  const handleSave = () => {
    const payloads: SyncPatientSocialHistoryPayload[] = editRows
      .filter(row => {
        return row.selectedOption !== null || Boolean(row.comments.trim());
      })
      .map(row => ({
        id: row.id,
        socialMasterId: row.socialMasterId,
        selectedOption: row.selectedOption,
        comments: row.comments.trim() || null,
      }));

    syncMutation.mutate(payloads, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCreateMaster = (values: SocialFormValues) => {
    createMasterMutation.mutate(
      {
        socialName: values.socialName,
        option1: values.option1,
        option2: values.option2,
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
            <Coffee className="h-5 w-5 text-primary" />
            Social & Lifestyle History
          </h3>
          <p className="text-muted-foreground text-sm">
            Record patient habits, substance use, and social lifestyle conditions
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
                Add Master Social
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
            <h3 className="font-medium text-foreground mb-1">No Social Items Available in Master</h3>
            <p className="text-sm text-muted-foreground mb-4">Add habits and conditions to the Social History Master first.</p>
            <Button variant="outline" size="sm" onClick={() => setMasterSheetOpen(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Master Social
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="w-full text-sm">
              <TableHeader className="bg-muted/30 sticky top-0 z-10">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[30%] pl-4 font-semibold text-foreground">Social Habit / Condition</TableHead>
                  <TableHead className="w-[40%] text-center font-semibold text-foreground">Option Selection</TableHead>
                  <TableHead className="w-[30%] pr-4 font-semibold text-foreground">Comments</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border">
                {rowsToRender.map((row, idx) => (
                  <TableRow key={row.socialMasterId} className="hover:bg-muted/20 transition-colors">
                    <TableCell className="font-medium pl-4 py-3 text-foreground align-middle">
                      <span className="text-base font-medium">{row.socialName}</span>
                    </TableCell>

                    <TableCell className="text-center py-3 align-middle">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-6 flex-wrap">
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors bg-card shadow-xs">
                            <input
                              type="radio"
                              name={`social-option-${row.socialMasterId}`}
                              checked={row.selectedOption === 1}
                              onChange={() => handleOptionChange(idx, 1)}
                              className="h-4 w-4 accent-primary text-primary focus:ring-primary cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-700">{row.option1}</span>
                          </label>
                          
                          <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors bg-card shadow-xs">
                            <input
                              type="radio"
                              name={`social-option-${row.socialMasterId}`}
                              checked={row.selectedOption === 2}
                              onChange={() => handleOptionChange(idx, 2)}
                              className="h-4 w-4 accent-primary text-primary focus:ring-primary cursor-pointer"
                            />
                            <span className="text-sm font-medium text-slate-700">{row.option2}</span>
                          </label>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={row.selectedOption === null}
                            onClick={() => handleOptionChange(idx, null)}
                            className="h-8 px-2 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            title="Clear selection"
                          >
                            <RotateCcw className="h-3 w-3 mr-1" />
                            Clear
                          </Button>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          {row.selectedOption === 1 ? (
                            <Badge className="bg-primary/15 text-primary border border-primary/20 hover:bg-primary/15 text-xs px-3 py-1 font-semibold rounded-full shadow-none">
                              {row.option1}
                            </Badge>
                          ) : row.selectedOption === 2 ? (
                            <Badge className="bg-amber-50 text-amber-800 border border-amber-200/60 hover:bg-amber-50 text-xs px-3 py-1 font-semibold rounded-full shadow-none">
                              {row.option2}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground/40 italic text-xs">Not Recorded</span>
                          )}
                        </div>
                      )}
                    </TableCell>

                    <TableCell className="pr-4 py-3 align-middle">
                      {isEditing ? (
                        <Input
                          placeholder="Add comments or clinical context..."
                          value={row.comments}
                          onChange={(e) => handleTextChange(idx, e.target.value)}
                          className="h-9 w-full text-xs"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm block">
                          {row.comments || <span className="text-muted-foreground/30">-</span>}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      <SocialFormSheet
        open={masterSheetOpen}
        onOpenChange={setMasterSheetOpen}
        onSubmit={handleCreateMaster}
        isLoading={createMasterMutation.isPending}
      />
    </div>
  );
}
