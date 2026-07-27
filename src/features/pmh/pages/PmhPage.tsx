import { useMemo, useState, useEffect, useRef } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";
import type { PmhItem } from '../types/pmh.types';
import { pmhService } from '../services/pmh.service';
import { PmhFormSheet, type PmhFormValues } from '../components/PmhFormSheet';
import { PmhList } from '../components/PmhList';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function PmhPage() {
  const queryClient = useQueryClient();
  const [displayCount, setDisplayCount] = useState(15);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<PmhItem | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PmhItem | null>(null);

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
    queryKey: ['pmhMaster', filters],
    queryFn: () => pmhService.list(),
  });

  // Client side search filtering since our API currently doesn't implement query passing properly on the frontend service
  // but it's fine for master data which is usually small. Let's just filter it client-side.
  const allPmhs = listQuery.data ?? [];
  const pmhs = useMemo(() => {
    if (!filters.search) return allPmhs;
    const s = filters.search.toLowerCase();
    return allPmhs.filter(p => p.conditionName.toLowerCase().includes(s) || p.notes?.toLowerCase().includes(s));
  }, [allPmhs, filters.search]);

  const total = pmhs.length;

  useEffect(() => {
    setDisplayCount(15);
  }, [filters]);

  const pagedPmhs = useMemo(() => {
    return pmhs.slice(0, displayCount);
  }, [pmhs, displayCount]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayCount < total) {
          setDisplayCount((prev) => Math.min(prev + 15, total));
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [displayCount, total]);

  const createMutation = useMutation({
    mutationFn: (values: PmhFormValues) =>
      pmhService.create({
        conditionName: values.conditionName,
        notes: values.notes,
        status: values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['pmhMaster'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: PmhFormValues }) =>
      pmhService.update(input.id, {
        conditionName: input.values.conditionName,
        notes: input.values.notes,
        status: input.values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['pmhMaster'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => pmhService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pmhMaster'] });
    },
  });

  const handleEdit = (pmh: PmhItem) => {
    setEditItem(pmh);
    setOpenForm(true);
  };

  const handleDelete = (pmh: PmhItem) => {
    setDeleteItem(pmh);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-card h-full flex flex-col bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              PMH Master
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage Past Medical History catalog
            </p>
          </div>
          <Button
            onClick={() => {
              setEditItem(null);
              setOpenForm(true);
            }}
            className="bg-primary-gradient hover:opacity-90 shadow-lg"
          >
            <Plus className="mr-1 h-4 w-4" />
            Add PMH
          </Button>
        </div>

        <div className="py-2 border-y border-border/50 bg-muted/20">
          <Form {...filterForm}>
            <form className="flex gap-3 px-1 items-end">
              <div className="w-full sm:w-64 relative group">
                <FormFloatingInput
                  control={filterForm.control}
                  name="search"
                  label="Search PMH..."
                  className="bg-background border-border/50 focus:border-primary shadow-sm"
                />
              </div>
            </form>
          </Form>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4">
        <PmhList
          pmhs={pagedPmhs}
          isLoading={listQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {displayCount < total && (
          <div ref={observerTarget} className="h-10 w-full" />
        )}
      </ScrollArea>

      <PmhFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditItem(null);
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.pmh_id, values });
          } else {
            createMutation.mutate(values);
          }
        }}
        initial={editItem || undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (deleteItem) {
            deleteMutation.mutate(deleteItem.pmh_id);
            setDeleteDialogOpen(false);
          }
        }}
        title="Delete PMH Condition"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete <span className="font-bold">{deleteItem.conditionName}</span>?
            </span>
          ) : (
            "Are you sure you want to delete this condition?"
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default PmhPage;
