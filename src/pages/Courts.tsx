
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import BookingFlow from '@/components/BookingFlow';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Courts = () => {
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const navigate = useNavigate();

  const handleBookingComplete = (booking: any) => {
    setCompletedBooking(booking);
    setBookingComplete(true);
    toast.success('Court booking confirmed successfully!');
  };

  const handleCheckIn = () => {
    toast.info('Redirecting to check-in...');
    setTimeout(() => navigate('/checkin'), 500);
  };

  const handleDashboard = () => {
    toast.info('Returning to dashboard...');
    setTimeout(() => navigate('/dashboard'), 500);
  };

  if (bookingComplete && completedBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="premium-card text-center animate-scale-in">
              <CardContent className="p-12">
                <div className="w-20 h-20 bg-tennis-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-tennis-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  Booking Confirmed!
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  Your court session has been successfully booked.
                </p>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4">Booking Details:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Court:</span>
                      <span className="font-medium">{completedBooking.court.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{completedBooking.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Slots:</span>
                      <span className="font-medium">{completedBooking.slots.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{completedBooking.totalHours} hour{completedBooking.totalHours !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600">Total Price:</span>
                      <span className="font-bold text-tennis-purple-700">${completedBooking.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleCheckIn}
                    className="tennis-button"
                  >
                    Go to Check-In
                  </Button>
                  <Button 
                    onClick={handleDashboard}
                    variant="outline" 
                    className="btn-outline"
                  >
                    Back to Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookingFlow onBookingComplete={handleBookingComplete} />
        </div>
      </div>
    </div>
  );
};

export default Courts;
