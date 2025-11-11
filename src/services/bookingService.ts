// Import all the types we need
import { 
  BookingResponse,
  AdminBookingFilterRequest,
  PaginatedBookingResponse,
  BookingFilterSummary,
  CreateBookingRequest,
  AdminBookingCalendarResponse,
  AdminCourtTimelineResponse,
  AdminBookingFilterResponse
} from '@/types/booking';

// Simple, clean BookingService class
export class BookingService {
  // Use your .env file for the API URL (no /api suffix since controller is /admin/bookings)
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  // Get the login token from localStorage (matches useAdminAuth)
  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }

  // Helper method to make API calls with authentication
  private async makeAPICall(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response;
  }

  // ================================
  // 🎯 AVAILABILITY & BOOKING METHODS
  // ================================

  /**
   * Check court availability for a specific date and duration
   * This is the single source of truth for customer booking flow
   */
  async fetchAvailability(courtId: number, dateISO: string, durationMinutes: number = 60): Promise<{
    courtId: number;
    courtName: string;
    date: string;
    durationMinutes: number;
    availableSlots: Array<{ start: string; end: string; label: string; available: boolean; price: number }>;
    unavailableSlots: string[];
    availableCount: number;
    message?: string;
  }> {
    console.log('🔄 Fetching availability for court:', courtId, 'date:', dateISO, 'duration:', durationMinutes);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/courts/${courtId}/availability`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add query params
      const url = new URL(`${this.baseUrl}/courts/${courtId}/availability`);
      url.searchParams.set('date', dateISO);
      url.searchParams.set('durationMinutes', durationMinutes.toString());

      const finalResponse = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${this.getToken()}`,
        },
      });

      if (!finalResponse.ok) {
        throw new Error(`API Error: ${finalResponse.status} ${finalResponse.statusText}`);
      }

      const data = await finalResponse.json();
      console.log('✅ Real availability data:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Availability API failed:', error);
      throw error;
    }
  }



  // ================================
  // 🎯 MAIN ADMIN METHODS
  // ================================

  /**
   * Get admin bookings with filters (matches your backend /admin/bookings/filter)
   * Automatically handles SUPER_ADMIN vs regular ADMIN permissions
   */
  async getAdminBookings(filters: AdminBookingFilterRequest): Promise<PaginatedBookingResponse> {
    console.log('🔄 Getting admin bookings with filters:', filters);
    
    try {
      // Get user role from token to determine endpoint behavior
      const token = this.getToken();
      let userRole = 'ADMIN'; // default
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userRole = payload["cognito:groups"]?.[0] || 'ADMIN';
        } catch (e) {
          console.warn('Could not decode token for role check');
        }
      }

      console.log('👤 User role:', userRole);
      
      // Enhance filters with role-based logic
      const enhancedFilters = {
        ...filters,
        // For SUPER_ADMIN, ensure we don't restrict by court assignments
        // The backend will handle this based on the user's role in the JWT
      };

      // Call your backend's /admin/bookings/filter endpoint
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/filter`, {
        method: 'POST',
        body: JSON.stringify(enhancedFilters)
      });
      
      const data = await response.json();
      console.log('✅ Real backend response:', data);
      console.log(`📊 Fetched ${data.bookings?.length || 0} bookings (Role: ${userRole})`);
      return data;
      
    } catch (error) {
      console.error('❌ Backend not available:', error);
      
      // Don't return mock data, let the component handle the error
      throw new Error(`Failed to fetch bookings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get booking statistics (matches your backend /admin/bookings/stats)
   */
  async getBookingStats(): Promise<BookingFilterSummary> {
    console.log('🔄 Getting booking statistics');
    
    try {
      // Call your backend's /admin/bookings/stats endpoint
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/stats`);
      
      const data = await response.json();
      console.log('✅ Real backend stats:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get booking stats:', error);
      throw error;
    }
  }

  /**
   * Approve a booking (matches your backend /admin/bookings/approve)
   */
  async approveBooking(bookingId: number, reason?: string): Promise<void> {
    console.log('✅ Approving booking:', bookingId, 'reason:', reason);
    
    try {
      // Call your backend's /admin/bookings/approve endpoint
      await this.makeAPICall(`${this.baseUrl}/admin/bookings/approve`, {
        method: 'POST',
        body: JSON.stringify({ bookingId, reason })
      });
      
      console.log('✅ Booking approved successfully');
      
    } catch (error) {
      console.error('❌ Failed to approve booking:', error);
      throw error;
    }
  }

  /**
   * Reject a booking (matches your backend /admin/bookings/reject)
   */
  async rejectBooking(bookingId: number, reason: string): Promise<void> {
    console.log('❌ Rejecting booking:', bookingId, 'reason:', reason);
    
    try {
      // Call your backend's /admin/bookings/reject endpoint
      await this.makeAPICall(`${this.baseUrl}/admin/bookings/reject`, {
        method: 'POST',
        body: JSON.stringify({ bookingId, reason })
      });
      
      console.log('✅ Booking rejected successfully');
      
    } catch (error) {
      console.error('❌ Failed to reject booking:', error);
      throw error;
    }
  }

  /**
   * Cancel a booking (matches your backend /admin/bookings/cancel)
   */
  async cancelBooking(bookingId: number, reason?: string): Promise<void> {
    console.log('🚫 Cancelling booking:', bookingId, 'reason:', reason);
    
    try {
      // Call your backend's /admin/bookings/cancel endpoint
      await this.makeAPICall(`${this.baseUrl}/admin/bookings/cancel`, {
        method: 'POST',
        body: JSON.stringify({ bookingId, reason })
      });
      
      console.log('✅ Booking cancelled successfully');
      
    } catch (error) {
      console.error('❌ Failed to cancel booking:', error);
      throw error;
    }
  }

  /**
   * Create manual booking (matches your backend /admin/bookings/manual)
   */
  async createManualBooking(request: CreateBookingRequest & { 
    sendReceiptEmail?: boolean; 
    customerEmail?: string; 
  }): Promise<BookingResponse> {
    console.log('➕ Creating manual booking:', request);
    
    try {
      // Call your backend's /admin/bookings/manual endpoint
      const requestBody: any = {
        userId: request.userId,
        courtId: request.courtId,
        date: request.date,
        startTime: request.startTime,
        durationMinutes: request.durationMinutes,
        matchType: request.matchType,
        paymentMethod: 'PENDING', // Default for compatibility
        sendReceiptEmail: request.sendReceiptEmail || false,
        customerEmail: request.customerEmail || undefined
      };
      
      // Only add notes if it exists and is not empty
      if (request.notes && request.notes.trim()) {
        requestBody.notes = request.notes;
      }
      
      console.log('📤 Sending request body:', requestBody);
      
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/manual`, {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });
      
      const newBooking = await response.json();
      console.log('✅ Manual booking created:', newBooking);
      return newBooking;
      
    } catch (error) {
      console.error('❌ Manual booking creation failed:', error);
      // Don't fall back to mock data - let the error bubble up
      // This way you can see the real backend error and fix it
      throw error;
    }
  }

  /**
   * Search bookings by query (matches your backend /admin/bookings/search)
   */
  async searchBookings(query: string, page = 0, size = 20): Promise<BookingResponse[]> {
    console.log('🔍 Searching bookings with query:', query);
    
    try {
      const response = await this.makeAPICall(
        `${this.baseUrl}/admin/bookings/search?query=${encodeURIComponent(query)}&page=${page}&size=${size}`
      );
      
      const data = await response.json();
      console.log('✅ Search results:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Search failed:', error);
      throw error;
    }
  }

  /**
   * Get bookings by status (matches your backend /admin/bookings/status/{status})
   */
  async getBookingsByStatus(status: string, page = 0, size = 20): Promise<BookingResponse[]> {
    console.log('📊 Getting bookings by status:', status);
    
    try {
      const response = await this.makeAPICall(
        `${this.baseUrl}/admin/bookings/status/${status}?page=${page}&size=${size}`
      );
      
      const data = await response.json();
      console.log('✅ Bookings by status:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get bookings by status:', error);
      throw error;
    }
  }

  /**
   * Get bookings for a specific user (matches your backend /admin/bookings/user/{userId})
   */
  async getBookingsForUser(userId: number, page = 0, size = 20): Promise<BookingResponse[]> {
    console.log('👤 Getting bookings for user:', userId);
    
    try {
      const response = await this.makeAPICall(
        `${this.baseUrl}/admin/bookings/user/${userId}?page=${page}&size=${size}`
      );
      
      const data = await response.json();
      console.log('✅ User bookings:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get user bookings:', error);
      throw error;
    }
  }

  /**
   * Bulk booking actions (matches your backend /admin/bookings/bulk-action)
   */
  async bulkBookingAction(bookingIds: number[], action: 'APPROVE' | 'REJECT' | 'CANCEL', reason?: string): Promise<BookingResponse[]> {
    console.log('📦 Performing bulk action:', action, 'on bookings:', bookingIds);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/bulk-action`, {
        method: 'POST',
        body: JSON.stringify({
          bookingIds,
          action,
          reason
        })
      });
      
      const data = await response.json();
      console.log('✅ Bulk action completed:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Bulk action failed:', error);
      throw error;
    }
  }

  /**
   * Get bookings by court and date range (matches your backend /admin/bookings/range)
   */
  async getBookingsByCourtAndDate(courtId: number, start: string, end: string): Promise<BookingResponse[]> {
    console.log('📅 Getting bookings by court and date:', { courtId, start, end });
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/range`, {
        method: 'POST',
        body: JSON.stringify({
          courtId,
          start,
          end
        })
      });
      
      const data = await response.json();
      console.log('✅ Bookings by court and date:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get bookings by court and date:', error);
      throw error;
    }
  }

  /**
   * Get daily calendar (matches your backend /admin/bookings/calendar/daily/{date})
   */
  async getDailyCalendar(date: string): Promise<AdminBookingCalendarResponse> {
    console.log('📅 Getting daily calendar for:', date);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/calendar/daily/${date}`);
      
      const data = await response.json();
      console.log('✅ Daily calendar:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get daily calendar:', error);
      throw error;
    }
  }

  /**
   * Get weekly calendar (matches your backend /admin/bookings/calendar/weekly/{date})
   */
  async getWeeklyCalendar(startDate: string): Promise<AdminBookingCalendarResponse> {
    console.log('📅 Getting weekly calendar starting from:', startDate);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/calendar/weekly/${startDate}`);
      
      const data = await response.json();
      console.log('✅ Weekly calendar:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get weekly calendar:', error);
      throw error;
    }
  }

  /**
   * Get monthly calendar (matches your backend /admin/bookings/calendar/monthly/{year}/{month})
   */
  async getMonthlyCalendar(year: number, month: number): Promise<AdminBookingCalendarResponse> {
    console.log('📅 Getting monthly calendar for:', year, month);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/calendar/monthly/${year}/${month}`);
      
      const data = await response.json();
      console.log('✅ Monthly calendar:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get monthly calendar:', error);
      throw error;
    }
  }

  /**
   * Get court timeline (matches your backend /admin/bookings/timeline/{courtId})
   */
  async getCourtTimeline(courtId: number, date?: string): Promise<AdminCourtTimelineResponse> {
    console.log('🏟️ Getting court timeline for court:', courtId, 'date:', date);
    
    try {
      const url = date 
        ? `${this.baseUrl}/admin/bookings/timeline/${courtId}?date=${date}`
        : `${this.baseUrl}/admin/bookings/timeline/${courtId}`;
        
      const response = await this.makeAPICall(url);
      
      const data = await response.json();
      console.log('✅ Court timeline:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get court timeline:', error);
      throw error;
    }
  }

  /**
   * Get cancelled bookings for facility admin (matches your backend /admin/bookings/cancelled)
   */
  async getCancelledBookings(filters?: {
    courtId?: number;
    startDate?: string;
    endDate?: string;
    refundStatus?: string;
    page?: number;
    size?: number;
  }): Promise<PaginatedBookingResponse> {
    console.log('🚫 Getting cancelled bookings with filters:', filters);
    
    try {
      const params = new URLSearchParams();
      if (filters?.courtId) params.set('courtId', filters.courtId.toString());
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);
      if (filters?.refundStatus) params.set('refundStatus', filters.refundStatus);
      if (filters?.page !== undefined) params.set('page', filters.page.toString());
      if (filters?.size !== undefined) params.set('size', filters.size.toString());
      
      const queryString = params.toString();
      const url = `${this.baseUrl}/admin/bookings/cancelled${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeAPICall(url);
      const data = await response.json();
      
      console.log('✅ Cancelled bookings fetched:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get cancelled bookings:', error);
      throw error;
    }
  }

  /**
   * Get cancelled bookings summary statistics (super admin)
   */
  async getCancelledBookingsSummary(filters?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalCancelled: number;
    pendingRefunds: number;
    completedRefunds: number;
    totalRefundAmount: number;
  }> {
    console.log('📊 Getting cancelled bookings summary:', filters);
    
    try {
      const params = new URLSearchParams();
      if (filters?.startDate) params.set('startDate', filters.startDate);
      if (filters?.endDate) params.set('endDate', filters.endDate);
      
      const queryString = params.toString();
      const url = `${this.baseUrl}/admin/bookings/cancelled/summary${queryString ? `?${queryString}` : ''}`;
      
      const response = await this.makeAPICall(url);
      const data = await response.json();
      
      console.log('✅ Cancelled bookings summary:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get cancelled bookings summary:', error);
      throw error;
    }
  }

  /**
   * Mark a booking as refunded (super admin only)
   */
  async markBookingAsRefunded(bookingId: number, refundReference: string, notes?: string): Promise<BookingResponse> {
    console.log('💰 Marking booking as refunded:', bookingId, 'reference:', refundReference);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/super-admin/bookings/${bookingId}/mark-refunded`, {
        method: 'POST',
        body: JSON.stringify({
          refundReference,
          notes
        })
      });
      
      const data = await response.json();
      console.log('✅ Booking marked as refunded:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to mark booking as refunded:', error);
      throw error;
    }
  }

  /**
   * Bulk mark bookings as refunded (super admin only)
   */
  async bulkMarkAsRefunded(bookingIds: number[], refundReference: string, notes?: string): Promise<{
    successCount: number;
    failureCount: number;
    results: Array<{ bookingId: number; success: boolean; message?: string }>;
  }> {
    console.log('💰 Bulk marking bookings as refunded:', bookingIds, 'reference:', refundReference);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/super-admin/bookings/bulk-mark-refunded`, {
        method: 'POST',
        body: JSON.stringify({
          bookingIds,
          refundReference,
          notes
        })
      });
      
      const data = await response.json();
      console.log('✅ Bulk refund marking completed:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to bulk mark as refunded:', error);
      throw error;
    }
  }

  /**
   * Get audit trail for a booking (super admin only)
   */
  async getBookingAuditTrail(bookingId: number): Promise<Array<{
    id: number;
    bookingId: number;
    actionType: string;
    performedBy: { id: number; fullName: string; email: string };
    performedAt: string;
    cancellationReason?: string;
    refundReference?: string;
    notes?: string;
  }>> {
    console.log('📋 Getting audit trail for booking:', bookingId);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/super-admin/bookings/${bookingId}/audit-trail`);
      
      const data = await response.json();
      console.log('✅ Audit trail fetched:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get audit trail:', error);
      throw error;
    }
  }

  /**
   * Export bookings to CSV
   */
  async exportBookings(filters: AdminBookingFilterRequest): Promise<void> {
    console.log('📤 Exporting bookings with filters:', filters);
    
    try {
      // Try to get real data first
      const bookings = await this.getAdminBookings(filters);
      
      // Create CSV content
      const csvContent = this.createCSVContent(bookings.content);
      
      // Download the CSV file
      this.downloadCSVFile(csvContent, `bookings-export-${new Date().toISOString().split('T')[0]}.csv`);
      
      console.log('✅ Bookings exported successfully');
      
    } catch (error) {
      console.error('❌ Export failed:', error);
    }
  }

  // ================================
  // 🔧 HELPER METHODS
  // ================================

  private createCSVContent(bookings: BookingResponse[]): string {
    const headers = ['ID', 'User', 'Email', 'Court', 'Date', 'Status', 'Match Type', 'Price'];
    
    const rows = bookings.map(booking => [
      booking.id.toString(),
      booking.user.fullName,
      booking.user.email,
      booking.court.name,
      new Date(booking.startTime).toLocaleDateString(),
      booking.status,
      booking.matchType,
      `${(booking.court.hourlyFee * 2).toFixed(2)}`
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private downloadCSVFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}

// Export the service instance
export const bookingService = new BookingService();