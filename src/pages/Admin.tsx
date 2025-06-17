
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminNavigation from '@/components/admin/AdminNavigation';
import SessionMonitoring from '@/components/admin/SessionMonitoring';
import SystemMetrics from '@/components/admin/SystemMetrics';
import ClubManagement from '@/components/admin/ClubManagement';
import CourtInstallations from '@/components/admin/CourtInstallations';
import UserManagement from '@/components/admin/UserManagement';
import ContentManagement from '@/components/admin/ContentManagement';
import AdminBooking from '@/components/admin/AdminBooking';
import AdminSettings from '@/components/admin/AdminSettings';
import SystemAnalytics from '@/components/admin/SystemAnalytics';
import { Activity, Users, Camera, AlertTriangle, Settings, FileText, Calendar, BarChart3 } from 'lucide-react';

const Admin = () => {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock overview data
  const overviewStats = {
    liveSessions: 12,
    totalUsers: 2847,
    activeCourts: 156,
    systemIssues: 3
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
            <p className="text-gray-600">Complete administration system for tennis facility management</p>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-tennis-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Live Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.liveSessions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-tennis-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.totalUsers.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Camera className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Active Courts</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.activeCourts}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">System Issues</p>
                    <p className="text-2xl font-bold text-gray-900">{overviewStats.systemIssues}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Sessions</TabsTrigger>
              <TabsTrigger value="booking">Booking</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="clubs">Clubs</TabsTrigger>
              <TabsTrigger value="courts">Courts</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SessionMonitoring />
            </TabsContent>

            <TabsContent value="booking" className="space-y-6">
              <AdminBooking />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <SystemAnalytics />
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <SystemMetrics />
            </TabsContent>

            <TabsContent value="users" className="space-y-6">
              <UserManagement />
            </TabsContent>

            <TabsContent value="content" className="space-y-6">
              <ContentManagement />
            </TabsContent>

            <TabsContent value="clubs" className="space-y-6">
              <ClubManagement />
            </TabsContent>

            <TabsContent value="courts" className="space-y-6">
              <CourtInstallations />
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <AdminSettings />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
