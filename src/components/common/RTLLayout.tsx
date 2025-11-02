import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useRTLClasses } from '@/hooks/useRTLClasses';

export interface RTLLayoutProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'sm' | 'md' | 'lg' | 'xl';
  textAlign?: 'start' | 'end' | 'center' | 'justify';
  direction?: 'auto' | 'ltr' | 'rtl';
}

/**
 * Main RTL Layout component that provides comprehensive RTL support
 */
export const RTLLayout: React.FC<RTLLayoutProps> = ({
  children,
  className = '',
  padding = 'md',
  margin = 'md',
  textAlign = 'start',
  direction = 'auto'
}) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses({ 
    paddingSize: padding, 
    marginSize: margin 
  });
  
  // Determine direction
  const computedDirection = direction === 'auto' ? (isRTL ? 'rtl' : 'ltr') : direction;
  
  // Text alignment classes
  const textAlignClass = textAlign === 'start' ? rtlClasses.textAlign :
                        textAlign === 'end' ? (isRTL ? 'text-start' : 'text-end') :
                        textAlign === 'center' ? 'text-center' :
                        'text-justify';
  
  const layoutClasses = cn(
    rtlClasses.container,
    rtlClasses.paddingStart,
    rtlClasses.paddingEnd,
    rtlClasses.marginStart,
    rtlClasses.marginEnd,
    textAlignClass,
    className
  );
  
  return (
    <div 
      className={layoutClasses}
      dir={computedDirection}
    >
      {children}
    </div>
  );
};

/**
 * RTL Card component with proper spacing and alignment
 */
export interface RTLCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

export const RTLCard: React.FC<RTLCardProps> = ({
  children,
  className = '',
  title,
  subtitle,
  actions,
  padding = 'md'
}) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses({ paddingSize: padding });
  
  const cardClasses = cn(
    'bg-white rounded-lg shadow-md border',
    rtlClasses.container,
    className
  );
  
  const headerClasses = cn(
    'flex items-center justify-between',
    rtlClasses.paddingStart,
    rtlClasses.paddingEnd,
    'pt-6 pb-4'
  );
  
  const contentClasses = cn(
    rtlClasses.paddingStart,
    rtlClasses.paddingEnd,
    'pb-6'
  );
  
  return (
    <div className={cardClasses} dir={isRTL ? 'rtl' : 'ltr'}>
      {(title || subtitle || actions) && (
        <div className={headerClasses}>
          <div>
            {title && (
              <h3 className={cn('text-lg font-semibold', rtlClasses.textAlign)}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={cn('text-sm text-gray-600 mt-1', rtlClasses.textAlign)}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

/**
 * RTL Form component with proper field alignment
 */
export interface RTLFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
  spacing?: 'sm' | 'md' | 'lg';
}

export const RTLForm: React.FC<RTLFormProps> = ({
  children,
  className = '',
  onSubmit,
  spacing = 'md'
}) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();
  
  const spacingMap = {
    sm: 'space-y-3',
    md: 'space-y-4',
    lg: 'space-y-6'
  };
  
  const formClasses = cn(
    rtlClasses.container,
    spacingMap[spacing],
    className
  );
  
  return (
    <form 
      className={formClasses}
      dir={isRTL ? 'rtl' : 'ltr'}
      onSubmit={onSubmit}
    >
      {children}
    </form>
  );
};

/**
 * RTL Form Field component
 */
export interface RTLFormFieldProps {
  children: React.ReactNode;
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

export const RTLFormField: React.FC<RTLFormFieldProps> = ({
  children,
  label,
  error,
  required = false,
  className = ''
}) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();
  
  const fieldClasses = cn(
    'space-y-2',
    className
  );
  
  const labelClasses = cn(
    'block text-sm font-medium text-gray-700',
    rtlClasses.textAlign
  );
  
  const errorClasses = cn(
    'text-sm text-red-600',
    rtlClasses.textAlign
  );
  
  return (
    <div className={fieldClasses}>
      {label && (
        <label className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className={errorClasses}>{error}</p>
      )}
    </div>
  );
};

/**
 * RTL Navigation component
 */
export interface RTLNavProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
}

export const RTLNav: React.FC<RTLNavProps> = ({
  children,
  className = '',
  variant = 'horizontal',
  spacing = 'md'
}) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();
  
  const spacingMap = {
    sm: variant === 'horizontal' ? 'space-x-2' : 'space-y-1',
    md: variant === 'horizontal' ? 'space-x-4' : 'space-y-2',
    lg: variant === 'horizontal' ? 'space-x-6' : 'space-y-3'
  };
  
  const navClasses = cn(
    'flex',
    variant === 'horizontal' ? (isRTL ? 'flex-row-reverse' : 'flex-row') : 'flex-col',
    spacingMap[spacing],
    rtlClasses.container,
    className
  );
  
  return (
    <nav className={navClasses} dir={isRTL ? 'rtl' : 'ltr'}>
      {children}
    </nav>
  );
};