import { detectLanguage } from '../languageDetection';

export interface ApiRequestOptions extends RequestInit {
  locale?: string;
}

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success?: boolean;
  timestamp?: string;
}

export interface ApiError {
  message: string;
  errors?: Array<{
    field: string;
    message: string;
    rejectedValue: any;
  }>;
  code?: string;
  timestamp?: string;
}

class ApiClient {
  private baseUrl: string;
  private apiPrefix: string = '/api';

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  private getAcceptLanguageHeader(): string {
    // Try to get current language from various sources
    let currentLanguage = 'en';
    
    try {
      // First try to get from localStorage (user preference)
      const storedLang = localStorage.getItem('language');
      if (storedLang && (storedLang === 'en' || storedLang === 'ar')) {
        currentLanguage = storedLang;
      } else {
        // Fallback to language detection
        const detection = detectLanguage();
        currentLanguage = detection.language;
      }
    } catch (error) {
      console.debug('Failed to detect language, using default:', error);
    }

    // Return proper Accept-Language header format
    return currentLanguage === 'ar' ? 'ar,en;q=0.9' : 'en,ar;q=0.9';
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorData: ApiError | null = null;

      try {
        if (contentType?.includes('application/json')) {
          errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } else {
          // Handle plain text error responses from Spring Boot
          const textError = await response.text();
          if (textError) {
            errorMessage = textError;
          }
        }
      } catch (parseError) {
        console.debug('Failed to parse error response:', parseError);
      }

      const error = new Error(errorMessage) as Error & { data?: ApiError; status?: number };
      error.data = errorData || undefined;
      error.status = response.status;
      throw error;
    }

    // Handle different response types
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('application/octet-stream') || contentType?.includes('application/pdf')) {
      return response.blob() as Promise<T>;
    } else {
      return response.text() as Promise<T>;
    }
  }

  async request<T = any>(
    endpoint: string, 
    options: ApiRequestOptions = {}
  ): Promise<T> {
    const { locale, ...fetchOptions } = options;
    
    // Build URL with /api prefix if not already present and not an absolute URL
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      // Add /api prefix if the endpoint doesn't already have it
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const hasApiPrefix = normalizedEndpoint.startsWith('/api/');
      url = hasApiPrefix 
        ? `${this.baseUrl}${normalizedEndpoint}`
        : `${this.baseUrl}${this.apiPrefix}${normalizedEndpoint}`;
    }
    
    const headers = {
      ...this.getAuthHeaders(),
      'Accept-Language': locale || this.getAcceptLanguageHeader(),
      ...options.headers,
    };

    const config: RequestInit = {
      ...fetchOptions,
      headers,
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API request failed:', {
        url,
        method: config.method || 'GET',
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  async get<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string, options: ApiRequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }

  // Special method for multipart/form-data requests (file uploads)
  async postFormData<T = any>(endpoint: string, formData: FormData, options: ApiRequestOptions = {}): Promise<T> {
    const { locale, ...fetchOptions } = options;
    
    // Build URL with /api prefix if not already present and not an absolute URL
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const hasApiPrefix = normalizedEndpoint.startsWith('/api/');
      url = hasApiPrefix 
        ? `${this.baseUrl}${normalizedEndpoint}`
        : `${this.baseUrl}${this.apiPrefix}${normalizedEndpoint}`;
    }
    
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Accept-Language': locale || this.getAcceptLanguageHeader(),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Don't set Content-Type for FormData - let browser set it with boundary
    const config: RequestInit = {
      ...fetchOptions,
      method: 'POST',
      headers: {
        ...headers,
        ...options.headers,
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API form data request failed:', {
        url,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }

  // Special method for PUT with form data
  async putFormData<T = any>(endpoint: string, formData: FormData, options: ApiRequestOptions = {}): Promise<T> {
    const { locale, ...fetchOptions } = options;
    
    // Build URL with /api prefix if not already present and not an absolute URL
    let url: string;
    if (endpoint.startsWith('http')) {
      url = endpoint;
    } else {
      const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      const hasApiPrefix = normalizedEndpoint.startsWith('/api/');
      url = hasApiPrefix 
        ? `${this.baseUrl}${normalizedEndpoint}`
        : `${this.baseUrl}${this.apiPrefix}${normalizedEndpoint}`;
    }
    
    const token = localStorage.getItem('accessToken');
    const headers: Record<string, string> = {
      'Accept-Language': locale || this.getAcceptLanguageHeader(),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      ...fetchOptions,
      method: 'PUT',
      headers: {
        ...headers,
        ...options.headers,
      },
      body: formData,
    };

    try {
      const response = await fetch(url, config);
      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('API form data PUT request failed:', {
        url,
        error: error instanceof Error ? error.message : error
      });
      throw error;
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export utility function to create API client with specific locale
export const createApiClientWithLocale = (locale: string) => {
  const client = new ApiClient();
  // Override the getAcceptLanguageHeader method for this instance
  (client as any).getAcceptLanguageHeader = () => {
    return locale === 'ar' ? 'ar,en;q=0.9' : 'en,ar;q=0.9';
  };
  return client;
};