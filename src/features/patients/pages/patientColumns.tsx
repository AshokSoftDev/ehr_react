import type { ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../types/patient.types";
import { Button } from "@/components/ui/button";
import { Edit, Trash, User } from "lucide-react";
import { format } from "date-fns";

export const patientColumns = (
  onEdit: (patient: Patient) => void,
  onDelete: (patient: Patient) => void
): ColumnDef<Patient>[] => [
  {
    accessorKey: "mrn",
    header: "MRN",
    cell: ({ row }) => (
      <span className="font-semibold text-blue-600 dark:text-blue-400">{String(row.getValue("mrn"))}</span>
    ),
  },
  {
    id: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full">
              <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {p.title ? `${p.title} ` : ''}{p.firstName} {p.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {p.age} yrs • {p.gender}
              </div>
            </div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "dateOfBirth",
    header: "DOB",
    cell: ({ row }) => {
      const dob = row.getValue("dateOfBirth") as string | undefined;
      if (!dob) return <span className="text-muted-foreground text-sm">-</span>;
      return <span className="text-sm">{format(new Date(dob), 'dd/MM/yyyy')}</span>;
    },
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{String(row.getValue("mobileNumber"))}</span>
    ),
  },
  {
    accessorKey: "aadhar",
    header: "Aadhar",
    cell: ({ row }) => {
      const val = (row.getValue("aadhar") as string | undefined) || "";
      return val ? (
        <span className="font-mono text-sm" title={val}>{val}</span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "pincode",
    header: "Pincode",
    cell: ({ row }) => {
      const val = (row.getValue("pincode") as string | undefined) || "";
      return val ? (
        <span className="font-mono text-sm">{val}</span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    accessorKey: "referalSource",
    header: "Referral Source",
    cell: ({ row }) => {
      const val = (row.getValue("referalSource") as string | undefined) || "";
      return val ? (
        <span className="text-sm">{val}</span>
      ) : (
        <span className="text-muted-foreground text-sm">-</span>
      );
    },
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const p = row.original;
      const parts = [p.area, p.city, p.state].filter(Boolean).join(', ');
      return (
        <div className="max-w-[240px] truncate text-sm" title={parts}>{parts}</div>
      );
    },
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
            onClick={(event) => {
              event.stopPropagation();
              onEdit(patient);
            }}
            aria-label="Edit patient"
            title="Edit patient"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(patient);
            }}
            aria-label="Delete patient"
            title="Delete patient"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
