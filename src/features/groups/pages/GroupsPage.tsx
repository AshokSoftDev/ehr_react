import React, { useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../../components/ui/alert-dialog";
import { GroupForm } from "../components/GroupForm";
import {
  useGroups,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  useModules,
} from "../hooks/useGroups";
import { useDebounce } from "../../../hooks/use-debounce";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import type { ColumnDef } from "@tanstack/react-table";
import type { GroupData } from "./GroupsPage.types";
import { groupColumns } from "./groupColumns";
import type { GroupFormData } from "../../shared/types/form.types";

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
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<GroupData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<GroupData | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data, isLoading } = useGroups({
    page,
    limit,
    search: debouncedSearch,
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
        await updateMutation.mutateAsync({
          id: selectedGroup.id,
          data: submitData,
        });
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

  // Hide system group (root-only) from UI list/edit/delete
  const visibleGroups = useMemo(
    () => groups.filter((g) => g.name !== "System Administrators"),
    [groups]
  );

  const columns: ColumnDef<GroupData, unknown>[] = useMemo(
    () => groupColumns(handleEdit, handleDelete),
    [handleEdit, handleDelete]
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto">
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

          {/* Search */}
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
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        <div className="container mx-auto">
          <AdvancedDataTable<GroupData, unknown>
            columns={columns}
            data={visibleGroups}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={visibleGroups.length ?? 0}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </ScrollArea>

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
                  Warning: This group has {groupToDelete._count.users} user(s)
                  assigned.
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
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
