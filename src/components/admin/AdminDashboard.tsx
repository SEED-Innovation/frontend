import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  DollarSign, 
  Clock,
  AlertTriangle,
  Activity,
  MapPin,
  BarChart3,
  Trophy,
  TrendingDown
} from 'lucide-react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { bookingService } from '@/services/bookingService';
import { userService } from '@/services/userService';
import { courtService } from '@/lib/api/services/courtService';

const AdminDashboard = () => {
  const { user, hasPermission } = useAdminAuth();
  
  // State for real data
  const [topPlayers, setTopPlayers] = useState([]);
  const [topCourts, setTopCourts] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    todayBookings: 0,
    activeCourts: 12,
    totalUsers: 0,
    pendingPayments: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    monthlyGrowth: 12.5
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load real data on component mount
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        console.log('🔄 AdminDashboard: Loading real dashboard data...');
        
        // Load booking stats and court data in parallel
        const [statsResponse, courtsResponse, usersResponse, bookingsResponse] = await Promise.all([
          bookingService.getBookingStats(),
          courtService.getAllCourts(),
          userService.getAllUsers(),
          bookingService.getAdminBookings({
            page: 0,
            size: 20,
            sortBy: 'startTime',
            sortDirection: 'DESC'
          })
        ]);
        
        console.log('📊 AdminDashboard: Raw responses:', { statsResponse, courtsResponse, usersResponse, bookingsResponse });
        
        // Extract bookings array
        const bookings = Array.isArray(bookingsResponse) ? bookingsResponse : ((bookingsResponse as any)?.bookings || (bookingsResponse as any)?.content || []);
        
        // Calculate top players by booking count
        const playerBookingCounts = bookings.reduce((acc, booking) => {
          const playerId = booking.user?.id;
          const playerName = booking.user?.name || booking.user?.email || 'Unknown Player';
          const playerEmail = booking.user?.email || '';
          const playerAvatar = booking.user?.profilePictureUrl || booking.user?.profilePicture || booking.user?.avatar || booking.user?.image || null;
          
          if (playerId && !acc[playerId]) {
            acc[playerId] = { 
              id: playerId,
              name: playerName, 
              email: playerEmail,
              bookings: 0, 
              totalSpent: 0,
              avatar: playerAvatar
            };
          }
          if (playerId) {
            acc[playerId].bookings += 1;
            acc[playerId].totalSpent += booking.payment?.amount || 0;
          }
          return acc;
        }, {});
        
        const topPlayersData = Object.values(playerBookingCounts)
          .sort((a: any, b: any) => b.bookings - a.bookings)
          .slice(0, 5);
        
        // Calculate court performance
        const courtBookingCounts = bookings.reduce((acc, booking) => {
          const courtName = booking.court?.name || 'Unknown Court';
          if (!acc[courtName]) {
            acc[courtName] = { bookings: 0, revenue: 0, court: booking.court };
          }
          acc[courtName].bookings += 1;
          acc[courtName].revenue += booking.payment?.amount || 0;
          return acc;
        }, {});
        
        const topPerformingCourts = Object.entries(courtBookingCounts)
          .map(([name, data]: [string, any]) => ({
            name,
            bookings: data.bookings,
            revenue: data.revenue,
            imageUrl: data.court?.imageUrl,
            status: data.bookings > 0 ? 'active' : 'low'
          }))
          .sort((a, b) => b.bookings - a.bookings)
          .slice(0, 6);
        
        // Update state with real data
        setTopPlayers(topPlayersData);
        setTopCourts(topPerformingCourts);
        setDashboardStats({
          totalRevenue: (statsResponse as any).totalRevenue || (statsResponse as any).confirmedRevenue || 0,
          todayBookings: (statsResponse as any).totalBookings || 0,
          activeCourts: courtsResponse?.length || 0,
          totalUsers: usersResponse?.length || 0,
          pendingPayments: (statsResponse as any).pendingBookings || 0,
          pendingBookings: (statsResponse as any).pendingBookings || 0,
          confirmedBookings: (statsResponse as any).confirmedBookings || 0,
          monthlyGrowth: 12.5 // Keep static for now
        });
        
        console.log('✅ AdminDashboard: Dashboard data updated successfully');
        
      } catch (error) {
        console.error('❌ AdminDashboard: Failed to load dashboard data:', error);
        // Keep default/mock data on error
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);
  

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
          value={<CurrencyDisplay amount={dashboardStats.totalRevenue} size="xl" showSymbol />}
          change={dashboardStats.monthlyGrowth}
          icon={DollarSign}
          color="bg-green-500"
        />
        <StatCard
          title="Total Bookings"
          value={dashboardStats.todayBookings}
          change={null}
          icon={Calendar}
          color="bg-blue-500"
        />
        <StatCard
          title="Approved"
          value={dashboardStats.confirmedBookings}
          change={null}
          icon={Activity}
          color="bg-green-500"
        />
        <StatCard
          title="Pending"
          value={dashboardStats.pendingBookings}
          change={null}
          icon={Clock}
          color="bg-yellow-500"
        />
      </div>

      {/* Top Players & Top Courts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Players */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Top Players by Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading players...</span>
                </div>
              ) : topPlayers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Player Data</h3>
                  <p className="text-sm text-muted-foreground">No players with bookings found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topPlayers.map((player: any, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Player Avatar */}
                      <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex-shrink-0">
                        {player.avatar ? (
                          <img 
                            src={player.avatar} 
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {/* Rank Badge */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* Player Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{player.name}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {player.email}
                        </p>
                      </div>
                      
                      {/* Stats */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-medium text-sm">
                          {player.bookings} bookings
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <CurrencyDisplay amount={player.totalSpent} size="sm" showSymbol />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Courts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="premium-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2" />
                Top Courts by Bookings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Loading courts...</span>
                </div>
              ) : topCourts.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">No Court Data</h3>
                  <p className="text-sm text-muted-foreground">No courts with bookings found.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topCourts.map((court, index) => (
                    <motion.div
                      key={court.name}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      {/* Court Image */}
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gradient-to-br from-primary to-primary/80 flex-shrink-0">
                        {court.imageUrl ? (
                          <img 
                            src={court.imageUrl} 
                            alt={court.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <MapPin className="w-6 h-6 text-white" />
                          </div>
                        )}
                        {/* Rank Badge */}
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center font-bold">
                          {index + 1}
                        </div>
                      </div>
                      
                      {/* Court Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{court.name}</p>
                        <p className="text-sm text-gray-500">
                          {court.bookings} bookings
                        </p>
                      </div>
                      
                      {/* Revenue & Status */}
                      <div className="text-right flex-shrink-0">
                        <div className="font-medium">
                          <CurrencyDisplay amount={court.revenue} size="sm" showSymbol />
                        </div>
                        <div className={`w-2 h-2 rounded-full mx-auto mt-1 ${
                          court.status === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                        }`} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
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