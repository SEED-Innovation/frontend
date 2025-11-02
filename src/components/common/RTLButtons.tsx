import React, { forwardRef, ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRTLClasses } from '@/hooks/useRTLClasses';
import { RTLText } from './RTLText';

export interface RTLButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children?: ReactNode;
  text?: string;
  icon?: ReactNode;
  iconPosition?: 'start' | 'end';
  loading?: boolean;
  loadingText?: string;
  fullWidth?: boolean;
  maxTextLines?: number;
  enableTextOverflow?: boolean;
}

const buttonVariants = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
};

const buttonSizes = {
  default: 'h-10 px-4 py-2',
  sm: 'h-9 rounded-md px-3',
  lg: 'h-11 rounded-md px-8',
  icon: 'h-10 w-10',
};

/**
 * RTL-aware Button component with text overflow handling and icon positioning
 */
export const RTLButton = forwardRef<HTMLButtonElement, RTLButtonProps>(({
  variant = 'default',
  size = 'default',
  children,
  text,
  icon,
  iconPosition = 'start',
  loading = false,
  loadingText,
  fullWidth = false,
  maxTextLines = 1,
  enableTextOverflow = true,
  className,
  disabled,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();

  const isDisabled = disabled || loading;
  const displayText = loading && loadingText ? loadingText : text;
  const content = children || displayText;

  // Determine icon position based on RTL
  const effectiveIconPosition = isRTL 
    ? (iconPosition === 'start' ? 'end' : 'start')
    : iconPosition;

  const buttonClasses = cn(
    // Base button styles
    'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background',
    'transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    
    // Variant styles
    buttonVariants[variant],
    
    // Size styles
    buttonSizes[size],
    
    // Full width
    fullWidth && 'w-full',
    
    // RTL-aware spacing for icons
    icon && size !== 'icon' && 'gap-2',
    
    className
  );

  const renderContent = () => {
    if (size === 'icon') {
      return loading ? (
        <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
      ) : (
        icon || content
      );
    }

    const textElement = content ? (
      enableTextOverflow ? (
        <RTLText
          as="span"
          preset="button"
          maxLines={maxTextLines}
          className="flex-1"
        >
          {content}
        </RTLText>
      ) : (
        <span className="flex-1">{content}</span>
      )
    ) : null;

    const iconElement = loading ? (
      <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
    ) : icon;

    if (!iconElement) {
      return textElement;
    }

    if (!textElement) {
      return iconElement;
    }

    // Arrange icon and text based on position and RTL
    const elements = effectiveIconPosition === 'start' 
      ? [iconElement, textElement]
      : [textElement, iconElement];

    return (
      <>
        {elements[0]}
        {elements[1]}
      </>
    );
  };

  return (
    <button
      ref={ref}
      className={buttonClasses}
      disabled={isDisabled}
      {...props}
    >
      {renderContent()}
    </button>
  );
});

RTLButton.displayName = 'RTLButton';

/**
 * RTL-aware Icon Button component
 */
export const RTLIconButton = forwardRef<HTMLButtonElement, Omit<RTLButtonProps, 'size' | 'text' | 'children'> & {
  icon: ReactNode;
  tooltip?: string;
}>(({
  icon,
  tooltip,
  ...props
}, ref) => (
  <RTLButton
    ref={ref}
    size="icon"
    title={tooltip}
    {...props}
  >
    {icon}
  </RTLButton>
));

RTLIconButton.displayName = 'RTLIconButton';

/**
 * RTL-aware Toggle Button component
 */
export const RTLToggleButton = forwardRef<HTMLButtonElement, RTLButtonProps & {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
}>(({
  pressed = false,
  onPressedChange,
  variant = 'outline',
  className,
  onClick,
  ...props
}, ref) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onPressedChange?.(!pressed);
    onClick?.(event);
  };

  return (
    <RTLButton
      ref={ref}
      variant={pressed ? 'default' : variant}
      className={cn(
        pressed && 'bg-accent text-accent-foreground',
        className
      )}
      onClick={handleClick}
      {...props}
    />
  );
});

RTLToggleButton.displayName = 'RTLToggleButton';

/**
 * RTL-aware Button Group component
 */
export interface RTLButtonGroupProps {
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  size?: 'default' | 'sm' | 'lg';
  variant?: 'default' | 'outline';
}

export const RTLButtonGroup = forwardRef<HTMLDivElement, RTLButtonGroupProps>(({
  children,
  orientation = 'horizontal',
  className,
  size = 'default',
  variant = 'outline',
}, ref) => {
  const { isRTL } = useLanguage();

  const groupClasses = cn(
    'inline-flex',
    orientation === 'horizontal' ? 'flex-row' : 'flex-col',
    isRTL && orientation === 'horizontal' && 'flex-row-reverse',
    className
  );

  // Clone children to add group-specific styles
  const processedChildren = React.Children.map(children, (child, index) => {
    if (React.isValidElement(child)) {
      const isFirst = index === 0;
      const isLast = index === React.Children.count(children) - 1;
      
      let additionalClasses = '';
      
      if (orientation === 'horizontal') {
        if (!isFirst && !isLast) {
          additionalClasses = 'rounded-none border-l-0';
        } else if (isFirst) {
          additionalClasses = isRTL ? 'rounded-l-none border-l-0' : 'rounded-r-none';
        } else if (isLast) {
          additionalClasses = isRTL ? 'rounded-r-none' : 'rounded-l-none border-l-0';
        }
      } else {
        if (!isFirst && !isLast) {
          additionalClasses = 'rounded-none border-t-0';
        } else if (isFirst) {
          additionalClasses = 'rounded-b-none';
        } else if (isLast) {
          additionalClasses = 'rounded-t-none border-t-0';
        }
      }

      return React.cloneElement(child, {
        ...child.props,
        size: child.props.size || size,
        variant: child.props.variant || variant,
        className: cn(child.props.className, additionalClasses),
      });
    }
    return child;
  });

  return (
    <div ref={ref} className={groupClasses} role="group">
      {processedChildren}
    </div>
  );
});

RTLButtonGroup.displayName = 'RTLButtonGroup';

/**
 * RTL-aware Floating Action Button component
 */
export const RTLFloatingActionButton = forwardRef<HTMLButtonElement, RTLButtonProps & {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  extended?: boolean;
}>(({
  position = 'bottom-right',
  extended = false,
  size = extended ? 'default' : 'icon',
  className,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();

  // Adjust position for RTL
  const getPositionClasses = () => {
    const [vertical, horizontal] = position.split('-');
    const adjustedHorizontal = isRTL 
      ? (horizontal === 'right' ? 'left' : 'right')
      : horizontal;
    
    return cn(
      'fixed z-50',
      vertical === 'bottom' ? 'bottom-6' : 'top-6',
      adjustedHorizontal === 'right' ? 'right-6' : 'left-6'
    );
  };

  return (
    <RTLButton
      ref={ref}
      size={size}
      className={cn(
        'rounded-full shadow-lg hover:shadow-xl transition-shadow',
        extended ? 'px-6' : '',
        getPositionClasses(),
        className
      )}
      {...props}
    />
  );
});

RTLFloatingActionButton.displayName = 'RTLFloatingActionButton';

/**
 * RTL-aware Split Button component
 */
export interface RTLSplitButtonProps extends Omit<RTLButtonProps, 'children'> {
  mainAction: {
    text: string;
    onClick: () => void;
  };
  dropdownActions: Array<{
    text: string;
    onClick: () => void;
    disabled?: boolean;
    icon?: ReactNode;
  }>;
  dropdownOpen?: boolean;
  onDropdownToggle?: (open: boolean) => void;
}

export const RTLSplitButton = forwardRef<HTMLButtonElement, RTLSplitButtonProps>(({
  mainAction,
  dropdownActions,
  dropdownOpen = false,
  onDropdownToggle,
  variant = 'default',
  size = 'default',
  className,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();

  return (
    <div className="relative inline-flex">
      <RTLButton
        ref={ref}
        variant={variant}
        size={size}
        text={mainAction.text}
        onClick={mainAction.onClick}
        className={cn(
          isRTL ? 'rounded-l-none' : 'rounded-r-none',
          className
        )}
        {...props}
      />
      
      <RTLButton
        variant={variant}
        size={size}
        onClick={() => onDropdownToggle?.(!dropdownOpen)}
        className={cn(
          'border-l',
          isRTL ? 'rounded-r-none' : 'rounded-l-none',
          'px-2'
        )}
      >
        <svg
          className={cn(
            'h-4 w-4 transition-transform',
            dropdownOpen && 'rotate-180'
          )}
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
      </RTLButton>
      
      {dropdownOpen && (
        <div className={cn(
          'absolute top-full mt-1 min-w-full bg-background border rounded-md shadow-lg z-50',
          isRTL ? 'right-0' : 'left-0'
        )}>
          {dropdownActions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                onDropdownToggle?.(false);
              }}
              disabled={action.disabled}
              className={cn(
                'w-full px-3 py-2 text-sm text-left hover:bg-accent hover:text-accent-foreground',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'flex items-center gap-2',
                isRTL && 'text-right flex-row-reverse',
                index === 0 && 'rounded-t-md',
                index === dropdownActions.length - 1 && 'rounded-b-md'
              )}
            >
              {action.icon}
              <RTLText as="span" preset="button" maxLines={1}>
                {action.text}
              </RTLText>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

RTLSplitButton.displayName = 'RTLSplitButton';