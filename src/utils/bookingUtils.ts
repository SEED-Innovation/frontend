import { BookingStatus, PaymentStatus } from '@/types/booking';

// ================================
// 🎨 STATUS STYLING
// ================================

export const getStatusColor = (status: string): string => {
    switch (status) {
        case BookingStatus.PENDING:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case BookingStatus.APPROVED:
            return 'bg-green-100 text-green-800 border-green-200';
        case BookingStatus.CANCELLED:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        case BookingStatus.REJECTED:
            return 'bg-red-100 text-red-800 border-red-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

export const getStatusIcon = (status: string): string => {
    switch (status) {
        case BookingStatus.PENDING:
            return '⏳';
        case BookingStatus.APPROVED:
            return '✅';
        case BookingStatus.CANCELLED:
            return '❌';
        case BookingStatus.REJECTED:
            return '🚫';
        default:
            return '❓';
    }
};

export const getPaymentStatusColor = (status: string): string => {
    switch (status) {
        case PaymentStatus.SUCCESS:
        case PaymentStatus.COMPLETED:
        case PaymentStatus.CAPTURED:
            return 'bg-green-100 text-green-800 border-green-200';
        case PaymentStatus.PENDING:
        case PaymentStatus.PROCESSING:
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case PaymentStatus.FAILED:
        case PaymentStatus.DECLINED:
        case PaymentStatus.CANCELLED:
        case PaymentStatus.EXPIRED:
            return 'bg-red-100 text-red-800 border-red-200';
        case PaymentStatus.UNPAID:
            return 'bg-gray-100 text-gray-800 border-gray-200';
        default:
            return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

// ================================
// 💰 CALCULATIONS
// ================================

export const calculateDuration = (start: string, end: string): number => {
    const startTime = new Date(start);
    const endTime = new Date(end);
    const hours = Math.abs(endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    return Math.round(hours * 10) / 10; // Round to 1 decimal place
};

export const calculateTotalPrice = (start: string, end: string, hourlyRate: number): number => {
    const duration = calculateDuration(start, end);
    return Math.round(duration * hourlyRate * 100) / 100; // Round to 2 decimal places
};

export const formatPrice = (amount: number, currency: string = 'SAR'): string => {
    // Using the new Saudi Riyal symbol
    return `${amount.toFixed(2)} ${currency}`;
};

export const formatPriceWithSymbol = (amount: number): string => {
    // Format with new SAR symbol - will be displayed with the symbol image
    return `${amount.toFixed(2)}`;
};

// ================================
// ✅ VALIDATION
// ================================

export const isValidTimeRange = (startTime: string, endTime: string): boolean => {
    if (!startTime || !endTime) return false;
    return new Date(startTime) < new Date(endTime);
};

export const isValidBookingTime = (startTime: string): boolean => {
    const now = new Date();
    const bookingTime = new Date(startTime);
    return bookingTime > now;
};

export const getMinDateTime = (): string => {
    return new Date().toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:mm
};

export const getTodayDate = (): string => {
    return new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD
};

export const addDays = (date: string, days: number): string => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result.toISOString().split('T')[0];
};

// ================================
// 📊 STATISTICS
// ================================

export const calculateOccupancyRate = (bookedSlots: number, totalSlots: number): number => {
    if (totalSlots === 0) return 0;
    return Math.round((bookedSlots / totalSlots) * 100);
};

export const getBookingTrend = (current: number, previous: number): {
    percentage: number;
    direction: 'up' | 'down' | 'same';
    color: string;
} => {
    if (previous === 0) {
        return {
            percentage: current > 0 ? 100 : 0,
            direction: current > 0 ? 'up' : 'same',
            color: current > 0 ? 'text-green-600' : 'text-gray-600'
        };
    }

    const percentage = Math.round(((current - previous) / previous) * 100);
    
    return {
        percentage: Math.abs(percentage),
        direction: percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'same',
        color: percentage > 0 ? 'text-green-600' : percentage < 0 ? 'text-red-600' : 'text-gray-600'
    };
};