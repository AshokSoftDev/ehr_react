import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { AdvancedDataTable } from "@/components/ui/advanced-data-table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import type { LocationItem } from "../types/location.types";
import { locationService } from "../services/location.service";
import {
  LocationFormSheet,
  type LocationFormValues,
} from "../components/LocationFormSheet";
import { createLocationColumns } from "../components/LocationTableColumns";
import { ConfirmDeleteDialog } from "@/components/common/ConfirmDeleteDialog";

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function LocationsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<LocationItem | null>(null);

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: "" },
  });

  const watchFilters = filterForm.watch();

  const filters = useMemo(
    () => ({
      search: filterForm.getValues().search || undefined,
    }),
    [filterForm, watchFilters]
  );

  const listQuery = useQuery({
    queryKey: ["locations", filters],
    queryFn: () => locationService.list(filters),
  });

  const locations = listQuery.data ?? [];
  const total = locations.length;

  const pagedLocations = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return locations.slice(startIndex, startIndex + limit);
  }, [locations, page, limit]);

  const createMutation = useMutation({
    mutationFn: (values: LocationFormValues) =>
      locationService.create({
        location_name: values.location_name,
        address: values.address,
        city: values.city,
        state: values.state,
        active: true,
        status: 1,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: LocationFormValues }) =>
      locationService.update(input.id, {
        location_id: input.id,
        location_name: input.values.location_name,
        address: input.values.address,
        city: input.values.city,
        state: input.values.state,
        active:
          typeof input.values.active === "boolean"
            ? input.values.active
            : undefined,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => locationService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["locations"] }),
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<LocationItem | null>(null);

  const columns = useMemo(
    () =>
      createLocationColumns({
        onEdit: (location) => {
          setEditItem(location);
          setOpenForm(true);
        },
        onDelete: (location) => {
          setDeleteItem(location);
          setDeleteDialogOpen(true);
        },
      }),
    [deleteMutation]
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Location Master
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage locations and search by name, city, or state
            </p>
          </div>
          <Button
            onClick={() => {
              setEditItem(null);
              setOpenForm(true);
            }}
            className="bg-primary-gradient hover:opacity-90 shadow-lg"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Location
          </Button>
        </div>

        <Form {...filterForm}>
          <form className="grid gap-3 md:grid-cols-4">
            <FormFloatingInput
              control={filterForm.control}
              name="search"
              label="Search locations"
              className="h-10"
            />
          </form>
        </Form>
      </div>

      <ScrollArea className="flex-1 mt-0">
        <AdvancedDataTable
          columns={columns}
          data={pagedLocations}
          isLoading={listQuery.isLoading}
          page={page}
          limit={limit}
          total={total}
          onPageChange={setPage}
          onLimitChange={(value) => {
            setLimit(value);
            setPage(1);
          }}
        />
      </ScrollArea>

      <LocationFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) {
            setEditItem(null);
          }
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.location_id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        initial={editItem ?? undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (deleteItem) {
            deleteMutation.mutate(deleteItem.location_id);
            setDeleteItem(null);
          }
        }}
        title="Delete Location"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete the location{" "}
              <span className="font-bold">"{deleteItem.location_name}"</span>?
            </span>
          ) : (
            "This action cannot be undone."
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default LocationsPage;
