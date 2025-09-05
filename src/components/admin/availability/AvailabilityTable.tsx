import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, ChevronUp, ChevronDown, Loader2, Clock, Calendar, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  const [updateLoading, setUpdateLoading] = useState(false);
  
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
        // const availabilities = await courtService.getAvailabilities();
        // setData(availabilities);
        // For now, use mock data until backend is ready
        const result = await getAvailabilitiesMock();
        setData(result);
      } catch (apiError) {
        console.warn('Real API failed, falling back to mock data:', apiError);
        // Fallback to mock data if real API fails
        const result = await getAvailabilitiesMock();
        setData(result);
        toast.info('Using mock data - API not available');
      }
    } catch (error) {
      console.error('Failed to load availabilities:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Format day of week display
  const formatDayOfWeek = (day: string) => {
    const days: Record<string, string> = {
      MONDAY: 'Monday',
      TUESDAY: 'Tuesday', 
      WEDNESDAY: 'Wednesday',
      THURSDAY: 'Thursday',
      FRIDAY: 'Friday',
      SATURDAY: 'Saturday',
      SUNDAY: 'Sunday'
    };
    return days[day] || day;
  };

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dayOfWeek.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.start.includes(searchTerm) ||
        item.end.includes(searchTerm)
      );
    }

    // Apply day filter
    if (dayFilter !== 'ALL') {
      filtered = filtered.filter(item => item.dayOfWeek === dayFilter);
    }

    // Apply time filters
    if (startTimeFilter) {
      filtered = filtered.filter(item => item.start >= startTimeFilter);
    }
    if (endTimeFilter) {
      filtered = filtered.filter(item => item.end <= endTimeFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      switch (sortField) {
        case 'courtName':
          aValue = a.courtName;
          bValue = b.courtName;
          break;
        case 'dayOfWeek':
          // Sort days of week in logical order
          const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
          aValue = dayOrder.indexOf(a.dayOfWeek);
          bValue = dayOrder.indexOf(b.dayOfWeek);
          break;
        case 'start':
          aValue = a.start;
          bValue = b.start;
          break;
        case 'end':
          aValue = a.end;
          bValue = b.end;
          break;
        default:
          return 0;
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [data, searchTerm, dayFilter, startTimeFilter, endTimeFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredAndSortedData.map(item => item.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  const handleEdit = (item: AvailabilityRow) => {
    setEditingItem(item);
    setEditFormData({
      courtId: item.courtId,
      dayOfWeek: item.dayOfWeek,
      start: item.start,
      end: item.end
    });
  };

  const handleUpdateAvailability = async (id: number) => {
    try {
      setUpdateLoading(true);
      
      // Validate time range
      if (editFormData.start >= editFormData.end) {
        toast.error('Start time must be before end time');
        return;
      }

      // Call real API
      await courtService.updateAvailability(id, {
        courtId: editFormData.courtId,
        dayOfWeek: editFormData.dayOfWeek,
        start: editFormData.start,
        end: editFormData.end
      });
      
      // Update local data
      setData(prev => prev.map(item => 
        item.id === id 
          ? { 
              ...item, 
              courtId: editFormData.courtId,
              dayOfWeek: editFormData.dayOfWeek,
              start: editFormData.start,
              end: editFormData.end
            }
          : item
      ));
      
      setEditingItem(null);
      toast.success('Availability updated successfully');
    } catch (error) {
      console.error('Failed to update availability:', error);
      toast.error('Failed to update availability');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({ courtId: 0, dayOfWeek: '', start: '', end: '' });
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAvailabilityMock(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Availability deleted successfully');
    } catch (error) {
      console.error('Failed to delete availability:', error);
      toast.error('Failed to delete availability');
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      await bulkDeleteAvailabilityMock(ids);
      setData(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedIds([]);
      toast.success(`${ids.length} availabilities deleted successfully`);
    } catch (error) {
      console.error('Failed to bulk delete availabilities:', error);
      toast.error('Failed to delete availabilities');
    }
  };

  // Helper function to highlight search term
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  // Sortable header component
  const SortableHeader: React.FC<{
    field: SortField;
    currentField: SortField;
    direction: SortDirection;
    onSort: (field: SortField) => void;
    children: React.ReactNode;
  }> = ({ field, currentField, direction, onSort, children }) => (
    <TableHead 
      className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-2">
        {children}
        {currentField === field && (
          direction === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-8 w-8 rounded-lg" />
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="glass-card shadow-lg border-l-4 border-l-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Court Availability</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage operating hours and schedule settings
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredAndSortedData.length} schedule{filteredAndSortedData.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <AvailabilityToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        filteredData={filteredAndSortedData}
        onRefresh={loadData}
        loading={loading}
        dayFilter={dayFilter}
        onDayFilterChange={setDayFilter}
        startTimeFilter={startTimeFilter}
        endTimeFilter={endTimeFilter}
        onStartTimeFilterChange={setStartTimeFilter}
        onEndTimeFilterChange={setEndTimeFilter}
      />
      
      <Card className="glass-card shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === filteredAndSortedData.length && filteredAndSortedData.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader field="courtName" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                    Court
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader field="dayOfWeek" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                    Day
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader field="start" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                    Start Time
                  </SortableHeader>
                </TableHead>
                <TableHead>
                  <SortableHeader field="end" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                    End Time
                  </SortableHeader>
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="wait">
                {filteredAndSortedData.length === 0 ? (
                  <motion.tr
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <TableCell colSpan={6} className="h-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-muted/50 rounded-full mb-3">
                          <CheckCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No availability schedules found</p>
                        <p className="text-sm text-muted-foreground/70">Set operating hours for your courts</p>
                      </div>
                    </TableCell>
                  </motion.tr>
                ) : (
                  filteredAndSortedData.map((item, index) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="group hover:bg-muted/30 transition-colors"
                    >
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onCheckedChange={() => handleSelectRow(item.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {editingItem?.id === item.id ? (
                          <Input
                            value={editFormData.courtId.toString()}
                            onChange={(e) => setEditFormData({...editFormData, courtId: parseInt(e.target.value) || 0})}
                            className="max-w-[200px] premium-input"
                            placeholder="Court ID"
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="p-1 bg-primary/10 rounded">
                              <Clock className="h-3 w-3 text-primary" />
                            </div>
                            <span 
                              dangerouslySetInnerHTML={{ __html: highlightSearchTerm(item.courtName, searchTerm) }} 
                              className="font-medium"
                            />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem?.id === item.id ? (
                          <Select value={editFormData.dayOfWeek} onValueChange={(value) => setEditFormData({...editFormData, dayOfWeek: value})}>
                            <SelectTrigger className="max-w-[150px] premium-input">
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
                          <Badge variant="outline" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDayOfWeek(item.dayOfWeek)}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem?.id === item.id ? (
                          <Input
                            type="time"
                            value={editFormData.start}
                            onChange={(e) => setEditFormData({...editFormData, start: e.target.value})}
                            className="max-w-[120px] premium-input"
                          />
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {item.start}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingItem?.id === item.id ? (
                          <Input
                            type="time"
                            value={editFormData.end}
                            onChange={(e) => setEditFormData({...editFormData, end: e.target.value})}
                            className="max-w-[120px] premium-input"
                          />
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {item.end}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingItem?.id === item.id ? (
                          <div className="flex justify-end gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateAvailability(item.id)} 
                                disabled={updateLoading}
                                className="btn-primary"
                              >
                                {updateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save'}
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                Cancel
                              </Button>
                            </motion.div>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </motion.div>
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          </div>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>

        {filteredAndSortedData.length > 0 && (
          <div className="border-t bg-muted/20 px-6 py-3">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{filteredAndSortedData.length} schedule{filteredAndSortedData.length !== 1 ? 's' : ''} configured</span>
              </div>
              {selectedIds.length > 0 && (
                <Badge variant="secondary">
                  {selectedIds.length} selected
                </Badge>
              )}
            </div>
          </div>
        )}
      </Card>
    </motion.div>
  );
};