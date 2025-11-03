import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface VisitFiltersProps {
  filters: {
    dateFrom?: string | Date;
    dateTo?: string | Date;
    doctor?: string;
    patient?: string;
    reason?: string;
    status?: string;
  };
  onClearFilter: (key: string) => void;
  onClearAll: () => void;
}

export function VisitFilters({ filters, onClearFilter, onClearAll }: VisitFiltersProps) {
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    if (!value) return false;
    if (key === 'status' && value === 'none') return false;
    if (key === 'doctor' && (value === 'none' || value === '')) return false;
    return true;
  });
  if (activeFilters.length === 0) return null;

  const labelMap: Record<string, string> = {
    dateFrom: 'From',
    dateTo: 'To',
    doctor: 'Doctor',
    patient: 'Patient/MRN',
    reason: 'Reason',
    status: 'Status',
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium">Active filters:</span>
      {activeFilters.map(([key, value]) => (
        <Badge key={key} variant="secondary" className="gap-1">
          {labelMap[key] ?? key}: {key === 'dateFrom' || key === 'dateTo' ? new Date(value as string).toLocaleDateString() : String(value)}
          <Button variant="ghost" size="sm" className="h-auto p-0 w-4 h-4" onClick={() => onClearFilter(key)}>
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

export default VisitFilters;
