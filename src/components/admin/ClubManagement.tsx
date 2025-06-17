
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Users, Camera, MapPin, Plus, Settings, Eye } from 'lucide-react';
import { toast } from 'sonner';

const ClubManagement = () => {
  const [selectedClub, setSelectedClub] = useState<any>(null);

  // Mock club data
  const clubs = [
    {
      id: 'club_001',
      name: 'Riverside Tennis Club',
      location: '123 River Road, Downtown',
      status: 'active',
      courts: 8,
      activeCourts: 7,
      members: 245,
      subscription: 'premium',
      lastActivity: '2 hours ago',
      monthlyUsage: 1247
    },
    {
      id: 'club_002',
      name: 'Elite Tennis Academy',
      location: '789 Tennis Avenue, Uptown',
      status: 'active',
      courts: 12,
      activeCourts: 12,
      members: 389,
      subscription: 'enterprise',
      lastActivity: '5 minutes ago',
      monthlyUsage: 2156
    },
    {
      id: 'club_003',
      name: 'Grand Slam Center',
      location: '456 Championship Blvd, Midtown',
      status: 'maintenance',
      courts: 6,
      activeCourts: 4,
      members: 178,
      subscription: 'basic',
      lastActivity: '1 day ago',
      monthlyUsage: 567
    }
  ];

  const handleViewClub = (club: any) => {
    setSelectedClub(club);
    toast.info(`Viewing club: ${club.name}`);
  };

  const handleToggleStatus = (clubId: string) => {
    toast.success(`Updated status for club ${clubId}`);
  };

  const handleAddClub = () => {
    toast.info('Opening add club dialog...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-tennis-green-100 text-tennis-green-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      case 'inactive': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'enterprise': return 'bg-tennis-purple-100 text-tennis-purple-700';
      case 'premium': return 'bg-blue-100 text-blue-700';
      case 'basic': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Club Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Club Management</h2>
          <p className="text-gray-600">Manage tennis clubs and their access</p>
        </div>
        <Button onClick={handleAddClub} className="tennis-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Club
        </Button>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clubs.map((club) => (
          <Card key={club.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="w-8 h-8 text-tennis-purple-600" />
                  <div>
                    <CardTitle className="text-lg">{club.name}</CardTitle>
                    <div className="flex items-center text-sm text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      {club.location}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(club.status)}>
                    {club.status}
                  </Badge>
                  <Badge className={getSubscriptionColor(club.subscription)}>
                    {club.subscription}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Camera className="w-4 h-4 text-gray-500 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{club.activeCourts}/{club.courts}</p>
                  <p className="text-xs text-gray-600">Active Courts</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users className="w-4 h-4 text-gray-500 mr-1" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{club.members}</p>
                  <p className="text-xs text-gray-600">Members</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{club.monthlyUsage}</p>
                  <p className="text-xs text-gray-600">Monthly Sessions</p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="text-sm text-gray-600">
                Last activity: {club.lastActivity}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewClub(club)}
                  className="flex-1"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleStatus(club.id)}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Club Details (if any) */}
      {selectedClub && (
        <Card className="border-tennis-purple-200 bg-tennis-purple-50">
          <CardHeader>
            <CardTitle className="text-tennis-purple-800">
              {selectedClub.name} - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2">Club Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">ID:</span> {selectedClub.id}</p>
                  <p><span className="font-medium">Status:</span> {selectedClub.status}</p>
                  <p><span className="font-medium">Subscription:</span> {selectedClub.subscription}</p>
                  <p><span className="font-medium">Location:</span> {selectedClub.location}</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Statistics</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Total Courts:</span> {selectedClub.courts}</p>
                  <p><span className="font-medium">Active Courts:</span> {selectedClub.activeCourts}</p>
                  <p><span className="font-medium">Members:</span> {selectedClub.members}</p>
                  <p><span className="font-medium">Monthly Sessions:</span> {selectedClub.monthlyUsage}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClubManagement;
