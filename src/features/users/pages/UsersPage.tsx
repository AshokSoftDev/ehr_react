import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Plus, Loader2, Download } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../components/ui/alert-dialog';
import { UserTable } from '../components/UserTable';
import { UserForm } from '../components/UserForm';
import { UserFilters } from '../components/UserFilters';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import { useGroups } from '../../groups/hooks/useGroups';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user.types';
import { Skeleton } from '../../../components/ui/skeleton';
import { useDebounce } from '../../../hooks/use-debounce';
import { toast } from 'react-toastify';

// Remove the local interface since it should match the service response
// The service now returns the proper type

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data: groupsData } = useGroups();
  const { data, isLoading } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch,
    groupId: groupFilter || undefined,
    userStatus: statusFilter ? parseInt(statusFilter) : undefined,
    accountType: accountTypeFilter || undefined,
  });
  
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (userToDelete) {
      await deleteMutation.mutateAsync(userToDelete.userId);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  // Fix: Handle create and update separately
  const handleFormSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    if (selectedUser) {
      // For update, we know it's UpdateUserDto
      await updateMutation.mutateAsync({ 
        id: selectedUser.userId, 
        data: data as UpdateUserDto 
      });
    } else {
      // For create, we know it's CreateUserDto
      await createMutation.mutateAsync(data as CreateUserDto);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setGroupFilter('');
    setStatusFilter('');
    setAccountTypeFilter('');
    setPage(1);
  };

  const hasActiveFilters = !!(search || groupFilter || statusFilter || accountTypeFilter);

  const handleExport = () => {
    toast.info('Export functionality coming soon');
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-10 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-10 w-48" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Now data should have the correct type from the service
  const users = data?.data.users || [];
  const pagination = data?.data.pagination;
  console.log("Users", users);
  console.log("Pagination", pagination);
  
  
  // Type the groups response properly
  interface GroupsResponse {
    data: {
      groups: Array<{
        id: string;
        name: string;
      }>;
    };
  }
  
  const groups = ((groupsData as GroupsResponse | undefined)?.data?.groups || [])
    .filter(group => group.id && group.id !== '');

    console.log("Groups", groups);
    

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage system users and their access
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={() => {
              setSelectedUser(null);
              setFormOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      <UserFilters
        search={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        groupId={groupFilter}
        onGroupChange={(value) => {
          setGroupFilter(value);
          setPage(1);
        }}
        status={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setPage(1);
        }}
        accountType={accountTypeFilter}
        onAccountTypeChange={(value) => {
          setAccountTypeFilter(value);
          setPage(1);
        }}
        groups={groups}
        onReset={resetFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="space-y-4">
        {pagination && (
          <div className="text-sm text-muted-foreground">
            Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pagination.total)} of {pagination.total} users
          </div>
        )}

        <UserTable
          users={users}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage(p => p + 1)}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      <UserForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{userToDelete?.fullName}"?
              {userToDelete?.children && userToDelete.children.length > 0 && (
                <span className="mt-2 block font-semibold text-destructive">
                  Warning: This user has {userToDelete.children.length} child user(s).
                </span>
              )}
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
