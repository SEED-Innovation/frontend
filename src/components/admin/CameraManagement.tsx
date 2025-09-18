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
  Activity
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
  DialogTrigger,
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
import VideoPlayer from '@/components/VideoPlayer';
import type { Camera as CameraType, CameraStatus } from '@/types/camera';

// Mock data
const mockCameras: CameraType[] = [
  {
    id: 1,
    name: 'Court 1 Main Camera',
    ipAddress: '192.168.1.101',
    status: 'ACTIVE',
    port: 8080,
    description: 'Main camera for court 1 covering full court view',
    lastConnectionTestTime: '2024-01-15T10:30:00',
    lastConnectionSuccess: true,
    courtCamera: { id: 1, name: 'Court 1' }
  },
  {
    id: 2,
    name: 'Court 2 Main Camera',
    ipAddress: '192.168.1.102',
    status: 'OFFLINE',
    port: 8080,
    description: 'Main camera for court 2',
    lastConnectionTestTime: '2024-01-15T09:15:00',
    lastConnectionSuccess: false,
  },
  {
    id: 3,
    name: 'Entrance Security Camera',
    ipAddress: '192.168.1.103',
    status: 'ACTIVE',
    port: 8081,
    description: 'Security camera at main entrance',
    lastConnectionTestTime: '2024-01-15T10:45:00',
    lastConnectionSuccess: true,
  },
  {
    id: 4,
    name: 'Court 3 Camera',
    ipAddress: '192.168.1.104',
    status: 'MAINTENANCE',
    port: 8080,
    description: 'Under maintenance for lens cleaning',
    lastConnectionTestTime: '2024-01-14T16:20:00',
    lastConnectionSuccess: true,
    courtCamera: { id: 3, name: 'Court 3' }
  }
];

const mockCourts = [
  { id: 1, name: 'Court 1' },
  { id: 2, name: 'Court 2' },
  { id: 3, name: 'Court 3' },
  { id: 4, name: 'Court 4' },
  { id: 5, name: 'Court 5' }
];

export default function CameraManagement() {
  const [cameras, setCameras] = useState<CameraType[]>(mockCameras);
  const [selectedCamera, setSelectedCamera] = useState<CameraType | null>(null);
  const [isStreaming, setIsStreaming] = useState<Record<number, boolean>>({});
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAssociateDialogOpen, setIsAssociateDialogOpen] = useState(false);
  const [editingCamera, setEditingCamera] = useState<Partial<CameraType>>({});
  const [newCamera, setNewCamera] = useState<Partial<CameraType>>({
    name: '',
    ipAddress: '',
    status: 'OFFLINE',
    port: 8080,
    description: ''
  });
  const [associatingCamera, setAssociatingCamera] = useState<CameraType | null>(null);
  const [selectedCourtId, setSelectedCourtId] = useState<string>('');
  const { toast } = useToast();

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
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: CameraStatus) => {
    const variants = {
      ACTIVE: 'default',
      OFFLINE: 'destructive',
      MAINTENANCE: 'secondary',
      ERROR: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const handleTestConnection = async (camera: CameraType) => {
    toast({
      title: "Testing connection...",
      description: `Pinging ${camera.ipAddress}:${camera.port}`,
    });

    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      setCameras(prev => prev.map(c => 
        c.id === camera.id 
          ? {
              ...c,
              lastConnectionTestTime: new Date().toISOString(),
              lastConnectionSuccess: success,
              status: success ? 'ACTIVE' : 'OFFLINE'
            }
          : c
      ));

      toast({
        title: success ? "Connection successful" : "Connection failed",
        description: success 
          ? `Camera ${camera.name} is responding`
          : `Failed to reach ${camera.ipAddress}:${camera.port}`,
        variant: success ? "default" : "destructive"
      });
    }, 2000);
  };

  const handleAssociateCamera = () => {
    if (!associatingCamera || !selectedCourtId) return;

    const courtId = parseInt(selectedCourtId);
    const court = mockCourts.find(c => c.id === courtId);
    
    setCameras(prev => prev.map(c => 
      c.id === associatingCamera.id 
        ? { ...c, courtCamera: court ? { id: court.id, name: court.name } : undefined }
        : c
    ));

    toast({
      title: "Camera associated",
      description: `${associatingCamera.name} has been associated with ${court?.name}`,
    });

    setIsAssociateDialogOpen(false);
    setAssociatingCamera(null);
    setSelectedCourtId('');
  };

  const handleDisassociateCamera = (camera: CameraType) => {
    setCameras(prev => prev.map(c => 
      c.id === camera.id 
        ? { ...c, courtCamera: undefined }
        : c
    ));

    toast({
      title: "Camera disassociated",
      description: `${camera.name} has been removed from ${camera.courtCamera?.name}`,
    });
  };

  const toggleStreaming = (cameraId: number) => {
    setIsStreaming(prev => ({
      ...prev,
      [cameraId]: !prev[cameraId]
    }));
  };

  const handleViewCamera = (camera: CameraType) => {
    setSelectedCamera(camera);
    setIsViewDialogOpen(true);
  };

  const handleEditCamera = (camera: CameraType) => {
    setEditingCamera(camera);
    setIsEditDialogOpen(true);
  };

  const handleSaveCamera = () => {
    if (editingCamera.id) {
      setCameras(prev => prev.map(c => 
        c.id === editingCamera.id ? { ...c, ...editingCamera } as CameraType : c
      ));
      toast({
        title: "Camera updated",
        description: `${editingCamera.name} has been updated successfully`,
      });
    }
    setIsEditDialogOpen(false);
    setEditingCamera({});
  };

  const handleAddCamera = () => {
    if (!newCamera.name || !newCamera.ipAddress || !newCamera.port) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields (Name, IP Address, Port)",
        variant: "destructive"
      });
      return;
    }

    const camera: CameraType = {
      id: Math.max(...cameras.map(c => c.id)) + 1,
      name: newCamera.name!,
      ipAddress: newCamera.ipAddress!,
      status: newCamera.status as CameraStatus || 'OFFLINE',
      port: newCamera.port!,
      description: newCamera.description,
      lastConnectionTestTime: undefined,
      lastConnectionSuccess: undefined
    };

    setCameras(prev => [...prev, camera]);
    
    toast({
      title: "Camera added",
      description: `${camera.name} has been added successfully`,
    });

    setIsAddDialogOpen(false);
    setNewCamera({
      name: '',
      ipAddress: '',
      status: 'OFFLINE',
      port: 8080,
      description: ''
    });
  };

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
            <div className="text-2xl font-bold">{cameras.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cameras</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cameras.filter(c => c.status === 'ACTIVE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Offline Cameras</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cameras.filter(c => c.status === 'OFFLINE').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Associated Courts</CardTitle>
            <Link className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {cameras.filter(c => c.courtCamera).length}
            </div>
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
                    {camera.courtCamera ? (
                      <div className="flex items-center space-x-2">
                        <span>{camera.courtCamera.name}</span>
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
            <div>
              <Label htmlFor="court-select">Court</Label>
              <Select value={selectedCourtId} onValueChange={setSelectedCourtId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a court" />
                </SelectTrigger>
                <SelectContent>
                  {mockCourts.map((court) => (
                    <SelectItem key={court.id} value={court.id.toString()}>
                      {court.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAssociateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAssociateCamera}>
                Associate
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Camera Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Camera</DialogTitle>
            <DialogDescription>
              Add a new security camera to the system
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-name">Name *</Label>
              <Input
                id="new-name"
                placeholder="e.g., Court 1 Main Camera"
                value={newCamera.name || ''}
                onChange={(e) => setNewCamera(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="new-ip">IP Address *</Label>
              <Input
                id="new-ip"
                placeholder="e.g., 192.168.1.100"
                value={newCamera.ipAddress || ''}
                onChange={(e) => setNewCamera(prev => ({ ...prev, ipAddress: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="new-port">Port *</Label>
              <Input
                id="new-port"
                type="number"
                placeholder="8080"
                value={newCamera.port || ''}
                onChange={(e) => setNewCamera(prev => ({ ...prev, port: parseInt(e.target.value) || 8080 }))}
              />
            </div>
            <div>
              <Label htmlFor="new-status">Initial Status</Label>
              <Select 
                value={newCamera.status || 'OFFLINE'} 
                onValueChange={(value: CameraStatus) => setNewCamera(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="ERROR">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="new-description">Description</Label>
              <Textarea
                id="new-description"
                placeholder="Camera description (optional)"
                value={newCamera.description || ''}
                onChange={(e) => setNewCamera(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
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
              Update camera configuration and settings
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editingCamera.name || ''}
                onChange={(e) => setEditingCamera(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="ip">IP Address</Label>
              <Input
                id="ip"
                value={editingCamera.ipAddress || ''}
                onChange={(e) => setEditingCamera(prev => ({ ...prev, ipAddress: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                type="number"
                value={editingCamera.port || ''}
                onChange={(e) => setEditingCamera(prev => ({ ...prev, port: parseInt(e.target.value) }))}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editingCamera.description || ''}
                onChange={(e) => setEditingCamera(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
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