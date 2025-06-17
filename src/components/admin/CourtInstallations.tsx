
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Wifi, AlertTriangle, CheckCircle, Settings, Plus, Wrench } from 'lucide-react';
import { toast } from 'sonner';

const CourtInstallations = () => {
  const [selectedCourt, setSelectedCourt] = useState<any>(null);

  // Mock court installation data
  const installations = [
    {
      id: 'court_001',
      name: 'Riverside Tennis Club - Court 1',
      clubName: 'Riverside Tennis Club',
      status: 'online',
      cameraStatus: 'active',
      connectionStatus: 'strong',
      lastMaintenance: '2024-05-15',
      installDate: '2024-01-10',
      firmwareVersion: '2.3.1',
      signalStrength: 95,
      sessionsToday: 8,
      issueCount: 0
    },
    {
      id: 'court_002',
      name: 'Elite Tennis Academy - Court 3',
      clubName: 'Elite Tennis Academy',
      status: 'online',
      cameraStatus: 'active',
      connectionStatus: 'strong',
      lastMaintenance: '2024-05-20',
      installDate: '2024-02-05',
      firmwareVersion: '2.3.1',
      signalStrength: 88,
      sessionsToday: 12,
      issueCount: 0
    },
    {
      id: 'court_003',
      name: 'Grand Slam Center - Court 2',
      clubName: 'Grand Slam Center',
      status: 'maintenance',
      cameraStatus: 'offline',
      connectionStatus: 'weak',
      lastMaintenance: '2024-04-30',
      installDate: '2023-11-15',
      firmwareVersion: '2.2.8',
      signalStrength: 42,
      sessionsToday: 0,
      issueCount: 3
    }
  ];

  const handleViewCourt = (court: any) => {
    setSelectedCourt(court);
    toast.info(`Viewing court: ${court.name}`);
  };

  const handleMaintenanceMode = (courtId: string) => {
    toast.success(`Toggled maintenance mode for ${courtId}`);
  };

  const handleFirmwareUpdate = (courtId: string) => {
    toast.info(`Starting firmware update for ${courtId}...`);
  };

  const handleAddInstallation = () => {
    toast.info('Opening add installation dialog...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-tennis-green-100 text-tennis-green-700';
      case 'offline': return 'bg-red-100 text-red-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConnectionColor = (connection: string) => {
    switch (connection) {
      case 'strong': return 'text-tennis-green-600';
      case 'medium': return 'text-yellow-600';
      case 'weak': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Add Installation Button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Court Installations</h2>
          <p className="text-gray-600">Monitor and manage court camera installations</p>
        </div>
        <Button onClick={handleAddInstallation} className="tennis-button">
          <Plus className="w-4 h-4 mr-2" />
          Add Installation
        </Button>
      </div>

      {/* Installations Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {installations.map((court) => (
          <Card key={court.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Camera className="w-8 h-8 text-tennis-purple-600" />
                  <div>
                    <CardTitle className="text-lg">{court.name}</CardTitle>
                    <p className="text-sm text-gray-600">{court.clubName}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge className={getStatusColor(court.status)}>
                    {court.status}
                  </Badge>
                  {court.issueCount > 0 && (
                    <Badge className="bg-red-100 text-red-700">
                      {court.issueCount} issues
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Status Indicators */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Camera</span>
                  <div className="flex items-center">
                    {court.cameraStatus === 'active' ? (
                      <CheckCircle className="w-4 h-4 text-tennis-green-600 mr-1" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-red-600 mr-1" />
                    )}
                    <span className="text-sm font-medium">{court.cameraStatus}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Connection</span>
                  <div className="flex items-center">
                    <Wifi className={`w-4 h-4 mr-1 ${getConnectionColor(court.connectionStatus)}`} />
                    <span className="text-sm font-medium">{court.signalStrength}%</span>
                  </div>
                </div>
              </div>

              {/* Technical Details */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Firmware:</span>
                  <span className="font-medium">{court.firmwareVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Install Date:</span>
                  <span className="font-medium">{court.installDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Maintenance:</span>
                  <span className="font-medium">{court.lastMaintenance}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sessions Today:</span>
                  <span className="font-medium">{court.sessionsToday}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleViewCourt(court)}
                  className="flex-1"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleMaintenanceMode(court.id)}
                  className="flex-1"
                >
                  <Wrench className="w-4 h-4 mr-2" />
                  Maintenance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Court Details */}
      {selectedCourt && (
        <Card className="border-tennis-purple-200 bg-tennis-purple-50">
          <CardHeader>
            <CardTitle className="text-tennis-purple-800">
              {selectedCourt.name} - Configuration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-semibold mb-2">System Information</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Court ID:</span> {selectedCourt.id}</p>
                  <p><span className="font-medium">Status:</span> {selectedCourt.status}</p>
                  <p><span className="font-medium">Firmware:</span> {selectedCourt.firmwareVersion}</p>
                  <p><span className="font-medium">Signal:</span> {selectedCourt.signalStrength}%</p>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Maintenance</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Install Date:</span> {selectedCourt.installDate}</p>
                  <p><span className="font-medium">Last Service:</span> {selectedCourt.lastMaintenance}</p>
                  <p><span className="font-medium">Issues:</span> {selectedCourt.issueCount}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleFirmwareUpdate(selectedCourt.id)}
                  className="mt-3 w-full"
                  variant="outline"
                >
                  Update Firmware
                </Button>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Usage Stats</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Today:</span> {selectedCourt.sessionsToday} sessions</p>
                  <p><span className="font-medium">Camera Status:</span> {selectedCourt.cameraStatus}</p>
                  <p><span className="font-medium">Connection:</span> {selectedCourt.connectionStatus}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CourtInstallations;
