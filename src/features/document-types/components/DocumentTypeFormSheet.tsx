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
import { Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  isLoading?: boolean;
}

export function DocumentTypeFormSheet({ open, onOpenChange, onSubmit, initial, isLoading }: DocumentTypeFormSheetProps) {
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
      <SheetContent 
        side="right" 
        preventClose 
        className="w-full sm:max-w-md p-0 flex flex-col h-full"
      >
        <SheetHeader className="px-4 border-b shrink-0 py-4">
          <SheetTitle>
            {initial ? 'Edit Document Type' : 'Add Document Type'}
          </SheetTitle>
        </SheetHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
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
              </div>
            </ScrollArea>
           
            <div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-gradient hover:opacity-90" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initial ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
