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
  Calendar,
  DollarSign,
  Receipt,
  CheckCircle,
  Clock,
  XCircle,
  FileX
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { receiptService } from '@/services';
import { ReceiptResponse, ReceiptStatus } from '@/types/receipt';
import { CurrencyDisplay } from '@/components/ui/currency-display';

const PlayerReceipts: React.FC = () => {
  const { t } = useTranslation('web');
  const [receipts, setReceipts] = useState<ReceiptResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  
  const { toast } = useToast();

  useEffect(() => {
    loadMyReceipts();
  }, [currentPage]);

  const loadMyReceipts = async () => {
    try {
      setLoading(true);
      const response = await receiptService.getMyReceipts(currentPage, 20);
      setReceipts(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to load receipts:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your receipts',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReceipt = async (receiptId: number, receiptNumber: string) => {
    try {
      const blob = await receiptService.downloadMyReceiptPDF(receiptId);
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

  const handleEmailReceiptToMe = async (receiptId: number, receiptNumber: string) => {
    try {
      const response = await receiptService.emailReceiptToMe(receiptId);
      toast({
        title: 'Success',
        description: `Receipt ${receiptNumber} sent to your email: ${response.emailAddress}`
      });
    } catch (error) {
      console.error('Failed to send receipt:', error);
      toast({
        title: 'Error',
        description: 'Failed to send receipt to your email',
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

  const filteredReceipts = receipts.filter(receipt => 
    receipt.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receipt.courtName.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const totalPaid = receipts
    .filter(r => r.status === ReceiptStatus.PAID)
    .reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{t('receipts.title')}</h2>
          <p className="text-gray-600">{t('receipts.subtitle')}</p>
        </div>
        <Button onClick={loadMyReceipts} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Receipts"
          value={totalElements}
          icon={Receipt}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Paid"
          value={<CurrencyDisplay amount={totalPaid} size="lg" showSymbol />}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="This Month"
          value={receipts.filter(r => {
            const receiptDate = new Date(r.generatedAt);
            const now = new Date();
            return receiptDate.getMonth() === now.getMonth() && receiptDate.getFullYear() === now.getFullYear();
          }).length}
          icon={Calendar}
          color="bg-purple-500"
        />
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Search className="w-5 h-5 mr-2" />
            Search Receipts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by receipt number or court..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Receipts ({filteredReceipts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">{t('receipts.loading')}</span>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">{t('receipts.noReceipts')}</h3>
              <p className="text-sm text-muted-foreground">{t('receipts.noReceiptsDesc')}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('receipts.receiptNumber')}</TableHead>
                    <TableHead>{t('receipts.court')}</TableHead>
                    <TableHead>{t('receipts.dateTime')}</TableHead>
                    <TableHead>{t('receipts.amount')}</TableHead>
                    <TableHead>{t('receipts.status')}</TableHead>
                    <TableHead>{t('receipts.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReceipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">
                        {receipt.receiptNumber}
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
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownloadReceipt(receipt.id, receipt.receiptNumber)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEmailReceiptToMe(receipt.id, receipt.receiptNumber)}
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            Email Me
                          </Button>
                        </div>
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

export default PlayerReceipts;