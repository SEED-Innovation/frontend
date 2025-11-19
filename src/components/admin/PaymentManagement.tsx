import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle,
  Eye,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { AdminPaymentsPageDto, PaymentTransaction, PaymentIdRequest } from '@/types/admin';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

const PaymentManagement = () => {
  const { t } = useTranslation('admin');
  // State management
  const [pageData, setPageData] = useState<AdminPaymentsPageDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [sort] = useState('paymentDate,desc');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
      setCurrentPage(0); // Reset to first page when searching
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // API base URL
  const API_BASE = import.meta.env.VITE_API_URL || '';

  // Fetch payments data
  const fetchPayments = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        size: pageSize.toString(),
        sort: sort
      });

      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${API_BASE}/api/admin/payments/page-data?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments data');
      }

      const data: AdminPaymentsPageDto = await response.json();
      setPageData(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to load payments data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, pageSize, sort, statusFilter, searchQuery, API_BASE]);

  // Initial load and dependency changes
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Helper functions
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'PENDING': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      SUCCESS: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      FAILED: 'bg-red-100 text-red-800 border-red-200'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'Paid';
      case 'PENDING': return t('status.pending');
      case 'FAILED': return 'Failed';
      default: return status;
    }
  };

  // Action handlers
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
  };

  const handleManualConfirm = async (paymentId: number) => {
    try {
      const token = localStorage.getItem('accessToken');
      const requestBody: PaymentIdRequest = { paymentId };

      const response = await fetch(`${API_BASE}/api/admin/payments/mark-paid`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to confirm payment');
      }

      toast.success('Payment manually confirmed');
      await fetchPayments(); // Refresh data
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value === 'all' ? '' : value);
    setCurrentPage(0);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleExportCsv = async () => {
    try {
      console.log('Starting CSV export...');
      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.error('No authentication token found');
        return;
      }

      console.log('Making authenticated request to:', `${API_BASE}/api/admin/payments/export-csv`);
      const response = await fetch(`${API_BASE}/api/admin/payments/export-csv`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });

      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to export CSV: ${response.status} ${response.statusText}`);
      }

      // Get the blob
      const blob = await response.blob();
      console.log('Blob received, size:', blob.size);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.style.display = 'none';
      document.body.appendChild(a);
      console.log('Triggering download...');
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('CSV export completed successfully');
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Failed to export CSV: ' + (error as Error).message);
    }
  };

  // Early return for loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">Monitor and manage all court booking payments</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = pageData ? [
    {
      title: 'Total Payments',
      value: pageData.totalPayments,
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      title: 'Paid',
      value: pageData.paidCount,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: t('status.pending'),
      value: pageData.pendingCount,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Failed',
      value: pageData.failedCount,
      icon: XCircle,
      color: 'text-red-600'
    }
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('admin.pages.paymentManagement.title')}</h1>
          <p className="text-gray-600 mt-1">{t('admin.pages.paymentManagement.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {t('admin.common.refresh')}
          </Button>
          <Button 
            className="flex items-center gap-2"
            onClick={handleExportCsv}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                  </div>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by player name, email, or reference..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter || 'all'} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="SUCCESS">Paid</SelectItem>
                <SelectItem value="PENDING">{t('status.pending')}</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payments Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Player</TableHead>
                  <TableHead>{t('admin.forms.labels.amount')}</TableHead>
                  <TableHead>{t('admin.forms.labels.status')}</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>{t('admin.forms.labels.court')}</TableHead>
                  <TableHead>{t('admin.forms.labels.date')}</TableHead>
                  <TableHead>{t('admin.tables.headers.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pageData?.paymentsPage.content.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchQuery || statusFilter ? 'No payments found matching your filters' : 'No payments found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageData?.paymentsPage.content.map((payment) => (
                    <TableRow key={payment.paymentId}>
                      <TableCell className="font-medium">{payment.referenceNumber}</TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{payment.playerName}</p>
                          <p className="text-sm text-gray-500">{payment.playerEmail}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">{payment.amount} SAR</TableCell>
                      <TableCell>
                        <Badge className={`flex items-center gap-1 ${getStatusBadge(payment.status)}`}>
                          {getStatusIcon(payment.status)}
                          {getStatusDisplay(payment.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{payment.paymentMethod.replace('_', ' ')}</TableCell>
                      <TableCell>{payment.courtName}</TableCell>
                      <TableCell>{new Date(payment.paymentDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.status === 'PENDING' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManualConfirm(payment.paymentId)}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {pageData && pageData.paymentsPage.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage * pageSize) + 1} to {Math.min((currentPage + 1) * pageSize, pageData.paymentsPage.totalElements)} of {pageData.paymentsPage.totalElements} payments
              </div>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 0) handlePageChange(currentPage - 1);
                      }}
                      className={currentPage === 0 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(5, pageData.paymentsPage.totalPages))].map((_, i) => {
                    const startPage = Math.max(0, Math.min(currentPage - 2, pageData.paymentsPage.totalPages - 5));
                    const pageNum = startPage + i;
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(pageNum);
                          }}
                          isActive={pageNum === currentPage}
                        >
                          {pageNum + 1}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}

                  <PaginationItem>
                    <PaginationNext 
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < pageData.paymentsPage.totalPages - 1) handlePageChange(currentPage + 1);
                      }}
                      className={currentPage >= pageData.paymentsPage.totalPages - 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;