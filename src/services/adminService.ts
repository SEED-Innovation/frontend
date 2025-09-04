import { AdminUser } from '@/types/admin';

export interface AdminService {
  getAllAdmins(): Promise<AdminUser[]>;
}

class AdminServiceImpl implements AdminService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAllAdmins(): Promise<AdminUser[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/courts/all-admins`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch admins: ${response.statusText}`);
    }

    const admins = await response.json();
    return admins || [];
  }
}

export const adminService = new AdminServiceImpl();