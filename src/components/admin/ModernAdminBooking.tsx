import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ClipboardList, CheckCircle, Clock, XCircle, Search, Filter, RefreshCw, 
    Users, MapPin, DollarSign, Calendar, Mail, Crown, Sparkles, Zap,
    Eye, Edit, Trash2, MoreVertical, ChevronLeft, ChevronRight,
    ChevronsLeft, ChevronsRight, TrendingUp, Settings
} from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { formatDateTime, formatPrice, calculateDuration } from '@/utils';

interface ModernAdminBookingProps {
    bookings: any[];
    stats: any;
    courts: any[];
    isLoading: boolean;
    onApprove: (id: number) => void;
    onReject: (id: number, reason: string) => void;
    onCancel: (id: number, reason: string) => void;
    onRefresh: () => void;
}

export const ModernAdminBooking: React.FC<ModernAdminBookingProps> = ({
    bookings, stats, courts, isLoading, onApprove, onReject, onCancel, onRefresh
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [courtFilter, setCourtFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    const filteredBookings = bookings.filter(booking => {
        // Apply filters logic here
        return true; // Simplified for demo
    });

    const paginatedBookings = filteredBookings.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
    );

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="space-y-8 p-6">
            {/* Modern Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-gray-900 to-slate-800 p-8 text-white"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2 flex items-center">
                            <Crown className="w-8 h-8 mr-3 text-yellow-400" />
                            Advanced Booking Management
                        </h1>
                        <p className="text-gray-300 text-lg">Professional tennis court booking administration</p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="text-center">
                            <p className="text-3xl font-bold text-blue-400">{filteredBookings.length}</p>
                            <p className="text-sm text-gray-400">Total Bookings</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-bold text-yellow-400">{stats.pending || 0}</p>
                            <p className="text-sm text-gray-400">Pending</p>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Modern Filter Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
                    <CardHeader>
                        <CardTitle className="flex items-center text-xl">
                            <Sparkles className="w-6 h-6 mr-3 text-blue-600" />
                            Smart Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <Input
                                        placeholder="Search bookings, users, courts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-lg"
                                    />
                                </div>
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-12 border-2">
                                    <SelectValue placeholder="Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="PENDING">⏳ Pending</SelectItem>
                                    <SelectItem value="APPROVED">✅ Approved</SelectItem>
                                    <SelectItem value="CANCELLED">❌ Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={dateFilter} onValueChange={setDateFilter}>
                                <SelectTrigger className="h-12 border-2">
                                    <SelectValue placeholder="Date" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Dates</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                    <SelectItem value="week">This Week</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button onClick={onRefresh} className="h-12 bg-gradient-to-r from-blue-600 to-blue-700">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Modern Data Table */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="border-0 shadow-xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-2xl flex items-center">
                                <ClipboardList className="w-7 h-7 mr-3 text-blue-600" />
                                Booking Management Dashboard
                            </CardTitle>
                            <Badge className="px-4 py-2 text-sm bg-blue-100 text-blue-700">
                                {filteredBookings.length} Records
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-24">
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                    <RefreshCw className="w-16 h-16 text-blue-500 mb-6" />
                                </motion.div>
                                <h3 className="text-xl font-semibold text-gray-900">Loading bookings...</h3>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-gray-50 to-gray-100">
                                            <TableHead className="font-bold text-gray-900 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <Users className="w-5 h-5" />
                                                    <span>User & Booking</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-900 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <MapPin className="w-5 h-5" />
                                                    <span>Court & Schedule</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-900 py-4">
                                                <div className="flex items-center space-x-2">
                                                    <DollarSign className="w-5 h-5" />
                                                    <span>Status & Payment</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-bold text-gray-900 py-4 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {paginatedBookings.map((booking, index) => (
                                            <motion.tr
                                                key={booking.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-all duration-300"
                                            >
                                                <TableCell className="py-6">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                                            {booking.user?.fullName?.charAt(0) || booking.user?.email?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-gray-900 text-lg">
                                                                {booking.user?.fullName || booking.user?.email || 'Unknown User'}
                                                            </p>
                                                            <p className="text-sm text-gray-500 flex items-center">
                                                                <Mail className="w-4 h-4 mr-1" />
                                                                {booking.user?.email}
                                                            </p>
                                                            <p className="text-xs text-gray-400">ID: {booking.id}</p>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="space-y-2">
                                                        <p className="font-semibold text-gray-900">{booking.court?.name}</p>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Calendar className="w-4 h-4 mr-2" />
                                                            {formatDateTime(booking.startTime)}
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6">
                                                    <div className="space-y-2">
                                                        <Badge 
                                                            variant={booking.status === 'APPROVED' ? 'default' : 
                                                                   booking.status === 'PENDING' ? 'secondary' : 'destructive'}
                                                            className="text-sm px-3 py-1"
                                                        >
                                                            {booking.status}
                                                        </Badge>
                                                        <p className="font-bold text-lg text-gray-900">
                                                            {formatPrice(calculateDuration(booking.startTime, booking.endTime) * (booking.court?.hourlyFee || 0))}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="py-6 text-right">
                                                    <div className="flex items-center justify-end space-x-2">
                                                        {booking.status === 'PENDING' && (
                                                            <>
                                                                <Button onClick={() => onApprove(booking.id)} size="sm" className="bg-green-600 hover:bg-green-700">
                                                                    <CheckCircle className="w-4 h-4 mr-1" />
                                                                    Approve
                                                                </Button>
                                                                <Button onClick={() => onReject(booking.id, 'Admin rejection')} variant="destructive" size="sm">
                                                                    <XCircle className="w-4 h-4 mr-1" />
                                                                    Reject
                                                                </Button>
                                                            </>
                                                        )}
                                                        <DropdownMenu>
                                                            <DropdownMenuTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </Button>
                                                            </DropdownMenuTrigger>
                                                            <DropdownMenuContent align="end">
                                                                <DropdownMenuItem><Eye className="w-4 h-4 mr-2" />View Details</DropdownMenuItem>
                                                                <DropdownMenuItem><Edit className="w-4 h-4 mr-2" />Edit</DropdownMenuItem>
                                                                <DropdownMenuItem className="text-red-600"><Trash2 className="w-4 h-4 mr-2" />Delete</DropdownMenuItem>
                                                            </DropdownMenuContent>
                                                        </DropdownMenu>
                                                    </div>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};