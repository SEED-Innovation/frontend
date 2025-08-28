import React from 'react';
import { Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '../common/SearchInput';
import { ExportCsvButton } from '../common/ExportCsvButton';
import { UnavailabilityRow } from '@/lib/api/admin/types';
import { toast } from 'sonner';

interface UnavailabilityToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedIds: number[];
  onBulkDelete: (ids: number[]) => Promise<void>;
  filteredData: UnavailabilityRow[];
  onRefresh: () => void;
  loading: boolean;
  className?: string;
}

export const UnavailabilityToolbar: React.FC<UnavailabilityToolbarProps> = ({
  searchTerm,
  onSearchChange,
  selectedIds,
  onBulkDelete,
  filteredData,
  onRefresh,
  loading,
  className = ""
}) => {
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error('No rows selected');
      return;
    }
    
    /**
     * TODO[BE-LINK][AdminCourtUnavailabilityController.bulkDelete]
     * Endpoint (placeholder): DELETE /admin/courts/unavailability/bulk
     * Token: Authorization: Bearer <JWT>
     * Replace mock call with real service when backend is ready.
     */
    await onBulkDelete(selectedIds);
  };

  const csvColumns = [
    { key: 'courtName', label: 'Court Name' },
    { key: 'date', label: 'Date' },
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
        
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <ExportCsvButton
          data={filteredData}
          filename="court-unavailability"
          columns={csvColumns}
        />
      </div>
    </div>
  );
};