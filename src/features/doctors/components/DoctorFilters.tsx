import React from "react";
import { X, RotateCcw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
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
    { label: "All specialties", value: "" },
    ...specialties.map((specialty) => ({
      label: specialty,
      value: specialty,
    })),
  ];

  const statusOptions = [
    { label: "All statuses", value: "" },
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

  const handleClearFilter = (key: keyof DoctorFiltersType) => {
    if (key === "search") {
      handleChange({ search: "" });
    } else {
      handleChange({ [key]: undefined } as Partial<DoctorFiltersType>);
    }
  };

  return (
    <>
      <form className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
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
          value={filters.specialty ?? ""}
          onValueChange={(value) =>
            handleChange({ specialty: value || undefined })
          }
          triggerClassName="bg-background/50 h-12"
        />

        <FormFloatingSelect
          control={form.control}
          name="status"
          label="Status"
          options={statusOptions}
          value={
            filters.status !== undefined ? filters.status.toString() : ""
          }
          onValueChange={(value) =>
            handleChange({
              status: value ? parseInt(value, 10) : undefined,
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

        <div className="flex items-end gap-3">
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
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="gap-1 h-10 mb-1"
            disabled={activeFiltersCount === 0}
          >
            <RotateCcw className="h-3 w-3" />
            Clear
          </Button>
        </div>
      </form>

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("search")}
              />
            </Badge>
          )}
          {filters.specialty && (
            <Badge variant="secondary" className="gap-1">
              Specialty: {filters.specialty}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("specialty")}
              />
            </Badge>
          )}
          {filters.status !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status === 1 ? "Active" : "Inactive"}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("status")}
              />
            </Badge>
          )}
          {filters.email && (
            <Badge variant="secondary" className="gap-1">
              Email: {filters.email}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("email")}
              />
            </Badge>
          )}
          {filters.licenceNo && (
            <Badge variant="secondary" className="gap-1">
              License: {filters.licenceNo}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => handleClearFilter("licenceNo")}
              />
            </Badge>
          )}
        </div>
      )}
    </>
  );
};

