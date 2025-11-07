import { 
  Facility, 
  AdminFacilityPageResponse, 
  CreateFacilityRequest, 
  UpdateFacilityRequest 
} from '@/types/facility';

const API_BASE_URL = import.meta.env.VITE_API_URL;

class FacilityService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  private getMultipartHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': `Bearer ${token}`,
      // Don't set Content-Type for multipart, let browser set it with boundary
    };
  }

  async getAllFacilities(): Promise<Facility[]> {
    const response = await fetch(`${API_BASE_URL}/facilities/all`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. Please check your authentication.`);
      }
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }

    return response.json();
  }

  async getMyFacilities(): Promise<Facility[]> {
    const response = await fetch(`${API_BASE_URL}/facilities/admin/my-facilities`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. Please check your authentication.`);
      }
      throw new Error(`Failed to fetch facilities: ${response.statusText}`);
    }

    return response.json();
  }

  async getFacilitiesPage(page: number = 0, size: number = 20): Promise<AdminFacilityPageResponse> {
    // Note: Backend doesn't have paged endpoint yet, using regular endpoint
    const facilities = await this.getAllFacilities();
    
    // Simulate pagination on frontend for now
    const startIndex = page * size;
    const endIndex = startIndex + size;
    const paginatedFacilities = facilities.slice(startIndex, endIndex);
    
    return {
      content: paginatedFacilities,
      totalElements: facilities.length,
      totalPages: Math.ceil(facilities.length / size),
      size: size,
      number: page,
      first: page === 0,
      last: endIndex >= facilities.length,
      numberOfElements: paginatedFacilities.length,
      empty: paginatedFacilities.length === 0
    };
  }

  async getFacilityById(facilityId: number): Promise<Facility> {
    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. Please check your authentication.`);
      }
      throw new Error(`Failed to fetch facility: ${response.statusText}`);
    }

    return response.json();
  }

  async createFacility(facilityData: CreateFacilityRequest): Promise<Facility> {
    const response = await fetch(`${API_BASE_URL}/facilities/create`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(facilityData),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. Only super admins can create facilities.`);
      }
      const errorText = await response.text();
      throw new Error(errorText || `Failed to create facility: ${response.statusText}`);
    }

    return response.json();
  }

  async createFacilityWithImage(facilityData: CreateFacilityRequest, imageFile?: File): Promise<Facility> {
    const formData = new FormData();
    
    // Add facility data to form
    Object.entries(facilityData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/facilities/create`, {
      method: 'POST',
      headers: this.getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. Only super admins can create facilities.`);
      }
      const errorText = await response.text();
      throw new Error(errorText || `Failed to create facility: ${response.statusText}`);
    }

    return response.json();
  }

  async updateFacility(facilityId: number, facilityData: UpdateFacilityRequest): Promise<Facility> {
    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(facilityData),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. You don't have permission to update this facility.`);
      }
      const errorText = await response.text();
      throw new Error(errorText || `Failed to update facility: ${response.statusText}`);
    }

    return response.json();
  }

  async updateFacilityWithImage(
    facilityId: number, 
    facilityData: UpdateFacilityRequest, 
    imageFile?: File
  ): Promise<Facility> {
    const formData = new FormData();
    
    // Add facility data to form
    Object.entries(facilityData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach((item, index) => {
            formData.append(`${key}[${index}]`, item);
          });
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    // Add image if provided
    if (imageFile) {
      formData.append('image', imageFile);
    }

    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`, {
      method: 'PUT',
      headers: this.getMultipartHeaders(),
      body: formData,
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. You don't have permission to update this facility.`);
      }
      const errorText = await response.text();
      throw new Error(errorText || `Failed to update facility: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteFacility(facilityId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. Only super admins can delete facilities.`);
      }
      throw new Error(`Failed to delete facility: ${response.statusText}`);
    }
  }

  async updateFacilityStatus(
    facilityId: number, 
    status: 'ACTIVE' | 'INACTIVE' | 'DELETED', 
    reason?: string
  ): Promise<Facility> {
    const url = new URL(`${API_BASE_URL}/facilities/${facilityId}/status`);
    url.searchParams.append('status', status);
    if (reason) {
      url.searchParams.append('reason', reason);
    }

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to update facility status: ${response.statusText}`);
    }

    return response.json();
  }

  async getFacilityStatus(facilityId: number): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}/status`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to get facility status: ${response.statusText}`);
    }

    return response.text();
  }

  async assignAdminToFacility(facilityId: number, adminId: number): Promise<void> {
    const response = await fetch(
      `${API_BASE_URL}/facilities/${facilityId}/assign-admin/${adminId}`,
      {
        method: 'POST',
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to assign admin to facility: ${response.statusText}`);
    }
  }

  async getFacilitiesForAdmin(adminId: number): Promise<Facility[]> {
    const response = await fetch(`${API_BASE_URL}/facilities/admin/${adminId}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch facilities for admin: ${response.statusText}`);
    }

    return response.json();
  }

  async getUnassignedFacilities(): Promise<Facility[]> {
    const response = await fetch(`${API_BASE_URL}/facilities/unassigned`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unassigned facilities: ${response.statusText}`);
    }

    return response.json();
  }

  async canAdminManageFacility(facilityId: number, adminId: number): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/facilities/${facilityId}/can-manage/${adminId}`,
      {
        headers: this.getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to check facility management permission: ${response.statusText}`);
    }

    return response.json();
  }

  async getFacilityCourts(facilityId: number): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/facilities/${facilityId}/courts`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error(`Access denied. Please check your authentication.`);
      }
      if (response.status === 404) {
        throw new Error(`Facility with ID ${facilityId} not found.`);
      }
      throw new Error(`Failed to fetch facility courts: ${response.statusText}`);
    }

    return response.json();
  }
}

export const facilityService = new FacilityService();
export default facilityService;