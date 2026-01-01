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
        <img 
          src="/logo.png" 
          alt="SEED Logo"
          className="h-full w-auto object-contain"
        />
      </div>
    );
  }

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Logo Image */}
      <div className={`${sizeClasses[size]} flex items-center`}>
        <img 
          src="/logo.png" 
          alt="SEED Logo"
          className="h-full w-auto object-contain"
        />
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