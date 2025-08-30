import React, { useState, useEffect, useCallback } from 'react';
import { EnhancedAdminBooking } from './EnhancedAdminBooking';
import { toast } from 'sonner';
import { bookingService } from '@/services/bookingService';
import { userService } from '@/services/userService';

interface AdminBookingProps {
    className?: string;
}

const AdminBooking: React.FC<AdminBookingProps> = ({ className = '' }) => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [courts, setCourts] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);
    const [stats, setStats] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

    return (
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
    );
};

export default AdminBooking;