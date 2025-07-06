import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Download, 
  Filter, 
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
import { PaymentTransaction } from '@/types/admin';
import { toast } from 'sonner';

// Mock payment data
const mockPayments: PaymentTransaction[] = [
  {
    id: '1',
    reference: 'TAP-2024-001',
    playerName: 'Ahmed Al-Rashid',
    playerEmail: 'ahmed@example.com',
    amount: 150,
    currency: 'SAR',
    status: 'paid',
    method: 'card',
    tapReference: 'ch_TS02A0220231058XgB00123456',
    courtName: 'Court A',
    bookingDate: '2024-01-15T10:00:00Z',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T10:05:00Z'
  },
  {
    id: '2',
    reference: 'TAP-2024-002',
    playerName: 'Sarah Mohammed',
    playerEmail: 'sarah@example.com',
    amount: 200,
    currency: 'SAR',
    status: 'pending',
    method: 'wallet',
    tapReference: 'ch_TS02A0220231058XgB00123457',
    courtName: 'Court B',
    bookingDate: '2024-01-15T14:00:00Z',
    createdAt: '2024-01-15T13:45:00Z',
    updatedAt: '2024-01-15T13:45:00Z'
  },
  {
    id: '3',
    reference: 'TAP-2024-003',
    playerName: 'Omar Abdullah',
    playerEmail: 'omar@example.com',
    amount: 175,
    currency: 'SAR',
    status: 'failed',
    method: 'card',
    tapReference: 'ch_TS02A0220231058XgB00123458',
    courtName: 'Court C',
    bookingDate: '2024-01-15T16:00:00Z',
    createdAt: '2024-01-15T15:30:00Z',
    updatedAt: '2024-01-15T15:35:00Z'
  }
];

const PaymentManagement = () => {
  const [payments] = useState<PaymentTransaction[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  const filteredPayments = useMemo(() => {
    return payments.filter(payment => {
      const matchesSearch = payment.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          payment.playerEmail.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
      const matchesMethod = methodFilter === 'all' || payment.method === methodFilter;
      
      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [payments, searchTerm, statusFilter, methodFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      failed: 'bg-red-100 text-red-800 border-red-200'
    };
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const handleManualConfirm = (paymentId: string) => {
    toast.success('Payment manually confirmed');
  };

  const handleExportCSV = () => {
    const csvData = filteredPayments.map(payment => ({
      Reference: payment.reference,
      'Player Name': payment.playerName,
      'Player Email': payment.playerEmail,
      Amount: `${payment.amount} ${payment.currency}`,
      Status: payment.status,
      Method: payment.method,
      'TAP Reference': payment.tapReference || '',
      Court: payment.courtName,
      'Booking Date': new Date(payment.bookingDate).toLocaleDateString(),
      'Created At': new Date(payment.createdAt).toLocaleDateString()
    }));
    
    toast.success('Payment data exported to CSV');
  };

  const statsCards = [
    {
      title: 'Total Payments',
      value: payments.length,
      icon: CreditCard,
      color: 'text-blue-600'
    },
    {
      title: 'Paid',
      value: payments.filter(p => p.status === 'paid').length,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Pending',
      value: payments.filter(p => p.status === 'pending').length,
      icon: Clock,
      color: 'text-yellow-600'
    },
    {
      title: 'Failed',
      value: payments.filter(p => p.status === 'failed').length,
      icon: XCircle,
      color: 'text-red-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Management</h1>
          <p className="text-gray-600 mt-1">Monitor and manage all court booking payments</p>
        </div>
        <Button onClick={handleExportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="wallet">Wallet</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
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
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Court</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.reference}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.playerName}</p>
                        <p className="text-sm text-gray-500">{payment.playerEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold">{payment.amount} {payment.currency}</TableCell>
                    <TableCell>
                      <Badge className={`flex items-center gap-1 ${getStatusBadge(payment.status)}`}>
                        {getStatusIcon(payment.status)}
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="capitalize">{payment.method.replace('_', ' ')}</TableCell>
                    <TableCell>{payment.courtName}</TableCell>
                    <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {payment.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManualConfirm(payment.id)}
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;