import { AdminUserPageResponse } from '@/types/user';
import { apiClient } from '../client';

const BASE = '/admin/users';

export async function getUsersPaged(page = 0, size = 50): Promise<AdminUserPageResponse> {
  const params = new URLSearchParams();
  params.set('page', String(Math.max(0, page)));
  params.set('size', String(Math.min(100, Math.max(1, size))));
  
  return apiClient.get<AdminUserPageResponse>(`${BASE}/paged?${params}`);
}

export async function getAdminsPaged(page = 0, size = 50): Promise<AdminUserPageResponse> {
  const params = new URLSearchParams();
  params.set('page', String(Math.max(0, page)));
  params.set('size', String(Math.min(100, Math.max(1, size))));
  
  return apiClient.get<AdminUserPageResponse>(`${BASE}/admins-paged?${params}`);
}

export async function updateUserEnabled(id: number, enabled: boolean) {
  return apiClient.put(`${BASE}/update`, { id, enabled });
}

export async function enableUser(userId: number) {
  return apiClient.patch(`${BASE}/${userId}/status/enable`);
}

export async function disableUser(userId: number) {
  return apiClient.patch(`${BASE}/${userId}/status/disable`);
}