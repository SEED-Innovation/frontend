/**
 * Player User Service
 * API service for player user operations including language preferences
 */

import { apiClient } from '../client';

export interface LanguageSelectionStatus {
  languageSelectionCompleted: boolean;
  currentLanguage: string;
  needsLanguageSelection: boolean;
}

export interface LanguagePreferenceResponse {
  languageCode: string;
  displayName: string;
  direction: string;
  isRTL: boolean;
}

export interface LanguagePreferenceRequest {
  languageCode: 'en' | 'ar';
}

export interface UserProfile {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  profilePictureUrl?: string;
  points?: number;
  allTimeRank?: number;
  monthlyRank?: number;
  badges: any[];
  skillLevel?: string;
  profileVisibility?: string;
  birthday?: string;
  height?: number;
  weight?: number;
  role: string;
  plan: string;
  enabled: boolean;
  guest: boolean;
}

const USERS_ENDPOINT = '/api/users';

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return apiClient.get<UserProfile>(`${USERS_ENDPOINT}/me`);
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<void> {
  return apiClient.patch<void>(`${USERS_ENDPOINT}/me`, profileData);
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);

  return apiClient.postFormData<UserProfile>(`${USERS_ENDPOINT}/profile-picture`, formData);
}

/**
 * Get user's language preference
 */
export async function getLanguagePreference(): Promise<LanguagePreferenceResponse> {
  return apiClient.get<LanguagePreferenceResponse>(`${USERS_ENDPOINT}/language-preference`);
}

/**
 * Update user's language preference
 */
export async function updateLanguagePreference(
  request: LanguagePreferenceRequest
): Promise<LanguagePreferenceResponse> {
  return apiClient.put<LanguagePreferenceResponse>(`${USERS_ENDPOINT}/language-preference`, request);
}

/**
 * Sync language preference with backend
 * This function combines local storage update with backend API call
 */
export async function syncLanguagePreference(languageCode: 'en' | 'ar'): Promise<LanguagePreferenceResponse> {
  try {
    // Update backend first
    const response = await updateLanguagePreference({ languageCode });
    
    // Update local storage on success
    localStorage.setItem('i18nextLng', languageCode);
    
    // Also update enhanced storage if available
    try {
      const { languageStorage } = await import('../../storage');
      languageStorage.setLanguagePreference(languageCode);
    } catch (error) {
      console.debug('Enhanced storage not available:', error);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to sync language preference:', error);
    throw error;
  }
}

/**
 * Get language preference with fallback to local storage
 */
export async function getLanguagePreferenceWithFallback(): Promise<LanguagePreferenceResponse> {
  try {
    // Try to get from backend first
    return await getLanguagePreference();
  } catch (error: any) {
    // Handle 401 errors silently
    if (error?.status === 401) {
      console.debug('User not authenticated, using local language preference');
    } else {
      console.warn('Failed to get language preference from backend, using local fallback:', error);
    }
    
    // Fallback to local storage
    const localLanguage = localStorage.getItem('i18nextLng') as 'en' | 'ar' || 'en';
    
    // Return a mock response based on local storage
    return {
      languageCode: localLanguage,
      displayName: localLanguage === 'ar' ? 'العربية' : 'English',
      direction: localLanguage === 'ar' ? 'rtl' : 'ltr',
      isRTL: localLanguage === 'ar'
    };
  }
}

/**
 * Initialize user language preference
 * This function should be called on app startup to sync language preference
 */
export async function initializeLanguagePreference(): Promise<LanguagePreferenceResponse | null> {
  try {
    // Check if user is authenticated
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      return null;
    }
    
    // Get language preference from backend
    const backendPreference = await getLanguagePreference();
    
    // Get local preference
    const localLanguage = localStorage.getItem('i18nextLng');
    
    // If they differ, update local to match backend
    if (localLanguage !== backendPreference.languageCode) {
      localStorage.setItem('i18nextLng', backendPreference.languageCode);
      
      // Update enhanced storage if available
      try {
        const { languageStorage } = await import('../../storage');
        languageStorage.setLanguagePreference(backendPreference.languageCode);
      } catch (error) {
        console.debug('Enhanced storage not available:', error);
      }
    }
    
    return backendPreference;
  } catch (error: any) {
    // Handle 401 errors silently (user not authenticated or token expired)
    if (error?.status === 401) {
      console.debug('User not authenticated for language preference sync');
      return null;
    }
    
    // Log other errors as warnings
    console.warn('Failed to initialize language preference from backend:', error);
    return null;
  }
}

/**
 * Check if user needs language selection (first-time setup)
 */
export async function getLanguageSelectionStatus(): Promise<LanguageSelectionStatus> {
  return apiClient.get<LanguageSelectionStatus>(`${USERS_ENDPOINT}/language-selection-status`);
}

/**
 * Complete first-time language selection
 * This function updates the language preference and marks selection as completed
 */
export async function completeLanguageSelection(languageCode: 'en' | 'ar'): Promise<LanguagePreferenceResponse> {
  try {
    // Update language preference (this will also mark selection as completed in backend)
    const response = await updateLanguagePreference({ languageCode });
    
    // Update local storage
    localStorage.setItem('i18nextLng', languageCode);
    localStorage.setItem('languageSelectionCompleted', 'true');
    
    // Also update enhanced storage if available
    try {
      const { languageStorage } = await import('../../storage');
      languageStorage.setLanguagePreference(languageCode);
    } catch (error) {
      console.debug('Enhanced storage not available:', error);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to complete language selection:', error);
    throw error;
  }
}