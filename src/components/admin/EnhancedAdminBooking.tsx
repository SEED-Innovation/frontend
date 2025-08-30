import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import {
    Calendar, Clock, Users, MapPin, Filter, Search, RefreshCw,
    CheckCircle, XCircle, Eye, Edit, Trash2, MoreVertical,
    ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    TrendingUp, Activity, Crown, Sparkles, Building2,
    Mail, Phone, AlertCircle, Award, Zap
} from 'lucide-react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');
    const [courtFilter, setCourtFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(20);

    // Enhanced filtering logic
    const filteredBookings = useMemo(() => {
        return bookings.filter(booking => {
            const matchesSearch = !searchTerm || 
                booking.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.court?.name?.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
            const matchesCourt = courtFilter === 'all' || booking.court?.id?.toString() === courtFilter;

            return matchesSearch && matchesStatus && matchesCourt;
        });
    }, [bookings, searchTerm, statusFilter, courtFilter]);

    const paginatedBookings = useMemo(() => {
        return filteredBookings.slice(
            currentPage * pageSize,
            (currentPage + 1) * pageSize
        );
    }, [filteredBookings, currentPage, pageSize]);

    const totalPages = Math.ceil(filteredBookings.length / pageSize);

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-admin-surface via-admin-secondary to-admin-surface p-6 space-y-8">
            {/* Enhanced Hero Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-admin-primary to-admin-accent p-8 text-white shadow-xl"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-48 translate-x-48" />
                
                <div className="relative z-10 flex items-center justify-between">
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                                <Crown className="w-8 h-8 text-yellow-300" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold mb-2">Booking Management</h1>
                                <p className="text-blue-100 text-lg font-medium">Professional Tennis Court Administration</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
                        >
                            <div className="flex items-center justify-center mb-2">
                                <Activity className="w-6 h-6 text-blue-300 mr-2" />
                                <p className="text-3xl font-bold text-white">{filteredBookings.length}</p>
                            </div>
                            <p className="text-sm text-blue-200 font-medium">Total Bookings</p>
                        </motion.div>
                        
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/20"
                        >
                            <div className="flex items-center justify-center mb-2">
                                <Clock className="w-6 h-6 text-yellow-300 mr-2" />
                                <p className="text-3xl font-bold text-white">{stats.pending || 0}</p>
                            </div>
                            <p className="text-sm text-yellow-200 font-medium">Pending Review</p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Enhanced Filter Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <Card className="border-0 shadow-xl bg-card/80 backdrop-blur-sm">
                    <CardHeader className="pb-4">
                        <CardTitle className="flex items-center text-2xl font-bold text-foreground">
                            <Sparkles className="w-7 h-7 mr-3 text-primary" />
                            Advanced Filters & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                            <div className="lg:col-span-2">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 transition-colors group-hover:text-primary" />
                                    <Input
                                        placeholder="Search bookings, users, courts..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-12 h-14 border-2 border-border hover:border-primary/50 focus:border-primary rounded-xl bg-background/50 text-base font-medium transition-all duration-200"
                                    />
                                </div>
                            </div>
                            
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="h-14 border-2 border-border hover:border-primary/50 rounded-xl bg-background/50 font-medium">
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
                                <SelectTrigger className="h-14 border-2 border-border hover:border-primary/50 rounded-xl bg-background/50 font-medium">
                                    <SelectValue placeholder="Filter by Court" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Courts</SelectItem>
                                    {courts.map((court) => (
                                        <SelectItem key={court.id} value={court.id.toString()}>
                                            <div className="flex items-center space-x-3 py-1">
                                                <div className="relative w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
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
                                                        <MapPin className="w-4 h-4 text-muted-foreground" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="font-medium">{court.name}</p>
                                                    <p className="text-xs text-muted-foreground">{court.location}</p>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            
                            <Button 
                                onClick={onRefresh} 
                                className="h-14 bg-gradient-to-r from-primary to-admin-accent hover:from-primary/90 hover:to-admin-accent/90 text-primary-foreground font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                            >
                                <RefreshCw className="w-5 h-5 mr-2" />
                                Refresh
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
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gradient-to-r from-admin-surface via-admin-secondary to-admin-surface border-b-2 border-border">
                                            <TableHead className="font-bold text-foreground py-6 text-base">
                                                <div className="flex items-center space-x-3">
                                                    <Users className="w-6 h-6 text-primary" />
                                                    <span>User & Details</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-bold text-foreground py-6 text-base">
                                                <div className="flex items-center space-x-3">
                                                    <MapPin className="w-6 h-6 text-primary" />
                                                    <span>Court & Schedule</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-bold text-foreground py-6 text-base">
                                                <div className="flex items-center space-x-3">
                                                    <Award className="w-6 h-6 text-primary" />
                                                    <span>Status & Payment</span>
                                                </div>
                                            </TableHead>
                                            <TableHead className="font-bold text-foreground py-6 text-base text-right">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <Zap className="w-6 h-6 text-primary" />
                                                    <span>Actions</span>
                                                </div>
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {paginatedBookings.map((booking, index) => (
                                                <motion.tr
                                                    key={booking.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-gradient-to-r hover:from-primary/5 hover:to-admin-accent/5 transition-all duration-300 border-b border-border/50"
                                                >
                                                    <TableCell className="py-8">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="relative">
                                                                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
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
                                                                    <div className={`w-full h-full bg-gradient-to-br from-primary to-admin-accent rounded-2xl flex items-center justify-center text-white font-bold text-xl fallback-avatar ${booking.user?.profilePictureUrl ? 'hidden' : ''}`}>
                                                                        {booking.user?.fullName?.charAt(0) || booking.user?.email?.charAt(0) || 'U'}
                                                                    </div>
                                                                </div>
                                                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-admin-accent rounded-full flex items-center justify-center">
                                                                    <Users className="w-3 h-3 text-white" />
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="font-bold text-foreground text-lg">
                                                                    {booking.user?.fullName || 'Unknown User'}
                                                                </p>
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <Mail className="w-4 h-4 mr-2" />
                                                                    {booking.user?.email || 'No email'}
                                                                </div>
                                                                <div className="flex items-center text-xs text-muted-foreground">
                                                                    <span className="px-2 py-1 bg-muted rounded-md font-mono">ID: {booking.id}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    
                                                    <TableCell className="py-8">
                                                        <div className="space-y-3">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-12 h-12 rounded-lg overflow-hidden">
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
                                                                    <div className={`w-full h-full bg-primary/10 rounded-lg flex items-center justify-center fallback-court ${booking.court?.imageUrl ? 'hidden' : ''}`}>
                                                                        <Building2 className="w-4 h-4 text-primary" />
                                                                    </div>
                                                                </div>
                                                                <p className="font-bold text-foreground text-lg">{booking.court?.name}</p>
                                                            </div>
                                                            <div className="space-y-2">
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <Calendar className="w-4 h-4 mr-2 text-admin-accent" />
                                                                    {formatDateTime(booking.startTime)}
                                                                </div>
                                                                <div className="flex items-center text-sm text-muted-foreground">
                                                                    <Clock className="w-4 h-4 mr-2 text-admin-accent" />
                                                                    {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    
                                                    <TableCell className="py-8">
                                                        <div className="space-y-4">
                                                            <Badge 
                                                                className={`text-sm px-4 py-2 font-semibold rounded-lg ${
                                                                    booking.status === 'APPROVED' 
                                                                        ? 'bg-status-success/10 text-status-success border-status-success/20' 
                                                                        : booking.status === 'PENDING' 
                                                                        ? 'bg-status-pending/10 text-status-pending border-status-pending/20' 
                                                                        : 'bg-status-error/10 text-status-error border-status-error/20'
                                                                }`}
                                                            >
                                                                {getStatusIcon(booking.status)} {booking.status}
                                                            </Badge>
                                                            <div className="flex items-center space-x-2">
                                                                <CurrencyDisplay 
                                                                    amount={calculateDuration(booking.startTime, booking.endTime) * (booking.court?.hourlyFee || 0)}
                                                                    size="lg"
                                                                    className="text-foreground font-bold"
                                                                />
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    
                                                    <TableCell className="py-8 text-right">
                                                        <div className="flex items-center justify-end space-x-3">
                                                            {booking.status === 'PENDING' && (
                                                                <>
                                                                    <Button 
                                                                        onClick={() => onApprove(booking.id)} 
                                                                        size="sm" 
                                                                        className="bg-gradient-to-r from-status-success to-status-success/80 hover:from-status-success/90 hover:to-status-success/70 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                                                    >
                                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                                        Approve
                                                                    </Button>
                                                                    <Button 
                                                                        onClick={() => onReject(booking.id, 'Admin rejection')} 
                                                                        variant="destructive" 
                                                                        size="sm"
                                                                        className="bg-gradient-to-r from-status-error to-status-error/80 hover:from-status-error/90 hover:to-status-error/70 font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                                                                    >
                                                                        <XCircle className="w-4 h-4 mr-2" />
                                                                        Reject
                                                                    </Button>
                                                                </>
                                                            )}
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-lg border-2 border-transparent hover:border-primary/20 hover:bg-primary/5">
                                                                        <MoreVertical className="w-5 h-5" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end" className="w-48">
                                                                    <DropdownMenuItem className="py-3">
                                                                        <Eye className="w-4 h-4 mr-3" />
                                                                        View Details
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="py-3">
                                                                        <Edit className="w-4 h-4 mr-3" />
                                                                        Edit Booking
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem className="py-3 text-destructive">
                                                                        <Trash2 className="w-4 h-4 mr-3" />
                                                                        Delete
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
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