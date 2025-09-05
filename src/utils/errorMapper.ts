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
  
  // Try to parse error data from different response formats
  let errorData: ApiError = {};
  
  // Case 1: Standard API error response
  if (err?.response?.data) {
    errorData = err.response.data;
  }
  // Case 2: Error message contains JSON (like from your logs)
  else if (err?.message && err.message.startsWith('{')) {
    try {
      errorData = JSON.parse(err.message);
    } catch (parseError) {
      console.warn('Failed to parse JSON error message:', parseError);
    }
  }
  // Case 3: Direct error object
  else if (err?.errorCode) {
    errorData = err;
  }
  
  const code = errorData.errorCode;
  const msg = errorData.message;
  
  console.log('Parsed error data:', { code, msg, errorData });
  
  // Handle unavailability-specific errors
  if (code && code.includes('Cannot mark unavailable')) {
    if (code.includes('overlapping bookings exist')) {
      // Extract booking count if available
      const approvedMatch = code.match(/APPROVED=(\d+)/);
      const pendingMatch = code.match(/PENDING=(\d+)/);
      
      let bookingDetails = '';
      if (approvedMatch || pendingMatch) {
        const approved = approvedMatch ? parseInt(approvedMatch[1]) : 0;
        const pending = pendingMatch ? parseInt(pendingMatch[1]) : 0;
        
        const parts = [];
        if (approved > 0) parts.push(`${approved} approved booking${approved !== 1 ? 's' : ''}`);
        if (pending > 0) parts.push(`${pending} pending booking${pending !== 1 ? 's' : ''}`);
        
        bookingDetails = ` (${parts.join(' and ')})`;
      }
      
      toast.error(`Cannot block this date: There are existing bookings that must be cancelled first${bookingDetails}.`);
      return;
    }
    
    if (code.includes('already exists') || code.includes('already marked unavailable')) {
      toast.info('This date is already blocked for this court.');
      return;
    }
    
    // Generic unavailability error
    toast.error('Cannot mark court unavailable: ' + (msg || code));
    return;
  }
  
  switch (code) {
    // Booking conflicts
    case 'SLOT_ALREADY_BOOKED':
      toast.warning('That time slot was just booked by someone else. Please choose another slot.');
      break;
      
    case 'COURT_UNAVAILABLE_THIS_DAY':
      toast.warning('This court just became unavailable for this date. Please pick another date.');
      break;
      
    // Blockout conflicts  
    case 'BLOCKOUT_CONFLICT_WITH_BOOKINGS':
      toast.error('Cannot block this date: Existing bookings must be cancelled first.');
      break;
      
    case 'UNAVAILABILITY_ALREADY_EXISTS':
      toast.info('This date is already blocked for this court.');
      break;
      
    // Permission errors
    case 'FORBIDDEN':
      toast.error('Access denied: You do not have permission to perform this action.');
      break;
      
    // Resource errors  
    case 'COURT_NOT_FOUND':
      toast.error('Court not found. Please refresh and try again.');
      break;
      
    case 'BOOKING_NOT_FOUND':
      toast.error('Booking not found. It may have been cancelled or modified.');
      break;
      
    // Validation errors
    case 'VALIDATION_ERROR':
    case 'INVALID_DATE':
    case 'INVALID_TIME_SLOT':
      toast.error('Invalid input: ' + (msg || 'Please check your data and try again.'));
      break;
      
    // Date/time specific errors
    case 'DATE_IN_PAST':
      toast.error('Cannot set unavailability for past dates.');
      break;
      
    case 'INVALID_DATE_FORMAT':
      toast.error('Invalid date format. Please use the date picker.');
      break;
      
    // Generic server errors
    case 'INTERNAL_SERVER_ERROR':
      toast.error('Server error occurred. Please try again in a moment.');
      break;
      
    // Network/timeout errors
    default:
      if (err?.code === 'NETWORK_ERROR' || err?.message?.includes('timeout')) {
        toast.error('Connection error. Please check your internet connection and try again.');
      } else if (msg && msg.trim()) {
        // Show server message if available and meaningful
        toast.error(msg);
      } else {
        // Last resort: use provided default or generic message
        toast.error(defaultMessage || 'An unexpected error occurred. Please try again.');
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