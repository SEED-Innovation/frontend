import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  DollarSign,
  Users,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ReportData } from '@/types/admin';
import { toast } from 'sonner';

// Mock report data
const mockReportData: ReportData = {
  monthlyRevenue: [
    { month: 'Jan', revenue: 12500, bookings: 45 },
    { month: 'Feb', revenue: 15200, bookings: 52 },
    { month: 'Mar', revenue: 18900, bookings: 68 },
    { month: 'Apr', revenue: 21300, bookings: 73 },
    { month: 'May', revenue: 19800, bookings: 65 },
    { month: 'Jun', revenue: 23400, bookings: 82 }
  ],
  peakUsageTimes: [
    { hour: 8, bookings: 12 },
    { hour: 9, bookings: 18 },
    { hour: 10, bookings: 25 },
    { hour: 11, bookings: 22 },
    { hour: 14, bookings: 28 },
    { hour: 15, bookings: 32 },
    { hour: 16, bookings: 35 },
    { hour: 17, bookings: 38 },
    { hour: 18, bookings: 42 },
    { hour: 19, bookings: 45 },
    { hour: 20, bookings: 39 }
  ],
  topCourts: [
    { courtName: 'Court A', revenue: 45200, bookings: 152 },
    { courtName: 'Court B', revenue: 38900, bookings: 128 },
    { courtName: 'Court C', revenue: 31700, bookings: 105 },
    { courtName: 'Court D', revenue: 28400, bookings: 94 }
  ],
  paymentMethodStats: [
    { method: 'Card', count: 245, percentage: 65 },
    { method: 'Wallet', count: 98, percentage: 26 },
    { method: 'Bank Transfer', count: 34, percentage: 9 }
  ]
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const ReportsAnalytics = () => {
  const [reportData] = useState<ReportData>(mockReportData);
  const [selectedPeriod, setSelectedPeriod] = useState('6months');

  const handleExportPDF = () => {
    toast.success('Report exported as PDF');
  };

  const handleExportCSV = () => {
    toast.success('Report exported as CSV');
  };

  const totalRevenue = reportData.monthlyRevenue.reduce((sum, item) => sum + item.revenue, 0);
  const totalBookings = reportData.monthlyRevenue.reduce((sum, item) => sum + item.bookings, 0);
  const avgBookingValue = totalRevenue / totalBookings;
  const peakHour = reportData.peakUsageTimes.reduce((prev, current) => 
    prev.bookings > current.bookings ? prev : current
  );

  const summaryCards = [
    {
      title: 'Total Revenue',
      value: `${totalRevenue.toLocaleString()} SAR`,
      icon: DollarSign,
      color: 'text-green-600',
      change: '+12.5%'
    },
    {
      title: 'Total Bookings',
      value: totalBookings.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      change: '+8.3%'
    },
    {
      title: 'Avg Booking Value',
      value: `${Math.round(avgBookingValue)} SAR`,
      icon: TrendingUp,
      color: 'text-purple-600',
      change: '+4.1%'
    },
    {
      title: 'Peak Hour',
      value: `${peakHour.hour}:00 - ${peakHour.hour + 1}:00`,
      icon: Clock,
      color: 'text-orange-600',
      change: `${peakHour.bookings} bookings`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive court performance analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1month">Last Month</SelectItem>
              <SelectItem value="3months">Last 3 Months</SelectItem>
              <SelectItem value="6months">Last 6 Months</SelectItem>
              <SelectItem value="1year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleExportPDF} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
          <Button onClick={handleExportCSV}>
            <Download className="w-4 h-4 mr-2" />
            CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card, index) => (
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
                    <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                    <p className="text-sm text-green-600 mt-1">{card.change}</p>
                  </div>
                  <card.icon className={`w-8 h-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Monthly Revenue & Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue (SAR)" />
                <Bar yAxisId="right" dataKey="bookings" fill="#10B981" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Peak Usage Times */}
        <Card>
          <CardHeader>
            <CardTitle>Peak Usage Times</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={reportData.peakUsageTimes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" tickFormatter={(hour) => `${hour}:00`} />
                <YAxis />
                <Tooltip labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`} />
                <Line type="monotone" dataKey="bookings" stroke="#8B5CF6" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={reportData.paymentMethodStats}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ method, percentage }) => `${method} (${percentage}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {reportData.paymentMethodStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Courts Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Courts Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reportData.topCourts.map((court, index) => (
              <div key={court.courtName} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-blue-600">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{court.courtName}</p>
                    <p className="text-sm text-gray-500">{court.bookings} bookings</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">{court.revenue.toLocaleString()} SAR</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsAnalytics;