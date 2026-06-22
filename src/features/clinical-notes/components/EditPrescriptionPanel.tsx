import { useState, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  CalendarDays,
  FileText,
  Loader2,
  Pill,
  Plus,
  Save,
  Search,
  Stethoscope,
  Trash2,
  User,
  X,
} from "lucide-react";
import type { VisitItem } from "@/features/visits/types/visit.types";
import type { PrescriptionRow, Prescription } from "@/features/visits/types/prescription.types";
import type { Drug } from "@/features/visits/types/drug.types";
import {
  usePrescriptions,
  useBulkUpdatePrescription,
  useBulkDeletePrescription,
  useBulkCreatePrescription,
} from "@/features/visits/hooks/usePrescriptions";
import { useDrugSearch } from "@/features/visits/hooks/useDrugs";
import { toast } from "@/lib/toast";

const formatDate = (dt?: string | Date) =>
  dt ? new Date(dt).toLocaleDateString() : "";

// Generate unique ID for new rows
const generateId = () => Math.random().toString(36).substring(2, 9);

const DURATION_OPTIONS = ["Days", "Weeks", "Months"];

// Convert Prescription to PrescriptionRow
const prescriptionToRow = (rx: Prescription): PrescriptionRow => ({
  id: generateId(),
  prescription_id: rx.prescription_id,
  drug_id: rx.drug_id ?? undefined,
  drug_name: rx.drug_name,
  drug_generic: rx.drug_generic || "",
  drug_type: rx.drug_type || "",
  drug_dosage: rx.drug_dosage || "",
  drug_measure: rx.drug_measure || "mg",
  duration: rx.duration ?? 3,
  duration_type: rx.duration_type || "Days",
  quantity: rx.quantity ?? 1,
  instruction: rx.instruction || "",
  morning_bf: rx.morning_bf,
  morning_af: rx.morning_af,
  noon_bf: rx.noon_bf,
  noon_af: rx.noon_af,
  evening_bf: rx.evening_bf,
  evening_af: rx.evening_af,
  night_bf: rx.night_bf,
  night_af: rx.night_af,
});

// Empty prescription row template with defaults
const emptyRow = (): PrescriptionRow => ({
  id: generateId(),
  drug_name: "",
  drug_generic: "",
  drug_type: "",
  drug_dosage: "",
  drug_measure: "mg",
  duration: 3,
  duration_type: "Days",
  quantity: 1,
  instruction: "",
  morning_bf: false,
  morning_af: false,
  noon_bf: false,
  noon_af: false,
  evening_bf: false,
  evening_af: false,
  night_bf: false,
  night_af: false,
});

// Per-row drug search component
function DrugSearchCell({ onDrugSelect }: { onDrugSelect: (drug: Drug) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const { data: drugs = [], isLoading } = useDrugSearch(query);

  const handleSelect = (drug: Drug) => {
    onDrugSelect(drug);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-full justify-start gap-2 text-muted-foreground border-dashed hover:border-primary/50 hover:bg-primary/5"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search drug...</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Type drug name..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {isLoading && query.length >= 2 && (
              <div className="p-4 text-center">
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              </div>
            )}
            {!isLoading && query.length >= 2 && drugs.length === 0 && (
              <CommandEmpty>No drugs found</CommandEmpty>
            )}
            {query.length < 2 && (
              <div className="p-4 text-center text-xs text-muted-foreground">
                Type at least 2 characters
              </div>
            )}
            {drugs.length > 0 && (
              <CommandGroup heading="Drugs">
                {drugs.map((drug) => (
                  <CommandItem
                    key={drug.drug_id}
                    value={String(drug.drug_id)}
                    onSelect={() => handleSelect(drug)}
                    className="cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                        <Pill className="h-3 w-3 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{drug.drug_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {drug.drug_generic} • {drug.drug_type} • {drug.drug_dosage}{drug.drug_measure}
                        </p>
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface EditPrescriptionPanelProps {
  visit: VisitItem;
  onBack: () => void;
  onComplete: () => void;
}

export function EditPrescriptionPanel({
  visit,
  onBack,
  onComplete,
}: EditPrescriptionPanelProps) {
  const { data: existingPrescriptions = [], isLoading: loadingPrescriptions } = usePrescriptions(visit.visit_id);
  const [rows, setRows] = useState<PrescriptionRow[]>([]);
  const [initialized, setInitialized] = useState(false);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);

  const bulkUpdate = useBulkUpdatePrescription(visit.visit_id);
  const bulkDelete = useBulkDeletePrescription(visit.visit_id);
  const bulkCreate = useBulkCreatePrescription(visit.visit_id);

  // Initialize rows from existing prescriptions
  useMemo(() => {
    if (!initialized && existingPrescriptions.length > 0) {
      setRows(existingPrescriptions.map(prescriptionToRow));
      setInitialized(true);
    }
  }, [existingPrescriptions, initialized]);

  const updateRow = useCallback((id: string, updates: Partial<PrescriptionRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id);
      // If it's an existing prescription, add to deletedIds
      if (row?.prescription_id) {
        setDeletedIds((d) => [...d, row.prescription_id!]);
      }
      return prev.filter((r) => r.id !== id);
    });
  }, []);

  const addRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  const clearDrugSelection = useCallback((id: string) => {
    updateRow(id, {
      drug_name: "",
      drug_generic: "",
      drug_type: "",
      drug_dosage: "",
      drug_measure: "mg",
      drug_id: undefined,
    });
  }, [updateRow]);

  const handleSave = async () => {
    const validRows = rows.filter((r) => r.drug_name.trim());

    // Check for empty rows with drug names
    if (rows.some((r) => !r.drug_name.trim() && rows.length > 0)) {
      // Remove empty rows before saving
      setRows((prev) => prev.filter((r) => r.drug_name.trim()));
    }

    try {
      // Delete removed prescriptions
      if (deletedIds.length > 0) {
        await bulkDelete.mutateAsync({ prescriptionIds: deletedIds });
      }

      // Separate existing (update) and new (create) rows
      const existingRows = validRows.filter((r) => r.prescription_id);
      const newRows = validRows.filter((r) => !r.prescription_id);

      // Update existing prescriptions
      if (existingRows.length > 0) {
        const updates = existingRows.map((r) => ({
          prescription_id: r.prescription_id!,
          drug_id: r.drug_id,
          drug_name: r.drug_name,
          drug_generic: r.drug_generic,
          drug_type: r.drug_type,
          drug_dosage: r.drug_dosage,
          drug_measure: r.drug_measure,
          duration: r.duration,
          duration_type: r.duration_type,
          quantity: r.quantity,
          instruction: r.instruction,
          morning_bf: r.morning_bf,
          morning_af: r.morning_af,
          noon_bf: r.noon_bf,
          noon_af: r.noon_af,
          evening_bf: r.evening_bf,
          evening_af: r.evening_af,
          night_bf: r.night_bf,
          night_af: r.night_af,
        }));
        await bulkUpdate.mutateAsync({ prescriptions: updates });
      }

      // Create new prescriptions
      if (newRows.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const creates = newRows.map(({ id, prescription_id, ...rest }) => rest);
        await bulkCreate.mutateAsync({ prescriptions: creates });
      }

      toast.success("Prescriptions updated!");
      onComplete();
    } catch {
      toast.error("Failed to update prescriptions");
    }
  };

  const lastRowHasDrug = rows.length > 0 && rows[rows.length - 1].drug_name.trim() !== "";
  const isSaving = bulkUpdate.isPending || bulkDelete.isPending || bulkCreate.isPending;

  if (loadingPrescriptions) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Edit Prescriptions</h2>
      </div>

      {/* Content */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Left Panel - Visit Details */}
        <Card className="w-[280px] shrink-0">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  {visit.patient?.firstName} {visit.patient?.lastName}
                </p>
                {visit.patient?.mrn && (
                  <Badge variant="secondary" className="text-[10px] mt-0.5">
                    MRN: {visit.patient.mrn}
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-muted-foreground">Date:</span>
                <span className="font-medium">{formatDate(visit.visit_date)}</span>
              </div>

              {visit.doctor?.displayName && (
                <div className="flex items-center gap-2 text-xs">
                  <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Doctor:</span>
                  <span className="font-medium truncate">{visit.doctor.displayName}</span>
                </div>
              )}

              {visit.visit_type && (
                <div className="flex items-center gap-2 text-xs">
                  <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Type:</span>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{visit.visit_type}</Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right Panel - Prescription Table */}
        <div className="flex-1 overflow-auto space-y-2">
          {/* Header Bar with gradient */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <Pill className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Edit Prescriptions</p>
                <p className="text-[10px] text-amber-600 dark:text-amber-400">Modify all prescriptions for this visit</p>
              </div>
            </div>

            <div className="flex-1" />

            {/* Save Button */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 text-xs"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              Save Changes
            </Button>
          </div>

          {/* Prescription Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium">Drug Name</th>
                    <th className="px-2 py-2 text-left font-medium w-32">Duration</th>
                    <th className="px-2 py-2 text-left font-medium w-16">Qty</th>
                    <th className="px-2 py-2 text-center font-medium" colSpan={2}>Morning</th>
                    <th className="px-2 py-2 text-center font-medium" colSpan={2}>Afternoon</th>
                    <th className="px-2 py-2 text-center font-medium" colSpan={2}>Night</th>
                    <th className="px-2 py-2 w-10"></th>
                  </tr>
                  <tr className="bg-muted/30">
                    <th></th>
                    <th></th>
                    <th></th>
                    <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">AF</th>
                    <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">BF</th>
                    <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">AF</th>
                    <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">BF</th>
                    <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">AF</th>
                    <th className="px-1 py-1 text-center text-[10px] text-muted-foreground">BF</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const hasDrug = row.drug_name.trim();

                    return (
                      <tr key={row.id} className="border-t hover:bg-muted/20">
                        <td className="px-2 py-1.5 min-w-[180px]">
                          {hasDrug ? (
                            <div className="flex flex-col gap-0.5">
                              <div className="flex items-center gap-1">
                                <Badge variant="secondary" className="px-2 py-0.5 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                                  <Pill className="h-3 w-3 mr-1" />
                                  {row.drug_name}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => clearDrugSelection(row.id)}
                                  className="h-5 w-5 p-0 text-muted-foreground hover:text-destructive"
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                              <p className="text-[10px] text-muted-foreground pl-1">
                                {row.drug_generic} • {row.drug_type} • {row.drug_dosage}{row.drug_measure}
                              </p>
                            </div>
                          ) : (
                            <DrugSearchCell
                              onDrugSelect={(drug) => {
                                updateRow(row.id, {
                                  drug_id: drug.drug_id,
                                  drug_name: drug.drug_name,
                                  drug_generic: drug.drug_generic || "",
                                  drug_type: drug.drug_type || "",
                                  drug_dosage: drug.drug_dosage || "",
                                  drug_measure: drug.drug_measure || "mg",
                                  instruction: drug.instruction || "",
                                });
                              }}
                            />
                          )}
                        </td>
                        <td className="px-2 py-1.5">
                          <div className="flex gap-1 items-center">
                            <Input
                              type="number"
                              value={row.duration || ""}
                              onChange={(e) => updateRow(row.id, { duration: e.target.value ? Number(e.target.value) : undefined })}
                              placeholder="3"
                              className="h-7 text-xs w-12"
                            />
                            <Select
                              value={row.duration_type || "Days"}
                              onValueChange={(val) => updateRow(row.id, { duration_type: val })}
                            >
                              <SelectTrigger className="h-7 w-20 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {DURATION_OPTIONS.map((opt) => (
                                  <SelectItem key={opt} value={opt} className="text-xs">
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="px-2 py-1.5">
                          <Input
                            type="number"
                            value={row.quantity || ""}
                            onChange={(e) => updateRow(row.id, { quantity: e.target.value ? Number(e.target.value) : undefined })}
                            placeholder="1"
                            className="h-7 text-xs w-14"
                          />
                        </td>
                        {/* Morning */}
                        <td className="px-1 py-1.5 text-center">
                          <Checkbox
                            checked={row.morning_af}
                            onCheckedChange={(c) => updateRow(row.id, { morning_af: !!c })}
                          />
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          <Checkbox
                            checked={row.morning_bf}
                            onCheckedChange={(c) => updateRow(row.id, { morning_bf: !!c })}
                          />
                        </td>
                        {/* Afternoon (noon) */}
                        <td className="px-1 py-1.5 text-center">
                          <Checkbox
                            checked={row.noon_af}
                            onCheckedChange={(c) => updateRow(row.id, { noon_af: !!c })}
                          />
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          <Checkbox
                            checked={row.noon_bf}
                            onCheckedChange={(c) => updateRow(row.id, { noon_bf: !!c })}
                          />
                        </td>
                        {/* Night */}
                        <td className="px-1 py-1.5 text-center">
                          <Checkbox
                            checked={row.night_af}
                            onCheckedChange={(c) => updateRow(row.id, { night_af: !!c })}
                          />
                        </td>
                        <td className="px-1 py-1.5 text-center">
                          <Checkbox
                            checked={row.night_bf}
                            onCheckedChange={(c) => updateRow(row.id, { night_bf: !!c })}
                          />
                        </td>
                        <td className="px-2 py-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRow(row.id)}
                            className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Add Row Button */}
            <div className="border-t p-2">
              <Button
                variant="outline"
                size="sm"
                onClick={addRow}
                disabled={rows.length > 0 && !lastRowHasDrug}
                className="h-7 text-xs"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Row
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditPrescriptionPanel;
