import React, { forwardRef, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRTLClasses } from '@/hooks/useRTLClasses';
import { useContentAwareText, TextPresets } from '@/utils/textOverflowUtils';
import { RTLText, RTLLabel } from './RTLText';

export interface RTLInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'dir'> {
  label?: string;
  error?: string;
  helperText?: string;
  autoDetectDirection?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

/**
 * RTL-aware Input component with automatic text direction detection
 */
export const RTLInput = forwardRef<HTMLInputElement, RTLInputProps>(({
  label,
  error,
  helperText,
  autoDetectDirection = true,
  containerClassName,
  labelClassName,
  errorClassName,
  helperClassName,
  className,
  value,
  onChange,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();
  const { getTextClasses } = useContentAwareText();

  // Determine text direction based on content
  const textContent = typeof value === 'string' ? value : '';
  const textDirection = autoDetectDirection && textContent 
    ? getTextClasses(textContent).direction 
    : (isRTL ? 'rtl' : 'ltr');

  const inputClasses = cn(
    // Base input styles
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // RTL-aware text alignment
    isRTL ? 'text-right' : 'text-left',
    
    // Error state
    error && 'border-destructive focus-visible:ring-destructive',
    
    className
  );

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <RTLLabel
          preset="inputLabel"
          className={cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70', labelClassName)}
        >
          {label}
        </RTLLabel>
      )}
      
      <input
        ref={ref}
        className={inputClasses}
        dir={textDirection}
        value={value}
        onChange={onChange}
        {...props}
      />
      
      {helperText && !error && (
        <RTLText
          preset="inputHelp"
          className={cn('text-muted-foreground', helperClassName)}
        >
          {helperText}
        </RTLText>
      )}
      
      {error && (
        <RTLText
          preset="errorMessage"
          className={cn('text-destructive', errorClassName)}
        >
          {error}
        </RTLText>
      )}
    </div>
  );
});

RTLInput.displayName = 'RTLInput';

export interface RTLTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'dir'> {
  label?: string;
  error?: string;
  helperText?: string;
  autoDetectDirection?: boolean;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

/**
 * RTL-aware Textarea component with character counting and overflow handling
 */
export const RTLTextarea = forwardRef<HTMLTextAreaElement, RTLTextareaProps>(({
  label,
  error,
  helperText,
  autoDetectDirection = true,
  containerClassName,
  labelClassName,
  errorClassName,
  helperClassName,
  className,
  value,
  onChange,
  maxLength,
  showCharCount = false,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const { getTextClasses } = useContentAwareText();

  // Determine text direction based on content
  const textContent = typeof value === 'string' ? value : '';
  const textDirection = autoDetectDirection && textContent 
    ? getTextClasses(textContent).direction 
    : (isRTL ? 'rtl' : 'ltr');

  const currentLength = textContent.length;
  const isNearLimit = maxLength && currentLength > maxLength * 0.8;
  const isOverLimit = maxLength && currentLength > maxLength;

  const textareaClasses = cn(
    // Base textarea styles
    'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    'resize-vertical',
    
    // RTL-aware text alignment
    isRTL ? 'text-right' : 'text-left',
    
    // Error state
    error && 'border-destructive focus-visible:ring-destructive',
    
    className
  );

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <div className="flex items-center justify-between">
          <RTLLabel
            preset="inputLabel"
            className={cn('text-sm font-medium leading-none', labelClassName)}
          >
            {label}
          </RTLLabel>
          
          {showCharCount && maxLength && (
            <RTLText
              preset="caption"
              className={cn(
                'text-xs',
                isNearLimit && !isOverLimit && 'text-warning',
                isOverLimit && 'text-destructive'
              )}
            >
              {currentLength}/{maxLength}
            </RTLText>
          )}
        </div>
      )}
      
      <textarea
        ref={ref}
        className={textareaClasses}
        dir={textDirection}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...props}
      />
      
      {helperText && !error && (
        <RTLText
          preset="inputHelp"
          className={cn('text-muted-foreground', helperClassName)}
        >
          {helperText}
        </RTLText>
      )}
      
      {error && (
        <RTLText
          preset="errorMessage"
          className={cn('text-destructive', errorClassName)}
        >
          {error}
        </RTLText>
      )}
    </div>
  );
});

RTLTextarea.displayName = 'RTLTextarea';

export interface RTLSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'dir'> {
  label?: string;
  error?: string;
  helperText?: string;
  placeholder?: string;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  containerClassName?: string;
  labelClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

/**
 * RTL-aware Select component with proper option text handling
 */
export const RTLSelect = forwardRef<HTMLSelectElement, RTLSelectProps>(({
  label,
  error,
  helperText,
  placeholder,
  options,
  containerClassName,
  labelClassName,
  errorClassName,
  helperClassName,
  className,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();

  const selectClasses = cn(
    // Base select styles
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
    'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // RTL-aware text alignment and padding
    isRTL ? 'text-right pr-8 pl-3' : 'text-left pl-3 pr-8',
    
    // Error state
    error && 'border-destructive focus:ring-destructive',
    
    className
  );

  return (
    <div className={cn('space-y-2', containerClassName)}>
      {label && (
        <RTLLabel
          preset="inputLabel"
          className={cn('text-sm font-medium leading-none', labelClassName)}
        >
          {label}
        </RTLLabel>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          dir={isRTL ? 'rtl' : 'ltr'}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className={cn(
          'absolute top-1/2 -translate-y-1/2 pointer-events-none',
          isRTL ? 'left-3' : 'right-3'
        )}>
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>
      
      {helperText && !error && (
        <RTLText
          preset="inputHelp"
          className={cn('text-muted-foreground', helperClassName)}
        >
          {helperText}
        </RTLText>
      )}
      
      {error && (
        <RTLText
          preset="errorMessage"
          className={cn('text-destructive', errorClassName)}
        >
          {error}
        </RTLText>
      )}
    </div>
  );
});

RTLSelect.displayName = 'RTLSelect';

export interface RTLSearchInputProps extends Omit<RTLInputProps, 'type'> {
  onClear?: () => void;
  showClearButton?: boolean;
  searchIcon?: React.ReactNode;
}

/**
 * RTL-aware Search Input component with clear functionality
 */
export const RTLSearchInput = forwardRef<HTMLInputElement, RTLSearchInputProps>(({
  onClear,
  showClearButton = true,
  searchIcon,
  containerClassName,
  className,
  value,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const hasValue = value && typeof value === 'string' && value.length > 0;

  const inputClasses = cn(
    // Base input styles with icon padding
    'flex h-10 w-full rounded-md border border-input bg-background py-2 text-sm ring-offset-background',
    'file:border-0 file:bg-transparent file:text-sm file:font-medium',
    'placeholder:text-muted-foreground',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    
    // RTL-aware padding for icons
    isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3',
    hasValue && showClearButton && (isRTL ? 'pl-10' : 'pr-10'),
    
    className
  );

  return (
    <div className={cn('relative', containerClassName)}>
      {/* Search icon */}
      <div className={cn(
        'absolute top-1/2 -translate-y-1/2 pointer-events-none',
        isRTL ? 'right-3' : 'left-3'
      )}>
        {searchIcon || (
          <svg
            className="h-4 w-4 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        )}
      </div>
      
      <input
        ref={ref}
        type="search"
        className={inputClasses}
        value={value}
        {...props}
      />
      
      {/* Clear button */}
      {hasValue && showClearButton && onClear && (
        <button
          type="button"
          onClick={onClear}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors',
            isRTL ? 'left-2' : 'right-2'
          )}
        >
          <svg
            className="h-3 w-3 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
});

RTLSearchInput.displayName = 'RTLSearchInput';

export interface RTLCheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  error?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
  errorClassName?: string;
}

/**
 * RTL-aware Checkbox component with proper label positioning
 */
export const RTLCheckbox = forwardRef<HTMLInputElement, RTLCheckboxProps>(({
  label,
  description,
  error,
  containerClassName,
  labelClassName,
  descriptionClassName,
  errorClassName,
  className,
  id,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`;

  const checkboxClasses = cn(
    'h-4 w-4 rounded border border-primary text-primary shadow focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className
  );

  return (
    <div className={cn('space-y-2', containerClassName)}>
      <div className={cn('flex items-start space-x-2', isRTL && 'space-x-reverse')}>
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={checkboxClasses}
          {...props}
        />
        
        <div className="flex-1 space-y-1">
          {label && (
            <RTLLabel
              htmlFor={checkboxId}
              preset="label"
              className={cn('text-sm font-medium leading-none cursor-pointer', labelClassName)}
            >
              {label}
            </RTLLabel>
          )}
          
          {description && (
            <RTLText
              preset="inputHelp"
              className={cn('text-muted-foreground', descriptionClassName)}
            >
              {description}
            </RTLText>
          )}
        </div>
      </div>
      
      {error && (
        <RTLText
          preset="errorMessage"
          className={cn('text-destructive', errorClassName)}
        >
          {error}
        </RTLText>
      )}
    </div>
  );
});

RTLCheckbox.displayName = 'RTLCheckbox';

export interface RTLRadioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
  containerClassName?: string;
  labelClassName?: string;
  descriptionClassName?: string;
}

/**
 * RTL-aware Radio button component with proper label positioning
 */
export const RTLRadio = forwardRef<HTMLInputElement, RTLRadioProps>(({
  label,
  description,
  containerClassName,
  labelClassName,
  descriptionClassName,
  className,
  id,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const radioId = id || `radio-${Math.random().toString(36).substr(2, 9)}`;

  const radioClasses = cn(
    'h-4 w-4 rounded-full border border-primary text-primary shadow focus:ring-2 focus:ring-ring focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-50',
    className
  );

  return (
    <div className={cn('flex items-start space-x-2', isRTL && 'space-x-reverse', containerClassName)}>
      <input
        ref={ref}
        type="radio"
        id={radioId}
        className={radioClasses}
        {...props}
      />
      
      <div className="flex-1 space-y-1">
        {label && (
          <RTLLabel
            htmlFor={radioId}
            preset="label"
            className={cn('text-sm font-medium leading-none cursor-pointer', labelClassName)}
          >
            {label}
          </RTLLabel>
        )}
        
        {description && (
          <RTLText
            preset="inputHelp"
            className={cn('text-muted-foreground', descriptionClassName)}
          >
            {description}
          </RTLText>
        )}
      </div>
    </div>
  );
});

RTLRadio.displayName = 'RTLRadio';