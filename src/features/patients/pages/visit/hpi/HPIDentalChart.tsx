import { toothImages } from "@/assets/toothImages";
import { useState } from "react";

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

type HPIEntry = {
  id: number;
  teeth: string[];
  complaints: ChiefComplaintId[];
  severity: SeverityOption | "";
  duration: Duration;
  notes: string;
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

function ToothSurfaceMap({
  selectedRegions,
  onToggleRegion,
}: ToothSurfaceMapProps) {
  const isSelected = (region: ToothRegionId) => selectedRegions.includes(region);

  const baseCellClasses =
    "flex items-center justify-center text-[8px] leading-none cursor-pointer transition border border-border box-border";
  const selectedClasses = "bg-primary text-primary-foreground";
  const unselectedClasses = "bg-card text-gray-500";

  return (
    <div className="mt-1 h-8 w-8 overflow-hidden rounded border border-border bg-card">
      <div className="grid h-full w-full grid-cols-3 grid-rows-2">
        <button
          type="button"
          className={`${baseCellClasses} rounded-tl-[6px] ${
            isSelected("leftTop") ? selectedClasses : unselectedClasses
          }`}
          onClick={() => onToggleRegion("leftTop")}
        />
        <button
          type="button"
          className={`${baseCellClasses} row-span-2 ${
            isSelected("center") ? selectedClasses : unselectedClasses
          }`}
          onClick={() => onToggleRegion("center")}
        />
        <button
          type="button"
          className={`${baseCellClasses} rounded-tr-[6px] ${
            isSelected("rightTop") ? selectedClasses : unselectedClasses
          }`}
          onClick={() => onToggleRegion("rightTop")}
        />

        <button
          type="button"
          className={`${baseCellClasses} rounded-bl-[6px] ${
            isSelected("leftBottom") ? selectedClasses : unselectedClasses
          }`}
          onClick={() => onToggleRegion("leftBottom")}
        />
        <button
          type="button"
          className={`${baseCellClasses} rounded-br-[6px] ${
            isSelected("rightBottom") ? selectedClasses : unselectedClasses
          }`}
          onClick={() => onToggleRegion("rightBottom")}
        />
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
        className={`flex flex-col items-center rounded-lg p-1.5 outline-none transition ${
          selected ? "bg-primary/10 ring-2 ring-primary shadow-sm" : "hover:bg-primary/5"
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
        <span className="mt-1 text-xs font-semibold text-gray-700">
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
              className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${
                selected ? "border-primary" : "border-gray-300"
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
              className={`text-sm ${
                selected ? "font-semibold text-primary" : "text-gray-700"
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

export function HPIDentalChart() {
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
  const [entries, setEntries] = useState<HPIEntry[]>([]);
  const [toothRegions, setToothRegions] = useState<ToothRegionMap>({});

  const selectedTeethSet = new Set(selectedTeeth);

  const handleChangeView = (nextView: DentitionView) => {
    setView(nextView);
    setSelectedTeeth([]);
    setToothRegions({});
  };

  const handleToggleTooth = (toothNumber: string) => {
    setSelectedTeeth((prev) => {
      if (prev.includes(toothNumber)) {
        setToothRegions((prevRegions) => {
          const { [toothNumber]: _removed, ...rest } = prevRegions;
          return rest;
        });
        return prev.filter((t) => t !== toothNumber);
      }
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
    setSelectedComplaints([]);
    setSeverity("");
    setDuration({
      years: "",
      months: "",
      weeks: "",
      days: "",
    });
    setNotes("");
  };

  const handleAddEntry = () => {
    if (!selectedTeeth.length) {
      return;
    }

    const newEntry: HPIEntry = {
      id: Date.now(),
      teeth: [...selectedTeeth].sort(),
      complaints: [...selectedComplaints],
      severity,
      duration: { ...duration },
      notes,
    };

    setEntries((prev) => [...prev, newEntry]);
    handleClearForm();
  };

  const handleRemoveEntry = (id: number) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const handleSave = () => {
    // Integrate with API or parent form as needed.
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
        <div className="flex flex-col gap-2">
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
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 border-l border-border pl-3">
          {/* Selected Teeth Badge */}
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/5 px-3 py-1.5">
            <span className="text-xs font-semibold text-gray-700">Selected:</span>
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
                    <span className="text-[11px] text-gray-700">{option.label}</span>
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
                      <label key={level} className="flex cursor-pointer items-center gap-1">
                        <span
                          className={`flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 ${
                            selected ? "border-primary" : "border-gray-300"
                          }`}
                        >
                          {selected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                        </span>
                        <span className={`text-[11px] ${selected ? "font-semibold text-primary" : "text-gray-700"}`}>
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
                      <span className="text-[10px] text-gray-500 capitalize">{field.slice(0, 1).toUpperCase()}</span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={duration[field]}
                        onChange={(e) => handleDurationChange(field, e.target.value)}
                        className="h-6 w-full rounded border border-gray-300 px-1 text-center text-[11px] text-gray-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
              className="w-full rounded border border-gray-300 px-2 py-1 text-[11px] text-gray-800 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Additional notes..."
            />
          </div>

          {/* Action Buttons - Inline */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddEntry}
              className="rounded-md bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Add Entry
            </button>
            <button
              type="button"
              onClick={handleClearForm}
              className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear
            </button>
          </div>

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
                  <th className="px-2 py-1 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-2 py-3 text-center text-gray-400"
                    >
                      No entries added yet.
                    </td>
                  </tr>
                ) : (
                  entries.map((entry) => {
                    const complaintLabels = entry.complaints
                      .map(
                        (id) =>
                          CHIEF_COMPLAINT_OPTIONS.find(
                            (option) => option.id === id
                          )?.label
                      )
                      .filter((label): label is string => Boolean(label))
                      .join(", ");

                    const severityLabel =
                      entry.severity.charAt(0).toUpperCase() +
                      entry.severity.slice(1);

                    return (
                      <tr
                        key={entry.id}
                        className="odd:bg-muted/40 even:bg-card"
                      >
                        <td className="px-2 py-1 align-top text-gray-800">
                          {entry.teeth.join(", ")}
                        </td>
                        <td className="px-2 py-1 align-top text-gray-800">
                          {complaintLabels || "-"}
                        </td>
                        <td className="px-2 py-1 align-top text-gray-800">
                          {entry.severity ? severityLabel : "-"}
                        </td>
                        <td className="px-2 py-1 align-top text-gray-800">
                          {renderDurationText(entry.duration)}
                        </td>
                        <td className="px-2 py-1 align-top">
                          <button
                            type="button"
                            onClick={() => handleRemoveEntry(entry.id)}
                            className="rounded border border-destructive/60 px-2 py-0.5 text-[11px] font-semibold text-destructive hover:bg-destructive/10"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="rounded bg-primary px-5 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HPIDentalChart;
