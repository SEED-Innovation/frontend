
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminNavigation from '@/components/admin/AdminNavigation';
import SessionMonitoring from '@/components/admin/SessionMonitoring';
import SystemMetrics from '@/components/admin/SystemMetrics';
import ClubManagement from '@/components/admin/ClubManagement';
import CourtInstallations from '@/components/admin/CourtInstallations';
import { Activity, Users, Camera, AlertTriangle } from 'lucide-react';

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
            <p className="text-gray-600">Monitor sessions, manage installations, and track system performance</p>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Session Monitoring</TabsTrigger>
              <TabsTrigger value="metrics">System Metrics</TabsTrigger>
              <TabsTrigger value="clubs">Club Management</TabsTrigger>
              <TabsTrigger value="courts">Court Installations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SessionMonitoring />
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <SystemMetrics />
            </TabsContent>

            <TabsContent value="clubs" className="space-y-6">
              <ClubManagement />
            </TabsContent>

            <TabsContent value="courts" className="space-y-6">
              <CourtInstallations />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
