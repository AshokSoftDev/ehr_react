import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormFloatingTextarea } from '@/components/form/form-floating-textarea';
import { FormSwitch } from '@/components/ui/form-switch';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Loader2 } from 'lucide-react';

import type { LocationItem } from '../types/location.types';
import { ScrollArea } from '@/components/ui/scroll-area';

const schema = z.object({
  location_name: z.string().min(1, 'Location name is required'),
  address: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  active: z.boolean().optional(),
});

type LocationFormInput = z.input<typeof schema>;
export type LocationFormValues = z.output<typeof schema>;

interface LocationFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: LocationFormValues) => void;
  initial?: Partial<LocationItem>;
  isLoading?: boolean;
}

export function LocationFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initial,
  isLoading,
}: LocationFormSheetProps) {
  const form = useForm<LocationFormInput, unknown, LocationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      location_name: initial?.location_name ?? '',
      address: initial?.address ?? '',
      city: initial?.city ?? '',
      state: initial?.state ?? '',
      active: initial?.active ?? true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        location_name: initial?.location_name ?? '',
        address: initial?.address ?? '',
        city: initial?.city ?? '',
        state: initial?.state ?? '',
        active: initial?.active ?? true,
      });
    }
  }, [open, initial, form]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        preventClose 
        className="w-full sm:max-w-md p-0 flex flex-col h-full"
      >
        <SheetHeader className="px-4 border-b shrink-0 py-4">
          <SheetTitle>
            {initial?.location_id ? 'Edit Location' : 'Add Location'}
          </SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(values => onSubmit(values))}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                <FormFloatingInput
                  control={form.control}
                  name="location_name"
                  label="Location Name *"
                />
                <FormFloatingTextarea 
                  control={form.control} 
                  name="address" 
                  label="Address" 
                />
                <div className="grid gap-3 md:grid-cols-2">
                  <FormFloatingInput control={form.control} name="city" label="City *" />
                  <FormFloatingInput control={form.control} name="state" label="State *" />
                </div>
                <FormSwitch control={form.control} name="active" label="Active" />
              </div>
            </ScrollArea>

            <div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-primary-gradient hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initial?.location_id ? 'Update Location' : 'Add Location'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default LocationFormSheet;
