import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Plus, Search, Loader2, Grid, List } from 'lucide-react';
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
import { GroupGrid } from '../components/GroupGrid';
import { GroupForm } from '../components/GroupForm';
import { useGroups, useCreateGroup, useUpdateGroup, useDeleteGroup, useModules } from '../hooks/useGroups';
import { Skeleton } from '../../../components/ui/skeleton';
import { useDebounce } from '../../../hooks/use-debounce';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { cn } from '../../../lib/utils';
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useGroups({ 
    page, 
    limit: 12, 
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

  const handleFormSubmit = async (formData: GroupFormData): Promise<void> => {
    try {
      const submitData = JSON.parse(JSON.stringify(formData));
      
      if (selectedGroup) {
        await updateMutation.mutateAsync({ id: selectedGroup.id, data: submitData });
      } else {
        await createMutation.mutateAsync(submitData);
      }
      
      setFormOpen(false);
      setSelectedGroup(null);
    } catch (error) {
      console.error(error);
    }
  };

  const responseData = data as GroupsResponse;
  const groups = responseData?.data.groups || [];
  const pagination = responseData?.data.pagination;
  const modules = (modulesData as ModulesResponse)?.data || [];

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Group Management
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Manage user groups and their permissions
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedGroup(null);
                setFormOpen(true);
              }}
              className="bg-primary-gradient hover:opacity-90 shadow-lg"
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>

          {/* Search and View Mode */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search groups by name or description..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40"
              />
            </div>
            
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'grid' | 'list')}>
              <TabsList className="grid w-[100px] grid-cols-2">
                <TabsTrigger value="grid" className="px-2">
                  <Grid className="h-4 w-4" />
                </TabsTrigger>
                <TabsTrigger value="list" className="px-2">
                  <List className="h-4 w-4" />
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Summary Stats */}
          <div className="flex gap-4 mt-4">
            <div className="text-sm">
              <span className="text-muted-foreground">Total Groups:</span>
              <span className="ml-2 font-semibold text-foreground">{pagination?.total || 0}</span>
            </div>
            <div className="text-sm">
              <span className="text-muted-foreground">Page:</span>
              <span className="ml-2 font-semibold text-foreground">
                {page} of {pagination?.totalPages || 1}
              </span>
            </div>
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
                  <Skeleton key={i} className="h-[260px] rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-[80px] rounded-lg" />
                ))}
              </div>
            )
          ) : (
            <GroupGrid
              groups={groups}
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
                Showing {((page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} groups
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
