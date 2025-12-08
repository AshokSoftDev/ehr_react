import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import type { DocumentType } from '@/features/masters/types/documentType.types';

const formSchema = z.object({
  type_name: z.string().min(1, 'Type name is required'),
  description: z.string().optional(),
});

export type DocumentTypeFormValues = z.infer<typeof formSchema>;

interface DocumentTypeFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DocumentTypeFormValues) => void;
  initial?: DocumentType;
}

export function DocumentTypeFormSheet({ open, onOpenChange, onSubmit, initial }: DocumentTypeFormSheetProps) {
  const form = useForm<DocumentTypeFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type_name: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initial) {
      form.reset({
        type_name: initial.type_name,
        description: initial.description ?? '',
      });
    } else {
      form.reset({
        type_name: '',
        description: '',
      });
    }
  }, [initial, form, open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="pb-4 border-b">
          <SheetTitle className="text-xl font-semibold">
            {initial ? 'Edit Document Type' : 'Add Document Type'}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 p-4 pt-6"
          >
            <FormFloatingInput
              control={form.control}
              name="type_name"
              label="Type Name *"
            />
            <FormFloatingInput
              control={form.control}
              name="description"
              label="Description"
            />
            <div className="flex justify-end gap-3 pt-4 mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {initial ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
