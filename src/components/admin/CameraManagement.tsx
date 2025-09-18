import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  Wifi,
  WifiOff,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Link,
  Unlink,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  Loader2
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
import { useWebSocket } from '@/hooks/useWebSocket';
import VideoPlayer from '@/components/VideoPlayer';
import { 
  cameraService, 
  type CameraSummary, 
  type CreateCameraRequest, 
  type UpdateCameraRequest,
  type Court
} from '@/services/cameraService';
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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Partial<CameraType>>({});
  const [newCamera, setNewCamera] = useState<Partial<CreateCameraRequest>>({
    name: '',
    ipAddress: '',
    initialStatus: 'OFFLINE',
    port: 8080,
    description: ''
  });
  const [associatingCamera, setAssociatingCamera] = useState<CameraType | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const [selectedCourt, setSelectedCourt] = useState<CourtType | null>(null);
  const { toast } = useToast();

  // WebSocket connection for real-time updates
  useWebSocket({
    onCameraStatusUpdate: (updatedCamera: CameraType) => {
      setCameras(prev => prev.map(c => 
        c.id === updatedCamera.id ? updatedCamera : c
      ));
      
      // Show toast for status changes
      toast({
        title: "Camera status updated",
        description: `${updatedCamera.name} is now ${updatedCamera.status.toLowerCase()}`,
      });
    }
  });

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

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
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'ERROR':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'TESTING_CONNECTION':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: CameraStatus) => {
    const variants = {
      ACTIVE: 'default',
      OFFLINE: 'destructive',
      MAINTENANCE: 'secondary',
      ERROR: 'destructive',
      TESTING_CONNECTION: 'outline'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleTestConnection = async (camera: CameraType) => {
    try {
      // Optimistically update status
      setCameras(prev => prev.map(c => 
        c.id === camera.id ? { ...c, status: 'TESTING_CONNECTION' } : c
      ));

      await cameraService.testConnection(camera.id);
      
      toast({
        title: "Connection test started",
        description: `Testing ${camera.name}...`,
      });
    } catch (error) {
      toast({
        title: "Test failed",
        description: "Failed to start connection test",
        variant: "destructive"
      });
      
      // Revert status on error
      setCameras(prev => prev.map(c => 
        c.id === camera.id ? { ...c, status: 'OFFLINE' } : c
      ));
    }
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

  const handleViewCamera = (camera: CameraType) => {
    setSelectedCamera(camera);
    setIsViewDialogOpen(true);
  };

  const handleEditCamera = (camera: CameraType) => {
    setEditingCamera({
      id: camera.id,
      name: camera.name,
      ipAddress: camera.ipAddress,
      port: camera.port,
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
        port: newCamera.port,
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
        port: 8080,
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
          <h1 className="text-3xl font-bold tracking-tight">Camera Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage security cameras across all courts
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Camera
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <div className="text-2xl font-bold">{summary.offlineCameras}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Associated Courts</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.associatedCourts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Cameras Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cameras</CardTitle>
          <CardDescription>
            Manage all security cameras and their connections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Associated Court</TableHead>
                <TableHead>Last Test</TableHead>
                <TableHead>Actions</TableHead>
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
                    {getStatusBadge(camera.status)}
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
                    {camera.lastConnectionTestTime ? (
                      <div className="text-sm">
                        <div>{new Date(camera.lastConnectionTestTime).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          {camera.lastConnectionSuccess ? '✓ Success' : '✗ Failed'}
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">Never tested</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestConnection(camera)}
                        disabled={camera.status === 'TESTING_CONNECTION'}
                      >
                        <Wifi className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewCamera(camera)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCamera(camera)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCamera(camera)}
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

      {/* View Camera Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedCamera?.name} - Live Stream
            </DialogTitle>
            <DialogDescription>
              IP: {selectedCamera?.ipAddress}:{selectedCamera?.port}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              <VideoPlayer 
                videoUrl="/seed-ia-video.mp4"
                title={`Live Stream - ${selectedCamera?.name}`}
                duration="Live Stream"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon(selectedCamera?.status || 'OFFLINE')}
                <span>Camera Status: {selectedCamera?.status}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => selectedCamera && handleTestConnection(selectedCamera)}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Test Connection
                </Button>
              </div>
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
                value={newCamera.port || 8080}
                onChange={(e) => setNewCamera({ ...newCamera, port: parseInt(e.target.value) })}
                placeholder="8080"
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
                value={editingCamera.port || 8080}
                onChange={(e) => setEditingCamera({ ...editingCamera, port: parseInt(e.target.value) })}
                placeholder="8080"
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