import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2, Scissors } from "lucide-react";
import type { PatientSurgeryHistoryItem } from "@/features/patients/types/patientSurgeryHistory.types";
import { useSurgeryMaster, useCreateSurgeryMaster } from "@/features/surgery/hooks/useSurgeryMaster";
import { SurgeryFormSheet } from "@/features/surgery/components/SurgeryFormSheet";
import { Checkbox } from "@/components/ui/checkbox";
import { FormSearchSelect } from "@/components/form/form-search-select";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  label: String(i + 1).padStart(2, '0'),
  value: String(i + 1)
}));

const YEAR_OPTIONS = Array.from({ length: 99 }, (_, i) => ({
  label: String(i + 1),
  value: String(i + 1)
}));

const schema = z.object({
  surgeries: z.array(z.object({
    id: z.number().optional(),
    surgeryId: z.number(),
    surgeryName: z.string(),
    selected: z.boolean(),
    month: z.string().nullable().optional(),
    year: z.string().nullable().optional(),
    comments: z.string().nullable().optional(),
  })).superRefine((data, ctx) => {
    data.forEach((item, index) => {
      if (item.selected && !item.month && !item.year) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Month or year is required",
          path: [index, "year"],
        });
      }
    });
  }),
});

export type PatientSurgeryFormValues = z.output<typeof schema>;

interface PatientSurgeryFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PatientSurgeryFormValues) => void;
  initialData: PatientSurgeryHistoryItem[];
  isLoading?: boolean;
}

export function PatientSurgeryFormSheet({ open, onOpenChange, onSubmit, initialData, isLoading }: PatientSurgeryFormSheetProps) {
  const [isMasterFormOpen, setIsMasterFormOpen] = useState(false);
  const { data: masterSurgeries, isLoading: isMasterLoading } = useSurgeryMaster();
  const createMasterMutation = useCreateSurgeryMaster();

  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      surgeries: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "surgeries",
  });

  useEffect(() => {
    if (open && masterSurgeries) {
      const activeMasterSurgeries = masterSurgeries.filter(p => p.status === 1);

      const formSurgeries = activeMasterSurgeries.map(masterItem => {
        const existing = initialData.find(p => p.surgery_id === masterItem.surgery_id);
        if (existing) {
          return {
            id: existing.id,
            surgeryId: masterItem.surgery_id,
            surgeryName: masterItem.surgeryName,
            selected: true,
            month: existing.month ? String(existing.month) : null,
            year: existing.year ? String(existing.year) : null,
            comments: existing.comments || "",
          };
        }
        return {
          surgeryId: masterItem.surgery_id,
          surgeryName: masterItem.surgeryName,
          selected: false,
          month: null,
          year: null,
          comments: "",
        };
      });

      initialData.forEach(existing => {
        if (!activeMasterSurgeries.find(m => m.surgery_id === existing.surgery_id)) {
          formSurgeries.push({
            id: existing.id,
            surgeryId: existing.surgery_id,
            surgeryName: existing.surgery?.surgeryName || 'Unknown Surgery',
            selected: true,
            month: existing.month ? String(existing.month) : null,
            year: existing.year ? String(existing.year) : null,
            comments: existing.comments || "",
          });
        }
      });

      formSurgeries.sort((a, b) => a.surgeryName.localeCompare(b.surgeryName));

      form.reset({ surgeries: formSurgeries });
    }
  }, [open, masterSurgeries, initialData, form]);

  const handleSubmit = (values: PatientSurgeryFormValues) => {
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-2xl p-0 flex flex-col h-full bg-background border-l"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-6 py-4 border-b bg-muted/20 shrink-0 flex flex-row items-center justify-between space-y-0">
          <SheetTitle>Manage Surgical History</SheetTitle>
          <Button
            type="button"
            className="bg-primary-gradient hover:opacity-90 shadow-sm mr-4"
            size="sm"
            onClick={() => setIsMasterFormOpen(true)}
          >
            Add Master Surgery
          </Button>
        </SheetHeader>

        {isMasterLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 overflow-hidden bg-muted/20"
            >
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3 max-w-3xl mx-auto w-full">
                  {fields.length === 0 && (
                    <div className="text-center py-10 px-4 text-muted-foreground border-2 border-dashed rounded-lg bg-card/50 mt-4 flex flex-col items-center justify-center gap-4">
                      <p>No surgery procedures available in master list.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsMasterFormOpen(true);
                        }}
                      >
                        Add Master Surgery
                      </Button>
                    </div>
                  )}

                  {fields.map((field, index) => {
                    const isSelected = form.watch(`surgeries.${index}.selected`);

                    return (
                      <div key={field.id} className={`bg-card p-3 rounded-lg border shadow-sm relative transition-all ${isSelected ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <FormField
                            control={form.control}
                            name={`surgeries.${index}.selected`}
                            render={({ field: selectedField }) => (
                              <FormItem className="flex items-center gap-3 w-full sm:w-1/3 min-w-[200px] shrink-0 m-0">
                                <FormControl>
                                  <Checkbox
                                    checked={selectedField.value}
                                    onCheckedChange={selectedField.onChange}
                                    className="h-5 w-5 data-[state=checked]:bg-primary"
                                  />
                                </FormControl>
                                <div className="flex items-center gap-2">
                                  <div className={`flex-shrink-0 h-6 w-6 rounded-md flex items-center justify-center ${isSelected ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                                    <Scissors className="h-3 w-3" />
                                  </div>
                                  <h3 className={`font-medium text-sm truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} title={field.surgeryName}>
                                    {field.surgeryName}
                                  </h3>
                                </div>
                              </FormItem>
                            )}
                          />

                          <div className={`flex-1 w-full flex flex-col sm:flex-row gap-2 transition-opacity duration-200 ${!isSelected ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                            <FormField
                              control={form.control}
                              name={`surgeries.${index}.month`}
                              render={({ field: monthField }) => (
                                <FormItem className="w-full sm:w-20 shrink-0 m-0">
                                  <FormControl>
                                    <Select
                                      value={monthField.value || undefined}
                                      onValueChange={monthField.onChange}
                                    >
                                      <SelectTrigger className="h-9 bg-background">
                                        <SelectValue placeholder="MM" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {MONTH_OPTIONS.map((opt) => (
                                          <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                          </SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  </FormControl>
                                  <FormMessage className="text-[10px]" />
                                </FormItem>
                              )}
                            />
                            <div className="w-full sm:w-24 shrink-0 m-0">
                              <FormSearchSelect
                                control={form.control}
                                name={`surgeries.${index}.year`}
                                label=""
                                placeholder="Year"
                                options={YEAR_OPTIONS}
                                className="w-full m-0"
                                buttonClassName="h-9 bg-background"
                              />
                            </div>
                            <div className="flex-1 m-0">
                              <FormFloatingInput
                                control={form.control}
                                name={`surgeries.${index}.comments`}
                                label="Notes (opt)..."
                                className="m-0"
                                inputClassName="h-9 bg-background"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {form.formState.errors.surgeries?.message && (
                    <p className="text-sm font-medium text-destructive px-1">
                      {form.formState.errors.surgeries.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3 px-5 py-3 border-t bg-background shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary-gradient hover:opacity-90"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Surgical History
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>

      <SurgeryFormSheet
        open={isMasterFormOpen}
        onOpenChange={setIsMasterFormOpen}
        onSubmit={(values) => {
          createMasterMutation.mutate(
            {
              surgeryName: values.surgeryName,
              notes: values.notes,
              status: values.status ? 1 : 0,
            },
            {
              onSuccess: () => {
                setIsMasterFormOpen(false);
              },
            }
          );
        }}
        isLoading={createMasterMutation.isPending}
      />
    </Sheet>
  );
}
