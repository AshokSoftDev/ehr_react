import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import type { LocationItem } from '../types/location.types';
import { locationService } from '../services/location.service';
import { LocationFormSheet, type LocationFormValues } from '../components/LocationFormSheet';
import { createLocationColumns } from '../components/LocationTableColumns';

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
    defaultValues: { search: '' },
  });

  const watchFilters = filterForm.watch();

  const filters = useMemo(
    () => ({
      search: filterForm.getValues().search || undefined,
    }),
    [filterForm, watchFilters],
  );

  const listQuery = useQuery({
    queryKey: ['locations', filters],
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
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: LocationFormValues }) =>
      locationService.update(input.id, {
        location_name: input.values.location_name,
        address: input.values.address,
        city: input.values.city,
        state: input.values.state,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => locationService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['locations'] }),
  });

  const columns = useMemo(
    () =>
      createLocationColumns({
        onEdit: location => {
          setEditItem(location);
          setOpenForm(true);
        },
        onDelete: id => {
          if (window.confirm('Are you sure you want to delete this location?')) {
            deleteMutation.mutate(id);
          }
        },
      }),
    [deleteMutation],
  );

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Location Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage locations and search by name, city, or state.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          Add Location
        </Button>
      </div>

      <Form {...filterForm}>
        <form className="grid gap-3 md:grid-cols-3">
          <FormFloatingInput
            control={filterForm.control}
            name="search"
            label="Search (name, city, state)"
          />
        </form>
      </Form>

      <Separator />

      <AdvancedDataTable
        columns={columns}
        data={pagedLocations}
        isLoading={listQuery.isLoading}
        page={page}
        limit={limit}
        total={total}
        onPageChange={setPage}
        onLimitChange={value => {
          setLimit(value);
          setPage(1);
        }}
      />

      <LocationFormSheet
        open={openForm}
        onOpenChange={open => {
          setOpenForm(open);
          if (!open) {
            setEditItem(null);
          }
        }}
        onSubmit={values => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.location_id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        initial={editItem ?? undefined}
      />
    </div>
  );
}

export default LocationsPage;

