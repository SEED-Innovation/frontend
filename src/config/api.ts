/**
 * API Configuration
 * Centralized API URL configuration with /api prefix
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api';

/**
 * Get the full API URL with /api prefix
 * @param endpoint - The endpoint path (e.g., '/auth/login', '/bookings')
 * @returns Full API URL with prefix (e.g., 'http://localhost:8080/api/auth/login')
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash from endpoint if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BASE_URL}${API_PREFIX}${cleanEndpoint}`;
};

/**
 * Get the base URL without /api prefix (for special cases)
 */
export const getBaseUrl = (): string => {
  return BASE_URL;
};

/**
 * Get the API prefix
 */
export const getApiPrefix = (): string => {
  return API_PREFIX;
};

export default {
  getApiUrl,
  getBaseUrl,
  getApiPrefix,
};
