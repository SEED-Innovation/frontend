import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    CheckCircle,
    XCircle,
    Clock,
    MoreVertical,
    MapPin,
    Calendar,
    Users,
    DollarSign,
    Mail,
    Phone,
    AlertTriangle,
    Eye,
    Edit,
    Trash2
} from 'lucide-react';

import { BookingResponse } from '@/types/booking';
import { formatDateTime, formatPrice, calculateDuration, calculateTotalPrice } from '@/utils';

interface BookingCardProps {
    booking: BookingResponse;
    onApprove: (bookingId: number, reason?: string) => Promise<void>;
    onReject: (bookingId: number, reason: string) => Promise<void>;
    onCancel: (bookingId: number, reason?: string) => Promise<void>;
    onSelect?: (bookingId: number, selected: boolean) => void;
    isSelected?: boolean;
    showSelectCheckbox?: boolean;
    isLoading?: boolean;
    className?: string;
}

const BookingCard: React.FC<BookingCardProps> = ({
    booking,
    onApprove,
    onReject,
    onCancel,
    onSelect,
    isSelected = false,
    showSelectCheckbox = false,
    isLoading = false,
    className = ""
}) => {
    // ================================
    // 🏗️ STATE MANAGEMENT
    // ================================
    
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    
    const [approveReason, setApproveReason] = useState('');
    const [rejectReason, setRejectReason] = useState('');
    const [cancelReason, setCancelReason] = useState('');
    
    const [actionLoading, setActionLoading] = useState(false);

    // ================================
    // 🔧 HELPER FUNCTIONS
    // ================================
    
    const getStatusBadge = (status: string) => {
        const variants = {
            'PENDING': { variant: 'secondary', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', icon: Clock },
            'APPROVED': { variant: 'default', color: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircle },
            'CANCELLED': { variant: 'destructive', color: 'text-red-600 bg-red-50 border-red-200', icon: XCircle },
            'REJECTED': { variant: 'destructive', color: 'text-orange-600 bg-orange-50 border-orange-200', icon: AlertTriangle }
        };
        
        const config = variants[status as keyof typeof variants] || variants.PENDING;
        const Icon = config.icon;
        
        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {status}
            </Badge>
        );
    };

    const getBookingDuration = () => {
        return calculateDuration(booking.startTime, booking.endTime);
    };

    const getTotalPrice = () => {
        const duration = getBookingDuration();
        return duration * booking.court.hourlyFee;
    };

    const canApprove = () => booking.status === 'PENDING';
    const canReject = () => booking.status === 'PENDING';
    const canCancel = () => ['PENDING', 'APPROVED'].includes(booking.status);

    // ================================
    // 🎯 ACTION HANDLERS
    // ================================
    
    const handleApprove = async () => {
        setActionLoading(true);
        try {
            await onApprove(booking.id, approveReason || undefined);
            setShowApproveDialog(false);
            setApproveReason('');
        } catch (error) {
            console.error('Failed to approve booking:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }
        
        setActionLoading(true);
        try {
            await onReject(booking.id, rejectReason);
            setShowRejectDialog(false);
            setRejectReason('');
        } catch (error) {
            console.error('Failed to reject booking:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        setActionLoading(true);
        try {
            await onCancel(booking.id, cancelReason || undefined);
            setShowCancelDialog(false);
            setCancelReason('');
        } catch (error) {
            console.error('Failed to cancel booking:', error);
        } finally {
            setActionLoading(false);
        }
    };

    // ================================
    // 🎨 RENDER METHODS
    // ================================
    
    const renderUserInfo = () => (
        <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${booking.user.fullName}`} />
                <AvatarFallback>
                    {booking.user.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                    {booking.user.fullName}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                    <Mail className="w-3 h-3 mr-1" />
                    <span className="truncate">{booking.user.email}</span>
                </div>
            </div>
        </div>
    );

    const renderCourtInfo = () => (
        <div className="space-y-2">
            <div className="flex items-center text-sm">
                <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                <span className="font-medium">{booking.court.name}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
                <span>{booking.court.location}</span>
                <span className="mx-2">•</span>
                <span>{booking.court.type === 'PADEL' ? 'Padel Court' : `${booking.court.type} Court`}</span>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
                <DollarSign className="w-4 h-4 mr-1" />
                <span>{formatPrice(booking.court.hourlyFee)}/hour</span>
            </div>
        </div>
    );

    const renderBookingDetails = () => (
        <div className="space-y-3">
            <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                <div>
                    <div className="font-medium">
                        {formatDateTime(booking.startTime)} - {formatDateTime(booking.endTime)}
                    </div>
                    <div className="text-gray-500">
                        Duration: {getBookingDuration()} hours
                    </div>
                </div>
            </div>
            
            <div className="flex items-center text-sm">
                <Users className="w-4 h-4 mr-2 text-gray-400" />
                <span>Match Type: {booking.matchType}</span>
            </div>
            
            <div className="flex items-center text-sm font-medium">
                <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                <span>Total: {formatPrice(getTotalPrice())}</span>
            </div>
        </div>
    );

    const renderActionButtons = () => {
        if (booking.status !== 'PENDING' && booking.status !== 'APPROVED') {
            return null;
        }

        return (
            <div className="flex space-x-2">
                {canApprove() && (
                    <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Approve
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Approve Booking</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to approve this booking for {booking.user.fullName}?
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Optional approval note..."
                                    value={approveReason}
                                    onChange={(e) => setApproveReason(e.target.value)}
                                />
                            </div>
                            
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowApproveDialog(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleApprove}
                                    disabled={actionLoading}
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    {actionLoading ? 'Approving...' : 'Approve Booking'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {canReject() && (
                    <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="destructive">
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Reject Booking</DialogTitle>
                                <DialogDescription>
                                    Please provide a reason for rejecting this booking.
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Reason for rejection (required)..."
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    required
                                />
                            </div>
                            
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRejectDialog(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleReject}
                                    disabled={actionLoading || !rejectReason.trim()}
                                    variant="destructive"
                                >
                                    {actionLoading ? 'Rejecting...' : 'Reject Booking'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}

                {canCancel() && (
                    <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                                <XCircle className="w-4 h-4 mr-1" />
                                Cancel
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Cancel Booking</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to cancel this booking?
                                </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4">
                                <Textarea
                                    placeholder="Optional cancellation reason..."
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                />
                            </div>
                            
                            <DialogFooter>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowCancelDialog(false)}
                                    disabled={actionLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    variant="destructive"
                                >
                                    {actionLoading ? 'Cancelling...' : 'Cancel Booking'}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        );
    };

    const renderMoreMenu = () => (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowDetailsDialog(true)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Booking
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Booking
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );

    // ================================
    // 🎨 MAIN RENDER
    // ================================
    
    return (
        <>
            <Card className={`${className} ${isSelected ? 'ring-2 ring-blue-500' : ''} ${isLoading ? 'opacity-60' : ''}`}>
                <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                            {showSelectCheckbox && onSelect && (
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={(e) => onSelect(booking.id, e.target.checked)}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                            )}
                            
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-500">
                                        Booking #{booking.id}
                                    </span>
                                    {getStatusBadge(booking.status)}
                                </div>
                                
                                {renderUserInfo()}
                            </div>
                        </div>
                        
                        {renderMoreMenu()}
                    </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Court Information</h4>
                            {renderCourtInfo()}
                        </div>
                        
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">Booking Details</h4>
                            {renderBookingDetails()}
                        </div>
                    </div>
                    
                    {renderActionButtons()}
                </CardContent>
            </Card>

            {/* Details Dialog */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Booking Details #{booking.id}</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-3">User Information</h4>
                                {renderUserInfo()}
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-3">Status</h4>
                                {getStatusBadge(booking.status)}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <h4 className="font-medium mb-3">Court Information</h4>
                                {renderCourtInfo()}
                            </div>
                            
                            <div>
                                <h4 className="font-medium mb-3">Booking Details</h4>
                                {renderBookingDetails()}
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default BookingCard;