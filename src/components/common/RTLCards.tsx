import React, { forwardRef, HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRTLClasses } from '@/hooks/useRTLClasses';
import { RTLText, RTLHeading } from './RTLText';
import { RTLButton } from './RTLButtons';

export interface RTLCardProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  header?: ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  footer?: ReactNode;
  actions?: Array<{
    text: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'ghost';
    disabled?: boolean;
  }>;
  image?: {
    src: string;
    alt: string;
    position?: 'top' | 'left' | 'right';
  };
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
  selected?: boolean;
  loading?: boolean;
}

/**
 * RTL-aware Card component with flexible layout and text overflow handling
 */
export const RTLCard = forwardRef<HTMLDivElement, RTLCardProps>(({
  children,
  header,
  title,
  subtitle,
  description,
  footer,
  actions,
  image,
  padding = 'md',
  hoverable = false,
  clickable = false,
  selected = false,
  loading = false,
  className,
  onClick,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();
  const rtlClasses = useRTLClasses();

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const cardClasses = cn(
    // Base card styles
    'rounded-lg border bg-card text-card-foreground shadow-sm',
    
    // Interactive states
    hoverable && 'transition-shadow hover:shadow-md',
    clickable && 'cursor-pointer transition-all hover:shadow-md',
    selected && 'ring-2 ring-primary ring-offset-2',
    
    // Loading state
    loading && 'opacity-60 pointer-events-none',
    
    className
  );

  const contentClasses = cn(
    paddingClasses[padding],
    image?.position === 'left' && 'flex gap-4',
    image?.position === 'right' && 'flex gap-4 flex-row-reverse',
    isRTL && image?.position === 'left' && 'flex-row-reverse',
    isRTL && image?.position === 'right' && 'flex-row'
  );

  const renderImage = () => {
    if (!image) return null;

    return (
      <div className={cn(
        'flex-shrink-0',
        image.position === 'top' && 'w-full',
        (image.position === 'left' || image.position === 'right') && 'w-24 h-24'
      )}>
        <img
          src={image.src}
          alt={image.alt}
          className={cn(
            'object-cover',
            image.position === 'top' && 'w-full h-48 rounded-t-lg',
            (image.position === 'left' || image.position === 'right') && 'w-full h-full rounded-md'
          )}
        />
      </div>
    );
  };

  const renderHeader = () => {
    if (header) return header;
    
    if (!title && !subtitle) return null;

    return (
      <div className="space-y-1.5">
        {title && (
          <RTLHeading
            level={3}
            preset="cardTitle"
            className="leading-none tracking-tight"
          >
            {title}
          </RTLHeading>
        )}
        {subtitle && (
          <RTLText
            preset="bodySmall"
            className="text-muted-foreground"
            maxLines={2}
          >
            {subtitle}
          </RTLText>
        )}
      </div>
    );
  };

  const renderContent = () => {
    const headerElement = renderHeader();
    
    return (
      <div className={cn(
        'flex-1 space-y-3',
        (image?.position === 'left' || image?.position === 'right') && 'min-w-0'
      )}>
        {headerElement}
        
        {description && (
          <RTLText
            preset="cardDescription"
            className="text-muted-foreground"
            maxLines={3}
          >
            {description}
          </RTLText>
        )}
        
        {children}
      </div>
    );
  };

  const renderActions = () => {
    if (!actions || actions.length === 0) return null;

    return (
      <div className={cn(
        'flex gap-2',
        isRTL ? 'flex-row-reverse' : 'flex-row',
        actions.length > 2 && 'flex-wrap'
      )}>
        {actions.map((action, index) => (
          <RTLButton
            key={index}
            variant={action.variant || 'outline'}
            size="sm"
            text={action.text}
            onClick={action.onClick}
            disabled={action.disabled}
            maxTextLines={1}
          />
        ))}
      </div>
    );
  };

  const renderFooter = () => {
    const actionsElement = renderActions();
    
    if (footer) {
      return (
        <div className="space-y-3">
          {footer}
          {actionsElement}
        </div>
      );
    }
    
    return actionsElement;
  };

  return (
    <div
      ref={ref}
      className={cardClasses}
      onClick={clickable ? onClick : undefined}
      {...props}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-lg">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      )}
      
      {image?.position === 'top' && renderImage()}
      
      <div className={contentClasses}>
        {(image?.position === 'left' || image?.position === 'right') && renderImage()}
        
        {renderContent()}
      </div>
      
      {renderFooter() && (
        <div className={cn(paddingClasses[padding], 'pt-0')}>
          {renderFooter()}
        </div>
      )}
    </div>
  );
});

RTLCard.displayName = 'RTLCard';

/**
 * RTL-aware Compact Card component for lists and grids
 */
export const RTLCompactCard = forwardRef<HTMLDivElement, Omit<RTLCardProps, 'padding' | 'image'> & {
  icon?: ReactNode;
  badge?: string;
  meta?: string;
}>(({
  icon,
  badge,
  meta,
  title,
  subtitle,
  description,
  actions,
  className,
  ...props
}, ref) => {
  const { isRTL } = useLanguage();

  return (
    <RTLCard
      ref={ref}
      padding="sm"
      className={cn('relative', className)}
      {...props}
    >
      <div className={cn(
        'flex items-start gap-3',
        isRTL && 'flex-row-reverse'
      )}>
        {icon && (
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className={cn(
            'flex items-start justify-between gap-2',
            isRTL && 'flex-row-reverse'
          )}>
            <div className="flex-1 min-w-0">
              {title && (
                <RTLText
                  preset="bodyMedium"
                  className="font-medium"
                  maxLines={1}
                >
                  {title}
                </RTLText>
              )}
              {subtitle && (
                <RTLText
                  preset="bodySmall"
                  className="text-muted-foreground"
                  maxLines={1}
                >
                  {subtitle}
                </RTLText>
              )}
            </div>
            
            {(badge || meta) && (
              <div className="flex-shrink-0">
                {badge && (
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {badge}
                  </span>
                )}
                {meta && (
                  <RTLText
                    preset="caption"
                    className="text-muted-foreground"
                  >
                    {meta}
                  </RTLText>
                )}
              </div>
            )}
          </div>
          
          {description && (
            <RTLText
              preset="bodySmall"
              className="text-muted-foreground mt-1"
              maxLines={2}
            >
              {description}
            </RTLText>
          )}
        </div>
      </div>
      
      {actions && actions.length > 0 && (
        <div className={cn(
          'flex gap-1 mt-3',
          isRTL ? 'flex-row-reverse' : 'flex-row'
        )}>
          {actions.map((action, index) => (
            <RTLButton
              key={index}
              variant="ghost"
              size="sm"
              text={action.text}
              onClick={action.onClick}
              disabled={action.disabled}
              className="h-8 px-2 text-xs"
            />
          ))}
        </div>
      )}
    </RTLCard>
  );
});

RTLCompactCard.displayName = 'RTLCompactCard';

/**
 * RTL-aware Stats Card component
 */
export const RTLStatsCard = forwardRef<HTMLDivElement, {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: ReactNode;
  description?: string;
  className?: string;
}>(({
  title,
  value,
  change,
  icon,
  description,
  className,
}, ref) => {
  const { isRTL } = useLanguage();

  const getChangeColor = () => {
    if (!change) return '';
    switch (change.type) {
      case 'increase': return 'text-green-600';
      case 'decrease': return 'text-red-600';
      case 'neutral': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    const iconClass = 'h-3 w-3';
    
    switch (change.type) {
      case 'increase':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
          </svg>
        );
      case 'decrease':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  return (
    <RTLCard
      ref={ref}
      padding="md"
      className={className}
    >
      <div className={cn(
        'flex items-center justify-between',
        isRTL && 'flex-row-reverse'
      )}>
        <div className="flex-1">
          <RTLText
            preset="bodySmall"
            className="text-muted-foreground font-medium"
            maxLines={1}
          >
            {title}
          </RTLText>
          
          <RTLText
            preset="heading2"
            className="font-bold mt-1"
            maxLines={1}
          >
            {value}
          </RTLText>
          
          {change && (
            <div className={cn(
              'flex items-center gap-1 mt-1',
              getChangeColor(),
              isRTL && 'flex-row-reverse'
            )}>
              {getChangeIcon()}
              <RTLText
                preset="caption"
                className="font-medium"
              >
                {change.value}
              </RTLText>
            </div>
          )}
          
          {description && (
            <RTLText
              preset="caption"
              className="text-muted-foreground mt-1"
              maxLines={2}
            >
              {description}
            </RTLText>
          )}
        </div>
        
        {icon && (
          <div className="flex-shrink-0 opacity-60">
            {icon}
          </div>
        )}
      </div>
    </RTLCard>
  );
});

RTLStatsCard.displayName = 'RTLStatsCard';

/**
 * RTL-aware Feature Card component
 */
export const RTLFeatureCard = forwardRef<HTMLDivElement, {
  title: string;
  description: string;
  icon?: ReactNode;
  image?: string;
  features?: string[];
  action?: {
    text: string;
    onClick: () => void;
  };
  className?: string;
}>(({
  title,
  description,
  icon,
  image,
  features,
  action,
  className,
}, ref) => {
  const { isRTL } = useLanguage();

  return (
    <RTLCard
      ref={ref}
      padding="lg"
      hoverable
      className={cn('h-full', className)}
    >
      <div className="space-y-4">
        {(icon || image) && (
          <div className="flex-shrink-0">
            {image ? (
              <img
                src={image}
                alt={title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {icon}
              </div>
            )}
          </div>
        )}
        
        <div className="space-y-2">
          <RTLHeading
            level={3}
            preset="cardTitle"
          >
            {title}
          </RTLHeading>
          
          <RTLText
            preset="bodyMedium"
            className="text-muted-foreground"
            maxLines={3}
          >
            {description}
          </RTLText>
        </div>
        
        {features && features.length > 0 && (
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li
                key={index}
                className={cn(
                  'flex items-center gap-2 text-sm',
                  isRTL && 'flex-row-reverse'
                )}
              >
                <svg
                  className="h-4 w-4 text-primary flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <RTLText
                  preset="bodySmall"
                  maxLines={1}
                >
                  {feature}
                </RTLText>
              </li>
            ))}
          </ul>
        )}
        
        {action && (
          <div className="pt-2">
            <RTLButton
              variant="outline"
              text={action.text}
              onClick={action.onClick}
              fullWidth
            />
          </div>
        )}
      </div>
    </RTLCard>
  );
});

RTLFeatureCard.displayName = 'RTLFeatureCard';