// ================================
// 📅 REAL UNAVAILABILITY API SERVICE
// ================================

import { UnavailabilityRow, SetUnavailabilityRequest, UnavailabilityFilters } from './types';

class UnavailabilityService {
  private baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  
  private getToken(): string {
    return localStorage.getItem('accessToken') || '';
  }

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
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(`API Error: ${response.status} ${response.statusText}`);
      (error as any).response = { data: errorData };
      throw error;
    }

    return response;
  }

  /**
   * Get all unavailabilities with optional filtering
   */
  async getUnavailabilities(filters?: UnavailabilityFilters): Promise<UnavailabilityRow[]> {
    console.log('🔄 Fetching unavailabilities with filters:', filters);
    
    try {
      const url = new URL(`${this.baseUrl}/api/admin/courts/unavailability`);
      
      if (filters?.searchTerm) {
        url.searchParams.set('search', filters.searchTerm);
      }
      
      const response = await this.makeAPICall(url.toString());
      const data = await response.json();
      
      console.log('✅ Real unavailability data:', data);
      return Array.isArray(data) ? data : data.content || [];
      
    } catch (error) {
      console.error('❌ Failed to fetch unavailabilities:', error);
      throw error;
    }
  }

  /**
   * Mark a court as unavailable for a specific date
   */
  async markUnavailable(request: SetUnavailabilityRequest): Promise<UnavailabilityRow> {
    console.log('🚫 Marking court unavailable:', request);
    
    try {
      const response = await this.makeAPICall(`${this.baseUrl}/admin/courts/mark-unavailable`, {
        method: 'POST',
        body: JSON.stringify(request)
      });
      
      const data = await response.json();
      console.log('✅ Court marked unavailable:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to mark court unavailable:', error);
      throw error;
    }
  }

  /**
   * Remove unavailability (make court available again)
   */
  async removeUnavailability(unavailabilityId: number): Promise<void> {
    console.log('✅ Removing unavailability:', unavailabilityId);
    
    try {
      await this.makeAPICall(`${this.baseUrl}/admin/courts/unavailability/${unavailabilityId}`, {
        method: 'DELETE'
      });
      
      console.log('✅ Unavailability removed');
      
    } catch (error) {
      console.error('❌ Failed to remove unavailability:', error);
      throw error;
    }
  }

  /**
   * Bulk delete unavailabilities
   */
  async bulkDeleteUnavailabilities(ids: number[]): Promise<void> {
    console.log('📦 Bulk deleting unavailabilities:', ids);
    
    try {
      await this.makeAPICall(`${this.baseUrl}/admin/courts/unavailability/bulk`, {
        method: 'DELETE',
        body: JSON.stringify({ ids })
      });
      
      console.log('✅ Bulk delete completed');
      
    } catch (error) {
      console.error('❌ Bulk delete failed:', error);
      throw error;
    }
  }
}

export const unavailabilityService = new UnavailabilityService();