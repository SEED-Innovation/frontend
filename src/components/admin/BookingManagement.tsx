import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Check, X, Plus, Filter, Link as LinkIcon, Eye, ExternalLink } from 'lucide-react';
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
import { PaymentLinkDTO, PaymentLinkStatus } from '@/types/paymentLink';
import { paymentLinkService } from '@/services/paymentLinkService';
import ManualBookingForm from './ManualBookingForm';
import { format } from 'date-fns';

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

  const [paymentLinks, setPaymentLinks] = useState<PaymentLinkDTO[]>([]);
  const [paymentLinksLoading, setPaymentLinksLoading] = useState(false);
  const [selectedPaymentLink, setSelectedPaymentLink] = useState<PaymentLinkDTO | null>(null);
  const [showPaymentLinkDetails, setShowPaymentLinkDetails] = useState(false);

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

  // Load payment links on component mount
  useEffect(() => {
    loadPaymentLinks();
  }, []);

  const loadPaymentLinks = async () => {
    setPaymentLinksLoading(true);
    try {
      const links = await paymentLinkService.getAllPaymentLinks();
      setPaymentLinks(links);
    } catch (error) {
      console.error('Failed to load payment links:', error);
      toast.error('Failed to load payment links');
    } finally {
      setPaymentLinksLoading(false);
    }
  };

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

  const getPaymentLinkStatusColor = (status: PaymentLinkStatus) => {
    switch (status) {
      case PaymentLinkStatus.ACTIVE: return 'bg-blue-100 text-blue-800';
      case PaymentLinkStatus.PAID: return 'bg-green-100 text-green-800';
      case PaymentLinkStatus.EXPIRED: return 'bg-gray-100 text-gray-800';
      case PaymentLinkStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewPaymentLink = async (linkId: string) => {
    try {
      const link = await paymentLinkService.getPaymentLink(linkId);
      setSelectedPaymentLink(link);
      setShowPaymentLinkDetails(true);
    } catch (error) {
      console.error('Failed to fetch payment link:', error);
      toast.error('Failed to load payment link details');
    }
  };

  const handlePaymentLinkCreated = () => {
    // Reload payment links after creation
    loadPaymentLinks();
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
        <div className="flex gap-2">
          <ManualBookingForm 
            onBookingCreated={handlePaymentLinkCreated}
            triggerButton={
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                {t('admin.pages.bookingManagement.manualBooking')}
              </Button>
            }
          />
        </div>
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

      <Tabs defaultValue="bookings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="payment-links">
            Payment Links
            {paymentLinks.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {paymentLinks.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
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
        </TabsContent>

        <TabsContent value="payment-links">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                Payment Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentLinksLoading ? (
                <div className="text-center py-8 text-gray-500">Loading payment links...</div>
              ) : paymentLinks.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No payment links created yet. Create one using the "Create Booking / Payment Link" button above.
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentLinks.map((link) => (
                    <div key={link.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{link.courtName}</h3>
                          <p className="text-sm text-gray-600">{link.facilityName}</p>
                          {link.phoneNumber && (
                            <p className="text-sm text-gray-500">Phone: {link.phoneNumber}</p>
                          )}
                        </div>
                        <Badge className={getPaymentLinkStatusColor(link.status)}>
                          {link.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span>{format(new Date(link.bookingDate), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span>{link.startTime} - {link.endTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{link.totalAmount} SAR</span>
                        </div>
                      </div>

                      {link.recordingAddon && (
                        <div className="text-sm text-blue-600">
                          📹 Recording addon included (+{link.recordingAddonPrice} SAR)
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleViewPaymentLink(link.id)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View Details
                        </Button>
                        {link.status === PaymentLinkStatus.ACTIVE && link.whatsAppTemplate && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              const whatsappLink = paymentLinkService.generateWhatsAppWebLink(
                                link.whatsAppTemplate.formattedMessage
                              );
                              window.open(whatsappLink, '_blank');
                            }}
                            className="flex items-center gap-1"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Share via WhatsApp
                          </Button>
                        )}
                      </div>

                      {link.status === PaymentLinkStatus.ACTIVE && (
                        <div className="text-xs text-gray-500">
                          Expires: {format(new Date(link.expiresAt), 'MMM dd, yyyy HH:mm')}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Link Details Dialog */}
      <Dialog open={showPaymentLinkDetails} onOpenChange={setShowPaymentLinkDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Link Details</DialogTitle>
          </DialogHeader>
          {selectedPaymentLink && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-gray-500">Link ID</Label>
                  <p className="font-mono text-sm">{selectedPaymentLink.id}</p>
                </div>
                <div>
                  <Label className="text-sm text-gray-500">Status</Label>
                  <Badge className={getPaymentLinkStatusColor(selectedPaymentLink.status)}>
                    {selectedPaymentLink.status}
                  </Badge>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Booking Details</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-500">Court</Label>
                    <p>{selectedPaymentLink.courtName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Facility</Label>
                    <p>{selectedPaymentLink.facilityName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Date</Label>
                    <p>{format(new Date(selectedPaymentLink.bookingDate), 'MMMM dd, yyyy')}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Time</Label>
                    <p>{selectedPaymentLink.startTime} - {selectedPaymentLink.endTime}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-2">Pricing</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Court Price</span>
                    <span>{selectedPaymentLink.courtPrice} SAR</span>
                  </div>
                  {selectedPaymentLink.recordingAddon && (
                    <div className="flex justify-between">
                      <span>Recording Addon</span>
                      <span>{selectedPaymentLink.recordingAddonPrice} SAR</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold border-t pt-2">
                    <span>Total Amount</span>
                    <span>{selectedPaymentLink.totalAmount} SAR</span>
                  </div>
                </div>
              </div>

              {selectedPaymentLink.phoneNumber && (
                <div className="border-t pt-4">
                  <Label className="text-sm text-gray-500">Customer Phone</Label>
                  <p>{selectedPaymentLink.phoneNumber}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-sm text-gray-500">Created At</Label>
                    <p>{format(new Date(selectedPaymentLink.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-500">Expires At</Label>
                    <p>{format(new Date(selectedPaymentLink.expiresAt), 'MMM dd, yyyy HH:mm')}</p>
                  </div>
                </div>
              </div>

              {selectedPaymentLink.edfaPayTransactionId && (
                <div className="border-t pt-4">
                  <Label className="text-sm text-gray-500">Transaction ID</Label>
                  <p className="font-mono text-sm">{selectedPaymentLink.edfaPayTransactionId}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default BookingManagement;