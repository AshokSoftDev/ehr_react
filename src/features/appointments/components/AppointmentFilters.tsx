import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface AppointmentFiltersProps {
  filters: {
    search?: string;
    dateFrom?: string | Date;
    dateTo?: string | Date;
  };
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
}

export function AppointmentFilters({ filters, onClearFilter, onClearAll }: AppointmentFiltersProps) {
  const activeFilters = Object.entries(filters).filter(([_, value]) => value);

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium">Active filters:</span>
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="gap-1">
          {key === 'dateFrom' ? 'From' : key === 'dateTo' ? 'To' : key === 'search' ? 'Search' : key}: {
            key === 'dateFrom' || key === 'dateTo' 
              ? new Date(value as string).toLocaleDateString()
              : String(value)
          }
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 w-4 h-4"
            onClick={() => onClearFilter(key)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      ))}
      <Button variant="outline" size="sm" onClick={onClearAll}>
        Clear all
      </Button>
    </div>
  );
}