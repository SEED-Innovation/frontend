/**
 * Admin User Management Service
 * Handles all admin-specific user operations
 */

import { apiClient } from '../client';

// ================================
// REQUEST TYPES
// ================================

export interface CreateAdminRequest {
  email: string;
  phone?: string;
  fullName: string;
  password: string;
  returnPlainPassword?: boolean;
  requirePasswordResetOnFirstLogin?: boolean;
  markEmailVerified?: boolean;
}

export interface ResetPasswordRequest {
  newPassword: string;
  requirePasswordResetOnFirstLogin?: boolean;
  returnPlainPassword?: boolean;
}

export interface UpdateUserStatusRequest {
  enabled: boolean;
  forceLogout?: boolean;
}

// ================================
// RESPONSE TYPES
// ================================

export interface CreateAdminResponse {
  id: number;
  cognitoSub: string;
  email: string;
  phone?: string;
  role: string;
  enabled: boolean;
  isVerified: boolean;
  username: string;
  passwordPlain: string | null;
  passwordMasked: string;
  temporaryPassword: boolean;
}

export interface ResetPasswordResponse {
  username: string;
  passwordPlain: string | null;
  passwordMasked: string;
  temporaryPassword: boolean;
}

export interface AuditEntry {
  id: string;
  action: 'CREATED' | 'ENABLED' | 'DISABLED' | 'PASSWORD_RESET' | 'UPDATED';
  actor: string;
  timestamp: string;
  details?: string;
}

// ================================
// API FUNCTIONS
// ================================

export async function createAdmin(data: CreateAdminRequest): Promise<CreateAdminResponse> {
  try {
    return await apiClient.post<CreateAdminResponse>('/admin/users/create-admin', {
      ...data,
      returnPlainPassword: data.returnPlainPassword ?? false,
      requirePasswordResetOnFirstLogin: false, // Always create confirmed/permanent
      markEmailVerified: true
    });
  } catch (error: any) {
    if (error.status === 409) {
      throw new Error('Email or phone already in use.');
    }
    if (error.status === 400) {
      throw new Error(error.data?.message || 'Password does not meet complexity requirements');
    }
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(error.data?.message || 'Failed to create admin');
  }
}

export async function resetUserPassword(
  userId: number,
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  try {
    return await apiClient.post<ResetPasswordResponse>(`/admin/users/reset-password/${userId}`, {
      ...data,
      requirePasswordResetOnFirstLogin: data.requirePasswordResetOnFirstLogin ?? false,
      returnPlainPassword: data.returnPlainPassword ?? false
    });
  } catch (error: any) {
    if (error.status === 409) {
      throw new Error('Enable user before resetting password.');
    }
    if (error.status === 400) {
      throw new Error(error.data?.message || 'Password does not meet complexity requirements');
    }
    if (error.status === 404) {
      throw new Error('User not found');
    }
    if (error.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(error.data?.message || 'Failed to reset password');
  }
}

export async function updateUserStatus(
  userId: number,
  data: UpdateUserStatusRequest
): Promise<void> {
  const response = await fetch(`${BASE_URL}/admin/users/status/${userId}`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    if (response.status === 404) {
      throw new Error('User not found');
    }
    if (response.status === 403) {
      throw new Error('Access denied');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to update user status');
  }
}

// Mock audit log - replace with actual endpoint when available
export async function getUserAuditLog(userId: number): Promise<AuditEntry[]> {
  // TODO: Replace with actual backend endpoint when ready
  // const response = await fetch(`${BASE_URL}/admin/users/${userId}/audit`, {
  //   headers: authHeaders()
  // });
  
  // For now, return mock data
  return [];
}
