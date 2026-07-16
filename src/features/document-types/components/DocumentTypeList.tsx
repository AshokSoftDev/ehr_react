import { Pencil, Trash2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DocumentType } from "@/features/masters/types/documentType.types";

interface DocumentTypeListProps {
  documentTypes: DocumentType[];
  isLoading: boolean;
  onEdit: (item: DocumentType) => void;
  onDelete: (item: DocumentType) => void;
}

export function DocumentTypeList({ documentTypes, isLoading, onEdit, onDelete }: DocumentTypeListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-0">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-20 w-full bg-muted animate-pulse rounded-md"></div>
        ))}
      </div>
    );
  }

  if (documentTypes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-md border-dashed">
        <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-semibold text-lg mb-1">No document types</h3>
        <p className="text-sm">Get started by creating your first document type</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 pb-4">
      <div className="bg-card overflow-hidden">
        <div className="divide-y divide-border">
          {documentTypes.map((item) => (
            <div key={item.document_type_id} className="group/item relative flex flex-col sm:flex-row sm:items-center justify-between p-2 hover:bg-muted/30 transition-colors gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-base truncate">{item.type_name}</h3>
                    <p className="text-sm text-muted-foreground truncate max-w-xl">
                      {item.description || 'No description'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center pl-4 border-l border-border/50 shrink-0 gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-primary hover:bg-blue-50 hover:text-blue-600 rounded-full"
                  onClick={() => onEdit(item)}
                  title="Edit Document Type"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:bg-red-50 rounded-full"
                  onClick={() => onDelete(item)}
                  title="Delete Document Type"
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
