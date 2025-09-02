export interface ReceiptResponse {
  id: number;
  receiptNumber: string;
  bookingId: number;
  userId: number;
  userEmail: string;
  userName: string;
  courtName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: ReceiptStatus;
  type: ReceiptType;
  pdfFileUrl?: string;
  emailSent: boolean;
  generatedAt: string;
  paidAt?: string;
  cancelledAt?: string;
  cancelReason?: string;
}

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  GENERATED = 'GENERATED', 
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export enum ReceiptType {
  BOOKING_RECEIPT = 'BOOKING_RECEIPT',
  MANUAL_RECEIPT = 'MANUAL_RECEIPT',
  REFUND_RECEIPT = 'REFUND_RECEIPT',
  CANCELLATION_RECEIPT = 'CANCELLATION_RECEIPT'
}

export interface ReceiptRequest {
  bookingId: number;
  type: ReceiptType;
  sendEmail?: boolean;
  emailRecipient?: string;
}

export interface ReceiptStatistics {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  revenue: {
    total: number;
    currency: string;
    formatted: string;
  };
  receiptCounts: {
    paid: number;
    generated: number;
    cancelled: number;
    draft: number;
    total: number;
  };
  adminInfo: {
    generatedBy: string;
    generatedAt: string;
  };
}

export interface AdminManualBookingRequest {
  userId: number;
  courtId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  durationMinutes: number;
  matchType?: 'SINGLE' | 'DOUBLE';
  notes?: string;
  paymentMethod?: 'CASH' | 'TAP_TO_MANAGER' | 'PENDING';
  sendReceiptEmail?: boolean;
  customerEmail?: string;
}

export interface ManualBookingResponse {
  booking: any;
  receipt?: {
    receiptId: number;
    receiptNumber: string;
    status: string;
    pdfUrl: string;
    totalAmount: number;
    emailSent: boolean;
  };
  success: boolean;
  message: string;
}