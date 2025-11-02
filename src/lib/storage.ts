/**
 * Storage utilities for language preferences and other app data
 * Provides a consistent interface for localStorage with error handling
 */

export type StorageKey = 
  | 'i18nextLng'
  | 'user_language_preference'
  | 'language_detection_info'
  | 'app_theme'
  | 'user_preferences';

interface StorageItem<T = any> {
  value: T;
  timestamp: number;
  version: string;
}

/**
 * Enhanced localStorage wrapper with error handling and versioning
 */
class StorageManager {
  private readonly version = '1.0.0';

  /**
   * Set item in localStorage with metadata
   */
  setItem<T>(key: StorageKey, value: T, options?: { ttl?: number }): boolean {
    try {
      const item: StorageItem<T> = {
        value,
        timestamp: Date.now(),
        version: this.version,
      };

      // Add TTL if specified
      if (options?.ttl) {
        (item as any).expiresAt = Date.now() + options.ttl;
      }

      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Failed to set localStorage item ${key}:`, error);
      return false;
    }
  }

  /**
   * Get item from localStorage with validation
   */
  getItem<T>(key: StorageKey): T | null {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) {
        return null;
      }

      const item: StorageItem<T> = JSON.parse(itemStr);

      // Check if item has expired
      if ((item as any).expiresAt && Date.now() > (item as any).expiresAt) {
        this.removeItem(key);
        return null;
      }

      return item.value;
    } catch (error) {
      console.error(`Failed to get localStorage item ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: StorageKey): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to remove localStorage item ${key}:`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all app-related items
   */
  clearAppData(): boolean {
    try {
      const keysToRemove: StorageKey[] = [
        'user_language_preference',
        'language_detection_info',
        'app_theme',
        'user_preferences'
      ];

      keysToRemove.forEach(key => this.removeItem(key));
      return true;
    } catch (error) {
      console.error('Failed to clear app data:', error);
      return false;
    }
  }

  /**
   * Get storage usage information
   */
  getStorageInfo() {
    if (!this.isAvailable()) {
      return { available: false, used: 0, total: 0 };
    }

    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      // Estimate total available (most browsers allow ~5-10MB)
      const total = 5 * 1024 * 1024; // 5MB estimate

      return {
        available: true,
        used,
        total,
        percentage: (used / total) * 100
      };
    } catch (error) {
      console.error('Failed to get storage info:', error);
      return { available: false, used: 0, total: 0 };
    }
  }
}

// Create singleton instance
export const storage = new StorageManager();

/**
 * Language-specific storage utilities
 */
export const languageStorage = {
  /**
   * Store language preference
   */
  setLanguagePreference(languageCode: string): boolean {
    return storage.setItem('user_language_preference', {
      languageCode,
      updatedAt: new Date().toISOString(),
      source: 'user_selection'
    });
  },

  /**
   * Get stored language preference
   */
  getLanguagePreference(): { languageCode: string; updatedAt: string; source: string } | null {
    return storage.getItem('user_language_preference');
  },

  /**
   * Store language detection information for debugging
   */
  setDetectionInfo(info: any): boolean {
    return storage.setItem('language_detection_info', info, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
  },

  /**
   * Get language detection information
   */
  getDetectionInfo(): any {
    return storage.getItem('language_detection_info');
  },

  /**
   * Clear language-related storage
   */
  clearLanguageData(): boolean {
    storage.removeItem('user_language_preference');
    storage.removeItem('language_detection_info');
    storage.removeItem('i18nextLng');
    return true;
  }
};

/**
 * User preferences storage utilities
 */
export const userPreferencesStorage = {
  /**
   * Store user preferences
   */
  setPreferences(preferences: Record<string, any>): boolean {
    return storage.setItem('user_preferences', {
      ...preferences,
      updatedAt: new Date().toISOString()
    });
  },

  /**
   * Get user preferences
   */
  getPreferences(): Record<string, any> | null {
    return storage.getItem('user_preferences');
  },

  /**
   * Update specific preference
   */
  updatePreference(key: string, value: any): boolean {
    const current = this.getPreferences() || {};
    return this.setPreferences({
      ...current,
      [key]: value
    });
  },

  /**
   * Get specific preference
   */
  getPreference(key: string): any {
    const preferences = this.getPreferences();
    return preferences?.[key] || null;
  }
};

export default storage;