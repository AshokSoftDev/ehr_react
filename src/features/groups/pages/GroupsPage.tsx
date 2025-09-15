import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Plus, Search, Loader2 } from 'lucide-react';
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
import { GroupTable } from '../components/GroupTable';
import { GroupForm } from '../components/GroupForm';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup, useModules } from '../hooks/useGroups';
import { Skeleton } from '../../../components/ui/skeleton';
import { useDebounce } from '../../../hooks/use-debounce';
// import { toast } from 'react-toastify';

// Import the GroupFormData type
import type { GroupFormData } from '../../shared/types/form.types';

interface GroupData {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  _count?: {
    users: number;
    permissions: number;
  };
  permissions?: Array<{
    moduleId: string;
    hasAccess: boolean;
    module?: {
      id: string;
      name: string;
      description?: string;
      subModules?: Array<{
        id: string;
        name: string;
        description?: string;
      }>;
    };
    subModulePermissions?: Array<{
      subModule: {
        id: string;
        name: string;
        description?: string;
      };
      allowed: boolean;
    }>;
  }>;
}

interface ModuleData {
  id: string;
  name: string;
  description?: string;
  subModules?: Array<{
    id: string;
    name: string;
    description?: string;
  }>;
}

interface GroupsResponse {
  data: {
    groups: GroupData[];
    pagination: {
      page: number;
      totalPages: number;
      total: number;
      limit: number;
    };
  };
}

interface ModulesResponse {
  data: ModuleData[];
}

export const GroupsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useGroups({ 
    page, 
    limit: 10, 
    search: debouncedSearch 
  });
  
  const { data: modulesData } = useModules();
  const createMutation = useCreateGroup();
  const updateMutation = useUpdateGroup();
  const deleteMutation = useDeleteGroup();

  const handleEdit = (group: GroupData) => {
    setSelectedGroup(group);
    setFormOpen(true);
  };

  const handleDelete = (group: GroupData) => {
    setGroupToDelete(group);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (groupToDelete) {
      await deleteMutation.mutateAsync(groupToDelete.id);
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  // Update the type to match what GroupForm expects
  const handleFormSubmit = async (formData: GroupFormData): Promise<void> => {
    try {
      // Convert to plain object for the API
      const submitData = JSON.parse(JSON.stringify(formData));
      
      if (selectedGroup) {
        await updateMutation.mutateAsync({ id: selectedGroup.id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      
      setFormOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      // Error is handled by the mutation hooks
      console.log(error);
      
    }
  };

  // const handleExport = () => {
  //   // toast.info('Export functionality coming soon');
  // };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  const responseData = data as GroupsResponse;
  const groups = responseData?.data.groups || [];
  const pagination = responseData?.data.pagination;
  const modules = (modulesData as ModulesResponse)?.data || [];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Group Management</h1>
        <Button
          onClick={() => {
            setSelectedGroup(null);
            setFormOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Group
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search groups..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      <GroupTable
        groups={groups}
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

      <GroupForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setSelectedGroup(null);
        }}
        group={selectedGroup}
        modules={modules}
        onSubmit={handleFormSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Group</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{groupToDelete?.name}"?
              {groupToDelete?._count?.users ? (
                <span className="mt-2 block font-semibold text-destructive">
                  Warning: This group has {groupToDelete._count.users} user(s) assigned.
                </span>
              ) : null}
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
