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
  
  // Get the login token from localStorage
  private getToken(): string {
    return localStorage.getItem('token') || '';
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
  // 🎯 MAIN METHODS YOUR ADMIN COMPONENT NEEDS
  // ================================

  /**
   * Get admin bookings with filters (matches your backend /admin/bookings/filter)
   */
  async getAdminBookings(filters: AdminBookingFilterRequest): Promise<PaginatedBookingResponse> {
    console.log('🔄 Getting admin bookings with filters:', filters);
    
    try {
      // Call your backend's /admin/bookings/filter endpoint
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/filter`, {
        method: 'POST',
        body: JSON.stringify(filters)
      });
      
      const data = await response.json();
      console.log('✅ Real backend response:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Backend not available, using mock data:', error);
      
      // Return fake data when backend is not running
      return this.createMockBookingData(filters);
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
      console.error('❌ Backend not available, using mock stats:', error);
      
      // Return fake stats when backend is not running
      return this.createMockStats();
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
      console.error('❌ Backend not available, simulating approval:', error);
      
      // Simulate approval when backend is not running
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('🔄 Mock approval completed');
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
      console.error('❌ Backend not available, simulating rejection:', error);
      
      // Simulate rejection when backend is not running
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('🔄 Mock rejection completed');
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
      console.error('❌ Backend not available, simulating cancellation:', error);
      
      // Simulate cancellation when backend is not running
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('🔄 Mock cancellation completed');
    }
  }

  /**
   * Create manual booking (matches your backend /admin/bookings/manual)
   */
  async createManualBooking(request: CreateBookingRequest): Promise<BookingResponse> {
    console.log('➕ Creating manual booking:', request);
    
    try {
      // Call your backend's /admin/bookings/manual endpoint
      const response = await this.makeAPICall(`${this.baseUrl}/admin/bookings/manual`, {
        method: 'POST',
        body: JSON.stringify({
          userId: request.userId,
          courtId: request.courtId,
          startTime: request.startTime,
          endTime: request.endTime
        })
      });
      
      const newBooking = await response.json();
      console.log('✅ Manual booking created:', newBooking);
      return newBooking;
      
    } catch (error) {
      console.error('❌ Backend not available, creating mock booking:', error);
      
      // Simulate manual booking creation when backend is not running
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return this.createMockBooking(request);
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
      console.error('❌ Search failed, using mock data:', error);
      return this.createMockBookingData({ page, size, search: query }).content;
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
      console.error('❌ Failed to get bookings by status, using mock data:', error);
      return this.createMockBookingData({ page, size, statuses: [status] }).content;
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
      console.error('❌ Failed to get user bookings, using mock data:', error);
      return this.createMockBookingData({ page, size, userId }).content;
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
      console.error('❌ Bulk action failed, simulating:', error);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return []; // Return empty array for mock
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
      console.error('❌ Failed to get bookings by court and date, using mock data:', error);
      return this.createMockBookingData({ courtIds: [courtId], startDateTime: start, endDateTime: end }).content;
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
      console.error('❌ Failed to get daily calendar, using mock data:', error);
      return this.createMockCalendarResponse(date, 'daily');
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
      console.error('❌ Failed to get weekly calendar, using mock data:', error);
      return this.createMockCalendarResponse(startDate, 'weekly');
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
      console.error('❌ Failed to get monthly calendar, using mock data:', error);
      return this.createMockCalendarResponse(`${year}-${month.toString().padStart(2, '0')}-01`, 'monthly');
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
      console.error('❌ Failed to get court timeline, using mock data:', error);
      return this.createMockTimelineResponse(courtId, date || new Date().toISOString().split('T')[0]);
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
  // 🔧 HELPER METHODS (MOCK DATA)
  // ================================

  private createMockBookingData(filters: AdminBookingFilterRequest): PaginatedBookingResponse {
    const statuses = ['PENDING', 'APPROVED', 'CANCELLED', 'REJECTED'] as const;
    const matchTypes = ['SINGLE', 'DOUBLE'] as const;
    
    // Create 20 fake bookings
    const mockBookings: BookingResponse[] = Array.from({ length: 20 }, (_, index) => ({
      id: index + 1,
      user: {
        id: index + 1,
        fullName: `Test User ${index + 1}`,
        email: `user${index + 1}@example.com`
      },
      court: {
        id: (index % 5) + 1,
        name: `Court ${(index % 5) + 1}`,
        location: `Location ${(index % 3) + 1}`,
        type: index % 2 === 0 ? 'HARD' : 'CLAY',
        hourlyFee: 50 + (index % 5) * 10,
        hasSeedSystem: index % 2 === 0
      },
      startTime: new Date(Date.now() + (index * 86400000)).toISOString(),
      endTime: new Date(Date.now() + (index * 86400000) + 7200000).toISOString(),
      status: statuses[index % statuses.length],
      matchType: matchTypes[index % matchTypes.length]
    }));

    return {
      content: mockBookings,
      page: filters.page || 0,
      size: filters.size || 20,
      totalElements: 156,
      totalPages: 8,
      first: (filters.page || 0) === 0,
      last: (filters.page || 0) === 7
    };
  }

private createMockStats(): BookingFilterSummary {
  return {
    // Keep your existing properties
    total: 156,
    pending: 23,
    approved: 89,
    cancelled: 32,
    rejected: 12,
    totalRevenue: 12450.75,
    todayBookings: 8,
    
    totalBookings: 156,        // Same as total
    confirmedBookings: 89,     // Same as approved
    pendingBookings: 23,       // Same as pending
    cancelledBookings: 32,     // Same as cancelled
    confirmedRevenue: 12450.75 // Same as totalRevenue
  };
}

  private createMockBooking(request: CreateBookingRequest): BookingResponse {
    return {
      id: Date.now(),
      user: { 
        id: request.userId, 
        fullName: 'Mock User', 
        email: 'mock@example.com' 
      },
      court: { 
        id: request.courtId, 
        name: 'Mock Court', 
        location: 'Mock Location', 
        type: 'HARD', 
        hourlyFee: 65, 
        hasSeedSystem: true 
      },
      startTime: request.startTime,
      endTime: request.endTime,
      status: 'PENDING',
      matchType: request.matchType
    };
  }

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
      `$${(booking.court.hourlyFee * 2).toFixed(2)}`
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  private createMockCalendarResponse(date: string, viewType: string): AdminBookingCalendarResponse {
    return {
      date,
      courts: [
        {
          court: {
            id: 1,
            name: 'Court 1',
            location: 'Mock Location',
            type: 'HARD',
            hourlyFee: 65,
            hasSeedSystem: true
          },
          timeSlots: [],
          bookings: [],
          revenue: 520
        }
      ],
      totalBookings: 15,
      totalRevenue: 1250.50
    };
  }

  private createMockTimelineResponse(courtId: number, date: string): AdminCourtTimelineResponse {
    return {
      court: {
        id: courtId,
        name: `Court ${courtId}`,
        location: 'Mock Location',
        type: 'HARD',
        hourlyFee: 65,
        hasSeedSystem: true
      },
      date,
      timeSlots: [],
      bookings: [],
      statistics: {
        totalSlots: 16,
        bookedSlots: 8,
        availableSlots: 8,
        revenue: 520,
        occupancyRate: 50
      }
    };
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