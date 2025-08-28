import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Checkbox
} from '@/components/ui/checkbox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ClipboardList,
    BarChart3,
    CheckCircle,
    Clock,
    XCircle,
    AlertTriangle,
    Search,
    Settings,
    TrendingUp,
    DollarSign,
    Calendar,
    Filter,
    Plus,
    Download,
    RefreshCw,
    Eye,
    Users,
    FileText,
    Activity,
    FileSpreadsheet,
    CalendarRange,
    User,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    Edit,
    MoreHorizontal,
    Trash2
} from 'lucide-react';

// Import our components
import BookingFilters from './BookingFilters';
import BookingCard from './BookingCard';
import ManualBookingForm from './ManualBookingForm';

// Import types and services
import { 
    BookingResponse, 
    AdminBookingFilterRequest,
    PaginatedBookingResponse 
} from '@/types/booking';
import { UserResponse } from '@/types/user';
import { bookingService, userService } from '@/services';
import { 
    formatDateTime, 
    formatPrice, 
    calculateTotalPrice,
    calculateDuration 
} from '@/utils';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@radix-ui/react-dropdown-menu';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
interface AdminBookingProps {
    className?: string;
}

interface BookingStats {
    total: number;
    pending: number;
    approved: number;
    cancelled: number;
    rejected: number;
    totalRevenue: number;
    todayBookings: number;
}

interface ExportConfig {
    format: 'csv' | 'excel' | 'pdf';
    dateRange: 'all' | 'today' | 'week' | 'month' | 'custom';
    customStartDate?: string;
    customEndDate?: string;
    includeFields: {
        bookingId: boolean;
        userDetails: boolean;
        courtDetails: boolean;
        timeSlots: boolean;
        status: boolean;
        payment: boolean;
        cancellationDetails: boolean;
        techPolicy: boolean;
    };
    filterByStatus?: string[];
    includeUserStats: boolean;
}

type ViewMode = 'dashboard' | 'manage' | 'analytics' | 'settings';

const AdminBooking: React.FC<AdminBookingProps> = ({ className = "" }) => {
    // ================================
    // 🏗️ STATE MANAGEMENT
    // ================================
    
    // Navigation state
    const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
    
    // Data states
    const [bookings, setBookings] = useState<BookingResponse[]>([]);
    const [allUsers, setAllUsers] = useState<UserResponse[]>([]);
    const [stats, setStats] = useState<BookingStats>({
        total: 0,
        pending: 0,
        approved: 0,
        cancelled: 0,
        rejected: 0,
        totalRevenue: 0,
        todayBookings: 0
    });
    
    // Loading states
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoad, setIsInitialLoad] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);
    
    // Filter and pagination states
    const [currentFilters, setCurrentFilters] = useState<AdminBookingFilterRequest>({ page: 0, size: 20 });
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    
    // UI states
    const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set());
    const [activeTab, setActiveTab] = useState('all');
    const [bulkActionLoading, setBulkActionLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState<string>('');
    
    // Export dialog state
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
    const [exportConfig, setExportConfig] = useState<ExportConfig>({
        format: 'csv',
        dateRange: 'all',
        includeFields: {
            bookingId: true,
            userDetails: true,
            courtDetails: true,
            timeSlots: true,
            status: true,
            payment: false,
            cancellationDetails: false,
            techPolicy: false,
        },
        includeUserStats: false,
    });




    // Add these state variables after your existing state declarations around line 150

// Filter states for the new horizontal filter bar
const [searchTerm, setSearchTerm] = useState<string>('');
const [statusFilter, setStatusFilter] = useState<string>('all');
const [dateFilter, setDateFilter] = useState<string>('all');
const [courtFilter, setCourtFilter] = useState<string>('all');

// Pagination states
const [pageSize, setPageSize] = useState<number>(20);

// Derived states for filtering and pagination
const [availableCourts] = useState([
    { id: 1, name: 'Court 1' },
    { id: 2, name: 'Court 2' },
    { id: 3, name: 'Court 3' },
    { id: 4, name: 'Court 4' },
    { id: 5, name: 'Court 5' }
]);

// Add these helper functions after your existing event handlers around line 300

// Filter function
const filteredBookings = bookings.filter(booking => {
    // Search filter
    if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
            booking.user.fullName.toLowerCase().includes(searchLower) ||
            booking.user.email.toLowerCase().includes(searchLower) ||
            booking.court.name.toLowerCase().includes(searchLower) ||
            booking.id.toString().includes(searchLower);
        if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && booking.status !== statusFilter) {
        return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
        const bookingDate = new Date(booking.startTime);
        const now = new Date();
        
        switch (dateFilter) {
            case 'today':
                if (!isSameDay(bookingDate, now)) return false;
                break;
            case 'week':
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                if (bookingDate < weekAgo) return false;
                break;
            case 'month':
                if (bookingDate.getMonth() !== now.getMonth() || 
                    bookingDate.getFullYear() !== now.getFullYear()) return false;
                break;
        }
    }

    // Court filter
    if (courtFilter !== 'all' && booking.court.id.toString() !== courtFilter) {
        return false;
    }

    return true;
});

// Pagination function
const paginatedBookings = filteredBookings.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize
);

// Helper functions
const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
};

const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setDateFilter('all');
    setCourtFilter('all');
    setCurrentPage(0);
};

const handleCancelBooking = async (bookingId: number, reason: string) => {
    try {
        console.log('⏹️ Cancelling REAL booking:', bookingId, 'Reason:', reason);
        
        await bookingService.cancelBooking(bookingId, reason);
        
        setSuccess('Booking cancelled successfully!');
        refreshBookings();
        
        setTimeout(() => setSuccess(''), 3000);
        
    } catch (error) {
        console.error('❌ Failed to cancel booking:', error);
        setError(error instanceof Error ? error.message : 'Failed to cancel booking');
    }
};

// Update the useEffect to handle pagination changes
useEffect(() => {
    const newTotalPages = Math.ceil(filteredBookings.length / pageSize);
    setTotalPages(newTotalPages);
    
    // Reset to first page if current page is beyond new total
    if (currentPage >= newTotalPages && newTotalPages > 0) {
        setCurrentPage(0);
    }
}, [filteredBookings.length, pageSize, currentPage]);

// Update the Table import at the top








    // ================================
    // 🔄 EFFECTS
    // ================================
    
    useEffect(() => {
        loadBookings();
        loadStats();
        loadAllUsers();
    }, []);

    // ================================
    // 🔧 DATA LOADING FUNCTIONS - REAL DATA ONLY
    // ================================
    
    const loadBookings = useCallback(async (filters: AdminBookingFilterRequest = currentFilters) => {
        if (isInitialLoad) {
            setIsLoading(true);
        } else {
            setIsRefreshing(true);
        }
        
        setError('');
        
        try {
            console.log('📋 Loading REAL bookings with filters:', filters);
            
            const response: any = await bookingService.getAdminBookings(filters);
            
            console.log('✅ REAL Bookings loaded:', response);
            console.log('🔍 Response structure check:', {
                hasBookings: !!response.bookings,
                hasContent: !!response.content,
                bookingsLength: response.bookings?.length,
                contentLength: response.content?.length
            });
            
            // Handle both possible response structures
            const bookingsArray = response.bookings || response.content || [];
            console.log('📋 Final bookings array:', bookingsArray, 'Length:', bookingsArray.length);
            
            // Sort bookings by startTime in descending order (newest first)
            const sortedBookings = bookingsArray.sort((a: any, b: any) => 
                new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
            );
            
            setBookings(sortedBookings);
            setCurrentPage(response.currentPage || response.page || 0);
            setTotalPages(response.totalPages || 0);
            setTotalElements(response.totalElements || 0);
            setCurrentFilters(filters);
            
        } catch (error) {
            console.error('❌ Failed to load REAL bookings:', error);
            setError(error instanceof Error ? error.message : 'Failed to load bookings from database');
            
            setBookings([]);
            setTotalElements(0);
            setTotalPages(0);
            setCurrentPage(0);
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsInitialLoad(false);
        }
    }, [currentFilters, isInitialLoad]);

    const loadStats = async () => {
        try {
            console.log('📊 Loading REAL booking statistics...');
            
            const statsData = await bookingService.getBookingStats();
            
            console.log('✅ REAL Stats loaded:', statsData);
            
            // Handle both old and new stat formats from backend
            setStats({
                total: statsData.total || statsData.totalBookings || 0,
                pending: statsData.pending || statsData.pendingBookings || 0,
                approved: statsData.approved || statsData.confirmedBookings || 0,
                cancelled: statsData.cancelled || statsData.cancelledBookings || 0,
                rejected: statsData.rejected || 0,
                totalRevenue: statsData.totalRevenue || 0,
                todayBookings: statsData.todayBookings || 0
            });            
        } catch (error) {
            console.error('❌ Failed to load REAL stats:', error);
            setError('Failed to load statistics from database');
            
            setStats({
                total: 0,
                pending: 0,
                approved: 0,
                cancelled: 0,
                rejected: 0,
                totalRevenue: 0,
                todayBookings: 0
            });
        }
    };

    const loadAllUsers = async () => {
        setIsLoadingUsers(true);
        try {
            console.log('👥 Loading REAL users from database...');
            
            const users = await userService.getAllUsers();
            
            console.log('✅ REAL Users loaded:', users);
            
            setAllUsers(users || []);
        } catch (error) {
            console.error('❌ Failed to load REAL users:', error);
            setAllUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const refreshBookings = () => {
        loadBookings(currentFilters);
        loadStats();
    };

    // ================================
    // 🎯 EVENT HANDLERS
    // ================================
    
    const handleFilterChange = (filters: AdminBookingFilterRequest) => {
        console.log('🔍 Filters changed:', filters);
        setCurrentFilters(filters);
        loadBookings(filters);
    };

    // Handle search term change with API call
    const handleSearchChange = async (searchTerm: string) => {
        setSearchTerm(searchTerm);
        
        if (searchTerm.trim()) {
            // Use real backend search
            try {
                const searchResults = await bookingService.searchBookings(searchTerm, 0, pageSize);
                setBookings(searchResults);
                console.log('🔍 Search results:', searchResults);
            } catch (error) {
                console.error('❌ Search failed:', error);
                setError('Search failed');
            }
        } else {
            // If search is cleared, reload regular bookings
            loadBookings(currentFilters);
        }
    };

    const handleApproveBooking = async (bookingId: number, reason?: string) => {
        try {
            console.log('✅ Approving REAL booking:', bookingId);
            
            await bookingService.approveBooking(bookingId, reason);
            
            setSuccess('Booking approved successfully!');
            refreshBookings();
            
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (error) {
            console.error('❌ Failed to approve booking:', error);
            setError(error instanceof Error ? error.message : 'Failed to approve booking');
        }
    };

    const handleRejectBooking = async (bookingId: number, reason: string) => {
        try {
            console.log('❌ Rejecting REAL booking:', bookingId, 'Reason:', reason);
            
            await bookingService.rejectBooking(bookingId, reason);
            
            setSuccess('Booking rejected successfully!');
            refreshBookings();
            
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (error) {
            console.error('❌ Failed to reject booking:', error);
            setError(error instanceof Error ? error.message : 'Failed to reject booking');
        }
    };

    const handleManualBookingCreated = (newBooking: BookingResponse) => {
        console.log('📝 REAL manual booking created:', newBooking);
        
        setSuccess('Manual booking created successfully!');
        refreshBookings();
        
        setTimeout(() => setSuccess(''), 3000);
    };

    // Handle bulk actions
    const handleBulkAction = async (action: 'APPROVE' | 'REJECT' | 'CANCEL', reason?: string) => {
        if (selectedBookings.size === 0) {
            setError('Please select bookings to perform bulk action');
            return;
        }

        try {
            const bookingIds = Array.from(selectedBookings);
            console.log(`📦 Performing bulk ${action} on bookings:`, bookingIds);
            
            await bookingService.bulkBookingAction(bookingIds, action, reason);
            
            setSuccess(`Bulk ${action.toLowerCase()} completed successfully!`);
            setSelectedBookings(new Set()); // Clear selection
            refreshBookings();
            
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (error) {
            console.error(`❌ Bulk ${action} failed:`, error);
            setError(`Failed to perform bulk ${action.toLowerCase()}`);
        }
    };

    // ================================
    // 🔧 ADVANCED EXPORT FUNCTIONS
    // ================================
    
    const handleExportBookings = async () => {
        setIsExporting(true);
        
        try {
            console.log('📥 Exporting REAL bookings with config:', exportConfig);
            
            // Build export filters based on config
            const exportFilters: AdminBookingFilterRequest & { 
                format: string;
                includeFields: string[];
                includeUserStats: boolean;
            } = {
                ...currentFilters,
                format: exportConfig.format,
                includeFields: Object.entries(exportConfig.includeFields)
                    .filter(([_, included]) => included)
                    .map(([field, _]) => field),
                includeUserStats: exportConfig.includeUserStats,
            };

            // Add date range filters
            if (exportConfig.dateRange !== 'all') {
                const now = new Date();
                let startDate: Date;
                
                switch (exportConfig.dateRange) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        exportFilters.startDate = startDate.toISOString();
                        exportFilters.endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000).toISOString();
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        exportFilters.startDate = startDate.toISOString();
                        exportFilters.endDate = now.toISOString();
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        exportFilters.startDate = startDate.toISOString();
                        exportFilters.endDate = now.toISOString();
                        break;
                    case 'custom':
                        if (exportConfig.customStartDate) {
                            exportFilters.startDate = exportConfig.customStartDate;
                        }
                        if (exportConfig.customEndDate) {
                            exportFilters.endDate = exportConfig.customEndDate;
                        }
                        break;
                }
            }

            // Add status filters
            if (exportConfig.filterByStatus && exportConfig.filterByStatus.length > 0) {
                exportFilters.statuses = exportConfig.filterByStatus;
            }
            
            await bookingService.exportBookings(exportFilters);
            
            setSuccess(`Bookings exported successfully as ${exportConfig.format.toUpperCase()}!`);
            setIsExportDialogOpen(false);
            
            setTimeout(() => setSuccess(''), 3000);
            
        } catch (error) {
            console.error('❌ Failed to export bookings:', error);
            setError('Failed to export bookings');
        } finally {
            setIsExporting(false);
        }
    };

    const updateExportField = (field: keyof ExportConfig['includeFields'], value: boolean) => {
        setExportConfig(prev => ({
            ...prev,
            includeFields: {
                ...prev.includeFields,
                [field]: value
            }
        }));
    };

    // ================================
    // 🎨 EXPORT DIALOG COMPONENT
    // ================================
    
    const renderExportDialog = () => (
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
            <DialogTrigger asChild>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                        <Download className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Export Data</h3>
                        <p className="text-gray-500 text-sm">Download comprehensive booking reports</p>
                    </CardContent>
                </Card>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <FileSpreadsheet className="w-6 h-6 mr-2 text-purple-600" />
                        Advanced Export Configuration
                    </DialogTitle>
                    <DialogDescription>
                        Configure your export settings to generate detailed booking reports with custom data fields.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6">
                    {/* Export Format */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Export Format</h4>
                        <Select 
                            value={exportConfig.format} 
                            onValueChange={(value: 'csv' | 'excel' | 'pdf') => 
                                setExportConfig(prev => ({ ...prev, format: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV (Comma Separated Values)</SelectItem>
                                <SelectItem value="excel">Excel Spreadsheet (.xlsx)</SelectItem>
                                <SelectItem value="pdf">PDF Report</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-4">
                        <h4 className="font-semibold text-gray-900">Date Range</h4>
                        <Select 
                            value={exportConfig.dateRange} 
                            onValueChange={(value: any) => 
                                setExportConfig(prev => ({ ...prev, dateRange: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">Last 7 Days</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="custom">Custom Range</SelectItem>
                            </SelectContent>
                        </Select>

                        {exportConfig.dateRange === 'custom' && (
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm text-gray-600">Start Date</label>
                                    <Input
                                        type="date"
                                        value={exportConfig.customStartDate || ''}
                                        onChange={(e) => setExportConfig(prev => ({ 
                                            ...prev, 
                                            customStartDate: e.target.value 
                                        }))}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-600">End Date</label>
                                    <Input
                                        type="date"
                                        value={exportConfig.customEndDate || ''}
                                        onChange={(e) => setExportConfig(prev => ({ 
                                            ...prev, 
                                            customEndDate: e.target.value 
                                        }))}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Include Fields */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold text-gray-900">Include Data Fields</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="bookingId"
                                    checked={exportConfig.includeFields.bookingId}
                                    onCheckedChange={(checked) => updateExportField('bookingId', !!checked)}
                                />
                                <label htmlFor="bookingId" className="text-sm">Booking ID</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="userDetails"
                                    checked={exportConfig.includeFields.userDetails}
                                    onCheckedChange={(checked) => updateExportField('userDetails', !!checked)}
                                />
                                <label htmlFor="userDetails" className="text-sm">User Details</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="courtDetails"
                                    checked={exportConfig.includeFields.courtDetails}
                                    onCheckedChange={(checked) => updateExportField('courtDetails', !!checked)}
                                />
                                <label htmlFor="courtDetails" className="text-sm">Court Details</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="timeSlots"
                                    checked={exportConfig.includeFields.timeSlots}
                                    onCheckedChange={(checked) => updateExportField('timeSlots', !!checked)}
                                />
                                <label htmlFor="timeSlots" className="text-sm">Time Slots</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="status"
                                    checked={exportConfig.includeFields.status}
                                    onCheckedChange={(checked) => updateExportField('status', !!checked)}
                                />
                                <label htmlFor="status" className="text-sm">Status</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="payment"
                                    checked={exportConfig.includeFields.payment}
                                    onCheckedChange={(checked) => updateExportField('payment', !!checked)}
                                />
                                <label htmlFor="payment" className="text-sm">Payment Info</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="cancellationDetails"
                                    checked={exportConfig.includeFields.cancellationDetails}
                                    onCheckedChange={(checked) => updateExportField('cancellationDetails', !!checked)}
                                />
                                <label htmlFor="cancellationDetails" className="text-sm">Cancellation Details</label>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="techPolicy"
                                    checked={exportConfig.includeFields.techPolicy}
                                    onCheckedChange={(checked) => updateExportField('techPolicy', !!checked)}
                                />
                                <label htmlFor="techPolicy" className="text-sm">Tech Policy</label>
                            </div>
                        </div>
                    </div>

                    {/* Additional Options */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold text-gray-900">Additional Options</h4>
                        <div className="flex items-center space-x-2">
                            <Checkbox
                                id="includeUserStats"
                                checked={exportConfig.includeUserStats}
                                onCheckedChange={(checked) => setExportConfig(prev => ({ 
                                    ...prev, 
                                    includeUserStats: !!checked 
                                }))}
                            />
                            <label htmlFor="includeUserStats" className="text-sm">
                                Include User Statistics (rank, points, badges)
                            </label>
                        </div>
                    </div>

                    {/* Status Filters */}
                    <div className="md:col-span-2 space-y-4">
                        <h4 className="font-semibold text-gray-900">Filter by Status (Optional)</h4>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {['PENDING', 'APPROVED', 'CANCELLED', 'REJECTED'].map(status => (
                                <div key={status} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={status}
                                        checked={exportConfig.filterByStatus?.includes(status) || false}
                                        onCheckedChange={(checked) => {
                                            setExportConfig(prev => ({
                                                ...prev,
                                                filterByStatus: checked 
                                                    ? [...(prev.filterByStatus || []), status]
                                                    : (prev.filterByStatus || []).filter(s => s !== status)
                                            }));
                                        }}
                                    />
                                    <label htmlFor={status} className="text-sm capitalize">
                                        {status.toLowerCase()}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => setIsExportDialogOpen(false)}
                        disabled={isExporting}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleExportBookings}
                        disabled={isExporting}
                        className="bg-purple-600 hover:bg-purple-700"
                    >
                        {isExporting ? (
                            <>
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                Generating {exportConfig.format.toUpperCase()}...
                            </>
                        ) : (
                            <>
                                <Download className="w-4 h-4 mr-2" />
                                Export as {exportConfig.format.toUpperCase()}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

    // ================================
    // 🎨 NAVIGATION & HEADER
    // ================================
    
    const renderHeader = () => (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo & Title */}
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                            <ClipboardList className="w-8 h-8 text-blue-600 mr-3" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
                                <p className="text-sm text-gray-500 flex items-center">
                                    Admin Dashboard - Live Data 
                                    {isLoadingUsers && (
                                        <span className="ml-2 flex items-center text-blue-600">
                                            <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                            Loading users...
                                        </span>
                                    )}
                                    {allUsers.length > 0 && (
                                        <Badge variant="secondary" className="ml-2">
                                            {allUsers.length} users loaded
                                        </Badge>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-3">
                        {isRefreshing && (
                            <div className="flex items-center text-blue-600">
                                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                                <span className="text-sm">Syncing with Database...</span>
                            </div>
                        )}
                        
                        <Button
                            onClick={refreshBookings}
                            variant="outline"
                            size="sm"
                            disabled={isRefreshing}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Refresh Data
                        </Button>
                        
                        <ManualBookingForm
                            onBookingCreated={handleManualBookingCreated}
                            triggerButton={
                                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                                    <Plus className="w-4 h-4 mr-2" />
                                    New Booking
                                </Button>
                            }
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNavigation = () => (
        <div className="bg-gray-50 border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-6">
                <nav className="flex space-x-8">
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            currentView === 'dashboard'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <BarChart3 className="w-4 h-4 inline mr-2" />
                        Dashboard
                    </button>
                    <button
                        onClick={() => setCurrentView('manage')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            currentView === 'manage'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <ClipboardList className="w-4 h-4 inline mr-2" />
                        Manage Bookings
                    </button>
                    <button
                        onClick={() => setCurrentView('analytics')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            currentView === 'analytics'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Activity className="w-4 h-4 inline mr-2" />
                        Analytics
                    </button>
                    <button
                        onClick={() => setCurrentView('settings')}
                        className={`py-4 px-1 border-b-2 font-medium text-sm ${
                            currentView === 'settings'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <Settings className="w-4 h-4 inline mr-2" />
                        Settings
                    </button>
                </nav>
            </div>
        </div>
    );

    // ================================
    // 🎨 DASHBOARD VIEW - REAL DATA ONLY
    // ================================
    
    const renderDashboardView = () => (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
            {/* Quick Stats - REAL DATA */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-sm">Total Bookings</p>
                                <p className="text-3xl font-bold">{stats.total}</p>
                                <p className="text-xs text-blue-200 mt-1">Live from Database</p>
                            </div>
                            <ClipboardList className="w-10 h-10 text-blue-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-yellow-100 text-sm">Pending</p>
                                <p className="text-3xl font-bold">{stats.pending}</p>
                                <p className="text-xs text-yellow-200 mt-1">Needs Approval</p>
                            </div>
                            <Clock className="w-10 h-10 text-yellow-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Revenue</p>
                                <p className="text-3xl font-bold">{formatPrice(stats.totalRevenue)}</p>
                                <p className="text-xs text-green-200 mt-1">Real Revenue</p>
                            </div>
                            <DollarSign className="w-10 h-10 text-green-200" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Total Users</p>
                                <p className="text-3xl font-bold">{allUsers.length}</p>
                                <p className="text-xs text-purple-200 mt-1">Registered Users</p>
                            </div>
                            <Users className="w-10 h-10 text-purple-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('manage')}>
                    <CardContent className="p-6 text-center">
                        <Eye className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">View All Bookings</h3>
                        <p className="text-gray-500 text-sm">Manage and review all court bookings</p>
                    </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('manage')}>
                    <CardContent className="p-6 text-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pending Approvals</h3>
                        <p className="text-gray-500 text-sm">{stats.pending} bookings need approval</p>
                        <Badge variant="secondary" className="mt-2">{stats.pending}</Badge>
                    </CardContent>
                </Card>

                {/* Advanced Export Dialog Trigger */}
                {renderExportDialog()}

                <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setCurrentView('analytics')}>
                    <CardContent className="p-6 text-center">
                        <BarChart3 className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics</h3>
                        <p className="text-gray-500 text-sm">View detailed statistics</p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity - REAL DATA ONLY */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <Activity className="w-5 h-5 mr-2" />
                        Recent Activity - Live Data
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {bookings.length === 0 ? (
                        <div className="text-center py-8">
                            <ClipboardList className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Activity</h3>
                            <p className="text-gray-500">No bookings found in the database yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {bookings.slice(0, 5).map(booking => (
                                <div key={booking.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${
                                            booking.status === 'PENDING' ? 'bg-yellow-500' :
                                            booking.status === 'APPROVED' ? 'bg-green-500' :
                                            booking.status === 'CANCELLED' ? 'bg-red-500' : 'bg-gray-500'
                                        }`} />
                                        <div>
                                            <p className="font-medium">{booking.user.fullName}</p>
                                            <p className="text-sm text-gray-500">{booking.court.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge variant={
                                            booking.status === 'PENDING' ? 'secondary' :
                                            booking.status === 'APPROVED' ? 'default' : 'destructive'
                                        }>
                                            {booking.status}
                                        </Badge>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatDateTime(booking.startTime)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );

    // ================================
// 🎨 PROFESSIONAL ADMIN BOOKING MANAGEMENT - TABLE VIEW
// ================================

const renderManageView = () => (
    <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Professional Horizontal Filter Bar */}
        <Card className="shadow-md mb-6">
            <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search Input */}
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by user, court, or booking ID..."
                                className="pl-10 h-10"
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-40 h-10">
                            <SelectValue placeholder="All Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="APPROVED">Approved</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Date Range */}
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                        <SelectTrigger className="w-40 h-10">
                            <SelectValue placeholder="Date Range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Dates</SelectItem>
                            <SelectItem value="today">Today</SelectItem>
                            <SelectItem value="week">This Week</SelectItem>
                            <SelectItem value="month">This Month</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Court Filter */}
                    <Select value={courtFilter} onValueChange={setCourtFilter}>
                        <SelectTrigger className="w-40 h-10">
                            <SelectValue placeholder="All Courts" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Courts</SelectItem>
                            {availableCourts.map(court => (
                                <SelectItem key={court.id} value={court.id.toString()}>
                                    {court.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className="h-10"
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsExportDialogOpen(true)}
                            className="h-10"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </Button>
                        <Button
                            onClick={refreshBookings}
                            variant="outline"
                            size="sm"
                            disabled={isRefreshing}
                            className="h-10"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Active Filters Display */}
                {(statusFilter !== 'all' || dateFilter !== 'all' || courtFilter !== 'all' || searchTerm) && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                        <span className="text-sm text-gray-500">Active filters:</span>
                        {statusFilter !== 'all' && (
                            <Badge variant="secondary" className="text-xs">
                                Status: {statusFilter}
                            </Badge>
                        )}
                        {dateFilter !== 'all' && (
                            <Badge variant="secondary" className="text-xs">
                                Date: {dateFilter}
                            </Badge>
                        )}
                        {courtFilter !== 'all' && (
                            <Badge variant="secondary" className="text-xs">
                                Court: {availableCourts.find(c => c.id.toString() === courtFilter)?.name}
                            </Badge>
                        )}
                        {searchTerm && (
                            <Badge variant="secondary" className="text-xs">
                                Search: "{searchTerm}"
                            </Badge>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Professional Data Table */}
        <Card className="shadow-md">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <ClipboardList className="w-6 h-6 text-blue-600" />
                        <div>
                            <CardTitle className="text-xl">Booking Management</CardTitle>
                            <p className="text-sm text-gray-500 mt-1">
                                Showing {Math.min((currentPage * pageSize) + 1, totalElements)} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} bookings
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="px-3 py-1">
                            {filteredBookings.length} filtered
                        </Badge>
                        <Badge variant="secondary" className="px-3 py-1">
                            {totalElements} total
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            
            <CardContent className="p-0">
                {isLoading && isInitialLoad ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Loading bookings...</h3>
                        <p className="text-gray-500">Fetching data from database</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-20 px-6">
                        <ClipboardList className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-medium text-gray-900 mb-3">No bookings found</h3>
                        <p className="text-gray-500 mb-6">No bookings match your current filters</p>
                        <Button onClick={clearFilters} variant="outline">
                            Clear Filters
                        </Button>
                    </div>
                ) : (
                    <>
                        {/* Table */}
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead className="font-semibold text-gray-900">Booking & User</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Court & Time</TableHead>
                                        <TableHead className="font-semibold text-gray-900">Status & Amount</TableHead>
                                        <TableHead className="font-semibold text-gray-900 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedBookings.map((booking) => {
                                        const bookingDate = new Date(booking.startTime);
                                        const dayOfWeek = bookingDate.getDay();
                                        const isSaudiWeekend = dayOfWeek === 5 || dayOfWeek === 6;
                                        const duration = calculateDuration(booking.startTime, booking.endTime);
                                        const totalAmount = duration * booking.court.hourlyFee;

                                        return (
                                            <TableRow key={booking.id} className="hover:bg-gray-50">
                                                {/* Booking & User Column */}
                                                <TableCell className="py-4">
                                                    <div className="flex items-start space-x-3">
                                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                            {booking.user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="font-medium text-gray-900 truncate">
                                                                {booking.user.fullName}
                                                            </p>
                                                            <p className="text-sm text-gray-500 truncate">
                                                                {booking.user.email}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                Booking #{booking.id}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Court & Time Column */}
                                                <TableCell className="py-4">
                                                    <div className="space-y-1">
                                                        <p className="font-medium text-gray-900">
                                                            {booking.court.name}
                                                        </p>
                                                        <p className="text-sm text-gray-600">
                                                            {formatDateTime(booking.startTime)}
                                                        </p>
                                                        <p className="text-sm text-gray-500">
                                                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                        </p>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <Badge variant="outline" className="text-xs">
                                                                {booking.matchType || 'SINGLE'}
                                                            </Badge>
                                                            {isSaudiWeekend && (
                                                                <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                                                    {dayOfWeek === 5 ? 'Friday' : 'Saturday'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </TableCell>

                                                {/* Status & Amount Column */}
                                                <TableCell className="py-4">
                                                    <div className="space-y-2">
                                                        <Badge 
                                                            variant={
                                                                booking.status === 'PENDING' ? 'secondary' :
                                                                booking.status === 'APPROVED' ? 'default' : 
                                                                'destructive'
                                                            }
                                                            className="inline-block"
                                                        >
                                                            {booking.status}
                                                        </Badge>
                                                        <div className="space-y-1">
                                                            <p className="text-sm font-medium text-gray-900">
                                                                {formatPrice(totalAmount)}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {duration ? duration.toFixed(1) : '0.0'}h × {formatPrice(booking.court.hourlyFee || 0)}/h
                                                            </p>
                                                        </div>
                                                        {booking.payment && (
                                                            <Badge 
                                                                variant={booking.payment.status === 'COMPLETED' ? 'default' : 'secondary'}
                                                                className="text-xs"
                                                            >
                                                                {booking.payment.status}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </TableCell>

                                                {/* Actions Column */}
                                                <TableCell className="py-4 text-right">
                                                    <div className="flex items-center justify-end space-x-1">
                                                        {booking.status === 'PENDING' && (
                                                            <>
                                                                <Button
                                                                    onClick={() => handleApproveBooking(booking.id)}
                                                                    size="sm"
                                                                    className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                                                                >
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    onClick={() => handleRejectBooking(booking.id, 'Admin rejection')}
                                                                    variant="destructive"
                                                                    size="sm"
                                                                    className="h-8 px-3"
                                                                >
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        
                                                        {(booking.status === 'APPROVED' || booking.status === 'PENDING') && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                className="h-8 px-3 text-gray-600"
                                                                onClick={() => handleCancelBooking(booking.id, 'Admin cancellation')}
                                                            >
                                                                <XCircle className="w-3 h-3 mr-1" />
                                                                Cancel
                                                            </Button>
                                                        )}

                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                                    <MoreHorizontal className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Details
                                                                </DropdownMenuItem>
                                                                <DropdownMenuItem>
                                                                    <Edit className="w-4 h-4 mr-2" />
                                                                    Edit Booking
                                                                </DropdownMenuItem>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem className="text-red-600">
                                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Professional Pagination */}
                        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-2">
                                    <span className="text-sm text-gray-700">Rows per page:</span>
                                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                                        <SelectTrigger className="w-20 h-8">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="20">20</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                            <SelectItem value="100">100</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <span className="text-sm text-gray-700">
                                    Showing {Math.min((currentPage * pageSize) + 1, totalElements)} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} results
                                </span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(0)}
                                    disabled={currentPage === 0}
                                    className="h-8"
                                >
                                    <ChevronsLeft className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                    disabled={currentPage === 0}
                                    className="h-8"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </Button>
                                
                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const pageNum = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                        return (
                                            <Button
                                                key={pageNum}
                                                variant={pageNum === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setCurrentPage(pageNum)}
                                                className="h-8 w-8"
                                            >
                                                {pageNum + 1}
                                            </Button>
                                        );
                                    })}
                                </div>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                    disabled={currentPage >= totalPages - 1}
                                    className="h-8"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(totalPages - 1)}
                                    disabled={currentPage >= totalPages - 1}
                                    className="h-8"
                                >
                                    <ChevronsRight className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    </div>
);

    // ================================
    // 🎨 ANALYTICS VIEW - REAL DATA ONLY
    // ================================
    
    const renderAnalyticsView = () => (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Booking Status Distribution - Live Data</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {stats.total === 0 ? (
                            <div className="text-center py-8">
                                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No data available for analytics</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Approved</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-green-500 h-2 rounded-full" 
                                                style={{ width: `${stats.total ? (stats.approved / stats.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">{stats.approved}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Pending</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-yellow-500 h-2 rounded-full" 
                                                style={{ width: `${stats.total ? (stats.pending / stats.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">{stats.pending}</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm">Cancelled</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div 
                                                className="bg-red-500 h-2 rounded-full" 
                                                style={{ width: `${stats.total ? (stats.cancelled / stats.total) * 100 : 0}%` }}
                                            />
                                        </div>
                                        <span className="text-sm font-medium">{stats.cancelled}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>User & Revenue Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-green-600 mb-2">
                                {formatPrice(stats.totalRevenue)}
                            </div>
                            <p className="text-gray-500">Total Revenue from Database</p>
                            <div className="mt-4 text-sm text-gray-600">
                                <p>From {stats.approved} approved bookings</p>
                            </div>
                        </div>
                        
                        <div className="border-t pt-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-purple-600 mb-2">
                                    {allUsers.length}
                                </div>
                                <p className="text-gray-500">Total Registered Users</p>
                                <div className="mt-2 text-sm text-gray-600">
                                    <p>{allUsers.filter(u => u.enabled).length} active users</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    // ================================
    // 🎨 SETTINGS VIEW
    // ================================
    
    const renderSettingsView = () => (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Booking Management Settings</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Auto-Approval Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Auto-approve trusted users</span>
                                    <input type="checkbox" className="rounded" />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>Auto-approve off-peak hours</span>
                                    <input type="checkbox" className="rounded" />
                                </div>
                            </div>
                        </div>
                        
                        <div>
                            <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span>Email notifications</span>
                                    <input type="checkbox" className="rounded" defaultChecked />
                                </div>
                                <div className="flex items-center justify-between">
                                    <span>SMS notifications</span>
                                    <input type="checkbox" className="rounded" />
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );

    // ================================
    // 🎨 MAIN RENDER
    // ================================
    
    const renderCurrentView = () => {
        switch (currentView) {
            case 'dashboard':
                return renderDashboardView();
            case 'manage':
                return renderManageView();
            case 'analytics':
                return renderAnalyticsView();
            case 'settings':
                return renderSettingsView();
            default:
                return renderDashboardView();
        }
    };

    return (
        <div className={`min-h-screen bg-gray-50 ${className}`}>
            {/* Header */}
            {renderHeader()}

            {/* Navigation */}
            {renderNavigation()}

            {/* Success/Error Messages */}
            {(success || error) && (
                <div className="max-w-7xl mx-auto px-6 py-4">
                    {success && (
                        <Alert className="bg-green-50 border-green-200 mb-4">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {success}
                            </AlertDescription>
                        </Alert>
                    )}
                    
                    {error && (
                        <Alert className="bg-red-50 border-red-200 mb-4">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}
                </div>
            )}

            {/* Current View */}
            {renderCurrentView()}
        </div>
    );
};

export default AdminBooking;