import { Pencil, Trash2, Users, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GroupData } from "../pages/GroupsPage.types";

interface GroupListProps {
  groups: GroupData[];
  isLoading: boolean;
  onEdit: (group: GroupData) => void;
  onDelete: (group: GroupData) => void;
}

export function GroupList({ groups, isLoading, onEdit, onDelete }: GroupListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-md border-dashed">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-1">No groups found</h3>
        <p className="text-sm">Create a group to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      <div className="bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {groups.map((group) => (
            <div key={group.id} className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/30 transition-colors gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">{group.name}</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-xl">
                      {group.description || 'No description provided'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mt-1 ml-14">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">{group._count?.users || 0}</span> Users
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">{group._count?.permissions || 0}</span> Permissions
                  </div>
                </div>
              </div>
              
              <div className="flex items-center pl-4 border-l border-border/50 shrink-0 gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-blue-50 hover:text-blue-600 rounded-full"
                  onClick={() => onEdit(group)}
                  title="Edit Group"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-red-50 rounded-full"
                  onClick={() => onDelete(group)}
                  title="Delete Group"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
