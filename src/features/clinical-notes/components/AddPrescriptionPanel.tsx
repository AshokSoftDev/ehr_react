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
  BookTemplate,
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
import type { PrescriptionRow, CreatePrescriptionPayload, PrescriptionTemplate, CreatePrescriptionTemplatePayload } from "@/features/visits/types/prescription.types";
import type { Drug } from "@/features/visits/types/drug.types";
import {
  useBulkCreatePrescription,
} from "@/features/visits/hooks/usePrescriptions";
import { useDrugSearch } from "@/features/visits/hooks/useDrugs";
import { usePrescriptionTemplates, useBulkCreatePrescriptionTemplate } from "@/features/visits/hooks/usePrescriptionTemplates";
import { toast } from "@/lib/toast";

const formatDate = (dt?: string | Date) =>
  dt ? new Date(dt).toLocaleDateString() : "";

// Generate unique ID for new rows
const generateId = () => Math.random().toString(36).substring(2, 9);

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

const DURATION_OPTIONS = ["Days", "Weeks", "Months"];

// Group templates by template_id
function groupTemplates(templates: PrescriptionTemplate[]): { template_id: number; template_name: string; items: PrescriptionTemplate[] }[] {
  const grouped = templates.reduce((acc, t) => {
    if (!acc[t.template_id]) {
      acc[t.template_id] = { template_id: t.template_id, template_name: t.template_name, items: [] };
    }
    acc[t.template_id].items.push(t);
    return acc;
  }, {} as Record<number, { template_id: number; template_name: string; items: PrescriptionTemplate[] }>);
  return Object.values(grouped);
}

// Per-row drug search component with its own popover state
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

interface AddPrescriptionPanelProps {
  visit: VisitItem;
  onBack: () => void;
  onComplete: () => void;
}

export function AddPrescriptionPanel({
  visit,
  onBack,
  onComplete,
}: AddPrescriptionPanelProps) {
  const [rows, setRows] = useState<PrescriptionRow[]>([emptyRow()]);
  
  // Selection state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  
  // Template state
  const [templateName, setTemplateName] = useState("");
  const [templateSearchOpen, setTemplateSearchOpen] = useState(false);
  const [templateSearchQuery, setTemplateSearchQuery] = useState("");

  const bulkCreate = useBulkCreatePrescription(visit.visit_id);
  
  // Template hooks - only fetch when search query is >= 2 characters
  const shouldFetchTemplates = templateSearchQuery.length >= 2;
  const { data: templates = [], isLoading: templatesLoading } = usePrescriptionTemplates(undefined, shouldFetchTemplates ? templateSearchQuery : undefined, shouldFetchTemplates);
  const bulkCreateTemplate = useBulkCreatePrescriptionTemplate();
  
  // Group templates for display
  const groupedTemplates = useMemo(() => groupTemplates(templates), [templates]);

  const updateRow = useCallback((id: string, updates: Partial<PrescriptionRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const removeRow = useCallback((id: string) => {
    setRows((prev) => {
      const filtered = prev.filter((r) => r.id !== id);
      return filtered.length === 0 ? [emptyRow()] : filtered;
    });
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
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
    if (validRows.length === 0) {
      toast.error("Please add at least one prescription");
      return;
    }

    // Check for empty rows
    if (rows.some((r) => !r.drug_name.trim())) {
      toast.error("Please fill all prescription rows or remove empty ones");
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const createPayload: CreatePrescriptionPayload[] = validRows.map(({ id, prescription_id, ...rest }) => rest);
      await bulkCreate.mutateAsync({ prescriptions: createPayload });
      toast.success("Prescriptions saved!");
      onComplete();
    } catch {
      toast.error("Failed to save prescriptions");
    }
  };

  // Selection handlers
  const toggleRowSelection = useCallback((id: string, checked: boolean) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }, []);

  const toggleAllSelection = useCallback(() => {
    const validRows = rows.filter((r) => r.drug_name.trim());
    if (selectedRowIds.size === validRows.length && validRows.length > 0) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(validRows.map((r) => r.id)));
    }
  }, [rows, selectedRowIds.size]);

  // Save template handler
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) return;
    
    const selectedRows = rows.filter((r) => selectedRowIds.has(r.id) && r.drug_name.trim());
    if (selectedRows.length === 0) return;

    const templateId = Math.floor(Math.random() * 2000000000);
    const templatesPayload: CreatePrescriptionTemplatePayload[] = selectedRows.map((row) => ({
      template_id: templateId,
      template_name: templateName.trim(),
      drug_id: row.drug_id,
      drug_name: row.drug_name,
      drug_generic: row.drug_generic,
      drug_type: row.drug_type,
      drug_dosage: row.drug_dosage,
      drug_measure: row.drug_measure,
      instruction: row.instruction,
      duration: row.duration,
      duration_type: row.duration_type,
      quantity: row.quantity,
      morning_bf: row.morning_bf,
      morning_af: row.morning_af,
      noon_bf: row.noon_bf,
      noon_af: row.noon_af,
      evening_bf: row.evening_bf,
      evening_af: row.evening_af,
      night_bf: row.night_bf,
      night_af: row.night_af,
      notes: row.instruction,
    }));

    await bulkCreateTemplate.mutateAsync({ templates: templatesPayload });
    toast.success("Template saved!");
    setTemplateName("");
    setSelectedRowIds(new Set());
  };

  // Load template handler
  const handleLoadTemplate = (templateGroup: { template_id: number; template_name: string; items: PrescriptionTemplate[] }) => {
    const newRows: PrescriptionRow[] = templateGroup.items.map((t) => ({
      id: generateId(),
      drug_id: t.drug_id ?? undefined,
      drug_name: t.drug_name,
      drug_generic: t.drug_generic || "",
      drug_type: t.drug_type || "",
      drug_dosage: t.drug_dosage || "",
      drug_measure: t.drug_measure || "mg",
      duration: t.duration ?? 3,
      duration_type: t.duration_type || "Days",
      quantity: t.quantity ?? 1,
      instruction: t.instruction || "",
      morning_bf: t.morning_bf,
      morning_af: t.morning_af,
      noon_bf: t.noon_bf,
      noon_af: t.noon_af,
      evening_bf: t.evening_bf,
      evening_af: t.evening_af,
      night_bf: t.night_bf,
      night_af: t.night_af,
    }));

    setRows((prev) => {
      const existingValid = prev.filter((r) => r.drug_name.trim());
      return [...existingValid, ...newRows];
    });
    setTemplateSearchOpen(false);
    setTemplateSearchQuery("");
    toast.success(`Loaded template: ${templateGroup.template_name}`);
  };

  const hasValidRows = rows.some((r) => r.drug_name.trim());
  const validRowsCount = rows.filter((r) => r.drug_name.trim()).length;
  const allSelected = selectedRowIds.size === validRowsCount && validRowsCount > 0;
  const hasSelectedRows = selectedRowIds.size > 0;
  const lastRowHasDrug = rows.length > 0 && rows[rows.length - 1].drug_name.trim() !== "";
  const hasEmptyRows = rows.some((r) => !r.drug_name.trim());
  const canSave = hasValidRows && !hasEmptyRows;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Add Prescription</h2>
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
                  <span className="font-medium truncate">Dr. {visit.doctor.displayName}</span>
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

        {/* Right Panel - Prescription Form */}
        <div className="flex-1 overflow-auto space-y-2">
          {/* Template Load Bar with Save Button */}
          <div className="flex items-center gap-3 p-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 border border-amber-200/50 dark:border-amber-800/50">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <BookTemplate className="h-4 w-4 text-amber-600" />
              </div>
              <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Load Template</span>
            </div>
            <Popover open={templateSearchOpen} onOpenChange={setTemplateSearchOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 flex-1 max-w-xs justify-start gap-2 border-amber-300 dark:border-amber-700 bg-white dark:bg-background hover:bg-amber-50 dark:hover:bg-amber-950/50"
                >
                  <Search className="h-3.5 w-3.5 text-amber-600" />
                  <span className="text-muted-foreground text-xs">Search saved templates...</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="start">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search templates..."
                    value={templateSearchQuery}
                    onValueChange={setTemplateSearchQuery}
                  />
                  <CommandList>
                    {templatesLoading && templateSearchQuery.length >= 2 && (
                      <div className="p-4 text-center">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      </div>
                    )}
                    {!templatesLoading && templateSearchQuery.length >= 2 && groupedTemplates.length === 0 && (
                      <CommandEmpty>No templates found</CommandEmpty>
                    )}
                    {templateSearchQuery.length < 2 && (
                      <div className="p-4 text-center text-xs text-muted-foreground">
                        Type at least 2 characters to search
                      </div>
                    )}
                    {groupedTemplates.length > 0 && (
                      <CommandGroup heading="Templates">
                        {groupedTemplates.map((group) => (
                          <CommandItem
                            key={group.template_id}
                            value={String(group.template_id)}
                            onSelect={() => handleLoadTemplate(group)}
                            className="cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                                <BookTemplate className="h-3 w-3 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-sm">{group.template_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {group.items.length} drug{group.items.length > 1 ? "s" : ""}
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
            
            <div className="flex-1" />
            
            {/* Save Template Section (shown when rows selected) */}
            {hasSelectedRows && (
              <>
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Template name..."
                  className="h-8 text-xs w-40 border-emerald-300 dark:border-emerald-700 focus:border-emerald-500"
                />
                <Button
                  size="sm"
                  onClick={handleSaveTemplate}
                  disabled={!templateName.trim() || bulkCreateTemplate.isPending}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {bulkCreateTemplate.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1" />
                  )}
                  Save Template
                </Button>
                <div className="h-6 w-px bg-amber-300/50 dark:bg-amber-700/50" />
              </>
            )}
            
            {/* Main Save Button */}
            <Button
              size="sm"
              onClick={handleSave}
              disabled={!canSave || bulkCreate.isPending}
              className="h-8 text-xs"
            >
              {bulkCreate.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              Save
            </Button>
          </div>

          {/* Prescription Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-2 py-2 w-8">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={toggleAllSelection}
                        disabled={validRowsCount === 0}
                      />
                    </th>
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
                    const isSelected = selectedRowIds.has(row.id);

                    return (
                      <tr key={row.id} className="border-t hover:bg-muted/20">
                        <td className="px-2 py-1.5 text-center">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(c) => toggleRowSelection(row.id, !!c)}
                            disabled={!hasDrug}
                          />
                        </td>
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
                disabled={!lastRowHasDrug}
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

export default AddPrescriptionPanel;
