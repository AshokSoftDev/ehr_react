import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Pill, Save, Search, X } from "lucide-react";
import type { Prescription, CreatePrescriptionPayload } from "@/features/visits/types/prescription.types";
import type { Drug } from "@/features/visits/types/drug.types";
import { useDrugSearch } from "@/features/visits/hooks/useDrugs";

const schema = z.object({
  drug_name: z.string().min(1, "Drug name is required"),
  drug_generic: z.string().optional(),
  drug_type: z.string().optional(),
  drug_dosage: z.string().optional(),
  drug_measure: z.string().optional(),
  instruction: z.string().optional(),
  duration: z.coerce.number().positive().optional().or(z.literal("")),
  duration_type: z.string().optional(),
  quantity: z.coerce.number().positive().optional().or(z.literal("")),
  morning_bf: z.boolean().default(false),
  morning_af: z.boolean().default(false),
  noon_bf: z.boolean().default(false),
  noon_af: z.boolean().default(false),
  evening_bf: z.boolean().default(false),
  evening_af: z.boolean().default(false),
  night_bf: z.boolean().default(false),
  night_af: z.boolean().default(false),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface PrescriptionFormProps {
  initialData?: Prescription | null;
  onSubmit: (data: CreatePrescriptionPayload) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export function PrescriptionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}: PrescriptionFormProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: drugs = [], isLoading: drugsLoading } = useDrugSearch(searchQuery);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      drug_name: initialData?.drug_name || "",
      drug_generic: initialData?.drug_generic || "",
      drug_type: initialData?.drug_type || "",
      drug_dosage: initialData?.drug_dosage || "",
      drug_measure: initialData?.drug_measure || "",
      instruction: initialData?.instruction || "",
      duration: initialData?.duration || "",
      duration_type: initialData?.duration_type || "",
      quantity: initialData?.quantity || "",
      morning_bf: initialData?.morning_bf || false,
      morning_af: initialData?.morning_af || false,
      noon_bf: initialData?.noon_bf || false,
      noon_af: initialData?.noon_af || false,
      evening_bf: initialData?.evening_bf || false,
      evening_af: initialData?.evening_af || false,
      night_bf: initialData?.night_bf || false,
      night_af: initialData?.night_af || false,
      notes: initialData?.notes || "",
    },
  });

  const handleDrugSelect = (drug: Drug) => {
    setValue("drug_name", drug.drug_name);
    setValue("drug_generic", drug.drug_generic || "");
    setValue("drug_type", drug.drug_type || "");
    setValue("drug_dosage", drug.drug_dosage || "");
    setValue("drug_measure", drug.drug_measure || "");
    setValue("instruction", drug.instruction || "");
    setSearchOpen(false);
    setSearchQuery("");
  };

  const handleFormSubmit = (data: FormData) => {
    const payload: CreatePrescriptionPayload = {
      drug_name: data.drug_name,
      drug_generic: data.drug_generic || undefined,
      drug_type: data.drug_type || undefined,
      drug_dosage: data.drug_dosage || undefined,
      drug_measure: data.drug_measure || undefined,
      instruction: data.instruction || undefined,
      duration: typeof data.duration === "number" ? data.duration : undefined,
      duration_type: data.duration_type || undefined,
      quantity: typeof data.quantity === "number" ? data.quantity : undefined,
      morning_bf: data.morning_bf,
      morning_af: data.morning_af,
      noon_bf: data.noon_bf,
      noon_af: data.noon_af,
      evening_bf: data.evening_bf,
      evening_af: data.evening_af,
      night_bf: data.night_bf,
      night_af: data.night_af,
      notes: data.notes || undefined,
    };
    onSubmit(payload);
  };

  const scheduleFields = [
    { label: "Morning", bf: "morning_bf", af: "morning_af" },
    { label: "Noon", bf: "noon_bf", af: "noon_af" },
    { label: "Evening", bf: "evening_bf", af: "evening_af" },
    { label: "Night", bf: "night_bf", af: "night_af" },
  ] as const;

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Drug Search Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2 flex items-center gap-2">
          <Search className="h-4 w-4 text-primary" />
          Drug Search
        </h4>
        <div className="rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 p-4">
          <Popover open={searchOpen} onOpenChange={setSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-left font-normal h-11 bg-background"
              >
                <Search className="mr-2 h-4 w-4 text-muted-foreground" />
                {watch("drug_name") || "Search for a drug..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Type drug name to search..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {drugsLoading && searchQuery.length >= 2 && (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  )}
                  {!drugsLoading && searchQuery.length >= 2 && drugs.length === 0 && (
                    <CommandEmpty>
                      <div className="py-4 text-center">
                        <Pill className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                        <p className="text-sm text-muted-foreground">No drugs found</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          You can still enter drug details manually below
                        </p>
                      </div>
                    </CommandEmpty>
                  )}
                  {searchQuery.length < 2 && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      Type at least 2 characters to search
                    </div>
                  )}
                  {drugs.length > 0 && (
                    <CommandGroup heading="Drugs">
                      {drugs.map((drug) => (
                        <CommandItem
                          key={drug.drug_id}
                          value={String(drug.drug_id)}
                          onSelect={() => handleDrugSelect(drug)}
                          className="flex items-start gap-3 py-3 cursor-pointer"
                        >
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 mt-0.5">
                            <Pill className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground">{drug.drug_name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                              {drug.drug_generic && <span>{drug.drug_generic}</span>}
                              {drug.drug_type && (
                                <>
                                  <span>•</span>
                                  <span>{drug.drug_type}</span>
                                </>
                              )}
                              {drug.drug_dosage && (
                                <>
                                  <span>•</span>
                                  <span>{drug.drug_dosage}{drug.drug_measure}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-xs text-muted-foreground mt-2">
            Search and select a drug to auto-fill details, or enter manually below
          </p>
        </div>
      </div>

      {/* Drug Info Section */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Drug Information</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="drug_name">Drug Name *</Label>
            <Input
              id="drug_name"
              {...register("drug_name")}
              placeholder="e.g., Paracetamol"
              className={errors.drug_name ? "border-destructive" : ""}
            />
            {errors.drug_name && (
              <p className="text-xs text-destructive">{errors.drug_name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="drug_generic">Generic Name</Label>
            <Input
              id="drug_generic"
              {...register("drug_generic")}
              placeholder="e.g., Acetaminophen"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="drug_type">Type</Label>
            <Input
              id="drug_type"
              {...register("drug_type")}
              placeholder="e.g., Tablet, Syrup"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="drug_dosage">Dosage</Label>
            <div className="flex gap-2">
              <Input
                id="drug_dosage"
                {...register("drug_dosage")}
                placeholder="e.g., 500"
                className="flex-1"
              />
              <Input
                {...register("drug_measure")}
                placeholder="mg"
                className="w-20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dosage Schedule */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Dosage Schedule</h4>
        <div className="rounded-xl border bg-gradient-to-br from-muted/50 to-muted/20 p-4">
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-medium text-muted-foreground mb-3">
            <div></div>
            <div className="py-1.5 px-2 rounded-md bg-amber-500/10 text-amber-600">Before Food</div>
            <div className="py-1.5 px-2 rounded-md bg-green-500/10 text-green-600">After Food</div>
          </div>
          {scheduleFields.map(({ label, bf, af }) => (
            <div key={label} className="grid grid-cols-3 gap-2 items-center py-3 border-t border-border/50">
              <div className="text-sm font-medium flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary/60"></span>
                {label}
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={watch(bf)}
                  onCheckedChange={(checked) => setValue(bf, checked === true)}
                  className="h-5 w-5"
                />
              </div>
              <div className="flex justify-center">
                <Checkbox
                  checked={watch(af)}
                  onCheckedChange={(checked) => setValue(af, checked === true)}
                  className="h-5 w-5"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Duration & Quantity */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Duration & Quantity</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="duration">Duration</Label>
            <div className="flex gap-2">
              <Input
                id="duration"
                type="number"
                min="1"
                {...register("duration")}
                placeholder="e.g., 7"
                className="flex-1"
              />
              <Input
                {...register("duration_type")}
                placeholder="days"
                className="w-20"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              {...register("quantity")}
              placeholder="e.g., 14"
            />
          </div>
        </div>
      </div>

      {/* Instructions & Notes */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground border-b pb-2">Instructions</h4>
        <div className="space-y-1.5">
          <Label htmlFor="instruction">Instructions</Label>
          <Input
            id="instruction"
            {...register("instruction")}
            placeholder="e.g., Take with water"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            {...register("notes")}
            placeholder="Additional notes..."
            rows={2}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-1" />
          )}
          {initialData ? "Update Prescription" : "Save Prescription"}
        </Button>
      </div>
    </form>
  );
}

export default PrescriptionForm;
