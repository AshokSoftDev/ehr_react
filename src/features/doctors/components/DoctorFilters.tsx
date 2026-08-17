import React from "react";
import { RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { DoctorFiltersType } from "../types/doctor.types";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";
import { useForm } from "react-hook-form";

interface DoctorFiltersProps {
  filters: DoctorFiltersType;
  onFiltersChange: (filters: DoctorFiltersType) => void;
}

const specialties = [
  "General Practice",
  "Cardiology",
  "Dermatology",
  "Endocrinology",
  "Gastroenterology",
  "Neurology",
  "Oncology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "Radiology",
  "Surgery",
];

type FilterFormValues = {
  search: string;
  specialty: string;
  status: string;
  email: string;
  licenceNo: string;
};

export const DoctorFilters: React.FC<DoctorFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  // Dummy form control just to satisfy component API; values are driven externally
  const form = useForm<FilterFormValues>({
    defaultValues: {
      search: "",
      specialty: "",
      status: "",
      email: "",
      licenceNo: "",
    },
  });

  const specialtyOptions = [
    { label: "All specialties", value: "all" },
    ...specialties.map((specialty) => ({
      label: specialty,
      value: specialty,
    })),
  ];

  const statusOptions = [
    { label: "All statuses", value: "all" },
    { label: "Active", value: "1" },
    { label: "Inactive", value: "0" },
  ];

  const activeFiltersCount = [
    filters.search,
    filters.specialty,
    filters.status,
    filters.email,
    filters.licenceNo,
  ].filter((v) => v !== undefined && v !== "" && v !== null).length;

  const handleChange = (partial: Partial<DoctorFiltersType>) => {
    onFiltersChange({
      ...filters,
      ...partial,
    });
  };

  const handleReset = () => {
    onFiltersChange({
      search: "",
      specialty: undefined,
      status: undefined,
      email: undefined,
      licenceNo: undefined,
    });
  };

  // const handleClearFilter = (key: keyof DoctorFiltersType) => {
  //   if (key === "search") {
  //     handleChange({ search: "" });
  //   } else {
  //     handleChange({ [key]: undefined } as Partial<DoctorFiltersType>);
  //   }
  // };

  return (
    <>
      <form className="grid gap-3 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto] items-start">
        <FormFloatingInput
          control={form.control}
          name="search"
          label="Search doctors"
          value={filters.search ?? ""}
          onValueChange={(value) => handleChange({ search: value })}
          inputClassName="bg-background/50 border-primary/20 focus-visible:ring-ring"
        />

        <FormFloatingSelect
          control={form.control}
          name="specialty"
          label="Specialty"
          options={specialtyOptions}
          value={filters.specialty ?? "all"}
          onValueChange={(value) =>
            handleChange({ specialty: value === "all" ? undefined : value })
          }
          triggerClassName="bg-background/50 h-12"
        />

        <FormFloatingSelect
          control={form.control}
          name="status"
          label="Status"
          options={statusOptions}
          value={
            filters.status !== undefined ? filters.status.toString() : "all"
          }
          onValueChange={(value) =>
            handleChange({
              status: value === "all" ? undefined : parseInt(value, 10),
            })
          }
          triggerClassName="bg-background/50 h-12"
        />

        <FormFloatingInput
          control={form.control}
          name="email"
          type="email"
          label="Email"
          value={filters.email ?? ""}
          onValueChange={(value) =>
            handleChange({ email: value || undefined })
          }
          inputClassName="bg-background/50 border-primary/20 focus-visible:ring-ring"
        />

        <FormFloatingInput
          control={form.control}
          name="licenceNo"
          label="License"
          value={filters.licenceNo ?? ""}
          onValueChange={(value) =>
            handleChange({ licenceNo: value || undefined })
          }
          inputClassName="bg-background/50 border-primary/20 focus-visible:ring-ring"
        />
        <div className="h-12 flex items-center">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleReset}
            className="gap-1 h-10 w-full bg-muted hover:bg-muted/80 text-muted-foreground"
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </form>

    </>
  );
};

