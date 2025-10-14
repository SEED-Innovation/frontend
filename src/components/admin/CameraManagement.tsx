import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  WifiOff,
  Settings,
  Pause,
  Link,
  Unlink,
  Plus,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Loader2,
  Video,
  Square,
  Download,
  FileVideo,
  Clock,
  HardDrive
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

import {
  cameraService,
  type CameraSummary,
  type CreateCameraRequest,
  type UpdateCameraRequest,
  type Court,
  type Recording,
  type RecordingStatus as ApiRecordingStatus,
  type RecordingSummary,
  type CameraHealthSummary
} from '@/services/cameraService';
import { useCameraWebSocket } from '@/hooks/useCameraWebSocket';

import type { Camera as CameraType, CameraStatus } from '@/types/camera';
import { CourtSearchInput } from '@/components/admin/common/CourtSearchInput';
import { Court as CourtType } from '@/types/court';

export default function CameraManagement() {
  const [cameras, setCameras] = useState<CameraType[]>([]);
  const [summary, setSummary] = useState<CameraSummary>({
    totalCameras: 0,
    activeCameras: 0,
    offlineCameras: 0,
    associatedCourts: 0
  });
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
  const [isRecordingDialogOpen, setIsRecordingDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Partial<CameraType>>({});
  const [newCamera, setNewCamera] = useState<Partial<CreateCameraRequest>>({
    name: '',
    ipAddress: '',
    initialStatus: 'OFFLINE',
    port: 554,
    username: '',
    password: '',
    streamPath: '/Streaming/Channels/101',
    description: ''
  });
  const [associatingCamera, setAssociatingCamera] = useState<CameraType | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<CourtType | null>(null);
  const [recordingCamera, setRecordingCamera] = useState<CameraType | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<{ [key: string | number]: 'idle' | 'recording' | 'stopping' }>({});
  const [recordingSummary, setRecordingSummary] = useState<RecordingSummary | null>(null);
  const [healthSummary, setHealthSummary] = useState<CameraHealthSummary | null>(null);


  const { toast } = useToast();

  // WebSocket connection for real-time camera status updates
  useCameraWebSocket({
    onCameraStatusUpdate: (updatedCamera: CameraType) => {
      setCameras(prev => prev.map(c =>
        c.id === updatedCamera.id ? updatedCamera : c
      ));


      // Refresh summaries when camera status changes
      loadHealthSummary();
    },

    onConnectionChange: (connected: boolean) => {
      // Connection status no longer displayed
    }
  });

  // Load recording summary
  const loadRecordingSummary = async () => {
    try {
      const summary = await cameraService.getRecordingSummary();
      setRecordingSummary(summary);
    } catch (error) {
      console.error('Failed to load recording summary:', error);
    }
  };

  // Load health summary
  const loadHealthSummary = async () => {
    try {
      const summary = await cameraService.getHealthSummary();

      setHealthSummary(summary);
    } catch (error) {
      console.error('Failed to load health summary:', error);
    }
  };



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
    loadRecordingSummary();
    loadHealthSummary();
    // Load recording status for all cameras
    loadAllRecordingStatuses();
  }, []);

  const loadAllRecordingStatuses = async () => {
    try {
      const statusMap: { [key: string | number]: 'idle' | 'recording' | 'stopping' } = {};

      // Load recording status for each camera
      for (const camera of cameras) {
        try {
          const status = await cameraService.getRecordingStatus(camera.id);
          statusMap[camera.id] = status.isRecording ? 'recording' : 'idle';
        } catch (error) {
          console.error(`Failed to load recording status for camera ${camera.id}:`, error);
          statusMap[camera.id] = 'idle';
        }
      }

      setRecordingStatus(statusMap);
    } catch (error) {
      console.error('Failed to load recording statuses:', error);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [camerasData, summaryData] = await Promise.all([
        cameraService.getAllCameras(),
        cameraService.getSummary()
      ]);

      setCameras(camerasData);
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: "Failed to load camera data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUnassociatedCourts = async () => {
    try {
      const courtsData = await cameraService.getUnassociatedCourts();
      setCourts(courtsData);
    } catch (error) {
      toast({
        title: "Error loading courts",
        description: "Failed to load available courts",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: CameraStatus) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'OFFLINE':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'MAINTENANCE':
        return <Settings className="h-4 w-4 text-yellow-500" />;
      case 'ERROR':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: CameraStatus, camera?: CameraType) => {
    const variants = {
      ACTIVE: 'default',
      OFFLINE: 'destructive',
      MAINTENANCE: 'secondary',
      ERROR: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };



  const handleAssociateCamera = async () => {
    if (!associatingCamera || !selectedCourtId) return;

    try {
      const updatedCamera = await cameraService.associateCamera(
        associatingCamera.id,
        { courtId: parseInt(selectedCourtId) }
      );

      setCameras(prev => prev.map(c =>
        c.id === associatingCamera.id ? updatedCamera : c
      ));

      toast({
        title: "Camera associated",
        description: `${associatingCamera.name} has been associated with the court`,
      });

      setIsAssociateDialogOpen(false);
      setAssociatingCamera(null);
      setSelectedCourtId('');
      setSelectedCourt(null);

      // Refresh summary
      const summaryData = await cameraService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Association failed",
        description: "Failed to associate camera with court",
        variant: "destructive"
      });
    }
  };

  const handleDisassociateCamera = async (camera: CameraType) => {
    try {
      const updatedCamera = await cameraService.disassociateCamera(camera.id);

      setCameras(prev => prev.map(c =>
        c.id === camera.id ? updatedCamera : c
      ));

      toast({
        title: "Camera disassociated",
        description: `${camera.name} has been removed from ${camera.associatedCourtName}`,
      });

      // Refresh summary
      const summaryData = await cameraService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Disassociation failed",
        description: "Failed to disassociate camera",
        variant: "destructive"
      });
    }
  };



  const handleStartRecording = async (camera: CameraType) => {
    try {
      setRecordingStatus(prev => ({ ...prev, [camera.id]: 'recording' }));

      const response = await cameraService.startRecording(camera.id);

      // Check if it's a toggle response (stopped recording) or normal start response
      if ('action' in response) {
        // It's a toggle response
        const toggleResponse = response as any; // RecordingToggleResponse
        if (toggleResponse.action === 'stopped') {
          setRecordingStatus(prev => ({ ...prev, [camera.id]: 'idle' }));
          toast({
            title: "Recording stopped",
            description: `Stopped recording from ${camera.name}`,
          });
        } else {
          toast({
            title: "Recording started",
            description: `Started recording from ${camera.name}`,
          });
        }
      } else {
        // Normal start response
        toast({
          title: "Recording started",
          description: `Started recording from ${camera.name}`,
        });
      }

      // Refresh recording summary
      loadRecordingSummary();

    } catch (error) {
      setRecordingStatus(prev => ({ ...prev, [camera.id]: 'idle' }));
      const errorMessage = error instanceof Error ? error.message : "Failed to start recording";
      toast({
        title: "Recording failed",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleStopRecording = async (camera: CameraType) => {
    try {
      setRecordingStatus(prev => ({ ...prev, [camera.id]: 'stopping' }));

      const recording = await cameraService.stopRecording(camera.id);

      setRecordingStatus(prev => ({ ...prev, [camera.id]: 'idle' }));

      toast({
        title: "Recording stopped",
        description: `Stopped recording from ${camera.name}. Recording saved.`,
      });

      // Refresh recordings if viewing this camera
      if (recordingCamera?.id === camera.id) {
        const updatedRecordings = await cameraService.getCameraRecordings(camera.id);
        setRecordings(updatedRecordings);
      }

      // Refresh recording summary
      loadRecordingSummary();

    } catch (error) {
      setRecordingStatus(prev => ({ ...prev, [camera.id]: 'idle' }));
      toast({
        title: "Stop recording failed",
        description: "Failed to stop recording",
        variant: "destructive"
      });
    }
  };

  const handleViewRecordings = async (camera: CameraType) => {
    try {
      setRecordingCamera(camera);

      const cameraRecordings = await cameraService.getCameraRecordings(camera.id);
      setRecordings(cameraRecordings);
      setIsRecordingDialogOpen(true);

      toast({
        title: "Recordings loaded",
        description: `Found ${cameraRecordings.length} recordings for ${camera.name}`,
      });

    } catch (error) {
      toast({
        title: "Failed to load recordings",
        description: "Could not load recordings for this camera",
        variant: "destructive"
      });
    }
  };

  const handleDownloadRecording = async (recording: Recording) => {
    try {
      await cameraService.downloadRecording(recording.id);

      toast({
        title: "Download started",
        description: `Downloading ${recording.filename}`,
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to download recording";
      toast({
        title: "Download not available",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeleteRecording = async (recording: Recording) => {
    try {
      await cameraService.deleteRecording(recording.id);

      // Update local state
      setRecordings(prev => prev.filter(r => r.id !== recording.id));

      // Refresh recording summary
      loadRecordingSummary();

      toast({
        title: "Recording deleted",
        description: `${recording.filename} has been deleted`,
      });

    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete recording",
        variant: "destructive"
      });
    }
  };

  const handleClearAllRecordings = async () => {
    try {
      if (!recordingCamera) return;

      if (confirm(`Are you sure you want to delete all recordings for ${recordingCamera.name}? This action cannot be undone.`)) {
        await cameraService.deleteAllCameraRecordings(recordingCamera.id);

        // Update state
        setRecordings([]);

        // Refresh recording summary
        loadRecordingSummary();

        toast({
          title: "All recordings deleted",
          description: `All recordings for ${recordingCamera.name} have been deleted`,
        });
      }

    } catch (error) {
      toast({
        title: "Clear failed",
        description: "Failed to clear all recordings",
        variant: "destructive"
      });
    }
  };



  const getRecordingStatusIcon = (camera: CameraType) => {
    const status = recordingStatus[camera.id] || 'idle';
    switch (status) {
      case 'recording':
        return <Video className="h-4 w-4 text-red-500 animate-pulse" />;
      case 'stopping':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <Square className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTotalRecordingsCount = (): number => {
    return recordingSummary?.totalRecordings || 0;
  };



  const handleForceHealthCheck = async (camera?: CameraType) => {
    try {
      if (camera) {
        // Check specific camera
        const isHealthy = await cameraService.checkCameraHealth(camera.id);
        toast({
          title: "Health check completed",
          description: `${camera.name} is ${isHealthy ? 'healthy' : 'offline'}`,
          variant: isHealthy ? 'default' : 'destructive'
        });
      } else {
        // Check all cameras
        await cameraService.forceHealthCheckAll();
        toast({
          title: "Health check initiated",
          description: "Checking all cameras... Results will appear shortly",
        });
      }

      // Refresh data after health check
      setTimeout(() => {
        loadData();
        loadHealthSummary();
      }, 2000);

    } catch (error) {
      toast({
        title: "Health check failed",
        description: "Failed to perform health check",
        variant: "destructive"
      });
    }
  };

  const handleToggleMaintenanceMode = async (camera: CameraType) => {
    try {
      const isCurrentlyMaintenance = camera.status === 'MAINTENANCE';
      const newMode = !isCurrentlyMaintenance;

      await cameraService.setCameraMaintenanceMode(camera.id, newMode);

      toast({
        title: `Maintenance mode ${newMode ? 'enabled' : 'disabled'}`,
        description: `${camera.name} is now ${newMode ? 'in maintenance' : 'back online'}`,
      });

      // Refresh data
      loadData();
      loadHealthSummary();

    } catch (error) {
      toast({
        title: "Failed to toggle maintenance mode",
        description: "Could not update camera maintenance status",
        variant: "destructive"
      });
    }
  };

  const handleEditCamera = (camera: CameraType) => {
    setEditingCamera({
      id: camera.id,
      name: camera.name,
      ipAddress: camera.ipAddress,
      port: camera.port,
      username: camera.username,
      password: camera.password,
      streamPath: camera.streamPath,
      description: camera.description
    });
    setIsEditDialogOpen(true);
  };

  const handleSaveCamera = async () => {
    if (!editingCamera.id || !editingCamera.name || !editingCamera.ipAddress || !editingCamera.port) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateRequest: UpdateCameraRequest = {
        name: editingCamera.name,
        ipAddress: editingCamera.ipAddress,
        port: editingCamera.port,
        username: editingCamera.username,
        password: editingCamera.password,
        streamPath: editingCamera.streamPath,
        description: editingCamera.description
      };

      const updatedCamera = await cameraService.updateCamera(editingCamera.id, updateRequest);

      setCameras(prev => prev.map(c =>
        c.id === editingCamera.id ? updatedCamera : c
      ));

      toast({
        title: "Camera updated",
        description: `${editingCamera.name} has been updated successfully`,
      });

      setIsEditDialogOpen(false);
      setEditingCamera({});
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update camera",
        variant: "destructive"
      });
    }
  };

  const handleAddCamera = async () => {
    if (!newCamera.name || !newCamera.ipAddress || !newCamera.port) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Name, IP Address, Port)",
        variant: "destructive"
      });
      return;
    }

    try {
      const createRequest: CreateCameraRequest = {
        name: newCamera.name,
        ipAddress: newCamera.ipAddress,
        port: newCamera.port || 554,
        username: newCamera.username,
        password: newCamera.password,
        streamPath: newCamera.streamPath || '/Streaming/Channels/101',
        initialStatus: newCamera.initialStatus || 'OFFLINE',
        description: newCamera.description
      };

      const createdCamera = await cameraService.createCamera(createRequest);

      setCameras(prev => [...prev, createdCamera]);

      toast({
        title: "Camera added",
        description: `${createdCamera.name} has been added successfully`,
      });

      setIsAddDialogOpen(false);
      setNewCamera({
        name: '',
        ipAddress: '',
        initialStatus: 'OFFLINE',
        port: 554,
        username: '',
        password: '',
        streamPath: '/Streaming/Channels/101',
        description: ''
      });

      // Refresh summary
      const summaryData = await cameraService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Creation failed",
        description: "Failed to create camera",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCamera = async (camera: CameraType) => {
    if (!confirm(`Are you sure you want to delete ${camera.name}?`)) return;

    try {
      await cameraService.deleteCamera(camera.id);

      setCameras(prev => prev.filter(c => c.id !== camera.id));

      toast({
        title: "Camera deleted",
        description: `${camera.name} has been deleted successfully`,
      });

      // Refresh summary
      const summaryData = await cameraService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: "Deletion failed",
        description: "Failed to delete camera",
        variant: "destructive"
      });
    }
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
          <h1 className="text-3xl font-bold tracking-tight">Camera Recording Management</h1>
          <p className="text-muted-foreground">
            Record and manage video footage from security cameras across all courts
          </p>

        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => handleForceHealthCheck()}>
            <Activity className="w-4 h-4 mr-2" />
            Check All Cameras
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Camera
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cameras</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCameras}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeCameras}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Cameras</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary?.offlineCameras || summary.offlineCameras}</div>
            {healthSummary?.offlineCameras > 0 && (
              <p className="text-xs text-red-600 mt-1">Requires attention</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance Mode</CardTitle>
            <Settings className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary?.maintenanceCameras || 0}</div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recording Cameras</CardTitle>
            <Video className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {recordingSummary?.activeRecordings || Object.values(recordingStatus).filter(status => status === 'recording').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recordings</CardTitle>
            <FileVideo className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalRecordingsCount()}</div>

          </CardContent>
        </Card>
      </div>

      {/* Cameras Table */}
      <Card>
        <CardHeader>
          <CardTitle>Camera Recording Management</CardTitle>
          <CardDescription>
            Start/stop recordings and manage recorded footage from security cameras
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Recording Status</TableHead>
                <TableHead>Associated Court</TableHead>
                <TableHead>Recording Actions</TableHead>
                <TableHead>Management</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cameras.map((camera) => (
                <TableRow key={camera.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(camera.status)}
                      <span>{camera.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="px-2 py-1 bg-muted rounded text-sm">
                      {camera.ipAddress}:{camera.port}
                    </code>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(camera.status, camera)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRecordingStatusIcon(camera)}
                      <span className="text-sm">
                        {recordingStatus[camera.id] === 'recording' ? 'Recording' :
                          recordingStatus[camera.id] === 'stopping' ? 'Stopping...' : 'Idle'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {camera.associatedCourtName ? (
                      <div className="flex items-center space-x-2">
                        <span>{camera.associatedCourtName}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisassociateCamera(camera)}
                        >
                          <Unlink className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setAssociatingCamera(camera);
                          loadUnassociatedCourts();
                          setIsAssociateDialogOpen(true);
                        }}
                      >
                        <Link className="w-3 h-3 mr-1" />
                        Associate
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {recordingStatus[camera.id] !== 'recording' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStartRecording(camera)}
                          disabled={camera.status !== 'ACTIVE' || recordingStatus[camera.id] === 'stopping'}
                        >
                          <Video className="w-3 h-3 mr-1" />
                          Record
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStopRecording(camera)}
                          disabled={recordingStatus[camera.id] === 'stopping'}
                        >
                          <Square className="w-3 h-3 mr-1" />
                          Stop
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewRecordings(camera)}
                      >
                        <FileVideo className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleForceHealthCheck(camera)}
                        title="Force health check"
                      >
                        <Activity className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleMaintenanceMode(camera)}
                        title={camera.status === 'MAINTENANCE' ? 'Exit maintenance mode' : 'Enter maintenance mode'}
                      >
                        <Settings className={`w-3 h-3 ${camera.status === 'MAINTENANCE' ? 'text-yellow-500' : ''}`} />
                      </Button>


                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCamera(camera)}
                        title="Edit camera"
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCamera(camera)}
                        title="Delete camera"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>



      {/* Recordings Dialog */}
      <Dialog open={isRecordingDialogOpen} onOpenChange={setIsRecordingDialogOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{recordingCamera?.name} - Recorded Videos</span>
              {recordings.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAllRecordings}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              Manage recorded video files from this camera ({recordings.length} recordings, {
                (() => {
                  let totalMB = 0;
                  recordings.forEach(recording => {
                    const sizeStr = recording.size;
                    if (sizeStr.includes('GB')) {
                      totalMB += parseFloat(sizeStr) * 1024;
                    } else if (sizeStr.includes('MB')) {
                      totalMB += parseFloat(sizeStr);
                    }
                  });
                  return totalMB >= 1024 ? `${(totalMB / 1024).toFixed(1)} GB` : `${Math.round(totalMB)} MB`;
                })()
              } used)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              {recordings.length === 0 ? (
                <div className="text-center py-8">
                  <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No recordings found for this camera</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Filename</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Recorded</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordings.map((recording) => (
                      <TableRow key={recording.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            <FileVideo className="h-4 w-4 text-blue-500" />
                            <span>{recording.filename}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span>{recording.duration}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <HardDrive className="h-3 w-3 text-muted-foreground" />
                            <span>{recording.size}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{recording.timestamp.toLocaleDateString()}</div>
                            <div className="text-muted-foreground">
                              {recording.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={recording.status === 'COMPLETED' ? 'default' : 'secondary'}>
                            {recording.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadRecording(recording)}
                            >
                              <Download className="w-3 h-3" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete ${recording.filename}?`)) {
                                  handleDeleteRecording(recording);
                                }
                              }}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Associate Camera Dialog */}
      <Dialog open={isAssociateDialogOpen} onOpenChange={setIsAssociateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Associate Camera with Court</DialogTitle>
            <DialogDescription>
              Select a court to associate with {associatingCamera?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="court-select">Available Courts</Label>
              <CourtSearchInput
                placeholder="Search for a court..."
                value={selectedCourt}
                onSelect={(court) => {
                  setSelectedCourt(court);
                  setSelectedCourtId(court.id.toString());
                }}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => {
                setIsAssociateDialogOpen(false);
                setSelectedCourt(null);
                setSelectedCourtId('');
              }}>
                Cancel
              </Button>
              <Button onClick={handleAssociateCamera} disabled={!selectedCourtId}>
                Associate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Camera Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Camera</DialogTitle>
            <DialogDescription>
              Configure a new security camera
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Camera Name *</Label>
              <Input
                id="name"
                value={newCamera.name || ''}
                onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                placeholder="e.g., Court 1 Main Camera"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip">IP Address *</Label>
              <Input
                id="ip"
                value={newCamera.ipAddress || ''}
                onChange={(e) => setNewCamera({ ...newCamera, ipAddress: e.target.value })}
                placeholder="e.g., 192.168.1.101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port *</Label>
              <Input
                id="port"
                type="number"
                value={newCamera.port || 554}
                onChange={(e) => setNewCamera({ ...newCamera, port: parseInt(e.target.value) })}
                placeholder="554"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={newCamera.username || ''}
                onChange={(e) => setNewCamera({ ...newCamera, username: e.target.value })}
                placeholder="e.g., admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={newCamera.password || ''}
                onChange={(e) => setNewCamera({ ...newCamera, password: e.target.value })}
                placeholder="Camera password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="streamPath">Stream Path</Label>
              <Input
                id="streamPath"
                value={newCamera.streamPath || '/Streaming/Channels/101'}
                onChange={(e) => setNewCamera({ ...newCamera, streamPath: e.target.value })}
                placeholder="/Streaming/Channels/101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Initial Status</Label>
              <Select
                value={newCamera.initialStatus || 'OFFLINE'}
                onValueChange={(value) => setNewCamera({ ...newCamera, initialStatus: value as CameraStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newCamera.description || ''}
                onChange={(e) => setNewCamera({ ...newCamera, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCamera}>
                Add Camera
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Camera Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Camera</DialogTitle>
            <DialogDescription>
              Update camera configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Camera Name *</Label>
              <Input
                id="edit-name"
                value={editingCamera.name || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, name: e.target.value })}
                placeholder="e.g., Court 1 Main Camera"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ip">IP Address *</Label>
              <Input
                id="edit-ip"
                value={editingCamera.ipAddress || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, ipAddress: e.target.value })}
                placeholder="e.g., 192.168.1.101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-port">Port *</Label>
              <Input
                id="edit-port"
                type="number"
                value={editingCamera.port || 554}
                onChange={(e) => setEditingCamera({ ...editingCamera, port: parseInt(e.target.value) })}
                placeholder="554"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editingCamera.username || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, username: e.target.value })}
                placeholder="e.g., admin"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Password</Label>
              <Input
                id="edit-password"
                type="password"
                value={editingCamera.password || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, password: e.target.value })}
                placeholder="Camera password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-streamPath">Stream Path</Label>
              <Input
                id="edit-streamPath"
                value={editingCamera.streamPath || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, streamPath: e.target.value })}
                placeholder="/Streaming/Channels/101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={editingCamera.description || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveCamera}>
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}