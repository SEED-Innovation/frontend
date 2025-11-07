// Payment Link Types

export enum PaymentLinkStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export interface WhatsAppTemplateData {
  courtName: string;
  facilityName: string;
  date: string;
  time: string;
  price: string;
  paymentLink: string;
  formattedMessage: string;
}

export interface PaymentLinkDTO {
  id: string;
  courtId: number;
  courtName: string;
  facilityId: number;
  facilityName: string;
  facilityAddress: string;
  targetUserId?: number;
  phoneNumber?: string;
  bookingDate: string; // LocalDate as string
  startTime: string; // LocalTime as string
  endTime: string; // LocalTime as string
  recordingAddon: boolean;
  recordingAddonPrice: number;
  courtPrice: number;
  totalAmount: number;
  expiresAt: string; // LocalDateTime as string
  status: PaymentLinkStatus;
  edfaPayTransactionId?: string;
  createdAt: string; // LocalDateTime as string
  createdById: number;
  whatsAppTemplate?: WhatsAppTemplateData;
}

export interface CreatePaymentLinkRequest {
  courtId: number;
  bookingDate: string; // YYYY-MM-DD format
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  recordingAddon: boolean;
  phoneNumber?: string; // For new user invitation
  existingUserId?: number; // For existing user selection
}
