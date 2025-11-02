import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Download, 
  Mail, 
  RefreshCw, 
  Search, 
  Filter,
  Eye,
  MoreHorizontal,
  Calendar,
  DollarSign,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  FileX
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { receiptService } from '@/services';
import { ReceiptResponse, ReceiptStatus, ReceiptType } from '@/types/receipt';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { useTranslation } from 'react-i18next';

const ReceiptManagement: React.FC = () => {
  const { t } = useTranslation('web');
  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReceiptStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ReceiptType | 'ALL'>('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    loadReceipts();
  }, [currentPage, statusFilter, typeFilter]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptService.getAllReceipts(
        currentPage, 
        20, 
        statusFilter !== 'ALL' ? statusFilter : undefined,
        typeFilter !== 'ALL' ? typeFilter : undefined
      );
      
      setReceipts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load receipts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load receipts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (receiptId: number, receiptNumber: string) => {
    try {
      const blob = await receiptService.downloadReceiptPDF(receiptId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SEED_Receipt_${receiptNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Success',
        description: 'Receipt downloaded successfully'
      });
    } catch (error) {
      console.error('Failed to download receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to download receipt',
        variant: 'destructive'
      });
    }
  };

  const handleEmailReceipt = async (receiptId: number, receiptNumber: string) => {
    try {
      const response = await receiptService.sendReceiptEmail(receiptId);
      toast({
        title: 'Success',
        description: `Receipt ${receiptNumber} sent successfully to ${response.emailAddress}`
      });
    } catch (error) {
      console.error('Failed to send receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to send receipt email',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateStatus = async (receiptId: number, newStatus: ReceiptStatus) => {
    try {
      await receiptService.updateReceiptStatus(receiptId, newStatus);
      toast({
        title: 'Success',
        description: 'Receipt status updated successfully'
      });
      loadReceipts(); // Reload data
    } catch (error) {
      console.error('Failed to update receipt status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update receipt status',
        variant: 'destructive'
      });
    }
  };

  const getStatusIcon = (status: ReceiptStatus) => {
    switch (status) {
      case ReceiptStatus.PAID:
        return <CheckCircle className="w-4 h-4" />;
      case ReceiptStatus.GENERATED:
        return <FileText className="w-4 h-4" />;
      case ReceiptStatus.CANCELLED:
        return <XCircle className="w-4 h-4" />;
      case ReceiptStatus.DRAFT:
        return <Clock className="w-4 h-4" />;
      default:
        return <FileX className="w-4 h-4" />;
    }
  };

  const filteredReceipts = receipts.filter(receipt => {
    const matchesSearch = 
      receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      receipt.courtName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('admin.pages.receiptManagement.title')}</h2>
          <p className="text-gray-600">{t('admin.pages.receiptManagement.subtitle')}</p>
        </div>
        <Button onClick={loadReceipts} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {t('admin.common.refresh')}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Total Receipts"
          value={totalElements}
          icon={Receipt}
          color="bg-blue-500"
        />
        <StatCard
          title="Paid"
          value={receipts.filter(r => r.status === ReceiptStatus.PAID).length}
          icon={CheckCircle}
          color="bg-green-500"
        />
        <StatCard
          title="Generated"
          value={receipts.filter(r => r.status === ReceiptStatus.GENERATED).length}
          icon={FileText}
          color="bg-yellow-500"
        />
        <StatCard
          title="Cancelled"
          value={receipts.filter(r => r.status === ReceiptStatus.CANCELLED).length}
          icon={XCircle}
          color="bg-red-500"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as ReceiptStatus | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Statuses</SelectItem>
                  <SelectItem value={ReceiptStatus.PAID}>Paid</SelectItem>
                  <SelectItem value={ReceiptStatus.GENERATED}>Generated</SelectItem>
                  <SelectItem value={ReceiptStatus.CANCELLED}>Cancelled</SelectItem>
                  <SelectItem value={ReceiptStatus.DRAFT}>Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as ReceiptType | 'ALL')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value={ReceiptType.BOOKING_RECEIPT}>Booking Receipt</SelectItem>
                  <SelectItem value={ReceiptType.MANUAL_RECEIPT}>Manual Receipt</SelectItem>
                  <SelectItem value={ReceiptType.REFUND_RECEIPT}>Refund Receipt</SelectItem>
                  <SelectItem value={ReceiptType.CANCELLATION_RECEIPT}>Cancellation Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Receipts ({filteredReceipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading receipts...</span>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">No receipts found</h3>
              <p className="text-sm text-muted-foreground">No receipts match your current filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt #</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        {receipt.receiptNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{receipt.userName}</div>
                          <div className="text-sm text-muted-foreground">{receipt.userEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>{receipt.courtName}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{receipt.bookingDate}</div>
                          <div className="text-sm text-muted-foreground">
                            {receipt.startTime} - {receipt.endTime}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <CurrencyDisplay amount={receipt.totalAmount} size="sm" showSymbol />
                      </TableCell>
                      <TableCell>
                        <Badge className={receiptService.getStatusColor(receipt.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(receipt.status)}
                            <span>{receipt.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={receiptService.getTypeColor(receipt.type)}>
                          {receipt.type.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem 
                              onClick={() => handleDownloadReceipt(receipt.id, receipt.receiptNumber)}
                            >
                              <Download className="w-4 h-4 mr-2" />
                              Download PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleEmailReceipt(receipt.id, receipt.receiptNumber)}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {receipt.status !== ReceiptStatus.PAID && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(receipt.id, ReceiptStatus.PAID)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark as Paid
                              </DropdownMenuItem>
                            )}
                            {receipt.status !== ReceiptStatus.CANCELLED && (
                              <DropdownMenuItem 
                                onClick={() => handleUpdateStatus(receipt.id, ReceiptStatus.CANCELLED)}
                                className="text-red-600"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Cancel Receipt
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredReceipts.length} of {totalElements} receipts
              </p>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReceiptManagement;