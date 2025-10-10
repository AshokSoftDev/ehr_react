import type { ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../types/patient.types";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

export const patientColumns = (
  onEdit: (patient: Patient) => void,
  onDelete: (patient: Patient) => void
): ColumnDef<Patient>[] => [
  {
    accessorKey: "mrn",
    header: "MRN",
  },
  {
    accessorKey: "firstName",
    header: "First Name",
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
  },
  {
    accessorKey: "age",
    header: "Age",
  },
  {
    accessorKey: "gender",
    header: "Gender",
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const patient = row.original;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
            onClick={() => onEdit(patient)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/50 hover:text-destructive"
            onClick={() => onDelete(patient)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
