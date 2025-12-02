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
import type { DrugItem } from '../types/drug.types';
import { drugService } from '../services/drug.service';
import { DrugFormSheet, type DrugFormValues } from '../components/DrugFormSheet';
import { createDrugColumns } from '../components/DrugTableColumns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function DrugsPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<DrugItem | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

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
    queryKey: ['drugs', filters],
    queryFn: () => drugService.list(filters),
  });

  const drugs = listQuery.data ?? [];
  const total = drugs.length;

  const pagedDrugs = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return drugs.slice(startIndex, startIndex + limit);
  }, [drugs, page, limit]);

  const createMutation = useMutation({
    mutationFn: (values: DrugFormValues) =>
      drugService.create({
        drug_generic: values.drug_generic,
        drug_name: values.drug_name,
        drug_type: values.drug_type,
        drug_dosage: values.drug_dosage,
        drug_measure: values.drug_measure,
        instruction: values.instruction,
        status: values.status ?? 1,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: DrugFormValues }) =>
      drugService.update(input.id, {
        drug_generic: input.values.drug_generic,
        drug_name: input.values.drug_name,
        drug_type: input.values.drug_type,
        drug_dosage: input.values.drug_dosage,
        drug_measure: input.values.drug_measure,
        instruction: input.values.instruction,
        status: input.values.status,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => drugService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drugs'] });
    },
  });

  const columns = useMemo(
    () =>
      createDrugColumns({
        onEdit: (drug) => {
          setEditItem(drug);
          setOpenForm(true);
        },
        onDelete: (id) => {
          setPendingDeleteId(id);
          setDeleteDialogOpen(true);
        },
      }),
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Drug Master</h1>
          <p className="text-sm text-muted-foreground">
            Manage drug catalog and search by generic or name.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
        >
          Add Drug
        </Button>
      </div>

      <Form {...filterForm}>
        <form className="grid gap-3 md:grid-cols-3">
          <FormFloatingInput control={filterForm.control} name="search" label="Search (generic, name)" />
        </form>
      </Form>

      <Separator />

      <AdvancedDataTable
        columns={columns}
        data={pagedDrugs}
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

      <DrugFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) {
            setEditItem(null);
          }
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.drug_id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        initial={editItem ?? undefined}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Drug</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this drug?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setPendingDeleteId(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (pendingDeleteId != null) {
                  deleteMutation.mutate(pendingDeleteId);
                  setPendingDeleteId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default DrugsPage;

