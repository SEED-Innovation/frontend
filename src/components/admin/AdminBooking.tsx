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
    User
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
            
            const response: PaginatedBookingResponse = await bookingService.getAdminBookings(filters);
            
            console.log('✅ REAL Bookings loaded:', response);
            
            setBookings(response.content || []);
            setCurrentPage(response.page || 0);
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
            
            setStats({
                total: statsData.total || 0,
                pending: statsData.pending || 0,
                approved: statsData.approved || 0,
                cancelled: statsData.cancelled || 0,
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
        loadBookings(filters);
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
                            availableUsers={allUsers}
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
    // 🎨 MANAGE BOOKINGS VIEW - REAL DATA ONLY  
    // ================================
    
    const renderManageView = () => (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-32">
                        <BookingFilters
                            onFilterChange={handleFilterChange}
                            onExport={() => setIsExportDialogOpen(true)}
                            isLoading={isLoading}
                            initialFilters={currentFilters}
                        />
                    </div>
                </div>

                {/* Bookings List - REAL DATA ONLY */}
                <div className="lg:col-span-3">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>All Bookings - Database Records</CardTitle>
                                <div className="flex items-center space-x-2">
                                    <Badge variant="secondary">{totalElements} total</Badge>
                                    <Button
                                        onClick={refreshBookings}
                                        variant="outline"
                                        size="sm"
                                        disabled={isRefreshing}
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoading && isInitialLoad ? (
                                <div className="flex flex-col items-center justify-center py-16">
                                    <RefreshCw className="w-12 h-12 animate-spin text-blue-500 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">Loading real bookings from database...</h3>
                                    <p className="text-gray-500">Please wait while we fetch live data</p>
                                </div>
                            ) : bookings.length === 0 ? (
                                <div className="text-center py-16">
                                    <ClipboardList className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                                    <h3 className="text-xl font-medium text-gray-900 mb-3">No bookings found in database</h3>
                                    <p className="text-gray-500 mb-6">
                                        {error 
                                            ? 'Unable to connect to database. Please check your connection.'
                                            : 'No bookings match your current filters or none exist yet.'
                                        }
                                    </p>
                                    {!error && (
                                        <Button onClick={() => setCurrentFilters({ page: 0, size: 20 })}>
                                            Clear Filters
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {bookings.map(booking => (
                                        <BookingCard
                                            key={booking.id}
                                            booking={booking}
                                            onApprove={handleApproveBooking}
                                            onReject={handleRejectBooking}
                                            onCancel={async (id, reason) => { /* TODO: implement cancel logic */ }}
                                            isLoading={isRefreshing}
                                        />
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
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