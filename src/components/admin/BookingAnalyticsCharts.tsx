import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { TrendingUp, DollarSign, PieChart as PieChartIcon, BarChart3, Activity } from 'lucide-react';
import { CurrencyDisplay } from '@/components/ui/currency-display';

interface BookingAnalyticsChartsProps {
  stats: any;
  bookings: any[];
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--admin-accent))', 'hsl(var(--status-warning))', 'hsl(var(--status-error))'];

const BookingAnalyticsCharts: React.FC<BookingAnalyticsChartsProps> = ({ stats, bookings }) => {
  // Transform booking data for charts
  const getBookingStatusData = () => {
    return [
      { name: 'Confirmed', value: stats?.confirmedBookings || 0, color: 'hsl(var(--status-success))' },
      { name: 'Pending', value: stats?.pendingBookings || 0, color: 'hsl(var(--status-warning))' },
      { name: 'Cancelled', value: stats?.cancelledBookings || 0, color: 'hsl(var(--status-error))' },
    ].filter(item => item.value > 0);
  };

  // Get court booking distribution
  const getCourtUsageData = () => {
    const courtStats = bookings.reduce((acc: any, booking: any) => {
      const courtName = booking.court?.name || 'Unknown Court';
      if (!acc[courtName]) {
        acc[courtName] = { bookings: 0, revenue: 0 };
      }
      acc[courtName].bookings += 1;
      acc[courtName].revenue += booking.amount || 0;
      return acc;
    }, {});

    return Object.entries(courtStats).map(([name, data]: [string, any]) => ({
      name,
      bookings: data.bookings,
      revenue: data.revenue,
    })).slice(0, 5); // Top 5 courts
  };

  // Get monthly revenue trend (mock data based on current stats)
  const getRevenueTrend = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentRevenue = stats?.totalRevenue || 0;
    
    return months.map((month, index) => ({
      month,
      revenue: Math.round((currentRevenue / 6) * (0.7 + Math.random() * 0.6)),
      bookings: Math.round((bookings.length / 6) * (0.8 + Math.random() * 0.4)),
    }));
  };

  const statusData = getBookingStatusData();
  const courtUsageData = getCourtUsageData();
  const revenueTrendData = getRevenueTrend();

  return (
    <div className="space-y-8">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold text-foreground">{stats?.totalBookings || 0}</p>
              </div>
              <div className="p-3 bg-primary/20 rounded-xl">
                <Activity className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-status-success/5 to-status-success/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Confirmed</p>
                <p className="text-3xl font-bold text-status-success">{stats?.confirmedBookings || 0}</p>
              </div>
              <div className="p-3 bg-status-success/20 rounded-xl">
                <TrendingUp className="w-6 h-6 text-status-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-status-warning/5 to-status-warning/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-3xl font-bold text-status-warning">{stats?.pendingBookings || 0}</p>
              </div>
              <div className="p-3 bg-status-warning/20 rounded-xl">
                <BarChart3 className="w-6 h-6 text-status-warning" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-admin-accent/5 to-admin-accent/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <div className="text-2xl font-bold text-foreground">
                  <CurrencyDisplay amount={stats?.totalRevenue || 0} size="lg" />
                </div>
              </div>
              <div className="p-3 bg-admin-accent/20 rounded-xl">
                <DollarSign className="w-6 h-6 text-admin-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid - 2 Equal Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Court Usage Statistics */}
        <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold">
              <BarChart3 className="w-6 h-6 mr-3 text-admin-accent" />
              Top Courts by Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courtUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="bookings" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="border-0 shadow-xl bg-card/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center text-xl font-bold">
              <TrendingUp className="w-6 h-6 mr-3 text-status-success" />
              Revenue & Booking Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="revenue"
                    orientation="left"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    yAxisId="bookings"
                    orientation="right"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: any, name: string) => [
                      name === 'revenue' ? `${value} SAR` : value,
                      name === 'revenue' ? 'Revenue' : 'Bookings'
                    ]}
                  />
                  <Legend />
                  <Line 
                    yAxisId="revenue"
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="hsl(var(--admin-accent))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--admin-accent))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    yAxisId="bookings"
                    type="monotone" 
                    dataKey="bookings" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingAnalyticsCharts;