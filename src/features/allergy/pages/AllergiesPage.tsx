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
import type { AllergyItem } from '../types/allergy.types';
import { allergyService } from '../services/allergy.service';
import { AllergyFormSheet, type AllergyFormValues } from '../components/AllergyFormSheet';
import { AllergyList } from '../components/AllergyList';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function AllergiesPage() {
  const queryClient = useQueryClient();
  const [displayCount, setDisplayCount] = useState(15);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<AllergyItem | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<AllergyItem | null>(null);

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
    queryKey: ['allergies', filters],
    queryFn: () => allergyService.list(filters),
  });

  const allergies = listQuery.data ?? [];
  const total = allergies.length;

  useEffect(() => {
    setDisplayCount(15);
  }, [filters]);

  const pagedAllergies = useMemo(() => {
    return allergies.slice(0, displayCount);
  }, [allergies, displayCount]);

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
    mutationFn: (values: AllergyFormValues) =>
      allergyService.create({
        allergyName: values.allergyName,
        allergyType: values.allergyType,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: AllergyFormValues }) =>
      allergyService.update(input.id, {
        allergyName: input.values.allergyName,
        allergyType: input.values.allergyType,
        status: input.values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => allergyService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allergies'] });
    },
  });

  const handleEdit = (allergy: AllergyItem) => {
    setEditItem(allergy);
    setOpenForm(true);
  };

  const handleDelete = (allergy: AllergyItem) => {
    setDeleteItem(allergy);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-card h-full flex flex-col bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Allergy Master
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage allergy catalog and search by name or type
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
            Add Allergy
          </Button>
        </div>

        <div className="py-2 border-y border-border/50 bg-muted/20">
          <Form {...filterForm}>
            <form className="flex gap-3 px-1 items-end">
              <div className="w-full sm:w-64 relative group">
                <FormFloatingInput
                  control={filterForm.control}
                  name="search"
                  label="Search allergies..."
                  className="bg-background border-border/50 focus:border-primary shadow-sm"
                />
              </div>
            </form>
          </Form>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4">
        <AllergyList
          allergies={pagedAllergies}
          isLoading={listQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {displayCount < total && (
          <div ref={observerTarget} className="h-10 w-full" />
        )}
      </ScrollArea>

      <AllergyFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditItem(null);
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.allergy_id, values });
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
            deleteMutation.mutate(deleteItem.allergy_id);
            setDeleteDialogOpen(false);
          }
        }}
        title="Delete Allergy"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete <span className="font-bold">{deleteItem.allergyName}</span>?
            </span>
          ) : (
            "Are you sure you want to delete this allergy?"
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default AllergiesPage;
