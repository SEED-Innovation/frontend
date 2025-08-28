import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '../common/SearchInput';
import { DayFilter } from '../common/DayFilter';
import { TimeRangeInputs } from '../common/TimeRangeInputs';
import { ExportCsvButton } from '../common/ExportCsvButton';
import { DOW, AvailabilityRow } from '@/lib/api/admin/types';
import { toast } from 'sonner';

interface AvailabilityToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  dayFilter: DOW | 'ALL';
  onDayFilterChange: (day: DOW | 'ALL') => void;
  startTimeFilter: string;
  endTimeFilter: string;
  onStartTimeFilterChange: (time: string) => void;
  onEndTimeFilterChange: (time: string) => void;
  selectedIds: number[];
  onBulkDelete: (ids: number[]) => void;
  filteredData: AvailabilityRow[];
  className?: string;
}

export const AvailabilityToolbar: React.FC<AvailabilityToolbarProps> = ({
  searchTerm,
  onSearchChange,
  dayFilter,
  onDayFilterChange,
  startTimeFilter,
  endTimeFilter,
  onStartTimeFilterChange,
  onEndTimeFilterChange,
  selectedIds,
  onBulkDelete,
  filteredData,
  className = ""
}) => {
  const handleBulkDelete = () => {
    if (selectedIds.length === 0) {
      toast.error('No rows selected');
      return;
    }
    
    /**
     * TODO[BE-LINK][AdminCourtAvailabilityController.bulkDelete]
     * Endpoint (placeholder): DELETE /admin/courts/availability/bulk
     * Token: Authorization: Bearer <JWT>
     * Replace mock call with real service when backend is ready.
     */
    onBulkDelete(selectedIds);
    toast.success(`TODO: Delete ${selectedIds.length} availability records - wire backend`);
  };

  const csvColumns = [
    { key: 'courtName', label: 'Court Name' },
    { key: 'dayOfWeek', label: 'Day of Week' },
    { key: 'start', label: 'Start Time' },
    { key: 'end', label: 'End Time' },
  ];

  return (
    <div className={`flex flex-wrap items-center gap-4 p-4 border-b bg-muted/50 ${className}`}>
      {/* Left side - Search and filters */}
      <div className="flex flex-wrap items-center gap-3 flex-1">
        <SearchInput
          placeholder="Search court..."
          onSearch={onSearchChange}
          className="w-64"
        />
        
        <DayFilter
          value={dayFilter}
          onValueChange={onDayFilterChange}
        />
        
        <TimeRangeInputs
          startTime={startTimeFilter}
          endTime={endTimeFilter}
          onStartTimeChange={onStartTimeFilterChange}
          onEndTimeChange={onEndTimeFilterChange}
        />
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Selected
            </Button>
          </div>
        )}
        
        <ExportCsvButton
          data={filteredData}
          filename="court-availability"
          columns={csvColumns}
        />
      </div>
    </div>
  );
};