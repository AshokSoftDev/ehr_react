import type { ColumnDef } from '@tanstack/react-table';
import { Edit, Trash, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { LocationItem } from '../types/location.types';

interface LocationTableColumnsProps {
  onEdit: (location: LocationItem) => void;
  onDelete: (location: LocationItem) => void;
}

export const createLocationColumns = ({
  onEdit,
  onDelete,
}: LocationTableColumnsProps): ColumnDef<LocationItem>[] => [
  {
    accessorKey: 'location_name',
    header: 'Location Name',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <div className="p-1 bg-primary/10 rounded-md">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <span className="font-medium">{row.getValue('location_name') as string}</span>
      </div>
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
      const active = row.original.active ?? (row.getValue('status') as number) === 1;
      const label = active ? 'Active' : 'Inactive';
      const classes = active
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
              onDelete(location);
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
