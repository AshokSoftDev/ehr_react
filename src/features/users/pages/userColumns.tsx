import type { ColumnDef } from "@tanstack/react-table";
import { Mail, Phone, Shield, User as UserIcon, Edit, Trash } from "lucide-react";

import type { User } from "../types/user.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const userColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void
): ColumnDef<User>[] => [
  {
    id: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      const initials =
        (user.firstName?.[0] ?? user.fullName?.[0] ?? "").toUpperCase() +
        (user.lastName?.[0] ?? "");

      return (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
            {initials || <UserIcon className="h-4 w-4" />}
          </div>
          <div className="space-y-0.5">
            <div className="font-medium text-sm text-foreground">
              {user.fullName}
            </div>
            <div className="text-xs text-muted-foreground">
              {user.title || "User"}
            </div>
          </div>
        </div>
      );
    },
  },
  {
    id: "contact",
    header: "Contact",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="truncate">{user.email}</span>
          </div>
          {user.phoneNumber && (
            <div className="flex items-center gap-1 text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{user.phoneNumber}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    id: "group",
    header: "Group",
    cell: ({ row }) => {
      const user = row.original;
      const groupName = user.group?.name;

      if (!groupName) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }

      return (
        <Badge variant="secondary" className="text-xs">
          {groupName}
        </Badge>
      );
    },
  },
  {
    accessorKey: "accountType",
    header: "Type",
    cell: ({ row }) => {
      const value = row.getValue("accountType") as string | undefined;

      if (!value) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }

      return (
        <div className="inline-flex items-center gap-1 text-xs">
          <Shield className="h-3 w-3 text-muted-foreground" />
          <span className="capitalize">{value}</span>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) => {
      const user = row.original;
      const isActive = user.userStatus === 1;

      return (
        <Badge
          variant={isActive ? "default" : "destructive"}
          className="text-xs"
        >
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      const user = row.original;
      const date = user.createdAt ? new Date(user.createdAt) : undefined;
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
      const user = row.original;

      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(user);
            }}
            aria-label="Edit user"
            title="Edit user"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(user);
            }}
            aria-label="Delete user"
            title="Delete user"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

