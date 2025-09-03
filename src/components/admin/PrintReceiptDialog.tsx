import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Printer, Eye, Mail, X, Download, Loader2 } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useToast } from '@/hooks/use-toast';

interface PrintReceiptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    receiptData: {
        receiptId: number;
        receiptNumber: string;
        totalAmount: number;
        pdfUrl?: string;
        userEmail?: string;
        userName?: string;
        courtName?: string;
        bookingDate?: string;
        startTime?: string;
        endTime?: string;
    };
}

const PrintReceiptDialog: React.FC<PrintReceiptDialogProps> = ({
    isOpen,
    onClose,
    receiptData
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const { toast } = useToast();

    const handlePrintReceipt = async () => {
        try {
            setIsDownloading(true);
            
            // Use the receiptService to download PDF
            const { receiptService } = await import('@/services/receiptService');
            
            const blob = await receiptService.downloadReceiptPDF(receiptData.receiptId);
            const url = URL.createObjectURL(blob);
            
            // Open in new window for printing
            const printWindow = window.open(url, '_blank');
            
            if (printWindow) {
                printWindow.onload = () => {
                    printWindow.focus();
                    printWindow.print();
                };
                
                // Clean up URL after a delay
                setTimeout(() => {
                    URL.revokeObjectURL(url);
                }, 1000);
                
                toast({
                    title: "Print Dialog Opened",
                    description: "Receipt opened in new window for printing",
                });
            } else {
                // Fallback: download if popup blocked
                const link = document.createElement('a');
                link.href = url;
                link.download = `receipt-${receiptData.receiptNumber}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
                
                toast({
                    title: "Download Started",
                    description: "Receipt downloaded - you can print it manually",
                });
            }
            
        } catch (error) {
            console.error('Print failed:', error);
            toast({
                title: "Print Failed",
                description: "Unable to open receipt for printing. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePreviewReceipt = async () => {
        try {
            setIsPreviewing(true);
            
            // Use the receiptService to download PDF for preview
            const { receiptService } = await import('@/services/receiptService');
            
            const blob = await receiptService.downloadReceiptPDF(receiptData.receiptId);
            const url = URL.createObjectURL(blob);
            
            // Open in new tab for preview
            window.open(url, '_blank');
            
            // Clean up URL after delay
            setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1000);
            
            toast({
                title: "Preview Opened",
                description: "Receipt opened in new tab for preview",
            });
            
        } catch (error) {
            console.error('Preview failed:', error);
            toast({
                title: "Preview Failed",
                description: "Unable to preview receipt. Please try again.",
                variant: "destructive"
            });
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleEmailOnly = () => {
        toast({
            title: "Email Sent",
            description: "Receipt has been sent to the customer's email",
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center space-x-2">
                        <Printer className="w-5 h-5 text-primary" />
                        <span>Print Receipt</span>
                    </DialogTitle>
                    <DialogDescription>
                        Booking created successfully! Choose how to handle the receipt.
                    </DialogDescription>
                </DialogHeader>

                {/* Receipt Summary */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Receipt #</span>
                        <span className="font-mono text-sm">{receiptData.receiptNumber}</span>
                    </div>
                    
                    {receiptData.userName && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Player</span>
                            <span className="font-medium text-sm">{receiptData.userName}</span>
                        </div>
                    )}
                    
                    {receiptData.courtName && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Court</span>
                            <span className="font-medium text-sm">{receiptData.courtName}</span>
                        </div>
                    )}
                    
                    {receiptData.bookingDate && receiptData.startTime && receiptData.endTime && (
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Time</span>
                            <span className="font-medium text-sm">
                                {receiptData.bookingDate} | {receiptData.startTime} - {receiptData.endTime}
                            </span>
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                        <span className="font-medium text-muted-foreground">Total</span>
                        <span className="font-bold text-lg">
                            <CurrencyDisplay amount={receiptData.totalAmount} size="lg" showSymbol />
                        </span>
                    </div>
                </div>

                <DialogFooter className="flex flex-col space-y-2 sm:flex-col sm:space-x-0">
                    {/* Primary Actions */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                            onClick={handlePrintReceipt}
                            disabled={isDownloading}
                            className="w-full"
                        >
                            {isDownloading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <Printer className="w-4 h-4 mr-2" />
                                    Print Receipt
                                </>
                            )}
                        </Button>
                        
                        <Button
                            variant="outline"
                            onClick={handlePreviewReceipt}
                            disabled={isPreviewing}
                            className="w-full"
                        >
                            {isPreviewing ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Opening...
                                </>
                            ) : (
                                <>
                                    <Eye className="w-4 h-4 mr-2" />
                                    Preview
                                </>
                            )}
                        </Button>
                    </div>
                    
                    {/* Secondary Actions */}
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <Button
                            variant="secondary"
                            onClick={handleEmailOnly}
                            className="w-full"
                        >
                            <Mail className="w-4 h-4 mr-2" />
                            Email Only
                        </Button>
                        
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="w-full"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Close
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PrintReceiptDialog;