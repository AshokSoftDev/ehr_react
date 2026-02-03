import type { ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../types/patient.types";
import { Button } from "@/components/ui/button";
import { Edit, Trash, User, Calendar, Phone, MapPin } from "lucide-react";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const patientColumns = (
  onEdit: (patient: Patient) => void,
  onDelete: (patient: Patient) => void
): ColumnDef<Patient>[] => [
  {
    id: "patient",
    header: "Patient",
    cell: ({ row }) => {
      const p = row.original;
      return (
        <div className="space-y-1 py-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-blue-100 dark:bg-blue-900 rounded-full shrink-0">
              <User className="h-3 w-3 text-blue-600 dark:text-blue-400" />
            </span>
            <div className="min-w-0">
              <div className="font-medium text-blue-600 dark:text-blue-400 truncate">
                {p.title ? `${p.title} ` : ''}{p.firstName} {p.lastName}
                <span className="ml-2 text-muted-foreground font-normal text-xs">({p.mrn})</span>
              </div>
              <div className="text-xs text-muted-foreground truncate">
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
      if (!dob) return <span className="text-muted-foreground text-xs">-</span>;
      return (
        <div className="flex items-center gap-2">
          <Calendar className="h-3.5 w-3.5 text-blue-500" />
          <span className="text-xs font-medium">{format(new Date(dob), 'dd/MM/yyyy')}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Phone className="h-3.5 w-3.5 text-indigo-500" />
        <span className="font-mono text-xs">{String(row.getValue("mobileNumber"))}</span>
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const p = row.original;
      const parts = [p.area, p.city, p.state].filter(Boolean);
      if (p.pincode) parts.push(p.pincode);
      const address = parts.join(', ');
      
      if (!address) return <span className="text-muted-foreground text-xs">-</span>;

      return (
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1 max-w-[200px] cursor-help text-xs">
              <MapPin className="h-3 w-3 shrink-0 text-muted-foreground" />
              <span className="truncate">{address}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-[300px] text-xs">
            {address}
          </TooltipContent>
        </Tooltip>
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
            <Edit className="h-3.5 w-3.5" />
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
            <Trash className="h-3.5 w-3.5" />
          </Button>
        </div>
      );
    },
  },
];
