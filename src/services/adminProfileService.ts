import { AdminProfileResponse } from '@/types/admin';

const API_URL = import.meta.env.VITE_API_URL;

export const adminProfileService = {
  async getCurrentAdminProfile(): Promise<AdminProfileResponse> {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_URL}/admin/profile/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch admin profile: ${response.statusText}`);
    }

    return response.json();
  },
};