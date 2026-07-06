import { toothImages } from "@/assets/toothImages";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import {
  useDentalHpiList,
  useCreateDentalHpi,
  useUpdateDentalHpi,
  useDeleteDentalHpi,
} from "@/features/visits/hooks/useDentalHpi";
import type { DentalHPI } from "@/features/visits/types/dentalHpi.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type DentitionView = "primary" | "mixed" | "permanent";

type SeverityOption = "mild" | "moderate" | "severe";

type ToothRegionId =
  | "rightTop"
  | "rightBottom"
  | "center"
  | "leftTop"
  | "leftBottom";

type Duration = {
  years: string;
  months: string;
  weeks: string;
  days: string;
};

type ToothRegionMap = Record<string, ToothRegionId[]>;

type ChiefComplaintId =
  | "toothache"
  | "brokenFilling"
  | "swelling"
  | "bleedingGums"
  | "crookedTeeth"
  | "brokenTeeth"
  | "missingTeeth"
  | "sensitivity"
  | "cavity"
  | "badBreath"
  | "discoloredTeeth"
  | "injuredTeeth";

type ChiefComplaintOption = {
  id: ChiefComplaintId;
  label: string;
};



const CHIEF_COMPLAINT_OPTIONS: ChiefComplaintOption[] = [
  { id: "toothache", label: "Toothache" },
  { id: "brokenFilling", label: "Broken Filling" },
  { id: "swelling", label: "Swelling" },
  { id: "bleedingGums", label: "Bleeding Gums" },
  { id: "crookedTeeth", label: "Crooked Teeth" },
  { id: "brokenTeeth", label: "Broken Teeth" },
  { id: "missingTeeth", label: "Missing Teeth" },
  { id: "sensitivity", label: "Sensitivity" },
  { id: "cavity", label: "Cavity" },
  { id: "badBreath", label: "Bad Breath" },
  { id: "discoloredTeeth", label: "Discolored Teeth" },
  { id: "injuredTeeth", label: "Injured Teeth" },
];

const PERMANENT_UPPER = [
  "18",
  "17",
  "16",
  "15",
  "14",
  "13",
  "12",
  "11",
  "21",
  "22",
  "23",
  "24",
  "25",
  "26",
  "27",
  "28",
] as const;

const PERMANENT_LOWER = [
  "48",
  "47",
  "46",
  "45",
  "44",
  "43",
  "42",
  "41",
  "31",
  "32",
  "33",
  "34",
  "35",
  "36",
  "37",
  "38",
] as const;

const PRIMARY_UPPER = [
  "55",
  "54",
  "53",
  "52",
  "51",
  "61",
  "62",
  "63",
  "64",
  "65",
] as const;

const PRIMARY_LOWER = [
  "85",
  "84",
  "83",
  "82",
  "81",
  "71",
  "72",
  "73",
  "74",
  "75",
] as const;

const MIXED_LAYOUT = {
  permanentUpper: PERMANENT_UPPER,
  permanentLower: PERMANENT_LOWER,
  primaryUpper: PRIMARY_UPPER,
  primaryLower: PRIMARY_LOWER,
} as const;

interface ToothSurfaceMapProps {
  selectedRegions: ToothRegionId[];
  onToggleRegion: (region: ToothRegionId) => void;
}

// Dental tooth surface selector - round center with 4 curved quadrant sections
function ToothSurfaceMap({
  selectedRegions,
  onToggleRegion,
}: ToothSurfaceMapProps) {
  const isSelected = (region: ToothRegionId) => selectedRegions.includes(region);
  const allSelected = selectedRegions.length === 5;

  // CSS for curved quadrant sections around center circle
  // Each quadrant is a quarter-circle arc that wraps around the center
  const quadrantStyles = {
    topLeft: {
      clipPath: "polygon(0 0, 50% 0, 50% 50%, 0 50%)",
      borderRadius: "0 0 100% 0",
    },
    topRight: {
      clipPath: "polygon(50% 0, 100% 0, 100% 50%, 50% 50%)",
      borderRadius: "0 0 0 100%",
    },
    bottomLeft: {
      clipPath: "polygon(0 50%, 50% 50%, 50% 100%, 0 100%)",
      borderRadius: "0 100% 0 0",
    },
    bottomRight: {
      clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)",
      borderRadius: "100% 0 0 0",
    },
  };

  const getQuadrantColor = (region: ToothRegionId) => {
    return isSelected(region)
      ? "bg-primary"
      : "bg-slate-200 dark:bg-slate-700 hover:bg-primary/20 dark:hover:bg-primary/30";
  };

  return (
    <div className="mt-2 flex flex-col items-center gap-1">
      {/* Square container with curved sections */}
      <div className={`
        relative w-14 h-14
        border-2 rounded-lg transition-all duration-300
        ${allSelected
          ? "border-primary shadow-lg shadow-primary/30"
          : "border-slate-400 dark:border-slate-500"
        }
        bg-slate-100 dark:bg-slate-800
        overflow-hidden
      `}>
        {/* Top-Left quadrant */}
        <button
          type="button"
          onClick={() => onToggleRegion("leftTop")}
          className={`
            absolute inset-0 cursor-pointer transition-colors duration-150
            ${getQuadrantColor("leftTop")}
            ${allSelected ? "border-r border-b border-white/50" : ""}
          `}
          style={quadrantStyles.topLeft}
          title="Top-Left (Mesial)"
        />

        {/* Top-Right quadrant */}
        <button
          type="button"
          onClick={() => onToggleRegion("rightTop")}
          className={`
            absolute inset-0 cursor-pointer transition-colors duration-150
            ${getQuadrantColor("rightTop")}
            ${allSelected ? "border-l border-b border-white/50" : ""}
          `}
          style={quadrantStyles.topRight}
          title="Top-Right (Distal)"
        />

        {/* Bottom-Left quadrant */}
        <button
          type="button"
          onClick={() => onToggleRegion("leftBottom")}
          className={`
            absolute inset-0 cursor-pointer transition-colors duration-150
            ${getQuadrantColor("leftBottom")}
            ${allSelected ? "border-r border-t border-white/50" : ""}
          `}
          style={quadrantStyles.bottomLeft}
          title="Bottom-Left (Buccal)"
        />

        {/* Bottom-Right quadrant */}
        <button
          type="button"
          onClick={() => onToggleRegion("rightBottom")}
          className={`
            absolute inset-0 cursor-pointer transition-colors duration-150
            ${getQuadrantColor("rightBottom")}
            ${allSelected ? "border-l border-t border-white/50" : ""}
          `}
          style={quadrantStyles.bottomRight}
          title="Bottom-Right (Lingual)"
        />

        {/* Divider lines between quadrants */}
        <div className="absolute top-0 bottom-0 left-1/2 w-px bg-slate-400/50 dark:bg-slate-500/50 pointer-events-none" />
        <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-400/50 dark:bg-slate-500/50 pointer-events-none" />

        {/* Center circle (Occlusal) - larger size */}
        <button
          type="button"
          onClick={() => onToggleRegion("center")}
          className={`
            absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-7 h-7 rounded-full
            transition-all duration-150
            flex items-center justify-center
            text-[10px] font-bold
            border-2 z-10
            ${isSelected("center")
              ? "bg-primary text-primary-foreground border-primary/80"
              : "bg-white dark:bg-slate-600 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-500 hover:bg-primary/10 hover:border-primary hover:text-primary"
            }
          `}
          title="Center (Occlusal)"
        >
          O
        </button>

        {/* Corner labels */}
        <span className={`absolute top-0.5 left-1 text-[7px] font-bold pointer-events-none z-20 ${isSelected("leftTop") ? "text-primary-foreground" : "text-slate-500"}`}>M</span>
        <span className={`absolute top-0.5 right-1 text-[7px] font-bold pointer-events-none z-20 ${isSelected("rightTop") ? "text-primary-foreground" : "text-slate-500"}`}>D</span>
        <span className={`absolute bottom-0.5 left-1 text-[7px] font-bold pointer-events-none z-20 ${isSelected("leftBottom") ? "text-primary-foreground" : "text-slate-500"}`}>B</span>
        <span className={`absolute bottom-0.5 right-1 text-[7px] font-bold pointer-events-none z-20 ${isSelected("rightBottom") ? "text-primary-foreground" : "text-slate-500"}`}>L</span>
      </div>

      {/* Selection indicator */}
      <div className={`
        text-[8px] font-medium px-1.5 py-0.5 rounded-full transition-all
        ${allSelected
          ? "bg-primary/20 text-primary dark:bg-primary/30"
          : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"
        }
      `}>
        {selectedRegions.length}/5
      </div>
    </div>
  );
}

interface ToothProps {
  toothNumber: string;
  selected: boolean;
  regions: ToothRegionId[];
  onToggle: (toothNumber: string) => void;
  onToggleRegion: (toothNumber: string, region: ToothRegionId) => void;
}

function Tooth({
  toothNumber,
  selected,
  regions,
  onToggle,
  onToggleRegion,
}: ToothProps) {
  const imageSrc = toothImages[toothNumber];

  return (
    <div className="flex w-[72px] flex-col items-center">
      <button
        type="button"
        onClick={() => onToggle(toothNumber)}
        className={`flex flex-col items-center rounded-lg p-1.5 outline-none transition ${selected ? "bg-primary/10 ring-2 ring-primary shadow-sm" : "hover:bg-primary/5"
          }`}
      >
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={`Tooth ${toothNumber}`}
            className="h-20 w-20 object-contain"
          />
        ) : (
          <div className="h-20 w-20 rounded-lg bg-gray-100" />
        )}
        <span className="mt-1 text-xs font-semibold text-foreground">
          {toothNumber}
        </span>
      </button>

      {selected && (
        <ToothSurfaceMap
          selectedRegions={regions}
          onToggleRegion={(region) => onToggleRegion(toothNumber, region)}
        />
      )}
    </div>
  );
}

const PERMANENT_SLOT_COUNT = PERMANENT_UPPER.length;

function renderArch(
  teeth: readonly string[],
  selectedTeeth: Set<string>,
  onToggle: (toothNumber: string) => void,
  toothRegions: ToothRegionMap,
  onToggleRegion: (toothNumber: string, region: ToothRegionId) => void,
) {
  return (
    <div className="flex justify-center space-x-1">
      {teeth.map((tooth) => (
        <Tooth
          key={tooth}
          toothNumber={tooth}
          selected={selectedTeeth.has(tooth)}
          regions={toothRegions[tooth] ?? []}
          onToggle={onToggle}
          onToggleRegion={onToggleRegion}
        />
      ))}
    </div>
  );
}

function renderAlignedPrimaryArch(
  teeth: readonly string[],
  selectedTeeth: Set<string>,
  onToggle: (toothNumber: string) => void,
  toothRegions: ToothRegionMap,
  onToggleRegion: (toothNumber: string, region: ToothRegionId) => void,
) {
  const totalSlots = PERMANENT_SLOT_COUNT;
  const missing = totalSlots - teeth.length;
  const leftSpacers = Math.floor(missing / 2);
  const rightSpacers = missing - leftSpacers;

  return (
    <div className="flex justify-center space-x-1">
      {Array.from({ length: leftSpacers }).map((_, index) => (
        <div key={`left-spacer-${index}`} className="h-10 w-10" />
      ))}

      {teeth.map((tooth) => (
        <Tooth
          key={tooth}
          toothNumber={tooth}
          selected={selectedTeeth.has(tooth)}
          regions={toothRegions[tooth] ?? []}
          onToggle={onToggle}
          onToggleRegion={onToggleRegion}
        />
      ))}

      {Array.from({ length: rightSpacers }).map((_, index) => (
        <div key={`right-spacer-${index}`} className="h-10 w-10" />
      ))}
    </div>
  );
}

interface DentitionToggleProps {
  view: DentitionView;
  onChange: (view: DentitionView) => void;
}

function DentitionToggle({ view, onChange }: DentitionToggleProps) {
  const options: { value: DentitionView; label: string }[] = [
    { value: "primary", label: "Primary Dentition" },
    { value: "mixed", label: "Mixed Dentition" },
    { value: "permanent", label: "Permanent Dentition" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4">
      {options.map((option) => {
        const selected = view === option.value;

        return (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${selected ? "border-primary" : "border-gray-300"
                }`}
            >
              {selected && <span className="h-2 w-2 rounded-full bg-primary" />}
            </span>
            <input
              type="radio"
              className="sr-only"
              checked={selected}
              onChange={() => onChange(option.value)}
            />
            <span
              className={`text-sm ${selected ? "font-semibold text-primary" : "text-foreground"
                }`}
            >
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}

interface HPIDentalChartProps {
  visitId?: number;
  isReadOnly?: boolean;
}

export function HPIDentalChart({ visitId, isReadOnly }: HPIDentalChartProps) {
  const [view, setView] = useState<DentitionView>("primary");
  const [selectedTeeth, setSelectedTeeth] = useState<string[]>([]);
  const [selectedComplaints, setSelectedComplaints] = useState<
    ChiefComplaintId[]
  >([]);
  const [severity, setSeverity] = useState<SeverityOption | "">("");
  const [duration, setDuration] = useState<Duration>({
    years: "",
    months: "",
    weeks: "",
    days: "",
  });
  const [notes, setNotes] = useState("");
  const [toothRegions, setToothRegions] = useState<ToothRegionMap>({});
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // API hooks
  const { data: apiEntries = [], isLoading } = useDentalHpiList(visitId);
  const createMutation = useCreateDentalHpi(visitId);
  const updateMutation = useUpdateDentalHpi(visitId);
  const deleteMutation = useDeleteDentalHpi(visitId);

  const selectedTeethSet = new Set(selectedTeeth);

  const handleChangeView = (nextView: DentitionView) => {
    setView(nextView);
    setSelectedTeeth([]);
    setToothRegions({});
  };

  const handleToggleTooth = (toothNumber: string) => {
    const ALL_REGIONS: ToothRegionId[] = ["leftTop", "rightTop", "leftBottom", "rightBottom", "center"];

    setSelectedTeeth((prev) => {
      if (prev.includes(toothNumber)) {
        // Deselect tooth - remove all its regions
        setToothRegions((prevRegions) => {
          const { [toothNumber]: removed, ...rest } = prevRegions;
          void removed; // suppress unused variable warning
          return rest;
        });
        return prev.filter((t) => t !== toothNumber);
      }
      // Select tooth - auto-select all 5 regions
      setToothRegions((prevRegions) => ({
        ...prevRegions,
        [toothNumber]: ALL_REGIONS,
      }));
      return [...prev, toothNumber];
    });
  };

  const handleToggleRegion = (toothNumber: string, region: ToothRegionId) => {
    setToothRegions((prev) => {
      const current = prev[toothNumber] ?? [];
      const exists = current.includes(region);
      const nextForTooth = exists
        ? current.filter((value) => value !== region)
        : [...current, region];

      return {
        ...prev,
        [toothNumber]: nextForTooth,
      };
    });
  };

  const handleToggleComplaint = (id: ChiefComplaintId) => {
    setSelectedComplaints((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const handleDurationChange = (field: keyof Duration, value: string) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    setDuration((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleClearForm = () => {
    setSelectedTeeth([]);
    setToothRegions({});
    setSelectedComplaints([]);
    setSeverity("");
    setDuration({
      years: "",
      months: "",
      weeks: "",
      days: "",
    });
    setNotes("");
    setEditingId(null);
  };

  const handleSaveEntry = async () => {
    if (!selectedTeeth.length || !visitId) {
      return;
    }

    const payload = {
      dentition_type: view as "primary" | "mixed" | "permanent",
      teeth_surfaces: toothRegions,
      chief_complaints: selectedComplaints,
      severity: severity || undefined,
      duration_years: parseInt(duration.years) || 0,
      duration_months: parseInt(duration.months) || 0,
      duration_weeks: parseInt(duration.weeks) || 0,
      duration_days: parseInt(duration.days) || 0,
      notes: notes || undefined,
    };

    if (editingId) {
      // Update existing entry
      await updateMutation.mutateAsync({ hpiId: editingId, payload });
    } else {
      // Create new entry
      await createMutation.mutateAsync(payload);
    }

    handleClearForm();
  };

  const handleEditEntry = (entry: DentalHPI) => {
    // Load entry data into the form for editing
    setView(entry.dentition_type as DentitionView);
    setSelectedTeeth(Object.keys(entry.teeth_surfaces));
    setToothRegions(entry.teeth_surfaces as ToothRegionMap);
    setSelectedComplaints(entry.chief_complaints as ChiefComplaintId[]);
    setSeverity((entry.severity as SeverityOption) || "");
    setDuration({
      years: entry.duration_years?.toString() || "",
      months: entry.duration_months?.toString() || "",
      weeks: entry.duration_weeks?.toString() || "",
      days: entry.duration_days?.toString() || "",
    });
    setNotes(entry.notes || "");
    setEditingId(entry.hpi_id);
  };

  const handleDeleteEntry = async (hpiId: number) => {
    setDeleteConfirmId(hpiId);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId) {
      await deleteMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    }
  };

  const renderDurationText = (value: Duration) => {
    const parts: string[] = [];

    if (value.years) {
      parts.push(`${value.years}y`);
    }

    if (value.months) {
      parts.push(`${value.months}m`);
    }

    if (value.weeks) {
      parts.push(`${value.weeks}w`);
    }

    if (value.days) {
      parts.push(`${value.days}d`);
    }

    return parts.join(" ") || "-";
  };

  return (
    <div className="py-0 px-1">
      <div className="grid gap-2 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div className={cn("flex flex-col gap-2", isReadOnly && "pointer-events-none")}>
          <DentitionToggle view={view} onChange={handleChangeView} />

          {view === "permanent" && (
            <div className="mt-2 space-y-1">
              {renderArch(
                PERMANENT_UPPER,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}

              {renderArch(
                PERMANENT_LOWER,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}
            </div>
          )}

          {view === "primary" && (
            <div className="mt-2 space-y-1">
              {renderAlignedPrimaryArch(
                PRIMARY_UPPER,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}

              {renderAlignedPrimaryArch(
                PRIMARY_LOWER,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}
            </div>
          )}

          {view === "mixed" && (
            <div className="mt-2 space-y-1">
              {renderArch(
                MIXED_LAYOUT.permanentUpper,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}

              {renderAlignedPrimaryArch(
                MIXED_LAYOUT.primaryUpper,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}

              {renderAlignedPrimaryArch(
                MIXED_LAYOUT.primaryLower,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}

              {renderArch(
                PERMANENT_LOWER,
                selectedTeethSet,
                handleToggleTooth,
                toothRegions,
                handleToggleRegion
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-l border-border pl-3">
          {!isReadOnly && (
            <>
              {/* Selected Teeth Badge */}
              <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5">
                <span className="text-xs font-semibold text-foreground">Selected:</span>
                <span className="text-xs font-medium text-primary">
                  {selectedTeeth.length ? [...selectedTeeth].sort().join(", ") : "None"}
                </span>
              </div>

              {/* Compact Two-Column Layout */}
              <div className="grid gap-3 md:grid-cols-2">
                {/* Chief Complaints */}
                <div className="rounded-lg border border-border bg-muted/30 p-2">
                  <div className="mb-1.5 text-xs font-semibold text-primary">Chief Complaints</div>
                  <div className="grid grid-cols-2 gap-x-2 gap-y-0.5">
                    {CHIEF_COMPLAINT_OPTIONS.map((option) => (
                      <label
                        key={option.id}
                        className="flex cursor-pointer items-center gap-1.5"
                      >
                        <input
                          type="checkbox"
                          className="h-3 w-3 rounded border-gray-300 text-primary focus:ring-primary"
                          checked={selectedComplaints.includes(option.id)}
                          onChange={() => handleToggleComplaint(option.id)}
                        />
                        <span className="text-[11px] text-foreground">{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Severity & Duration */}
                <div className="space-y-2">
                  {/* Severity */}
                  <div className="rounded-lg border border-border bg-muted/30 p-2">
                    <div className="mb-1 text-xs font-semibold text-primary">Severity</div>
                    <div className="flex gap-3">
                      {(["mild", "moderate", "severe"] as SeverityOption[]).map((level) => {
                        const label = level.charAt(0).toUpperCase() + level.slice(1);
                        const selected = severity === level;
                        return (
                          <label
                            key={level}
                            className="flex cursor-pointer items-center gap-1"
                            onClick={() => setSeverity(selected ? "" : level)}
                          >
                            <span
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${selected ? "border-primary" : "border-gray-300"
                                }`}
                            >
                              {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                            </span>
                            <span className={`text-[11px] ${selected ? "font-semibold text-primary" : "text-foreground"}`}>
                              {label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="rounded-lg border border-border bg-muted/30 p-2">
                    <div className="mb-1 text-xs font-semibold text-primary">Duration</div>
                    <div className="grid grid-cols-4 gap-1">
                      {(["years", "months", "weeks", "days"] as (keyof Duration)[]).map((field) => (
                        <div key={field} className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-muted-foreground capitalize">{field.slice(0, 1).toUpperCase()}</span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={duration[field]}
                            onChange={(e) => handleDurationChange(field, e.target.value)}
                            className="h-6 w-full rounded border border-input bg-background px-1 text-center text-[11px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes - More Compact */}
              <div className="rounded-lg border border-border bg-muted/30 p-2">
                <div className="mb-1 text-xs font-semibold text-primary">Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded border border-input bg-background px-2 py-1 text-[11px] text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Additional notes..."
                />
              </div>

              {/* Action Buttons - Inline */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={!selectedTeeth.length || createMutation.isPending || updateMutation.isPending}
                  className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Saving..."
                    : editingId
                      ? "Update"
                      : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="rounded-md border border-input bg-background px-3 py-1 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Clear
                </button>
              </div>
            </>
          )}

          <div className="mt-2 overflow-x-auto rounded border border-primary/30">
            <table className="min-w-full text-xs">
              <thead className="bg-primary text-primary-foreground">
                <tr>
                  <th className="px-2 py-1 text-left font-semibold">Tooth</th>
                  <th className="px-2 py-1 text-left font-semibold">
                    Chief Complaints
                  </th>
                  <th className="px-2 py-1 text-left font-semibold">
                    Severity
                  </th>
                  <th className="px-2 py-1 text-left font-semibold">
                    Duration
                  </th>
                  {!isReadOnly && <th className="px-2 py-1 text-left font-semibold">Action</th>}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-2 py-3 text-center text-muted-foreground"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : apiEntries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isReadOnly ? 4 : 5}
                      className="px-2 py-3 text-center text-muted-foreground"
                    >
                      No entries added yet.
                    </td>
                  </tr>
                ) : (
                  apiEntries.map((entry) => {
                    const teeth = Object.keys(entry.teeth_surfaces).sort();
                    const complaintsText = (entry.chief_complaints as string[])
                      .map(
                        (id) =>
                          CHIEF_COMPLAINT_OPTIONS.find(
                            (option) => option.id === id
                          )?.label
                      )
                      .filter((label): label is string => Boolean(label))
                      .join(", ") || "-";

                    const severityLabel = entry.severity
                      ? entry.severity.charAt(0).toUpperCase() +
                      entry.severity.slice(1)
                      : "-";

                    const durationValue = {
                      years: entry.duration_years?.toString() || "",
                      months: entry.duration_months?.toString() || "",
                      weeks: entry.duration_weeks?.toString() || "",
                      days: entry.duration_days?.toString() || "",
                    };
                    const durationText = renderDurationText(durationValue);

                    return (
                      <tr
                        key={entry.hpi_id}
                        className="odd:bg-muted/40 even:bg-card border-b border-border/50"
                      >
                        <td className="px-2 py-1 align-top text-foreground">
                          {teeth.join(", ")}
                        </td>
                        <td className="px-2 py-1 align-top text-foreground">
                          {complaintsText}
                        </td>
                        <td className="px-2 py-1 align-top text-foreground capitalize">
                          {severityLabel}
                        </td>
                        <td className="px-2 py-1 align-top text-foreground">
                          {durationText}
                        </td>
                        {!isReadOnly && (
                          <td className="px-2 py-1 align-top">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => handleEditEntry(entry)}
                                className="rounded p-1 text-primary hover:bg-primary/10"
                                title="Edit"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteEntry(entry.hpi_id)}
                                disabled={deleteMutation.isPending}
                                className="rounded p-1 text-destructive hover:bg-destructive/10 disabled:opacity-50"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmId !== null} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this HPI entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default HPIDentalChart;
