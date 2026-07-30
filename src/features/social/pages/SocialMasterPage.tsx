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
import type { SocialItem } from '../types/social.types';
import { socialService } from '../services/social.service';
import { SocialFormSheet, type SocialFormValues } from '../components/SocialFormSheet';
import { SocialList } from '../components/SocialList';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function SocialMasterPage() {
  const queryClient = useQueryClient();
  const [displayCount, setDisplayCount] = useState(15);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<SocialItem | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<SocialItem | null>(null);

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
    queryKey: ['socialMaster', filters],
    queryFn: () => socialService.list(),
  });

  const allItems = listQuery.data ?? [];
  const items = useMemo(() => {
    if (!filters.search) return allItems;
    const s = filters.search.toLowerCase();
    return allItems.filter(p => p.socialName.toLowerCase().includes(s) || p.notes?.toLowerCase().includes(s) || p.option1.toLowerCase().includes(s) || p.option2.toLowerCase().includes(s));
  }, [allItems, filters.search]);

  const total = items.length;

  useEffect(() => {
    setDisplayCount(15);
  }, [filters]);

  const pagedItems = useMemo(() => {
    return items.slice(0, displayCount);
  }, [items, displayCount]);

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
    mutationFn: (values: SocialFormValues) =>
      socialService.create({
        socialName: values.socialName,
        option1: values.option1,
        option2: values.option2,
        notes: values.notes,
        status: values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      queryClient.invalidateQueries({ queryKey: ['socialMaster'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { id: number; values: SocialFormValues }) =>
      socialService.update(input.id, {
        socialName: input.values.socialName,
        option1: input.values.option1,
        option2: input.values.option2,
        notes: input.values.notes,
        status: input.values.status ? 1 : 0,
      }),
    onSuccess: () => {
      setOpenForm(false);
      setEditItem(null);
      queryClient.invalidateQueries({ queryKey: ['socialMaster'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => socialService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['socialMaster'] });
    },
  });

  const handleEdit = (item: SocialItem) => {
    setEditItem(item);
    setOpenForm(true);
  };

  const handleDelete = (item: SocialItem) => {
    setDeleteItem(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-card h-full flex flex-col bg-background">
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Social History Master
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage social habits and condition options
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
            Add Social Item
          </Button>
        </div>

        <div className="py-2 border-y border-border/50 bg-muted/20">
          <Form {...filterForm}>
            <form className="flex gap-3 px-1 items-end">
              <div className="w-full sm:w-64 relative group">
                <FormFloatingInput
                  control={filterForm.control}
                  name="search"
                  label="Search Social Items..."
                  className="bg-background border-border/50 focus:border-primary shadow-sm"
                />
              </div>
            </form>
          </Form>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4">
        <SocialList
          items={pagedItems}
          isLoading={listQuery.isLoading}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
        {displayCount < total && (
          <div ref={observerTarget} className="h-10 w-full" />
        )}
      </ScrollArea>

      <SocialFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) setEditItem(null);
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.social_master_id, values });
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
            deleteMutation.mutate(deleteItem.social_master_id);
            setDeleteDialogOpen(false);
          }
        }}
        title="Delete Social Master Item"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete <span className="font-bold">{deleteItem.socialName}</span>?
            </span>
          ) : (
            "Are you sure you want to delete this item?"
          )
        }
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default SocialMasterPage;
