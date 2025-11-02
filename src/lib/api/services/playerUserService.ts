/**
 * Player User Service
 * API service for player user operations including language preferences
 */

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

const authHeaders = () => ({
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
  'Content-Type': 'application/json'
});

const BASE_URL = import.meta.env.VITE_API_URL || '';
const USERS_ENDPOINT = '/users';

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<UserProfile> {
  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}/me`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get current user: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update user profile
 */
export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<void> {
  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}/me`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update user profile: ${response.statusText}`);
  }
}

/**
 * Upload profile picture
 */
export async function uploadProfilePicture(file: File): Promise<UserProfile> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}/profile-picture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      // Don't set Content-Type for FormData, let browser set it with boundary
    },
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload profile picture: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get user's language preference
 */
export async function getLanguagePreference(): Promise<LanguagePreferenceResponse> {
  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}/language-preference`, {
    method: 'GET',
    headers: authHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get language preference: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Update user's language preference
 */
export async function updateLanguagePreference(
  request: LanguagePreferenceRequest
): Promise<LanguagePreferenceResponse> {
  const response = await fetch(`${BASE_URL}${USERS_ENDPOINT}/language-preference`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to update language preference: ${response.statusText}`);
  }

  return response.json();
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
      const { languageStorage } = await import('../storage');
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
  } catch (error) {
    console.warn('Failed to get language preference from backend, using local fallback:', error);
    
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
        const { languageStorage } = await import('../storage');
        languageStorage.setLanguagePreference(backendPreference.languageCode);
      } catch (error) {
        console.debug('Enhanced storage not available:', error);
      }
    }
    
    return backendPreference;
  } catch (error) {
    console.warn('Failed to initialize language preference from backend:', error);
    return null;
  }
}