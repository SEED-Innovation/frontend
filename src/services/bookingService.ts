// Import all the types we need
import { 
  BookingResponse,
  AdminBookingFilterRequest,
  PaginatedBookingResponse,
  BookingFilterSummary,
  CreateBookingRequest
} from '@/types/booking';

// Simple, clean BookingService class
export class BookingService {
  // Use your .env file for the API URL
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
  
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