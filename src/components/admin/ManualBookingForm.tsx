import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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
    User,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Loader2,
    Building
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { BookingResponse, CreateBookingRequest, CourtResponse } from '@/types/booking';
import { UserResponse } from '@/types/user';
import { AdminManualBookingRequest, ManualBookingResponse } from '@/types/receipt';
import { PaymentLinkDTO, CreatePaymentLinkRequest } from '@/types/paymentLink';
import { Facility } from '@/types/facility';
import { bookingService, courtService, userService, receiptService } from '@/services';
import { paymentLinkService } from '@/services/paymentLinkService';
import { facilityService } from '@/lib/api/services/facilityService';
import { cn } from '@/lib/utils';
import UserSearchInput from './UserSearchInput';
import PrintReceiptDialog from './PrintReceiptDialog';
import PaymentLinkSuccessDialog from './PaymentLinkSuccessDialog';

interface ManualBookingFormProps {
    onBookingCreated: (booking: BookingResponse, receipt?: any) => void;
    triggerButton?: React.ReactNode;
    className?: string;
}

interface BookingFormData {
    userId: number | null;
    facilityId: number | null;
    courtId: number | null;
    date: Date | null;
    duration: number | null; // 60, 90, or 120 minutes
    selectedSlot: TimeSlot | null;
    matchType: 'SINGLE' | 'DOUBLE' | '';
    notes: string;
    paymentMethod: 'CASH' | 'TAP_TO_MANAGER' | 'PENDING' | '';
    sendReceiptEmail: boolean;
    customerEmail: string;
    seedRecordingEnabled: boolean; // Enable SEED recording for this booking
    // Payment link specific fields
    bookingMode: 'IMMEDIATE' | 'PAYMENT_LINK';
    phoneNumber: string;
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
    const { t } = useTranslation('admin');
    
    // ================================
    // 🏗️ STATE MANAGEMENT
    // ================================
    
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [facilitiesLoading, setFacilitiesLoading] = useState(false);
    const [courts, setCourts] = useState<CourtResponse[]>([]);
    const [courtsLoading, setCourtsLoading] = useState(false);
    
    const [formData, setFormData] = useState<BookingFormData>({
        userId: null,
        facilityId: null,
        courtId: null,
        date: null,
        duration: null,
        selectedSlot: null,
        matchType: '',
        notes: '',
        paymentMethod: '',
        sendReceiptEmail: true,
        seedRecordingEnabled: true, // Default to enabled
        bookingMode: 'IMMEDIATE',
        phoneNumber: '',
        customerEmail: ''
    });
    
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
    const [receiptData, setReceiptData] = useState<any>(null);
    const [showPrintDialog, setShowPrintDialog] = useState(false);
    const [paymentLinkData, setPaymentLinkData] = useState<PaymentLinkDTO | null>(null);
    const [showPaymentLinkDialog, setShowPaymentLinkDialog] = useState(false);
    const { toast } = useToast();

    // ================================
    // 🔄 EFFECTS
    // ================================
    
    useEffect(() => {
        if (isOpen) {
            loadFacilities();
            loadCourts();
        }
    }, [isOpen]);



// Add to your state management section
const [users, setUsers] = useState<UserResponse[]>([]);
const [usersLoading, setUsersLoading] = useState(false);
const [userSearchTerm, setUserSearchTerm] = useState('');
const [facilitySearchTerm, setFacilitySearchTerm] = useState('');
const [courtSearchTerm, setCourtSearchTerm] = useState('');

// Add this function to your data loading section
const loadUsers = async () => {
    setUsersLoading(true);
    try {
        console.log('👥 Loading REAL users from database...');
        const response = await userService.getAllUsers();
        console.log('✅ REAL Users loaded:', response);
        setUsers(response || []);
    } catch (error) {
        console.error('❌ Failed to load users:', error);
        setErrors({ users: 'Failed to load users' });
    } finally {
        setUsersLoading(false);
    }
};

const loadFacilities = async () => {
    setFacilitiesLoading(true);
    try {
        console.log('🏢 Loading facilities from database...');
        // Use the role-based endpoint that returns facilities based on user role
        const response = await facilityService.getMyFacilities();
        console.log('✅ Facilities loaded:', response);
        setFacilities(response || []);
    } catch (error) {
        console.error('❌ Failed to load facilities:', error);
        setErrors({ facilities: 'Failed to load facilities' });
    } finally {
        setFacilitiesLoading(false);
    }
};

// Update your useEffect to also load users
useEffect(() => {
    if (isOpen) {
        loadFacilities();
        loadCourts(); // Load all courts initially
        loadUsers();
    }
}, [isOpen]);

// Reload courts when facility changes
useEffect(() => {
    if (formData.facilityId) {
        console.log('🔄 Facility changed, reloading courts for facility:', formData.facilityId);
        loadCourts(formData.facilityId);
    }
}, [formData.facilityId]);

// Filter users based on search term
const filteredUsers = users.filter(user => {
    if (!userSearchTerm.trim()) return true; // Show all if no search term
    const searchLower = userSearchTerm.toLowerCase();
    const nameMatch = (user.fullName?.toLowerCase() || '').includes(searchLower);
    const emailMatch = (user.email?.toLowerCase() || '').includes(searchLower);
    console.log('🔍 User search:', { searchTerm: userSearchTerm, user: user.fullName, nameMatch, emailMatch });
    return nameMatch || emailMatch;
});

// Filter facilities based on search term
const filteredFacilities = facilities.filter(facility => {
    if (!facilitySearchTerm.trim()) return true;
    const searchLower = facilitySearchTerm.toLowerCase();
    const nameMatch = (facility.name?.toLowerCase() || '').includes(searchLower);
    const locationMatch = (facility.location?.toLowerCase() || '').includes(searchLower);
    return nameMatch || locationMatch;
});

// Filter courts based on search term only (facility filtering is done on backend)
const filteredCourts = courts.filter(court => {
    // Filter by search term
    if (!courtSearchTerm.trim()) return true;
    const searchLower = courtSearchTerm.toLowerCase();
    const nameMatch = (court.name?.toLowerCase() || '').includes(searchLower);
    const locationMatch = (court.location?.toLowerCase() || '').includes(searchLower);
    const typeMatch = (court.type?.toLowerCase() || '').includes(searchLower);
    return nameMatch || locationMatch || typeMatch;
});
    
    // ================================
    // 🔧 DATA LOADING
    // ================================
    
const loadCourts = async (facilityId?: number) => {
    setCourtsLoading(true);
    try {
        let response;
        if (facilityId) {
            // Load courts for specific facility
            console.log('🏟️ Loading courts for facility:', facilityId);
            response = await courtService.getCourtsByFacility(facilityId);
        } else {
            // Load all courts for current user (role-based)
            console.log('🏟️ Loading all courts for current user');
            response = await courtService.getMyCourts();
        }
        
        console.log('🏟️ Raw courts from API:', response);
        
        // Convert Court[] to CourtResponse[]
        const convertedCourts: CourtResponse[] = response.map((court) => ({
            id: court.id, // Already number
            name: court.name,
            location: court.location,
            type: court.type,
            hourlyFee: court.facility?.hourlyFee || 0,
            hasSeedSystem: court.hasSeedSystem,
            imageUrl: court.imageUrl || '',
            amenities: court.amenities || [],
            techFeatures: court.techFeatures || [],
            description: court.description || '',
            openingTimes: court.openingTimes || {},
            rating: null,
            totalRatings: null,
            distanceInMeters: null,
            formattedDistance: null,
            latitude: null,
            longitude: null,
            facility: court.facility ? {
                id: court.facility.id,
                name: court.facility.name,
                hourlyFee: court.facility.hourlyFee
            } : undefined
        }));
        
        console.log('✅ Converted courts with facility info:', convertedCourts.map(c => ({
            id: c.id,
            name: c.name,
            facilityId: c.facility?.id,
            facilityName: c.facility?.name
        })));
        
        setCourts(convertedCourts);
    } catch (error) {
        console.error('❌ Failed to load courts:', error);
        setErrors({ courts: 'Failed to load courts' });
    } finally {
        setCourtsLoading(false);
    }
};

    // ================================
    // 🎯 FORM HANDLERS
    // ================================
    
    const handleInputChange = (field: keyof BookingFormData, value: any) => {
        console.log(`📝 Form field changed: ${field} =`, value);
        
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Clear field error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        
        // Reset court when facility changes
        if (field === 'facilityId') {
            console.log('🏢 Facility changed, resetting court selection. New facilityId:', value);
            setFormData(prev => ({ ...prev, courtId: null, selectedSlot: null }));
            setAvailableSlots([]);
            // Courts will be reloaded by the useEffect watching formData.facilityId
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
            const data = await courtService.checkAvailability({
                courtId: formData.courtId,
                date: format(formData.date, 'yyyy-MM-dd'),
                durationMinutes: formData.duration
            });
            
            console.log('✅ Slot availability response:', data);
            // Map the response to include all required TimeSlot properties
            const mappedSlots: TimeSlot[] = (data.availableSlots || []).map((slot: any) => ({
                startTime: slot.startTime || slot.start,
                endTime: slot.endTime || slot.end,
                formattedTimeRange: slot.formattedTimeRange || slot.label || `${slot.startTime}-${slot.endTime}`,
                price: slot.price || 0,
                available: slot.available !== false
            }));
            setAvailableSlots(mappedSlots);
        } catch (error) {
            console.error('❌ Failed to load slots:', error);
            setErrors({ slots: 'Failed to load available time slots' });
            setAvailableSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    };
    
    // Load slots when dependencies change
    useEffect(() => {
        loadAvailableSlots();
    }, [formData.courtId, formData.date, formData.duration]);

    const handleUserSelect = (user: UserResponse) => {
        setSelectedUser(user);
        setFormData(prev => ({ 
            ...prev, 
            userId: user.id,
            customerEmail: user.email || '' // Always update email to match selected user
        }));
        
        if (errors.userId) {
            setErrors(prev => ({ ...prev, userId: '' }));
        }
    };

    const handlePaymentLinkCreation = async () => {
        try {
            if (!formData.selectedSlot) {
                throw new Error('No time slot selected');
            }

            console.log('🔍 Debug selectedSlot for payment link:', formData.selectedSlot);

            // Extract start and end times
            let startTimeString = '';
            let endTimeString = '';
            
            // Try to extract from startTime field
            if (formData.selectedSlot.startTime && typeof formData.selectedSlot.startTime === 'string') {
                // Check if it's a valid time format (HH:mm or HH:mm:ss)
                const timeMatch = formData.selectedSlot.startTime.match(/^(\d{2}:\d{2})/);
                if (timeMatch) {
                    startTimeString = timeMatch[1]; // HH:mm
                }
            }
            
            // If not found, try formattedTimeRange
            if (!startTimeString && formData.selectedSlot.formattedTimeRange) {
                const timeMatch = formData.selectedSlot.formattedTimeRange.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})/);
                if (timeMatch) {
                    startTimeString = timeMatch[1];
                    endTimeString = timeMatch[2];
                }
            }

            if (!startTimeString) {
                console.error('❌ Unable to parse start time from slot:', formData.selectedSlot);
                throw new Error('Unable to parse start time from selected slot');
            }

            // Calculate end time if not extracted
            if (!endTimeString) {
                if (formData.selectedSlot.endTime && typeof formData.selectedSlot.endTime === 'string') {
                    const timeMatch = formData.selectedSlot.endTime.match(/^(\d{2}:\d{2})/);
                    if (timeMatch) {
                        endTimeString = timeMatch[1];
                    }
                }
                
                // If still not found, calculate from duration
                if (!endTimeString && formData.duration) {
                    const [hours, minutes] = startTimeString.split(':').map(Number);
                    const totalMinutes = hours * 60 + minutes + formData.duration;
                    const endHours = Math.floor(totalMinutes / 60);
                    const endMins = totalMinutes % 60;
                    endTimeString = `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
                }
            }

            if (!endTimeString) {
                console.error('❌ Unable to calculate end time');
                throw new Error('Unable to calculate end time');
            }

            // Format date
            const year = formData.date!.getFullYear();
            const month = String(formData.date!.getMonth() + 1).padStart(2, '0');
            const day = String(formData.date!.getDate()).padStart(2, '0');
            const localDateString = `${year}-${month}-${day}`;

            const paymentLinkRequest: CreatePaymentLinkRequest = {
                courtId: formData.courtId!,
                bookingDate: localDateString,
                startTime: startTimeString,
                endTime: endTimeString,
                phoneNumber: formData.phoneNumber || undefined,
                existingUserId: formData.userId || undefined
            };

            console.log('🔗 Creating payment link with validated times:', {
                ...paymentLinkRequest,
                startTimeFormat: startTimeString,
                endTimeFormat: endTimeString,
                dateFormat: localDateString
            });

            const paymentLink = await paymentLinkService.createPaymentLink(paymentLinkRequest);
            
            console.log('✅ Payment link created:', paymentLink);

            setPaymentLinkData(paymentLink);
            setSuccess('Payment link created successfully!');
            
            toast({
                title: 'Payment Link Created',
                description: 'Payment link has been generated successfully',
            });

            // Show payment link dialog
            setShowPaymentLinkDialog(true);

        } catch (error) {
            console.error('❌ Failed to create payment link:', error);
            
            if (error instanceof Error) {
                setErrors({ submit: error.message });
            } else {
                setErrors({ submit: 'Failed to create payment link. Please try again.' });
            }
            
            toast({
                title: 'Error',
                description: 'Failed to create payment link',
                variant: 'destructive'
            });
        } finally {
            setIsLoading(false);
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Common validations for both modes
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

        // Payment link mode validations
        if (formData.bookingMode === 'PAYMENT_LINK') {
            // Either phone number or existing user must be provided
            if (!formData.phoneNumber && !formData.userId) {
                newErrors.userId = 'Please provide a phone number or select an existing user';
            }
            
            // Validate phone number format if provided
            if (formData.phoneNumber && !formData.phoneNumber.match(/^\+?[1-9]\d{1,14}$/)) {
                newErrors.phoneNumber = 'Please enter a valid phone number';
            }
        } else {
            // Immediate booking mode validations
            if (!formData.userId) {
                newErrors.userId = 'Please select a user';
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
                title: t('manualBooking.toasts.formValidationError'),
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

        // Route to payment link creation if in payment link mode
        if (formData.bookingMode === 'PAYMENT_LINK') {
            await handlePaymentLinkCreation();
            return;
        }

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
                seedRecordingEnabled?: boolean;
            } = {
                userId: formData.userId!,
                courtId: formData.courtId!,
                date: localDateString, // YYYY-MM-DD format
                startTime: startTimeString, // HH:mm:ss format
                durationMinutes: durationMinutes,
                matchType: formData.matchType as 'SINGLE' | 'DOUBLE',
                notes: formData.notes || undefined,
                sendReceiptEmail: formData.sendReceiptEmail,
                customerEmail: formData.customerEmail || undefined,
                seedRecordingEnabled: formData.seedRecordingEnabled // ✅ Pass SEED recording preference
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
            const selectedCourt = getSelectedCourt();
            
            // Prepare receipt data for print dialog
            const enhancedReceiptData = {
                receiptId: receipt?.receiptId || receipt?.id,
                receiptNumber: receipt?.receiptNumber || 'N/A',
                totalAmount: receipt?.totalAmount || formData.selectedSlot?.price || 0,
                pdfUrl: receipt?.pdfUrl,
                userEmail: selectedUser?.email,
                userName: selectedUser?.fullName,
                courtName: selectedCourt?.name,
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
                title: t('manualBooking.toasts.bookingCreatedSuccessfully'),
                description: t('manualBooking.toasts.bookingConfirmed', { 
                    user: selectedUser?.fullName, 
                    court: selectedCourt?.name 
                }),
            });
            
            // Auto-open print dialog if receipt was generated
            if (receipt && receipt.receiptId) {
                setShowPrintDialog(true);
            }
            
            onBookingCreated(response, receipt);

        } catch (error) {
            console.error('❌ Failed to create booking:', error);
            
            if (error instanceof Error) {
                setErrors({ submit: error.message });
            } else {
                setErrors({ submit: 'Failed to create booking. Please try again.' });
            }
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            userId: null,
            facilityId: null,
            courtId: null,
            date: null,
            duration: null,
            selectedSlot: null,
            matchType: '',
            notes: '',
            paymentMethod: '',
            sendReceiptEmail: true,
            seedRecordingEnabled: true, // Reset to default enabled
            customerEmail: '',
            bookingMode: 'IMMEDIATE',
            phoneNumber: ''
        });
        setSelectedUser(null);
        setAvailableSlots([]);
        setErrors({});
        setSuccess('');
        setReceiptData(null);
        setShowPrintDialog(false);
        setPaymentLinkData(null);
        setShowPaymentLinkDialog(false);
        setUserSearchTerm('');
        setFacilitySearchTerm('');
        setCourtSearchTerm('');
    };

    const handleClose = () => {
        setIsOpen(false);
        resetForm();
    };

    // ================================
    // 🔧 HELPER FUNCTIONS
    // ================================
    
    const getSelectedCourt = () => {
        return courts.find(court => court.id === formData.courtId);
    };

    const getDurationOptions = () => [
        { value: 60, label: '1 hour (60 min)' },
        { value: 90, label: '1.5 hours (90 min)' },
        { value: 120, label: '2 hours (120 min)' }
    ];

    // ================================
    // 🎨 RENDER METHODS
    // ================================
    
    const renderFormField = (
        label: string,
        field: keyof BookingFormData,
        children: React.ReactNode,
        required = true,
        description?: string
    ) => (
        <div className="space-y-3">
            <div className="space-y-1">
                <Label htmlFor={field} className="text-sm font-semibold text-foreground flex items-center gap-2">
                    {label} 
                    {required && <span className="text-destructive text-xs">*</span>}
                </Label>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="relative">
                {children}
            </div>
            {errors[field] && (
                <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{errors[field]}</span>
                </div>
            )}
        </div>
    );

    const renderBookingSummary = () => {
        const court = getSelectedCourt();

        if (!selectedUser || !court || !formData.selectedSlot) return null;

        return (
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 p-6 rounded-xl space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-semibold text-foreground">{t('manualBooking.bookingSummary')}</h4>
                </div>
                
                <div className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">{t('manualBooking.customer')}</span>
                            <span className="font-semibold text-foreground">{selectedUser.fullName}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">{t('manualBooking.court')}</span>
                            <span className="font-semibold text-foreground">{court.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">{t('manualBooking.date')}</span>
                            <span className="font-semibold text-foreground">
                                {formData.date ? format(formData.date, 'PPP') : '-'}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">{t('manualBooking.time')}</span>
                            <span className="font-semibold text-foreground">
                                {formData.selectedSlot.formattedTimeRange}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">{t('manualBooking.duration')}</span>
                            <span className="font-semibold text-foreground">{formData.duration} {t('manualBooking.minutes')}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">{t('manualBooking.matchType')}</span>
                            <span className="font-semibold text-foreground">{formData.matchType || '-'}</span>
                        </div>
                    </div>
                    
                    <div className="bg-background/80 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
                        <span className="text-base font-semibold text-foreground">{t('manualBooking.totalAmount')}</span>
                        <span className="text-xl font-bold text-primary">
                            <CurrencyDisplay amount={formData.selectedSlot.price || 0} size="lg" showSymbol />
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    // ================================
    // 🎨 MAIN RENDER
    // ================================
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {triggerButton || (
                    <Button className={className}>
                        <Plus className="w-4 h-4 mr-2" />
                        {t('manualBooking.title')}
                    </Button>
                )}
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-6 border-b border-border">
                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        {t('manualBooking.createManualBooking')}
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground mt-2">
                        {t('manualBooking.description')}
                    </DialogDescription>
                </DialogHeader>

                {/* Success Message */}
                {success && (
                    <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                            {success}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Submit Error */}
                {errors.submit && (
                    <Alert className="bg-red-50 border-red-200">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-800">
                            {errors.submit}
                        </AlertDescription>
                    </Alert>
                )}

                <div className="flex-1 overflow-y-auto px-1">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Booking Mode Toggle */}
                        <div className="bg-muted/50 p-4 rounded-lg border border-border">
                            <Label className="text-sm font-semibold mb-3 block">{t('forms.labels.bookingType')}</Label>
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    type="button"
                                    variant={formData.bookingMode === 'IMMEDIATE' ? 'default' : 'outline'}
                                    className="w-full"
                                    onClick={() => handleInputChange('bookingMode', 'IMMEDIATE')}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Create Booking Now
                                </Button>
                                <Button
                                    type="button"
                                    variant={formData.bookingMode === 'PAYMENT_LINK' ? 'default' : 'outline'}
                                    className="w-full"
                                    onClick={() => handleInputChange('bookingMode', 'PAYMENT_LINK')}
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Payment Link
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {formData.bookingMode === 'IMMEDIATE' 
                                    ? 'Create a confirmed booking immediately with payment collected in person'
                                    : 'Generate a payment link to send to customer for online payment'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* User Selection / Phone Number */}
                            <div className="lg:col-span-2">
                            {formData.bookingMode === 'PAYMENT_LINK' ? (
                                <div className="space-y-4">
                                    <Label className="text-sm font-semibold">{t('forms.labels.customerInformation')}</Label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="phoneNumber">{t('forms.labels.phoneNumber')}</Label>
                                            <Input
                                                id="phoneNumber"
                                                placeholder={t('forms.placeholders.phoneNumber')}
                                                value={formData.phoneNumber}
                                                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                                disabled={!!formData.userId}
                                            />
                                            {errors.phoneNumber && (
                                                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <span className="text-sm text-muted-foreground">{t('forms.buttons.or')}</span>
                                        </div>
                                    </div>
                                    {renderFormField(
                                        t('forms.labels.selectExistingUser'),
                                        'userId',
                                        <div className="space-y-2">
                                            <Input
                                                placeholder={t('forms.placeholders.searchUser')}
                                                value={userSearchTerm}
                                                onChange={(e) => setUserSearchTerm(e.target.value)}
                                                disabled={usersLoading || !!formData.phoneNumber}
                                            />
                                            <Select
                                                value={formData.userId?.toString() || ''}
                                                onValueChange={(value) => {
                                                    const userId = parseInt(value);
                                                    const user = users.find(u => u.id === userId);
                                                    if (user) {
                                                        handleUserSelect(user);
                                                    }
                                                }}
                                                disabled={usersLoading || !!formData.phoneNumber}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue 
                                                        placeholder={
                                                            usersLoading ? t('forms.buttons.loadingUsers') : 
                                                            selectedUser ? `${selectedUser.fullName} (${selectedUser.email})` :
                                                            t('forms.buttons.selectUser')
                                                        } 
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {filteredUsers.length === 0 ? (
                                                        <SelectItem value="no-users" disabled>
                                                            {usersLoading ? "Loading..." : `No users found ${userSearchTerm ? `for "${userSearchTerm}"` : ''}`}
                                                        </SelectItem>
                                                    ) : (
                                                        filteredUsers.map((user) => (
                                                            <SelectItem key={user.id} value={user.id.toString()}>
                                                                <div className="flex items-center space-x-3">
                                                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                                        {user.profilePictureUrl ? (
                                                                            <img 
                                                                                src={user.profilePictureUrl} 
                                                                                alt={`${user.fullName || 'User'} profile`}
                                                                                className="h-full w-full object-cover"
                                                                            />
                                                                        ) : null}
                                                                        <div className={`w-full h-full bg-muted rounded-full flex items-center justify-center fallback-icon ${user.profilePictureUrl ? 'hidden' : ''}`}>
                                                                            <User className="w-4 h-4 text-gray-400" />
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex flex-col flex-1 min-w-0">
                                                                        <span className="font-medium truncate">{user.fullName}</span>
                                                                        <span className="text-xs text-gray-500 truncate">{user.email}</span>
                                                                    </div>
                                                                </div>
                                                            </SelectItem>
                                                        ))
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            {selectedUser && (
                                                <div className="p-2 bg-blue-50 rounded border text-sm">
                                                    <strong>Selected:</strong> {selectedUser.fullName} ({selectedUser.email})
                                                </div>
                                            )}
                                        </div>,
                                        false
                                    )}
                                </div>
                            ) : (
                                renderFormField(
                                    t('manualBooking.selectUser'),
                                    'userId',
                                    <div className="space-y-2">
                                    {/* Search Input */}
                                    <Input
                                        placeholder="Search for a user by name or email..."
                                        value={userSearchTerm}
                                        onChange={(e) => {
                                            console.log('🔍 User search input changed:', e.target.value);
                                            setUserSearchTerm(e.target.value);
                                        }}
                                        disabled={usersLoading}
                                    />
                                    
                                    {/* User Selection */}
                                    <Select
                                        value={formData.userId?.toString() || ''}
                                        onValueChange={(value) => {
                                            const userId = parseInt(value);
                                            const user = users.find(u => u.id === userId);
                                            if (user) {
                                                handleUserSelect(user);
                                            }
                                        }}
                                        disabled={usersLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue 
                                                placeholder={
                                                    usersLoading ? t('manualBooking.loadingUsers') : 
                                                    selectedUser ? `${selectedUser.fullName} (${selectedUser.email})` :
                                                    t('manualBooking.chooseUser')
                                                } 
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredUsers.length === 0 ? (
                                                <SelectItem value="no-users" disabled>
                                                    {usersLoading ? "Loading..." : `No users found ${userSearchTerm ? `for "${userSearchTerm}"` : ''}`}
                                                </SelectItem>
                                            ) : (
                                                filteredUsers.map((user) => (
                                                    <SelectItem key={user.id} value={user.id.toString()}>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                                                                {user.profilePictureUrl ? (
                                                                    <img 
                                                                        src={user.profilePictureUrl} 
                                                                        alt={`${user.fullName || 'User'} profile`}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                            const fallback = target.parentElement?.querySelector('.fallback-icon');
                                                                            if (fallback) fallback.classList.remove('hidden');
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div className={`w-full h-full bg-muted rounded-full flex items-center justify-center fallback-icon ${user.profilePictureUrl ? 'hidden' : ''}`}>
                                                                    <User className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col flex-1 min-w-0">
                                                                <span className="font-medium truncate">{user.fullName}</span>
                                                                <span className="text-xs text-gray-500 truncate">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                    
                                    {/* Show selected user info */}
                                    {selectedUser && (
                                        <div className="p-2 bg-blue-50 rounded border text-sm">
                                            <strong>Selected:</strong> {selectedUser.fullName} ({selectedUser.email})
                                        </div>
                                    )}
                                </div>
                            )
                        )}
                        </div>
                        
                        {/* Facility Selection */}
                        <div className="md:col-span-2">
                            {renderFormField(
                                t('forms.labels.selectFacility'),
                                'facilityId',
                                <div className="space-y-2">
                                    {/* Search Input */}
                                    <Input
                                        placeholder={t('forms.placeholders.searchFacility')}
                                        value={facilitySearchTerm}
                                        onChange={(e) => {
                                            console.log('🔍 Facility search input changed:', e.target.value);
                                            setFacilitySearchTerm(e.target.value);
                                        }}
                                        disabled={facilitiesLoading}
                                    />
                                    
                                    {/* Facility Selection */}
                                    <Select
                                        value={formData.facilityId?.toString() || ''}
                                        onValueChange={(value) => handleInputChange('facilityId', parseInt(value))}
                                        disabled={facilitiesLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={facilitiesLoading ? t('forms.buttons.loadingFacilities') : t('forms.buttons.chooseFacility')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {filteredFacilities.length === 0 ? (
                                                <SelectItem value="no-facilities" disabled>
                                                    {facilitiesLoading ? "Loading..." : `No facilities found ${facilitySearchTerm ? `for "${facilitySearchTerm}"` : ''}`}
                                                </SelectItem>
                                            ) : (
                                                filteredFacilities.map((facility) => (
                                                    <SelectItem key={facility.id} value={facility.id.toString()}>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                                                                {facility.imageUrl ? (
                                                                    <img 
                                                                        src={facility.imageUrl} 
                                                                        alt={`${facility.name} facility`}
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full bg-muted rounded-md flex items-center justify-center">
                                                                        <Building className="w-4 h-4 text-gray-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium truncate">{facility.name}</div>
                                                                <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                                    <MapPin className="w-3 h-3" />
                                                                    {facility.location}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        
                        {/* Court Selection */}
                        <div className="md:col-span-2">
                            {renderFormField(
                                t('manualBooking.selectCourt'),
                                'courtId',
                                <div className="space-y-2">
                                    {!formData.facilityId && (
                                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                            <AlertTriangle className="w-4 h-4 inline mr-2" />
                                            Please select a facility first to see available courts
                                        </div>
                                    )}
                                    {/* Search Input */}
                                    <Input
                                        placeholder={t('forms.placeholders.searchCourt')}
                                        value={courtSearchTerm}
                                        onChange={(e) => {
                                            console.log('🔍 Court search input changed:', e.target.value);
                                            setCourtSearchTerm(e.target.value);
                                        }}
                                        disabled={courtsLoading || !formData.facilityId}
                                    />
                                    
                                    {/* Court Selection */}
                                    <Select
                                        value={formData.courtId?.toString() || ''}
                                        onValueChange={(value) => handleInputChange('courtId', parseInt(value))}
                                        disabled={courtsLoading || !formData.facilityId}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={
                                                !formData.facilityId ? t('forms.buttons.selectFacilityFirst') :
                                                courtsLoading ? t('forms.buttons.loadingCourts') : 
                                                t('manualBooking.chooseCourt')
                                            } />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {filteredCourts.length === 0 ? (
                                                <SelectItem value="no-courts" disabled>
                                                    {!formData.facilityId ? "Select a facility first" :
                                                     courtsLoading ? "Loading..." : 
                                                     `No courts found ${courtSearchTerm ? `for "${courtSearchTerm}"` : 'in this facility'}`}
                                                </SelectItem>
                                            ) : (
                                                filteredCourts.map((court) => (
                                                    <SelectItem key={court.id} value={court.id.toString()}>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-8 h-8 rounded-md overflow-hidden flex-shrink-0">
                                                                {court.imageUrl ? (
                                                                    <img 
                                                                        src={court.imageUrl} 
                                                                        alt={`${court.name} court`}
                                                                        className="h-full w-full object-cover"
                                                                        onError={(e) => {
                                                                            const target = e.target as HTMLImageElement;
                                                                            target.style.display = 'none';
                                                                            const fallback = target.parentElement?.querySelector('.fallback-icon');
                                                                            if (fallback) fallback.classList.remove('hidden');
                                                                        }}
                                                                    />
                                                                ) : null}
                                                                <div className={`w-full h-full bg-muted rounded-md flex items-center justify-center fallback-icon ${court.imageUrl ? 'hidden' : ''}`}>
                                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-medium truncate">{court.name}</div>
                                                                <div className="text-xs text-gray-500 truncate flex items-center gap-1">
                                                                    {court.location} - <CurrencyDisplay amount={court.facility?.hourlyFee || 0} size="sm" showSymbol />/hr
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>

                        {/* Date Selection */}
                        <div>
                            {renderFormField(
                                t('manualBooking.date'),
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
                                            {formData.date ? format(formData.date, "PPP") : t('manualBooking.pickDate')}
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
                                t('manualBooking.duration'),
                                'duration',
                                <Select
                                    value={formData.duration?.toString() || ''}
                                    onValueChange={(value) => handleInputChange('duration', parseInt(value))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('manualBooking.selectDuration')} />
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
                                t('manualBooking.matchType'),
                                'matchType',
                                <Select
                                    value={formData.matchType}
                                    onValueChange={(value) => handleInputChange('matchType', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('manualBooking.selectMatchType')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="SINGLE">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>{t('manualBooking.single')}</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="DOUBLE">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>{t('manualBooking.double')}</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Available Time Slots */}
                        {formData.courtId && formData.date && formData.duration && (
                            <div className="md:col-span-2">
                                {renderFormField(
                                    t('manualBooking.availableTimeSlots'),
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



                        {/* Payment Method (Immediate Booking Only) */}
                        {formData.bookingMode === 'IMMEDIATE' && (
                            <div>
                                {renderFormField(
                                    t('manualBooking.selectPaymentMethod'),
                                    'paymentMethod',
                                <Select
                                    value={formData.paymentMethod}
                                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t('manualBooking.selectPaymentMethod')} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="CASH">
                                            <div className="flex items-center space-x-2">
                                                <span>💵</span>
                                                <span>{t('manualBooking.cash')}</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="TAP_TO_MANAGER">
                                            <div className="flex items-center space-x-2">
                                                <span>💳</span>
                                                <span>{t('manualBooking.tapCardToManager')}</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PENDING">
                                            <div className="flex items-center space-x-2">
                                                <span>⏳</span>
                                                <span>{t('manualBooking.pending')}</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                )}
                            </div>
                        )}

                        {/* Receipt Email Options (Immediate Booking Only) */}
                        {formData.bookingMode === 'IMMEDIATE' && (
                            <div>
                            {renderFormField(
                                t('manualBooking.receiptEmail'),
                                'sendReceiptEmail',
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="sendReceiptEmail"
                                            checked={formData.sendReceiptEmail}
                                            onChange={(e) => handleInputChange('sendReceiptEmail', e.target.checked)}
                                            className="rounded border-gray-300"
                                        />
                                        <label htmlFor="sendReceiptEmail" className="text-sm font-medium">
                                            {t('manualBooking.sendReceiptEmail')}
                                        </label>
                                    </div>
                                    {formData.sendReceiptEmail && (
                                        <Input
                                            placeholder={t('manualBooking.emailAddressForReceipt')}
                                            value={formData.customerEmail}
                                            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                            type="email"
                                        />
                                    )}
                                </div>,
                                false
                            )}
                            </div>
                        )}

                        {/* SEED Recording Option (Immediate Booking Only) */}
                        {formData.bookingMode === 'IMMEDIATE' && (
                            <div>
                            {renderFormField(
                                'SEED Recording',
                                'seedRecordingEnabled',
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="seedRecordingEnabled"
                                        checked={formData.seedRecordingEnabled}
                                        onChange={(e) => handleInputChange('seedRecordingEnabled', e.target.checked)}
                                        className="rounded border-gray-300"
                                    />
                                    <label htmlFor="seedRecordingEnabled" className="text-sm font-medium">
                                        Enable SEED recording for this booking
                                    </label>
                                </div>,
                                false,
                                'Enable automatic video recording if the court has SEED system'
                            )}
                            </div>
                        )}

                        {/* Notes */}
                        <div className="md:col-span-2">
                            {renderFormField(
                                t('manualBooking.notes'),
                                'notes',
                                <Textarea
                                    placeholder={t('manualBooking.notesPlaceholder')}
                                    value={formData.notes}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    rows={3}
                                />,
                                false
                            )}
                        </div>
                        </div>

                        {/* Booking Summary */}
                        {renderBookingSummary()}
                    </form>
                </div>

                <DialogFooter className="pt-6 border-t border-border">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="min-w-[100px]"
                    >
                        {t('manualBooking.cancel')}
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className="min-w-[140px] bg-primary hover:bg-primary/90"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                {formData.bookingMode === 'PAYMENT_LINK' ? 'Creating Link...' : t('manualBooking.creating')}
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                {formData.bookingMode === 'PAYMENT_LINK' ? 'Create Payment Link' : t('manualBooking.createBooking')}
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
            
            {/* Print Receipt Dialog */}
            {receiptData && (
                <PrintReceiptDialog
                    isOpen={showPrintDialog}
                    onClose={() => setShowPrintDialog(false)}
                    receiptData={receiptData}
                />
            )}
            
            {/* Payment Link Success Dialog */}
            {paymentLinkData && (
                <PaymentLinkSuccessDialog
                    isOpen={showPaymentLinkDialog}
                    onClose={() => {
                        setShowPaymentLinkDialog(false);
                        handleClose();
                    }}
                    paymentLink={paymentLinkData}
                />
            )}
        </Dialog>
    );
};

export default ManualBookingForm;