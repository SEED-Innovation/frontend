import { Court } from '@/types/court';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Gets the localized court title based on the current language
 * Falls back to English title if Arabic is not available or empty
 */
export const getLocalizedCourtTitle = (court: Court, language: string = 'en'): string => {
  if (language === 'ar' && court.titleAr && court.titleAr.trim() !== '') {
    return court.titleAr;
  }
  return court.name || '';
};

/**
 * Gets the localized court description based on the current language
 * Falls back to English description if Arabic is not available or empty
 */
export const getLocalizedCourtDescription = (court: Court, language: string = 'en'): string => {
  if (language === 'ar' && court.descriptionAr && court.descriptionAr.trim() !== '') {
    return court.descriptionAr;
  }
  return court.description || '';
};

/**
 * Checks if a court matches the search query in either language
 */
export const courtMatchesSearch = (court: Court, searchQuery: string, language: string = 'en'): boolean => {
  const lowerQuery = searchQuery.toLowerCase();
  
  // Search in English fields
  const englishMatch = 
    (court.name?.toLowerCase() || '').includes(lowerQuery) ||
    (court.description?.toLowerCase() || '').includes(lowerQuery) ||
    (court.location?.toLowerCase() || '').includes(lowerQuery) ||
    (court.type?.toLowerCase() || '').includes(lowerQuery);
  
  // Search in Arabic fields if they exist
  const arabicMatch = 
    (court.titleAr?.toLowerCase() || '').includes(lowerQuery) ||
    (court.descriptionAr?.toLowerCase() || '').includes(lowerQuery);
  
  return englishMatch || arabicMatch;
};

/**
 * Hook to get localized court content based on current language
 */
export const useLocalizedCourt = (court: Court) => {
  const { language } = useLanguage();
  
  return {
    title: getLocalizedCourtTitle(court, language),
    description: getLocalizedCourtDescription(court, language),
    matchesSearch: (query: string) => courtMatchesSearch(court, query, language)
  };
};