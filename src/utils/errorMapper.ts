// ================================
// 🚨 ERROR CODE MAPPING
// ================================

import { toast } from "sonner";

export interface ApiError {
  errorId?: string;
  errorCode?: string;
  message?: string;
}

/**
 * Centralized error handling for API responses
 * Maps backend error codes to user-friendly toast messages
 */
export function handleApiError(err: any, defaultMessage?: string): void {
  console.error('API Error:', err);
  
  const errorData: ApiError = err?.response?.data || {};
  const code = errorData.errorCode;
  const msg = errorData.message;
  
  switch (code) {
    // Booking conflicts
    case 'SLOT_ALREADY_BOOKED':
      toast.warning(msg ?? 'That slot was just booked by someone else. Choose another.');
      break;
      
    case 'COURT_UNAVAILABLE_THIS_DAY':
      toast.warning(msg ?? 'This day just became unavailable. Pick another date.');
      break;
      
    // Blockout conflicts
    case 'BLOCKOUT_CONFLICT_WITH_BOOKINGS':
      toast.error(msg ?? 'Cannot block this day: existing bookings need to be cancelled first.');
      break;
      
    case 'UNAVAILABILITY_ALREADY_EXISTS':
      toast.info(msg ?? 'This date is already blocked.');
      break;
      
    // Permission errors
    case 'FORBIDDEN':
      toast.error(msg ?? 'You do not have permission to perform this action.');
      break;
      
    // Resource errors  
    case 'COURT_NOT_FOUND':
      toast.error(msg ?? 'Court not found.');
      break;
      
    case 'BOOKING_NOT_FOUND':
      toast.error(msg ?? 'Booking not found.');
      break;
      
    // Validation errors
    case 'VALIDATION_ERROR':
    case 'INVALID_DATE':
    case 'INVALID_TIME_SLOT':
      toast.error(msg ?? 'Invalid input. Please check your data.');
      break;
      
    // Generic server errors
    case 'INTERNAL_SERVER_ERROR':
      toast.error('Server error. Please try again later.');
      break;
      
    // Network/timeout errors
    default:
      if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('timeout')) {
        toast.error('Connection error. Please check your internet and try again.');
      } else {
        toast.error(defaultMessage ?? msg ?? 'Something went wrong. Please try again.');
      }
  }
}

/**
 * Extract error code from API response for conditional logic
 */
export function getErrorCode(err: any): string | null {
  return err?.response?.data?.errorCode || null;
}

/**
 * Check if error is a specific type
 */
export function isErrorCode(err: any, code: string): boolean {
  return getErrorCode(err) === code;
}