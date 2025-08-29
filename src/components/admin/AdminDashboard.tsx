import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  AlertTriangle,
  Activity,
  MapPin
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { bookingService } from '@/services/bookingService';
import { userService } from '@/services/userService';

const AdminDashboard = () => {
  const { user, hasPermission } = useAdminAuth();
  
  // State for real data
  const [recentBookings, setRecentBookings] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    todayBookings: 0,
    activeCourts: 12,
    totalUsers: 0,
    pendingPayments: 0,
    pendingBookings: 0,
    monthlyGrowth: 12.5
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load real data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('🔄 AdminDashboard: Loading real dashboard data...');
        
        // Load recent bookings (last 10) with proper sorting
        const bookingsResponse = await bookingService.getAdminBookings({
          page: 0,
          size: 10,
          sortBy: 'startTime',
          sortDirection: 'DESC'
        });
        
        console.log('📊 AdminDashboard: Raw bookings response:', bookingsResponse);
        
        // Load stats
        const statsResponse = await bookingService.getBookingStats();
        console.log('📈 AdminDashboard: Raw stats response:', statsResponse);
        
        // Load users count
        const usersResponse = await userService.getAllUsers();
        console.log('👥 AdminDashboard: Raw users response:', usersResponse);
        
        // Format recent bookings for display
        const bookings = Array.isArray(bookingsResponse) ? bookingsResponse : (bookingsResponse?.content || []);
        console.log('📋 AdminDashboard: Extracted bookings array:', bookings);
        console.log('📋 AdminDashboard: Bookings array length:', bookings.length);
        
        // Sort by startTime descending to show newest first
        const sortedBookings = bookings.sort((a, b) => 
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
        
        const formattedBookings = sortedBookings.slice(0, 5).map(booking => ({
          id: booking.id,
          court: booking.court?.name || 'Unknown Court',
          player: booking.user?.fullName || booking.user?.name || 'Unknown User',
          time: new Date(booking.startTime).toLocaleString('en-US', { 
            month: 'numeric',
            day: 'numeric', 
            year: 'numeric',
            hour: '2-digit', 
            minute: '2-digit'
          }),
          status: booking.status?.toUpperCase() || 'UNKNOWN'
        }));
        
        console.log('🎯 AdminDashboard: Formatted bookings for UI:', formattedBookings);
        console.log('🎯 AdminDashboard: Setting recent bookings array with length:', formattedBookings.length);
        
        // Update state with real data
        setRecentBookings(formattedBookings);
        setDashboardStats({
          totalRevenue: statsResponse.totalRevenue || 0,
          todayBookings: bookings.length || 0,
          activeCourts: 12, // Keep static for now
          totalUsers: usersResponse?.length || 0,
          pendingPayments: statsResponse.pendingBookings || 0,
          pendingBookings: statsResponse.pendingBookings || 0,
          monthlyGrowth: 12.5 // Keep static for now
        });
        
        console.log('✅ AdminDashboard: Dashboard data updated successfully');
        console.log('✅ AdminDashboard: Final recent bookings state:', formattedBookings);
        
      } catch (error) {
        console.error('❌ AdminDashboard: Failed to load dashboard data:', error);
        // Keep default/mock data on error
      } finally {
        console.log('🏁 AdminDashboard: Loading completed, setting isLoading to false');
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);
  
  // Debug current state
  console.log('🔍 AdminDashboard: Current render state:', {
    recentBookings,
    recentBookingsLength: recentBookings.length,
    isLoading,
    dashboardStats
  });

  const courtStatus = [
    { name: 'Court A', status: 'active', bookings: 8, revenue: 2400 },
    { name: 'Court B', status: 'active', bookings: 6, revenue: 1800 },
    { name: 'Court C', status: 'maintenance', bookings: 0, revenue: 0 },
    { name: 'Court D', status: 'active', bookings: 4, revenue: 1200 },
  ];

  const StatCard = ({ title, value, change, icon: Icon, color }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="premium-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <p className={`text-sm ${change > 0 ? 'text-green-600' : 'text-red-600'} flex items-center mt-1`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {change > 0 ? '+' : ''}{change}%
                </p>
              )}
            </div>
            <div className={`p-3 rounded-full ${color}`}>
              <Icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-2">
          {hasPermission('SUPER_ADMIN') 
            ? 'Manage all tennis facilities and monitor system performance'
            : 'Manage your assigned courts and bookings'
          }
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${dashboardStats.totalRevenue.toLocaleString()}`}
          change={dashboardStats.monthlyGrowth}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Recent Bookings"
          value={dashboardStats.todayBookings}
          change={8.2}
          icon={Calendar}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Courts"
          value={dashboardStats.activeCourts}
          icon={MapPin}
          color="bg-purple-500"
        />
        <StatCard
          title="Total Users"
          value={dashboardStats.totalUsers.toLocaleString()}
          change={3.4}
          icon={Users}
          color="bg-orange-500"
        />
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Recent Activity - Live Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading recent bookings...</span>
                </div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Recent Activity</h3>
                  <p className="text-sm text-muted-foreground">No bookings found in the database yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {booking.court.split(' ')[1]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{booking.player}</p>
                        <p className="text-sm text-gray-500">{booking.court} • {booking.time}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.status}
                    </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Court Status */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Court Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {courtStatus.map((court, index) => (
                  <motion.div
                    key={court.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        court.status === 'active' ? 'bg-green-500' :
                        court.status === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="font-medium">{court.name}</p>
                        <p className="text-sm text-gray-500">
                          {court.bookings} bookings today
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${court.revenue}</p>
                      <p className="text-sm text-gray-500">revenue</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Alerts & Notifications */}
      {dashboardStats.pendingPayments > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium text-orange-900">
                    {dashboardStats.pendingPayments} Pending Payments
                  </h4>
                  <p className="text-sm text-orange-700">
                    Review and process pending payments in the Payments section
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;