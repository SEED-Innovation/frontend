import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, ChevronUp, ChevronDown, RefreshCw, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { UnavailabilityToolbar } from './UnavailabilityToolbar';
import { UnavailabilityFilters } from '@/lib/api/admin/types';
import { getUnavailabilitiesMock, deleteUnavailabilityMock, bulkDeleteUnavailabilityMock } from '@/lib/api/admin/unavailability';
import { courtService, UnavailabilityRow } from '@/lib/api/services/courtService';
import { toast } from 'sonner';

type SortField = 'courtName' | 'date';
type SortDirection = 'asc' | 'desc';

export const UnavailabilityTable: React.FC = () => {
  const [data, setData] = useState<UnavailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('courtName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingItem, setEditingItem] = useState<UnavailabilityRow | null>(null);
  const [editFormData, setEditFormData] = useState({
    courtId: 0,
    date: ''
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Load data
  useEffect(() => {
    loadData();
    // Debug: Log courtService to see what methods are available
    console.log('courtService object:', courtService);
    console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(courtService)));
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Try to fetch from real API first, fallback to mock if needed
      try {
        const result = await courtService.getUnavailabilities();
        setData(result);
      } catch (apiError) {
        console.warn('Real API failed, falling back to mock data:', apiError);
        // Fallback to mock data which has proper IDs
        const result = await getUnavailabilitiesMock();
        // Convert date format from mock to expected format
        const transformedData = result.map(item => ({
          ...item,
          date: item.date.includes('-') ? 
            // Convert from "YYYY-MM-DD" to "DD-MM-YYYY" if needed
            item.date.split('-').reverse().join('-') : 
            item.date
        }));
        setData(transformedData);
        toast.info('Using mock data - API not available');
      }
    } catch (error) {
      console.error('Failed to load unavailability data:', error);
      toast.error('Failed to load unavailability data');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters and sorting
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Search filter
      if (searchTerm && !item.courtName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  // Check for date conflicts (same court + date)
  const getDateConflict = (item: UnavailabilityRow) => {
    const conflicts = data.filter(other => 
      other.id !== item.id &&
      other.courtId === item.courtId &&
      other.date === item.date
    );
    
    return conflicts.length > 0 ? conflicts : null;
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? filteredAndSortedData.map(item => item.id) : []);
  };

  const handleSelectRow = (id: number, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(selectedId => selectedId !== id)
    );
  };

  const handleEdit = (item: UnavailabilityRow) => {
    setEditingItem(item);
    // Convert date from "dd-MM-yyyy" to "yyyy-MM-dd" for input[type="date"]
    const dateParts = item.date.split('-');
    const isoDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
    
    setEditFormData({
      courtId: item.courtId || 1, // Use fallback courtId if not available
      date: isoDate
    });
  };

  const handleUpdateUnavailability = async () => {
    if (!editingItem) return;

    console.log('Starting update...', { editingItem, editFormData });
    console.log('courtService methods:', Object.getOwnPropertyNames(courtService));

    try {
      const requestData = {
        courtId: editFormData.courtId || editingItem.courtId || 1, // Ensure we have a valid courtId
        date: editFormData.date // Already in "YYYY-MM-DD" format
      };

      console.log('Calling updateUnavailability with:', { id: editingItem.id, requestData });
      const updatedUnavailability = await courtService.updateUnavailability(editingItem.id, requestData);
      
      // Convert date back to "dd-MM-yyyy" format for display
      const dateParts = updatedUnavailability.date.split('-');
      const displayDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      
      // Update the data in the table
      setData(prev => prev.map(item => 
        item.id === editingItem.id 
          ? {
              ...item,
              courtId: updatedUnavailability.courtId,
              date: displayDate
            }
          : item
      ));
      
      setEditingItem(null);
      toast.success('Unavailability updated successfully');
    } catch (error) {
      console.error('Failed to update unavailability:', error);
      toast.error('Failed to update unavailability');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({
      courtId: 0,
      date: ''
    });
  };

  const handleDelete = async (id: number) => {
    console.log('Starting delete...', { id });
    console.log('courtService methods:', Object.getOwnPropertyNames(courtService));
    console.log('deleteUnavailability function:', courtService.deleteUnavailability);
    
    try {
      await courtService.deleteUnavailability(id);
      setData(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      toast.success('Unavailability deleted successfully');
    } catch (error) {
      console.error('Failed to delete unavailability:', error);
      toast.error('Failed to delete unavailability');
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      /**
       * TODO[BE-LINK][AdminCourtUnavailabilityController.bulkDelete]
       * Endpoint (placeholder): DELETE /admin/courts/unavailability/bulk
       * Token: Authorization: Bearer <JWT>
       * Replace mock call with real service when backend is ready.
       */
      await bulkDeleteUnavailabilityMock(ids);
      setData(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedIds([]);
      toast.success(`${ids.length} unavailability records deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete unavailability records');
    }
  };

  const highlightSearchTerm = (text: string, term: string) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <TableHead 
      className="cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <UnavailabilityToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedIds={selectedIds}
          onBulkDelete={handleBulkDelete}
          filteredData={filteredAndSortedData}
          onRefresh={loadData}
          loading={loading}
        />
        <div className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-0">
        <UnavailabilityToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedIds={selectedIds}
          onBulkDelete={handleBulkDelete}
          filteredData={filteredAndSortedData}
          onRefresh={loadData}
          loading={loading}
        />
        
        <div className="border rounded-lg">
          <Table>
            <TableHeader className="sticky top-0 bg-background z-10">
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <SortableHeader field="courtName">Court</SortableHeader>
                <SortableHeader field="date">Date</SortableHeader>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No unavailability records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((item) => {
                  const isEditing = editingItem?.id === item.id;
                  
                  return (
                    <TableRow key={item.id} className="hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={(checked) => handleSelectRow(item.id, !!checked)}
                          aria-label={`Select ${item.courtName}`}
                          disabled={isEditing}
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="secondary" className="cursor-help">
                                {highlightSearchTerm(item.courtName, searchTerm)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Court ID: {item.courtId}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono">
                        {isEditing ? (
                          <Input
                            type="date"
                            value={editFormData.date}
                            onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                            className="w-40"
                          />
                        ) : (
                          item.date
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleUpdateUnavailability}
                                    className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Save changes</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleCancelEdit}
                                    className="h-8 w-8 p-0 text-gray-600 hover:text-gray-700"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cancel edit</TooltipContent>
                              </Tooltip>
                            </>
                          ) : (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(item)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Edit unavailability</TooltipContent>
                              </Tooltip>
                              
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(item.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete unavailability</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        {filteredAndSortedData.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 text-sm text-muted-foreground border-t">
            <span>
              Showing {filteredAndSortedData.length} of {data.length} records
            </span>
            {selectedIds.length > 0 && (
              <span>
                {selectedIds.length} selected
              </span>
            )}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};