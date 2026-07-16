import { Pencil, Trash2, Pill, Activity, Receipt, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DrugItem } from "../types/drug.types";

interface DrugListProps {
  drugs: DrugItem[];
  isLoading: boolean;
  onEdit: (drug: DrugItem) => void;
  onDelete: (drug: DrugItem) => void;
}

export function DrugList({ drugs, isLoading, onEdit, onDelete }: DrugListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (drugs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-md border-dashed">
        <Pill className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-1">No drugs found</h3>
        <p className="text-sm">Add a drug to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      <div className="bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {drugs.map((drug) => (
            <div key={drug.drug_id} className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/30 transition-colors gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Pill className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex items-center gap-3">
                    <h3 className="font-semibold text-base truncate">{drug.drug_name}</h3>
                    {drug.status === 1 ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none text-[10px] h-5 px-1.5 rounded-sm">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="shadow-none text-[10px] h-5 px-1.5 rounded-sm">Inactive</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mt-1 ml-14 flex-wrap">
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Activity className="h-3.5 w-3.5" />
                    <span className="truncate max-w-[200px]" title={drug.drug_generic}>{drug.drug_generic}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Scale className="h-3.5 w-3.5" />
                    <span>{drug.drug_dosage} {drug.drug_measure}</span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>{drug.drug_type}</span>
                  </div>

                  {drug.instruction && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground italic truncate max-w-sm" title={drug.instruction}>
                      "{drug.instruction}"
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center pl-4 border-l border-border/50 shrink-0 gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-blue-50 hover:text-blue-600 rounded-full"
                  onClick={() => onEdit(drug)}
                  title="Edit Drug"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-red-50 rounded-full"
                  onClick={() => onDelete(drug)}
                  title="Delete Drug"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
