import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  Link,
  Unlink,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Monitor
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import {
  cameraService,
  type Court,
  type HikCentralCameraInfo
} from '@/services/cameraService';

export default function CameraManagement() {
  const { t } = useTranslation('admin');
  const [cameras, setCameras] = useState<HikCentralCameraInfo[]>([]);
  const [loading, setLoading] = useState(true);

  // HikCentral specific state
  const [hikCentralLoading, setHikCentralLoading] = useState(false);

  // Court association state
  const [isCourtSelectionDialogOpen, setIsCourtSelectionDialogOpen] = useState(false);
  const [isHikCentralCamerasOpen, setIsHikCentralCamerasOpen] = useState(false);
  const [associatingCamera, setAssociatingCamera] = useState<HikCentralCameraInfo | null>(null);
  const [availableCourts, setAvailableCourts] = useState<Court[]>([]);
  const [facilities, setFacilities] = useState<{ id: number; name: string }[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);

  const { toast } = useToast();



  // WebSocket connection for real-time updates - Disabled until server is available
  // useWebSocket({
  //   onCameraStatusUpdate: (updatedCamera: CameraType) => {
  //     setCameras(prev => prev.map(c => 
  //       c.id === updatedCamera.id ? updatedCamera : c
  //     ));

  //     // Show toast for status changes
  //     toast({
  //       title: "Camera status updated",
  //       description: `${updatedCamera.name} is now ${updatedCamera.status.toLowerCase()}`,
  //     });
  //   }
  // });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const camerasResponse = await cameraService.getAllCameras();
      setCameras(camerasResponse);
    } catch (error) {
      toast({
        title: "Error Loading Data",
        description: "Failed to load camera data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

















  // HikCentral handler functions
  const handleTestHikCentralConnectivity = async () => {
    try {
      setHikCentralLoading(true);
      const isConnected = await cameraService.testHikCentralConnectivity();
      
      toast({
        title: isConnected ? "HikCentral Connected" : "HikCentral Connection Failed",
        description: isConnected ? "Successfully connected to HikCentral API" : "Failed to connect to HikCentral API",
        variant: isConnected ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Connection Test Failed",
        description: error instanceof Error ? error.message : "Failed to test HikCentral connectivity",
        variant: "destructive"
      });
    } finally {
      setHikCentralLoading(false);
    }
  };

  const handleStartCourtAssociation = async (camera: HikCentralCameraInfo) => {
    try {
      setAssociatingCamera(camera);
      setSelectedFacility(null);
      setAvailableCourts([]);
      
      // Fetch facilities first
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/facilities/admin/my-facilities`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch facilities');
      }
      
      const facilitiesData = await response.json();
      const facilities = Array.isArray(facilitiesData) ? facilitiesData : (facilitiesData.content || []);
      setFacilities(facilities);
      
      setIsCourtSelectionDialogOpen(true);
    } catch (error) {
      toast({
        title: "Failed to Load Facilities",
        description: "Could not load available facilities",
        variant: "destructive"
      });
    }
  };

  const handleFacilitySelect = async (facilityId: number) => {
    try {
      setSelectedFacility(facilityId);
      
      // Fetch courts for the selected facility
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/facilities/${facilityId}/courts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch courts');
      }
      
      const courtsData = await response.json();
      const courts = Array.isArray(courtsData) ? courtsData : (courtsData.content || []);
      
      // Filter out courts that already have cameras
      const unassociatedCourts = courts.filter((court: Court) => {
        return !cameras.some(cam => cam.isAssociated && cam.associatedCourt?.id === court.id);
      });
      
      setAvailableCourts(unassociatedCourts);
    } catch (error) {
      toast({
        title: "Failed to Load Courts",
        description: "Could not load courts for this facility",
        variant: "destructive"
      });
    }
  };

  const handleAssociateWithCourt = async (court: Court) => {
    if (!associatingCamera) return;

    try {
      await cameraService.createAndAssociateHikCentralCamera(
        associatingCamera.cameraId, 
        court.id
      );

      toast({
        title: "Camera Associated",
        description: `${associatingCamera.cameraName} has been associated with ${court.name}`,
      });

      setIsCourtSelectionDialogOpen(false);
      setAssociatingCamera(null);
      loadData();
    } catch (error) {
      toast({
        title: "Association Failed",
        description: error instanceof Error ? error.message : "Failed to associate camera",
        variant: "destructive"
      });
    }
  };

  const handleDisassociateCamera = async (camera: HikCentralCameraInfo) => {
    try {
      await cameraService.disassociateHikCentralCamera(camera.cameraId);
      
      toast({
        title: "Camera Disassociated",
        description: `${camera.cameraName} has been disassociated`,
      });

      loadData();
    } catch (error) {
      toast({
        title: "Disassociation Failed",
        description: error instanceof Error ? error.message : "Failed to disassociate camera",
        variant: "destructive"
      });
    }
  };



  // Group HikCentral cameras by device
  const groupCamerasByDevice = (cameras: HikCentralCameraInfo[]) => {
    const grouped = cameras.reduce((acc, camera) => {
      const deviceKey = camera.deviceSerial;
      if (!acc[deviceKey]) {
        acc[deviceKey] = {
          deviceSerial: camera.deviceSerial,
          deviceCategory: camera.deviceCategory,
          cameras: []
        };
      }
      acc[deviceKey].cameras.push(camera);
      return acc;
    }, {} as Record<string, { deviceSerial: string; deviceCategory: string; cameras: HikCentralCameraInfo[] }>);

    return Object.values(grouped);
  };





  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }



  return (
    <div className="space-y-6">




      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Camera Management</h1>
          <p className="text-muted-foreground">
            Manage cameras from your HikCentral system
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handleTestHikCentralConnectivity} disabled={hikCentralLoading}>
            <Monitor className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button variant="outline" onClick={() => loadData()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.refreshCameras')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cameras.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Cameras</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cameras.filter(c => c.online).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently online</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Cameras</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cameras.filter(c => !c.online).length}</div>
            <p className="text-xs text-muted-foreground mt-1">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Associated</CardTitle>
            <Link className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cameras.filter(c => c.isAssociated).length}</div>
            <p className="text-xs text-muted-foreground mt-1">With courts</p>
          </CardContent>
        </Card>
      </div>

      {/* Cameras by Device */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Camera Devices</h2>
          <p className="text-muted-foreground">Cameras grouped by device</p>
        </div>
        
        {cameras.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cameras found</p>
              <p className="text-sm text-muted-foreground mt-2">Check your HikCentral connection</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {groupCamerasByDevice(cameras).map((deviceGroup) => (
              <Card key={deviceGroup.deviceSerial} className="overflow-hidden">
                {/* Device Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Monitor className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Device: {deviceGroup.deviceSerial}</h3>
                        <p className="text-sm text-muted-foreground">
                          {deviceGroup.deviceCategory} • {deviceGroup.cameras.length} camera(s)
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">
                        {deviceGroup.cameras.filter(c => c.online).length} online
                      </Badge>
                      <Badge variant="outline">
                        {deviceGroup.cameras.length} total
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Cameras List */}
                <CardContent className="p-0">
                  <div className="divide-y">
                    {deviceGroup.cameras.map((camera) => (
                      <div key={camera.cameraId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-4">
                          <Camera className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-base">{camera.cameraName}</div>
                            <div className="flex items-center space-x-3 text-sm text-muted-foreground mt-1">
                              <Badge variant="outline" className="text-xs">
                                Channel {camera.channelNo}
                              </Badge>
                              <span>•</span>
                              <span>{camera.areaName || 'Default Area'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          {/* Status Badge */}
                          {camera.online ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Online
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              Offline
                            </Badge>
                          )}

                          {/* Association Status */}
                          {camera.isAssociated && camera.associatedCourt ? (
                            <div className="flex items-center space-x-2">
                              <Badge variant="secondary" className="text-xs">
                                <Link className="w-3 h-3 mr-1" />
                                {camera.associatedCourt.name}
                              </Badge>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDisassociateCamera(camera)}
                                className="text-xs"
                              >
                                <Unlink className="w-3 h-3 mr-1" />
                                Disassociate
                              </Button>
                            </div>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartCourtAssociation(camera)}
                              className="text-xs"
                            >
                              <Link className="w-3 h-3 mr-1" />
                              Associate
                            </Button>
                          )}


                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>









      {/* Court Selection Dialog */}
      <Dialog open={isCourtSelectionDialogOpen} onOpenChange={setIsCourtSelectionDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Link className="w-5 h-5 text-blue-500" />
              <span>Associate Camera with Court</span>
            </DialogTitle>
            <DialogDescription>
              {!selectedFacility 
                ? `Select a facility first, then choose a court to associate ${associatingCamera?.cameraName} with.`
                : `Choose a court in the selected facility to associate ${associatingCamera?.cameraName} with.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Step 1: Select Facility */}
            {!selectedFacility ? (
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Select Facility</h3>
                {facilities.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No facilities available</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {facilities.map((facility) => (
                      <Button
                        key={facility.id}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => handleFacilitySelect(facility.id)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <span className="text-green-600 font-semibold">{facility.name.charAt(0)}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{facility.name}</div>
                            <div className="text-sm text-muted-foreground">{t('cameraManagement.clickToViewCourts')}</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Step 2: Select Court */
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium">Select Court</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedFacility(null);
                      setAvailableCourts([]);
                    }}
                  >
                    ← Back to Facilities
                  </Button>
                </div>
                {availableCourts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No unassociated courts available in this facility</p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {availableCourts.map((court) => (
                      <Button
                        key={court.id}
                        variant="outline"
                        className="justify-start h-auto p-4"
                        onClick={() => handleAssociateWithCourt(court)}
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">{court.name.charAt(0)}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium">{court.name}</div>
                            <div className="text-sm text-muted-foreground">Click to associate camera</div>
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>


    </div>
  );
}