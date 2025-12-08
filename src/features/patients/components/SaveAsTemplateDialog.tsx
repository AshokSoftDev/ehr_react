import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save } from "lucide-react";
import type { Prescription, CreatePrescriptionTemplatePayload } from "@/features/visits/types/prescription.types";
import { useCreatePrescriptionTemplate } from "@/features/visits/hooks/usePrescriptionTemplates";

interface SaveAsTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPrescriptions: Prescription[];
  onSuccess?: () => void;
}

export function SaveAsTemplateDialog({
  open,
  onOpenChange,
  selectedPrescriptions,
  onSuccess,
}: SaveAsTemplateDialogProps) {
  const [templateName, setTemplateName] = useState("");
  const createTemplate = useCreatePrescriptionTemplate();

  const handleSave = async () => {
    if (!templateName.trim()) return;
    if (selectedPrescriptions.length === 0) return;

    // Generate a unique template_id based on timestamp
    const templateId = Date.now();

    // Save each selected prescription as a template item
    for (const prescription of selectedPrescriptions) {
      const payload: CreatePrescriptionTemplatePayload = {
        template_id: templateId,
        template_name: templateName.trim(),
        drug_id: prescription.drug_id || undefined,
        drug_name: prescription.drug_name,
        drug_generic: prescription.drug_generic || undefined,
        drug_type: prescription.drug_type || undefined,
        drug_dosage: prescription.drug_dosage || undefined,
        drug_measure: prescription.drug_measure || undefined,
        instruction: prescription.instruction || undefined,
        duration: prescription.duration || undefined,
        duration_type: prescription.duration_type || undefined,
        quantity: prescription.quantity || undefined,
        morning_bf: prescription.morning_bf,
        morning_af: prescription.morning_af,
        noon_bf: prescription.noon_bf,
        noon_af: prescription.noon_af,
        evening_bf: prescription.evening_bf,
        evening_af: prescription.evening_af,
        night_bf: prescription.night_bf,
        night_af: prescription.night_af,
        notes: prescription.notes || undefined,
      };
      await createTemplate.mutateAsync(payload);
    }

    setTemplateName("");
    onOpenChange(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save as Template</DialogTitle>
          <DialogDescription>
            Save {selectedPrescriptions.length} selected prescription
            {selectedPrescriptions.length > 1 ? "s" : ""} as a reusable template.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="template-name">Template Name</Label>
            <Input
              id="template-name"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="e.g., Post-Surgery Pain Relief"
            />
          </div>

          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Prescriptions to include:
            </p>
            <div className="space-y-1">
              {selectedPrescriptions.map((p) => (
                <div
                  key={p.prescription_id}
                  className="text-sm text-foreground flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {p.drug_name}
                  {p.drug_dosage && ` - ${p.drug_dosage}${p.drug_measure || ""}`}
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!templateName.trim() || createTemplate.isPending}
          >
            {createTemplate.isPending ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1" />
            )}
            Save Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SaveAsTemplateDialog;
