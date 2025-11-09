import React from 'react';
import { useTranslation } from 'react-i18next';
import { Receipt, Video, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { cn } from '@/lib/utils';

interface FeeBreakdownProps {
  courtFee: number;
  seedRecordingFee?: number;
  duration?: number; // in minutes
  hourlyRate?: number;
  className?: string;
  showHeader?: boolean;
  compact?: boolean;
}

export const FeeBreakdown: React.FC<FeeBreakdownProps> = ({
  courtFee,
  seedRecordingFee = 0,
  duration,
  hourlyRate,
  className,
  showHeader = true,
  compact = false,
}) => {
  const { t } = useTranslation('admin');

  const total = courtFee + seedRecordingFee;

  const FeeRow = ({ 
    icon: Icon, 
    label, 
    amount, 
    iconColor, 
    isTotal = false 
  }: { 
    icon: React.ElementType; 
    label: string; 
    amount: number; 
    iconColor: string; 
    isTotal?: boolean;
  }) => (
    <div
      className={cn(
        'flex items-center justify-between py-3 px-4 rounded-lg transition-colors',
        isTotal ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/50'
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'p-2 rounded-lg',
            iconColor
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <p className={cn(
            'font-medium',
            isTotal ? 'text-base text-primary' : 'text-sm text-foreground'
          )}>
            {label}
          </p>
          {!isTotal && duration && hourlyRate && label.includes('Court') && (
            <p className="text-xs text-muted-foreground">
              {duration} min × {hourlyRate} SAR/hr
            </p>
          )}
        </div>
      </div>
      <div className={cn(
        'font-semibold',
        isTotal ? 'text-lg text-primary' : 'text-base text-foreground'
      )}>
        <CurrencyDisplay amount={amount} size={isTotal ? 'lg' : 'md'} showSymbol />
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Court Fee</span>
          <CurrencyDisplay amount={courtFee} size="sm" showSymbol />
        </div>
        {seedRecordingFee > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">SEED Recording Fee</span>
            <CurrencyDisplay amount={seedRecordingFee} size="sm" showSymbol />
          </div>
        )}
        <div className="flex justify-between font-semibold pt-2 border-t">
          <span>Total</span>
          <CurrencyDisplay amount={total} size="md" showSymbol />
        </div>
      </div>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {showHeader && (
        <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5 border-b">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Receipt className="w-5 h-5 text-primary" />
            {t('feeBreakdown.title', 'Payment Summary')}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn('space-y-2', showHeader ? 'pt-6' : 'pt-4')}>
        <FeeRow
          icon={TrendingUp}
          label={t('feeBreakdown.courtFee', 'Court Fee')}
          amount={courtFee}
          iconColor="bg-green-100 text-green-600"
        />

        {seedRecordingFee > 0 && (
          <FeeRow
            icon={Video}
            label={t('feeBreakdown.seedRecordingFee', 'SEED Recording Fee')}
            amount={seedRecordingFee}
            iconColor="bg-blue-100 text-blue-600"
          />
        )}

        {/* Dotted divider */}
        <div className="flex items-center gap-1 py-2">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="h-0.5 flex-1 bg-border rounded-full"
            />
          ))}
        </div>

        <FeeRow
          icon={DollarSign}
          label={t('feeBreakdown.totalAmount', 'Total Amount')}
          amount={total}
          iconColor="bg-primary/10 text-primary"
          isTotal
        />
      </CardContent>
    </Card>
  );
};

export default FeeBreakdown;
