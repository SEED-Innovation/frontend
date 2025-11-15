import { apiClient } from '../client';

export interface User {
  id: number;
  cognitoId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  skillLevel?: string;
  createdAt: string;
}

export interface Booking {
  id: number;
  userId: number;
  courtId: number;
  courtName?: string;
  facilityName?: string;
  startTime: string;
  endTime: string;
  status: string;
  matchType?: string;
  createdAt: string;
}

export interface CreateAdminResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  passwordPlain?: string;
  temporaryPassword?: string;
}

export interface AuditEntry {
  id: number;
  action: 'CREATED' | 'ENABLED' | 'DISABLED' | 'PASSWORD_RESET' | 'UPDATED';
  actor: string;
  timestamp: string;
  details?: string;
}

export const adminUserService = {
  /**
   * Get all users (paginated)
   */
  async getAllUsers(page: number = 0, size: number = 100): Promise<{
    users: User[];
    totalElements: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<any>(`/api/admin/users/paged?page=${page}&size=${size}`);
    return response;
  },

  /**
   * Search users by email or name
   */
  async searchUsers(query: string): Promise<User[]> {
    const response = await apiClient.get<{ users: User[] }>(`/api/admin/users/paged?page=0&size=50`);
    const allUsers = response.users || [];
    
    // Client-side filtering
    const searchLower = query.toLowerCase();
    return allUsers.filter(user => 
      user.email?.toLowerCase().includes(searchLower) ||
      user.firstName?.toLowerCase().includes(searchLower) ||
      user.lastName?.toLowerCase().includes(searchLower) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
    );
  },

  /**
   * Get bookings for a specific user
   */
  async getUserBookings(userId: number, page: number = 0, size: number = 50): Promise<Booking[]> {
    const response = await apiClient.get<Booking[]>(`/api/admin/bookings/user/${userId}?page=${page}&size=${size}`);
    return response;
  },

  /**
   * Reset user password (admin only)
   */
  async resetUserPassword(userId: number, data: { newPassword: string; returnPlainPassword?: boolean }): Promise<{ 
    message: string; 
    plainPassword?: string;
    temporaryPassword?: string;
  }> {
    const response = await apiClient.post(`/api/admin/users/${userId}/reset-password`, data);
    return response;
  },

  /**
   * Update user status (enable/disable)
   */
  async updateUserStatus(userId: number, data: { enabled: boolean; forceLogout?: boolean }): Promise<{ 
    message: string;
  }> {
    const response = await apiClient.patch(`/api/admin/users/${userId}/status`, data);
    return response;
  },

  /**
   * Create a new admin user
   */
  async createAdmin(data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    returnPlainPassword?: boolean;
  }): Promise<CreateAdminResponse> {
    const response = await apiClient.post<CreateAdminResponse>('/api/admin/users/create-admin', data);
    return response;
  },

  /**
   * Get audit log for a user
   */
  async getUserAuditLog(userId: number): Promise<AuditEntry[]> {
    const response = await apiClient.get<AuditEntry[]>(`/api/admin/users/${userId}/audit-log`);
    return response;
  },
};

// Export individual functions for convenience
export const { 
  getAllUsers, 
  searchUsers, 
  getUserBookings, 
  resetUserPassword,
  updateUserStatus,
  createAdmin,
  getUserAuditLog,
} = adminUserService;
