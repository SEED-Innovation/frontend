import React from 'react';
import { cn } from '@/lib/utils';

interface AppStoreButtonProps {
  variant: 'playstore' | 'appstore';
  href?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const AppStoreButton: React.FC<AppStoreButtonProps> = ({ 
  variant, 
  href, 
  disabled = false, 
  className,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'h-10 px-3',
    md: 'h-12 px-4',
    lg: 'h-14 px-5'
  };

  const Component = href && !disabled ? 'a' : 'div';
  
  const baseClasses = cn(
    "inline-flex items-center justify-center rounded-lg transition-all duration-300 cursor-pointer",
    "bg-black text-white hover:bg-gray-800 active:scale-95",
    "border border-gray-700 hover:border-gray-600",
    "shadow-lg hover:shadow-xl",
    sizeClasses[size],
    disabled && "opacity-50 cursor-not-allowed hover:bg-black hover:border-gray-700",
    className
  );

  const PlayStoreContent = () => (
    <>
      <div className="mr-3">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7">
          <path fill="#ea4335" d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5Z"/>
          <path fill="#fbbc04" d="M16.81,15.12L6.05,21.34C5.76,21.53 5.4,21.53 5.12,21.34L3.84,21.85L13.69,12L16.81,15.12Z"/>
          <path fill="#4285f4" d="M20.16,10.85C20.5,11.05 20.75,11.36 20.75,11.7C20.75,12.04 20.5,12.35 20.16,12.55L16.81,14.12L13.69,12L16.81,9.88L20.16,10.85Z"/>
          <path fill="#34a853" d="M16.81,8.88L13.69,12L3.84,2.15C4.25,1.89 4.74,1.89 5.12,2.66L16.81,8.88Z"/>
        </svg>
      </div>
      <div className="text-left">
        <div className="text-xs text-gray-300 leading-none">GET IT ON</div>
        <div className="text-sm sm:text-base font-semibold leading-tight">Google Play</div>
      </div>
    </>
  );

  const AppStoreContent = () => (
    <>
      <div className="mr-3">
        <svg viewBox="0 0 24 24" className="w-6 h-6 sm:w-7 sm:h-7" fill="currentColor">
          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
        </svg>
      </div>
      <div className="text-left">
        <div className="text-xs text-gray-300 leading-none">Download on the</div>
        <div className="text-sm sm:text-base font-semibold leading-tight">
          {disabled ? 'Coming Soon' : 'App Store'}
        </div>
      </div>
    </>
  );

  if (Component === 'a') {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
      >
        {variant === 'playstore' ? <PlayStoreContent /> : <AppStoreContent />}
      </a>
    );
  }

  return (
    <div className={baseClasses}>
      {variant === 'playstore' ? <PlayStoreContent /> : <AppStoreContent />}
    </div>
  );
};

export default AppStoreButton;