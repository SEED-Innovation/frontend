import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface FilterChipsProps {
  statusFilter: string;
  roleFilter: string;
  userType: 'user' | 'manager';
  onStatusChange: (status: string) => void;
  onRoleChange: (role: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  statusFilter,
  roleFilter,
  userType,
  onStatusChange,
  onRoleChange
}) => {
  const statusOptions = ['All', 'Active', 'Suspended'];
  const roleOptions = userType === 'user' 
    ? ['All', 'Player'] 
    : ['All', 'Admin', 'Super Admin'];

  return (
    <div className="flex items-center gap-4 mb-4">
      {/* Status Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <div className="flex gap-1">
          {statusOptions.map((status) => (
            <Badge
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              className="cursor-pointer hover:bg-muted"
              onClick={() => onStatusChange(status)}
            >
              {status}
            </Badge>
          ))}
        </div>
      </div>

      {/* Role Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">
          {userType === 'user' ? 'Type' : 'Role'}:
        </span>
        <div className="flex gap-1">
          {roleOptions.map((role) => (
            <Badge
              key={role}
              variant={roleFilter === role ? "default" : "outline"}
              className="cursor-pointer hover:bg-muted"
              onClick={() => onRoleChange(role)}
            >
              {role}
            </Badge>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {(statusFilter !== 'All' || roleFilter !== 'All') && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onStatusChange('All');
            onRoleChange('All');
          }}
        >
          <X className="w-4 h-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  );
};