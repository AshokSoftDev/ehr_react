import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormSwitch } from "@/components/ui/form-switch";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Loader2 } from "lucide-react";
import type { AllergyItem } from "../types/allergy.types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";

const schema = z.object({
  allergyName: z.string().min(1, "Allergy name is required"),
  allergyType: z.string().min(1, "Allergy type is required"),
  status: z.boolean().optional(),
});

type AllergyFormInput = z.input<typeof schema>;
export type AllergyFormValues = z.output<typeof schema>;

interface AllergyFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AllergyFormValues) => void;
  initial?: Partial<AllergyItem>;
  isLoading?: boolean;
}

const allergyTypes = [
  { label: "Drug", value: "Drug" },
  { label: "Food", value: "Food" },
  { label: "Environmental", value: "Environmental" },
  { label: "Insect", value: "Insect" },
  { label: "Other", value: "Other" }
];

export function AllergyFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initial,
  isLoading,
}: AllergyFormSheetProps) {
  const form = useForm<AllergyFormInput, unknown, AllergyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      allergyName: initial?.allergyName ?? "",
      allergyType: initial?.allergyType ?? "Drug",
      status: initial?.status !== undefined ? initial?.status === 1 : true,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        allergyName: initial?.allergyName ?? "",
        allergyType: initial?.allergyType ?? "Drug",
        status: initial?.status !== undefined ? initial?.status === 1 : true,
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
            {initial?.allergy_id ? "Edit Allergy" : "Add Allergy"}
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
                  name="allergyName"
                  label="Allergy Name *"
                />
                
                <FormFloatingSelect
                  control={form.control}
                  name="allergyType"
                  label="Allergy Type *"
                  options={allergyTypes}
                />
                
                <FormSwitch
                  control={form.control}
                  name="status"
                  label="Active"
                  description="Toggle to deactivate/activate this allergy"
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
                {initial?.allergy_id ? 'Update Allergy' : 'Add Allergy'}
              </Button>
            </div>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

export default AllergyFormSheet;
