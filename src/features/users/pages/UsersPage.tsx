import React, { useMemo, useState, useRef, useEffect } from "react";
import { Button } from "../../../components/ui/button";
import { Plus } from "lucide-react";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";
import { UserForm } from "../components/UserForm";
import { UserFilters } from "../components/UserFilters";
import {
  useInfiniteUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
} from "../hooks/useUsers";
import { useGroups } from "../../groups/hooks/useGroups";
import type { User, CreateUserDto, UpdateUserDto } from "../types/user.types";
import { useDebounce } from "../../../hooks/use-debounce";

import { ScrollArea } from "../../../components/ui/scroll-area";
import { UserList } from "../components/UserList";

export const UsersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<string>("");
  const [limit] = useState(15);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const debouncedSearch = useDebounce(search, 500);

  const { data: groupsData } = useGroups();
  const listQuery = useInfiniteUsers({
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
  };

  const hasActiveFilters = !!(
    search ||
    groupFilter ||
    statusFilter ||
    accountTypeFilter
  );

  const users = useMemo(() => {
    return listQuery.data?.pages.flatMap((page: any) => page.data.users) || [];
  }, [listQuery.data]);

  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && listQuery.hasNextPage && !listQuery.isFetchingNextPage && !listQuery.isLoading) {
          listQuery.fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [listQuery.hasNextPage, listQuery.isFetchingNextPage, listQuery.isLoading, listQuery.fetchNextPage]);

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

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Section */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10 px-2 py-2">
        <div className="">
          <div className="flex items-center justify-between mb-4 mt-2">
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-muted-foreground text-xs mt-0.5">
                Manage system users, permissions and access control
              </p>
            </div>
            <div className="flex gap-2">
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
            }}
            groupId={groupFilter}
            onGroupChange={(value) => {
              setGroupFilter(value);
            }}
            status={statusFilter}
            onStatusChange={(value) => {
              setStatusFilter(value);
            }}
            accountType={accountTypeFilter}
            onAccountTypeChange={(value) => {
              setAccountTypeFilter(value);
            }}
            groups={groups}
            onReset={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea className="flex-1 px-2 pb-6">
        <div className="pt-2">
          <UserList
            users={users}
            isLoading={listQuery.isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />

          {listQuery.hasNextPage && (
            <div ref={observerTarget} className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          )}
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
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete User"
        description={
          userToDelete ? (
            <span>
              Are you sure you want to delete "
              <span className="font-bold">{userToDelete.fullName}</span>"?
              {userToDelete.children && userToDelete.children.length > 0 && (
                <span className="mt-2 block font-semibold text-destructive">
                  Warning: This user has {userToDelete.children.length} child
                  user(s).
                </span>
              )}
              <span className="block mt-1">This action cannot be undone.</span>
            </span>
          ) : (
            "This action cannot be undone."
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
};
