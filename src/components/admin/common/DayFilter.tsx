import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DOW } from '@/lib/api/admin/types';

interface DayFilterProps {
  value: DOW | 'ALL';
  onValueChange: (value: DOW | 'ALL') => void;
  className?: string;
}

const DAYS: Array<{ value: DOW | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'All Days' },
  { value: 'MONDAY', label: 'Monday' },
  { value: 'TUESDAY', label: 'Tuesday' },
  { value: 'WEDNESDAY', label: 'Wednesday' },
  { value: 'THURSDAY', label: 'Thursday' },
  { value: 'FRIDAY', label: 'Friday' },
  { value: 'SATURDAY', label: 'Saturday' },
  { value: 'SUNDAY', label: 'Sunday' },
];

export const DayFilter: React.FC<DayFilterProps> = ({
  value,
  onValueChange,
  className = ""
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className={`w-[140px] ${className}`}>
        <SelectValue placeholder="Day" />
      </SelectTrigger>
      <SelectContent>
        {DAYS.map((day) => (
          <SelectItem key={day.value} value={day.value}>
            {day.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};