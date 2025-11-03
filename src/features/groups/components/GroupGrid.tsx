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
  Users, 
  Shield, 
  Calendar, 
  // ChevronRight,
  Lock,
  Settings,
  UserCheck,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../../lib/utils';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { usePermission } from '@/hooks/usePermission';

interface Group {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    users: number;
    permissions: number;
  };
}

interface GroupGridProps {
  groups: Group[];
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  viewMode: 'grid' | 'list';
}

export const GroupGrid: React.FC<GroupGridProps> = ({
  groups,
  onEdit,
  onDelete,
  viewMode,
}) => {
  const { can } = usePermission();
  const canEdit = can('Group Management', 'Edit');
  const canDelete = can('Group Management', 'Delete');

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-primary/10 p-4 mb-4">
          <Shield className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No groups found</h3>
        <p className="text-muted-foreground text-center max-w-sm">
          Create your first group to start managing user permissions and access control.
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
        {groups.map((group) => {
          const hasUsers = (group._count?.users || 0) > 0;
          
          return (
            <Card key={group.id} className="hover:shadow-md transition-all duration-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {getInitials(group.name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 grid grid-cols-4 gap-4">
                      <div>
                        <p className="font-semibold">{group.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {group.description || 'No description'}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{group._count?.users || 0} users</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="gap-1">
                          <Lock className="h-3 w-3" />
                          {group._count?.permissions || 0} modules
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(group.createdAt), 'dd/MM/yyyy')}
                        </div>
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
                          <DropdownMenuItem onClick={() => onEdit(group)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                        )}
                        {canDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(group)}
                            className="text-destructive"
                            disabled={hasUsers}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                            {hasUsers && <span className="ml-1 text-xs">(Has users)</span>}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {groups.map((group) => {
        const hasUsers = (group._count?.users || 0) > 0;
        const permissionCount = group._count?.permissions || 0;
        const permissionLevel = permissionCount === 0 ? 'none' : 
                              permissionCount < 5 ? 'basic' : 
                              permissionCount < 10 ? 'moderate' : 'full';
        
        return (
          <Card
            key={group.id}
            className={cn(
              "hover:shadow-lg transition-all duration-200 relative group",
              "border-border hover:border-primary/30"
            )}
          >
            {/* Permission level indicator */}
            <div className={cn(
              "absolute top-4 right-4 h-2 w-2 rounded-full",
              permissionLevel === 'none' && "bg-gray-400",
              permissionLevel === 'basic' && "bg-yellow-500",
              permissionLevel === 'moderate' && "bg-blue-500",
              permissionLevel === 'full' && "bg-green-500"
            )} />
            
            {/* Gradient accent */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary-gradient opacity-5 blur-3xl group-hover:opacity-10 transition-opacity pointer-events-none" />
            
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-14 w-14">
                  <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-semibold text-lg">
                    {getInitials(group.name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-none">{group.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[2.5rem]">
                    {group.description || 'No description provided'}
                  </p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Users className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Users</p>
                    <p className="text-sm font-semibold">{group._count?.users || 0}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                  <Lock className="h-4 w-4 text-primary" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground">Modules</p>
                    <p className="text-sm font-semibold">{group._count?.permissions || 0}</p>
                  </div>
                </div>
              </div>

              {/* Permission Level Badge */}
              <div className="flex items-center justify-between">
                <Badge 
                  variant="outline" 
                  className={cn(
                    "gap-1",
                    permissionLevel === 'none' && "border-gray-300 text-gray-600",
                    permissionLevel === 'basic' && "border-yellow-300 text-yellow-700",
                    permissionLevel === 'moderate' && "border-blue-300 text-blue-700",
                    permissionLevel === 'full' && "border-green-300 text-green-700"
                  )}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {permissionLevel === 'none' && 'No permissions'}
                  {permissionLevel === 'basic' && 'Basic access'}
                  {permissionLevel === 'moderate' && 'Moderate access'}
                  {permissionLevel === 'full' && 'Full access'}
                </Badge>
              </div>
              
              {/* Footer Info */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Created</span>
                  </div>
                  <span>{format(new Date(group.createdAt), 'dd/MM/yyyy')}</span>
                </div>
                
                {hasUsers && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <UserCheck className="h-3 w-3" />
                    <span>Active group with assigned users</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              {(canEdit || canDelete) && (
                <div className="flex gap-2 pt-2">
                  {canEdit && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 group-hover:bg-primary/5"
                      onClick={() => onEdit(group)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Manage
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
                        <DropdownMenuItem onClick={() => onEdit(group)}>
                          <Shield className="mr-2 h-4 w-4" />
                          View Permissions
                        </DropdownMenuItem>
                      )}
                      {canDelete && (
                        <DropdownMenuItem
                          onClick={() => onDelete(group)}
                          className="text-destructive"
                          disabled={hasUsers}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete Group
                          {hasUsers && (
                            <span className="ml-1 text-xs opacity-60">(Has users)</span>
                          )}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
