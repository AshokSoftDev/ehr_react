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
import type { FamilyDiseaseItem } from '../types/familyDisease.types';
import { familyDiseaseService } from '../services/familyDisease.service';
import { FamilyDiseaseFormSheet, type FamilyDiseaseFormValues } from '../components/FamilyDiseaseFormSheet';
import { FamilyDiseaseList } from '../components/FamilyDiseaseList';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function FamilyDiseasesPage() {
  const queryClient = useQueryClient();
  const [displayCount, setDisplayCount] = useState(15);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<FamilyDiseaseItem | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<FamilyDiseaseItem | null>(null);

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
    queryKey: ['familyDiseaseMaster', filters],
    queryFn: () => familyDiseaseService.list(),
  });

  const allDiseases = listQuery.data ?? [];
  const diseases = useMemo(() => {
    if (!filters.search) return allDiseases;
    const s = filters.search.toLowerCase();
    return allDiseases.filter(p => p.diseaseName.toLowerCase().includes(s) || p.notes?.toLowerCase().includes(s));
  }, [allDiseases, filters.search]);

  const total = diseases.length;

  useEffect(() => {
    setDisplayCount(15);
  }, [filters]);

  const pagedDiseases = useMemo(() => {
    return diseases.slice(0, displayCount);
  }, [diseases, displayCount]);

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
    mutationFn: (values: FamilyDiseaseFormValues) =>
      familyDiseaseService.create({
        diseaseName: values.diseaseName,
        notes: values.notes,
        status: values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['familyDiseaseMaster'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: FamilyDiseaseFormValues }) =>
      familyDiseaseService.update(input.id, {
        diseaseName: input.values.diseaseName,
        notes: input.values.notes,
        status: input.values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['familyDiseaseMaster'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => familyDiseaseService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['familyDiseaseMaster'] });
    },
  });

  const handleEdit = (disease: FamilyDiseaseItem) => {
    setEditItem(disease);
    setOpenForm(true);
  };

  const handleDelete = (disease: FamilyDiseaseItem) => {
    setDeleteItem(disease);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-card h-full flex flex-col bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Family Disease Master
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage Family History disease catalog
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
            Add Disease
          </Button>
        </div>

        <div className="py-2 border-y border-border/50 bg-muted/20">
          <Form {...filterForm}>
            <form className="flex gap-3 px-1 items-end">
              <div className="w-full sm:w-64 relative group">
                <FormFloatingInput
                  control={filterForm.control}
                  name="search"
                  label="Search Diseases..."
                  className="bg-background border-border/50 focus:border-primary shadow-sm"
                />
              </div>
            </form>
          </Form>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4">
        <FamilyDiseaseList
          diseases={pagedDiseases}
          isLoading={listQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {displayCount < total && (
          <div ref={observerTarget} className="h-10 w-full" />
        )}
      </ScrollArea>

      <FamilyDiseaseFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditItem(null);
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.family_disease_id, values });
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
            deleteMutation.mutate(deleteItem.family_disease_id);
            setDeleteDialogOpen(false);
          }
        }}
        title="Delete Family Disease"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete <span className="font-bold">{deleteItem.diseaseName}</span>?
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

export default FamilyDiseasesPage;
