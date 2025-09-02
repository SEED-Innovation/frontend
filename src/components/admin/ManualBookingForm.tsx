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
import { format } from 'date-fns';

import { BookingResponse, CreateBookingRequest, CourtResponse } from '@/types/booking';
import { UserResponse } from '@/types/user';
import { bookingService, courtService, userService } from '@/services';
import { cn } from '@/lib/utils';
import UserSearchInput from './UserSearchInput';

interface ManualBookingFormProps {
    onBookingCreated: (booking: BookingResponse) => void;
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
        notes: ''
    });
    
    const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [success, setSuccess] = useState('');
    const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);

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
        setFormData(prev => ({ ...prev, userId: user.id }));
        
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

        // Check if date is in the past
        if (formData.date && formData.date < new Date()) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (formData.date < today) {
                newErrors.date = 'Cannot book for past dates';
            }
        }

        setErrors(newErrors);
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
            // Convert our form data to mobile app compatible format
            const startDateTime = new Date(formData.selectedSlot!.startTime);
            const endDateTime = new Date(formData.selectedSlot!.endTime);
            const durationMinutes = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
            
            // Fix timezone issue: use local date formatting instead of toISOString()
            const year = formData.date!.getFullYear();
            const month = String(formData.date!.getMonth() + 1).padStart(2, '0');
            const day = String(formData.date!.getDate()).padStart(2, '0');
            const localDateString = `${year}-${month}-${day}`;
            
            const bookingRequest: CreateBookingRequest = {
                userId: formData.userId!,
                courtId: formData.courtId!,
                date: localDateString, // YYYY-MM-DD format without timezone conversion
                startTime: startDateTime.toTimeString().split(' ')[0], // HH:mm:ss format
                durationMinutes: durationMinutes,
                matchType: formData.matchType as 'SINGLE' | 'DOUBLE',
                notes: formData.notes || undefined
            };

            console.log('🏗️ Creating manual booking:', bookingRequest);

            const newBooking = await bookingService.createManualBooking(bookingRequest);
            
            console.log('✅ Manual booking created:', newBooking);

            setSuccess('Booking created successfully!');
            onBookingCreated(newBooking);
            
            // Reset form after short delay
            setTimeout(() => {
                resetForm();
                setIsOpen(false);
            }, 1500);

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
            notes: ''
        });
        setSelectedUser(null);
        setAvailableSlots([]);
        setErrors({});
        setSuccess('');
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
        required = true
    ) => (
        <div className="space-y-2">
            <Label htmlFor={field} className="text-sm font-medium">
                {label} {required && <span className="text-red-500">*</span>}
            </Label>
            {children}
            {errors[field] && (
                <p className="text-sm text-red-600">{errors[field]}</p>
            )}
        </div>
    );

    const renderBookingSummary = () => {
        const court = getSelectedCourt();

        if (!selectedUser || !court || !formData.selectedSlot) return null;

        return (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <h4 className="font-medium text-gray-900">Booking Summary</h4>
                
                <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">User:</span>
                        <span className="font-medium">{selectedUser.fullName}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Court:</span>
                        <span className="font-medium">{court.name}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Date:</span>
                        <span className="font-medium">
                            {formData.date ? format(formData.date, 'PPP') : '-'}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Time:</span>
                        <span className="font-medium">
                            {formData.selectedSlot.formattedTimeRange}
                        </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-medium">{formData.duration} minutes</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Match Type:</span>
                        <span className="font-medium">{formData.matchType || '-'}</span>
                    </div>
                    
                    <div className="border-t pt-2 flex items-center justify-between font-medium">
                        <span>Total Price:</span>
                        <span className="text-lg">${formData.selectedSlot.price?.toFixed(2) || '0.00'}</span>
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
            
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center">
                        <Plus className="w-5 h-5 mr-2" />
                        Create Manual Booking
                    </DialogTitle>
                    <DialogDescription>
                        Create a new booking on behalf of a user. All fields marked with * are required.
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* User_Selection */}
                        <div className="md:col-span-2">
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
                                                            <div className="text-sm text-gray-500">${slot.price?.toFixed(2)}</div>
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

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

                    <DialogFooter className="gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-blue-600 hover:bg-blue-700"
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
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ManualBookingForm;