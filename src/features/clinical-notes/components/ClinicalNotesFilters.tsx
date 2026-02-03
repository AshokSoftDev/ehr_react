import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import { FormFloatingDatePicker } from "@/components/form/FormFloatingDatePicker";
import type { AppointmentDoctorLite } from "@/features/appointments/types/appointment.types";

interface ClinicalNotesFiltersProps {
  appointmentDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  patientSearch: string;
  onPatientSearchChange: (value: string) => void;
  doctorFilter: string;
  onDoctorFilterChange: (value: string) => void;
  doctors: AppointmentDoctorLite[];
  onSearch: () => void;
  onReset: () => void;
}

export function ClinicalNotesFilters({
  appointmentDate,
  onDateChange,
  patientSearch,
  onPatientSearchChange,
  doctorFilter,
  onDoctorFilterChange,
  doctors,
  onSearch,
  onReset,
}: ClinicalNotesFiltersProps) {
  const doctorOptions = [
    { label: "All Doctors", value: "all" },
    ...doctors.map((doc) => ({
      label: `Dr. ${doc.displayName}`,
      value: doc.id,
    })),
  ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      onSearch();
    }
  };

  return (
    <div className="flex gap-3 items-center flex-wrap">
      {/* Appointment Date */}
      <div className="w-[180px]">
        <FormFloatingDatePicker
          label="Appointment Date"
          value={appointmentDate}
          onValueChange={onDateChange}
        />
      </div>

      {/* Patient Search */}
      <div className="relative w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
        <Input
          placeholder="Search patient..."
          value={patientSearch}
          onChange={(e) => onPatientSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40 h-10"
        />
      </div>

      {/* Doctor Filter */}
      <div className="w-[180px]">
        <FormFloatingSelect
          label="Doctor"
          value={doctorFilter || ""}
          onValueChange={onDoctorFilterChange}
          options={doctorOptions}
          triggerClassName="bg-background/50 h-10"
        />
      </div>

      {/* Search Button */}
      <Button onClick={onSearch} className="h-10 px-6">
        <Search className="h-4 w-4 mr-2" />
        Search
      </Button>

      {/* Clear Button */}
      <Button variant="ghost" onClick={onReset} className="h-10 px-4">
        <X className="h-4 w-4 mr-2" />
        Clear
      </Button>
    </div>
  );
}

export default ClinicalNotesFilters;
