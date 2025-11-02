import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface RTLIconProps {
  children: React.ReactNode;
  className?: string;
  flip?: boolean;
  flipOnRTL?: boolean;
  direction?: 'left' | 'right' | 'up' | 'down';
  style?: React.CSSProperties;
}

/**
 * RTLIcon component that handles icon direction for RTL layouts
 */
export const RTLIcon: React.FC<RTLIconProps> = ({
  children,
  className = '',
  flip = false,
  flipOnRTL = true,
  direction,
  style = {},
  ...props
}) => {
  const { isRTL } = useLanguage();
  
  // Determine if icon should be flipped
  const shouldFlip = flip || (flipOnRTL && isRTL);
  
  // Handle directional icons
  let transformClass = '';
  if (shouldFlip) {
    if (direction === 'left' || direction === 'right') {
      transformClass = 'rtl-flip';
    } else if (direction === 'up' || direction === 'down') {
      transformClass = 'rtl-flip-y';
    } else {
      transformClass = 'rtl-flip';
    }
  }
  
  const iconClasses = cn(
    transformClass,
    className
  );
  
  return (
    <span className={iconClasses} style={style} {...props}>
      {children}
    </span>
  );
};

/**
 * Directional arrow component that automatically adjusts for RTL
 */
export interface DirectionalArrowProps {
  direction: 'left' | 'right' | 'up' | 'down';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const DirectionalArrow: React.FC<DirectionalArrowProps> = ({
  direction,
  className = '',
  size = 'md'
}) => {
  const { isRTL } = useLanguage();
  
  // Adjust direction for RTL
  let adjustedDirection = direction;
  if (isRTL) {
    if (direction === 'left') adjustedDirection = 'right';
    else if (direction === 'right') adjustedDirection = 'left';
  }
  
  const sizeMap = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };
  
  const arrowClasses = cn(
    sizeMap[size],
    className
  );
  
  // SVG paths for different directions
  const paths = {
    left: 'M15 18l-6-6 6-6',
    right: 'M9 18l6-6-6-6',
    up: 'M18 15l-6-6-6 6',
    down: 'M6 9l6 6 6-6'
  };
  
  return (
    <svg
      className={arrowClasses}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={paths[adjustedDirection]}
      />
    </svg>
  );
};

/**
 * Chevron component with RTL support
 */
export interface ChevronProps {
  direction: 'left' | 'right' | 'up' | 'down';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Chevron: React.FC<ChevronProps> = ({
  direction,
  className = '',
  size = 'md'
}) => {
  const { isRTL } = useLanguage();
  
  // Adjust direction for RTL
  let adjustedDirection = direction;
  if (isRTL) {
    if (direction === 'left') adjustedDirection = 'right';
    else if (direction === 'right') adjustedDirection = 'left';
  }
  
  const sizeMap = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };
  
  const chevronClasses = cn(
    sizeMap[size],
    className
  );
  
  // SVG paths for chevrons
  const paths = {
    left: 'M15 18l-6-6 6-6',
    right: 'M9 18l6-6-6-6',
    up: 'M18 15l-6-6-6 6',
    down: 'M6 9l6 6 6-6'
  };
  
  return (
    <svg
      className={chevronClasses}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d={paths[adjustedDirection]}
      />
    </svg>
  );
};