import React from 'react';
import { Input } from '../../../components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { Search, X } from 'lucide-react';

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
  // Handle select changes to convert "all" back to empty string
  const handleGroupChange = (value: string) => {
    onGroupChange(value === 'all' ? '' : value);
  };

  const handleStatusChange = (value: string) => {
    onStatusChange(value === 'all' ? '' : value);
  };

  const handleAccountTypeChange = (value: string) => {
    onAccountTypeChange(value === 'all' ? '' : value);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <Select value={groupId || 'all'} onValueChange={handleGroupChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Groups</SelectItem>
            {groups.map((group) => (
              <SelectItem key={group.id} value={group.id}>
                {group.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status || 'all'} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="1">Active</SelectItem>
            <SelectItem value="0">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={accountType || 'all'} onValueChange={handleAccountTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="parent">Parent</SelectItem>
            <SelectItem value="child">Child</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={onReset} className="gap-2">
            <X className="h-4 w-4" />
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};
