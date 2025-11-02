/**
 * Language Detection Utilities
 * Provides comprehensive browser language detection with fallback logic
 */

export type SupportedLanguage = 'en' | 'ar';

interface LanguageDetectionResult {
  language: SupportedLanguage;
  confidence: 'high' | 'medium' | 'low';
  source: 'stored' | 'navigator' | 'timezone' | 'fallback';
}

/**
 * Arabic-speaking countries and regions
 */
const ARABIC_COUNTRIES = new Set([
  'SA', 'AE', 'QA', 'KW', 'BH', 'OM', // Gulf countries
  'JO', 'LB', 'SY', 'IQ', 'PS',       // Levant
  'EG', 'LY', 'TN', 'DZ', 'MA',       // North Africa
  'SD', 'YE', 'DJ', 'SO', 'KM',       // Other Arabic-speaking regions
]);

/**
 * Arabic-speaking timezones
 */
const ARABIC_TIMEZONES = new Set([
  'Asia/Riyadh', 'Asia/Dubai', 'Asia/Qatar', 'Asia/Kuwait',
  'Asia/Bahrain', 'Asia/Muscat', 'Asia/Amman', 'Asia/Beirut',
  'Asia/Damascus', 'Asia/Baghdad', 'Africa/Cairo', 'Africa/Tripoli',
  'Africa/Tunis', 'Africa/Algiers', 'Africa/Casablanca', 'Africa/Khartoum',
  'Asia/Aden', 'Africa/Djibouti', 'Africa/Mogadishu', 'Indian/Comoro'
]);

/**
 * Check if a language code is supported
 */
export function isLanguageSupported(languageCode: string): languageCode is SupportedLanguage {
  return languageCode === 'en' || languageCode === 'ar';
}

/**
 * Get stored language preference from localStorage
 */
export function getStoredLanguage(): SupportedLanguage | null {
  try {
    const stored = localStorage.getItem('i18nextLng');
    return isLanguageSupported(stored) ? stored : null;
  } catch (error) {
    console.debug('Failed to get stored language:', error);
    return null;
  }
}

/**
 * Detect language from browser navigator
 */
export function detectNavigatorLanguage(): SupportedLanguage | null {
  try {
    // Get all browser languages in order of preference
    const browserLanguages = navigator.languages || [navigator.language];
    
    for (const lang of browserLanguages) {
      // Extract language code (e.g., 'ar' from 'ar-SA')
      const langCode = lang.split('-')[0].toLowerCase();
      if (isLanguageSupported(langCode)) {
        return langCode;
      }
    }
    
    return null;
  } catch (error) {
    console.debug('Navigator language detection failed:', error);
    return null;
  }
}

/**
 * Detect language from timezone (heuristic approach)
 */
export function detectLanguageFromTimezone(): SupportedLanguage | null {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return ARABIC_TIMEZONES.has(timezone) ? 'ar' : null;
  } catch (error) {
    console.debug('Timezone language detection failed:', error);
    return null;
  }
}

/**
 * Detect language from locale information
 */
export function detectLanguageFromLocale(): SupportedLanguage | null {
  try {
    // Try to get country from Intl.Locale if available
    if ('Locale' in Intl) {
      const locale = new (Intl as any).Locale(navigator.language);
      if (locale.region && ARABIC_COUNTRIES.has(locale.region.toUpperCase())) {
        return 'ar';
      }
    }
    
    // Fallback: extract country from language tag
    const match = navigator.language.match(/^[a-z]{2}-([A-Z]{2})$/);
    if (match && ARABIC_COUNTRIES.has(match[1])) {
      return 'ar';
    }
    
    return null;
  } catch (error) {
    console.debug('Locale language detection failed:', error);
    return null;
  }
}

/**
 * Comprehensive language detection with confidence scoring
 */
export function detectLanguage(): LanguageDetectionResult {
  // 1. Check stored preference (highest confidence)
  const storedLanguage = getStoredLanguage();
  if (storedLanguage) {
    return {
      language: storedLanguage,
      confidence: 'high',
      source: 'stored'
    };
  }
  
  // 2. Check navigator languages (high confidence)
  const navigatorLanguage = detectNavigatorLanguage();
  if (navigatorLanguage) {
    return {
      language: navigatorLanguage,
      confidence: 'high',
      source: 'navigator'
    };
  }
  
  // 3. Check timezone and locale (medium confidence)
  const timezoneLanguage = detectLanguageFromTimezone();
  const localeLanguage = detectLanguageFromLocale();
  
  if (timezoneLanguage === 'ar' || localeLanguage === 'ar') {
    return {
      language: 'ar',
      confidence: 'medium',
      source: 'timezone'
    };
  }
  
  // 4. Fallback to English (low confidence)
  return {
    language: 'en',
    confidence: 'low',
    source: 'fallback'
  };
}

/**
 * Store language preference
 */
export function storeLanguagePreference(language: SupportedLanguage): void {
  try {
    localStorage.setItem('i18nextLng', language);
    
    // Also store in enhanced storage for better tracking
    const { languageStorage } = require('./storage');
    languageStorage.setLanguagePreference(language);
  } catch (error) {
    console.error('Failed to store language preference:', error);
  }
}

/**
 * Get system language information for debugging
 */
export function getSystemLanguageInfo() {
  return {
    navigatorLanguage: navigator.language,
    navigatorLanguages: navigator.languages,
    timezone: (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch {
        return 'unknown';
      }
    })(),
    storedLanguage: getStoredLanguage(),
    detectedLanguage: detectLanguage(),
  };
}