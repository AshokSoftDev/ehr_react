import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, ShieldAlert } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AllergyItem } from '../types/allergy.types';

interface AllergyTableColumnsProps {
  onEdit: (allergy: AllergyItem) => void;
  onDelete: (allergy: AllergyItem) => void;
}

export const createAllergyColumns = ({
  onEdit,
  onDelete,
}: AllergyTableColumnsProps): ColumnDef<AllergyItem>[] => [
  {
    accessorKey: 'allergyName',
    header: 'Allergy Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1 bg-red-100 dark:bg-red-900 rounded-md">
          <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
        </div>
        <span className="font-medium">{row.getValue('allergyName') as string}</span>
      </div>
    ),
  },
  {
    accessorKey: 'allergyType',
    header: 'Type',
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as number;
      const label = status === 1 ? 'Active' : 'Inactive';
      const classes =
        status === 1
          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
      return (
        <Badge variant="outline" className={classes}>
          {label}
        </Badge>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => {
      const allergy = row.original;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(allergy);
            }}
            className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
            aria-label="Edit allergy"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(allergy);
            }}
            className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
            aria-label="Delete allergy"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
