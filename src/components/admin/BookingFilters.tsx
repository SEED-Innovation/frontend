import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Calendar as CalendarIcon,
    Filter,
    X,
    Search,
    RotateCcw,
    Download,
    Users,
    MapPin,
    DollarSign,
    Clock
} from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { AdminBookingFilterRequest, BookingStatus, MatchType, CourtResponse } from '@/types/booking';
import { formatDateOnly } from '@/utils';
import { courtService } from '@/services';
import { adaptCourts } from '@/utils/courtAdapter';
import { Court as ExistingCourt } from '@/lib/api/services/courtService';
import { toast } from 'sonner';

interface BookingFiltersProps {
    onFilterChange: (filters: AdminBookingFilterRequest) => void;
    onExport?: () => void;
    isLoading?: boolean;
    className?: string;
    initialFilters?: AdminBookingFilterRequest;
}

const BookingFilters: React.FC<BookingFiltersProps> = ({
    onFilterChange,
    onExport,
    isLoading = false,
    className = "",
    initialFilters = {}
}) => {
    // ================================
    // 🏗️ STATE MANAGEMENT
    // ================================
    
    const [filters, setFilters] = useState<AdminBookingFilterRequest>(initialFilters);
    const [courts, setCourts] = useState<CourtResponse[]>([]);
    const [courtsLoading, setCourtsLoading] = useState(false);
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [activeFiltersCount, setActiveFiltersCount] = useState(0);
    
    // Date filter states (single date only)
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        filters.startDateTime ? new Date(filters.startDateTime) : undefined
    );
    const [datePickerOpen, setDatePickerOpen] = useState(false);

    // Quick filter states
    const [searchQuery, setSearchQuery] = useState(filters.search || '');
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(filters.statuses || []);
    const [selectedCourtIds, setSelectedCourtIds] = useState<number[]>(filters.courtIds || []);
    const [selectedMatchTypes, setSelectedMatchTypes] = useState<string[]>(filters.matchTypes || []);
    const [courtSearchQuery, setCourtSearchQuery] = useState('');

    // ================================
    // 🔄 EFFECTS
    // ================================
    
    useEffect(() => {
        loadCourts();
    }, []);

    useEffect(() => {
        let count = 0;
        if (searchQuery) count++;
        if (selectedStatuses.length > 0) count++;
        if (selectedCourtIds.length > 0) count++;
        if (selectedMatchTypes.length > 0) count++;
        if (selectedDate) count++;
        if (filters.userId) count++;
        if (filters.hasPayment !== undefined) count++;
        if (filters.isPaid !== undefined) count++;
        
        setActiveFiltersCount(count);
    }, [searchQuery, selectedStatuses, selectedCourtIds, selectedMatchTypes, selectedDate, filters]);

    // ================================
    // 🔧 HELPER FUNCTIONS
    // ================================
    
    const loadCourts = async () => {
        setCourtsLoading(true);
        try {
            console.log('🏟️ Loading REAL courts from service...');
            
            const existingCourts: ExistingCourt[] = await courtService.getAllCourts();
            
            console.log('✅ Raw courts from API:', existingCourts);
            
            if (existingCourts && existingCourts.length > 0) {
                // Convert to our format with proper error handling
                const adaptedCourts = adaptCourts(existingCourts);
                console.log('✅ Adapted courts:', adaptedCourts);
                setCourts(adaptedCourts);
            } else {
                console.warn('⚠️ No courts returned from API, loading fallback courts');
                setCourts([]);
            }
            
        } catch (error) {
            console.error('❌ Failed to load real courts:', error);
            // Don't set fallback courts, keep empty array and show no courts available
            setCourts([]);
        } finally {
            setCourtsLoading(false);
        }
    };

    const buildFilterRequest = (): AdminBookingFilterRequest => {
        const request: AdminBookingFilterRequest = {
            ...filters,
            search: searchQuery || undefined,
            statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
            courtIds: selectedCourtIds.length > 0 ? selectedCourtIds : undefined,
            matchTypes: selectedMatchTypes.length > 0 ? selectedMatchTypes : undefined,
            startDateTime: selectedDate ? selectedDate.toISOString() : undefined,
            page: 0,
            size: 20
        };

        return request;
    };

    const applyFilters = () => {
        const filterRequest = buildFilterRequest();
        console.log('🔍 Applying filters:', filterRequest);
        onFilterChange(filterRequest);
    };

    const clearAllFilters = () => {
        setSearchQuery('');
        setSelectedStatuses([]);
        setSelectedCourtIds([]);
        setSelectedMatchTypes([]);
        setSelectedDate(undefined);
        setFilters({});
        
        onFilterChange({ page: 0, size: 20 });
    };

    // ================================
    // 🎯 EVENT HANDLERS
    // ================================
    
    const handleQuickStatusFilter = (status: string) => {
        setSelectedStatuses([status]);
        const quickFilter = buildFilterRequest();
        quickFilter.statuses = [status];
        onFilterChange(quickFilter);
    };

    const handleQuickDateFilter = (filterType: string) => {
        try {
            const today = new Date();
            let filterDate: Date;

            switch (filterType) {
                case 'today':
                    filterDate = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                    break;
                
                case 'week':
                    const dayOfWeek = today.getDay();
                    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday start
                    filterDate = new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0);
                    break;
                
                case 'month':
                    filterDate = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    break;
                
                default:
                    console.warn('Unknown date filter type:', filterType);
                    return;
            }
            
            setSelectedDate(filterDate);
            
            const quickFilter = buildFilterRequest();
            quickFilter.startDateTime = filterDate.toISOString();
            
            console.log(`🔍 Applying ${filterType} filter:`, {
                date: quickFilter.startDateTime
            });
            
            onFilterChange(quickFilter);
            
        } catch (error) {
            console.error(`❌ Error applying ${filterType} filter:`, error);
            toast.error(`Failed to apply ${filterType} filter`);
        }
    };

    const handleStatusToggle = (status: string) => {
        const newStatuses = selectedStatuses.includes(status)
            ? selectedStatuses.filter(s => s !== status)
            : [...selectedStatuses, status];
        setSelectedStatuses(newStatuses);
    };

    // Filter courts based on search query
    const filteredCourts = courts.filter(court => 
        court.name.toLowerCase().includes(courtSearchQuery.toLowerCase())
    );

    const handleCourtToggle = (courtId: number) => {
        const newCourtIds = selectedCourtIds.includes(courtId)
            ? selectedCourtIds.filter(id => id !== courtId)
            : [...selectedCourtIds, courtId];
        setSelectedCourtIds(newCourtIds);
        
        // Apply filter immediately with proper error handling
        try {
            const quickFilter = buildFilterRequest();
            quickFilter.courtIds = newCourtIds.length > 0 ? newCourtIds : undefined;
            console.log('🏟️ Applying court filter:', quickFilter);
            onFilterChange(quickFilter);
        } catch (error) {
            console.error('❌ Error applying court filter:', error);
            toast.error('Failed to apply court filter');
        }
    };

    const handleMatchTypeToggle = (matchType: string) => {
        const newMatchTypes = selectedMatchTypes.includes(matchType)
            ? selectedMatchTypes.filter(mt => mt !== matchType)
            : [...selectedMatchTypes, matchType];
        setSelectedMatchTypes(newMatchTypes);
    };

    // Date helper functions for active button states
    const isToday = (date: Date): boolean => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isThisWeek = (date: Date): boolean => {
        const today = new Date();
        const startOfWeek = new Date(today);
        const dayOfWeek = startOfWeek.getDay();
        const diff = startOfWeek.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startOfWeek.setDate(diff);
        startOfWeek.setHours(0, 0, 0, 0);
        
        return date.toDateString() === startOfWeek.toDateString();
    };

    const isThisMonth = (date: Date): boolean => {
        const today = new Date();
        return date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    };

    // ================================
    // 🎨 RENDER METHODS
    // ================================
    
    const renderQuickFilters = () => (
        <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                    placeholder="Search by user name, email, court name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                    className="pl-10"
                    disabled={isLoading}
                />
            </div>

            {/* Quick Status Filters */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Status Filters</Label>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => handleQuickStatusFilter('PENDING')}
                        size="sm"
                        variant={selectedStatuses.includes('PENDING') ? 'default' : 'outline'}
                        className="text-xs"
                        disabled={isLoading}
                    >
                        ⏳ Pending
                    </Button>
                    <Button
                        onClick={() => handleQuickStatusFilter('APPROVED')}
                        size="sm"
                        variant={selectedStatuses.includes('APPROVED') ? 'default' : 'outline'}
                        className="text-xs"
                        disabled={isLoading}
                    >
                        ✅ Approved
                    </Button>
                    <Button
                        onClick={() => handleQuickStatusFilter('CANCELLED')}
                        size="sm"
                        variant={selectedStatuses.includes('CANCELLED') ? 'default' : 'outline'}
                        className="text-xs"
                        disabled={isLoading}
                    >
                        ❌ Cancelled
                    </Button>
                    <Button
                        onClick={() => handleQuickStatusFilter('REJECTED')}
                        size="sm"
                        variant={selectedStatuses.includes('REJECTED') ? 'default' : 'outline'}
                        className="text-xs"
                        disabled={isLoading}
                    >
                        🚫 Rejected
                    </Button>
                </div>
            </div>

            {/* Enhanced Time & Date Filters */}
            <div className="space-y-3 p-3 bg-muted/30 rounded-lg border">
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <Label className="text-sm font-semibold">Time & Date Filters</Label>
                </div>
                
                {/* Quick Date Buttons */}
                <div className="grid grid-cols-3 gap-2">
                    <Button
                        onClick={() => handleQuickDateFilter('today')}
                        size="sm"
                        variant={selectedDate && isToday(selectedDate) ? 'default' : 'outline'}
                        className="text-xs"
                        disabled={isLoading}
                    >
                        📅 Today
                    </Button>
                    <Button
                        onClick={() => handleQuickDateFilter('week')}
                        size="sm"
                        variant={selectedDate && isThisWeek(selectedDate) ? 'default' : 'outline'}
                        className="text-xs"
                        disabled={isLoading}
                    >
                        📅 This Week
                    </Button>
                    <Button
                        onClick={() => handleQuickDateFilter('month')}
                        size="sm"
                        variant={selectedDate && isThisMonth(selectedDate) ? 'default' : 'outline'}
                        className="text-xs"
                        disabled={isLoading}
                    >
                        📅 This Month
                    </Button>
                </div>

                {/* Custom Date Picker */}
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Filter by Date</Label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-start text-left font-normal text-xs"
                                disabled={isLoading}
                            >
                                <CalendarIcon className="mr-2 h-3 w-3" />
                                {selectedDate ? formatDateOnly(selectedDate.toISOString()) : "Pick a date"}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                            <div className="p-0">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        console.log('📅 Calendar date selected:', date);
                                        if (date) {
                                            setSelectedDate(date);
                                            try {
                                                // Create filter with proper date formatting
                                                const filterRequest: AdminBookingFilterRequest = {
                                                    search: searchQuery || undefined,
                                                    statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
                                                    courtIds: selectedCourtIds.length > 0 ? selectedCourtIds : undefined,
                                                    matchTypes: selectedMatchTypes.length > 0 ? selectedMatchTypes : undefined,
                                                    startDateTime: date.toISOString(),
                                                    page: 0,
                                                    size: 10
                                                };
                                                
                                                console.log('🔍 Applying calendar filter:', filterRequest);
                                                onFilterChange(filterRequest);
                                                toast.success(`Filter applied for ${date.toLocaleDateString()}`);
                                                setDatePickerOpen(false);
                                            } catch (error) {
                                                console.error('❌ Error applying calendar filter:', error);
                                                toast.error('Failed to apply date filter');
                                            }
                                        }
                                    }}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                    className="pointer-events-auto"
                                />
                                <div className="p-3 border-t flex gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedDate(undefined);
                                            const clearedFilter: AdminBookingFilterRequest = {
                                                search: searchQuery || undefined,
                                                statuses: selectedStatuses.length > 0 ? selectedStatuses : undefined,
                                                courtIds: selectedCourtIds.length > 0 ? selectedCourtIds : undefined,
                                                matchTypes: selectedMatchTypes.length > 0 ? selectedMatchTypes : undefined,
                                                page: 0,
                                                size: 10
                                            };
                                            onFilterChange(clearedFilter);
                                            setDatePickerOpen(false);
                                            toast.success('Date filter cleared');
                                        }}
                                        className="flex-1"
                                    >
                                        Clear
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => setDatePickerOpen(false)}
                                        className="flex-1"
                                    >
                                        Apply
                                    </Button>
                                </div>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Clear Date Button */}
                {selectedDate && (
                    <Button
                        onClick={() => {
                            setSelectedDate(undefined);
                            const clearedFilter = buildFilterRequest();
                            clearedFilter.startDateTime = undefined;
                            onFilterChange(clearedFilter);
                        }}
                        size="sm"
                        variant="ghost"
                        className="text-xs w-full"
                    >
                        <X className="mr-1 h-3 w-3" />
                        Clear Date
                    </Button>
                )}
            </div>

            {/* Court Selection with Search */}
            {courts.length > 0 && (
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Filter by Court</Label>
                    
                    {/* Court search input if more than 5 courts */}
                    {courts.length > 5 && (
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                            <Input
                                placeholder="Search courts..."
                                value={courtSearchQuery}
                                onChange={(e) => setCourtSearchQuery(e.target.value)}
                                className="pl-8 h-8 text-xs"
                            />
                        </div>
                    )}
                    
                    {/* Courts list */}
                    <div className="max-h-32 overflow-y-auto space-y-1">
                        {filteredCourts.length > 0 ? (
                            filteredCourts.map(court => (
                                <div key={court.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`court-${court.id}`}
                                        checked={selectedCourtIds.includes(court.id)}
                                        onCheckedChange={() => handleCourtToggle(court.id)}
                                        disabled={isLoading}
                                    />
                                    <Label htmlFor={`court-${court.id}`} className="text-xs cursor-pointer">
                                        {court.name}
                                    </Label>
                                </div>
                            ))
                        ) : courtSearchQuery ? (
                            <p className="text-xs text-muted-foreground">No courts found matching "{courtSearchQuery}"</p>
                        ) : (
                            <p className="text-xs text-muted-foreground">No courts available</p>
                        )}
                    </div>
                    
                    {/* Selected courts indicator */}
                    {selectedCourtIds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                            {selectedCourtIds.map(courtId => {
                                const court = courts.find(c => c.id === courtId);
                                return court ? (
                                    <Badge 
                                        key={courtId} 
                                        variant="secondary" 
                                        className="text-xs"
                                    >
                                        {court.name}
                                        <X 
                                            className="ml-1 h-3 w-3 cursor-pointer" 
                                            onClick={() => handleCourtToggle(courtId)}
                                        />
                                    </Badge>
                                ) : null;
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        <CardTitle className="text-lg">Booking Filters</CardTitle>
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                                {activeFiltersCount} active
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {activeFiltersCount > 0 && (
                            <Button
                                onClick={clearAllFilters}
                                size="sm"
                                variant="ghost"
                                className="text-xs"
                                disabled={isLoading}
                            >
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Clear All
                            </Button>
                        )}
                        <Button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            size="sm"
                            variant="outline"
                            className="text-xs"
                        >
                            {showAdvanced ? 'Simple' : 'Advanced'}
                        </Button>
                        {onExport && (
                            <Button
                                onClick={onExport}
                                size="sm"
                                variant="secondary"
                                className="text-xs"
                                disabled={isLoading}
                            >
                                <Download className="w-3 h-3 mr-1" />
                                Export
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {renderQuickFilters()}
                
                {/* Apply Filters Button */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t">
                    <Button
                        onClick={applyFilters}
                        className="bg-primary hover:bg-primary/90"
                        disabled={isLoading}
                    >
                        <Filter className="mr-2 h-4 w-4" />
                        Apply
                    </Button>
                    <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        disabled={isLoading}
                    >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </div>

                {/* Loading indicator for courts */}
                {courtsLoading && (
                    <div className="text-center py-2">
                        <div className="inline-block w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2" />
                        <span className="text-xs text-muted-foreground">Loading courts...</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default BookingFilters;
