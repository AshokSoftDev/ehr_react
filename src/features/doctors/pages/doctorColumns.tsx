import type { ColumnDef } from "@tanstack/react-table";
import { Mail, MapPin, Clock, Edit, Trash } from "lucide-react";

import type { Doctor } from "../types/doctor.types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export const doctorColumns = (
  onEdit: (doctor: Doctor) => void,
  onDelete: (doctor: Doctor) => void
): ColumnDef<Doctor>[] => [
  {
    id: "doctor",
    header: "Doctor",
    cell: ({ row }) => {
      const doctor = row.original;

      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback
              style={{ backgroundColor: doctor.displayColor }}
              className="text-white"
            >
              {doctor.firstName[0]}
              {doctor.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{doctor.displayName}</p>
            <p className="text-xs text-muted-foreground">{doctor.degree}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const doctor = row.original;

      return (
        <div className="space-y-1">
          <p className="text-xs flex items-center gap-1">
            <Mail className="h-3 w-3 text-indigo-500" />
            {doctor.email}
          </p>
          {doctor.city && (
            <p className="text-xs flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 text-muted-foreground" />
              {doctor.city}
            </p>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "specialty",
    header: "Specialty",
    cell: ({ row }) => {
      const value = row.getValue("specialty") as string | undefined;

      if (!value) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }

      return <Badge variant="secondary">{value}</Badge>;
    },
  },
  {
    accessorKey: "licenceNo",
    header: "License",
    cell: ({ row }) => {
      const value = row.getValue("licenceNo") as string | undefined;

      if (!value) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }

      return <span className="font-mono text-xs">{value}</span>;
    },
  },
  {
    id: "timeBlock",
    header: "Time Block",
    cell: ({ row }) => {
      const doctor = row.original;

      if (!doctor.timeBlock) {
        return <span className="text-xs text-muted-foreground">-</span>;
      }

      return (
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3 text-blue-500" />
          {doctor.timeBlock}
        </Badge>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const doctor = row.original;
      const isActive = doctor.status === 1;

      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className={cn(
            "text-xs",
            isActive &&
              "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
          )}
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const doctor = row.original;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(doctor);
            }}
            aria-label="Edit doctor"
            title="Edit doctor"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(doctor);
            }}
            aria-label="Delete doctor"
            title="Delete doctor"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
