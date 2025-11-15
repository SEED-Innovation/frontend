import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { adminRecordingService } from '@/lib/api/services/adminRecordingService';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';

interface Facility {
  id: number;
  name: string;
}

interface Court {
  id: number;
  name: string;
  courtNumber: number;
}

interface User {
  id: number;
  name: string;
  email: string;
}

interface Booking {
  id: number;
  startTime: string;
  endTime: string;
  courtName: string;
}

interface CreateRecordingDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateRecordingDialog: React.FC<CreateRecordingDialogProps> = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<number | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [checkingCamera, setCheckingCamera] = useState(false);
  
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  
  const [linkToBooking, setLinkToBooking] = useState(false);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<number | null>(null);
  
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const { user } = useAdminAuth();

  // Get current datetime in local format for max attribute
  const getCurrentDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    if (open) {
      fetchFacilities();
      fetchUsers();
    }
  }, [open]);

  useEffect(() => {
    if (selectedFacility) {
      fetchCourts(selectedFacility);
    }
  }, [selectedFacility]);

  useEffect(() => {
    if (selectedFacility && selectedCourt) {
      checkCameraAvailability();
    }
  }, [selectedFacility, selectedCourt]);

  useEffect(() => {
    if (selectedUser) {
      fetchUserBookings(selectedUser);
    }
  }, [selectedUser]);

  const fetchFacilities = async () => {
    try {
      const response = await apiClient.get('/facilities/admin/my-facilities');
      // Handle both array response and paginated response
      const facilitiesData = Array.isArray(response) ? response : (response.content || []);
      setFacilities(facilitiesData);
    } catch (error) {
      console.error('Failed to fetch facilities:', error);
      setFacilities([]);
    }
  };

  const fetchCourts = async (facilityId: number) => {
    try {
      const response = await apiClient.get(`/facilities/${facilityId}/courts`);
      // Handle both array response and paginated response
      const courtsData = Array.isArray(response) ? response : (response.content || []);
      setCourts(courtsData);
    } catch (error) {
      console.error('Failed to fetch courts:', error);
      setCourts([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await apiClient.get('/admin/users');
      // Handle both array response and paginated response
      const usersData = Array.isArray(response) ? response : (response.content || []);
      setUsers(usersData);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setUsers([]);
    }
  };

  const fetchUserBookings = async (userId: number) => {
    try {
      const response = await apiClient.get(`/api/admin/bookings/user/${userId}`);
      // Handle both array response and paginated response
      const bookingsData = Array.isArray(response) ? response : (response.content || []);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      setBookings([]);
    }
  };

  const checkCameraAvailability = async () => {
    if (!selectedFacility || !selectedCourt) return;
    
    setCheckingCamera(true);
    try {
      const result = await adminRecordingService.checkCameraAvailability(selectedFacility, selectedCourt);
      setCameraAvailable(result.cameraAvailable || result.available || false);
    } catch (error) {
      console.error('Failed to check camera:', error);
      setCameraAvailable(false);
    } finally {
      setCheckingCamera(false);
    }
  };

  const handleCreate = async () => {
    if (!selectedFacility || !selectedCourt || !startDateTime || !endDateTime) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User not authenticated',
        variant: 'destructive',
      });
      return;
    }

    // Validate times
    const start = new Date(startDateTime);
    const end = new Date(endDateTime);
    const now = new Date();
    
    if (start > now) {
      toast({
        title: 'Error',
        description: 'Start time must be in the past',
        variant: 'destructive',
      });
      return;
    }

    if (end > now) {
      toast({
        title: 'Error',
        description: 'End time must be in the past',
        variant: 'destructive',
      });
      return;
    }

    if (end <= start) {
      toast({
        title: 'Error',
        description: 'End time must be after start time',
        variant: 'destructive',
      });
      return;
    }

    // Validate duration (max 2 hours)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    
    if (durationHours > 2) {
      toast({
        title: 'Error',
        description: 'Recording duration cannot exceed 2 hours',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      await apiClient.post('/api/admin/recordings/manual', {
        facilityId: selectedFacility,
        courtId: selectedCourt,
        startTime: startDateTime,
        endTime: endDateTime,
        userId: linkToBooking ? selectedUser : null,
        bookingId: linkToBooking ? selectedBooking : null,
      }, {
        headers: {
          'X-User-Id': user.id
        }
      });

      toast({
        title: 'Success',
        description: 'Recording created successfully',
      });
      
      onSuccess();
      handleClose();
    } catch (error: any) {
      console.error('Failed to create recording:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create recording',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedFacility(null);
    setSelectedCourt(null);
    setCameraAvailable(null);
    setStartDateTime('');
    setEndDateTime('');
    setLinkToBooking(false);
    setSelectedUser(null);
    setSelectedBooking(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Manual Recording</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Step 1: Select Facility and Court */}
          <div className="space-y-4">
            <div>
              <Label>Facility *</Label>
              <Select
                value={selectedFacility?.toString()}
                onValueChange={(value) => {
                  setSelectedFacility(Number(value));
                  setSelectedCourt(null);
                  setCameraAvailable(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id.toString()}>
                      {facility.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedFacility && (
              <div>
                <Label>Court *</Label>
                <Select
                  value={selectedCourt?.toString()}
                  onValueChange={(value) => setSelectedCourt(Number(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select court" />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id.toString()}>
                        {court.name} (Court {court.courtNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCourt && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50">
                {checkingCamera ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Checking camera availability...</span>
                  </>
                ) : cameraAvailable === true ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-600">Camera available</span>
                  </>
                ) : cameraAvailable === false ? (
                  <>
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm text-red-600">No camera available for this court</span>
                  </>
                ) : null}
              </div>
            )}
          </div>

          {/* Step 2: Date and Time */}
          {cameraAvailable && (
            <div className="space-y-4">
              <div>
                <Label>Start Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(e) => {
                    const newStartTime = e.target.value;
                    setStartDateTime(newStartTime);
                    
                    // Auto-set end time to 1 hour after start time if not set or before start
                    if (!endDateTime || endDateTime <= newStartTime) {
                      const start = new Date(newStartTime);
                      const end = new Date(start.getTime() + 60 * 60 * 1000); // Add 1 hour
                      const now = new Date();
                      
                      // Don't exceed current time
                      const finalEnd = end > now ? now : end;
                      
                      const year = finalEnd.getFullYear();
                      const month = String(finalEnd.getMonth() + 1).padStart(2, '0');
                      const day = String(finalEnd.getDate()).padStart(2, '0');
                      const hours = String(finalEnd.getHours()).padStart(2, '0');
                      const minutes = String(finalEnd.getMinutes()).padStart(2, '0');
                      setEndDateTime(`${year}-${month}-${day}T${hours}:${minutes}`);
                    }
                  }}
                  max={getCurrentDateTime()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Select a past time. End time will auto-adjust to 1 hour later.
                </p>
              </div>

              <div>
                <Label>End Date & Time *</Label>
                <Input
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(e) => setEndDateTime(e.target.value)}
                  min={startDateTime}
                  max={getCurrentDateTime()}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Must be after start time. Maximum duration: 2 hours.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Optional Booking Link */}
          {startDateTime && endDateTime && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="linkToBooking"
                  checked={linkToBooking}
                  onChange={(e) => setLinkToBooking(e.target.checked)}
                  className="w-4 h-4"
                />
                <Label htmlFor="linkToBooking" className="cursor-pointer">
                  Link to existing booking (optional)
                </Label>
              </div>

              {linkToBooking && (
                <>
                  <div>
                    <Label>Select User</Label>
                    <Select
                      value={selectedUser?.toString()}
                      onValueChange={(value) => setSelectedUser(Number(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select user" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name} ({user.email})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedUser && bookings.length > 0 && (
                    <div>
                      <Label>Select Booking</Label>
                      <Select
                        value={selectedBooking?.toString()}
                        onValueChange={(value) => setSelectedBooking(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select booking" />
                        </SelectTrigger>
                        <SelectContent>
                          {bookings.map((booking) => (
                            <SelectItem key={booking.id} value={booking.id.toString()}>
                              {booking.courtName} - {new Date(booking.startTime).toLocaleString()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedUser && bookings.length === 0 && (
                    <p className="text-sm text-gray-500">No bookings found for this user</p>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClose} disabled={creating}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!cameraAvailable || !startDateTime || !endDateTime || creating}
          >
            {creating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Recording'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRecordingDialog;
