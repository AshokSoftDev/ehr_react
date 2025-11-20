import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LocationItem } from '../types/location.types';

interface LocationTableColumnsProps {
  onEdit: (location: LocationItem) => void;
  onDelete: (id: number) => void;
}

export const createLocationColumns = ({
  onEdit,
  onDelete,
}: LocationTableColumnsProps): ColumnDef<LocationItem>[] => [
  {
    accessorKey: 'location_name',
    header: 'Location Name',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('location_name') as string}</span>
    ),
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'state',
    header: 'State',
  },
  {
    accessorKey: 'address',
    header: 'Address',
    cell: ({ row }) => {
      const address = row.getValue('address') as string | null | undefined;
      return address ? (
        <span className="truncate block max-w-[240px]" title={address}>
          {address}
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
      const location = row.original;
      return (
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={event => {
              event.stopPropagation();
              onEdit(location);
            }}
            className="h-8 w-8 hover:bg-muted/50 text-primary hover:text-primary"
            aria-label="Edit location"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={event => {
              event.stopPropagation();
              onDelete(location.location_id);
            }}
            className="h-8 w-8 text-destructive hover:bg-muted/50 hover:text-destructive"
            aria-label="Delete location"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];

