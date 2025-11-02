import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  // Load translation using http backend
  .use(Backend)
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    // Fallback language
    fallbackLng: 'en',
    
    // Supported languages
    supportedLngs: ['en', 'ar'],
    
    // Debug mode (disable in production)
    debug: import.meta.env.DEV,
    
    // Language detection options
    detection: {
      // Order of language detection methods
      order: ['localStorage', 'navigator', 'htmlTag', 'querystring', 'cookie'],
      
      // Cache user language
      caches: ['localStorage'],
      
      // Key to store language in localStorage
      lookupLocalStorage: 'i18nextLng',
      
      // Navigator language detection options
      lookupNavigator: true,
      checkWhitelist: true,
      
      // HTML tag detection
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
      
      // Cookie options
      lookupCookie: 'i18next',
      cookieMinutes: 10080, // 7 days
      
      // Query string parameter
      lookupQuerystring: 'lng',
      
      // Custom detection function for enhanced browser language detection
      customDetector: () => {
        // Get browser languages in order of preference
        const browserLanguages = navigator.languages || [navigator.language];
        
        // Check each browser language
        for (const lang of browserLanguages) {
          const langCode = lang.split('-')[0]; // Extract language code (e.g., 'ar' from 'ar-SA')
          if (langCode === 'ar' || langCode === 'en') {
            return langCode;
          }
        }
        
        // Check for Arabic-speaking regions based on timezone or other indicators
        try {
          const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
          const arabicTimezones = [
            'Asia/Riyadh', 'Asia/Dubai', 'Asia/Qatar', 'Asia/Kuwait',
            'Asia/Bahrain', 'Asia/Muscat', 'Asia/Amman', 'Asia/Beirut',
            'Asia/Damascus', 'Asia/Baghdad', 'Africa/Cairo', 'Africa/Tripoli',
            'Africa/Tunis', 'Africa/Algiers', 'Africa/Casablanca', 'Africa/Khartoum'
          ];
          
          if (arabicTimezones.includes(timezone)) {
            return 'ar';
          }
        } catch (e) {
          console.debug('Timezone detection failed:', e);
        }
        
        // Fallback to English
        return 'en';
      },
    },
    
    // Backend options for loading translations
    backend: {
      // Path to load resources from
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      
      // Allow cross domain requests
      crossDomain: false,
      
      // Parse data after loading
      parse: (data: string) => JSON.parse(data),
    },
    
    // Namespace configuration
    ns: ['common', 'web', 'admin'],
    defaultNS: 'common',
    
    // Interpolation options
    interpolation: {
      // React already does escaping
      escapeValue: false,
      
      // Format function for numbers, dates, etc.
      format: (value, format, lng) => {
        if (format === 'number') {
          return new Intl.NumberFormat(lng).format(value);
        }
        if (format === 'currency') {
          return new Intl.NumberFormat(lng, {
            style: 'currency',
            currency: lng === 'ar' ? 'SAR' : 'USD'
          }).format(value);
        }
        if (format === 'date') {
          return new Intl.DateTimeFormat(lng).format(new Date(value));
        }
        return value;
      }
    },
    
    // React options
    react: {
      // Use Suspense for async loading
      useSuspense: true,
      
      // Bind i18n instance to component
      bindI18n: 'languageChanged',
      
      // Bind store to component
      bindI18nStore: '',
      
      // How to handle trans component defaultValue
      transEmptyNodeValue: '',
      
      // Transform the node before render
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
    },
    
    // Resource loading options
    load: 'languageOnly', // Remove region code (e.g., 'en-US' becomes 'en')
    
    // Clean code options
    cleanCode: true,
    
    // Key separator
    keySeparator: '.',
    
    // Namespace separator
    nsSeparator: ':',
    
    // Pluralization
    pluralSeparator: '_',
    contextSeparator: '_',
    
    // Missing key handling
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: import.meta.env.DEV ? (lng, ns, key) => {
      console.warn(`Missing translation key: ${key} in ${lng}/${ns}`);
    } : undefined,
    
    // Return objects for missing keys in development
    returnObjects: false,
    returnEmptyString: false,
    returnNull: false,
  });

export default i18n;