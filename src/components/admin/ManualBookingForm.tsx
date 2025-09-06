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
    User,
    MapPin,
    AlertTriangle,
    CheckCircle,
    Loader2
} from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Import dayjs for safe date parsing
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

import { BookingResponse, CreateBookingRequest, CourtResponse } from '@/types/booking';
import { UserResponse } from '@/types/user';
import { AdminManualBookingRequest, ManualBookingResponse } from '@/types/receipt';
import { bookingService, courtService, userService, receiptService } from '@/services';
import { cn } from '@/lib/utils';
import UserSearchInput from './UserSearchInput';
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
    const [courts, setCourts] = useState<CourtResponse[]>([]);
    const [courtsLoading, setCourtsLoading] = useState(false);
    
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
        if (isOpen) {
            loadCourts();
        }
    }, [isOpen]);



// Add to your state management section
const [users, setUsers] = useState<UserResponse[]>([]);
const [usersLoading, setUsersLoading] = useState(false);
const [userSearchTerm, setUserSearchTerm] = useState('');
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

// Update your useEffect to also load users
useEffect(() => {
    if (isOpen) {
        loadCourts();
        loadUsers();
    }
}, [isOpen]);

// Filter users based on search term
const filteredUsers = users.filter(user => 
    (user.fullName?.toLowerCase() || '').includes(userSearchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(userSearchTerm.toLowerCase())
);

// Filter courts based on search term
const filteredCourts = courts.filter(court => 
    (court.name?.toLowerCase() || '').includes(courtSearchTerm.toLowerCase()) ||
    (court.location?.toLowerCase() || '').includes(courtSearchTerm.toLowerCase()) ||
    (court.type?.toLowerCase() || '').includes(courtSearchTerm.toLowerCase())
);
    
    // ================================
    // 🔧 DATA LOADING
    // ================================
    
const loadCourts = async () => {
    setCourtsLoading(true);
    try {
        const response = await courtService.getAllCourts();
        
        // Convert Court[] to CourtResponse[]
        const convertedCourts: CourtResponse[] = response.map((court) => ({
            id: parseInt(court.id), // Convert string to number
            name: court.name,
            location: court.location,
            type: court.type,
            hourlyFee: court.hourlyFee,
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
            longitude: null
        }));
        
        setCourts(convertedCourts);
    } catch (error) {
        console.error('Failed to load courts:', error);
        setErrors({ courts: 'Failed to load courts' });
    } finally {
        setCourtsLoading(false);
    }
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
    
    // Load slots when dependencies change
    useEffect(() => {
        loadAvailableSlots();
    }, [formData.courtId, formData.date, formData.duration]);

    const handleUserSelect = (user: UserResponse) => {
        setSelectedUser(user);
        setFormData(prev => ({ 
            ...prev, 
            userId: user.id,
            customerEmail: prev.customerEmail || user.email || '' // Auto-fill email if not set
        }));
        
        if (errors.userId) {
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
            // ✅ Safe date/time parsing to prevent "Invalid" errors
            const dateStr = formData.date ? format(formData.date, 'yyyy-MM-dd') : '';
            
            // Parse the startTime and endTime from the slot (they might be in various formats)
            const startTimeStr = formData.selectedSlot!.startTime;
            const endTimeStr = formData.selectedSlot!.endTime;
            
            console.log('🔍 Raw slot times:', { startTimeStr, endTimeStr });
            
            // Try to extract time from datetime string or use as is
            let startTime = '';
            let endTime = '';
            
            if (startTimeStr.includes(' ')) {
                // Format: "2024-01-01 14:00:00" - extract time part
                startTime = startTimeStr.split(' ')[1].substring(0, 5); // "14:00"
            } else if (startTimeStr.includes('T')) {
                // Format: "2024-01-01T14:00:00" - extract time part
                startTime = dayjs(startTimeStr).format('HH:mm');
            } else {
                // Assume it's already in time format "14:00" or "14:00:00"
                startTime = startTimeStr.substring(0, 5);
            }
            
            if (endTimeStr.includes(' ')) {
                endTime = endTimeStr.split(' ')[1].substring(0, 5);
            } else if (endTimeStr.includes('T')) {
                endTime = dayjs(endTimeStr).format('HH:mm');
            } else {
                endTime = endTimeStr.substring(0, 5);
            }
            
            console.log('✅ Parsed times:', { startTime, endTime });
            
            // Calculate duration
            const startMoment = dayjs(`${dateStr} ${startTime}`, 'YYYY-MM-DD HH:mm');
            const endMoment = dayjs(`${dateStr} ${endTime}`, 'YYYY-MM-DD HH:mm');
            const durationMinutes = endMoment.diff(startMoment, 'minute');
            
            const bookingRequest: CreateBookingRequest = {
                userId: formData.userId!,
                courtId: formData.courtId!,
                date: dateStr, // YYYY-MM-DD format
                startTime: startTime, // HH:mm format
                durationMinutes: durationMinutes,
                matchType: formData.matchType as 'SINGLE' | 'DOUBLE',
                notes: formData.notes || undefined
            };

            console.log('🏗️ Creating manual booking with receipt:', bookingRequest);

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
                startTime: formData.selectedSlot?.startTime.split(' ')[1] || formData.selectedSlot?.formattedTimeRange?.split(' - ')[0],
                endTime: formData.selectedSlot?.endTime.split(' ')[1] || formData.selectedSlot?.formattedTimeRange?.split(' - ')[1]
            };
            
            setReceiptData(enhancedReceiptData);
            setSuccess((response as any).message || 'Booking created successfully with receipt!');
            
            // Show success toast
            toast({
                title: "Booking Created Successfully",
                description: `Booking confirmed for ${selectedUser?.fullName} at ${selectedCourt?.name}`,
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
        setAvailableSlots([]);
        setErrors({});
        setSuccess('');
        setReceiptData(null);
        setShowPrintDialog(false);
        setUserSearchTerm('');
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
                    <h4 className="text-lg font-semibold text-foreground">Booking Summary</h4>
                </div>
                
                <div className="space-y-4">
                    <div className="grid gap-3">
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">Customer</span>
                            <span className="font-semibold text-foreground">{selectedUser.fullName}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">Court</span>
                            <span className="font-semibold text-foreground">{court.name}</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">Date</span>
                            <span className="font-semibold text-foreground">
                                {formData.date ? format(formData.date, 'PPP') : '-'}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">Time</span>
                            <span className="font-semibold text-foreground">
                                {formData.selectedSlot.formattedTimeRange}
                            </span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">Duration</span>
                            <span className="font-semibold text-foreground">{formData.duration} minutes</span>
                        </div>
                        
                        <div className="flex items-center justify-between py-2 border-b border-border/50">
                            <span className="text-sm text-muted-foreground font-medium">Match Type</span>
                            <span className="font-semibold text-foreground">{formData.matchType || '-'}</span>
                        </div>
                    </div>
                    
                    <div className="bg-background/80 border border-primary/30 rounded-lg p-4 flex items-center justify-between">
                        <span className="text-base font-semibold text-foreground">Total Amount</span>
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
                        Manual Booking
                    </Button>
                )}
            </DialogTrigger>
            
            <DialogContent className="max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
                <DialogHeader className="pb-6 border-b border-border">
                    <DialogTitle className="flex items-center gap-3 text-xl font-semibold">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Plus className="w-5 h-5 text-primary" />
                        </div>
                        Create Manual Booking
                    </DialogTitle>
                    <DialogDescription className="text-base text-muted-foreground mt-2">
                        Create a new booking on behalf of a user. Complete all required fields to proceed.
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
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* User Selection */}
                            <div className="lg:col-span-2">
                            {renderFormField(
                                'Select User',
                                'userId',
                                <div className="space-y-2">
                                    {/* Search Input */}
                                    <Input
                                        placeholder="Search for a user by name or email..."
                                        value={userSearchTerm}
                                        onChange={(e) => setUserSearchTerm(e.target.value)}
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
                                                    usersLoading ? "Loading users..." : 
                                                    selectedUser ? `${selectedUser.fullName} (${selectedUser.email})` :
                                                    "Choose a user"
                                                } 
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                             {filteredUsers.length === 0 ? (
                                                <SelectItem value="no-users" disabled>
                                                    {usersLoading ? "Loading..." : "No users found"}
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
                            )}
                        </div>
                        {/* Court Selection */}
                        <div className="md:col-span-2">
                            {renderFormField(
                                'Select Court',
                                'courtId',
                                <div className="space-y-2">
                                    {/* Search Input */}
                                    <Input
                                        placeholder="Search for a court by name, location, or type..."
                                        value={courtSearchTerm}
                                        onChange={(e) => setCourtSearchTerm(e.target.value)}
                                        disabled={courtsLoading}
                                    />
                                    
                                    {/* Court Selection */}
                                    <Select
                                        value={formData.courtId?.toString() || ''}
                                        onValueChange={(value) => handleInputChange('courtId', parseInt(value))}
                                        disabled={courtsLoading}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder={courtsLoading ? "Loading courts..." : "Choose a court"} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white">
                                            {filteredCourts.length === 0 ? (
                                                <SelectItem value="no-courts" disabled>
                                                    {courtsLoading ? "Loading..." : "No courts found"}
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
                                                                <div className="text-xs text-gray-500 truncate">{court.location} - ${court.hourlyFee}/hr</div>
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
                                        <SelectItem value="SINGLE">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>Singles Match</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="DOUBLE">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4" />
                                                <span>Doubles Match</span>
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
                                        <SelectItem value="CASH">
                                            <div className="flex items-center space-x-2">
                                                <span>💵</span>
                                                <span>Cash Payment</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="TAP_TO_MANAGER">
                                            <div className="flex items-center space-x-2">
                                                <span>💳</span>
                                                <span>Tap/Card to Manager</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="PENDING">
                                            <div className="flex items-center space-x-2">
                                                <span>⏳</span>
                                                <span>Pending Payment</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Receipt Email Options */}
                        <div>
                            {renderFormField(
                                'Receipt Email',
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
                                            Send receipt via email
                                        </label>
                                    </div>
                                    {formData.sendReceiptEmail && (
                                        <Input
                                            placeholder="Email address for receipt"
                                            value={formData.customerEmail}
                                            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                                            type="email"
                                        />
                                    )}
                                </div>,
                                false
                            )}
                        </div>

                        {/* Notes */}
                        <div className="md:col-span-2">
                            {renderFormField(
                                'Notes',
                                'notes',
                                <Textarea
                                    placeholder="Optional notes for this booking..."
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
                        Cancel
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
                                Creating...
                            </>
                        ) : (
                            <>
                                <Plus className="w-4 h-4 mr-2" />
                                Create Booking
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
        </Dialog>
    );
};

export default ManualBookingForm;