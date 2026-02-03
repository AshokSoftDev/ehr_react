import { type ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import type { DocumentType } from '@/features/masters/types/documentType.types';

interface ColumnsProps {
  onEdit: (item: DocumentType) => void;
  onDelete: (item: DocumentType) => void;
}

export function createDocumentTypeColumns({ onEdit, onDelete }: ColumnsProps): ColumnDef<DocumentType>[] {
  return [
    {
      accessorKey: 'type_name',
      header: 'Type Name',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.type_name}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original.description || '-'}</span>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(row.original)}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(row.original)}
            className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      ),
    },
  ];
}
