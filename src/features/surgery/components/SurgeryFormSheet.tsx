import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingTextarea } from "@/components/form/form-floating-textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";

export const surgeryFormSchema = z.object({
  surgeryName: z.string().min(1, "Surgery name is required"),
  notes: z.string().optional(),
  status: z.boolean(),
});

export type SurgeryFormValues = z.infer<typeof surgeryFormSchema>;

interface SurgeryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SurgeryFormValues) => void;
  initial?: { surgeryName: string; notes: string | null; status: number };
  isLoading?: boolean;
}

export function SurgeryFormSheet({ open, onOpenChange, onSubmit, initial, isLoading }: SurgeryFormSheetProps) {
  const form = useForm<SurgeryFormValues>({
    resolver: zodResolver(surgeryFormSchema),
    defaultValues: {
      surgeryName: "",
      notes: "",
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (initial) {
        form.reset({
          surgeryName: initial.surgeryName,
          notes: initial.notes || "",
          status: initial.status === 1,
        });
      } else {
        form.reset({ surgeryName: "", notes: "", status: true });
      }
    }
  }, [open, initial, form]);

  const handleSubmit = (values: SurgeryFormValues) => {
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-full sm:max-w-md p-0 flex flex-col h-full bg-background border-l"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-6 py-4 border-b bg-muted/20 shrink-0">
          <SheetTitle>{initial ? "Edit Surgery Procedure" : "Add New Surgery Procedure"}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <FormFloatingInput
                control={form.control}
                name="surgeryName"
                label="Surgery Name"
                required
              />

              <FormFloatingTextarea
                control={form.control}
                name="notes"
                label="Notes (Optional)"
                className="resize-none"
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm bg-card">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Active Status
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Allow this procedure to be selected for patient surgical history.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-muted/20 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-primary-gradient hover:opacity-90 min-w-[100px]">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initial ? "Save Changes" : "Create Surgery"}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
