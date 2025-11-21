import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, User, Check, X, Plus, Filter, Link as LinkIcon, Eye, ExternalLink, XCircle, DollarSign, CheckCircle, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { PaymentLinkDTO, PaymentLinkStatus } from '@/types/paymentLink';
import { paymentLinkService } from '@/services/paymentLinkService';
import { bookingService } from '@/services/bookingService';
import { BookingResponse } from '@/types/booking';
import ManualBookingForm from './ManualBookingForm';
import { format } from 'date-fns';
import { useAdminAuth } from '@/hooks/useAdminAuth';

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
  const { t } = useTranslation('admin');
  const { user } = useAdminAuth();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  
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

  const [cancelledBookings, setCancelledBookings] = useState<BookingResponse[]>([]);
  const [cancelledBookingsLoading, setCancelledBookingsLoading] = useState(false);
  const [cancelledBookingsPage, setCancelledBookingsPage] = useState(0);
  const [cancelledBookingsTotalPages, setCancelledBookingsTotalPages] = useState(0);

  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  const [cancelledFilters, setCancelledFilters] = useState({
    courtId: '',
    startDate: '',
    endDate: '',
    refundStatus: ''
  });

  // Super admin refund management state
  const [selectedBookings, setSelectedBookings] = useState<Set<number>>(new Set());
  const [refundStatistics, setRefundStatistics] = useState({
    totalCancelled: 0,
    pendingRefunds: 0,
    completedRefunds: 0,
    totalRefundAmount: 0
  });
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundModalBookingIds, setRefundModalBookingIds] = useState<number[]>([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [auditTrailBookingId, setAuditTrailBookingId] = useState<number | null>(null);
  const [auditTrailData, setAuditTrailData] = useState<any[]>([]);

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

  const loadCancelledBookings = async () => {
    setCancelledBookingsLoading(true);
    try {
      const filters: any = {
        page: cancelledBookingsPage,
        size: 10
      };
      
      if (cancelledFilters.courtId) {
        filters.courtId = parseInt(cancelledFilters.courtId);
      }
      if (cancelledFilters.startDate) {
        filters.startDate = cancelledFilters.startDate;
      }
      if (cancelledFilters.endDate) {
        filters.endDate = cancelledFilters.endDate;
      }
      if (cancelledFilters.refundStatus) {
        filters.refundStatus = cancelledFilters.refundStatus;
      }

      const response = await bookingService.getCancelledBookings(filters);
      setCancelledBookings(response.content || []);
      setCancelledBookingsTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to load cancelled bookings:', error);
      toast.error(t('admin.cancelledBookings.failedToLoadCancelledBookings'));
    } finally {
      setCancelledBookingsLoading(false);
    }
  };

  useEffect(() => {
    loadCancelledBookings();
    if (isSuperAdmin) {
      loadRefundStatistics();
    }
  }, [cancelledBookingsPage, cancelledFilters, isSuperAdmin]);

  const loadRefundStatistics = async () => {
    try {
      const stats = await bookingService.getCancelledBookingsSummary({
        startDate: cancelledFilters.startDate,
        endDate: cancelledFilters.endDate
      });
      setRefundStatistics(stats);
    } catch (error) {
      console.error('Failed to load refund statistics:', error);
    }
  };

  const handleSelectBooking = (bookingId: number, checked: boolean) => {
    const newSelected = new Set(selectedBookings);
    if (checked) {
      newSelected.add(bookingId);
    } else {
      newSelected.delete(bookingId);
    }
    setSelectedBookings(newSelected);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const pendingBookings = cancelledBookings
        .filter(b => b.refundStatus === 'PENDING')
        .map(b => b.id);
      setSelectedBookings(new Set(pendingBookings));
    } else {
      setSelectedBookings(new Set());
    }
  };

  const handleMarkAsRefunded = (bookingIds: number[]) => {
    setRefundModalBookingIds(bookingIds);
    setShowRefundModal(true);
  };

  const handleViewAuditTrail = async (bookingId: number) => {
    try {
      const auditData = await bookingService.getBookingAuditTrail(bookingId);
      setAuditTrailData(auditData);
      setAuditTrailBookingId(bookingId);
      setShowAuditTrail(true);
    } catch (error) {
      console.error('Failed to load audit trail:', error);
      toast.error(t('admin.cancelledBookings.failedToLoadAuditTrail'));
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

  const getRefundStatusColor = (status?: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED': return 'bg-green-100 text-green-800';
      case 'NOT_APPLICABLE': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRefundStatusLabel = (status?: string) => {
    switch (status) {
      case 'PENDING': return t('admin.cancelledBookings.refundPending');
      case 'REFUNDED': return t('admin.cancelledBookings.refunded');
      case 'NOT_APPLICABLE': return t('admin.cancelledBookings.notApplicable');
      default: return status || 'N/A';
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
          <TabsTrigger value="cancelled-bookings">
            {t('admin.cancelledBookings.title')}
            {cancelledBookings.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {cancelledBookings.length}
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
                        {link.status === PaymentLinkStatus.ACTIVE && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Generate payment link URL
                              const currentOrigin = window.location.origin;
                              const paymentLinkUrl = `${currentOrigin}/payment/${link.id}`;
                              
                              // Generate bilingual message
                              const message = paymentLinkService.generateBilingualWhatsAppMessage(link, paymentLinkUrl);
                              
                              // Use phone number if available
                              const whatsappLink = link.phoneNumber
                                ? paymentLinkService.generateWhatsAppWebLinkWithPhone(link.phoneNumber, message)
                                : paymentLinkService.generateWhatsAppWebLink(message);
                              
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

        <TabsContent value="cancelled-bookings">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                {t('admin.cancelledBookings.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Refund Statistics Dashboard (Super Admin Only) */}
              {isSuperAdmin && (
                <div className="mb-6 grid grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Cancelled</p>
                          <p className="text-2xl font-bold">{refundStatistics.totalCancelled}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Pending Refunds</p>
                          <p className="text-2xl font-bold text-yellow-600">{refundStatistics.pendingRefunds}</p>
                        </div>
                        <Clock className="w-8 h-8 text-yellow-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Completed Refunds</p>
                          <p className="text-2xl font-bold text-green-600">{refundStatistics.completedRefunds}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500">Total Refund Amount</p>
                          <p className="text-2xl font-bold">{refundStatistics.totalRefundAmount} SAR</p>
                        </div>
                        <DollarSign className="w-8 h-8 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Filters */}
              <div className="mb-6 space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="cancelled-court-filter">{t('admin.forms.labels.court')}</Label>
                    <Select 
                      value={cancelledFilters.courtId} 
                      onValueChange={(value) => setCancelledFilters({...cancelledFilters, courtId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.cancelledBookings.allCourts')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('admin.cancelledBookings.allCourts')}</SelectItem>
                        {courts.map((court) => (
                          <SelectItem key={court.id} value={court.id}>
                            {court.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="cancelled-start-date">{t('admin.forms.labels.startDate')}</Label>
                    <Input
                      id="cancelled-start-date"
                      type="date"
                      value={cancelledFilters.startDate}
                      onChange={(e) => setCancelledFilters({...cancelledFilters, startDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cancelled-end-date">{t('admin.forms.labels.endDate')}</Label>
                    <Input
                      id="cancelled-end-date"
                      type="date"
                      value={cancelledFilters.endDate}
                      onChange={(e) => setCancelledFilters({...cancelledFilters, endDate: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="refund-status-filter">{t('admin.cancelledBookings.refundStatus')}</Label>
                    <Select 
                      value={cancelledFilters.refundStatus} 
                      onValueChange={(value) => setCancelledFilters({...cancelledFilters, refundStatus: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('admin.cancelledBookings.allStatuses')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">{t('admin.cancelledBookings.allStatuses')}</SelectItem>
                        <SelectItem value="PENDING">{t('admin.cancelledBookings.refundPending')}</SelectItem>
                        <SelectItem value="REFUNDED">{t('admin.cancelledBookings.refunded')}</SelectItem>
                        <SelectItem value="NOT_APPLICABLE">{t('admin.cancelledBookings.notApplicable')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Bulk Actions (Super Admin Only) */}
              {isSuperAdmin && selectedBookings.size > 0 && (
                <div className="mb-4 flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedBookings.size} {t('admin.cancelledBookings.bookingsSelected')}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleMarkAsRefunded(Array.from(selectedBookings))}
                    className="flex items-center gap-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    {t('admin.cancelledBookings.markAsRefunded')}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedBookings(new Set())}
                  >
                    {t('admin.cancelledBookings.clearSelection')}
                  </Button>
                </div>
              )}

              {/* Table */}
              {cancelledBookingsLoading ? (
                <div className="text-center py-8 text-gray-500">{t('admin.common.loading')}</div>
              ) : cancelledBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {t('admin.cancelledBookings.noCancelledBookings')}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b bg-gray-50">
                          {isSuperAdmin && (
                            <th className="text-left p-3 font-medium w-12">
                              <Checkbox
                                checked={selectedBookings.size > 0 && selectedBookings.size === cancelledBookings.filter(b => b.refundStatus === 'PENDING').length}
                                onCheckedChange={handleSelectAll}
                              />
                            </th>
                          )}
                          <th className="text-left p-3 font-medium">{t('admin.cancelledBookings.bookingId')}</th>
                          <th className="text-left p-3 font-medium">{t('admin.forms.labels.court')}</th>
                          <th className="text-left p-3 font-medium">{t('admin.cancelledBookings.player')}</th>
                          <th className="text-left p-3 font-medium">{t('admin.cancelledBookings.dateTime')}</th>
                          <th className="text-left p-3 font-medium">{t('admin.cancelledBookings.cancelledAt')}</th>
                          <th className="text-left p-3 font-medium">{t('admin.cancelledBookings.refundStatus')}</th>
                          {isSuperAdmin && (
                            <th className="text-left p-3 font-medium">{t('admin.cancelledBookings.actions')}</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {cancelledBookings.map((booking) => (
                          <tr key={booking.id} className="border-b hover:bg-gray-50">
                            {isSuperAdmin && (
                              <td className="p-3">
                                {booking.refundStatus === 'PENDING' && (
                                  <Checkbox
                                    checked={selectedBookings.has(booking.id)}
                                    onCheckedChange={(checked) => handleSelectBooking(booking.id, checked as boolean)}
                                  />
                                )}
                              </td>
                            )}
                            <td className="p-3">#{booking.id}</td>
                            <td className="p-3">{booking.court.name}</td>
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{booking.user.fullName}</div>
                                <div className="text-sm text-gray-500">{booking.user.email}</div>
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                <div>{format(new Date(booking.startTime), 'MMM dd, yyyy')}</div>
                                <div className="text-sm text-gray-500">
                                  {format(new Date(booking.startTime), 'HH:mm')} - {format(new Date(booking.endTime), 'HH:mm')}
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              {booking.startTime ? format(new Date(booking.startTime), 'MMM dd, yyyy HH:mm') : 'N/A'}
                            </td>
                            <td className="p-3">
                              <Badge className={getRefundStatusColor(booking.refundStatus)}>
                                {getRefundStatusLabel(booking.refundStatus)}
                              </Badge>
                            </td>
                            {isSuperAdmin && (
                              <td className="p-3">
                                <div className="flex gap-2">
                                  {booking.refundStatus === 'PENDING' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => handleMarkAsRefunded([booking.id])}
                                      className="flex items-center gap-1"
                                    >
                                      <DollarSign className="w-3 h-3" />
                                      {t('admin.cancelledBookings.markRefunded')}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleViewAuditTrail(booking.id)}
                                    className="flex items-center gap-1"
                                  >
                                    <History className="w-3 h-3" />
                                    {t('admin.cancelledBookings.audit')}
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {cancelledBookingsTotalPages > 1 && (
                    <div className="flex justify-between items-center mt-4">
                      <Button
                        variant="outline"
                        onClick={() => setCancelledBookingsPage(Math.max(0, cancelledBookingsPage - 1))}
                        disabled={cancelledBookingsPage === 0}
                      >
                        {t('buttons.previous', { ns: 'common' })}
                      </Button>
                      <span className="text-sm text-gray-600">
                        {t('admin.cancelledBookings.page')} {cancelledBookingsPage + 1} {t('admin.cancelledBookings.of')} {cancelledBookingsTotalPages}
                      </span>
                      <Button
                        variant="outline"
                        onClick={() => setCancelledBookingsPage(Math.min(cancelledBookingsTotalPages - 1, cancelledBookingsPage + 1))}
                        disabled={cancelledBookingsPage >= cancelledBookingsTotalPages - 1}
                      >
                        {t('buttons.next', { ns: 'common' })}
                      </Button>
                    </div>
                  )}
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

      {/* Refund Action Modal */}
      {showRefundModal && (
        <RefundActionModal
          bookingIds={refundModalBookingIds}
          bookings={cancelledBookings.filter(b => refundModalBookingIds.includes(b.id))}
          onClose={() => {
            setShowRefundModal(false);
            setRefundModalBookingIds([]);
          }}
          onConfirm={async (refundReference, notes) => {
            try {
              if (refundModalBookingIds.length === 1) {
                await bookingService.markBookingAsRefunded(refundModalBookingIds[0], refundReference, notes);
                toast.success(t('admin.cancelledBookings.bookingMarkedAsRefunded'));
              } else {
                const result = await bookingService.bulkMarkAsRefunded(refundModalBookingIds, refundReference, notes);
                toast.success(t('admin.cancelledBookings.bookingsMarkedAsRefunded', { count: result.successCount }));
                if (result.failureCount > 0) {
                  toast.error(t('admin.cancelledBookings.bookingsFailedToUpdate', { count: result.failureCount }));
                }
              }
              setShowRefundModal(false);
              setRefundModalBookingIds([]);
              setSelectedBookings(new Set());
              loadCancelledBookings();
              loadRefundStatistics();
            } catch (error) {
              console.error('Failed to mark as refunded:', error);
              toast.error(t('admin.cancelledBookings.failedToMarkAsRefunded'));
            }
          }}
        />
      )}

      {/* Audit Trail Modal */}
      {showAuditTrail && auditTrailBookingId && (
        <AuditTrailModal
          bookingId={auditTrailBookingId}
          auditData={auditTrailData}
          onClose={() => {
            setShowAuditTrail(false);
            setAuditTrailBookingId(null);
            setAuditTrailData([]);
          }}
        />
      )}
    </motion.div>
  );
};

// RefundActionModal Component
interface RefundActionModalProps {
  bookingIds: number[];
  bookings: BookingResponse[];
  onClose: () => void;
  onConfirm: (refundReference: string, notes?: string) => Promise<void>;
}

const RefundActionModal: React.FC<RefundActionModalProps> = ({ bookingIds, bookings, onClose, onConfirm }) => {
  const { t } = useTranslation();
  const [refundReference, setRefundReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalAmount = bookings.reduce((sum, booking) => {
    return sum + (booking.court.hourlyFee * 2); // Assuming 2 hours per booking
  }, 0);

  const handleSubmit = async () => {
    if (!refundReference.trim()) {
      toast.error(t('admin.cancelledBookings.refundReferenceRequired'));
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(refundReference, notes || undefined);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {t('admin.cancelledBookings.markAsRefunded')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Selected Bookings List */}
          <div>
            <Label className="text-sm font-medium">{t('admin.cancelledBookings.selectedBookings')} ({bookings.length})</Label>
            <div className="mt-2 max-h-40 overflow-y-auto border rounded-lg">
              {bookings.map((booking) => (
                <div key={booking.id} className="p-3 border-b last:border-b-0 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">#{booking.id} - {booking.court.name}</span>
                    <span>{booking.court.hourlyFee * 2} SAR</span>
                  </div>
                  <div className="text-gray-500">{booking.user.fullName}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <span className="font-semibold">{t('admin.cancelledBookings.totalRefund')}</span>
            <span className="text-xl font-bold">{totalAmount.toFixed(2)} SAR</span>
          </div>

          {/* Refund Reference */}
          <div>
            <Label htmlFor="refund-reference">
              {t('admin.cancelledBookings.refundReference')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="refund-reference"
              value={refundReference}
              onChange={(e) => setRefundReference(e.target.value)}
              placeholder={t('admin.cancelledBookings.refundReferencePlaceholder')}
              className="mt-1"
            />
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="refund-notes">{t('admin.cancelledBookings.notesOptional')}</Label>
            <Textarea
              id="refund-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('admin.cancelledBookings.notesPlaceholder')}
              rows={3}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
              {t('buttons.cancel', { ns: 'common' })}
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? t('admin.cancelledBookings.processing') : t('admin.cancelledBookings.confirmRefund')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// AuditTrailModal Component
interface AuditTrailModalProps {
  bookingId: number;
  auditData: any[];
  onClose: () => void;
}

const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ bookingId, auditData, onClose }) => {
  const { t } = useTranslation();
  
  const getActionTypeLabel = (actionType: string) => {
    switch (actionType) {
      case 'CANCELLED': return t('admin.cancelledBookings.bookingCancelled');
      case 'REFUND_PENDING': return t('admin.cancelledBookings.refundPendingAction');
      case 'REFUND_COMPLETED': return t('admin.cancelledBookings.refundCompletedAction');
      default: return actionType;
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      case 'REFUND_PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REFUND_COMPLETED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            {t('admin.cancelledBookings.auditTrail')} - {t('admin.cancelledBookings.bookingId')} #{bookingId}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {auditData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t('admin.cancelledBookings.noAuditRecords')}</div>
          ) : (
            <div className="space-y-3">
              {auditData.map((audit) => (
                <div key={audit.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={getActionTypeColor(audit.actionType)}>
                      {getActionTypeLabel(audit.actionType)}
                    </Badge>
                    <span className="text-sm text-gray-500">
                      {format(new Date(audit.performedAt), 'MMM dd, yyyy HH:mm:ss')}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div>
                      <span className="font-medium">{t('admin.cancelledBookings.performedBy')}:</span>{' '}
                      {audit.performedBy.fullName} ({audit.performedBy.email})
                    </div>
                    {audit.cancellationReason && (
                      <div>
                        <span className="font-medium">{t('admin.cancelledBookings.reason')}:</span> {audit.cancellationReason}
                      </div>
                    )}
                    {audit.refundReference && (
                      <div>
                        <span className="font-medium">{t('admin.cancelledBookings.refundReference')}:</span> {audit.refundReference}
                      </div>
                    )}
                    {audit.notes && (
                      <div>
                        <span className="font-medium">{t('admin.cancelledBookings.notes')}:</span> {audit.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose}>
              {t('buttons.close', { ns: 'common' })}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingManagement;