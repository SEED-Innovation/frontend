// ================================
// 📋 MAIN RESPONSE TYPES (Based on your Java backend)
// ================================


export interface PaginatedBookingResponse {
  content: BookingResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface BookingFilterSummary {
  total: number;
  pending: number;
  approved: number;
  cancelled: number;
  rejected: number;
  totalRevenue: number;
  todayBookings: number;
}

export interface AdminBookingFilterRequest {
  page?: number;
  size?: number;
  statuses?: string[];
  courtIds?: number[];
  userId?: number;
  startDate?: string;
  endDate?: string;
  startDateTime?: string; // ✅ Add this
  endDateTime?: string;   // ✅ Add this
  search?: string;        // ✅ Add this
  matchTypes?: string[];  // ✅ Add this
  hasPayment?: boolean;   // ✅ Add this
  isPaid?: boolean;       // ✅ Add this
  sortBy?: string;        // ✅ Add this
  sortDirection?: 'ASC' | 'DESC'; // ✅ Add this
}
export interface BookingResponse {
    id: number;
    user: UserShortResponse;
    court: CourtResponse;
    startTime: string; // ISO datetime string from LocalDateTime
    endTime: string;   // ISO datetime string from LocalDateTime
    status: string;    // BookingStatus enum as string
    cancellationReason?: string;
    rejectionReason?: string;
    matchType: string; // MatchType enum as string
    techPolicy?: TechnologyPolicyResponse;
    payment?: PaymentResponse;
}

export interface UserShortResponse {
    id: number;
    fullName: string;
    email: string;
}

export interface CourtResponse {
  id: number;
  name: string;
  location: string;
  type: string;
  hourlyFee: number;
  hasSeedSystem: boolean; 
  imageUrl?: string;
  amenities?: string[];
  techFeatures?: string[];
  description?: string;
  openingTimes?: Record<string, any>;
  rating?: number | null;
  totalRatings?: number | null;
  distanceInMeters?: number | null;
  formattedDistance?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  facility?: {
    id: number;
    name: string;
    hourlyFee?: number;
  };
}

export interface TechnologyPolicyResponse {
    consentGiven: boolean;
    dataCaptureDetails: string;
    storageDetails: string;
}

export interface PaymentResponse {
    id: number;
    amount: number;
    status: string;  // PaymentStatus enum as string
    method: string;
    createdAt: string;
}

export interface TimelineSlot {
    startTime: string;   // LocalTime from backend as string
    endTime: string;     // LocalTime from backend as string
    isBooked: boolean;
    isAvailable: boolean;
    bookingId?: number;
    userName?: string;
    bookingStatus?: string;
}

// ================================
// 📋 REQUEST TYPES (Matching your Java DTOs)
// ================================

export interface AdminBookingRangeRequest {
    courtId: number;
    start: string;  // LocalDateTime as ISO string
    end: string;    // LocalDateTime as ISO string
}

export interface AdminManualBookingRequest {
    userId: number;
    courtId: number;
    startTime: string; // LocalDateTime as ISO string
    endTime: string;   // LocalDateTime as ISO string
}

export interface AdminBookingActionRequest {
    bookingId: number;
    reason?: string;
}

export interface AdminBulkBookingActionRequest {
    bookingIds: number[];
    action: 'APPROVE' | 'REJECT' | 'CANCEL';
    reason?: string;
}

export interface AdminBookingFilterRequest {
    courtIds?: number[];
    startDateTime?: string;
    endDateTime?: string;
    statuses?: string[];
    userId?: number;
    userName?: string;
    userEmail?: string;
    matchTypes?: string[];
    hasPayment?: boolean;
    isPaid?: boolean;
    sortBy?: string;
    sortDirection?: 'ASC' | 'DESC';
    page?: number;
    size?: number;
    search?: string;
}

export interface AdminBookingFilterResponse {
    bookings: BookingResponse[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
    hasNext: boolean;
    hasPrevious: boolean;
    summary: BookingFilterSummary;
}

export interface BookingFilterSummary {
    totalBookings: number;
    confirmedBookings: number;
    pendingBookings: number;
    cancelledBookings: number;
    totalRevenue: number;
    confirmedRevenue: number;
}

export interface AdminBookingCalendarResponse {
    date: string;
    courts: CourtTimelineData[];
    totalBookings: number;
    totalRevenue: number;
}

export interface CourtTimelineData {
    court: CourtResponse;
    timeSlots: TimelineSlot[];
    bookings: BookingResponse[];
    revenue: number;
}

export interface AdminCourtTimelineResponse {
    court: CourtResponse;
    date: string;
    timeSlots: TimelineSlot[];
    bookings: BookingResponse[];
    statistics: {
        totalSlots: number;
        bookedSlots: number;
        availableSlots: number;
        revenue: number;
        occupancyRate: number;
    };
}

// ================================
// 📋 ENUMS (Matching your backend enums)
// ================================

export const BookingStatus = {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    CANCELLED: 'CANCELLED',
    REJECTED: 'REJECTED'
} as const;

export type BookingStatusType = typeof BookingStatus[keyof typeof BookingStatus];

export const MatchType = {
    SINGLE: 'SINGLE',
    DOUBLE: 'DOUBLE'
} as const;

export type MatchTypeType = typeof MatchType[keyof typeof MatchType];

export const PaymentStatus = {
    PENDING: 'PENDING',
    PROCESSING: 'PROCESSING',
    SUCCESS: 'SUCCESS',
    COMPLETED: 'COMPLETED',
    CAPTURED: 'CAPTURED',
    FAILED: 'FAILED',
    DECLINED: 'DECLINED',
    CANCELLED: 'CANCELLED',
    EXPIRED: 'EXPIRED',
    UNPAID: 'UNPAID'
} as const;

export type PaymentStatusType = typeof PaymentStatus[keyof typeof PaymentStatus];

export const CourtType = {
    HARD: 'HARD',
    CLAY: 'CLAY',
    GRASS: 'GRASS',
    INDOOR: 'INDOOR',
    OUTDOOR: 'OUTDOOR'
} as const;

export type CourtTypeType = typeof CourtType[keyof typeof CourtType];

export const UserRole = {
    PLAYER: 'PLAYER',
    ADMIN: 'ADMIN',
    SUPER_ADMIN: 'SUPER_ADMIN'
} as const;



// Mobile app compatible booking request format
export interface CreateBookingRequest {
  userId: number;
  courtId: number;
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:mm:ss format
  durationMinutes: number;
  matchType: 'SINGLE' | 'DOUBLE';
  notes?: string;
}

// Also add PaginatedBookingResponse if missing
export interface PaginatedBookingResponse {
  content: BookingResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export type UserRoleType = typeof UserRole[keyof typeof UserRole];