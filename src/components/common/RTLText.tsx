import React, { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useContentAwareText, useResponsiveText, TextPresets, TextPresetKey, ResponsiveTextConfig, TextOverflowConfig } from '@/utils/textOverflowUtils';

export interface RTLTextProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  children: ReactNode;
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'strong' | 'em';
  preset?: TextPresetKey;
  maxLines?: number;
  enableEllipsis?: boolean;
  enableWordBreak?: boolean;
  enableHyphens?: boolean;
  alignment?: 'start' | 'end' | 'center' | 'justify';
  autoDetectDirection?: boolean;
  responsiveConfig?: ResponsiveTextConfig;
  overflowConfig?: TextOverflowConfig;
  truncate?: boolean;
  className?: string;
}

/**
 * RTL-aware text component with automatic overflow handling and responsive typography
 */
export const RTLText = forwardRef<HTMLElement, RTLTextProps>(({
  children,
  as: Component = 'p',
  preset,
  maxLines,
  enableEllipsis = true,
  enableWordBreak = true,
  enableHyphens = false,
  alignment,
  autoDetectDirection = true,
  responsiveConfig,
  overflowConfig,
  truncate = false,
  className,
  style,
  ...props
}, ref) => {
  const { getTextClasses } = useContentAwareText();
  
  // Convert children to string for analysis
  const textContent = React.Children.toArray(children).join(' ');
  
  // Get preset configuration if specified
  const presetConfig = preset ? TextPresets[preset] : {};
  
  // Merge configurations
  const finalOverflowConfig: TextOverflowConfig = {
    maxLines: maxLines ?? presetConfig.maxLines ?? 1,
    enableEllipsis: enableEllipsis ?? presetConfig.enableEllipsis ?? true,
    enableWordBreak: enableWordBreak ?? presetConfig.enableWordBreak ?? true,
    enableHyphens: enableHyphens ?? presetConfig.enableHyphens ?? false,
    ...overflowConfig
  };

  const finalResponsiveConfig: ResponsiveTextConfig = {
    baseSize: presetConfig.baseSize || 'text-base',
    smSize: presetConfig.smSize,
    mdSize: presetConfig.mdSize,
    lgSize: presetConfig.lgSize,
    xlSize: presetConfig.xlSize,
    ...responsiveConfig
  };

  // Get responsive text classes
  const { getClasses: getResponsiveClasses } = useResponsiveText(finalResponsiveConfig);
  
  // Get text-specific classes
  const textClasses = getTextClasses(textContent, {
    ...finalOverflowConfig,
    alignment
  });

  // Handle truncate shorthand
  const effectiveMaxLines = truncate ? 1 : finalOverflowConfig.maxLines;
  
  // Build CSS classes
  const classes = cn(
    // Responsive typography
    getResponsiveClasses(),
    
    // Text overflow and alignment
    textClasses.classes,
    
    // Line clamping for multi-line truncation
    effectiveMaxLines && effectiveMaxLines > 1 && [
      'overflow-hidden',
      'display-webkit-box',
      '-webkit-box-orient-vertical',
    ],
    
    // Single line truncation
    truncate && 'truncate',
    
    // Custom classes
    className
  );

  // Build inline styles
  const inlineStyles: React.CSSProperties = {
    ...style,
    direction: autoDetectDirection ? textClasses.direction : undefined,
    WebkitLineClamp: effectiveMaxLines && effectiveMaxLines > 1 ? effectiveMaxLines : undefined,
  };

  return React.createElement(
    Component,
    {
      ref,
      className: classes,
      style: inlineStyles,
      ...props
    },
    children
  );
});

RTLText.displayName = 'RTLText';

/**
 * Specialized heading components with RTL support
 */
export const RTLHeading = forwardRef<HTMLHeadingElement, Omit<RTLTextProps, 'as'> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }>(({
  level = 1,
  preset,
  ...props
}, ref) => {
  const headingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  const defaultPreset = level <= 3 ? `heading${level}` as TextPresetKey : 'heading3';
  
  return (
    <RTLText
      ref={ref as any}
      as={headingTag}
      preset={preset || defaultPreset}
      {...props}
    />
  );
});

RTLHeading.displayName = 'RTLHeading';

/**
 * Specialized paragraph component with RTL support
 */
export const RTLParagraph = forwardRef<HTMLParagraphElement, Omit<RTLTextProps, 'as'>>(({
  preset = 'bodyMedium',
  ...props
}, ref) => (
  <RTLText
    ref={ref as any}
    as="p"
    preset={preset}
    {...props}
  />
));

RTLParagraph.displayName = 'RTLParagraph';

/**
 * Specialized span component with RTL support
 */
export const RTLSpan = forwardRef<HTMLSpanElement, Omit<RTLTextProps, 'as'>>(({
  preset = 'bodyMedium',
  ...props
}, ref) => (
  <RTLText
    ref={ref as any}
    as="span"
    preset={preset}
    {...props}
  />
));

RTLSpan.displayName = 'RTLSpan';

/**
 * Specialized label component with RTL support
 */
export const RTLLabel = forwardRef<HTMLLabelElement, Omit<RTLTextProps, 'as'>>(({
  preset = 'label',
  ...props
}, ref) => (
  <RTLText
    ref={ref as any}
    as="label"
    preset={preset}
    {...props}
  />
));

RTLLabel.displayName = 'RTLLabel';

/**
 * Caption component for small text with RTL support
 */
export const RTLCaption = forwardRef<HTMLElement, Omit<RTLTextProps, 'as' | 'preset'>>(({
  className,
  ...props
}, ref) => (
  <RTLText
    ref={ref}
    as="span"
    preset="caption"
    className={cn('text-muted-foreground', className)}
    {...props}
  />
));

RTLCaption.displayName = 'RTLCaption';

/**
 * Truncated text component for single-line overflow
 */
export const TruncatedText = forwardRef<HTMLElement, RTLTextProps>(({
  maxLines = 1,
  enableEllipsis = true,
  ...props
}, ref) => (
  <RTLText
    ref={ref}
    maxLines={maxLines}
    enableEllipsis={enableEllipsis}
    truncate={maxLines === 1}
    {...props}
  />
));

TruncatedText.displayName = 'TruncatedText';

/**
 * Multi-line clamped text component
 */
export const ClampedText = forwardRef<HTMLElement, RTLTextProps & { lines: number }>(({
  lines,
  enableEllipsis = true,
  ...props
}, ref) => (
  <RTLText
    ref={ref}
    maxLines={lines}
    enableEllipsis={enableEllipsis}
    {...props}
  />
));

ClampedText.displayName = 'ClampedText';

/**
 * Responsive text that adapts to container size
 */
export const ResponsiveText = forwardRef<HTMLElement, RTLTextProps & {
  minSize?: string;
  maxSize?: string;
  scaleFactor?: number;
}>(({
  minSize = 'text-xs',
  maxSize = 'text-2xl',
  scaleFactor = 1,
  responsiveConfig,
  ...props
}, ref) => {
  const config: ResponsiveTextConfig = {
    baseSize: 'text-base',
    minSize,
    maxSize,
    ...responsiveConfig
  };

  return (
    <RTLText
      ref={ref}
      responsiveConfig={config}
      {...props}
    />
  );
});

ResponsiveText.displayName = 'ResponsiveText';