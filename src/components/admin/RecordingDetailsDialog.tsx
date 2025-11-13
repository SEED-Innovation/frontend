import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Download,
  Calendar,
  User,
  MapPin,
  Camera as CameraIcon,
  Video,
  HardDrive,
  Timer,
  AlertTriangle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RecordingChunk {
  id: number;
  chunkIndex: number;
  startTime: string;
  endTime: string;
  status: string;
  hikVisionTaskId: string;
  downloadUrl: string;
  localPath: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

interface MatchRecording {
  id: number;
  userId: string;
  courtId: number;
  sessionId: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'REQUESTING_CHUNKS' | 'POLLING' | 'DOWNLOADING' | 'CONSOLIDATING' | 'UPLOADING' | 'COMPLETED' | 'FAILED';
  s3Url: string;
  thumbnailUrl: string;
  fileSize: number;
  duration: number;
  retryCount: number;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
  chunks: RecordingChunk[];
}

interface RecordingDetailsDialogProps {
  recording: MatchRecording | null;
  open: boolean;
  onClose: () => void;
  onRetry?: (recordingId: number) => void;
}

const RecordingDetailsDialog: React.FC<RecordingDetailsDialogProps> = ({
  recording: initialRecording,
  open,
  onClose,
  onRetry,
}) => {
  const [recording, setRecording] = useState<MatchRecording | null>(initialRecording);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  useEffect(() => {
    if (open && initialRecording) {
      fetchRecordingDetails(initialRecording.id);
    }
  }, [open, initialRecording]);

  const fetchRecordingDetails = async (recordingId: number) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${API_BASE_URL}/api/recordings/admin/${recordingId}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch recording details');
      }

      const data = await response.json();
      setRecording(data);
    } catch (error) {
      console.error('Failed to fetch recording details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recording details',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
      REQUESTING_CHUNKS: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'Requesting' },
      POLLING: { color: 'bg-indigo-100 text-indigo-800', icon: Clock, label: 'Polling' },
      DOWNLOADING: { color: 'bg-purple-100 text-purple-800', icon: Download, label: 'Downloading' },
      CONSOLIDATING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw, label: 'Consolidating' },
      UPLOADING: { color: 'bg-orange-100 text-orange-800', icon: RefreshCw, label: 'Uploading' },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
      REQUESTED: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Requested' },
      READY: { color: 'bg-yellow-100 text-yellow-800', icon: Download, label: 'Ready' },
      DOWNLOADED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Downloaded' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return <Badge variant="outline">{status}</Badge>;

    const Icon = config.icon;

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  if (!recording) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Recording Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Recording Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Recording ID:</span>
                      <span className="text-sm font-mono">#{recording.id}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(recording.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Session ID:</span>
                      <span className="text-sm font-medium">#{recording.sessionId}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">User Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-mono">{recording.userId}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Location</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Court #{recording.courtId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Timing</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Start Time:</span>
                      <span className="text-sm">{formatDateTime(recording.startTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">End Time:</span>
                      <span className="text-sm">{formatDateTime(recording.endTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{formatDuration(recording.duration)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Processing</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Chunks:</span>
                      <span className="text-sm font-medium">{recording.chunks?.length || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Downloaded:</span>
                      <span className="text-sm font-medium">
                        {recording.chunks?.filter(c => c.status === 'DOWNLOADED').length || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">File Size:</span>
                      <span className="text-sm font-medium">{formatFileSize(recording.fileSize)}</span>
                    </div>
                    {recording.s3Url && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">S3 URL:</span>
                        <a 
                          href={recording.s3Url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline truncate max-w-[200px]"
                        >
                          View Video
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Retry Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Retry Count:</span>
                      <span className="text-sm font-medium">{recording.retryCount}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Created:</span>
                      <span className="text-sm">{formatDateTime(recording.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Updated:</span>
                      <span className="text-sm">{formatDateTime(recording.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {recording.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-red-900 mb-1">Error</h4>
                    <p className="text-sm text-red-700">{recording.errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Chunks Table */}
            {recording.chunks && recording.chunks.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Recording Chunks ({recording.chunks.length})</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">#</TableHead>
                        <TableHead>HikVision Task ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Start Time</TableHead>
                        <TableHead>End Time</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Local Path</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recording.chunks.map((chunk) => (
                        <TableRow key={chunk.id}>
                          <TableCell className="font-medium">{chunk.chunkIndex}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {chunk.hikVisionTaskId ? chunk.hikVisionTaskId.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>{getStatusBadge(chunk.status)}</TableCell>
                          <TableCell className="text-xs">{formatDateTime(chunk.startTime)}</TableCell>
                          <TableCell className="text-xs">{formatDateTime(chunk.endTime)}</TableCell>
                          <TableCell>{formatFileSize(chunk.fileSize)}</TableCell>
                          <TableCell className="text-xs font-mono truncate max-w-[150px]">
                            {chunk.localPath || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t">
              {recording.status === 'FAILED' && onRetry && (
                <Button
                  onClick={() => onRetry(recording.id)}
                  variant="outline"
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry Recording
                </Button>
              )}
              <Button onClick={onClose} variant="outline">
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecordingDetailsDialog;
