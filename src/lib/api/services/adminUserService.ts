/**
 * Admin User Management Service
 * Handles all admin-specific user operations
 */

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
});

const BASE_URL = import.meta.env.VITE_API_URL;

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
  const response = await fetch(`${BASE_URL}/admin/users/create-admin`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      ...data,
      returnPlainPassword: data.returnPlainPassword ?? false,
      requirePasswordResetOnFirstLogin: false, // Always create confirmed/permanent
      markEmailVerified: true
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    if (response.status === 409) {
      throw new Error('Email or phone already in use.');
    }
    if (response.status === 400) {
      throw new Error(error.message || 'Password does not meet complexity requirements');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to create admin');
  }

  return response.json();
}

export async function resetUserPassword(
  userId: number,
  data: ResetPasswordRequest
): Promise<ResetPasswordResponse> {
  const response = await fetch(`${BASE_URL}/admin/users/reset-password/${userId}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      ...data,
      requirePasswordResetOnFirstLogin: data.requirePasswordResetOnFirstLogin ?? false,
      returnPlainPassword: data.returnPlainPassword ?? false
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    
    if (response.status === 409) {
      throw new Error('Enable user before resetting password.');
    }
    if (response.status === 400) {
      throw new Error(error.message || 'Password does not meet complexity requirements');
    }
    if (response.status === 404) {
      throw new Error('User not found');
    }
    if (response.status === 429) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    throw new Error(error.message || 'Failed to reset password');
  }

  return response.json();
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
