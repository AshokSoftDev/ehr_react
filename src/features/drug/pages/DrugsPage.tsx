import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { AdvancedDataTable } from '@/components/ui/advanced-data-table';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import type { DrugItem } from '../types/drug.types';
import { drugService } from '../services/drug.service';
import { DrugFormSheet, type DrugFormValues } from '../components/DrugFormSheet';
import { createDrugColumns } from '../components/DrugTableColumns';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';

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
  const [deleteItem, setDeleteItem] = useState<DrugItem | null>(null);

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
        amount: values.amount,
        instruction: values.instruction,
        status: values.status ? 1 : 0,
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
        amount: input.values.amount,
        instruction: input.values.instruction,
        status: input.values.status ? 1 : 0,
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
        onDelete: (drug) => {
          setDeleteItem(drug);
          setDeleteDialogOpen(true);
        },
      }),
    [],
  );

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Drug Master
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage drug catalog and search by generic or name
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
            Add Drug
          </Button>
        </div>

        <Form {...filterForm}>
          <form className="grid gap-3 md:grid-cols-4">
            <FormFloatingInput control={filterForm.control} name="search" label="Search (generic, name)" className="h-10" />
          </form>
        </Form>
      </div>

      <ScrollArea className="flex-1 mt-4">
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
      </ScrollArea>

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

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (deleteItem) {
            deleteMutation.mutate(deleteItem.drug_id);
            setDeleteItem(null);
          }
        }}
        title="Delete Drug"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete the drug{" "}
              <span className="font-bold">"{deleteItem.drug_name}"</span>?
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

export default DrugsPage;

