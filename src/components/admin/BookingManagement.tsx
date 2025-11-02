import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Check, X, Plus, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

interface Booking {
  id: string;
  courtId: string;
  courtName: string;
  userId: string;
  userName: string;
  userEmail: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  amount: number;
  paymentStatus: 'paid' | 'pending' | 'failed';
}

const BookingManagement = () => {
  const { t } = useTranslation('web');
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      courtId: 'court-1',
      courtName: 'Court 1 - Center',
      userId: 'user-1',
      userName: 'Ahmed Ali',
      userEmail: 'ahmed@example.com',
      startTime: '10:00',
      endTime: '11:00',
      date: '2024-01-15',
      status: 'pending',
      amount: 120,
      paymentStatus: 'pending'
    },
    {
      id: '2',
      courtId: 'court-2',
      courtName: 'Court 2 - East',
      userId: 'user-2',
      userName: 'Sara Mohammed',
      userEmail: 'sara@example.com',
      startTime: '14:00',
      endTime: '15:00',
      date: '2024-01-15',
      status: 'approved',
      amount: 100,
      paymentStatus: 'paid'
    }
  ]);

  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [manualBooking, setManualBooking] = useState({
    userId: '',
    courtId: '',
    startTime: '',
    endTime: '',
    date: ''
  });

  const [selectedCourt, setSelectedCourt] = useState('');

  const courts = [
    { id: 'court-1', name: 'Court 1 - Center' },
    { id: 'court-2', name: 'Court 2 - East' }
  ];

  const users = [
    { id: 'user-1', name: 'Ahmed Ali', email: 'ahmed@example.com' },
    { id: 'user-2', name: 'Sara Mohammed', email: 'sara@example.com' }
  ];

  const handleApproveBooking = (bookingId: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'approved' as const }
        : booking
    ));
    toast.success('Booking approved successfully');
  };

  const handleRejectBooking = (bookingId: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'rejected' as const }
        : booking
    ));
    toast.success('Booking rejected');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings(bookings.map(booking => 
      booking.id === bookingId 
        ? { ...booking, status: 'cancelled' as const }
        : booking
    ));
    toast.success('Booking cancelled');
  };

  const handleManualBooking = () => {
    if (!manualBooking.userId || !manualBooking.courtId || !manualBooking.startTime || !manualBooking.endTime || !manualBooking.date) {
      toast.error('Please fill in all fields');
      return;
    }

    const newBooking: Booking = {
      id: Date.now().toString(),
      ...manualBooking,
      courtName: courts.find(c => c.id === manualBooking.courtId)?.name || '',
      userName: users.find(u => u.id === manualBooking.userId)?.name || '',
      userEmail: users.find(u => u.id === manualBooking.userId)?.email || '',
      status: 'approved',
      amount: 120,
      paymentStatus: 'pending'
    };

    setBookings([...bookings, newBooking]);
    setManualBooking({
      userId: '',
      courtId: '',
      startTime: '',
      endTime: '',
      date: ''
    });
    toast.success('Manual booking created successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = selectedCourt && selectedCourt !== "all"
    ? bookings.filter(booking => booking.courtId === selectedCourt)
    : bookings;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.pages.bookingManagement.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.pages.bookingManagement.subtitle')}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              {t('admin.pages.bookingManagement.manualBooking')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('admin.pages.bookingManagement.createManualBooking')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="user">Select User</Label>
                <Select onValueChange={(value) => setManualBooking({...manualBooking, userId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.forms.placeholders.selectUser')} />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} - {user.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="court">Select Court</Label>
                <Select onValueChange={(value) => setManualBooking({...manualBooking, courtId: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('admin.forms.placeholders.selectCourt')} />
                  </SelectTrigger>
                  <SelectContent>
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id}>
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="date">{t('admin.forms.labels.date')}</Label>
                <Input
                  id="date"
                  type="date"
                  value={manualBooking.date}
                  onChange={(e) => setManualBooking({...manualBooking, date: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={manualBooking.startTime}
                    onChange={(e) => setManualBooking({...manualBooking, startTime: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={manualBooking.endTime}
                    onChange={(e) => setManualBooking({...manualBooking, endTime: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleManualBooking} className="w-full">{t('admin.forms.buttons.createBooking')}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Bookings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="court-filter">{t('admin.forms.labels.court')}</Label>
                <Select onValueChange={setSelectedCourt}>
                  <SelectTrigger>
                    <SelectValue placeholder="All courts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All courts</SelectItem>
                  {courts.map((court) => (
                    <SelectItem key={court.id} value={court.id}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="end-date">End Date</Label>
              <Input
                id="end-date"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{booking.courtName}</h3>
                    <p className="text-sm text-gray-600">{booking.userName} - {booking.userEmail}</p>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(booking.paymentStatus)}>
                      {booking.paymentStatus}
                    </Badge>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>{booking.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{booking.amount} SAR</span>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleApproveBooking(booking.id)}
                      className="flex items-center gap-1"
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive" 
                      onClick={() => handleRejectBooking(booking.id)}
                      className="flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                )}

                {(booking.status === 'approved' || booking.status === 'pending') && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleCancelBooking(booking.id)}
                    className="flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />{t('admin.common.cancel')}</Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookingManagement;