import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../components/ui/table';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../../../components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash, Mail, Phone, User as UserIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { User } from '../types/user.types';
import { usePermission } from '@/hooks/usePermission';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEdit,
  onDelete,
}) => {
  if (users.length === 0) {
    return (
      <div className="rounded-md border">
        <div className="p-8 text-center text-muted-foreground">
          No users found. Create your first user to get started.
        </div>
      </div>
    );
  }

  const { can } = usePermission();
  const canEdit = can('User Management', 'Edit');
  const canDelete = can('User Management', 'Delete');


  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>
    ) : (
      <Badge variant="destructive">Inactive</Badge>
    );
  };

  const getAccountTypeBadge = (type: string) => {
    return type === 'parent' ? (
      <Badge variant="default">Parent</Badge>
    ) : (
      <Badge variant="secondary">Child</Badge>
    );
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Account Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.userId}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{user.fullName}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.title} {user.firstName} {user.lastName}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-sm">
                    <Mail className="h-3 w-3" />
                    {user.email}
                  </div>
                  {user.phoneNumber && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {user.phoneNumber}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {user.group ? (
                  <Badge variant="outline">{user.group.name}</Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">No group</span>
                )}
              </TableCell>
              <TableCell>
                {getAccountTypeBadge(user.accountType)}
                {user.parent && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Parent: {user.parent.fullName}
                  </div>
                )}
              </TableCell>
              <TableCell>
                {getStatusBadge(user.userStatus)}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(user.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {/* <DropdownMenuItem onClick={() => onEdit(user)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(user)}
                      className="text-destructive"
                    >
                      <Trash className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem> */}
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
                  {!canEdit && !canDelete && (
                    <DropdownMenuItem disabled>
                      No actions available
                    </DropdownMenuItem>
                  )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
