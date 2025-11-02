import { useLanguage } from '@/contexts/LanguageContext';

export interface RTLClasses {
  container: string;
  textAlign: string;
  marginStart: string;
  marginEnd: string;
  paddingStart: string;
  paddingEnd: string;
  borderRadius: string;
  float: string;
  position: string;
  flexDirection: string;
}

export interface RTLClassOptions {
  marginSize?: 'sm' | 'md' | 'lg' | 'xl';
  paddingSize?: 'sm' | 'md' | 'lg' | 'xl';
  borderRadius?: 'sm' | 'md' | 'lg';
  includeFloat?: boolean;
  includePosition?: boolean;
}

const sizeMap = {
  sm: '1',
  md: '2',
  lg: '4',
  xl: '6'
};

const borderRadiusMap = {
  sm: '',
  md: '-md',
  lg: '-lg'
};

/**
 * Custom hook for generating RTL-aware CSS classes
 * Provides dynamic class generation based on current language direction
 */
export const useRTLClasses = (options: RTLClassOptions = {}): RTLClasses => {
  const { isRTL } = useLanguage();
  
  const {
    marginSize = 'md',
    paddingSize = 'md',
    borderRadius = 'md',
    includeFloat = false,
    includePosition = false
  } = options;

  const marginClass = sizeMap[marginSize];
  const paddingClass = sizeMap[paddingSize];
  const radiusClass = borderRadiusMap[borderRadius];

  return {
    // Container direction
    container: isRTL ? 'rtl' : 'ltr',
    
    // Text alignment
    textAlign: isRTL ? 'text-end' : 'text-start',
    
    // Margin utilities (logical properties)
    marginStart: `ms-${marginClass}`,
    marginEnd: `me-${marginClass}`,
    
    // Padding utilities (logical properties)
    paddingStart: `ps-${paddingClass}`,
    paddingEnd: `pe-${paddingClass}`,
    
    // Border radius
    borderRadius: isRTL ? `rounded-e${radiusClass}` : `rounded-s${radiusClass}`,
    
    // Float utilities
    float: includeFloat ? (isRTL ? 'float-end' : 'float-start') : '',
    
    // Position utilities
    position: includePosition ? (isRTL ? 'end-0' : 'start-0') : '',
    
    // Flex direction
    flexDirection: isRTL ? 'flex-row-reverse' : 'flex-row'
  };
};

/**
 * Helper function to get specific RTL class for a property
 */
export const getRTLClass = (property: keyof RTLClasses, options: RTLClassOptions = {}): string => {
  const classes = useRTLClasses(options);
  return classes[property];
};

/**
 * Helper function to combine RTL classes with additional classes
 */
export const combineRTLClasses = (
  baseClasses: string,
  rtlClasses: Partial<RTLClasses>,
  additionalClasses?: string
): string => {
  const classArray = [baseClasses];
  
  Object.values(rtlClasses).forEach(cls => {
    if (cls) classArray.push(cls);
  });
  
  if (additionalClasses) {
    classArray.push(additionalClasses);
  }
  
  return classArray.filter(Boolean).join(' ');
};

/**
 * Hook for getting directional spacing classes
 */
export const useDirectionalSpacing = (size: 'sm' | 'md' | 'lg' | 'xl' = 'md') => {
  const { isRTL } = useLanguage();
  const sizeClass = sizeMap[size];
  
  return {
    marginLeft: isRTL ? `mr-${sizeClass}` : `ml-${sizeClass}`,
    marginRight: isRTL ? `ml-${sizeClass}` : `mr-${sizeClass}`,
    paddingLeft: isRTL ? `pr-${sizeClass}` : `pl-${sizeClass}`,
    paddingRight: isRTL ? `pl-${sizeClass}` : `pr-${sizeClass}`,
    // Logical properties (preferred)
    marginStart: `ms-${sizeClass}`,
    marginEnd: `me-${sizeClass}`,
    paddingStart: `ps-${sizeClass}`,
    paddingEnd: `pe-${sizeClass}`
  };
};

/**
 * Hook for getting icon direction classes
 */
export const useIconDirection = () => {
  const { isRTL } = useLanguage();
  
  return {
    chevronLeft: isRTL ? 'rtl-flip' : '',
    chevronRight: isRTL ? 'rtl-flip' : '',
    arrow: isRTL ? 'rtl-flip' : '',
    transform: isRTL ? 'rtl-flip' : ''
  };
};