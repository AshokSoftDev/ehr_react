import { useEffect, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import type { PatientAllergyItem } from "@/features/patients/types/patientAllergy.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormSearchSelectWithCreate } from "@/components/form/FormSearchSelectWithCreate";
import { useAllergies, useCreateAllergy } from "@/features/allergy/hooks/useAllergies";
import { AllergyFormSheet } from "@/features/allergy/components/AllergyFormSheet";

const schema = z.object({
  allergyId: z.string().optional().nullable(),
  allergyName: z.string().min(1, "Allergy name is required"),
});

type PatientAllergyFormInput = z.input<typeof schema>;
export type PatientAllergyFormValues = z.output<typeof schema>;

interface PatientAllergyFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: PatientAllergyFormValues) => void;
  initial?: Partial<PatientAllergyItem>;
  isLoading?: boolean;
}

export function PatientAllergyFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initial,
  isLoading,
}: PatientAllergyFormSheetProps) {
  const { data: allergyMasterList = [] } = useAllergies();
  const activeAllergies = allergyMasterList.filter(a => a.status === 1);
  const [masterFormOpen, setMasterFormOpen] = useState(false);
  const createMasterMutation = useCreateAllergy();

  const form = useForm<PatientAllergyFormInput, unknown, PatientAllergyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      allergyId: initial?.allergy_id ? String(initial.allergy_id) : null,
      allergyName: initial?.allergyName ?? "",
    },
  });

  const selectedAllergyId = form.watch("allergyId");

  useEffect(() => {
    if (selectedAllergyId) {
      const selected = activeAllergies.find(a => String(a.allergy_id) === selectedAllergyId);
      if (selected && !form.getValues("allergyName")) {
        form.setValue("allergyName", selected.allergyName);
      }
    }
  }, [selectedAllergyId, activeAllergies, form]);

  useEffect(() => {
    if (open) {
      form.reset({
        allergyId: initial?.allergy_id ? String(initial.allergy_id) : null,
        allergyName: initial?.allergyName ?? "",
      });
    }
  }, [open, initial, form]);

  const allergyOptions = [
    { label: "None (Custom Allergy)", value: "none" },
    ...activeAllergies.map(a => ({
      label: `${a.allergyName} (${a.allergyType})`,
      value: String(a.allergy_id)
    }))
  ];

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent 
          side="right" 
          preventClose 
          className="w-full sm:max-w-md p-0 flex flex-col h-full"
        >
          <SheetHeader className="px-4 border-b shrink-0 py-4">
            <SheetTitle>
              {initial?.id ? "Edit Patient Allergy" : "Add Patient Allergy"}
            </SheetTitle>
          </SheetHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(values => onSubmit(values))}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <ScrollArea className="flex-1">
                <div className="p-4 space-y-4">
                  <FormSearchSelectWithCreate
                    control={form.control}
                    name="allergyId"
                    label="Search from Master List (Optional)"
                    options={allergyOptions}
                    placeholder="Search allergies..."
                    emptyText="No matching allergies found"
                    createButtonText="Create New Master Allergy"
                    onCreateClick={() => setMasterFormOpen(true)}
                  />

                  <FormFloatingInput
                    control={form.control}
                    name="allergyName"
                    label="Allergy Name (Custom or Auto-filled) *"
                  />
                </div>
              </ScrollArea>

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
                  {initial?.id ? 'Update Allergy' : 'Add Allergy'}
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
              form.setValue("allergyId", String(newAllergy.allergy_id));
              form.setValue("allergyName", newAllergy.allergyName);
            }
          });
        }}
        isLoading={createMasterMutation.isPending}
      />
    </>
  );
}

export default PatientAllergyFormSheet;
