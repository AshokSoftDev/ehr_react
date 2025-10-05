import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Plus, Loader2, Download, Grid, List } from 'lucide-react';
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
import { UserGrid } from '../components/UserGrid';
import { UserForm } from '../components/UserForm';
import { UserFilters } from '../components/UserFilters';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '../hooks/useUsers';
import { useGroups } from '../../groups/hooks/useGroups';
import type { User, CreateUserDto, UpdateUserDto } from '../types/user.types';
import { Skeleton } from '../../../components/ui/skeleton';
import { useDebounce } from '../../../hooks/use-debounce';
import { toast } from 'react-toastify';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedSearch = useDebounce(search, 500);

  const { data: groupsData } = useGroups();
  const { data, isLoading } = useUsers({
    page,
    limit: 12,
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

  const handleFormSubmit = async (data: CreateUserDto | UpdateUserDto) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({ 
        id: selectedUser.userId, 
        data: data as UpdateUserDto 
      });
    } else {
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

  const users = data?.data.users || [];
  const pagination = data?.data.pagination;
  
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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage system users, permissions and access control
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
                className="bg-primary-gradient hover:opacity-90 shadow-lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create User
              </Button>
            </div>
          </div>

          {/* Filters and View Toggle */}
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
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* Summary Stats */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-6">
              <div className="text-sm">
                <span className="text-muted-foreground">Total Users:</span>
                <span className="ml-2 font-semibold text-foreground">{pagination?.total || 0}</span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Active:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {users.filter(u => u.userStatus === 1).length}
                </span>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Inactive:</span>
                <span className="ml-2 font-semibold text-destructive">
                  {users.filter(u => u.userStatus === 0).length}
                </span>
              </div>
            </div>
            {pagination && (
              <div className="text-sm text-muted-foreground">
                Showing {((page - 1) * 12) + 1} to {Math.min(page * 12, pagination.total)} of {pagination.total}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto px-6 py-6">
          {isLoading ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <Skeleton key={i} className="h-[300px] rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[100px] rounded-lg" />
                ))}
              </div>
            )
          ) : (
            <UserGrid
              users={users}
              onEdit={handleEdit}
              onDelete={handleDelete}
              viewMode={viewMode}
            />
          )}
        </div>
      </ScrollArea>

      {/* Pagination */}
      {!isLoading && pagination && pagination.totalPages > 1 && (
        <div className="border-t bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {page} of {pagination.totalPages}
              </p>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={i}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          "w-10",
                          page === pageNum && "bg-primary-gradient"
                        )}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page === pagination.totalPages}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(pagination.totalPages)}
                  disabled={page === pagination.totalPages}
                >
                  Last
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
