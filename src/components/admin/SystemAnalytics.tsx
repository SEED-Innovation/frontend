
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign, Clock, Calendar, Award, Target } from 'lucide-react';

const SystemAnalytics = () => {
  // Mock analytics data
  const analyticsData = {
    revenue: {
      today: 1245,
      thisWeek: 8760,
      thisMonth: 32450,
      growth: 12.5
    },
    bookings: {
      today: 28,
      thisWeek: 185,
      thisMonth: 742,
      cancelledRate: 5.2
    },
    users: {
      total: 2847,
      active: 1923,
      new: 156,
      retention: 87.3
    },
    courts: {
      utilization: 78.5,
      mostPopular: "Elite Court #1",
      peakHours: "18:00 - 20:00"
    }
  };

  const topPerformers = [
    { name: "John Smith", sessions: 45, revenue: 2875 },
    { name: "Sarah Johnson", sessions: 38, revenue: 2420 },
    { name: "Mike Davis", sessions: 32, revenue: 2040 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">System Analytics</h2>
        <Badge className="bg-green-100 text-green-800">Real-time Data</Badge>
      </div>

      {/* Revenue Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today's Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.revenue.today}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Weekly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.revenue.thisWeek.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="w-8 h-8 text-tennis-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${analyticsData.revenue.thisMonth.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <BarChart3 className="w-8 h-8 text-tennis-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Growth Rate</p>
                <p className="text-2xl font-bold text-green-600">+{analyticsData.revenue.growth}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Booking Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              Booking Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Today's Bookings</span>
                <span className="font-bold text-xl">{analyticsData.bookings.today}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Week</span>
                <span className="font-bold text-xl">{analyticsData.bookings.thisWeek}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-bold text-xl">{analyticsData.bookings.thisMonth}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-gray-600">Cancellation Rate</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {analyticsData.bookings.cancelledRate}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="w-5 h-5 mr-2 text-tennis-purple-600" />
              User Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Users</span>
                <span className="font-bold text-xl">{analyticsData.users.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active Users</span>
                <span className="font-bold text-xl">{analyticsData.users.active.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">New This Month</span>
                <span className="font-bold text-xl text-green-600">+{analyticsData.users.new}</span>
              </div>
              <div className="flex justify-between items-center border-t pt-3">
                <span className="text-gray-600">Retention Rate</span>
                <Badge className="bg-green-100 text-green-800">
                  {analyticsData.users.retention}%
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Court Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="w-5 h-5 mr-2 text-tennis-green-600" />
            Court Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-tennis-green-600 mb-2">
                {analyticsData.courts.utilization}%
              </div>
              <div className="text-sm text-gray-600">Overall Utilization</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 mb-2">
                {analyticsData.courts.mostPopular}
              </div>
              <div className="text-sm text-gray-600">Most Popular Court</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 mb-2">
                {analyticsData.courts.peakHours}
              </div>
              <div className="text-sm text-gray-600">Peak Hours</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Top Performing Customers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <Badge className="mr-3 w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <span className="font-medium">{performer.name}</span>
                </div>
                <div className="flex space-x-4 text-sm">
                  <span className="text-gray-600">{performer.sessions} sessions</span>
                  <span className="font-bold text-green-600">${performer.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemAnalytics;
