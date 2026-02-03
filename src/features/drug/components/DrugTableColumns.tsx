import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, Pill } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DrugItem } from '../types/drug.types';

interface DrugTableColumnsProps {
  onEdit: (drug: DrugItem) => void;
  onDelete: (drug: DrugItem) => void;
}

export const createDrugColumns = ({
  onEdit,
  onDelete,
}: DrugTableColumnsProps): ColumnDef<DrugItem>[] => [
  {
    accessorKey: 'drug_generic',
    header: 'Generic',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1 bg-blue-100 dark:bg-blue-900 rounded-md">
          <Pill className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="font-medium">{row.getValue('drug_generic') as string}</span>
      </div>
    ),
  },
  {
    accessorKey: 'drug_name',
    header: 'Brand Name',
  },
  {
    accessorKey: 'drug_type',
    header: 'Type',
  },
  {
    accessorKey: 'drug_dosage',
    header: 'Dosage',
  },
  {
    accessorKey: 'drug_measure',
    header: 'Measure',
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
  },
  {
    accessorKey: 'instruction',
    header: 'Instruction',
    cell: ({ row }) => {
      const val = row.getValue('instruction') as string | null | undefined;
      return val ? (
        <span className="truncate block max-w-[240px]" title={val}>
          {val}
        </span>
      ) : (
        <span className="text-muted-foreground text-xs">-</span>
      );
    },
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
      const drug = row.original;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onEdit(drug);
            }}
            className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
            aria-label="Edit drug"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(event) => {
              event.stopPropagation();
              onDelete(drug);
            }}
            className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
            aria-label="Delete drug"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

