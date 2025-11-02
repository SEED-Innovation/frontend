import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  HardDrive,
  Cloud,
  RefreshCw,
  Eye,
  Play,
  LogIn,
  Wifi,
  Monitor
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
  type CameraHealthSummary,
  type HikConnectLoginRequest,
  type HikConnectCameraInfo,
  type AddHikConnectCameraRequest,
  type StreamUrlResponse
} from '@/services/cameraService';
import {
  hikCentralService,
  type HikCentralCameraInfo,
  type HikCentralRecording,
  type RecordingParams
} from '@/services/hikCentralService';
import { useCameraWebSocket } from '@/hooks/useCameraWebSocket';

import type { Camera as CameraType, CameraStatus } from '@/types/camera';
import { CourtSearchInput } from '@/components/admin/common/CourtSearchInput';
import { Court as CourtType } from '@/types/court';

export default function CameraManagement() {
  const { t } = useTranslation('admin');
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
    description: '',
    deviceSerial: '',
    channelNo: 1,
    hikConnectEnabled: false
  });
  const [associatingCamera, setAssociatingCamera] = useState<CameraType | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<CourtType | null>(null);
  const [recordingCamera, setRecordingCamera] = useState<CameraType | null>(null);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [recordingStatus, setRecordingStatus] = useState<{ [key: string | number]: 'idle' | 'recording' | 'stopping' }>({});
  const [recordingSummary, setRecordingSummary] = useState<RecordingSummary | null>(null);
  const [healthSummary, setHealthSummary] = useState<CameraHealthSummary | null>(null);

  // Hik-Connect specific state
  const [isHikConnectLoginOpen, setIsHikConnectLoginOpen] = useState(false);
  const [isHikConnectCamerasOpen, setIsHikConnectCamerasOpen] = useState(false);
  const [isStreamViewerOpen, setIsStreamViewerOpen] = useState(false);
  const [hikConnectCredentials, setHikConnectCredentials] = useState<HikConnectLoginRequest>({
    username: '',
    password: ''
  });
  const [availableHikConnectCameras, setAvailableHikConnectCameras] = useState<HikConnectCameraInfo[]>([]);
  const [hikConnectLoading, setHikConnectLoading] = useState(false);
  const [streamingCamera, setStreamingCamera] = useState<CameraType | null>(null);
  const [streamUrl, setStreamUrl] = useState<string>('');
  const [streamLoading, setStreamLoading] = useState(false);

  // HikCentral Professional specific state
  const [isHikCentralCamerasOpen, setIsHikCentralCamerasOpen] = useState(false);
  const [isHikCentralRecordingsOpen, setIsHikCentralRecordingsOpen] = useState(false);
  const [availableHikCentralCameras, setAvailableHikCentralCameras] = useState<HikCentralCameraInfo[]>([]);
  const [hikCentralRecordings, setHikCentralRecordings] = useState<HikCentralRecording[]>([]);
  const [hikCentralLoading, setHikCentralLoading] = useState(false);
  const [selectedHikCentralCamera, setSelectedHikCentralCamera] = useState<HikCentralCameraInfo | null>(null);


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
      const [camerasResponse, summaryData] = await Promise.all([
        cameraService.getAllCameras(),
        cameraService.getSummary()
      ]);

      // Handle the new response format from backend
      const cameras = Array.isArray(camerasResponse) ? camerasResponse : camerasResponse.cameras;
      setCameras(cameras);
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: t('cameraManagement.toasts.errorLoadingData'),
        description: t('cameraManagement.toasts.failedToLoadCameraData'),
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
        title: t('cameraManagement.toasts.errorLoadingCourts'),
        description: t('cameraManagement.toasts.failedToLoadCourts'),
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
      case 'HIK_CONNECT_ERROR':
      case 'NOT_FOUND_IN_HIK_CONNECT':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'STREAM_UNAVAILABLE':
        return <WifiOff className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: CameraStatus, camera?: CameraType) => {
    const variants = {
      ACTIVE: 'default',
      OFFLINE: 'destructive',
      MAINTENANCE: 'secondary',
      ERROR: 'destructive',
      HIK_CONNECT_ERROR: 'destructive',
      NOT_FOUND_IN_HIK_CONNECT: 'destructive',
      STREAM_UNAVAILABLE: 'secondary'
    } as const;

    const labels = {
      ACTIVE: t('cameraManagement.active'),
      OFFLINE: t('cameraManagement.offline'),
      MAINTENANCE: t('cameraManagement.maintenance'),
      ERROR: t('cameraManagement.error'),
      HIK_CONNECT_ERROR: t('cameraManagement.hikConnectError'),
      NOT_FOUND_IN_HIK_CONNECT: t('cameraManagement.notFound'),
      STREAM_UNAVAILABLE: t('cameraManagement.streamUnavailable')
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {labels[status] || status.replace('_', ' ')}
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
        title: t('cameraManagement.toasts.cameraAssociated'),
        description: t('cameraManagement.toasts.cameraAssociatedWith', { name: associatingCamera.name }),
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
        title: t('cameraManagement.toasts.associationFailed'),
        description: t('cameraManagement.toasts.failedToAssociate'),
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
        title: t('cameraManagement.toasts.cameraDisassociated'),
        description: t('cameraManagement.toasts.cameraRemovedFrom', { name: camera.name, court: camera.associatedCourtName }),
      });

      // Refresh summary
      const summaryData = await cameraService.getSummary();
      setSummary(summaryData);
    } catch (error) {
      toast({
        title: t('cameraManagement.toasts.disassociationFailed'),
        description: t('cameraManagement.toasts.failedToDisassociate'),
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
            title: t('cameraManagement.toasts.recordingStopped'),
            description: t('cameraManagement.toasts.stoppedRecordingFrom', { name: camera.name }),
          });
        } else {
          toast({
            title: t('cameraManagement.toasts.recordingStarted'),
            description: t('cameraManagement.toasts.startedRecordingFrom', { name: camera.name }),
          });
        }
      } else {
        // Normal start response
        toast({
          title: t('cameraManagement.toasts.recordingStarted'),
          description: t('cameraManagement.toasts.startedRecordingFrom', { name: camera.name }),
        });
      }

      // Refresh recording summary
      loadRecordingSummary();

    } catch (error) {
      setRecordingStatus(prev => ({ ...prev, [camera.id]: 'idle' }));
      const errorMessage = error instanceof Error ? error.message : t('cameraManagement.toasts.failedToStartRecording');
      toast({
        title: t('cameraManagement.toasts.recordingFailed'),
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
        title: t('cameraManagement.toasts.recordingStopped'),
        description: t('cameraManagement.toasts.stoppedRecordingFrom', { name: camera.name }),
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
        title: t('cameraManagement.toasts.stopRecordingFailed'),
        description: t('cameraManagement.toasts.failedToStopRecording'),
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
        title: t('cameraManagement.toasts.recordingsLoaded'),
        description: t('cameraManagement.toasts.foundRecordings', { count: cameraRecordings.length, name: camera.name }),
      });

    } catch (error) {
      toast({
        title: t('cameraManagement.toasts.failedToLoadRecordings'),
        description: t('cameraManagement.toasts.couldNotLoadRecordings'),
        variant: "destructive"
      });
    }
  };

  const handleDownloadRecording = async (recording: Recording) => {
    try {
      await cameraService.downloadRecording(recording.id);

      toast({
        title: t('cameraManagement.toasts.downloadStarted'),
        description: t('cameraManagement.toasts.downloading', { filename: recording.filename }),
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('cameraManagement.toasts.failedToDownloadRecording');
      toast({
        title: t('cameraManagement.toasts.downloadNotAvailable'),
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
        title: t('cameraManagement.toasts.recordingDeleted'),
        description: t('cameraManagement.toasts.recordingDeletedMessage', { filename: recording.filename }),
      });

    } catch (error) {
      toast({
        title: t('cameraManagement.toasts.deleteFailed'),
        description: t('cameraManagement.toasts.failedToDeleteRecording'),
        variant: "destructive"
      });
    }
  };

  const handleClearAllRecordings = async () => {
    try {
      if (!recordingCamera) return;

      if (confirm(t('cameraManagement.confirmations.deleteAllRecordings', { name: recordingCamera.name }))) {
        await cameraService.deleteAllCameraRecordings(recordingCamera.id);

        // Update state
        setRecordings([]);

        // Refresh recording summary
        loadRecordingSummary();

        toast({
          title: t('cameraManagement.toasts.allRecordingsDeleted'),
          description: t('cameraManagement.toasts.allRecordingsDeletedMessage', { name: recordingCamera.name }),
        });
      }

    } catch (error) {
      toast({
        title: t('cameraManagement.toasts.clearFailed'),
        description: t('cameraManagement.toasts.failedToClearRecordings'),
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
          title: t('cameraManagement.toasts.healthCheckCompleted'),
          description: t('cameraManagement.toasts.cameraHealthy', {
            name: camera.name,
            status: isHealthy ? t('cameraManagement.toasts.healthy') : t('cameraManagement.offline')
          }),
          variant: isHealthy ? 'default' : 'destructive'
        });
      } else {
        // Check all cameras
        await cameraService.forceHealthCheckAll();
        toast({
          title: t('cameraManagement.toasts.healthCheckInitiated'),
          description: t('cameraManagement.toasts.checkingAllCameras'),
        });
      }

      // Refresh data after health check
      setTimeout(() => {
        loadData();
        loadHealthSummary();
      }, 2000);

    } catch (error) {
      toast({
        title: t('cameraManagement.toasts.healthCheckFailed'),
        description: t('cameraManagement.toasts.failedToPerformHealthCheck'),
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
        title: newMode ? t('cameraManagement.toasts.maintenanceModeEnabled') : t('cameraManagement.toasts.maintenanceModeDisabled'),
        description: newMode ? t('cameraManagement.toasts.cameraInMaintenance', { name: camera.name }) : t('cameraManagement.toasts.cameraBackOnline', { name: camera.name }),
      });

      // Refresh data
      loadData();
      loadHealthSummary();

    } catch (error) {
      toast({
        title: t('cameraManagement.toasts.failedToToggleMaintenance'),
        description: t('cameraManagement.toasts.couldNotUpdateMaintenance'),
        variant: "destructive"
      });
    }
  };

  // Hik-Connect handler functions
  const handleHikConnectLogin = async () => {
    if (!hikConnectCredentials.username || !hikConnectCredentials.password) {
      toast({
        title: "Missing credentials",
        description: "Please enter both username and password",
        variant: "destructive"
      });
      return;
    }

    try {
      setHikConnectLoading(true);
      const result = await cameraService.loginToHikConnect(hikConnectCredentials);

      toast({
        title: "Login successful",
        description: result.message,
      });

      setIsHikConnectLoginOpen(false);
      setHikConnectCredentials({ username: '', password: '' });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Failed to login to Hik-Connect",
        variant: "destructive"
      });
    } finally {
      setHikConnectLoading(false);
    }
  };

  const handleLoadAvailableCameras = async () => {
    try {
      setHikConnectLoading(true);
      const result = await cameraService.getAvailableHikConnectCameras();
      setAvailableHikConnectCameras(result.cameras);
      setIsHikConnectCamerasOpen(true);

      toast({
        title: "Cameras loaded",
        description: `Found ${result.count} cameras in your Hik-Connect account`,
      });
    } catch (error) {
      toast({
        title: "Failed to load cameras",
        description: error instanceof Error ? error.message : "Failed to get cameras from Hik-Connect",
        variant: "destructive"
      });
    } finally {
      setHikConnectLoading(false);
    }
  };

  const handleSyncHikConnectCameras = async () => {
    try {
      setHikConnectLoading(true);
      const result = await cameraService.syncHikConnectCameras();

      toast({
        title: "Sync completed",
        description: result.message,
      });

      // Refresh camera list
      loadData();
    } catch (error) {
      toast({
        title: "Sync failed",
        description: error instanceof Error ? error.message : "Failed to sync cameras",
        variant: "destructive"
      });
    } finally {
      setHikConnectLoading(false);
    }
  };

  const handleAddHikConnectCamera = async (hikCamera: HikConnectCameraInfo) => {
    try {
      const request: AddHikConnectCameraRequest = {
        deviceSerial: hikCamera.deviceSerial,
        channelNo: hikCamera.channelNo
      };

      const result = await cameraService.addHikConnectCamera(request);

      toast({
        title: "Camera added",
        description: result.message,
      });

      // Refresh camera list and close dialog
      loadData();
      setIsHikConnectCamerasOpen(false);
    } catch (error) {
      toast({
        title: "Failed to add camera",
        description: error instanceof Error ? error.message : "Failed to add camera",
        variant: "destructive"
      });
    }
  };

  const handleViewLiveStream = async (camera: CameraType) => {
    try {
      setStreamLoading(true);
      setStreamingCamera(camera);

      const result = await cameraService.getLiveStreamUrl(camera.id);
      setStreamUrl(result.streamUrl);
      setIsStreamViewerOpen(true);

      toast({
        title: "Stream loaded",
        description: `Live stream from ${camera.name} is ready`,
      });
    } catch (error) {
      toast({
        title: "Stream unavailable",
        description: error instanceof Error ? error.message : "Failed to get live stream",
        variant: "destructive"
      });
    } finally {
      setStreamLoading(false);
    }
  };

  // HikCentral Professional handler functions
  const handleTestHikCentralConnectivity = async () => {
    try {
      setHikCentralLoading(true);
      const result = await hikCentralService.testConnectivity();

      toast({
        title: result.connected ? "Connection successful" : "Connection failed",
        description: result.message,
        variant: result.connected ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "Connection test failed",
        description: error instanceof Error ? error.message : "Failed to test HikCentral connectivity",
        variant: "destructive"
      });
    } finally {
      setHikCentralLoading(false);
    }
  };

  const handleLoadHikCentralCameras = async () => {
    try {
      setHikCentralLoading(true);
      const result = await hikCentralService.getCameras();
      setAvailableHikCentralCameras(result.cameras);
      setIsHikCentralCamerasOpen(true);

      toast({
        title: "Cameras loaded",
        description: `Found ${result.count} cameras in HikCentral Professional`,
      });
    } catch (error) {
      toast({
        title: "Failed to load cameras",
        description: error instanceof Error ? error.message : "Failed to get cameras from HikCentral",
        variant: "destructive"
      });
    } finally {
      setHikCentralLoading(false);
    }
  };

  const handleViewHikCentralLiveStream = async (camera: HikCentralCameraInfo) => {
    try {
      setStreamLoading(true);
      setSelectedHikCentralCamera(camera);

      const result = await hikCentralService.getLiveStreamUrl(camera.cameraId);
      setStreamUrl(result.streamUrl);
      setIsStreamViewerOpen(true);

      toast({
        title: "Stream loaded",
        description: `Live stream from ${camera.cameraName} is ready`,
      });
    } catch (error) {
      toast({
        title: "Stream unavailable",
        description: error instanceof Error ? error.message : "Failed to get live stream from HikCentral",
        variant: "destructive"
      });
    } finally {
      setStreamLoading(false);
    }
  };

  const handleStartHikCentralRecording = async (camera: HikCentralCameraInfo) => {
    try {
      const params: RecordingParams = {
        recordType: "manual",
        duration: 3600, // 1 hour
        quality: "high"
      };

      const result = await hikCentralService.startRecording(camera.cameraId, params);

      toast({
        title: "Recording started",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Failed to start recording",
        description: error instanceof Error ? error.message : "Failed to start recording on HikCentral",
        variant: "destructive"
      });
    }
  };

  const handleStopHikCentralRecording = async (camera: HikCentralCameraInfo) => {
    try {
      const result = await hikCentralService.stopRecording(camera.cameraId);

      toast({
        title: "Recording stopped",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Failed to stop recording",
        description: error instanceof Error ? error.message : "Failed to stop recording on HikCentral",
        variant: "destructive"
      });
    }
  };

  const handleViewHikCentralRecordings = async (camera: HikCentralCameraInfo) => {
    try {
      setHikCentralLoading(true);
      setSelectedHikCentralCamera(camera);

      // Get recordings for the last 24 hours
      const result = await hikCentralService.getLast24HoursRecordings(camera.cameraId);
      setHikCentralRecordings(result.recordings);
      setIsHikCentralRecordingsOpen(true);

      toast({
        title: "Recordings loaded",
        description: `Found ${result.count} recordings for ${camera.cameraName}`,
      });
    } catch (error) {
      toast({
        title: "Failed to load recordings",
        description: error instanceof Error ? error.message : "Failed to get recordings from HikCentral",
        variant: "destructive"
      });
    } finally {
      setHikCentralLoading(false);
    }
  };

  const handlePlayHikCentralRecording = async (recording: HikCentralRecording) => {
    try {
      if (!selectedHikCentralCamera) return;

      setStreamLoading(true);
      const result = await hikCentralService.getPlaybackUrl(
        selectedHikCentralCamera.cameraId, 
        recording.recordingId
      );
      
      setStreamUrl(result.playbackUrl);
      setIsStreamViewerOpen(true);

      toast({
        title: "Playback ready",
        description: `Playing recording from ${selectedHikCentralCamera.cameraName}`,
      });
    } catch (error) {
      toast({
        title: "Playback unavailable",
        description: error instanceof Error ? error.message : "Failed to get playback URL",
        variant: "destructive"
      });
    } finally {
      setStreamLoading(false);
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
    // Validate required fields based on camera type
    if (!newCamera.name) {
      toast({
        title: "Missing required fields",
        description: "Please enter a camera name",
        variant: "destructive"
      });
      return;
    }

    if (newCamera.hikConnectEnabled) {
      if (!newCamera.deviceSerial) {
        toast({
          title: "Missing required fields",
          description: "Please enter the device serial number for Hik-Connect camera",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!newCamera.ipAddress || !newCamera.port) {
        toast({
          title: "Missing required fields",
          description: "Please fill in IP Address and Port for IP camera",
          variant: "destructive"
        });
        return;
      }
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
        description: newCamera.description,
        // Hik-Connect specific fields
        deviceSerial: newCamera.deviceSerial,
        channelNo: newCamera.channelNo || 1,
        hikConnectEnabled: newCamera.hikConnectEnabled || false
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
        description: '',
        deviceSerial: '',
        channelNo: 1,
        hikConnectEnabled: false
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
          <h1 className="text-3xl font-bold tracking-tight">{t('cameraManagement.title')}</h1>
          <p className="text-muted-foreground">
            {t('cameraManagement.subtitle')}
          </p>

        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setIsHikConnectLoginOpen(true)}>
            <LogIn className="w-4 h-4 mr-2" />
            {t('cameraManagement.hikConnectLogin')}
          </Button>
          <Button variant="outline" onClick={handleLoadAvailableCameras} disabled={hikConnectLoading}>
            <Cloud className="w-4 h-4 mr-2" />
            {t('cameraManagement.browseCameras')}
          </Button>
          <Button variant="outline" onClick={handleSyncHikConnectCameras} disabled={hikConnectLoading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('cameraManagement.syncCameras')}
          </Button>
          <Button variant="outline" onClick={handleTestHikCentralConnectivity} disabled={hikCentralLoading}>
            <Monitor className="w-4 h-4 mr-2" />
            HikCentral Test
          </Button>
          <Button variant="outline" onClick={handleLoadHikCentralCameras} disabled={hikCentralLoading}>
            <Monitor className="w-4 h-4 mr-2" />
            HikCentral Cameras
          </Button>
          <Button variant="outline" onClick={() => handleForceHealthCheck()}>
            <Activity className="w-4 h-4 mr-2" />
            {t('cameraManagement.checkAllCameras')}
          </Button>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            {t('cameraManagement.addCamera')}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cameraManagement.totalCameras')}</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCameras}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cameraManagement.activeCameras')}</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeCameras}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cameraManagement.offlineCameras')}</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary?.offlineCameras || summary.offlineCameras}</div>
            {healthSummary?.offlineCameras > 0 && (
              <p className="text-xs text-red-600 mt-1">{t('cameraManagement.requiresAttention')}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cameraManagement.maintenanceMode')}</CardTitle>
            <Settings className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthSummary?.maintenanceCameras || 0}</div>

          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('cameraManagement.recordingCameras')}</CardTitle>
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
            <CardTitle className="text-sm font-medium">{t('cameraManagement.totalRecordings')}</CardTitle>
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
          <CardTitle>{t('cameraManagement.tableTitle')}</CardTitle>
          <CardDescription>
            {t('cameraManagement.tableDescription')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('cameraManagement.name')}</TableHead>
                <TableHead>{t('cameraManagement.connection')}</TableHead>
                <TableHead>{t('cameraManagement.status')}</TableHead>
                <TableHead>{t('cameraManagement.type')}</TableHead>
                <TableHead>{t('cameraManagement.recordingStatus')}</TableHead>
                <TableHead>{t('cameraManagement.associatedCourt')}</TableHead>
                <TableHead>{t('cameraManagement.streamActions')}</TableHead>
                <TableHead>{t('cameraManagement.recordingActions')}</TableHead>
                <TableHead>{t('cameraManagement.management')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cameras.map((camera) => (
                <TableRow key={camera.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(camera.status)}
                      <div>
                        <div>{camera.name}</div>
                        {camera.deviceName && camera.deviceName !== camera.name && (
                          <div className="text-xs text-muted-foreground">{camera.deviceName}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {camera.hikConnectEnabled ? (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Cloud className="h-3 w-3 text-blue-500" />
                          <span className="text-xs">{t('cameraManagement.hikConnect')}</span>
                        </div>
                        <code className="px-1 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                          {camera.deviceSerial}
                        </code>
                        {camera.channelNo && (
                          <div className="text-xs text-muted-foreground">
                            Ch. {camera.channelNo}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1">
                          <Wifi className="h-3 w-3 text-gray-500" />
                          <span className="text-xs">{t('cameraManagement.directIp')}</span>
                        </div>
                        <code className="px-1 py-0.5 bg-muted rounded text-xs">
                          {camera.ipAddress}:{camera.port}
                        </code>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(camera.status, camera)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {camera.hikConnectEnabled ? (
                        <Badge variant="secondary" className="text-xs">
                          <Cloud className="w-3 h-3 mr-1" />
                          {t('cameraManagement.cloud')}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          <Monitor className="w-3 h-3 mr-1" />
                          {t('cameraManagement.local')}
                        </Badge>
                      )}
                      {camera.isOnline && (
                        <div className="w-2 h-2 bg-green-500 rounded-full" title={t('cameraManagement.online')} />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getRecordingStatusIcon(camera)}
                      <span className="text-sm">
                        {recordingStatus[camera.id] === 'recording' ? t('cameraManagement.recording') :
                          recordingStatus[camera.id] === 'stopping' ? t('cameraManagement.stopping') : t('cameraManagement.idle')}
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
                        {t('cameraManagement.associate')}
                      </Button>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewLiveStream(camera)}
                        disabled={camera.status !== 'ACTIVE' || streamLoading}
                        title={t('cameraManagement.viewLiveStream')}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      {camera.hikConnectEnabled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // TODO: Implement playback viewer
                            toast({
                              title: t('cameraManagement.playbackViewer'),
                              description: t('cameraManagement.playbackViewerComingSoon'),
                            });
                          }}
                          title={t('cameraManagement.viewRecordings')}
                        >
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
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
                          {t('cameraManagement.record')}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleStopRecording(camera)}
                          disabled={recordingStatus[camera.id] === 'stopping'}
                        >
                          <Square className="w-3 h-3 mr-1" />
                          {t('cameraManagement.stop')}
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
                        title={t('cameraManagement.forceHealthCheck')}
                      >
                        <Activity className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleMaintenanceMode(camera)}
                        title={camera.status === 'MAINTENANCE' ? t('cameraManagement.exitMaintenanceMode') : t('cameraManagement.enterMaintenanceMode')}
                      >
                        <Settings className={`w-3 h-3 ${camera.status === 'MAINTENANCE' ? 'text-yellow-500' : ''}`} />
                      </Button>


                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCamera(camera)}
                        title={t('cameraManagement.editCamera')}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCamera(camera)}
                        title={t('cameraManagement.deleteCamera')}
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
              <span>{recordingCamera?.name} - {t('cameraManagement.recordedVideos')}</span>
              {recordings.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAllRecordings}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {t('cameraManagement.clearAll')}
                </Button>
              )}
            </DialogTitle>
            <DialogDescription>
              {t('cameraManagement.manageRecordings')} ({recordings.length} recordings, {
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
              } {t('cameraManagement.recordingsUsed')})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4">
              {recordings.length === 0 ? (
                <div className="text-center py-8">
                  <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t('cameraManagement.noRecordings')}</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('cameraManagement.filename')}</TableHead>
                      <TableHead>{t('cameraManagement.duration')}</TableHead>
                      <TableHead>{t('cameraManagement.size')}</TableHead>
                      <TableHead>{t('cameraManagement.recorded')}</TableHead>
                      <TableHead>{t('cameraManagement.status')}</TableHead>
                      <TableHead>{t('cameraManagement.actions')}</TableHead>
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
                            {recording.status === 'COMPLETED' ? t('cameraManagement.completed') : recording.status}
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
                                if (confirm(t('cameraManagement.confirmations.deleteRecording', { filename: recording.filename }))) {
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
            <DialogTitle>{t('cameraManagement.associateWithCourt')}</DialogTitle>
            <DialogDescription>
              {t('cameraManagement.selectCourt')} {associatingCamera?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="court-select">{t('cameraManagement.availableCourts')}</Label>
              <CourtSearchInput
                placeholder={t('cameraManagement.searchCourt')}
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
                {t('cameraManagement.cancel')}
              </Button>
              <Button onClick={handleAssociateCamera} disabled={!selectedCourtId}>
                {t('cameraManagement.associate')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Camera Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t('cameraManagement.addNewCamera')}</DialogTitle>
            <DialogDescription>
              {t('cameraManagement.configureCamera')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t('cameraManagement.cameraType')}</Label>
              <div className="flex space-x-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="ip-camera"
                    name="camera-type"
                    checked={!newCamera.hikConnectEnabled}
                    onChange={() => setNewCamera({ ...newCamera, hikConnectEnabled: false })}
                  />
                  <Label htmlFor="ip-camera" className="flex items-center space-x-1">
                    <Monitor className="w-4 h-4" />
                    <span>{t('cameraManagement.ipCamera')}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="hik-connect"
                    name="camera-type"
                    checked={newCamera.hikConnectEnabled}
                    onChange={() => setNewCamera({ ...newCamera, hikConnectEnabled: true })}
                  />
                  <Label htmlFor="hik-connect" className="flex items-center space-x-1">
                    <Cloud className="w-4 h-4" />
                    <span>{t('cameraManagement.hikConnect')}</span>
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">{t('cameraManagement.cameraName')} *</Label>
              <Input
                id="name"
                value={newCamera.name || ''}
                onChange={(e) => setNewCamera({ ...newCamera, name: e.target.value })}
                placeholder={t('cameraManagement.cameraNamePlaceholder')}
              />
            </div>

            {newCamera.hikConnectEnabled ? (
              // Hik-Connect specific fields
              <>
                <div className="space-y-2">
                  <Label htmlFor="device-serial">{t('cameraManagement.deviceSerial')} *</Label>
                  <Input
                    id="device-serial"
                    value={newCamera.deviceSerial || ''}
                    onChange={(e) => setNewCamera({ ...newCamera, deviceSerial: e.target.value })}
                    placeholder={t('cameraManagement.deviceSerialPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="channel">{t('cameraManagement.channelNumber')}</Label>
                  <Input
                    id="channel"
                    type="number"
                    value={newCamera.channelNo || 1}
                    onChange={(e) => setNewCamera({ ...newCamera, channelNo: parseInt(e.target.value) })}
                    placeholder="1"
                    min="1"
                  />
                </div>
              </>
            ) : (
              // IP Camera specific fields
              <>
                <div className="space-y-2">
                  <Label htmlFor="ip">{t('cameraManagement.ipAddress')} *</Label>
                  <Input
                    id="ip"
                    value={newCamera.ipAddress || ''}
                    onChange={(e) => setNewCamera({ ...newCamera, ipAddress: e.target.value })}
                    placeholder={t('cameraManagement.ipAddressPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="port">{t('cameraManagement.port')} *</Label>
                  <Input
                    id="port"
                    type="number"
                    value={newCamera.port || 554}
                    onChange={(e) => setNewCamera({ ...newCamera, port: parseInt(e.target.value) })}
                    placeholder="554"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">{t('cameraManagement.username')}</Label>
                  <Input
                    id="username"
                    value={newCamera.username || ''}
                    onChange={(e) => setNewCamera({ ...newCamera, username: e.target.value })}
                    placeholder={t('cameraManagement.usernamePlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">{t('cameraManagement.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newCamera.password || ''}
                    onChange={(e) => setNewCamera({ ...newCamera, password: e.target.value })}
                    placeholder={t('cameraManagement.cameraPassword')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="streamPath">{t('cameraManagement.streamPath')}</Label>
                  <Input
                    id="streamPath"
                    value={newCamera.streamPath || '/Streaming/Channels/101'}
                    onChange={(e) => setNewCamera({ ...newCamera, streamPath: e.target.value })}
                    placeholder="/Streaming/Channels/101"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">{t('cameraManagement.initialStatus')}</Label>
              <Select
                value={newCamera.initialStatus || 'OFFLINE'}
                onValueChange={(value) => setNewCamera({ ...newCamera, initialStatus: value as CameraStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">{t('cameraManagement.active')}</SelectItem>
                  <SelectItem value="OFFLINE">{t('cameraManagement.offline')}</SelectItem>
                  <SelectItem value="MAINTENANCE">{t('cameraManagement.maintenance')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">{t('cameraManagement.description')}</Label>
              <Textarea
                id="description"
                value={newCamera.description || ''}
                onChange={(e) => setNewCamera({ ...newCamera, description: e.target.value })}
                placeholder={t('cameraManagement.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                {t('cameraManagement.cancel')}
              </Button>
              <Button onClick={handleAddCamera}>
                {t('cameraManagement.addCamera')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Camera Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('cameraManagement.editCamera')}</DialogTitle>
            <DialogDescription>
              {t('cameraManagement.updateCameraConfig')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">{t('cameraManagement.cameraName')} *</Label>
              <Input
                id="edit-name"
                value={editingCamera.name || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, name: e.target.value })}
                placeholder={t('cameraManagement.cameraNamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-ip">{t('cameraManagement.ipAddress')} *</Label>
              <Input
                id="edit-ip"
                value={editingCamera.ipAddress || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, ipAddress: e.target.value })}
                placeholder={t('cameraManagement.ipAddressPlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-port">{t('cameraManagement.port')} *</Label>
              <Input
                id="edit-port"
                type="number"
                value={editingCamera.port || 554}
                onChange={(e) => setEditingCamera({ ...editingCamera, port: parseInt(e.target.value) })}
                placeholder="554"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-username">{t('cameraManagement.username')}</Label>
              <Input
                id="edit-username"
                value={editingCamera.username || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, username: e.target.value })}
                placeholder={t('cameraManagement.usernamePlaceholder')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">{t('cameraManagement.password')}</Label>
              <Input
                id="edit-password"
                type="password"
                value={editingCamera.password || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, password: e.target.value })}
                placeholder={t('cameraManagement.cameraPassword')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-streamPath">{t('cameraManagement.streamPath')}</Label>
              <Input
                id="edit-streamPath"
                value={editingCamera.streamPath || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, streamPath: e.target.value })}
                placeholder="/Streaming/Channels/101"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">{t('cameraManagement.description')}</Label>
              <Textarea
                id="edit-description"
                value={editingCamera.description || ''}
                onChange={(e) => setEditingCamera({ ...editingCamera, description: e.target.value })}
                placeholder={t('cameraManagement.descriptionPlaceholder')}
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                {t('cameraManagement.cancel')}
              </Button>
              <Button onClick={handleSaveCamera}>
                {t('cameraManagement.saveChanges')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Hik-Connect Login Dialog */}
      <Dialog open={isHikConnectLoginOpen} onOpenChange={setIsHikConnectLoginOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              <span>Login to Hik-Connect</span>
            </DialogTitle>
            <DialogDescription>
              Enter your Hik-Connect account credentials to access your cloud cameras
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hik-username">Username/Email</Label>
              <Input
                id="hik-username"
                type="email"
                value={hikConnectCredentials.username}
                onChange={(e) => setHikConnectCredentials({
                  ...hikConnectCredentials,
                  username: e.target.value
                })}
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hik-password">Password</Label>
              <Input
                id="hik-password"
                type="password"
                value={hikConnectCredentials.password}
                onChange={(e) => setHikConnectCredentials({
                  ...hikConnectCredentials,
                  password: e.target.value
                })}
                placeholder="Your Hik-Connect password"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsHikConnectLoginOpen(false);
                  setHikConnectCredentials({ username: '', password: '' });
                }}
              >
                {t('cameraManagement.cancel')}
              </Button>
              <Button
                onClick={handleHikConnectLogin}
                disabled={hikConnectLoading}
              >
                {hikConnectLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {t('cameraManagement.login')}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Available Hik-Connect Cameras Dialog */}
      <Dialog open={isHikConnectCamerasOpen} onOpenChange={setIsHikConnectCamerasOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Cloud className="w-5 h-5 text-blue-500" />
              <span>{t('cameraManagement.availableHikConnectCameras')}</span>
            </DialogTitle>
            <DialogDescription>
              {t('cameraManagement.selectCamerasFromAccount')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableHikConnectCameras.length === 0 ? (
              <div className="text-center py-8">
                <Cloud className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t('cameraManagement.noCamerasFound')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('cameraManagement.makeSureCamerasOnline')}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('cameraManagement.deviceName')}</TableHead>
                    <TableHead>{t('cameraManagement.serialNumber')}</TableHead>
                    <TableHead>{t('cameraManagement.channel')}</TableHead>
                    <TableHead>{t('cameraManagement.model')}</TableHead>
                    <TableHead>{t('cameraManagement.status')}</TableHead>
                    <TableHead>{t('cameraManagement.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableHikConnectCameras.map((hikCamera) => (
                    <TableRow key={`${hikCamera.deviceSerial}-${hikCamera.channelNo}`}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{hikCamera.deviceName}</div>
                          {hikCamera.channelName && (
                            <div className="text-xs text-muted-foreground">
                              {hikCamera.channelName}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {hikCamera.deviceSerial}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          Ch. {hikCamera.channelNo}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{hikCamera.model || t('cameraManagement.unknown')}</div>
                          {hikCamera.firmwareVersion && (
                            <div className="text-xs text-muted-foreground">
                              v{hikCamera.firmwareVersion}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {hikCamera.isOnline ? (
                            <Badge variant="default">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {t('cameraManagement.online')}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">
                              <XCircle className="w-3 h-3 mr-1" />
                              {t('cameraManagement.offline')}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddHikConnectCamera(hikCamera)}
                          disabled={!hikCamera.isOnline}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          {t('cameraManagement.add')}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Stream Viewer Dialog */}
      <Dialog open={isStreamViewerOpen} onOpenChange={setIsStreamViewerOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-500" />
              <span>{t('cameraManagement.liveStream')} - {streamingCamera?.name || selectedHikCentralCamera?.cameraName}</span>
            </DialogTitle>
            <DialogDescription>
              {t('cameraManagement.liveVideoFeed')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {streamLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">{t('cameraManagement.loadingStream')}</span>
              </div>
            ) : streamUrl ? (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <video
                  src={streamUrl}
                  controls
                  autoPlay
                  className="w-full h-auto max-h-96"
                  onError={() => {
                    toast({
                      title: t('cameraManagement.toasts.streamError'),
                      description: t('cameraManagement.toasts.failedToLoadVideoStream'),
                      variant: "destructive"
                    });
                  }}
                >
                  Your browser does not support the video tag.
                </video>
                <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span>{t('cameraManagement.live')}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500 mb-4" />
                <p className="text-muted-foreground">{t('cameraManagement.streamNotAvailable')}</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* HikCentral Cameras Dialog */}
      <Dialog open={isHikCentralCamerasOpen} onOpenChange={setIsHikCentralCamerasOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5 text-blue-500" />
              <span>HikCentral Professional Cameras</span>
            </DialogTitle>
            <DialogDescription>
              Cameras available in your HikCentral Professional system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {availableHikCentralCameras.length === 0 ? (
              <div className="text-center py-8">
                <Monitor className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No cameras found in HikCentral Professional</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Make sure your cameras are properly configured and online
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Camera Name</TableHead>
                    <TableHead>Camera ID</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableHikCentralCameras.map((camera) => (
                    <TableRow key={camera.cameraId}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{camera.cameraName}</div>
                          <div className="text-xs text-muted-foreground">
                            Channel {camera.channelNo}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {camera.cameraId}
                        </code>
                      </TableCell>
                      <TableCell>{camera.ipAddress}</TableCell>
                      <TableCell>{camera.model || 'Unknown'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHikCentralLiveStream(camera)}
                            disabled={!camera.online}
                            title="View Live Stream"
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStartHikCentralRecording(camera)}
                            disabled={!camera.online}
                            title="Start Recording"
                          >
                            <Video className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewHikCentralRecordings(camera)}
                            title="View Recordings"
                          >
                            <FileVideo className="w-3 h-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* HikCentral Recordings Dialog */}
      <Dialog open={isHikCentralRecordingsOpen} onOpenChange={setIsHikCentralRecordingsOpen}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileVideo className="w-5 h-5 text-blue-500" />
              <span>HikCentral Recordings - {selectedHikCentralCamera?.cameraName}</span>
            </DialogTitle>
            <DialogDescription>
              Recordings from HikCentral Professional (Last 24 hours)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {hikCentralRecordings.length === 0 ? (
              <div className="text-center py-8">
                <FileVideo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recordings found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  No recordings available for the last 24 hours
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recording ID</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {hikCentralRecordings.map((recording) => (
                    <TableRow key={recording.recordingId}>
                      <TableCell className="font-medium">
                        <code className="px-2 py-1 bg-muted rounded text-sm">
                          {recording.recordingId}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(recording.startTime).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            {new Date(recording.startTime).toLocaleTimeString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {hikCentralService.formatDuration(recording.duration)}
                      </TableCell>
                      <TableCell>
                        {hikCentralService.formatFileSize(recording.fileSize)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{recording.recordType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePlayHikCentralRecording(recording)}
                          title="Play Recording"
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}