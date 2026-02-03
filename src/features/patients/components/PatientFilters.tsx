import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';

interface PatientFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  onReset?: () => void;
  hasActiveFilters?: boolean;
}

export const PatientFilters: React.FC<PatientFiltersProps> = ({
  search,
  onSearchChange,
  onReset,
  hasActiveFilters,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            placeholder="Search patients by name, mobile, or MRN..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40 h-10"
          />
        </div>

        <div className="flex gap-3 items-end">
          {/* Add more filters here in the future if needed */}

          {hasActiveFilters && onReset && (
            <Button
              variant="secondary"
              onClick={onReset}
              className="gap-2 h-10 bg-muted hover:bg-muted/80 text-muted-foreground"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
