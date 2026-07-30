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
import type { SurgeryItem } from '../types/surgery.types';
import { surgeryService } from '../services/surgery.service';
import { SurgeryFormSheet, type SurgeryFormValues } from '../components/SurgeryFormSheet';
import { SurgeryList } from '../components/SurgeryList';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function SurgeryMasterPage() {
  const queryClient = useQueryClient();
  const [displayCount, setDisplayCount] = useState(15);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<SurgeryItem | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<SurgeryItem | null>(null);

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
    queryKey: ['surgeryMaster', filters],
    queryFn: () => surgeryService.list(),
  });

  const allSurgeries = listQuery.data ?? [];
  const surgeries = useMemo(() => {
    if (!filters.search) return allSurgeries;
    const s = filters.search.toLowerCase();
    return allSurgeries.filter(p => p.surgeryName.toLowerCase().includes(s) || p.notes?.toLowerCase().includes(s));
  }, [allSurgeries, filters.search]);

  const total = surgeries.length;

  useEffect(() => {
    setDisplayCount(15);
  }, [filters]);

  const pagedSurgeries = useMemo(() => {
    return surgeries.slice(0, displayCount);
  }, [surgeries, displayCount]);

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
    mutationFn: (values: SurgeryFormValues) =>
      surgeryService.create({
        surgeryName: values.surgeryName,
        notes: values.notes,
        status: values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['surgeryMaster'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: SurgeryFormValues }) =>
      surgeryService.update(input.id, {
        surgeryName: input.values.surgeryName,
        notes: input.values.notes,
        status: input.values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['surgeryMaster'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => surgeryService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['surgeryMaster'] });
    },
  });

  const handleEdit = (surgery: SurgeryItem) => {
    setEditItem(surgery);
    setOpenForm(true);
  };

  const handleDelete = (surgery: SurgeryItem) => {
    setDeleteItem(surgery);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-card h-full flex flex-col bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Surgery Master
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage Surgical Procedures and Operations catalog
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
            Add Surgery
          </Button>
        </div>

        <div className="py-2 border-y border-border/50 bg-muted/20">
          <Form {...filterForm}>
            <form className="flex gap-3 px-1 items-end">
              <div className="w-full sm:w-64 relative group">
                <FormFloatingInput
                  control={filterForm.control}
                  name="search"
                  label="Search surgeries..."
                  className="bg-background border-border/50 focus:border-primary shadow-sm"
                />
              </div>
            </form>
          </Form>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4">
        <SurgeryList
          surgeries={pagedSurgeries}
          isLoading={listQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {displayCount < total && (
          <div ref={observerTarget} className="h-10 w-full" />
        )}
      </ScrollArea>

      <SurgeryFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditItem(null);
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.surgery_id, values });
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
            deleteMutation.mutate(deleteItem.surgery_id);
            setDeleteDialogOpen(false);
          }
        }}
        title="Delete Surgery Procedure"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete <span className="font-bold">{deleteItem.surgeryName}</span>?
            </span>
          ) : (
            "Are you sure you want to delete this procedure?"
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default SurgeryMasterPage;
