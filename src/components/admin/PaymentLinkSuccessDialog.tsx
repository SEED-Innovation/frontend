import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    CheckCircle,
    Copy,
    ExternalLink,
    Clock,
    Calendar,
    MapPin,
    DollarSign,
    Share2
} from 'lucide-react';
import { PaymentLinkDTO } from '@/types/paymentLink';
import { paymentLinkService } from '@/services/paymentLinkService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { CurrencyDisplay } from '@/components/ui/currency-display';

interface PaymentLinkSuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    paymentLink: PaymentLinkDTO;
}

const PaymentLinkSuccessDialog: React.FC<PaymentLinkSuccessDialogProps> = ({
    isOpen,
    onClose,
    paymentLink
}) => {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    // Generate the payment link URL using the current application URL
    const currentOrigin = window.location.origin; // Gets the current protocol + domain + port
    const paymentLinkUrl = `${currentOrigin}/payment/${paymentLink.id}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(paymentLinkUrl);
            setCopied(true);
            toast({
                title: 'Link Copied',
                description: 'Payment link copied to clipboard',
            });
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
            toast({
                title: 'Copy Failed',
                description: 'Failed to copy link to clipboard',
                variant: 'destructive'
            });
        }
    };

    const handleWhatsAppShare = () => {
        const message = paymentLink.whatsAppTemplate?.formattedMessage || 
            `🎾 SEED Tennis Booking\n\nCourt: ${paymentLink.courtName}\nFacility: ${paymentLink.facilityName}\nDate: ${format(new Date(paymentLink.bookingDate), 'PPP')}\nTime: ${paymentLink.startTime} - ${paymentLink.endTime}\nPrice: ${paymentLink.totalAmount} SAR\n\nComplete your booking: ${paymentLinkUrl}`;
        
        const whatsappUrl = paymentLinkService.generateWhatsAppWebLink(message);
        window.open(whatsappUrl, '_blank');
    };

    const expiresAt = new Date(paymentLink.expiresAt);
    const hoursUntilExpiry = Math.floor((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60));

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Payment Link Created!</DialogTitle>
                            <DialogDescription>
                                Share this link with your customer to complete the booking
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Booking Summary */}
                    <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                        <h4 className="font-semibold text-sm">Booking Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Court</p>
                                    <p className="font-medium">{paymentLink.courtName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Facility</p>
                                    <p className="font-medium">{paymentLink.facilityName}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Date</p>
                                    <p className="font-medium">
                                        {format(new Date(paymentLink.bookingDate), 'PPP')}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-muted-foreground" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Time</p>
                                    <p className="font-medium">
                                        {paymentLink.startTime} - {paymentLink.endTime}
                                    </p>
                                </div>
                            </div>
                        </div>
                        
                        {paymentLink.recordingAddon && (
                            <div className="pt-3 border-t border-border">
                                <p className="text-sm font-medium">✅ Recording Service Included</p>
                            </div>
                        )}
                        
                        <div className="pt-3 border-t border-border flex items-center justify-between">
                            <span className="font-semibold">Total Amount</span>
                            <span className="text-xl font-bold text-primary">
                                <CurrencyDisplay amount={paymentLink.totalAmount} size="lg" showSymbol />
                            </span>
                        </div>
                    </div>

                    {/* Expiration Warning */}
                    <Alert>
                        <Clock className="h-4 w-4" />
                        <AlertDescription>
                            This link will expire in <strong>{hoursUntilExpiry} hours</strong> ({format(expiresAt, 'PPp')})
                        </AlertDescription>
                    </Alert>

                    {/* Payment Link */}
                    <div className="space-y-2">
                        <Label>Payment Link</Label>
                        <div className="flex gap-2">
                            <Input
                                value={paymentLinkUrl}
                                readOnly
                                className="font-mono text-sm"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                onClick={handleCopyLink}
                            >
                                {copied ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                    <Copy className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Customer Info */}
                    {(paymentLink.phoneNumber || paymentLink.targetUserId) && (
                        <div className="bg-blue-50 p-3 rounded-lg text-sm">
                            <p className="font-medium text-blue-900">Customer Information</p>
                            <p className="text-blue-700 mt-1">
                                {paymentLink.phoneNumber 
                                    ? `Phone: ${paymentLink.phoneNumber}` 
                                    : `User ID: ${paymentLink.targetUserId}`}
                            </p>
                        </div>
                    )}
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="w-full sm:w-auto"
                    >
                        Close
                    </Button>
                    <Button
                        type="button"
                        onClick={handleWhatsAppShare}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                    >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share via WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PaymentLinkSuccessDialog;
