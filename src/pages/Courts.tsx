
import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import BookingFlow from '@/components/BookingFlow';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const Courts = () => {
  const { t } = useTranslation('web');
  const [bookingComplete, setBookingComplete] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<any>(null);
  const navigate = useNavigate();

  const handleBookingComplete = (booking: any) => {
    setCompletedBooking(booking);
    setBookingComplete(true);
    toast.success(t('messages.success'));
  };

  const handleCheckIn = () => {
    toast.info(t('messages.info'));
    setTimeout(() => navigate('/checkin'), 500);
  };

  const handleDashboard = () => {
    toast.info(t('messages.info'));
    setTimeout(() => navigate('/dashboard'), 500);
  };

  if (bookingComplete && completedBooking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <div className="pt-20 pb-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="premium-card card-with-buttons text-center animate-scale-in">
              <CardContent className="p-12 card-content">
                <div className="w-20 h-20 bg-tennis-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-tennis-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                  {t('booking.bookingConfirmed')}
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                  {t('booking.courtBookingSuccess')}
                </p>
                
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-gray-900 mb-4">{t('booking.bookingDetailsTitle')}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('booking.court')}:</span>
                      <span className="font-medium">{completedBooking.court.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('booking.date')}:</span>
                      <span className="font-medium">{completedBooking.date}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('booking.timeSlots')}:</span>
                      <span className="font-medium">{completedBooking.slots.join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">{t('booking.totalHours')}:</span>
                      <span className="font-medium">{completedBooking.totalHours} {completedBooking.totalHours !== 1 ? t('booking.hours') : t('booking.hour')}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="text-gray-600">{t('booking.totalPrice')}:</span>
                      <span className="font-bold text-tennis-purple-700">${completedBooking.totalPrice}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    onClick={handleCheckIn}
                    className="tennis-button clickable-element"
                  >
                    {t('booking.goToCheckIn')}
                  </Button>
                  <Button 
                    onClick={handleDashboard}
                    variant="outline" 
                    className="btn-outline clickable-element"
                  >
                    {t('booking.backToDashboard')}
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
