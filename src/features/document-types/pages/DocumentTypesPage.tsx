import { useState, useMemo, useEffect, useRef } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentTypes, useCreateDocumentType, useUpdateDocumentType, useDeleteDocumentType } from '@/features/masters/hooks/useDocumentTypes';
import type { DocumentType } from '@/features/masters/types/documentType.types';
import { DocumentTypeFormSheet } from '../components/DocumentTypeFormSheet';
import { DocumentTypeList } from '../components/DocumentTypeList';
import { Plus } from 'lucide-react';
import { ConfirmDeleteDialog } from '@/components/common/ConfirmDeleteDialog';

const filterSchema = z.object({
  search: z.string().optional(),
});

type FilterValues = z.infer<typeof filterSchema>;

export function DocumentTypesPage() {
  const [displayCount, setDisplayCount] = useState(15);
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<DocumentType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<DocumentType | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '' },
  });

  const watchFilters = filterForm.watch();
  const searchValue = watchFilters.search || undefined;

  const { data: documentTypes = [], isLoading } = useDocumentTypes(searchValue);
  const total = documentTypes.length;

  useEffect(() => {
    setDisplayCount(15);
  }, [searchValue]);

  const pagedDocumentTypes = useMemo(() => {
    return documentTypes.slice(0, displayCount);
  }, [documentTypes, displayCount]);

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

  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const handleEdit = (item: DocumentType) => {
    setEditItem(item);
    setOpenForm(true);
  };

  const handleDelete = (item: DocumentType) => {
    setDeleteItem(item);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="bg-card h-full flex flex-col bg-background">
      {/* Header */}
      <div className="bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center justify-between mb-0">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Document Types
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">
              Manage document types for visit documents
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
            Add Type
          </Button>
        </div>

        {/* Search */}
        <Form {...filterForm}>
          <form className="max-w-sm mb-4">
            <FormFloatingInput control={filterForm.control} name="search" label="Search document types..." className="h-10" />
          </form>
        </Form>
      </div>

      <ScrollArea className="flex-1 mt-0">
        <div className="">
          <DocumentTypeList
            documentTypes={pagedDocumentTypes}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
          <div ref={observerTarget} className="h-4 w-full" />
        </div>
      </ScrollArea>

      <DocumentTypeFormSheet
        open={openForm}
        onOpenChange={(open) => {
          setOpenForm(open);
          if (!open) {
            setEditItem(null);
          }
        }}
        onSubmit={(values) => {
          if (editItem) {
            updateMutation.mutate({ id: editItem.document_type_id, payload: values });
          } else {
            createMutation.mutate(values);
          }
          setOpenForm(false);
          setEditItem(null);
        }}
        initial={editItem ?? undefined}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => {
          if (deleteItem) {
            deleteMutation.mutate(deleteItem.document_type_id);
            setDeleteItem(null);
          }
        }}
        title="Delete Document Type"
        description={
          deleteItem ? (
            <span>
              Are you sure you want to delete the document type{" "}
              <span className="font-bold">"{deleteItem.type_name}"</span>?
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

export default DocumentTypesPage;
