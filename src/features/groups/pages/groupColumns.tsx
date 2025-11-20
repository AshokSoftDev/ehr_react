import type { ColumnDef } from "@tanstack/react-table";
import { Users, Shield, Edit, Trash } from "lucide-react";

import type { GroupData } from "./GroupsPage.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const groupColumns = (
  onEdit: (group: GroupData) => void,
  onDelete: (group: GroupData) => void
): ColumnDef<GroupData>[] => [
  {
    id: "name",
    header: "Group",
    cell: ({ row }) => {
      const group = row.original;

      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <div className="font-medium text-sm text-foreground">
                {group.name}
              </div>
              {group.description && (
                <div className="text-xs text-muted-foreground line-clamp-1">
                  {group.description}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "members",
    header: "Members",
    cell: ({ row }) => {
      const group = row.original;
      const count = group._count?.users ?? 0;

      return (
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{count} user{count === 1 ? "" : "s"}</span>
        </div>
      );
    },
  },
  {
    id: "permissions",
    header: "Permissions",
    cell: ({ row }) => {
      const group = row.original;
      const count = group._count?.permissions ?? 0;

      if (!count) {
        return <span className="text-xs text-muted-foreground">No modules</span>;
      }

      return (
        <Badge variant="secondary" className="text-xs">
          {count} module{count === 1 ? "" : "s"}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const group = row.original;
      const date = group.createdAt ? new Date(group.createdAt) : undefined;

      if (!date || Number.isNaN(date.getTime())) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }

      return (
        <span className="text-xs text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const group = row.original;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(group);
            }}
            aria-label="Edit group"
            title="Edit group"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(group);
            }}
            aria-label="Delete group"
            title="Delete group"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

