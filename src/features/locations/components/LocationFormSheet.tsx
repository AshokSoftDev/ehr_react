import { useEffect } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { FormFloatingInput } from '@/components/form/form-floating-input';
import { FormSwitch } from '@/components/ui/form-switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SheetForm } from '@/components/ui/sheet-form';
import type { LocationItem } from '../types/location.types';

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
}

export function LocationFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initial,
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
    <SheetForm
      open={open}
      onOpenChange={onOpenChange}
      title={initial?.location_id ? 'Edit Location' : 'Add Location'}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(values => onSubmit(values))}
          className="space-y-4 p-2"
        >
          <FormFloatingInput
            control={form.control}
            name="location_name"
            label="Location Name"
          />
          <FormFloatingInput control={form.control} name="address" label="Address" />
          <div className="grid gap-3 md:grid-cols-2">
            <FormFloatingInput control={form.control} name="city" label="City" />
            <FormFloatingInput control={form.control} name="state" label="State" />
          </div>
          <FormSwitch control={form.control} name="active" label="Active" />
          <Separator />
          <div className="sticky bottom-0 flex items-center justify-end gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 -mx-2 -mb-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </SheetForm>
  );
}

export default LocationFormSheet;
