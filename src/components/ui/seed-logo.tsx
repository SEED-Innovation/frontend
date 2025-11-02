import React from 'react';
import { useTranslation } from 'react-i18next';

interface SeedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'icon';
  className?: string;
}

const SeedLogo: React.FC<SeedLogoProps> = ({ 
  size = 'md', 
  variant = 'full',
  className = '' 
}) => {
  const { t } = useTranslation('web');
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24'
  };

  if (variant === 'icon') {
    return (
      <div className={`${sizeClasses[size]} ${className}`}>
        <svg 
          viewBox="0 0 100 100" 
          className="h-full w-auto"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SEED Icon - Arrow/Chevron */}
          <path
            d="M25 20 L60 50 L25 80 L30 85 L70 50 L30 15 Z"
            fill="hsl(var(--seed-purple))"
          />
          <path
            d="M45 20 L80 50 L45 80 L50 85 L90 50 L50 15 Z"
            fill="hsl(var(--seed-green))"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Icon */}
      <div className={`${sizeClasses[size]} flex items-center`}>
        <svg 
          viewBox="0 0 100 100" 
          className="h-full w-auto"
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M25 20 L60 50 L25 80 L30 85 L70 50 L30 15 Z"
            fill="hsl(var(--seed-purple))"
          />
          <path
            d="M45 20 L80 50 L45 80 L50 85 L90 50 L50 15 Z"
            fill="hsl(var(--seed-green))"
          />
        </svg>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <span 
          className={`font-bold bg-gradient-to-r from-[hsl(var(--seed-purple))] to-[hsl(var(--seed-green))] bg-clip-text text-transparent ${
            size === 'sm' ? 'text-2xl' :
            size === 'md' ? 'text-3xl' :
            size === 'lg' ? 'text-4xl' :
            'text-5xl'
          }`}
          style={{ fontFamily: 'Muli, sans-serif' }}
        >
          SEED
        </span>
        {size !== 'sm' && (
          <span 
            className={`text-muted-foreground ${
              size === 'md' ? 'text-xs' :
              size === 'lg' ? 'text-sm' :
              'text-base'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            {t('ui.seedTagline')}
          </span>
        )}
      </div>
    </div>
  );
};

export default SeedLogo;