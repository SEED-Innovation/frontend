import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, RefreshCw, Search, Download, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchInput } from '../common/SearchInput';
import { ExportCsvButton } from '../common/ExportCsvButton';
import { UnavailabilityRow } from '@/lib/api/admin/types';
import { Badge } from '@/components/ui/badge';
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
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass-card border-0 shadow-lg ${className}`}
    >
      <div className="flex flex-wrap items-center gap-4 p-4">
        {/* Left side - Search and filters */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <SearchInput
              placeholder="Search courts..."
              onSearch={onSearchChange}
              className="w-64 pl-10 premium-input"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {filteredData.length} blocked date{filteredData.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <AnimatePresence>
            {selectedIds.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex items-center gap-3 bg-destructive/10 px-3 py-2 rounded-lg border border-destructive/20"
              >
                <Badge variant="destructive" className="text-xs">
                  {selectedIds.length} selected
                </Badge>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="flex items-center gap-2 shadow-lg"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove Selected
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRefresh} 
              disabled={loading}
              className="premium-input"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <ExportCsvButton
              data={filteredData}
              filename="court-unavailability"
              columns={csvColumns}
              className="premium-input"
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};