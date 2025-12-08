import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import { FormFloatingDatePicker } from "@/components/form/FormFloatingDatePicker";
import type { AppointmentDoctorLite } from "@/features/appointments/types/appointment.types";

interface ClinicalNotesFiltersProps {
  patientSearch: string;
  onPatientSearchChange: (value: string) => void;
  doctorFilter: string;
  onDoctorFilterChange: (value: string) => void;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  doctors: AppointmentDoctorLite[];
  hasActiveFilters: boolean;
  onReset: () => void;
}

export function ClinicalNotesFilters({
  patientSearch,
  onPatientSearchChange,
  doctorFilter,
  onDoctorFilterChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  doctors,
  hasActiveFilters,
  onReset,
}: ClinicalNotesFiltersProps) {
  const doctorOptions = [
    { label: "All Doctors", value: "" },
    ...doctors.map((doc) => ({
      label: `Dr. ${doc.displayName}`,
      value: doc.id,
    })),
  ];

  return (
    <div className="flex gap-3 items-start flex-wrap">
      {/* Patient Search */}
      <div className="relative w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          placeholder="Search patient..."
          value={patientSearch}
          onChange={(e) => onPatientSearchChange(e.target.value)}
          className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40 h-12"
        />
      </div>

      {/* Doctor Filter */}
      <div className="w-[200px]">
        <FormFloatingSelect
          label="Doctor"
          value={doctorFilter || ""}
          onValueChange={onDoctorFilterChange}
          options={doctorOptions}
          triggerClassName="bg-background/50 h-12"
        />
      </div>

      {/* Date Range */}
      <div className="w-[200px]">
        <FormFloatingDatePicker
          label="From Date"
          value={dateFrom}
          onValueChange={onDateFromChange}
          toDate={dateTo}
        />
      </div>
      <div className="w-[200px]">
        <FormFloatingDatePicker
          label="To Date"
          value={dateTo}
          onValueChange={onDateToChange}
          fromDate={dateFrom}
        />
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button variant="ghost" onClick={onReset} className="gap-2 h-12">
          <X className="h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}

export default ClinicalNotesFilters;
