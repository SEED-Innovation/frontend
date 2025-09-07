
import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Star, Wifi, Coffee, Car, Camera, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAvailability } from '@/hooks/useAvailability';
import { handleApiError, isErrorCode } from '@/utils/errorMapper';
import { bookingService } from '@/services/bookingService';
import { toast } from 'sonner';

interface Court {
  id: number;
  name: string;
  address: string;
  distance: number;
  rating: number;
  pricePerHour: number;
  image: string;
  amenities: string[];
  aiFeatures: string[];
  availableSlots: string[];
}

interface BookingFlowProps {
  onBookingComplete: (booking: any) => void;
}

const BookingFlow: React.FC<BookingFlowProps> = ({ onBookingComplete }) => {
  const [step, setStep] = useState<'courts' | 'details' | 'booking' | 'payment'>('courts');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  // Fetch real availability data
  const { 
    data: availabilityData, 
    isLoading: availabilityLoading, 
    error: availabilityError, 
    refetch: refetchAvailability 
  } = useAvailability(
    selectedCourt?.id || 0, 
    selectedDate, 
    60
  );

  const courts: Court[] = [
    {
      id: 1,
      name: "Elite Tennis Academy",
      address: "123 Champion Drive, Tennis District",
      distance: 0.8,
      rating: 4.9,
      pricePerHour: 65,
      image: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=600&h=400&fit=crop",
      amenities: ["Wi-Fi", "Showers", "Cafe", "Parking"],
      aiFeatures: ["AI Camera", "Motion Tracking", "Performance Analytics"],
      availableSlots: ["09:00", "11:00", "14:00", "16:00", "18:00"]
    },
    {
      id: 2,
      name: "Riverside Tennis Club",
      address: "456 River Road, Downtown",
      distance: 1.2,
      rating: 4.7,
      pricePerHour: 45,
      image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop",
      amenities: ["Showers", "Equipment Rental", "Lounge"],
      aiFeatures: ["AI Camera", "Live Streaming"],
      availableSlots: ["10:00", "12:00", "15:00", "17:00", "19:00"]
    }
  ];

  const handleCourtSelect = (court: Court) => {
    setSelectedCourt(court);
    setStep('details');
  };

  const handleTimeSlotSelect = (slot: string) => {
    if (selectedSlots.includes(slot)) {
      setSelectedSlots(selectedSlots.filter(s => s !== slot));
    } else {
      setSelectedSlots([...selectedSlots, slot]);
    }
  };

  const handleBooking = async () => {
    if (!selectedCourt || selectedSlots.length === 0) {
      toast.error('Please select at least one time slot');
      return;
    }

    try {
      setIsBooking(true);
      
      // Create booking request for each selected slot
      for (const slot of selectedSlots) {
        const bookingRequest = {
          userId: 1, // TODO: Get from auth context
          courtId: selectedCourt.id,
          date: selectedDate,
          startTime: slot,
          durationMinutes: 60,
          matchType: 'SINGLE' as const,
          notes: ''
        };

        await bookingService.createManualBooking(bookingRequest);
      }

      const booking = {
        court: selectedCourt,
        date: selectedDate,
        slots: selectedSlots,
        totalHours: selectedSlots.length,
        totalPrice: selectedSlots.length * selectedCourt.pricePerHour
      };
      
      toast.success('Booking confirmed successfully!');
      onBookingComplete(booking);
      
    } catch (error) {
      handleApiError(error, 'Failed to create booking');
      
      // If there was a race condition, refetch availability
      if (isErrorCode(error, 'SLOT_ALREADY_BOOKED') || isErrorCode(error, 'COURT_UNAVAILABLE_THIS_DAY')) {
        await refetchAvailability();
        setSelectedSlots([]); // Clear selected slots
      }
    } finally {
      setIsBooking(false);
    }
  };

  if (step === 'courts') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Court</h2>
          <p className="text-gray-600">AI-enabled courts with advanced tracking technology</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courts.map((court, index) => (
            <Card 
              key={court.id} 
              className="premium-card animate-fade-in cursor-pointer"
              style={{ animationDelay: `${index * 0.2}s` }}
              onClick={() => handleCourtSelect(court)}
            >
              <div className="relative">
                <img
                  src={court.image}
                  alt={court.name}
                  className="w-full h-48 object-cover rounded-t-2xl"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-current mr-1" />
                  <span className="font-medium">{court.rating}</span>
                </div>
              </div>

              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{court.name}</h3>
                <div className="flex items-center text-gray-600 mb-3">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="text-sm">{court.address}</span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">{court.distance} mi away</span>
                  <span className="text-2xl font-bold text-tennis-purple-700">
                    ${court.pricePerHour}/hr
                  </span>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center">
                    <Camera className="w-4 h-4 mr-1 text-tennis-purple-600" />
                    AI Features
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {court.aiFeatures.map((feature, i) => (
                      <Badge key={i} className="bg-tennis-purple-100 text-tennis-purple-700">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button className="w-full tennis-button glow-button">
                  Select Court
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (step === 'details' && selectedCourt) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={() => setStep('courts')}>
            ← Back to Courts
          </Button>
          <h2 className="text-3xl font-bold text-gray-900">{selectedCourt.name}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <img
              src={selectedCourt.image}
              alt={selectedCourt.name}
              className="w-full h-64 object-cover rounded-2xl shadow-xl"
            />
            
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Camera className="w-5 h-5 mr-2 text-tennis-purple-600" />
                  AI Technology Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-3">
                  {selectedCourt.aiFeatures.map((feature, i) => (
                    <div key={i} className="flex items-center p-3 bg-tennis-purple-50 rounded-xl">
                      <div className="w-2 h-2 bg-tennis-purple-500 rounded-full mr-3"></div>
                      <span className="font-medium text-tennis-purple-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="premium-card">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Available Time Slots
                  {availabilityLoading && <RefreshCw className="w-4 h-4 ml-2 animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-12 bg-gray-200 rounded-lg animate-pulse" />
                    ))}
                  </div>
                ) : availabilityError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Failed to load availability</p>
                    <Button onClick={() => refetchAvailability()} variant="outline">
                      Try Again
                    </Button>
                  </div>
                ) : !availabilityData || availabilityData.availableCount === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">
                      {availabilityData?.message || "No available slots for this date"}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {availabilityData.availableSlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => handleTimeSlotSelect(slot.start)}
                        disabled={!slot.available}
                        className={`time-slot ${
                          selectedSlots.includes(slot.start)
                            ? 'time-slot-selected' 
                            : slot.available 
                              ? 'time-slot-available'
                              : 'time-slot-disabled'
                        }`}
                      >
                        <div className="text-sm font-medium">{slot.label || slot.start}</div>
                        <div className="text-xs">${slot.price}/hr</div>
                      </button>
                    ))}
                  </div>
                )}
                
                {selectedSlots.length > 0 && (
                  <div className="mt-6 p-4 bg-tennis-green-50 rounded-xl">
                    <h4 className="font-semibold text-tennis-green-700 mb-2">Selected Slots:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSlots.map((slot) => (
                        <Badge key={slot} className="bg-tennis-green-100 text-tennis-green-700">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                    <div className="mt-3 text-xl font-bold text-tennis-green-700">
                      Total: ${selectedSlots.length * selectedCourt.pricePerHour}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="premium-card">
              <CardHeader>
                <CardTitle>Amenities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {selectedCourt.amenities.map((amenity, i) => (
                    <div key={i} className="flex items-center">
                      {amenity === 'Wi-Fi' && <Wifi className="w-4 h-4 mr-2 text-tennis-purple-600" />}
                      {amenity === 'Cafe' && <Coffee className="w-4 h-4 mr-2 text-tennis-purple-600" />}
                      {amenity === 'Parking' && <Car className="w-4 h-4 mr-2 text-tennis-purple-600" />}
                      <span className="text-sm">{amenity}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Button 
              onClick={handleBooking}
              disabled={selectedSlots.length === 0 || isBooking || availabilityLoading}
              className="w-full tennis-button glow-button text-lg py-4"
            >
              {isBooking ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Booking...
                </>
              ) : (
                `Book Session (${selectedSlots.length} hour${selectedSlots.length !== 1 ? 's' : ''})`
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BookingFlow;
