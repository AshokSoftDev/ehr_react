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
import { Loader2, Trash2, ShieldAlert } from "lucide-react";
import type { PatientAllergyItem, SyncPatientAllergyPayload } from "@/features/patients/types/patientAllergy.types";
import { FormSearchSelectWithCreate } from "@/components/form/FormSearchSelectWithCreate";
import { useAllergies, useCreateAllergy } from "@/features/allergy/hooks/useAllergies";
import { AllergyFormSheet } from "@/features/allergy/components/AllergyFormSheet";
import { Textarea } from "@/components/ui/textarea";

const schema = z.object({
  searchAllergyId: z.string().optional().nullable(),
  allergies: z.array(z.object({
    id: z.number().optional(),
    allergyId: z.string().optional().nullable(),
    allergyName: z.string().min(1, "Allergy name is required"),
    notes: z.string().optional(),
  })), // Can be empty if all allergies removed
});

type PatientAllergyFormInput = z.input<typeof schema>;
export type PatientAllergyFormValues = z.output<typeof schema>;

interface PatientAllergyFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SyncPatientAllergyPayload[]) => void;
  initialAllergies?: PatientAllergyItem[];
  isLoading?: boolean;
}

export function PatientAllergyFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initialAllergies = [],
  isLoading,
}: PatientAllergyFormSheetProps) {
  const { data: allergyMasterList = [] } = useAllergies();
  const activeAllergies = allergyMasterList.filter(a => a.status === 1);
  const [masterFormOpen, setMasterFormOpen] = useState(false);
  const createMasterMutation = useCreateAllergy();

  const form = useForm<PatientAllergyFormInput, unknown, PatientAllergyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      searchAllergyId: null,
      allergies: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allergies",
  });

  const selectedSearchId = form.watch("searchAllergyId");

  useEffect(() => {
    if (selectedSearchId) {
      const selected = activeAllergies.find(a => String(a.allergy_id) === selectedSearchId);
      if (selected) {
        const currentAllergies = form.getValues("allergies");
        if (!currentAllergies.find(f => f.allergyId === String(selected.allergy_id))) {
          append({
            allergyId: String(selected.allergy_id),
            allergyName: selected.allergyName,
            notes: ""
          });
        }
      }
      setTimeout(() => form.setValue("searchAllergyId", null), 0);
    }
  }, [selectedSearchId, activeAllergies, append, form]);

  useEffect(() => {
    if (open) {
      form.reset({
        searchAllergyId: null,
        allergies: initialAllergies.map(a => ({
          id: a.id,
          allergyId: a.allergy_id ? String(a.allergy_id) : null,
          allergyName: a.allergyName,
          notes: a.notes ?? "",
        })),
      });
    }
  }, [open, initialAllergies, form]);

  const allergyOptions = activeAllergies.map(a => ({
    label: `${a.allergyName} (${a.allergyType})`,
    value: String(a.allergy_id)
  }));

  const handleSubmit = (values: PatientAllergyFormValues) => {
    const payloads: SyncPatientAllergyPayload[] = values.allergies.map(a => ({
      id: a.id,
      allergyName: a.allergyName,
      allergyId: a.allergyId === "none" || !a.allergyId ? undefined : Number(a.allergyId),
      notes: a.notes,
    }));
    onSubmit(payloads);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          preventClose
          className="w-full sm:max-w-3xl p-0 flex flex-col h-full"
        >
          <SheetHeader className="px-4 border-b shrink-0 py-4">
            <SheetTitle>
              Manage Patient Allergies
            </SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="flex flex-col flex-1 overflow-hidden bg-muted/20"
            >
              <div className="p-4 border-b bg-background shrink-0 z-10 relative">
                <div className="max-w-xl mx-auto space-y-3 w-full">
                  <h4 className="font-medium text-sm text-foreground">Add Allergy from Master List</h4>
                  <FormSearchSelectWithCreate
                    control={form.control}
                    name="searchAllergyId"
                    label="Search Allergies"
                    options={allergyOptions}
                    placeholder="Type to search allergies..."
                    emptyText="No matching allergies found"
                    createButtonText="Create New Master Allergy"
                    onCreateClick={() => setMasterFormOpen(true)}
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="p-4 space-y-3 max-w-3xl mx-auto w-full">
                  {fields.length > 0 && (
                    <h4 className="font-medium text-sm text-foreground px-1 pb-1">Patient Allergies ({fields.length})</h4>
                  )}

                  {fields.length === 0 && (
                    <div className="text-center py-10 text-muted-foreground border-2 border-dashed rounded-lg bg-card/50 mt-4">
                      No allergies added yet. <br /> Search above to add an allergy.
                    </div>
                  )}

                  {fields.map((field, index) => (
                    <div key={field.id} className="bg-card p-3 rounded-lg border shadow-sm relative group flex flex-col sm:flex-row gap-3 items-start">
                      <div className="w-full sm:w-1/3 flex items-center gap-2 bg-red-50/50 p-2.5 rounded-md border border-red-100 shrink-0">
                        <div className="flex-shrink-0 h-6 w-6 rounded-md bg-red-100 flex items-center justify-center">
                          <ShieldAlert className="h-3 w-3 text-red-600" />
                        </div>
                        <h3 className="font-medium text-sm text-foreground truncate" title={field.allergyName}>
                          {field.allergyName}
                        </h3>
                      </div>

                      <div className="flex-1 w-full relative">
                        <FormField
                          control={form.control}
                          name={`allergies.${index}.notes`}
                          render={({ field: notesField }) => (
                            <FormItem>
                              <FormControl>
                                <Textarea
                                  placeholder="Add notes about this allergy (e.g., severity, reactions)..."
                                  className="resize-none min-h-[44px] h-[44px] py-2.5 pr-10 bg-background"
                                  {...notesField}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute top-[2px] right-[2px] h-10 w-10 text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors rounded-md"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {form.formState.errors.allergies?.message && (
                    <p className="text-sm font-medium text-destructive px-1">
                      {form.formState.errors.allergies.message}
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
                  Save Allergies
                </Button>
              </div>
            </form>
          </Form>
        </SheetContent>
      </Sheet>

      <AllergyFormSheet
        open={masterFormOpen}
        onOpenChange={setMasterFormOpen}
        onSubmit={(values) => {
          createMasterMutation.mutate(values, {
            onSuccess: (newAllergy) => {
              setMasterFormOpen(false);
              append({
                allergyId: String(newAllergy.allergy_id),
                allergyName: newAllergy.allergyName,
                notes: ""
              });
            }
          });
        }}
        isLoading={createMasterMutation.isPending}
      />
    </>
  );
}

export default PatientAllergyFormSheet;

