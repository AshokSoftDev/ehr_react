import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit3, Loader2, Pill, Trash2 } from "lucide-react";
import type { Prescription } from "@/features/visits/types/prescription.types";

interface PrescriptionCardProps {
  prescription: Prescription;
  onEdit?: (prescription: Prescription) => void;
  onDelete?: (prescriptionId: number) => void;
  isDeleting?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onSelectChange?: (selected: boolean) => void;
}

const formatDosage = (p: Prescription) => {
  const times: string[] = [];
  if (p.morning_bf) times.push("Morning (BF)");
  if (p.morning_af) times.push("Morning (AF)");
  if (p.noon_bf) times.push("Noon (BF)");
  if (p.noon_af) times.push("Noon (AF)");
  if (p.evening_bf) times.push("Evening (BF)");
  if (p.evening_af) times.push("Evening (AF)");
  if (p.night_bf) times.push("Night (BF)");
  if (p.night_af) times.push("Night (AF)");
  return times.length > 0 ? times.join(", ") : "No schedule";
};

export function PrescriptionCard({
  prescription,
  onEdit,
  onDelete,
  isDeleting,
  selectable,
  selected,
  onSelectChange,
}: PrescriptionCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500/60 via-teal-500/60 to-emerald-500/60 opacity-70" />
      
      <div className="flex items-start gap-3">
        {selectable && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelectChange?.(checked === true)}
            className="mt-1"
          />
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Pill className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-foreground">{prescription.drug_name}</span>
            </div>
            {prescription.drug_generic && (
              <span className="text-xs text-muted-foreground">({prescription.drug_generic})</span>
            )}
            {prescription.drug_type && (
              <Badge variant="outline" className="text-[10px]">
                {prescription.drug_type}
              </Badge>
            )}
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
            {prescription.drug_dosage && (
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">Dosage:</span> {prescription.drug_dosage}
                {prescription.drug_measure && ` ${prescription.drug_measure}`}
              </div>
            )}
            {prescription.duration && (
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">Duration:</span> {prescription.duration}
                {prescription.duration_type && ` ${prescription.duration_type}`}
              </div>
            )}
            {prescription.quantity && (
              <div className="text-muted-foreground">
                <span className="font-medium text-foreground">Qty:</span> {prescription.quantity}
              </div>
            )}
          </div>

          <div className="mt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Schedule:</span> {formatDosage(prescription)}
          </div>

          {prescription.instruction && (
            <div className="mt-1 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Instructions:</span> {prescription.instruction}
            </div>
          )}

          {prescription.notes && (
            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
              <span className="font-medium text-foreground">Notes:</span> {prescription.notes}
            </div>
          )}
        </div>

        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => onEdit(prescription)}
                aria-label="Edit prescription"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive"
                disabled={isDeleting}
                onClick={() => onDelete(prescription.prescription_id)}
                aria-label="Delete prescription"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PrescriptionCard;
