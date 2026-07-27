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
import { Loader2, HeartPulse } from "lucide-react";
import type { PatientPmhItem } from "@/features/patients/types/patientPmh.types";
import { usePmh, useCreatePmh } from "@/features/pmh/hooks/usePmh";
import { PmhFormSheet } from "@/features/pmh/components/PmhFormSheet";
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
  pmhs: z.array(z.object({
    id: z.number().optional(),
    pmhId: z.number(),
    conditionName: z.string(),
    selected: z.boolean(),
    month: z.string().nullable().optional(),
    year: z.string().nullable().optional(),
    comments: z.string().nullable().optional(),
  })),
});

export type PatientPmhFormValues = z.output<typeof schema>;

interface PatientPmhFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PatientPmhFormValues) => void;
  initialData: PatientPmhItem[];
  isLoading?: boolean;
}

export function PatientPmhFormSheet({ open, onOpenChange, onSubmit, initialData, isLoading }: PatientPmhFormSheetProps) {
  const [isMasterFormOpen, setIsMasterFormOpen] = useState(false);
  const { data: masterPmhs, isLoading: isMasterLoading } = usePmh();
  const createMasterMutation = useCreatePmh();

  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      pmhs: [],
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "pmhs",
  });

  useEffect(() => {
    if (open && masterPmhs) {
      // Map all master PMHs to form fields
      // If patient already has it, mark selected and populate details
      const activeMasterPmhs = masterPmhs.filter(p => p.status === 1);

      const formPmhs = activeMasterPmhs.map(masterPmh => {
        const existing = initialData.find(p => p.pmh_id === masterPmh.pmh_id);
        if (existing) {
          return {
            id: existing.id,
            pmhId: masterPmh.pmh_id,
            conditionName: masterPmh.conditionName,
            selected: true,
            month: existing.month ? String(existing.month) : null,
            year: existing.year ? String(existing.year) : null,
            comments: existing.comments || "",
          };
        }
        return {
          pmhId: masterPmh.pmh_id,
          conditionName: masterPmh.conditionName,
          selected: false,
          month: null,
          year: null,
          comments: "",
        };
      });

      // Also add any legacy PMHs that the patient has but are now inactive in master
      initialData.forEach(existing => {
        if (!activeMasterPmhs.find(m => m.pmh_id === existing.pmh_id)) {
          formPmhs.push({
            id: existing.id,
            pmhId: existing.pmh_id,
            conditionName: existing.pmh?.conditionName || 'Unknown Condition',
            selected: true,
            month: existing.month ? String(existing.month) : null,
            year: existing.year ? String(existing.year) : null,
            comments: existing.comments || "",
          });
        }
      });

      // Sort alphabetically
      formPmhs.sort((a, b) => a.conditionName.localeCompare(b.conditionName));

      form.reset({ pmhs: formPmhs });
    }
  }, [open, masterPmhs, initialData, form]);

  const handleSubmit = (values: PatientPmhFormValues) => {
    onSubmit(values);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-full sm:max-w-2xl p-0 flex flex-col h-full bg-background border-l"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <SheetHeader className="px-6 py-4 border-b bg-muted/20 shrink-0 flex flex-row items-center justify-between space-y-0">
          <SheetTitle>Manage Past Medical History</SheetTitle>
          <Button
            type="button"
            className="bg-primary-gradient hover:opacity-90 shadow-sm mr-4"
            size="sm"
            onClick={() => setIsMasterFormOpen(true)}
          >
            Add Master PMH Data
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
                      <p>No PMH conditions available in master list.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsMasterFormOpen(true);
                        }}
                      >
                        Add Master PMH Data
                      </Button>
                    </div>
                  )}

                  {fields.map((field, index) => {
                    const isSelected = form.watch(`pmhs.${index}.selected`);

                    return (
                      <div key={field.id} className={`bg-card p-3 rounded-lg border shadow-sm relative transition-all ${isSelected ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <FormField
                            control={form.control}
                            name={`pmhs.${index}.selected`}
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
                                    <HeartPulse className="h-3 w-3" />
                                  </div>
                                  <h3 className={`font-medium text-sm truncate ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`} title={field.conditionName}>
                                    {field.conditionName}
                                  </h3>
                                </div>
                              </FormItem>
                            )}
                          />

                          <div className={`flex-1 w-full flex flex-col sm:flex-row gap-2 transition-opacity duration-200 ${!isSelected ? 'opacity-50 pointer-events-none select-none' : ''}`}>
                              <FormField
                                control={form.control}
                                name={`pmhs.${index}.month`}
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
                              <FormSearchSelect
                                control={form.control}
                                name={`pmhs.${index}.year`}
                                label=""
                                placeholder="Year"
                                options={YEAR_OPTIONS}
                                className="w-full sm:w-24 shrink-0 m-0"
                                buttonClassName="h-9 bg-background"
                              />
                              <div className="flex-1 m-0">
                                <FormFloatingInput
                                  control={form.control}
                                  name={`pmhs.${index}.comments`}
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

                  {form.formState.errors.pmhs?.message && (
                    <p className="text-sm font-medium text-destructive px-1">
                      {form.formState.errors.pmhs.message}
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
                  Save PMH
                </Button>
              </div>
            </form>
          </Form>
        )}
      </SheetContent>

      <PmhFormSheet
        open={isMasterFormOpen}
        onOpenChange={setIsMasterFormOpen}
        onSubmit={(values) => {
          createMasterMutation.mutate(
            {
              conditionName: values.conditionName,
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
