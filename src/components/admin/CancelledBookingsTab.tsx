import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import FeeBreakdown from './FeeBreakdown';
import {
    XCircle, DollarSign, CheckCircle, Clock, Receipt, User, MapPin,
    CalendarIcon, AlertCircle, RefreshCw, Filter
} from 'lucide-react';
import { formatDateTime, calculateDuration } from '@/utils';
import { toast } from 'sonner';
import { BookingResponse, RefundStatus } from '@/types/booking';

interface CancelledBookingsTabProps {
    bookings: BookingResponse[];
    isLoading: boolean;
    onRefresh: () => void;
    onMarkAsRefunded?: (bookingIds: number[], refundReference: string, notes?: string) => Promise<void>;
}

export const CancelledBookingsTab: React.FC<CancelledBookingsTabProps> = ({
    bookings,
    isLoading,
    onRefresh,
    onMarkAsRefunded
}) => {
    const [selectedBookings, setSelectedBookings] = useState<number[]>([]);
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [refundReference, setRefundReference] = useState('');
    const [refundNotes, setRefundNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [refundStatusFilter, setRefundStatusFilter] = useState<string>('all');

    // Filter cancelled bookings
    const cancelledBookings = useMemo(() => {
        return bookings.filter(booking => {
            const isCancelled = booking.status === 'CANCELLED';
            const matchesRefundFilter = refundStatusFilter === 'all' || booking.refundStatus === refundStatusFilter;
            return isCancelled && matchesRefundFilter;
        });
    }, [bookings, refundStatusFilter]);

    // Calculate statistics
    const stats = useMemo(() => {
        const total = cancelledBookings.length;
        const pending = cancelledBookings.filter(b => b.refundStatus === RefundStatus.PENDING).length;
        const refunded = cancelledBookings.filter(b => b.refundStatus === RefundStatus.REFUNDED).length;
        const notApplicable = cancelledBookings.filter(b => b.refundStatus === RefundStatus.NOT_APPLICABLE).length;
        
        const totalAmount = cancelledBookings.reduce((sum, booking) => {
            const duration = calculateDuration(booking.startTime, booking.endTime);
            const courtFee = duration * (booking.court?.hourlyFee || 0);
            const seedFee = booking.court?.facility?.seedRecordingFee || booking.court?.seedRecordingFee || 0;
            return sum + courtFee + seedFee;
        }, 0);

        return { total, pending, refunded, notApplicable, totalAmount };
    }, [cancelledBookings]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            const pendingIds = cancelledBookings
                .filter(b => b.refundStatus === RefundStatus.PENDING)
                .map(b => b.id);
            setSelectedBookings(pendingIds);
        } else {
            setSelectedBookings([]);
        }
    };

    const handleSelectBooking = (bookingId: number, checked: boolean) => {
        if (checked) {
            setSelectedBookings(prev => [...prev, bookingId]);
        } else {
            setSelectedBookings(prev => prev.filter(id => id !== bookingId));
        }
    };

    const handleOpenRefundModal = () => {
        if (selectedBookings.length === 0) {
            toast.error('Please select at least one booking to mark as refunded');
            return;
        }
        setRefundModalOpen(true);
    };

    const handleMarkAsRefunded = async () => {
        if (!refundReference.trim()) {
            toast.error('Please enter a refund reference');
            return;
        }

        if (!onMarkAsRefunded) {
            toast.error('Refund functionality is not available');
            return;
        }

        setIsProcessing(true);
        try {
            await onMarkAsRefunded(selectedBookings, refundReference, refundNotes);
            toast.success(`Successfully marked ${selectedBookings.length} booking(s) as refunded`);
            setRefundModalOpen(false);
            setRefundReference('');
            setRefundNotes('');
            setSelectedBookings([]);
            onRefresh();
        } catch (error) {
            console.error('Error marking as refunded:', error);
            toast.error('Failed to mark bookings as refunded');
        } finally {
            setIsProcessing(false);
        }
    };

    const getRefundStatusBadge = (status?: string) => {
        switch (status) {
            case RefundStatus.PENDING:
                return (
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending Refund
                    </Badge>
                );
            case RefundStatus.REFUNDED:
                return (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Refunded
                    </Badge>
                );
            case RefundStatus.NOT_APPLICABLE:
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        No Refund
                    </Badge>
                );
            default:
                return (
                    <Badge className="bg-gray-100 text-gray-800 border-gray-200">
                        Unknown
                    </Badge>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                            <p className="text-sm text-muted-foreground">Total Cancelled</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                            <p className="text-sm text-muted-foreground">Pending Refund</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-green-600">{stats.refunded}</p>
                            <p className="text-sm text-muted-foreground">Refunded</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-gray-600">{stats.notApplicable}</p>
                            <p className="text-sm text-muted-foreground">No Refund</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center">
                            <CurrencyDisplay amount={stats.totalAmount} size="lg" showSymbol className="text-2xl font-bold text-primary" />
                            <p className="text-sm text-muted-foreground">Total Amount</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actions Bar */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Filter className="w-4 h-4 text-muted-foreground" />
                                <select
                                    value={refundStatusFilter}
                                    onChange={(e) => setRefundStatusFilter(e.target.value)}
                                    className="border rounded-md px-3 py-2 text-sm"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value={RefundStatus.PENDING}>Pending Refund</option>
                                    <option value={RefundStatus.REFUNDED}>Refunded</option>
                                    <option value={RefundStatus.NOT_APPLICABLE}>No Refund</option>
                                </select>
                            </div>
                            {selectedBookings.length > 0 && (
                                <Badge className="bg-primary/10 text-primary">
                                    {selectedBookings.length} selected
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedBookings.length > 0 && onMarkAsRefunded && (
                                <Button onClick={handleOpenRefundModal} className="bg-green-600 hover:bg-green-700">
                                    <DollarSign className="w-4 h-4 mr-2" />
                                    Mark as Refunded ({selectedBookings.length})
                                </Button>
                            )}
                            <Button onClick={onRefresh} variant="outline">
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Bookings Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <XCircle className="w-6 h-6 mr-2 text-red-600" />
                        Cancelled Bookings
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                            <p className="mt-4 text-muted-foreground">Loading cancelled bookings...</p>
                        </div>
                    ) : cancelledBookings.length === 0 ? (
                        <div className="text-center py-8">
                            <XCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">No cancelled bookings found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        {onMarkAsRefunded && (
                                            <TableHead className="w-12">
                                                <Checkbox
                                                    checked={selectedBookings.length === stats.pending && stats.pending > 0}
                                                    onCheckedChange={handleSelectAll}
                                                />
                                            </TableHead>
                                        )}
                                        <TableHead>Booking ID</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Court</TableHead>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Cancelled At</TableHead>
                                        <TableHead>Refund Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {cancelledBookings.map((booking, index) => {
                                            const duration = calculateDuration(booking.startTime, booking.endTime);
                                            const courtFee = duration * (booking.court?.hourlyFee || 0);
                                            const seedFee = booking.court?.facility?.seedRecordingFee || booking.court?.seedRecordingFee || 0;
                                            const total = courtFee + seedFee;
                                            const canSelect = booking.refundStatus === RefundStatus.PENDING;

                                            return (
                                                <motion.tr
                                                    key={booking.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ delay: index * 0.05 }}
                                                    className="hover:bg-muted/50"
                                                >
                                                    {onMarkAsRefunded && (
                                                        <TableCell>
                                                            {canSelect && (
                                                                <Checkbox
                                                                    checked={selectedBookings.includes(booking.id)}
                                                                    onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                                                                />
                                                            )}
                                                        </TableCell>
                                                    )}
                                                    <TableCell className="font-mono text-sm">#{booking.id}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <User className="w-4 h-4 text-muted-foreground" />
                                                            <div>
                                                                <p className="font-medium">{booking.user?.fullName}</p>
                                                                <p className="text-xs text-muted-foreground">{booking.user?.email}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                                            <span>{booking.court?.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                                            <span className="text-sm">{formatDateTime(booking.startTime)}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Popover>
                                                            <PopoverTrigger asChild>
                                                                <Button variant="ghost" size="sm" className="h-auto p-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Receipt className="w-3.5 h-3.5" />
                                                                        <CurrencyDisplay amount={total} size="sm" showSymbol />
                                                                    </div>
                                                                </Button>
                                                            </PopoverTrigger>
                                                            <PopoverContent className="w-80 p-0">
                                                                <FeeBreakdown
                                                                    courtFee={courtFee}
                                                                    seedRecordingFee={seedFee}
                                                                    duration={duration * 60}
                                                                    hourlyRate={booking.court?.hourlyFee || 0}
                                                                    showHeader={true}
                                                                />
                                                            </PopoverContent>
                                                        </Popover>
                                                    </TableCell>
                                                    <TableCell>
                                                        <span className="text-sm text-muted-foreground">
                                                            {booking.cancellationReason || 'N/A'}
                                                        </span>
                                                    </TableCell>
                                                    <TableCell>
                                                        {getRefundStatusBadge(booking.refundStatus)}
                                                    </TableCell>
                                                </motion.tr>
                                            );
                                        })}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Refund Modal */}
            <Dialog open={refundModalOpen} onOpenChange={setRefundModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mark Bookings as Refunded</DialogTitle>
                        <DialogDescription>
                            You are about to mark {selectedBookings.length} booking(s) as refunded. Please provide the refund reference.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="refundReference">Refund Reference *</Label>
                            <Input
                                id="refundReference"
                                placeholder="e.g., REF-2024-001"
                                value={refundReference}
                                onChange={(e) => setRefundReference(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="refundNotes">Notes (Optional)</Label>
                            <Textarea
                                id="refundNotes"
                                placeholder="Add any additional notes..."
                                value={refundNotes}
                                onChange={(e) => setRefundNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setRefundModalOpen(false)} disabled={isProcessing}>
                            Cancel
                        </Button>
                        <Button onClick={handleMarkAsRefunded} disabled={isProcessing || !refundReference.trim()}>
                            {isProcessing ? 'Processing...' : 'Confirm Refund'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default CancelledBookingsTab;
