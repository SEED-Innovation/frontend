import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
    Plus,
    Calendar as CalendarIcon,
    Clock,
    AlertTriangle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { BookingResponse, CreateBookingRequest, CourtResponse } from '@/types/booking';
import { UserResponse } from '@/types/user';
import { bookingService } from '@/services';
import { cn } from '@/lib/utils';
import UserSearchInput from './UserSearchInput';
import CourtSearchInput from './common/CourtSearchInput';
import PrintReceiptDialog from './PrintReceiptDialog';

interface ManualBookingFormProps {
    onBookingCreated: (booking: BookingResponse, receipt?: any) => void;
    triggerButton?: React.ReactNode;
    className?: string;
}

interface BookingFormData {
    userId: number | null;
    courtId: number | null;
    date: Date | null;
    duration: number | null; // 60, 90, or 120 minutes
    selectedSlot: TimeSlot | null;
    matchType: 'SINGLE' | 'DOUBLE' | '';
    notes: string;
    paymentMethod: 'CASH' | 'TAP_TO_MANAGER' | 'PENDING' | '';
    sendReceiptEmail: boolean;
    customerEmail: string;
}

interface TimeSlot {
    startTime: string;
    endTime: string;
    formattedTimeRange: string;
    price: number;
    available: boolean;
}

const ManualBookingForm: React.FC<ManualBookingFormProps> = ({
    onBookingCreated,
    triggerButton,
    className = ""
}) => {
    // ================================
    // 🏗️ STATE MANAGEMENT
    // ================================
    
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedCourt, setSelectedCourt] = useState<CourtResponse | null>(null);
    
    const [formData, setFormData] = useState<BookingFormData>({
        userId: null,
        courtId: null,
        date: null,
        duration: null,
        selectedSlot: null,
        matchType: '',
        notes: '',
        paymentMethod: '',
        sendReceiptEmail: true,
        customerEmail: ''
    });
    
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const { toast } = useToast();

    // ================================
    // 🔄 EFFECTS
    // ================================
    
    useEffect(() => {
        // Load slots when dependencies change
        loadAvailableSlots();
    }, [formData.courtId, formData.date, formData.duration]);

    // ================================
    // 🔧 DATA LOADING
    // ================================
    
    // Court selection handler
    const handleCourtSelect = (court: CourtResponse | null) => {
        setSelectedCourt(court);
        setFormData(prev => ({ 
            ...prev, 
            courtId: court ? court.id : null
        }));
        
        if (court && errors.courtId) {
            setErrors(prev => ({ ...prev, courtId: '' }));
        }
    };

    // Get selected court for display
    const getSelectedCourtData = () => {
        return selectedCourt;
    };
    
    // ================================
    // 🎯 FORM HANDLERS
    // ================================
    
    const handleInputChange = (field: keyof BookingFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        
        // Reset slots when court, date, or duration changes
        if (field === 'courtId' || field === 'date' || field === 'duration') {
            setFormData(prev => ({ ...prev, selectedSlot: null }));
            setAvailableSlots([]);
        }
    };
    
    // Load available slots when court, date, and duration are selected
    const loadAvailableSlots = async () => {
        if (!formData.courtId || !formData.date || !formData.duration) {
            setAvailableSlots([]);
            return;
        }
        
        setSlotsLoading(true);
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
            const response = await fetch(`${apiUrl}/courts/availability`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    courtId: formData.courtId,
                    date: format(formData.date, 'yyyy-MM-dd'),
                    durationMinutes: formData.duration
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to load available slots: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            console.log('✅ Slot availability response:', data);
            setAvailableSlots(data.availableSlots || []);
        } catch (error) {
            console.error('❌ Failed to load slots:', error);
            setErrors({ slots: 'Failed to load available time slots' });
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };

    const handleUserSelect = (user: UserResponse | null) => {
        setSelectedUser(user);
        setFormData(prev => ({ 
            ...prev, 
            userId: user ? user.id : null,
            customerEmail: prev.customerEmail || (user ? user.email || '' : '') // Auto-fill email if not set
        }));
        
        if (user && errors.userId) {
            setErrors(prev => ({ ...prev, userId: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.userId) {
            newErrors.userId = 'Please select a user';
        }

        if (!formData.courtId) {
            newErrors.courtId = 'Please select a court';
        }

        if (!formData.date) {
            newErrors.date = 'Please select a date';
        }

        if (!formData.duration) {
            newErrors.duration = 'Please select duration';
        }

        if (!formData.selectedSlot) {
            newErrors.selectedSlot = 'Please select a time slot';
        }

        if (!formData.matchType) {
            newErrors.matchType = 'Please select match type';
        }

        if (!formData.paymentMethod) {
            newErrors.paymentMethod = 'Please select payment method';
        }

        if (formData.sendReceiptEmail && !formData.customerEmail) {
            newErrors.customerEmail = 'Email is required when receipt email is enabled';
        }

        // Check if date is in the past
        if (formData.date && formData.date < new Date()) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (formData.date < today) {
                newErrors.date = 'Cannot book for past dates';
            }
        }

        setErrors(newErrors);
        
        // Show friendly toast for validation errors
        if (Object.keys(newErrors).length > 0) {
            const firstError = Object.values(newErrors)[0];
            toast({
                title: "Form Validation Error",
                description: firstError,
                variant: "destructive"
            });
        }
        
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setErrors({});
        setSuccess('');

        try {
            // Extract time from the selected slot more safely
            let startTimeString = '';
            let durationMinutes = formData.duration!; // Use the form duration directly
            
            console.log('🔍 Debug selectedSlot:', formData.selectedSlot);
            
            if (formData.selectedSlot) {
                // Handle different possible formats for startTime
                if (formData.selectedSlot.startTime && typeof formData.selectedSlot.startTime === 'string') {
                    // If startTime is already in HH:mm:ss format, use it directly
                    if (formData.selectedSlot.startTime.match(/^\d{2}:\d{2}(:\d{2})?$/)) {
                        startTimeString = formData.selectedSlot.startTime;
                        // Ensure it has seconds
                        if (!startTimeString.includes(':00', 5)) {
                            startTimeString += ':00';
                        }
                    } else {
                        // Try to extract time from formattedTimeRange like "06:00-07:00"
                        const timeMatch = formData.selectedSlot.formattedTimeRange?.match(/^(\d{2}:\d{2})/);
                        if (timeMatch) {
                            startTimeString = timeMatch[1] + ':00';
                        } else {
                            throw new Error('Unable to parse start time from selected slot');
                        }
                    }
                } else if (formData.selectedSlot.formattedTimeRange && typeof formData.selectedSlot.formattedTimeRange === 'string') {
                    // Extract from formattedTimeRange like "14:30-15:30"
                    const timeMatch = formData.selectedSlot.formattedTimeRange.match(/^(\d{2}:\d{2})/);
                    if (timeMatch) {
                        startTimeString = timeMatch[1] + ':00';
                    } else {
                        throw new Error('Unable to parse start time from formatted time range');
                    }
                } else {
                    // If all else fails, try to extract from any string representation
                    const slotString = JSON.stringify(formData.selectedSlot);
                    const timeMatch = slotString.match(/(\d{2}:\d{2})/);
                    if (timeMatch) {
                        startTimeString = timeMatch[1] + ':00';
                    } else {
                        throw new Error('No valid time format found in selected slot');
                    }
                }
            }
            
            if (!startTimeString) {
                throw new Error('No valid start time found in selected slot');
            }
            
            console.log('✅ Extracted startTime:', startTimeString);
            
            // Fix timezone issue: use local date formatting instead of toISOString()
            const year = formData.date!.getFullYear();
            const month = String(formData.date!.getMonth() + 1).padStart(2, '0');
            const day = String(formData.date!.getDate()).padStart(2, '0');
            const localDateString = `${year}-${month}-${day}`;
            
            const bookingRequest: CreateBookingRequest & { 
                sendReceiptEmail?: boolean; 
                customerEmail?: string; 
            } = {
                userId: formData.userId!,
                courtId: formData.courtId!,
                date: localDateString, // YYYY-MM-DD format
                startTime: startTimeString, // HH:mm:ss format
                durationMinutes: durationMinutes,
                matchType: formData.matchType as 'SINGLE' | 'DOUBLE',
                notes: formData.notes || undefined,
                sendReceiptEmail: formData.sendReceiptEmail,
                customerEmail: formData.customerEmail || undefined
            };

            console.log('🏗️ Creating manual booking with email settings:', {
                ...bookingRequest,
                emailWillBeSent: formData.sendReceiptEmail,
                emailAddress: formData.customerEmail
            });

            // Create the manual booking (backend now auto-generates receipt)
            const response = await bookingService.createManualBooking(bookingRequest);
            
            console.log('✅ Manual booking created:', response);

            // Backend now returns both booking and receipt in response
            const receipt = (response as any).receipt;
            const selectedCourtData = getSelectedCourtData();
            
            // Prepare receipt data for print dialog
            const enhancedReceiptData = {
                receiptId: receipt?.receiptId || receipt?.id,
                receiptNumber: receipt?.receiptNumber || 'N/A',
                totalAmount: receipt?.totalAmount || formData.selectedSlot?.price || 0,
                pdfUrl: receipt?.pdfUrl,
                userEmail: selectedUser?.email,
                userName: selectedUser?.fullName,
                courtName: selectedCourtData?.name,
                bookingDate: formData.date ? format(formData.date, 'MMM dd, yyyy') : undefined,
                startTime: startTimeString.substring(0, 5), // Extract HH:mm from HH:mm:ss
                endTime: (() => {
                    // Calculate end time from start time + duration
                    const [hours, minutes] = startTimeString.split(':').map(Number);
                    const totalMinutes = hours * 60 + minutes + durationMinutes;
                    const endHours = Math.floor(totalMinutes / 60);
                    const endMins = totalMinutes % 60;
                    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
                })()
            };
            
            setReceiptData(enhancedReceiptData);
            setSuccess((response as any).message || 'Booking created successfully with receipt!');
            
            // Show success toast
            toast({
                title: "Booking Created Successfully",
                description: `Booking confirmed for ${selectedUser?.fullName} at ${selectedCourtData?.name}`,
            });
            
            // Auto-open print dialog if receipt was generated
            if (receipt && receipt.receiptId) {
                setShowPrintDialog(true);
            }
            
            onBookingCreated(response, receipt);
            
            // Reset form after successful submission
            resetForm();
            
        } catch (error) {
            console.error('❌ Failed to create manual booking:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create booking';
            setErrors({ submit: errorMessage });
            
            // Show error toast
            toast({
                title: "Booking Creation Failed",
                description: errorMessage,
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            userId: null,
            courtId: null,
            date: null,
            duration: null,
            selectedSlot: null,
            matchType: '',
            notes: '',
            paymentMethod: '',
            sendReceiptEmail: true,
            customerEmail: ''
        });
        setSelectedUser(null);
        setSelectedCourt(null);
        setAvailableSlots([]);
        setErrors({});
        setSuccess('');
        setReceiptData(null);
    };

    // ================================
    // 🎨 HELPER FUNCTIONS
    // ================================
    
    const getDurationOptions = () => [
        { value: 60, label: '1 hour (60 min)' },
        { value: 90, label: '1.5 hours (90 min)' },
        { value: 120, label: '2 hours (120 min)' }
    ];

    const renderFormField = (label: string, field: string, children: React.ReactNode) => (
        <div className="space-y-2">
            <Label htmlFor={field} className="text-sm font-medium">
                {label} {errors[field] && <span className="text-red-500">*</span>}
            </Label>
            {children}
            {errors[field] && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    {errors[field]}
                </p>
            )}
        </div>
    );

    // ================================
    // 🎨 MAIN RENDER
    // ================================
    
    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                {triggerButton ? (
                    <DialogTrigger asChild>
                        {triggerButton}
                    </DialogTrigger>
                ) : (
                    <DialogTrigger asChild>
                        <Button className={cn("flex items-center gap-2", className)}>
                            <Plus className="w-4 h-4" />
                            Create Manual Booking
                        </Button>
                    </DialogTrigger>
                )}

                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Create Manual Booking
                        </DialogTitle>
                        <DialogDescription>
                            Create a booking manually for a user. All fields marked with * are required.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Success Message */}
                        {success && (
                            <Alert className="border-green-200 bg-green-50">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Error Message */}
                        {errors.submit && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    {errors.submit}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* User Selection */}
                            <div className="lg:col-span-2">
                                {renderFormField(
                                    'Select User',
                                    'userId',
                                    <UserSearchInput
                                        onUserSelect={handleUserSelect}
                                        selectedUser={selectedUser}
                                        placeholder="Search for a user by name or email..."
                                        disabled={false}
                                    />
                                )}
                            </div>

                            {/* Court Selection */}
                            <div className="md:col-span-2">
                                {renderFormField(
                                    'Select Court',
                                    'courtId',
                                    <CourtSearchInput
                                        onCourtSelect={handleCourtSelect}
                                        selectedCourt={selectedCourt}
                                        placeholder="Search for a court by name, location, or type..."
                                        disabled={false}
                                    />
                                )}
                            </div>

                            {/* Date Selection */}
                            <div>
                                {renderFormField(
                                    'Date',
                                    'date',
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !formData.date && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {formData.date ? format(formData.date, "PPP") : "Pick a date"}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={formData.date || undefined}
                                                onSelect={(date) => handleInputChange('date', date)}
                                                disabled={(date) => date < new Date()}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                )}
                            </div>

                            {/* Duration Selection */}
                            <div>
                                {renderFormField(
                                    'Duration',
                                    'duration',
                                    <Select
                                        value={formData.duration?.toString() || ''}
                                        onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select duration" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {getDurationOptions().map((option) => (
                                                <SelectItem key={option.value} value={option.value.toString()}>
                                                    <div className="flex items-center space-x-2">
                                                        <Clock className="w-4 h-4" />
                                                        <span>{option.label}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Match Type */}
                            <div>
                                {renderFormField(
                                    'Match Type',
                                    'matchType',
                                    <Select
                                        value={formData.matchType}
                                        onValueChange={(value) => handleInputChange('matchType', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select match type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="SINGLE">Singles Match</SelectItem>
                                            <SelectItem value="DOUBLE">Doubles Match</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Available Time Slots */}
                            {formData.courtId && formData.date && formData.duration && (
                                <div className="md:col-span-2">
                                    {renderFormField(
                                        'Available Time Slots',
                                        'selectedSlot',
                                        <div className="space-y-2">
                                            {slotsLoading ? (
                                                <div className="flex items-center justify-center p-4">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                    <span className="ml-2">Loading available slots...</span>
                                                </div>
                                            ) : availableSlots.length === 0 ? (
                                                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                                                    No available slots for selected date and duration
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                    {availableSlots.map((slot, index) => (
                                                        <Button
                                                            key={index}
                                                            type="button"
                                                            variant={formData.selectedSlot === slot ? "default" : "outline"}
                                                            className="p-3 h-auto justify-start"
                                                            onClick={() => handleInputChange('selectedSlot', slot)}
                                                        >
                                                            <div className="text-left">
                                                                <div className="font-medium">{slot.formattedTimeRange}</div>
                                                                <div className="text-sm text-gray-500">
                                                                    <CurrencyDisplay amount={slot.price || 0} size="sm" showSymbol />
                                                                </div>
                                                            </div>
                                                        </Button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Payment Method */}
                            <div>
                                {renderFormField(
                                    'Payment Method',
                                    'paymentMethod',
                                    <Select
                                        value={formData.paymentMethod}
                                        onValueChange={(value) => handleInputChange('paymentMethod', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select payment method" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="CASH">Cash Payment</SelectItem>
                                            <SelectItem value="TAP_TO_MANAGER">Tap to Manager</SelectItem>
                                            <SelectItem value="PENDING">Pending Payment</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                {renderFormField(
                                    'Notes (Optional)',
                                    'notes',
                                    <Textarea
                                        placeholder="Add any additional notes for this booking..."
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        rows={3}
                                    />
                                )}
                            </div>

                            {/* Email Settings */}
                            <div className="md:col-span-2">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="sendReceiptEmail"
                                            checked={formData.sendReceiptEmail}
                                            onChange={(e) => handleInputChange('sendReceiptEmail', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <Label htmlFor="sendReceiptEmail">Send receipt via email</Label>
                                    </div>
                                    
                                    {formData.sendReceiptEmail && (
                                        <div>
                                            {renderFormField(
                                                'Customer Email',
                                                'customerEmail',
                                                <Input
                                                    type="email"
                                                    placeholder="Enter customer email address..."
                                                    value={formData.customerEmail}
                                                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Plus className="w-4 h-4" />
                                )}
                                {isLoading ? 'Creating...' : 'Create Booking'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Print Receipt Dialog */}
            {receiptData && (
                <PrintReceiptDialog
                    isOpen={showPrintDialog}
                    receiptData={receiptData}
                    onClose={() => setShowPrintDialog(false)}
                />
            )}
        </>
    );
};

export default ManualBookingForm;