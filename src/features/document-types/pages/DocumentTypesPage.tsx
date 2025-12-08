import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { Card, CardContent } from '@/components/ui/card';
import { useDocumentTypes, useCreateDocumentType, useUpdateDocumentType, useDeleteDocumentType } from '@/features/masters/hooks/useDocumentTypes';
import type { DocumentType } from '@/features/masters/types/documentType.types';
import { DocumentTypeFormSheet } from '../components/DocumentTypeFormSheet';
import { Pencil, Trash2, FileText, Plus } from 'lucide-react';
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

export function DocumentTypesPage() {
  const [openForm, setOpenForm] = useState(false);
  const [editItem, setEditItem] = useState<DocumentType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const filterForm = useForm<FilterValues>({
    resolver: zodResolver(filterSchema),
    defaultValues: { search: '' },
  });

  const watchFilters = filterForm.watch();
  const searchValue = watchFilters.search || undefined;

  const { data: documentTypes = [], isLoading } = useDocumentTypes(searchValue);
  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const deleteMutation = useDeleteDocumentType();

  const handleEdit = (item: DocumentType) => {
    setEditItem(item);
    setOpenForm(true);
  };

  const handleDelete = (id: number) => {
    setPendingDeleteId(id);
    setDeleteDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Document Types</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage document types for visit documents
          </p>
        </div>
        <Button
          onClick={() => {
            setEditItem(null);
            setOpenForm(true);
          }}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Type
        </Button>
      </div>

      {/* Search */}
      <Form {...filterForm}>
        <form className="max-w-sm">
          <FormFloatingInput control={filterForm.control} name="search" label="Search document types..." />
        </form>
      </Form>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                <div className="h-4 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : documentTypes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h3 className="font-semibold text-lg mb-1">No document types</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Get started by creating your first document type
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setEditItem(null);
                setOpenForm(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Document Type
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {documentTypes.map((item) => (
            <Card
              key={item.document_type_id}
              className="group hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold truncate">{item.type_name}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {item.description || 'No description'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEdit(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(item.document_type_id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document type? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingDeleteId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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

export default DocumentTypesPage;
