import React from 'react';
import { Card, CardContent, CardHeader } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { 
  MoreVertical, 
  Pencil, 
  Trash, 
  Mail, 
  Phone, 
  User2, 
  Calendar,
  Shield,
  Users,
  UserCheck
} from 'lucide-react';
import { format } from 'date-fns';
import type { User } from '../types/user.types';
import { usePermission } from '@/hooks/usePermission';
import { cn } from '../../../lib/utils';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';

interface UserGridProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  viewMode: 'grid' | 'list';
}

export const UserGrid: React.FC<UserGridProps> = ({
  users,
  onEdit,
  onDelete,
  viewMode,
}) => {
  // c129a0ac-e861-44c7-836f-566412ceaa0e
  const { can } = usePermission();
  const canEdit = can('9e215649-b444-40af-bc1d-0a11bab3d1ea', '7e33d80b-5a67-410f-8850-029cf2235431');
  const canDelete = can('9e215649-b444-40af-bc1d-0a11bab3d1ea', '2435afdf-9b18-466b-913c-d884c4791bc6');

  console.log("canEdit: ", canEdit);
  console.log("canDelete: ", canDelete);
  

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <User2 className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No users found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Create your first user or adjust filters to see users.
        </p>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-2">
        {users.map((user) => (
          <Card key={user.userId} className="hover:shadow-md transition-all duration-200 py-2">
            <CardContent className="px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className={cn(
                      "font-semibold",
                      user.userStatus === 1 ? "bg-primary/10 text-primary" : "bg-muted"
                    )}>
                      {getInitials(user.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 items-center grid grid-cols-4 gap-4">
                    <div>
                      <p className="font-semibold">{user.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.title} {user.firstName} {user.lastName}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {user.email}
                      </div>
                      {user.phoneNumber && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {user.phoneNumber}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {user.group ? (
                        <Badge variant="outline" className="gap-1">
                          <Shield className="h-3 w-3" />
                          {user.group.name}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">No group</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge
                        className={cn(
                          user.userStatus === 1
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                        )}
                      >
                        {user.userStatus === 1 ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {(canEdit || canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="ml-2">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="z-50">
                      {canEdit && (
                        <DropdownMenuItem onClick={() => onEdit(user)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(user)}
                          className="text-destructive"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map((user) => (
        <Card
          key={user.userId}
          className={cn(
            "hover:shadow-lg transition-all duration-200 relative group",
            "border-border hover:border-primary/30"
          )}
        >
          {/* Status indicator */}
          <div className={cn(
            "absolute top-4 right-4 h-2 w-2 rounded-full",
            user.userStatus === 1 ? "bg-green-500" : "bg-destructive"
          )} />

          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-14 w-14">
                <AvatarFallback className={cn(
                  "font-semibold text-lg",
                  user.userStatus === 1 
                    ? "bg-gradient-to-br from-primary/20 to-primary/10 text-primary" 
                    : "bg-muted"
                )}>
                  {getInitials(user.fullName)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h3 className="font-semibold text-lg leading-none">{user.fullName}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {user.title} {user.firstName} {user.lastName}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phoneNumber && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{user.phoneNumber}</span>
                </div>
              )}
            </div>

            {/* Group and Type */}
            <div className="flex flex-wrap gap-2">
              {user.group && (
                <Badge variant="outline" className="gap-1">
                  <Shield className="h-3 w-3" />
                  {user.group.name}
                </Badge>
              )}
              <Badge
                variant={user.accountType === 'parent' ? 'default' : 'secondary'}
                className={user.accountType === 'parent' ? 'bg-primary/10 text-primary hover:bg-primary/20' : ''}
              >
                {user.accountType === 'parent' ? 'Parent' : 'Child'}
              </Badge>
            </div>

            {/* Additional Info */}
            <div className="pt-3 border-t space-y-2">
              {user.parent && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>Parent: {user.parent.fullName}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                <Badge
                  className={cn(
                    "text-xs",
                    user.userStatus === 1
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-destructive/10 text-destructive hover:bg-destructive/10"
                  )}
                >
                  {user.userStatus === 1 ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>

            {/* Actions */}
            {(canEdit || canDelete) && (
              <div className="flex gap-2 pt-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onEdit(user)}
                  >
                    <Pencil className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    {canEdit && (
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                    )}
                    {canDelete && (
                      <DropdownMenuItem
                        onClick={() => onDelete(user)}
                        className="text-destructive"
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete User
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
