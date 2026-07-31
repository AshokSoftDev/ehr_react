import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { FormFloatingInput } from "@/components/form/form-floating-input";
import { FormFloatingDatePicker } from "@/components/form/FormFloatingDatePicker";
import { format } from "date-fns";
import { useDebounce } from "@/hooks/use-debounce";

interface ListFilterBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  fromDate: string;
  onFromDateChange: (val: string) => void;
  toDate: string;
  onToDateChange: (val: string) => void;
  onClear: () => void;
  className?: string;
}

export function ListFilterBar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search...",
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  onClear,
  className = "",
}: ListFilterBarProps) {
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const debouncedSearch = useDebounce(localSearch, 400);

  // Propagate debounced changes up to parent
  useEffect(() => {
    if (debouncedSearch !== searchQuery) {
      onSearchChange(debouncedSearch);
    }
  }, [debouncedSearch, onSearchChange, searchQuery]);

  // Sync from parent when parent resets or updates searchQuery externally
  useEffect(() => {
    if (searchQuery !== localSearch && searchQuery !== debouncedSearch) {
      setLocalSearch(searchQuery);
    }
  }, [searchQuery]);

  const hasFilter = Boolean(localSearch || searchQuery || fromDate || toDate);

  const handleClearSearch = () => {
    setLocalSearch("");
    onSearchChange("");
  };

  const handleClearAll = () => {
    setLocalSearch("");
    onClear();
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 px-3 py-2.5 bg-muted/20 border-b border-border ${className}`}>
      {/* Search Floating Input with Debounce */}
      <div className="relative flex-1 min-w-[220px] max-w-sm">
        <FormFloatingInput
          label={searchPlaceholder}
          value={localSearch}
          onValueChange={(val) => setLocalSearch(val)}
          className="gap-0"
          inputClassName="pr-8 text-xs bg-card shadow-2xs border-border/80 focus-visible:ring-1 focus-visible:ring-primary"
        />
        {localSearch && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer z-20"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Date Range Floating Pickers */}
      <div className="flex items-center gap-2 shrink-0 flex-wrap">
        <div className="w-[150px]">
          <FormFloatingDatePicker
            label="From Date"
            value={fromDate}
            onValueChange={(date) => {
              onFromDateChange(date ? format(date, "yyyy-MM-dd") : "");
            }}
            className="gap-0 shadow-2xs"
          />
        </div>
        <div className="w-[150px]">
          <FormFloatingDatePicker
            label="To Date"
            value={toDate}
            onValueChange={(date) => {
              onToDateChange(date ? format(date, "yyyy-MM-dd") : "");
            }}
            className="gap-0 shadow-2xs"
          />
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasFilter && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-9 px-2.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 gap-1 transition-colors cursor-pointer"
          title="Clear all filters"
        >
          <X className="h-3.5 w-3.5" />
          <span>Clear</span>
        </Button>
      )}
    </div>
  );
}

export default ListFilterBar;
