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
    
    // Date range states
    const [startDate, setStartDate] = useState<Date | undefined>(
        filters.startDateTime ? new Date(filters.startDateTime) : undefined
    );
    const [endDate, setEndDate] = useState<Date | undefined>(
        filters.endDateTime ? new Date(filters.endDateTime) : undefined
    );
    const [startDateOpen, setStartDateOpen] = useState(false);
    const [endDateOpen, setEndDateOpen] = useState(false);

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
        if (startDate) count++;
        if (endDate) count++;
        if (filters.userId) count++;
        if (filters.hasPayment !== undefined) count++;
        if (filters.isPaid !== undefined) count++;
        
        setActiveFiltersCount(count);
    }, [searchQuery, selectedStatuses, selectedCourtIds, selectedMatchTypes, startDate, endDate, filters]);

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
            startDateTime: startDate ? startDate.toISOString() : undefined,
            endDateTime: endDate ? endDate.toISOString() : undefined,
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
        setStartDate(undefined);
        setEndDate(undefined);
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
            let startDateTime: Date;
            let endDateTime: Date;

            switch (filterType) {
                case 'today':
                    startDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
                    endDateTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                    break;
                
                case 'week':
                    const dayOfWeek = today.getDay();
                    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday start
                    startDateTime = new Date(today.getFullYear(), today.getMonth(), diff, 0, 0, 0);
                    endDateTime = new Date(startDateTime);
                    endDateTime.setDate(startDateTime.getDate() + 6);
                    endDateTime.setHours(23, 59, 59);
                    break;
                
                case 'month':
                    startDateTime = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0);
                    endDateTime = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
                    break;
                
                default:
                    console.warn('Unknown date filter type:', filterType);
                    return;
            }
            
            setStartDate(startDateTime);
            setEndDate(endDateTime);
            
            const quickFilter = buildFilterRequest();
            quickFilter.startDateTime = startDateTime.toISOString();
            quickFilter.endDateTime = endDateTime.toISOString();
            
            console.log(`🔍 Applying ${filterType} filter:`, {
                start: quickFilter.startDateTime,
                end: quickFilter.endDateTime
            });
            
            onFilterChange(quickFilter);
            
        } catch (error) {
            console.error(`❌ Error applying ${filterType} filter:`, error);
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
    };

    const handleMatchTypeToggle = (matchType: string) => {
        const newMatchTypes = selectedMatchTypes.includes(matchType)
            ? selectedMatchTypes.filter(mt => mt !== matchType)
            : [...selectedMatchTypes, matchType];
        setSelectedMatchTypes(newMatchTypes);
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
                    >
                        ⏳ Pending
                    </Button>
                    <Button
                        onClick={() => handleQuickStatusFilter('APPROVED')}
                        size="sm"
                        variant={selectedStatuses.includes('APPROVED') ? 'default' : 'outline'}
                        className="text-xs"
                    >
                        ✅ Approved
                    </Button>
                    <Button
                        onClick={() => handleQuickStatusFilter('CANCELLED')}
                        size="sm"
                        variant={selectedStatuses.includes('CANCELLED') ? 'default' : 'outline'}
                        className="text-xs"
                    >
                        ❌ Cancelled
                    </Button>
                    <Button
                        onClick={() => handleQuickStatusFilter('REJECTED')}
                        size="sm"
                        variant={selectedStatuses.includes('REJECTED') ? 'default' : 'outline'}
                        className="text-xs"
                    >
                        🚫 Rejected
                    </Button>
                </div>
            </div>

            {/* Quick Date Filters */}
            <div className="space-y-2">
                <Label className="text-sm font-medium">Quick Date Filters</Label>
                <div className="flex flex-wrap gap-2">
                    <Button
                        onClick={() => handleQuickDateFilter('today')}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                    >
                        📅 Today
                    </Button>
                    <Button
                        onClick={() => handleQuickDateFilter('week')}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                    >
                        📅 This Week
                    </Button>
                    <Button
                        onClick={() => handleQuickDateFilter('month')}
                        size="sm"
                        variant="outline"
                        className="text-xs"
                    >
                        📅 This Month
                    </Button>
                </div>
            </div>
        </div>
    );

    const renderAdvancedFilters = () => {
        if (!showAdvanced) return null;

        return (
            <div className="space-y-6 border-t pt-6">
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {startDate ? formatDateOnly(startDate.toISOString()) : "Pick start date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={startDate}
                                    onSelect={(date) => {
                                        setStartDate(date);
                                        setStartDateOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label>End Date</Label>
                        <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="w-full justify-start text-left font-normal"
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {endDate ? formatDateOnly(endDate.toISOString()) : "Pick end date"}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={endDate}
                                    onSelect={(date) => {
                                        setEndDate(date);
                                        setEndDateOpen(false);
                                    }}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>

                {/* Status Filters */}
                <div className="space-y-2">
                    <Label>Booking Status</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {/* Use hardcoded values instead of Object.values(BookingStatus) to avoid enum issues */}
                        {['PENDING', 'APPROVED', 'CANCELLED', 'REJECTED'].map(status => (
                            <div key={status} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`status-${status}`}
                                    checked={selectedStatuses.includes(status)}
                                    onCheckedChange={() => handleStatusToggle(status)}
                                />
                                <Label htmlFor={`status-${status}`} className="text-sm">
                                    {status}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Court Filters */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label>Courts</Label>
                        {courts.length > 5 && (
                            <div className="relative w-48">
                                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3" />
                                <Input
                                    placeholder="Search courts..."
                                    className="pl-7 h-7 text-xs"
                                    onChange={(e) => setCourtSearchQuery(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                    {courtsLoading ? (
                        <div className="text-sm text-gray-500">Loading courts...</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {filteredCourts.map(court => (
                                <div key={court.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={`court-${court.id}`}
                                        checked={selectedCourtIds.includes(court.id)}
                                        onCheckedChange={() => handleCourtToggle(court.id)}
                                    />
                                    <Label htmlFor={`court-${court.id}`} className="text-sm flex-1">
                                        {court.name}
                                        <span className="text-gray-500 ml-1">({court.location})</span>
                                    </Label>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Match Type Filters */}
                <div className="space-y-2">
                    <Label>Match Type</Label>
                    <div className="flex flex-wrap gap-2">
                        {/* Use hardcoded values instead of Object.values(MatchType) */}
                        {['SINGLE', 'DOUBLE'].map(matchType => (
                            <div key={matchType} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`match-${matchType}`}
                                    checked={selectedMatchTypes.includes(matchType)}
                                    onCheckedChange={() => handleMatchTypeToggle(matchType)}
                                />
                                <Label htmlFor={`match-${matchType}`} className="text-sm">
                                    {matchType}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Payment Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Payment Status</Label>
                        <Select
                            value={filters.hasPayment === true ? 'has-payment' : filters.hasPayment === false ? 'no-payment' : 'all'}
                            onValueChange={(value) => {
                                const newFilters = { ...filters };
                                if (value === 'has-payment') {
                                    newFilters.hasPayment = true;
                                } else if (value === 'no-payment') {
                                    newFilters.hasPayment = false;
                                } else {
                                    delete newFilters.hasPayment;
                                }
                                setFilters(newFilters);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Bookings</SelectItem>
                                <SelectItem value="has-payment">Has Payment</SelectItem>
                                <SelectItem value="no-payment">No Payment</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Completion</Label>
                        <Select
                            value={filters.isPaid === true ? 'paid' : filters.isPaid === false ? 'unpaid' : 'all'}
                            onValueChange={(value) => {
                                const newFilters = { ...filters };
                                if (value === 'paid') {
                                    newFilters.isPaid = true;
                                } else if (value === 'unpaid') {
                                    newFilters.isPaid = false;
                                } else {
                                    delete newFilters.isPaid;
                                }
                                setFilters(newFilters);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Payments</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="unpaid">Unpaid</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Sorting */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Sort By</Label>
                        <Select
                            value={filters.sortBy || 'startTime'}
                            onValueChange={(value) => setFilters({ ...filters, sortBy: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="startTime">Start Time</SelectItem>
                                <SelectItem value="createdAt">Created Date</SelectItem>
                                <SelectItem value="user.fullName">User Name</SelectItem>
                                <SelectItem value="court.name">Court Name</SelectItem>
                                <SelectItem value="status">Status</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Sort Direction</Label>
                        <Select
                            value={filters.sortDirection || 'DESC'}
                            onValueChange={(value: 'ASC' | 'DESC') => setFilters({ ...filters, sortDirection: value })}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ASC">Ascending</SelectItem>
                                <SelectItem value="DESC">Descending</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
        );
    };

    const renderActiveFilters = () => {
        if (activeFiltersCount === 0) return null;

        return (
            <div className="flex flex-wrap gap-2 pt-4 border-t">
                {searchQuery && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        Search: "{searchQuery}"
                        <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => setSearchQuery('')} 
                        />
                    </Badge>
                )}
                
                {selectedStatuses.map(status => (
                    <Badge key={status} variant="secondary" className="flex items-center gap-1">
                        Status: {status}
                        <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => handleStatusToggle(status)} 
                        />
                    </Badge>
                ))}
                
                {selectedCourtIds.map(courtId => {
                    const court = courts.find(c => c.id === courtId);
                    return (
                        <Badge key={courtId} variant="secondary" className="flex items-center gap-1">
                            Court: {court?.name || `ID ${courtId}`}
                            <X 
                                className="w-3 h-3 cursor-pointer" 
                                onClick={() => handleCourtToggle(courtId)} 
                            />
                        </Badge>
                    );
                })}
                
                {startDate && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        From: {formatDateOnly(startDate.toISOString())}
                        <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => setStartDate(undefined)} 
                        />
                    </Badge>
                )}
                
                {endDate && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                        To: {formatDateOnly(endDate.toISOString())}
                        <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => setEndDate(undefined)} 
                        />
                    </Badge>
                )}
            </div>
        );
    };

    // ================================
    // 🎨 MAIN RENDER
    // ================================
    
    return (
        <Card className={className}>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Filter className="w-5 h-5" />
                        Booking Filters
                        {activeFiltersCount > 0 && (
                            <Badge variant="secondary">{activeFiltersCount}</Badge>
                        )}
                    </CardTitle>
                    
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={() => setShowAdvanced(!showAdvanced)}
                            variant="outline"
                            size="sm"
                        >
                            {showAdvanced ? 'Simple' : 'Advanced'}
                        </Button>
                        
                        {onExport && (
                            <Button
                                onClick={onExport}
                                variant="outline"
                                size="sm"
                                disabled={isLoading}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>
                        )}
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
                {renderQuickFilters()}
                {renderAdvancedFilters()}
                {renderActiveFilters()}
                
                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t">
                    <Button
                        onClick={clearAllFilters}
                        variant="outline"
                        disabled={isLoading || activeFiltersCount === 0}
                    >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Clear All
                    </Button>
                    
                    <Button
                        onClick={applyFilters}
                        disabled={isLoading}
                        className="min-w-24"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Filtering...
                            </>
                        ) : (
                            <>
                                <Search className="w-4 h-4 mr-2" />
                                Apply Filters
                            </>
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default BookingFilters;