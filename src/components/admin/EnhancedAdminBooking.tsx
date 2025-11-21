import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { format } from 'date-fns';
import {
    CalendarIcon, Clock, Users, MapPin, Filter, RefreshCw,
    CheckCircle, XCircle,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    TrendingUp, Activity, Crown, Sparkles, Building2,
    Mail, Phone, AlertCircle, Award, Zap, Receipt
} from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import FeeBreakdown from './FeeBreakdown';
import { useTranslation } from 'react-i18next';

import { formatDateTime, calculateDuration } from '@/utils';
import { getStatusColor, getStatusIcon } from '@/utils/bookingUtils';

interface EnhancedAdminBookingProps {
    bookings: any[];
    stats: any;
    courts: any[];
    isLoading: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
    onCancel: (id: number, reason: string) => void;
    onRefresh: () => void;
}

export const EnhancedAdminBooking: React.FC<EnhancedAdminBookingProps> = ({
    bookings, stats, courts, isLoading, onApprove, onReject, onCancel, onRefresh
}) => {
    const { t } = useTranslation('admin');

    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [courtFilter, setCourtFilter] = useState('all');
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10); // Default to 10 for better UX
    const [virtualizedRows, setVirtualizedRows] = useState(100); // Virtual scrolling threshold

    // Enhanced filtering logic
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesSearch = true;

            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            const matchesCourt = courtFilter === 'all' || booking.court?.id?.toString() === courtFilter;

            // Enhanced date filtering with better logic
            const matchesDate = (() => {
                if (!startDate && !endDate) return true;

                try {
                    const bookingDate = new Date(booking.startTime);
                    if (isNaN(bookingDate.getTime())) return false;

                    // Reset time to start of day for accurate comparison
                    const bookingDateOnly = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());

                    let startDateOnly = null;
                    let endDateOnly = null;

                    if (startDate) {
                        startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                    }

                    if (endDate) {
                        endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
                        endDateOnly.setHours(23, 59, 59, 999); // End of day
                    }

                    const isAfterStart = !startDateOnly || bookingDateOnly >= startDateOnly;
                    const isBeforeEnd = !endDateOnly || bookingDateOnly <= endDateOnly;

                    return isAfterStart && isBeforeEnd;
                } catch (error) {
                    console.error('Date filtering error:', error);
                    return false;
                }
            })();

            return matchesSearch && matchesStatus && matchesCourt && matchesDate;
        });
    }, [bookings, statusFilter, courtFilter, startDate, endDate]);

    // Smart pagination with virtual scrolling for large datasets
    const paginatedBookings = useMemo(() => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;

        // For large datasets (>1000), implement virtual scrolling
        if (filteredBookings.length > 1000) {
            // Only render visible items + buffer
            const bufferSize = 20;
            const visibleStart = Math.max(0, startIndex - bufferSize);
            const visibleEnd = Math.min(filteredBookings.length, endIndex + bufferSize);

            return {
                items: filteredBookings.slice(visibleStart, visibleEnd),
                startIndex: visibleStart,
                endIndex: visibleEnd,
                isVirtualized: true
            };
        }

        return {
            items: filteredBookings.slice(startIndex, endIndex),
            startIndex,
            endIndex,
            isVirtualized: false
        };
    }, [filteredBookings, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredBookings.length / pageSize);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Calculate stats from bookings
    const bookingStats = useMemo(() => {
        const total = bookings.length;
        const pending = bookings.filter(b => b.status === 'PENDING').length;
        const approved = bookings.filter(b => b.status === 'APPROVED').length;
        const cancelled = bookings.filter(b => b.status === 'CANCELLED').length;
        const rejected = bookings.filter(b => b.status === 'REJECTED').length;
        
        return { total, pending, approved, cancelled, rejected };
    }, [bookings]);

    return (
        <div className="space-y-8">

            {/* Stats Overview Cards */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4"
            >
                {/* Total Bookings */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Bookings</p>
                                <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mt-2">
                                    {bookingStats.total}
                                </p>
                            </div>
                            <div className="p-3 bg-blue-500 rounded-full">
                                <Activity className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Review */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Pending Review</p>
                                <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100 mt-2">
                                    {bookingStats.pending}
                                </p>
                            </div>
                            <div className="p-3 bg-yellow-500 rounded-full">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Approved */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">Approved</p>
                                <p className="text-3xl font-bold text-green-900 dark:text-green-100 mt-2">
                                    {bookingStats.approved}
                                </p>
                            </div>
                            <div className="p-3 bg-green-500 rounded-full">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Cancelled */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600 dark:text-red-400">Cancelled</p>
                                <p className="text-3xl font-bold text-red-900 dark:text-red-100 mt-2">
                                    {bookingStats.cancelled}
                                </p>
                            </div>
                            <div className="p-3 bg-red-500 rounded-full">
                                <XCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Rejected */}
                <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rejected</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 mt-2">
                                    {bookingStats.rejected}
                                </p>
                            </div>
                            <div className="p-3 bg-gray-500 rounded-full">
                                <AlertCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Filter Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                            <Sparkles className="w-7 h-7 mr-3 text-primary" />
                            Advanced Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">


                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-10 border border-border hover:border-primary/50 rounded-lg bg-background/50 font-medium text-sm">
                                    <SelectValue placeholder="Filter by Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">⏳ Pending</SelectItem>
                                    <SelectItem value="APPROVED">✅ Approved</SelectItem>
                                    <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
                                    <SelectItem value="REJECTED">🚫 Rejected</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={courtFilter} onValueChange={setCourtFilter}>
                                <SelectTrigger className="h-10 border border-border hover:border-primary/50 rounded-lg bg-background/50 font-medium text-sm">
                                    <SelectValue placeholder="Filter by Court" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courts</SelectItem>
                                    {courts.map((court) => (
                                        <SelectItem key={court.id} value={court.id.toString()}>
                                            <div className="flex items-center space-x-2 py-1">
                                                <div className="relative w-6 h-6 rounded-md overflow-hidden bg-muted flex-shrink-0">
                                                    {court.imageUrl ? (
                                                        <img
                                                            src={court.imageUrl}
                                                            alt={court.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.style.display = 'none';
                                                                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                                                                if (fallback) fallback.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className={`absolute inset-0 flex items-center justify-center ${court.imageUrl ? 'hidden' : 'flex'}`}>
                                                        <MapPin className="w-3 h-3 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-xs">{court.name}</p>
                                                    <p className="text-xs text-muted-foreground">{court.location}</p>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Date Range Filter */}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className="h-10 justify-start text-left font-normal text-sm"
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {startDate && endDate ? (
                                            `${format(startDate, "MMM d")} - ${format(endDate, "MMM d")}`
                                        ) : startDate ? (
                                            `From ${format(startDate, "MMM d")}`
                                        ) : endDate ? (
                                            `Until ${format(endDate, "MMM d")}`
                                        ) : (
                                            "Date range"
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <div className="p-4 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Start Date</label>
                                                <Calendar
                                                    mode="single"
                                                    selected={startDate}
                                                    onSelect={(date) => {
                                                        console.log('Start date selected:', date);
                                                        setStartDate(date);
                                                    }}
                                                    className="p-3 pointer-events-auto"
                                                    disabled={(date) => date > new Date() || (endDate && date > endDate)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">End Date</label>
                                                <Calendar
                                                    mode="single"
                                                    selected={endDate}
                                                    onSelect={(date) => {
                                                        console.log('End date selected:', date);
                                                        setEndDate(date);
                                                    }}
                                                    className="p-3 pointer-events-auto"
                                                    disabled={(date) => date > new Date() || (startDate && date < startDate)}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-between pt-2">
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setStartDate(undefined);
                                                        setEndDate(undefined);
                                                    }}
                                                >
                                                    Clear
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    onClick={() => {
                                                        // Apply the selected date range immediately
                                                        console.log('Applying date range filter:', { startDate, endDate });
                                                    }}
                                                    disabled={!startDate && !endDate}
                                                >
                                                    Apply
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </PopoverContent>
                            </Popover>

                            <Button
                                onClick={onRefresh}
                                className="h-10 bg-gradient-to-r from-primary to-admin-accent hover:from-primary/90 hover:to-admin-accent/90 text-primary-foreground font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                {t('common.refresh')}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Enhanced Data Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-0 shadow-2xl overflow-hidden bg-card/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-admin-surface to-admin-secondary border-b border-border/50 pb-6">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-3xl font-bold flex items-center text-foreground">
                                <Building2 className="w-8 h-8 mr-4 text-primary" />
                                Booking Management Dashboard
                            </CardTitle>
                            <div className="flex items-center space-x-4">
                                <Badge className="px-6 py-2 text-base bg-primary/10 text-primary border-primary/20 font-semibold">
                                    {filteredBookings.length} Records
                                </Badge>
                                <Badge className="px-6 py-2 text-base bg-admin-accent/10 text-admin-accent border-admin-accent/20 font-semibold">
                                    Page {currentPage + 1} of {totalPages || 1}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-32">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="p-4 bg-primary/10 rounded-full mb-8"
                                >
                                    <RefreshCw className="w-12 h-12 text-primary" />
                                </motion.div>
                                <h3 className="text-2xl font-bold text-foreground mb-2">Loading bookings...</h3>
                                <p className="text-muted-foreground">Please wait while we fetch the latest data</p>
                            </div>
                        ) : (
                            <>
                                {/* Performance indicator for large datasets */}
                                {filteredBookings.length > 1000 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                                        <div className="flex items-center gap-2 text-yellow-800">
                                            <AlertCircle className="w-5 h-5" />
                                            <span className="font-medium">Large Dataset Detected</span>
                                        </div>
                                        <p className="text-yellow-700 text-sm mt-1">
                                            Showing {paginatedBookings.items.length} of {filteredBookings.length} bookings with virtual scrolling for optimal performance.
                                        </p>
                                    </div>
                                )}

                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-gradient-to-r from-admin-surface via-admin-secondary to-admin-surface border-b-2 border-border">
                                                <TableHead className="font-bold text-foreground py-3 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4 text-primary" />
                                                        <span>User & Details</span>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-bold text-foreground py-3 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <MapPin className="w-4 h-4 text-primary" />
                                                        <span>Court & Schedule</span>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-bold text-foreground py-3 text-sm">
                                                    <div className="flex items-center space-x-2">
                                                        <Award className="w-4 h-4 text-primary" />
                                                        <span>Status & Payment</span>
                                                    </div>
                                                </TableHead>
                                                <TableHead className="font-bold text-foreground py-3 text-sm text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        <Zap className="w-4 h-4 text-primary" />
                                                        <span>Actions</span>
                                                    </div>
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {paginatedBookings.items?.map((booking, index) => (
                                                    <motion.tr
                                                        key={booking.id}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, y: -20 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-admin-accent/5 transition-all duration-300 border-b border-border/50"
                                                    >
                                                        <TableCell className="py-4">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="relative">
                                                                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md">
                                                                        {booking.user?.profilePictureUrl ? (
                                                                            <img
                                                                                src={booking.user.profilePictureUrl}
                                                                                alt={`${booking.user.fullName || 'User'} profile`}
                                                                                className="h-full w-full object-cover"
                                                                                onError={(e) => {
                                                                                    const target = e.target as HTMLImageElement;
                                                                                    target.style.display = 'none';
                                                                                    const fallback = target.parentElement?.querySelector('.fallback-avatar');
                                                                                    if (fallback) fallback.classList.remove('hidden');
                                                                                }}
                                                                            />
                                                                        ) : null}
                                                                        <div className={`w-full h-full bg-gradient-to-br from-primary to-admin-accent rounded-xl flex items-center justify-center text-white font-bold text-sm fallback-avatar ${booking.user?.profilePictureUrl ? 'hidden' : ''}`}>
                                                                            {booking.user?.fullName?.charAt(0) || booking.user?.email?.charAt(0) || 'U'}
                                                                        </div>
                                                                    </div>
                                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-admin-accent rounded-full flex items-center justify-center">
                                                                        <Users className="w-2 h-2 text-white" />
                                                                    </div>
                                                                </div>
                                                                <div className="space-y-0.5">
                                                                    <p className="font-bold text-foreground text-sm">
                                                                        {booking.user?.fullName || 'Unknown User'}
                                                                    </p>
                                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                                        <Mail className="w-3 h-3 mr-1.5" />
                                                                        {booking.user?.email || 'No email'}
                                                                    </div>
                                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                                        <span className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">ID: {booking.id}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center space-x-2">
                                                                    <div className="w-8 h-8 rounded-md overflow-hidden">
                                                                        {booking.court?.imageUrl ? (
                                                                            <img
                                                                                src={booking.court.imageUrl}
                                                                                alt={`${booking.court.name} court`}
                                                                                className="h-full w-full object-cover"
                                                                                onError={(e) => {
                                                                                    const target = e.target as HTMLImageElement;
                                                                                    target.style.display = 'none';
                                                                                    const fallback = target.parentElement?.querySelector('.fallback-court');
                                                                                    if (fallback) fallback.classList.remove('hidden');
                                                                                }}
                                                                            />
                                                                        ) : null}
                                                                        <div className={`w-full h-full bg-primary/10 rounded-md flex items-center justify-center fallback-court ${booking.court?.imageUrl ? 'hidden' : ''}`}>
                                                                            <Building2 className="w-3 h-3 text-primary" />
                                                                        </div>
                                                                    </div>
                                                                    <p className="font-bold text-foreground text-sm">{booking.court?.name}</p>
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                                        <CalendarIcon className="w-3 h-3 mr-1.5 text-admin-accent" />
                                                                        {formatDateTime(booking.startTime)}
                                                                    </div>
                                                                    <div className="flex items-center text-xs text-muted-foreground">
                                                                        <Clock className="w-3 h-3 mr-1.5 text-admin-accent" />
                                                                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4">
                                                            <div className="space-y-2">
                                                                <Badge
                                                                    className={`text-xs px-2 py-1 font-semibold rounded ${booking.status === 'APPROVED'
                                                                        ? 'bg-status-success/10 text-status-success border-status-success/20'
                                                                        : booking.status === 'PENDING'
                                                                            ? 'bg-status-pending/10 text-status-pending border-status-pending/20'
                                                                            : 'bg-status-error/10 text-status-error border-status-error/20'
                                                                        }`}
                                                                >
                                                                    {getStatusIcon(booking.status)} {booking.status}
                                                                </Badge>
                                                                
                                                                {/* Fee Breakdown Popover */}
                                                                <Popover>
                                                                    <PopoverTrigger asChild>
                                                                        <Button
                                                                            variant="ghost"
                                                                            size="sm"
                                                                            className="h-auto p-0 hover:bg-transparent group"
                                                                        >
                                                                            <div className="flex items-center gap-1.5 text-foreground font-bold text-sm group-hover:text-primary transition-colors">
                                                                                <Receipt className="w-3.5 h-3.5" />
                                                                                <CurrencyDisplay
                                                                                    amount={calculateDuration(booking.startTime, booking.endTime) * (booking.court?.hourlyFee || 0) + (booking.court?.facility?.seedRecordingFee || booking.court?.seedRecordingFee || 0)}
                                                                                    size="sm"
                                                                                    className="text-inherit"
                                                                                />
                                                                            </div>
                                                                        </Button>
                                                                    </PopoverTrigger>
                                                                    <PopoverContent className="w-80 p-0" align="end">
                                                                        <FeeBreakdown
                                                                            courtFee={calculateDuration(booking.startTime, booking.endTime) * (booking.court?.hourlyFee || 0)}
                                                                            seedRecordingFee={booking.court?.facility?.seedRecordingFee || booking.court?.seedRecordingFee || 0}
                                                                            duration={calculateDuration(booking.startTime, booking.endTime) * 60}
                                                                            hourlyRate={booking.court?.hourlyFee || 0}
                                                                            showHeader={true}
                                                                        />
                                                                    </PopoverContent>
                                                                </Popover>
                                                            </div>
                                                        </TableCell>

                                                        <TableCell className="py-4 text-right">
                                                            <div className="flex items-center justify-end space-x-1.5">
                                                                {booking.status === 'PENDING' && (
                                                                    <>
                                                                        <Button
                                                                            onClick={() => onApprove(booking.id)}
                                                                            size="sm"
                                                                            className="bg-gradient-to-r from-status-success to-status-success/80 hover:from-status-success/90 hover:to-status-success/70 text-white font-semibold px-2 py-1 rounded text-xs shadow-sm hover:shadow-md transition-all duration-200"
                                                                        >
                                                                            <CheckCircle className="w-3 h-3 mr-1" />
                                                                            Approve
                                                                        </Button>
                                                                        <Button
                                                                            onClick={() => onReject(booking.id, 'Admin rejection')}
                                                                            variant="destructive"
                                                                            size="sm"
                                                                            className="bg-gradient-to-r from-status-error to-status-error/80 hover:from-status-error/90 hover:to-status-error/70 font-semibold px-2 py-1 rounded text-xs shadow-sm hover:shadow-md transition-all duration-200"
                                                                        >
                                                                            <XCircle className="w-3 h-3 mr-1" />
                                                                            Reject
                                                                        </Button>
                                                                    </>
                                                                )}

                                                            </div>
                                                        </TableCell>
                                                    </motion.tr>
                                                ))}
                                            </AnimatePresence>
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </CardContent>

                    {/* Enhanced Pagination */}
                    {!isLoading && totalPages > 1 && (
                        <div className="border-t border-border/50 bg-gradient-to-r from-admin-surface to-admin-secondary p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <p className="text-sm text-muted-foreground font-medium">
                                        Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, filteredBookings.length)} of {filteredBookings.length} results
                                    </p>
                                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                                        <SelectTrigger className="w-24 h-10">
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

                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(0)}
                                        disabled={currentPage === 0}
                                        className="h-10 px-3"
                                    >
                                        <ChevronsLeft className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                                        disabled={currentPage === 0}
                                        className="h-10 px-3"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </Button>

                                    <div className="flex items-center space-x-1">
                                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            const pageNumber = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
                                            return (
                                                <Button
                                                    key={pageNumber}
                                                    variant={currentPage === pageNumber ? "default" : "outline"}
                                                    size="sm"
                                                    onClick={() => setCurrentPage(pageNumber)}
                                                    className="h-10 w-10"
                                                >
                                                    {pageNumber + 1}
                                                </Button>
                                            );
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                                        disabled={currentPage >= totalPages - 1}
                                        className="h-10 px-3"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(totalPages - 1)}
                                        disabled={currentPage >= totalPages - 1}
                                        className="h-10 px-3"
                                    >
                                        <ChevronsRight className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            </motion.div>
        </div>
    );
};