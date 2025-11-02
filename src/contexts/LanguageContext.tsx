import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { detectLanguage, storeLanguagePreference, getSystemLanguageInfo, type SupportedLanguage } from '../lib/languageDetection';
import { syncLanguagePreference, initializeLanguagePreference } from '../lib/api/services/playerUserService';

export type Language = SupportedLanguage;

interface LanguageContextType {
  language: Language;
  isRTL: boolean;
  changeLanguage: (lang: Language) => Promise<void>;
  t: (key: string, options?: any) => string;
  isLoading: boolean;
  getSystemInfo: () => ReturnType<typeof getSystemLanguageInfo>;
  syncWithBackend: (lang: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: React.ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    // Use enhanced language detection
    const detection = detectLanguage();
    return detection.language;
  });

  const isRTL = language === 'ar';

  const changeLanguage = async (lang: Language) => {
    setIsLoading(true);
    try {
      await i18n.changeLanguage(lang);
      setLanguage(lang);
      storeLanguagePreference(lang);
      
      // Update document direction and lang attributes
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
      
      // Update body class for styling
      document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
      document.body.classList.add(lang === 'ar' ? 'rtl' : 'ltr');
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncWithBackend = async (lang: Language) => {
    setIsLoading(true);
    try {
      await syncLanguagePreference(lang);
      // Language change will be handled by changeLanguage if needed
    } catch (error) {
      console.error('Failed to sync language with backend:', error);
      // Still update locally even if backend sync fails
      await changeLanguage(lang);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize language on mount
  useEffect(() => {
    const initializeLanguage = async () => {
      // Try to initialize from backend first (if user is authenticated)
      try {
        const backendPreference = await initializeLanguagePreference();
        if (backendPreference && backendPreference.languageCode !== language) {
          await changeLanguage(backendPreference.languageCode as Language);
          return;
        }
      } catch (error) {
        console.debug('Backend language initialization failed, using local detection:', error);
      }
      
      // Fallback to local detection
      const detection = detectLanguage();
      
      // Log detection info in development
      if (import.meta.env.DEV) {
        console.log('Language detection result:', detection);
        console.log('System language info:', getSystemLanguageInfo());
      }
      
      // Use detected language if different from current
      if (detection.language !== language) {
        await changeLanguage(detection.language);
      } else {
        // Set initial document attributes
        document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
        document.documentElement.lang = language;
        document.body.classList.add(isRTL ? 'rtl' : 'ltr');
      }
    };

    initializeLanguage();
  }, []);

  // Listen for language changes from i18next
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      const newLang = lng as Language;
      if (newLang !== language && (newLang === 'en' || newLang === 'ar')) {
        setLanguage(newLang);
        document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
        document.documentElement.lang = newLang;
        document.body.className = document.body.className.replace(/\b(ltr|rtl)\b/g, '');
        document.body.classList.add(newLang === 'ar' ? 'rtl' : 'ltr');
      }
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, [language]);

  const contextValue: LanguageContextType = {
    language,
    isRTL,
    changeLanguage,
    t,
    isLoading,
    getSystemInfo: getSystemLanguageInfo,
    syncWithBackend,
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// RTL utility hook
export const useRTL = () => {
  const { isRTL } = useLanguage();
  
  return {
    isRTL,
    dir: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'text-right' : 'text-left',
    marginStart: isRTL ? 'mr' : 'ml',
    marginEnd: isRTL ? 'ml' : 'mr',
    paddingStart: isRTL ? 'pr' : 'pl',
    paddingEnd: isRTL ? 'pl' : 'pr',
    borderStart: isRTL ? 'border-r' : 'border-l',
    borderEnd: isRTL ? 'border-l' : 'border-r',
    roundedStart: isRTL ? 'rounded-r' : 'rounded-l',
    roundedEnd: isRTL ? 'rounded-l' : 'rounded-r',
    float: isRTL ? 'float-left' : 'float-right',
  };
};