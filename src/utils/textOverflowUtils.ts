import { useLanguage } from '@/contexts/LanguageContext';

export interface TextOverflowConfig {
  maxLines?: number;
  enableEllipsis?: boolean;
  enableWordBreak?: boolean;
  enableHyphens?: boolean;
  minFontSize?: string;
  maxFontSize?: string;
  responsiveScaling?: boolean;
  preserveWhitespace?: boolean;
}

export interface ResponsiveTextConfig {
  baseSize: string;
  smSize?: string;
  mdSize?: string;
  lgSize?: string;
  xlSize?: string;
  minSize?: string;
  maxSize?: string;
}

/**
 * Utility class for handling text overflow and responsive typography in RTL/LTR contexts
 */
export class TextOverflowUtils {
  /**
   * Generate CSS classes for text overflow handling
   */
  static getOverflowClasses(config: TextOverflowConfig = {}): string {
    const {
      maxLines = 1,
      enableEllipsis = true,
      enableWordBreak = true,
      enableHyphens = false,
      preserveWhitespace = false
    } = config;

    const classes: string[] = [];

    // Basic overflow handling
    if (maxLines === 1) {
      classes.push('truncate');
    } else {
      classes.push('overflow-hidden');
      if (enableEllipsis) {
        classes.push('text-ellipsis');
      }
    }

    // Word breaking
    if (enableWordBreak) {
      classes.push('break-words');
    }

    // Hyphens for better text wrapping
    if (enableHyphens) {
      classes.push('hyphens-auto');
    }

    // Whitespace handling
    if (preserveWhitespace) {
      classes.push('whitespace-pre-wrap');
    } else {
      classes.push('whitespace-normal');
    }

    return classes.join(' ');
  }

  /**
   * Generate responsive font size classes
   */
  static getResponsiveTextClasses(config: ResponsiveTextConfig): string {
    const {
      baseSize,
      smSize,
      mdSize,
      lgSize,
      xlSize
    } = config;

    const classes: string[] = [baseSize];

    if (smSize) classes.push(`sm:${smSize}`);
    if (mdSize) classes.push(`md:${mdSize}`);
    if (lgSize) classes.push(`lg:${lgSize}`);
    if (xlSize) classes.push(`xl:${xlSize}`);

    return classes.join(' ');
  }

  /**
   * Generate RTL-aware text alignment classes
   */
  static getTextAlignmentClasses(isRTL: boolean, alignment?: 'start' | 'end' | 'center' | 'justify'): string {
    if (!alignment) {
      return isRTL ? 'text-right' : 'text-left';
    }

    switch (alignment) {
      case 'start':
        return isRTL ? 'text-right' : 'text-left';
      case 'end':
        return isRTL ? 'text-left' : 'text-right';
      case 'center':
        return 'text-center';
      case 'justify':
        return 'text-justify';
      default:
        return isRTL ? 'text-right' : 'text-left';
    }
  }

  /**
   * Detect if text contains Arabic characters
   */
  static containsArabic(text: string): boolean {
    const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
    return arabicRegex.test(text);
  }

  /**
   * Get optimal text direction based on content
   */
  static getTextDirection(text: string): 'ltr' | 'rtl' {
    return this.containsArabic(text) ? 'rtl' : 'ltr';
  }

  /**
   * Calculate optimal font size based on container width
   */
  static calculateOptimalFontSize(
    text: string,
    containerWidth: number,
    minSize: number = 12,
    maxSize: number = 24
  ): number {
    // Simple heuristic: longer text gets smaller font
    const textLength = text.length;
    const ratio = Math.max(0.1, Math.min(1, (100 - textLength) / 100));
    return Math.round(minSize + (maxSize - minSize) * ratio);
  }

  /**
   * Generate CSS custom properties for dynamic text sizing
   */
  static generateTextSizeProperties(config: ResponsiveTextConfig): Record<string, string> {
    return {
      '--text-base-size': config.baseSize,
      '--text-min-size': config.minSize || '0.75rem',
      '--text-max-size': config.maxSize || '2rem',
      '--text-sm-size': config.smSize || config.baseSize,
      '--text-md-size': config.mdSize || config.baseSize,
      '--text-lg-size': config.lgSize || config.baseSize,
      '--text-xl-size': config.xlSize || config.baseSize,
    };
  }
}

/**
 * Hook for getting text overflow utilities
 */
export const useTextOverflow = (config: TextOverflowConfig = {}) => {
  const { isRTL } = useLanguage();

  return {
    getOverflowClasses: (overrides?: Partial<TextOverflowConfig>) => 
      TextOverflowUtils.getOverflowClasses({ ...config, ...overrides }),
    
    getAlignmentClasses: (alignment?: 'start' | 'end' | 'center' | 'justify') =>
      TextOverflowUtils.getTextAlignmentClasses(isRTL, alignment),
    
    getTextDirection: (text: string) => 
      TextOverflowUtils.getTextDirection(text),
    
    containsArabic: (text: string) => 
      TextOverflowUtils.containsArabic(text),
    
    isRTL
  };
};

/**
 * Hook for responsive typography
 */
export const useResponsiveText = (baseConfig: ResponsiveTextConfig) => {
  const { isRTL } = useLanguage();

  const getClasses = (overrides?: Partial<ResponsiveTextConfig>) => {
    const config = { ...baseConfig, ...overrides };
    return TextOverflowUtils.getResponsiveTextClasses(config);
  };

  const getProperties = (overrides?: Partial<ResponsiveTextConfig>) => {
    const config = { ...baseConfig, ...overrides };
    return TextOverflowUtils.generateTextSizeProperties(config);
  };

  return {
    getClasses,
    getProperties,
    isRTL
  };
};

/**
 * Hook for content-aware text handling
 */
export const useContentAwareText = () => {
  const { isRTL } = useLanguage();

  const getTextClasses = (
    text: string,
    config: TextOverflowConfig & { alignment?: 'start' | 'end' | 'center' | 'justify' } = {}
  ) => {
    const { alignment, ...overflowConfig } = config;
    const textDirection = TextOverflowUtils.getTextDirection(text);
    const shouldUseRTL = textDirection === 'rtl' || isRTL;

    return {
      overflow: TextOverflowUtils.getOverflowClasses(overflowConfig),
      alignment: TextOverflowUtils.getTextAlignmentClasses(shouldUseRTL, alignment),
      direction: textDirection,
      classes: [
        TextOverflowUtils.getOverflowClasses(overflowConfig),
        TextOverflowUtils.getTextAlignmentClasses(shouldUseRTL, alignment)
      ].join(' ')
    };
  };

  return {
    getTextClasses,
    containsArabic: TextOverflowUtils.containsArabic,
    getTextDirection: TextOverflowUtils.getTextDirection,
    isRTL
  };
};

/**
 * Predefined text configurations for common use cases
 */
export const TextPresets = {
  // Headings
  heading1: {
    baseSize: 'text-3xl',
    smSize: 'text-4xl',
    lgSize: 'text-5xl',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  },
  
  heading2: {
    baseSize: 'text-2xl',
    smSize: 'text-3xl',
    lgSize: 'text-4xl',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  },
  
  heading3: {
    baseSize: 'text-xl',
    smSize: 'text-2xl',
    lgSize: 'text-3xl',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  },

  // Body text
  bodyLarge: {
    baseSize: 'text-lg',
    smSize: 'text-xl',
    maxLines: 3,
    enableEllipsis: true,
    enableWordBreak: true,
    enableHyphens: true
  },

  bodyMedium: {
    baseSize: 'text-base',
    smSize: 'text-lg',
    maxLines: 4,
    enableEllipsis: true,
    enableWordBreak: true,
    enableHyphens: true
  },

  bodySmall: {
    baseSize: 'text-sm',
    smSize: 'text-base',
    maxLines: 3,
    enableEllipsis: true,
    enableWordBreak: true
  },

  // UI elements
  button: {
    baseSize: 'text-sm',
    smSize: 'text-base',
    maxLines: 1,
    enableEllipsis: true,
    enableWordBreak: false
  },

  caption: {
    baseSize: 'text-xs',
    smSize: 'text-sm',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  },

  label: {
    baseSize: 'text-sm',
    smSize: 'text-base',
    maxLines: 1,
    enableEllipsis: true,
    enableWordBreak: false
  },

  // Cards and lists
  cardTitle: {
    baseSize: 'text-lg',
    smSize: 'text-xl',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  },

  cardDescription: {
    baseSize: 'text-sm',
    smSize: 'text-base',
    maxLines: 3,
    enableEllipsis: true,
    enableWordBreak: true,
    enableHyphens: true
  },

  listItem: {
    baseSize: 'text-base',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  },

  // Navigation
  navItem: {
    baseSize: 'text-sm',
    smSize: 'text-base',
    maxLines: 1,
    enableEllipsis: true,
    enableWordBreak: false
  },

  // Forms
  inputLabel: {
    baseSize: 'text-sm',
    maxLines: 1,
    enableEllipsis: true,
    enableWordBreak: false
  },

  inputHelp: {
    baseSize: 'text-xs',
    smSize: 'text-sm',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  },

  errorMessage: {
    baseSize: 'text-xs',
    smSize: 'text-sm',
    maxLines: 2,
    enableEllipsis: true,
    enableWordBreak: true
  }
} as const;

export type TextPresetKey = keyof typeof TextPresets;