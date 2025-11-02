import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

export interface RTLContainerProps {
  children: React.ReactNode;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  autoDirection?: boolean;
  forceDirection?: 'ltr' | 'rtl';
  textAlign?: boolean;
  style?: React.CSSProperties;
}

/**
 * RTLContainer component that automatically handles direction and text alignment
 * based on the current language context
 */
export const RTLContainer: React.FC<RTLContainerProps> = ({
  children,
  className = '',
  as: Component = 'div',
  autoDirection = true,
  forceDirection,
  textAlign = true,
  style = {},
  ...props
}) => {
  const { isRTL } = useLanguage();
  
  // Determine the direction to use
  const direction = forceDirection || (autoDirection && isRTL ? 'rtl' : 'ltr');
  
  // Build the CSS classes
  const containerClasses = cn(
    // Base direction class
    direction === 'rtl' ? 'rtl' : 'ltr',
    // Text alignment if enabled
    textAlign && (direction === 'rtl' ? 'text-right' : 'text-left'),
    // Custom classes
    className
  );
  
  // Combine styles
  const containerStyle: React.CSSProperties = {
    direction,
    ...style
  };
  
  return (
    <Component
      className={containerClasses}
      style={containerStyle}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * RTLFlex component for flex layouts with automatic direction handling
 */
export interface RTLFlexProps extends RTLContainerProps {
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly';
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
  wrap?: boolean;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RTLFlex: React.FC<RTLFlexProps> = ({
  children,
  className = '',
  flexDirection = 'row',
  justify = 'start',
  align = 'start',
  wrap = false,
  gap = 'md',
  ...rtlProps
}) => {
  const { isRTL } = useLanguage();
  
  // Handle flex direction for RTL
  let computedFlexDirection = flexDirection;
  if (isRTL && flexDirection === 'row') {
    computedFlexDirection = 'row-reverse';
  }
  
  const gapMap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };
  
  const justifyMap = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly'
  };
  
  const alignMap = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
    stretch: 'items-stretch'
  };
  
  const flexClasses = cn(
    'flex',
    computedFlexDirection === 'row' ? 'flex-row' : 
    computedFlexDirection === 'row-reverse' ? 'flex-row-reverse' :
    computedFlexDirection === 'column' ? 'flex-col' : 'flex-col-reverse',
    justifyMap[justify],
    alignMap[align],
    wrap && 'flex-wrap',
    gapMap[gap],
    className
  );
  
  return (
    <RTLContainer className={flexClasses} {...rtlProps}>
      {children}
    </RTLContainer>
  );
};

/**
 * RTLGrid component for grid layouts with RTL support
 */
export interface RTLGridProps extends RTLContainerProps {
  cols?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  gap?: 'sm' | 'md' | 'lg' | 'xl';
  responsive?: {
    sm?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    md?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
    lg?: 1 | 2 | 3 | 4 | 5 | 6 | 12;
  };
}

export const RTLGrid: React.FC<RTLGridProps> = ({
  children,
  className = '',
  cols = 1,
  gap = 'md',
  responsive,
  ...rtlProps
}) => {
  const gapMap = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8'
  };
  
  const colsMap = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12'
  };
  
  const gridClasses = cn(
    'grid',
    colsMap[cols],
    gapMap[gap],
    responsive?.sm && `sm:${colsMap[responsive.sm]}`,
    responsive?.md && `md:${colsMap[responsive.md]}`,
    responsive?.lg && `lg:${colsMap[responsive.lg]}`,
    className
  );
  
  return (
    <RTLContainer className={gridClasses} {...rtlProps}>
      {children}
    </RTLContainer>
  );
};