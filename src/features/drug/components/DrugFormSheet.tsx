import { useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormSwitch } from "@/components/ui/form-switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SheetForm } from "@/components/ui/sheet-form";
import type { DrugItem } from "../types/drug.types";
import { FormFloatingSelect } from "@/components/form/FormFloatingSelect";

const schema = z.object({
  drug_generic: z.string().min(1, "Generic name is required"),
  drug_name: z.string().min(1, "Drug name is required"),
  drug_type: z.string().min(1, "Type is required"),
  drug_dosage: z.string().min(1, "Dosage is required"),
  drug_measure: z.enum(["mg", "g", "mcg", "ml", "l", "capsule", "tablet"]),
  amount: z.coerce.number().min(0.01, "Amount must be at least 0.01"),
  instruction: z.string().optional(),
  status: z.boolean().optional(),
});

type DrugFormInput = z.input<typeof schema>;
export type DrugFormValues = z.output<typeof schema>;

interface DrugFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: DrugFormValues) => void;
  initial?: Partial<DrugItem>;
}

export function DrugFormSheet({
  open,
  onOpenChange,
  onSubmit,
  initial,
}: DrugFormSheetProps) {
  const form = useForm<DrugFormInput, unknown, DrugFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      drug_generic: initial?.drug_generic ?? "",
      drug_name: initial?.drug_name ?? "",
      drug_type: initial?.drug_type ?? "",
      drug_dosage: initial?.drug_dosage ?? "",
      drug_measure: (initial?.drug_measure as "mg" | "g" | "mcg" | "ml" | "l" | "capsule" | "tablet") ?? "mg",
      amount: initial?.amount ?? 1,
      instruction: initial?.instruction ?? "",
      status: initial?.status === 1,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        drug_generic: initial?.drug_generic ?? "",
        drug_name: initial?.drug_name ?? "",
        drug_type: initial?.drug_type ?? "",
        drug_dosage: initial?.drug_dosage ?? "",
        drug_measure: (initial?.drug_measure as "mg" | "g" | "mcg" | "ml" | "l" | "capsule" | "tablet") ?? "mg",
        amount: initial?.amount ?? 1,
        instruction: initial?.instruction ?? "",
        status: initial?.status === 1,
      });
    }
  }, [open, initial, form]);

  return (
    <SheetForm
      open={open}
      onOpenChange={onOpenChange}
      title={initial?.drug_id ? "Edit Drug" : "Add Drug"}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-2">
          <div className="grid gap-3 md:grid-cols-2">
            <FormFloatingInput
              control={form.control}
              name="drug_generic"
              label="Generic Name"
            />
            <FormFloatingInput
              control={form.control}
              name="drug_name"
              label="Brand Name"
            />
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <FormFloatingInput
              control={form.control}
              name="drug_type"
              label="Type"
            />
            <FormFloatingInput
              control={form.control}
              name="drug_dosage"
              label="Dosage"
              type="number"
              inputMode="decimal"
            />
            <FormFloatingSelect
              control={form.control}
              name="drug_measure"
              label="Measure"
              options={[
                { label: "mg", value: "mg" },
                { label: "g", value: "g" },
                { label: "mcg", value: "mcg" },
                { label: "ml", value: "ml" },
                { label: "l", value: "l" },
                { label: "Capsule", value: "capsule" },
                { label: "Tablet", value: "tablet" },
              ]}
            />
            <FormFloatingInput
              control={form.control}
              name="amount"
              label="Amount"
              type="number"
              inputMode="numeric"
            />
          </div>
          <FormFloatingInput
            control={form.control}
            name="instruction"
            label="Instruction"
          />
          <FormSwitch
            control={form.control}
            name="status"
            label="Active"
            description="Toggle to deactivate/activate this drug"
          />
          <Separator />
          <div className="sticky bottom-0 flex items-center justify-end gap-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-3 -mx-2 -mb-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </Form>
    </SheetForm>
  );
}

export default DrugFormSheet;
