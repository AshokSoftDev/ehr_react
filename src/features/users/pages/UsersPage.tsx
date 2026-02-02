import React, { useMemo, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Plus, Loader2, Download } from "lucide-react";
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
import { UserForm } from "../components/UserForm";
import { UserFilters } from "../components/UserFilters";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../hooks/useUsers";
import { useGroups } from "../../groups/hooks/useGroups";
import type { User, CreateUserDto, UpdateUserDto } from "../types/user.types";
import { useDebounce } from "../../../hooks/use-debounce";
import { toast } from "react-toastify";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import type { ColumnDef } from "@tanstack/react-table";
import { userColumns } from "./userColumns";

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data: groupsData } = useGroups();
  const { data, isLoading } = useUsers({
    page,
    limit,
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

  const handleFormSubmit = async (data: any) => {
    if (selectedUser) {
      await updateMutation.mutateAsync({
        id: selectedUser.userId,
        data: data as UpdateUserDto,
      });
    } else {
      await createMutation.mutateAsync(data as CreateUserDto);
    }
  };

  const resetFilters = () => {
    setSearch("");
    setGroupFilter("");
    setStatusFilter("");
    setAccountTypeFilter("");
    setPage(1);
  };

  const hasActiveFilters = !!(
    search ||
    groupFilter ||
    statusFilter ||
    accountTypeFilter
  );

  const handleExport = () => {
    toast.info("Export functionality coming soon");
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

  const groups = (
    (groupsData as GroupsResponse | undefined)?.data?.groups || []
  ).filter((group) => group.id && group.id !== "");

  const columns: ColumnDef<User, unknown>[] = useMemo(
    () => userColumns(handleEdit, handleDelete),
    // handleEdit/handleDelete are stable enough here; they only depend on setters
    [handleEdit, handleDelete]
  );

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="">
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
          />
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1">
        <div className="">
          <AdvancedDataTable<User, unknown>
            columns={columns}
            data={users}
            isLoading={isLoading}
            page={page}
            limit={limit}
            total={pagination?.total ?? 0}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      </ScrollArea>

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
                  Warning: This user has {userToDelete.children.length} child
                  user(s).
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
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
