import React from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Search, X } from 'lucide-react';
import { FormFloatingSelect } from '../../../components/form/FormFloatingSelect';
import { useForm } from 'react-hook-form';

interface Group {
  id: string;
  name: string;
}

interface UserFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  groupId?: string;
  onGroupChange: (value: string) => void;
  status?: string;
  onStatusChange: (value: string) => void;
  accountType?: string;
  onAccountTypeChange: (value: string) => void;
  groups: Group[];
  onReset: () => void;
  hasActiveFilters: boolean;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  search,
  onSearchChange,
  groupId,
  onGroupChange,
  status,
  onStatusChange,
  accountType,
  onAccountTypeChange,
  groups,
  onReset,
  hasActiveFilters,
}) => {
  const form = useForm({
    defaultValues: {
      groupId: groupId || '',
      status: status || '',
      accountType: accountType || '',
    }
  });

  // Group options
  const groupOptions = [
    { label: 'All Groups', value: '' },
    ...groups.map(group => ({
      label: group.name,
      value: group.id,
    }))
  ];

  const statusOptions = [
    { label: 'All Status', value: '' },
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '0' },
  ];

  const accountTypeOptions = [
    { label: 'All Types', value: '' },
    { label: 'Parent', value: 'parent' },
    { label: 'Child', value: 'child' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-start">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground z-10" />
          <Input
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-background/50 border-primary/20 focus:border-primary/40 h-12"
          />
        </div>

        <div className="flex gap-3 items-end">
          <div className="w-[180px]">
            <FormFloatingSelect
              control={form.control}
              name="groupId"
              label="Filter by Group"
              options={groupOptions}
              value={groupId}
              onValueChange={onGroupChange}
              triggerClassName="bg-background/50 h-12"
            />
          </div>

          <div className="w-[150px]">
            <FormFloatingSelect
              control={form.control}
              name="status"
              label="Status"
              options={statusOptions}
              value={status}
              onValueChange={onStatusChange}
              triggerClassName="bg-background/50 h-12"
            />
          </div>

          <div className="w-[150px]">
            <FormFloatingSelect
              control={form.control}
              name="accountType"
              label="Account Type"
              options={accountTypeOptions}
              value={accountType}
              onValueChange={onAccountTypeChange}
              triggerClassName="bg-background/50 h-12"
            />
          </div>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onReset}
              className="gap-2 h-12"
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
