import React from 'react';
import { Search, Filter, X, RotateCcw, Mail, CreditCard } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../../components/ui/popover';
import { Separator } from '../../../components/ui/separator';
import { Label } from '../../../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import type { DoctorFiltersType } from '../types/doctor.types';

interface DoctorFiltersProps {
  filters: DoctorFiltersType;
  onFiltersChange: (filters: DoctorFiltersType) => void;
}

const specialties = [
  'General Practice',
  'Cardiology',
  'Dermatology',
  'Endocrinology',
  'Gastroenterology',
  'Neurology',
  'Oncology',
  'Orthopedics',
  'Pediatrics',
  'Psychiatry',
  'Radiology',
  'Surgery',
];

export const DoctorFilters: React.FC<DoctorFiltersProps> = ({ 
  filters, 
  onFiltersChange 
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [tempFilters, setTempFilters] = React.useState<DoctorFiltersType>(filters);

  React.useEffect(() => {
    setTempFilters(filters);
  }, [filters]);

  const activeFiltersCount = Object.values(filters).filter(
    v => v !== undefined && v !== ''
  ).length;

  const handleApply = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleReset = () => {
    const resetFilters: DoctorFiltersType = {
      search: '',
      specialty: undefined,
      status: undefined,
      email: undefined,
      licenceNo: undefined,
    };
    setTempFilters(resetFilters);
    onFiltersChange(resetFilters);
    setIsOpen(false);
  };

  const handleClearFilter = (key: keyof DoctorFiltersType) => {
    const newFilters = { ...filters, [key]: undefined };
    if (key === 'search') newFilters.search = '';
    onFiltersChange(newFilters);
  };

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search doctors..."
              value={filters.search || ''}
              onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>
        </div>

        {/* Advanced Filters */}
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1 rounded-full px-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-medium leading-none">Filters</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="h-8 px-2"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Reset
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Filter doctors by various criteria
                </p>
              </div>

              <Separator />

              <div className="space-y-4">
                {/* Specialty */}
                <div className="space-y-2">
                  <Label>Specialty</Label>
                  <Select
                    value={tempFilters.specialty || 'all'}
                    onValueChange={(value) => setTempFilters({ 
                      ...tempFilters, 
                      specialty: value === 'all' ? undefined : value 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All specialties" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All specialties</SelectItem>
                      {specialties.map(specialty => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={tempFilters.status !== undefined ? tempFilters.status.toString() : 'all'}
                    onValueChange={(value) => setTempFilters({ 
                      ...tempFilters, 
                      status: value === 'all' ? undefined : parseInt(value) 
                    })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="1">Active</SelectItem>
                      <SelectItem value="0">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      type="email"
                      placeholder="Filter by email"
                      value={tempFilters.email || ''}
                      onChange={(e) => setTempFilters({ 
                        ...tempFilters, 
                        email: e.target.value || undefined 
                      })}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* License Number */}
                <div className="space-y-2">
                  <Label>License Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                    <Input
                      placeholder="Filter by license"
                      value={tempFilters.licenceNo || ''}
                      onChange={(e) => setTempFilters({ 
                        ...tempFilters, 
                        licenceNo: e.target.value || undefined 
                      })}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleApply}>Apply Filters</Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('search')}
              />
            </Badge>
          )}
          {filters.specialty && (
            <Badge variant="secondary" className="gap-1">
              Specialty: {filters.specialty}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('specialty')}
              />
            </Badge>
          )}
          {filters.status !== undefined && (
            <Badge variant="secondary" className="gap-1">
              Status: {filters.status === 1 ? 'Active' : 'Inactive'}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('status')}
              />
            </Badge>
          )}
          {filters.email && (
            <Badge variant="secondary" className="gap-1">
              Email: {filters.email}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('email')}
              />
            </Badge>
          )}
          {filters.licenceNo && (
            <Badge variant="secondary" className="gap-1">
              License: {filters.licenceNo}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => handleClearFilter('licenceNo')}
              />
            </Badge>
          )}
        </div>
      )}
    </>
  );
};
