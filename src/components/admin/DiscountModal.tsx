import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Court, courtService } from '@/lib/api/services/courtService';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { Badge } from '@/components/ui/badge';
import { Percent, DollarSign, Loader2 } from 'lucide-react';

interface DiscountModalProps {
  court: Court;
  isOpen: boolean;
  onClose: () => void;
  onCourtUpdated: (updatedCourt: Court) => void;
}

export const DiscountModal: React.FC<DiscountModalProps> = ({
  court,
  isOpen,
  onClose,
  onCourtUpdated
}) => {
  const [discountAmount, setDiscountAmount] = useState<number>(court.discountAmount || 0);
  const [isPercentage, setIsPercentage] = useState<boolean>(court.isPercentage || false);
  const [loading, setLoading] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);

  // Update state when court changes
  useEffect(() => {
    setDiscountAmount(court.discountAmount || 0);
    setIsPercentage(court.isPercentage || false);
  }, [court]);

  // Calculate final price with validation
  const calculateFinalPrice = (): number => {
    if (!discountAmount || discountAmount <= 0) return court.hourlyFee;
    
    if (isPercentage) {
      const discount = Math.min(discountAmount, 99); // Cap at 99% to prevent 100%
      return Math.max(0, court.hourlyFee * (1 - discount / 100));
    } else {
      return Math.max(0, court.hourlyFee - discountAmount);
    }
  };

  // Validation
  const isValidDiscount = (): boolean => {
    if (!discountAmount || discountAmount <= 0) return false;
    
    if (isPercentage) {
      return discountAmount > 0 && discountAmount < 100; // Changed from <= 100 to < 100
    } else {
      return discountAmount > 0 && discountAmount < court.hourlyFee;
    }
  };

  const finalPrice = calculateFinalPrice();
  const hasWarning = !isPercentage && discountAmount >= court.hourlyFee;
  const isMaxPercentage = isPercentage && discountAmount >= 100;

  const handleApplyDiscount = async () => {
    // Specific validation for 100% discount
    if (isPercentage && discountAmount >= 100) {
      toast.error('100% discount is not allowed. Maximum discount is 99%.');
      return;
    }

    if (!isValidDiscount()) {
      if (isPercentage) {
        toast.error('Please enter a percentage between 1% and 99%');
      } else {
        toast.error('Discount amount must be less than the hourly fee');
      }
      return;
    }

    setLoading(true);
    try {
      const updatedCourt = await courtService.applyDiscount(court.id, discountAmount, isPercentage);
      onCourtUpdated(updatedCourt);
      toast.success(`Discount applied successfully`);
      onClose();
    } catch (error) {
      console.error('Error applying discount:', error);
      toast.error('Failed to apply discount. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveDiscount = async () => {
    setLoading(true);
    try {
      const updatedCourt = await courtService.removeDiscount(court.id);
      onCourtUpdated(updatedCourt);
      toast.success('Discount removed successfully');
      setShowRemoveDialog(false);
      onClose();
    } catch (error) {
      console.error('Error removing discount:', error);
      toast.error('No discount currently applied to this court');
    } finally {
      setLoading(false);
    }
  };

  const hasDiscount = court.discountAmount !== null && court.discountAmount !== undefined && court.discountAmount > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Manage Discount - {court.name}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Current Pricing */}
            <div className="p-4 rounded-lg bg-muted/50">
              <Label className="text-sm font-medium text-muted-foreground">Current Hourly Fee</Label>
              <div className="mt-1">
                <CurrencyDisplay amount={court.hourlyFee} size="lg" />
              </div>
              {hasDiscount && (
                <Badge variant="secondary" className="mt-2">
                  {court.isPercentage ? `-${court.discountAmount}%` : `-${court.discountAmount} SAR`}
                </Badge>
              )}
            </div>

            {/* Discount Configuration */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Discount Type</Label>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${!isPercentage ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Fixed (SAR)
                  </span>
                  <Switch
                    checked={isPercentage}
                    onCheckedChange={setIsPercentage}
                    disabled={loading}
                  />
                  <span className={`text-sm ${isPercentage ? 'text-foreground' : 'text-muted-foreground'}`}>
                    Percentage (%)
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount-amount">
                  Discount Amount {isPercentage ? '(%)' : '(SAR)'}
                </Label>
                <div className="relative">
                  <Input
                    id="discount-amount"
                    type="number"
                    min="0"
                    max={isPercentage ? "99" : court.hourlyFee - 1}
                    step={isPercentage ? "0.1" : "1"}
                    value={discountAmount || ''}
                    onChange={(e) => setDiscountAmount(parseFloat(e.target.value) || 0)}
                    placeholder={isPercentage ? "e.g., 20" : "e.g., 15"}
                    disabled={loading}
                    className={hasWarning || isMaxPercentage ? 'border-destructive' : ''}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isPercentage ? (
                      <Percent className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <span className="text-sm text-muted-foreground">SAR</span>
                    )}
                  </div>
                </div>
                {hasWarning && (
                  <p className="text-sm text-destructive">
                    Fixed discount cannot be equal to or greater than the hourly fee
                  </p>
                )}
                {isMaxPercentage && (
                  <p className="text-sm text-destructive">
                    100% discount is not allowed. Maximum discount is 99%
                  </p>
                )}
              </div>
            </div>

            {/* Live Preview */}
            {discountAmount > 0 && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border">
                <Label className="text-sm font-medium text-muted-foreground">Price Preview</Label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="line-through text-muted-foreground">
                    <CurrencyDisplay amount={court.hourlyFee} size="md" />
                  </div>
                  <span className="text-muted-foreground">→</span>
                  <div className="text-primary font-semibold">
                    <CurrencyDisplay amount={finalPrice} size="lg" />
                  </div>
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  You save: <CurrencyDisplay amount={court.hourlyFee - finalPrice} size="sm" />
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            {hasDiscount && (
              <Button
                variant="destructive"
                onClick={() => setShowRemoveDialog(true)}
                disabled={loading}
              >
                Remove Discount
              </Button>
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button
                onClick={handleApplyDiscount}
                disabled={loading || !isValidDiscount()}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Apply Discount
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Discount Confirmation */}
      <AlertDialog open={showRemoveDialog} onOpenChange={setShowRemoveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Discount</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove the discount from "{court.name}"? 
              The hourly fee will return to <CurrencyDisplay amount={court.hourlyFee} className="inline-flex" />.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveDiscount}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Remove Discount
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};