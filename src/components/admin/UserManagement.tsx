
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, User, Crown, Shield, Ban, Mail, Phone } from 'lucide-react';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Mock user data
  const users = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+1234567890',
      plan: 'Premium',
      status: 'Active',
      joinDate: '2024-01-15',
      totalSessions: 45,
      rank: 12
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1234567891',
      plan: 'Basic',
      status: 'Active',
      joinDate: '2024-02-20',
      totalSessions: 28,
      rank: 23
    },
    {
      id: 3,
      name: 'Mike Davis',
      email: 'mike@example.com',
      phone: '+1234567892',
      plan: 'Free',
      status: 'Suspended',
      joinDate: '2024-03-10',
      totalSessions: 5,
      rank: 156
    }
  ];

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'Premium': return <Crown className="w-4 h-4" />;
      case 'Basic': return <User className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'Premium': return 'bg-yellow-100 text-yellow-800';
      case 'Basic': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <Button className="bg-tennis-green-600 hover:bg-tennis-green-700">
          Export Users
        </Button>
      </div>

      <Tabs defaultValue="all-users" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-users">All Users</TabsTrigger>
          <TabsTrigger value="premium-users">Premium Users</TabsTrigger>
          <TabsTrigger value="inactive-users">Inactive Users</TabsTrigger>
        </TabsList>

        <TabsContent value="all-users" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search users by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline">Filter</Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          <span>{user.email}</span>
                          <Phone className="w-3 h-3 ml-2" />
                          <span>{user.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">{user.totalSessions}</div>
                        <div className="text-xs text-gray-600">Sessions</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-medium text-gray-900">#{user.rank}</div>
                        <div className="text-xs text-gray-600">Rank</div>
                      </div>
                      <Badge className={`${getPlanColor(user.plan)} flex items-center space-x-1`}>
                        {getPlanIcon(user.plan)}
                        <span>{user.plan}</span>
                      </Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">View</Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Ban className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="premium-users">
          <Card>
            <CardHeader>
              <CardTitle>Premium Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Premium users management interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inactive-users">
          <Card>
            <CardHeader>
              <CardTitle>Inactive Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Inactive users management interface
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;
