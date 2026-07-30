import { Pencil, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { FamilyDiseaseItem } from "../types/familyDisease.types";

interface FamilyDiseaseListProps {
  diseases: FamilyDiseaseItem[];
  isLoading: boolean;
  onEdit: (disease: FamilyDiseaseItem) => void;
  onDelete: (disease: FamilyDiseaseItem) => void;
}

export function FamilyDiseaseList({ diseases, isLoading, onEdit, onDelete }: FamilyDiseaseListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-16 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (diseases.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-md border-dashed">
        <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-1">No family history diseases found</h3>
        <p className="text-sm">Add a disease to get started</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      <div className="bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {diseases.map((disease) => (
            <div key={disease.family_disease_id} className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/30 transition-colors gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex items-center gap-3">
                    <h3 className="font-semibold text-base truncate">{disease.diseaseName}</h3>
                    {disease.status === 1 ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none shadow-none text-[10px] h-5 px-1.5 rounded-sm">Active</Badge>
                    ) : (
                      <Badge variant="secondary" className="shadow-none text-[10px] h-5 px-1.5 rounded-sm">Inactive</Badge>
                    )}
                  </div>
                </div>
                {disease.notes && (
                  <p className="text-sm text-muted-foreground pl-13">
                    {disease.notes}
                  </p>
                )}
              </div>
              
              <div className="flex items-center pl-4 border-l border-border/50 shrink-0 gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-blue-50 hover:text-blue-600 rounded-full"
                  onClick={() => onEdit(disease)}
                  title="Edit Disease"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-red-50 rounded-full"
                  onClick={() => onDelete(disease)}
                  title="Delete Disease"
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
