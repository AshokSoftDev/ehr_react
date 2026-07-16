import { User as UserIcon, Mail, Phone, Edit, Trash, ShieldCheck } from 'lucide-react';
import type { User } from '../types/user.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface UserListProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export function UserList({ users, isLoading, onEdit, onDelete }: UserListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground border rounded-md border-dashed">
        No users found for the selected filters.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="bg-card border rounded-md overflow-hidden">
        <div className="divide-y divide-border">
          {users.map((user) => (
            <UserListItem
              key={user.userId}
              user={user}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function UserListItem({
  user,
  onEdit,
  onDelete,
}: {
  user: User;
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}) {
  const initials =
    (user.firstName?.[0] ?? user.fullName?.[0] ?? "").toUpperCase() +
    (user.lastName?.[0] ?? "");
    
  const isActive = user.userStatus === 1;

  return (
    <div className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-muted/30 transition-colors gap-4">
      {/* Left color bar based on role */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1 z-10", isActive ? "bg-green-500" : "bg-gray-400")}></div>

      <div className="flex-1 flex items-center gap-4 pl-2 cursor-pointer" onClick={() => onEdit(user)}>
        {/* Info Layout */}
        <div className="flex-1 space-y-2">
          {/* Top Row: User Info & Emphasized Role/Status */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary shrink-0">
                {initials || <UserIcon className="h-3.5 w-3.5" />}
              </div>
              <span className="font-bold text-base text-foreground group-hover/item:text-blue-600 transition-colors">
                {user.fullName}
              </span>
            </div>
            
            <span className="text-muted-foreground font-medium text-xs">
              ({user.title || "User"})
            </span>

            {/* Emphasized Role */}
            <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-800 flex items-center gap-1 uppercase text-[10px] tracking-wide">
              <ShieldCheck className="h-3 w-3" />
              {user.accountType || "Unknown"}
            </Badge>

            {/* Emphasized Status */}
            {isActive ? (
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 text-[10px] tracking-wide uppercase border-none">Active</Badge>
            ) : (
              <Badge variant="destructive" className="bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 text-[10px] tracking-wide uppercase border-none">Inactive</Badge>
            )}
          </div>

          {/* Bottom Row: Contact & Group */}
          <div className="flex items-center gap-4 text-xs flex-wrap ml-9">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-muted-foreground">{user.email}</span>
            </div>

            {user.phoneNumber && <span className="text-muted-foreground">|</span>}
            {user.phoneNumber && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-indigo-500" />
                <span className="font-mono text-muted-foreground">{user.phoneNumber}</span>
              </div>
            )}

            {user.group?.name && <span className="text-muted-foreground">|</span>}
            {user.group?.name && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground/70">Group:</span>
                <span className="font-medium">{user.group.name}</span>
              </div>
            )}
            
            {user.createdAt && <span className="text-muted-foreground">|</span>}
            {user.createdAt && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <span className="font-medium text-[10px] uppercase tracking-wider text-muted-foreground/70">Joined:</span>
                <span>{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-1 pl-4 border-l border-border/50 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(user);
          }}
          title="Edit user"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(user);
          }}
          title="Delete user"
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
