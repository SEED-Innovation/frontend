import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Edit, ChevronUp, ChevronDown, Loader2, Calendar, AlertCircle, Ban, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UnavailabilityToolbar } from './UnavailabilityToolbar';
import { unavailabilityService } from '@/lib/api/admin/unavailabilityService';
import { handleApiError } from '@/utils/errorMapper';
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
  const [updateLoading, setUpdateLoading] = useState(false);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');

  // Load data
  useEffect(() => {
    loadData();
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
        // Fallback to mock data if real API fails
        const result = await unavailabilityService.getUnavailabilities();
        setData(result);
        toast.info('Using mock data - API not available');
      }
    } catch (error) {
      console.error('Failed to load unavailabilities:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Filtered and sorted data
  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.courtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
      );
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
        case 'date':
          aValue = a.date;
          bValue = b.date;
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
  }, [data, searchTerm, sortField, sortDirection]);

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

  const handleEdit = (item: UnavailabilityRow) => {
    setEditingItem(item);
    setEditFormData({
      courtId: item.courtId,
      date: item.date
    });
  };

  const handleUpdateUnavailability = async (id: number) => {
    try {
      setUpdateLoading(true);
      
      // Call real API
      await courtService.updateUnavailability(id, {
        courtId: editFormData.courtId,
        date: editFormData.date
      });
      
      // Update local data
      setData(prev => prev.map(item => 
        item.id === id 
          ? { ...item, courtId: editFormData.courtId, date: editFormData.date }
          : item
      ));
      
      setEditingItem(null);
      toast.success('Unavailability updated successfully');
    } catch (error) {
      handleApiError(error);
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditFormData({ courtId: 0, date: '' });
  };

  const handleDelete = async (id: number) => {
    try {
      await courtService.deleteUnavailability(id);
      setData(prev => prev.filter(item => item.id !== id));
      toast.success('Unavailability deleted successfully');
    } catch (error) {
      handleApiError(error);
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    try {
      await unavailabilityService.bulkDeleteUnavailabilities(ids);
      setData(prev => prev.filter(item => !ids.includes(item.id)));
      setSelectedIds([]);
      toast.success(`${ids.length} unavailabilities deleted successfully`);
    } catch (error) {
      handleApiError(error);
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
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-6"
    >
      <Card className="glass-card shadow-lg border-l-4 border-l-destructive/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <Calendar className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">Court Unavailability</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage blocked dates and court restrictions
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="px-3 py-1">
              {filteredAndSortedData.length} blocked
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <UnavailabilityToolbar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedIds={selectedIds}
        onBulkDelete={handleBulkDelete}
        filteredData={filteredAndSortedData}
        onRefresh={loadData}
        loading={loading}
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
                  <SortableHeader field="date" currentField={sortField} direction={sortDirection} onSort={handleSort}>
                    Date
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
                    <TableCell colSpan={4} className="h-32">
                      <div className="flex flex-col items-center justify-center text-center">
                        <div className="p-3 bg-muted/50 rounded-full mb-3">
                          <CheckCircle className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <p className="text-muted-foreground font-medium">No blocked dates found</p>
                        <p className="text-sm text-muted-foreground/70">All courts are available for booking</p>
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
                              <Ban className="h-3 w-3 text-primary" />
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
                          <Input
                            type="date"
                            value={editFormData.date}
                            onChange={(e) => setEditFormData({...editFormData, date: e.target.value})}
                            className="max-w-[200px] premium-input"
                          />
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(item.date).toLocaleDateString()}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingItem?.id === item.id ? (
                          <div className="flex justify-end gap-2">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateUnavailability(item.id)} 
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
                <span>{filteredAndSortedData.length} blocked date{filteredAndSortedData.length !== 1 ? 's' : ''}</span>
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