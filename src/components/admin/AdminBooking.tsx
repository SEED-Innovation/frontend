import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { EnhancedAdminBooking } from './EnhancedAdminBooking';
import ManualBookingForm from './ManualBookingForm';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
    ClipboardList, BarChart3, CheckCircle, Clock, XCircle, AlertTriangle,
    Search, Settings, TrendingUp, DollarSign, Calendar, Filter, Plus,
    Download, RefreshCw, Eye, Users, FileText, Activity, FileSpreadsheet,
    CalendarRange, User, MapPin, Mail, Phone, Building, Award, Crown,
    Sparkles, Zap, PlusCircle
} from 'lucide-react';
import { formatDateTime, formatPrice, calculateDuration } from '@/utils';
import { getStatusColor, getStatusIcon, getPaymentStatusColor } from '@/utils/bookingUtils';
import { bookingService } from '@/services/bookingService';
import { userService } from '@/services/userService';

interface AdminBookingProps {
    className?: string;
}

const AdminBooking: React.FC<AdminBookingProps> = ({ className = '' }) => {
    // ================================
    // 🏗️ STATE MANAGEMENT
    // ================================
    
    const [bookings, setBookings] = useState<any[]>([]);
    const [courts, setCourts] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<'dashboard' | 'manage' | 'analytics' | 'settings'>('manage');

    // ================================
    // 🔄 DATA LOADING
    // ================================

    const loadData = useCallback(async () => {
        console.log('📋 Loading REAL bookings with filters:', {});
        setIsLoading(true);
        setError(null);

        try {
            // Load bookings, stats, and users concurrently
            const [bookingsResponse, statsResponse, usersResponse] = await Promise.all([
                bookingService.getAdminBookings({}),
                bookingService.getBookingStats(),
                userService.getAllUsers()
            ]);

            console.log('✅ REAL Bookings loaded:', bookingsResponse);
            console.log('🔍 Response structure check:', bookingsResponse);

            // Extract bookings array from response
            const bookingsArray = Array.isArray(bookingsResponse) 
                ? bookingsResponse 
                : (bookingsResponse as any)?.data || (bookingsResponse as any)?.bookings || [];

            console.log('📋 Final bookings array:', bookingsArray, 'Length:', bookingsArray.length);

            console.log('✅ REAL Stats loaded:', statsResponse);
            console.log('✅ REAL Users loaded:', usersResponse);

            setBookings(bookingsArray);
            setStats(statsResponse || {});
            setAllUsers(usersResponse || []);

            // Mock courts data - replace with actual court service call
            setCourts([
                { id: 1, name: 'Court 1', hourlyFee: 100 },
                { id: 2, name: 'Court 2', hourlyFee: 120 },
                { id: 3, name: 'Court 3', hourlyFee: 150 }
            ]);

        } catch (err) {
            console.error('❌ Error loading admin booking data:', err);
            setError('Failed to load booking data. Please try again.');
            setBookings([]);
            setStats({});
            setAllUsers([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // ================================
    // 🎯 BOOKING ACTIONS
    // ================================

    const handleApprove = async (bookingId: number) => {
        try {
            await bookingService.approveBooking(bookingId);
            toast.success('Booking approved successfully!');
            loadData(); // Refresh data
        } catch (err) {
            console.error('❌ Error approving booking:', err);
            toast.error('Failed to approve booking. Please try again.');
        }
    };

    const handleReject = async (bookingId: number, reason: string) => {
        try {
            await bookingService.rejectBooking(bookingId, reason);
            toast.success('Booking rejected successfully!');
            loadData(); // Refresh data
        } catch (err) {
            console.error('❌ Error rejecting booking:', err);
            toast.error('Failed to reject booking. Please try again.');
        }
    };

    const handleCancel = async (bookingId: number, reason: string) => {
        try {
            await bookingService.cancelBooking(bookingId, reason);
            toast.success('Booking cancelled successfully!');
            loadData(); // Refresh data
        } catch (err) {
            console.error('❌ Error cancelling booking:', err);
            toast.error('Failed to cancel booking. Please try again.');
        }
    };

    const handleBookingCreated = (newBooking: any) => {
        console.log('✅ New booking created:', newBooking);
        setSuccess('Manual booking created successfully!');
        loadData(); // Refresh data
        
        // Clear success message after 5 seconds
        setTimeout(() => setSuccess(null), 5000);
    };

    // ================================
    // 🎨 VIEW RENDERS
    // ================================

    const renderHeader = () => (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-admin-primary to-admin-accent p-6 text-white shadow-lg mb-6"
        >
            <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-40 translate-x-40" />
            
            <div className="relative z-10 flex items-center justify-between">
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <Crown className="w-6 h-6 text-yellow-300" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold mb-1">Advanced Booking Management</h1>
                            <p className="text-blue-100 text-base font-medium">Complete Tennis Court Administration System</p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
                    >
                        <div className="flex items-center justify-center mb-1">
                            <Activity className="w-5 h-5 text-blue-300 mr-2" />
                            <p className="text-2xl font-bold text-white">{bookings.length}</p>
                        </div>
                        <p className="text-xs text-blue-200 font-medium">Total Bookings</p>
                    </motion.div>
                    
                    <motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="text-center p-3 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20"
                    >
                        <div className="flex items-center justify-center mb-1">
                            <Clock className="w-5 h-5 text-yellow-300 mr-2" />
                            <p className="text-2xl font-bold text-white">{stats.pending || 0}</p>
                        </div>
                        <p className="text-xs text-yellow-200 font-medium">Pending Review</p>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );

    const renderNavigationTabs = () => (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)} className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 p-1.5 bg-gradient-to-r from-admin-surface to-admin-secondary border-2 border-border rounded-xl h-12">
                    <TabsTrigger 
                        value="manage" 
                        className="flex items-center space-x-2 h-9 rounded-lg font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                        <Users className="w-4 h-4" />
                        <span>Manage Bookings</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="analytics" 
                        className="flex items-center space-x-2 h-9 rounded-lg font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                        <TrendingUp className="w-4 h-4" />
                        <span>Analytics</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="dashboard" 
                        className="flex items-center space-x-2 h-9 rounded-lg font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                        <BarChart3 className="w-4 h-4" />
                        <span>Dashboard</span>
                    </TabsTrigger>
                    <TabsTrigger 
                        value="settings" 
                        className="flex items-center space-x-2 h-9 rounded-lg font-medium text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all duration-200"
                    >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="manage" className="space-y-6">
                    {renderManageView()}
                </TabsContent>

                <TabsContent value="analytics" className="space-y-6">
                    {renderAnalyticsView()}
                </TabsContent>

                <TabsContent value="dashboard" className="space-y-6">
                    {renderDashboardView()}
                </TabsContent>

                <TabsContent value="settings" className="space-y-6">
                    {renderSettingsView()}
                </TabsContent>
            </Tabs>
        </motion.div>
    );

    const renderManageView = () => (
        <div className="space-y-6">
            {/* Action Bar with Manual Booking */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-lg bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center text-xl font-bold text-foreground">
                                <PlusCircle className="w-6 h-6 mr-2 text-primary" />
                                Booking Actions & Tools
                            </CardTitle>
                            <Badge className="px-4 py-1 text-sm bg-primary/10 text-primary border-primary/20 font-medium">
                                Professional Tools
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Manual Booking Creation */}
                            <ManualBookingForm
                                onBookingCreated={handleBookingCreated}
                                triggerButton={
                                    <Button className="w-full h-12 bg-gradient-to-r from-primary to-admin-accent hover:from-primary/90 hover:to-admin-accent/90 text-primary-foreground font-medium text-base rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group">
                                        <div className="flex flex-col items-center space-y-1">
                                            <PlusCircle className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                                            <span>Create Manual Booking</span>
                                        </div>
                                    </Button>
                                }
                            />

                            {/* Export Data */}
                            <Button 
                                variant="outline" 
                                className="w-full h-12 border-2 border-admin-accent/30 hover:border-admin-accent hover:bg-admin-accent/5 font-medium text-base rounded-lg group"
                            >
                                <div className="flex flex-col items-center space-y-1">
                                    <Download className="w-5 h-5 text-admin-accent group-hover:scale-110 transition-transform duration-200" />
                                    <span className="text-admin-accent">Export Bookings</span>
                                </div>
                            </Button>

                            {/* Refresh Data */}
                            <Button 
                                onClick={loadData}
                                variant="outline" 
                                className="w-full h-12 border-2 border-status-info/30 hover:border-status-info hover:bg-status-info/5 font-medium text-base rounded-lg group"
                            >
                                <div className="flex flex-col items-center space-y-1">
                                    <RefreshCw className="w-5 h-5 text-status-info group-hover:scale-110 transition-transform duration-200" />
                                    <span className="text-status-info">Refresh Data</span>
                                </div>
                            </Button>

                            {/* Quick Stats */}
                            <div className="p-3 bg-gradient-to-br from-admin-surface to-admin-secondary rounded-lg border border-border">
                                <div className="text-center space-y-1">
                                    <div className="flex items-center justify-center">
                                        <Award className="w-5 h-5 text-primary mr-2" />
                                        <span className="text-xl font-bold text-foreground">{allUsers.length}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium">Total Users</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Booking Table */}
            <EnhancedAdminBooking
                bookings={bookings}
                stats={stats}
                courts={courts}
                isLoading={isLoading}
                onApprove={handleApprove}
                onReject={handleReject}
                onCancel={handleCancel}
                onRefresh={loadData}
            />
        </div>
    );

    const renderAnalyticsView = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Analytics */}
                <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-bold">
                            <DollarSign className="w-7 h-7 mr-3 text-admin-accent" />
                            Revenue Analytics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold text-admin-accent mb-2">
                                <CurrencyDisplay amount={stats.totalRevenue || 0} size="xl" />
                            </div>
                            <p className="text-muted-foreground">Total Revenue</p>
                            <div className="mt-4 text-sm text-muted-foreground">
                                <p>From {stats.approved || 0} approved bookings</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Booking Stats */}
                <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center text-2xl font-bold">
                            <Activity className="w-7 h-7 mr-3 text-primary" />
                            Booking Statistics
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="text-center p-4 bg-status-success/10 rounded-xl">
                                <div className="text-3xl font-bold text-status-success mb-2">{stats.approved || 0}</div>
                                <p className="text-sm text-muted-foreground">Approved</p>
                            </div>
                            <div className="text-center p-4 bg-status-pending/10 rounded-xl">
                                <div className="text-3xl font-bold text-status-pending mb-2">{stats.pending || 0}</div>
                                <p className="text-sm text-muted-foreground">Pending</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderDashboardView = () => (
        <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:shadow-xl transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                                <p className="text-3xl font-bold text-foreground">{bookings.length}</p>
                            </div>
                            <div className="p-3 bg-primary/20 rounded-xl">
                                <Activity className="w-6 h-6 text-primary" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-status-pending/5 to-status-pending/10 hover:shadow-xl transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                                <p className="text-3xl font-bold text-status-pending">{stats.pending || 0}</p>
                            </div>
                            <div className="p-3 bg-status-pending/20 rounded-xl">
                                <Clock className="w-6 h-6 text-status-pending" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-status-success/5 to-status-success/10 hover:shadow-xl transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                                <p className="text-3xl font-bold text-status-success">{stats.approved || 0}</p>
                            </div>
                            <div className="p-3 bg-status-success/20 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-status-success" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-lg bg-gradient-to-br from-admin-accent/5 to-admin-accent/10 hover:shadow-xl transition-shadow duration-200">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Revenue</p>
                                <div className="text-2xl font-bold text-foreground">
                                    <CurrencyDisplay amount={stats.totalRevenue || 0} size="lg" />
                                </div>
                            </div>
                            <div className="p-3 bg-admin-accent/20 rounded-xl">
                                <DollarSign className="w-6 h-6 text-admin-accent" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );

    const renderSettingsView = () => (
        <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-sm">
            <CardHeader>
                <CardTitle className="flex items-center text-2xl font-bold">
                    <Settings className="w-7 h-7 mr-3 text-primary" />
                    Booking Management Settings
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Auto-Approval Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-admin-surface rounded-xl border border-border">
                                <span className="font-medium">Auto-approve trusted users</span>
                                <input type="checkbox" className="rounded w-5 h-5" />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-admin-surface rounded-xl border border-border">
                                <span className="font-medium">Auto-approve off-peak hours</span>
                                <input type="checkbox" className="rounded w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="space-y-6">
                        <h3 className="text-lg font-semibold text-foreground">Notification Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-admin-surface rounded-xl border border-border">
                                <span className="font-medium">Email notifications</span>
                                <input type="checkbox" className="rounded w-5 h-5" defaultChecked />
                            </div>
                            <div className="flex items-center justify-between p-4 bg-admin-surface rounded-xl border border-border">
                                <span className="font-medium">SMS notifications</span>
                                <input type="checkbox" className="rounded w-5 h-5" />
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // ================================
    // 🎨 MAIN RENDER
    // ================================

    return (
        <div className={`min-h-screen bg-gradient-to-br from-admin-surface via-admin-secondary to-admin-surface ${className}`}>
            {/* Enhanced Header */}
            {renderHeader()}

            {/* Success/Error Messages */}
            <AnimatePresence>
                {(success || error) && (
                    <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mb-6"
                    >
                        {success && (
                            <Alert className="bg-status-success/10 border-status-success/20 mb-4">
                                <CheckCircle className="h-5 w-5 text-status-success" />
                                <AlertDescription className="text-status-success font-medium">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}
                        
                        {error && (
                            <Alert className="bg-status-error/10 border-status-error/20 mb-4">
                                <AlertTriangle className="h-5 w-5 text-status-error" />
                                <AlertDescription className="text-status-error font-medium">
                                    {error}
                                </AlertDescription>
                            </Alert>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Enhanced Navigation and Content */}
            {renderNavigationTabs()}
        </div>
    );
};

export default AdminBooking;