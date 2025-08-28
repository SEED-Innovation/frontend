import React, { useState, useEffect, useMemo } from 'react';
import { Edit, Trash2, AlertTriangle, ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import { AvailabilityToolbar } from './AvailabilityToolbar';
import { AvailabilityRow, DOW, AvailabilityFilters } from '@/lib/api/admin/types';
import { getAvailabilitiesMock, deleteAvailabilityMock, bulkDeleteAvailabilityMock } from '@/lib/api/admin/availability';
import { courtService } from '@/lib/api/services/courtService';
import { toast } from 'sonner';

type SortField = 'courtName' | 'dayOfWeek' | 'start' | 'end';
type SortDirection = 'asc' | 'desc';

export const AvailabilityTable: React.FC = () => {
  const [data, setData] = useState<AvailabilityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [sortField, setSortField] = useState<SortField>('courtName');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [editingItem, setEditingItem] = useState<AvailabilityRow | null>(null);
  const [editFormData, setEditFormData] = useState({
    courtId: 0,
    dayOfWeek: '',
    start: '',
    end: ''
  });
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [dayFilter, setDayFilter] = useState<DOW | 'ALL'>('ALL');
  const [startTimeFilter, setStartTimeFilter] = useState('');
  const [endTimeFilter, setEndTimeFilter] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Try to use real API first, fallback to mock if needed
      try {
        const availabilities = await courtService.getAvailabilities();
        // Transform the data to match AvailabilityRow interface
        const transformedData: AvailabilityRow[] = availabilities.map((avail: any) => ({
          id: avail.id,
          courtId: avail.courtId || 0,
          courtName: avail.courtName || `Court ${avail.courtId}`,
          dayOfWeek: avail.dayOfWeek as DOW,
          start: avail.startTime,
          end: avail.endTime
        }));
        setData(transformedData);
      } catch (apiError) {
        console.warn('Real API not available, using mock data:', apiError);
        // Fallback to mock data
        const result = await getAvailabilitiesMock();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to load availability data:', error);
      toast.error('Failed to load availability data');
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
      
      // Day filter
      if (dayFilter !== 'ALL' && item.dayOfWeek !== dayFilter) {
        return false;
      }
      
      // Time filters
      if (startTimeFilter && item.start < startTimeFilter + ':00') {
        return false;
      }
      if (endTimeFilter && item.end > endTimeFilter + ':59') {
        return false;
      }
      
      return true;
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'dayOfWeek') {
        const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
        aValue = dayOrder.indexOf(a.dayOfWeek) as any;
        bValue = dayOrder.indexOf(b.dayOfWeek) as any;
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, dayFilter, startTimeFilter, endTimeFilter, sortField, sortDirection]);

  // Check for overlapping time slots (same court + day)
  const getOverlapWarning = (item: AvailabilityRow) => {
    const overlaps = data.filter(other => 
      other.id !== item.id &&
      other.courtId === item.courtId &&
      other.dayOfWeek === item.dayOfWeek &&
      ((item.start >= other.start && item.start < other.end) ||
       (item.end > other.start && item.end <= other.end) ||
       (item.start <= other.start && item.end >= other.end))
    );
    
    return overlaps.length > 0 ? overlaps : null;
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

  const handleEdit = (item: AvailabilityRow) => {
    // Check if we have a valid ID (not a temporary index-based ID)
    if (item.id <= 0 || item.courtId <= 0) {
      toast.warning('Cannot edit this record - missing required IDs. Please refresh the data.');
      return;
    }
    
    setEditingItem(item);
    setEditFormData({
      courtId: item.courtId,
      dayOfWeek: item.dayOfWeek,
      start: item.start.substring(0, 5), // Convert "10:00:00" to "10:00"
      end: item.end.substring(0, 5)
    });
  };

  const handleUpdateAvailability = async () => {
    if (!editingItem) return;

    try {
      const requestData = {
        courtId: editFormData.courtId,
        dayOfWeek: editFormData.dayOfWeek,
        start: editFormData.start,
        end: editFormData.end
      };

      const updatedAvailability = await courtService.updateAvailability(editingItem.id, requestData);
      
      // Update the data in the table
      setData(prev => prev.map(item => 
        item.id === editingItem.id 
          ? {
              ...item,
              dayOfWeek: updatedAvailability.dayOfWeek as DOW,
              start: updatedAvailability.startTime,
              end: updatedAvailability.endTime
            }
          : item
      ));
      
      setEditingItem(null);
      toast.success('Availability updated successfully');
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({
      courtId: 0,
      dayOfWeek: '',
      start: '',
      end: ''
    });
  };

  const handleDelete = async (id: number) => {
    // Check if we have a valid ID (not a temporary index-based ID)
    if (id <= 0) {
      toast.warning('Cannot delete this record - missing required ID. Please refresh the data.');
      return;
    }
    
    try {
      await courtService.deleteAvailability(id);
      setData(prev => prev.filter(item => item.id !== id));
      setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
      toast.success('Availability deleted successfully');
    } catch (error) {
      console.error('Failed to delete availability:', error);
      toast.error('Failed to delete availability');
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      /**
       * TODO[BE-LINK][AdminCourtAvailabilityController.bulkDelete]
       * Endpoint (placeholder): DELETE /admin/courts/availability/bulk
       * Token: Authorization: Bearer <JWT>
       * Replace mock call with real service when backend is ready.
       */
      await bulkDeleteAvailabilityMock(ids);
      setData(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedIds([]);
      toast.success(`${ids.length} availability records deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete availability records');
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5); // "10:00:00" -> "10:00"
  };

  const formatDayOfWeek = (day: DOW) => {
    return day.charAt(0) + day.slice(1).toLowerCase();
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
        <AvailabilityToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dayFilter={dayFilter}
          onDayFilterChange={setDayFilter}
          startTimeFilter={startTimeFilter}
          endTimeFilter={endTimeFilter}
          onStartTimeFilterChange={setStartTimeFilter}
          onEndTimeFilterChange={setEndTimeFilter}
          selectedIds={selectedIds}
          onBulkDelete={handleBulkDelete}
          filteredData={filteredAndSortedData}
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
        <AvailabilityToolbar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          dayFilter={dayFilter}
          onDayFilterChange={setDayFilter}
          startTimeFilter={startTimeFilter}
          endTimeFilter={endTimeFilter}
          onStartTimeFilterChange={setStartTimeFilter}
          onEndTimeFilterChange={setEndTimeFilter}
          selectedIds={selectedIds}
          onBulkDelete={handleBulkDelete}
          filteredData={filteredAndSortedData}
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
                <SortableHeader field="dayOfWeek">Day of Week</SortableHeader>
                <SortableHeader field="start">Start Time</SortableHeader>
                <SortableHeader field="end">End Time</SortableHeader>
                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No availability records found
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((item) => {
                  const overlaps = getOverlapWarning(item);
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
                          {overlaps && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="h-4 w-4 text-amber-500 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <div className="max-w-sm">
                                  <p className="font-medium mb-1">Time overlap detected!</p>
                                  <p>Overlaps with {overlaps.length} other slot(s) for this court on {formatDayOfWeek(item.dayOfWeek)}</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {isEditing ? (
                          <Select 
                            value={editFormData.dayOfWeek} 
                            onValueChange={(value) => setEditFormData({...editFormData, dayOfWeek: value})}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="MONDAY">Monday</SelectItem>
                              <SelectItem value="TUESDAY">Tuesday</SelectItem>
                              <SelectItem value="WEDNESDAY">Wednesday</SelectItem>
                              <SelectItem value="THURSDAY">Thursday</SelectItem>
                              <SelectItem value="FRIDAY">Friday</SelectItem>
                              <SelectItem value="SATURDAY">Saturday</SelectItem>
                              <SelectItem value="SUNDAY">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant="outline">
                            {formatDayOfWeek(item.dayOfWeek)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {isEditing ? (
                          <Input
                            type="time"
                            value={editFormData.start}
                            onChange={(e) => setEditFormData({...editFormData, start: e.target.value})}
                            className="w-32"
                          />
                        ) : (
                          formatTime(item.start)
                        )}
                      </TableCell>
                      <TableCell className="font-mono">
                        {isEditing ? (
                          <Input
                            type="time"
                            value={editFormData.end}
                            onChange={(e) => setEditFormData({...editFormData, end: e.target.value})}
                            className="w-32"
                          />
                        ) : (
                          formatTime(item.end)
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
                                    onClick={handleUpdateAvailability}
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
                                <TooltipContent>Edit availability</TooltipContent>
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
                                <TooltipContent>Delete availability</TooltipContent>
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