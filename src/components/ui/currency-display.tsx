import React from 'react';
import { cn } from '@/lib/utils';
import sarSymbol from '@/assets/sar-symbol.png';

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSymbol?: boolean;
}

const sizeClasses = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl'
};

const symbolSizeClasses = {
  sm: 'w-3 h-3',
  md: 'w-4 h-4', 
  lg: 'w-5 h-5',
  xl: 'w-6 h-6'
};

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  className,
  size = 'md',
  showSymbol = true
}) => {
  return (
    <div className={cn(
      "flex items-center gap-1 font-semibold",
      sizeClasses[size],
      className
    )}>
      <span>{amount.toFixed(2)}</span>
      {showSymbol && (
        <img 
          src={sarSymbol} 
          alt="SAR" 
          className={cn("inline-block", symbolSizeClasses[size])}
        />
      )}
    </div>
  );
};