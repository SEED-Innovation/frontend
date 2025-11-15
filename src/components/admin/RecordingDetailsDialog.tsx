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
import { adminRecordingService, type MatchRecording, type RecordingChunk } from '@/lib/api/services/adminRecordingService';

interface RecordingDetailsDialogProps {
  recording: MatchRecording | null;
  open: boolean;
  onClose: () => void;
  onRetry?: (recordingId: string) => void;
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
      fetchRecordingDetails(initialRecording.recordingId);
    }
  }, [open, initialRecording]);

  const fetchRecordingDetails = async (recordingId: string) => {
    try {
      setLoading(true);
      const recordingData = await adminRecordingService.getRecordingById(recordingId);
      setRecording(recordingData);
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

  const handleRetry = async () => {
    if (!recording) return;
    
    try {
      if (onRetry) {
        onRetry(recording.recordingId);
      }
    } catch (error) {
      console.error('Failed to retry recording:', error);
    }
  };

  // Remove old fetch code
  const oldFetch = async (recordingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(
        `${API_BASE_URL}/api/admin/recordings/match/${recordingId}`,
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
                      <span className="text-sm text-gray-600">UUID:</span>
                      <span className="text-xs font-mono text-gray-500" title={recording.recordingId}>
                        {recording.recordingId.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(recording.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Booking ID:</span>
                      <span className="text-sm font-medium">{recording.bookingId ? `#${recording.bookingId}` : 'N/A'}</span>
                    </div>
                    {recording.isManualRecording && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <Badge className="bg-purple-100 text-purple-800">Manual Recording</Badge>
                      </div>
                    )}
                    {recording.description && (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">Description:</span>
                        <span className="text-sm text-gray-700">{recording.description}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">User Information</h3>
                  <div className="space-y-2">
                    {recording.userName && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{recording.userName}</span>
                      </div>
                    )}
                    {recording.userEmail && (
                      <div className="text-sm text-gray-600">{recording.userEmail}</div>
                    )}
                    {recording.userId && (
                      <div className="text-xs text-gray-500">User ID: {recording.userId}</div>
                    )}
                    {!recording.userName && !recording.userEmail && !recording.userId && (
                      <div className="text-sm text-gray-400">No user associated</div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Location</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{recording.courtName || `Court #${recording.courtId || 'N/A'}`}</span>
                    </div>
                    {recording.cameraName && (
                      <div className="flex items-center gap-2">
                        <CameraIcon className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{recording.cameraName}</span>
                      </div>
                    )}
                    {recording.facilityName && (
                      <div className="text-xs text-gray-500">{recording.facilityName}</div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Timing</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Check-In:</span>
                      <span className="text-sm">{formatDateTime(recording.checkInTime || recording.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Check-Out:</span>
                      <span className="text-sm">{formatDateTime(recording.checkOutTime || '')}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{formatDuration(recording.totalDurationSeconds || 0)}</span>
                    </div>
                    {recording.firstChunkStartTime && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">First Chunk:</span>
                        <span className="text-sm">{formatDateTime(recording.firstChunkStartTime)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Processing</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Chunks:</span>
                      <span className="text-sm font-medium">{recording.totalChunks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uploaded:</span>
                      <span className="text-sm font-medium">{recording.uploadedChunks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Consolidated:</span>
                      <span className="text-sm font-medium">{recording.consolidatedChunks || 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">File Size:</span>
                      <span className="text-sm font-medium">{formatFileSize(recording.totalFileSizeBytes || 0)}</span>
                    </div>
                    {recording.consolidatedS3Key && (
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-gray-600">S3 Location:</span>
                        <span className="text-xs font-mono text-gray-500 break-all">
                          {recording.consolidatedS3Bucket && `${recording.consolidatedS3Bucket}/`}{recording.consolidatedS3Key}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Status & Retry Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Retry Count:</span>
                      <span className="text-sm font-medium">{recording.retryCount || 0} / {recording.maxRetries || 5}</span>
                    </div>
                    {recording.lastRetryAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Retry:</span>
                        <span className="text-sm">{formatDateTime(recording.lastRetryAt)}</span>
                      </div>
                    )}
                    {recording.consolidationStartedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Consolidation Started:</span>
                        <span className="text-sm">{formatDateTime(recording.consolidationStartedAt)}</span>
                      </div>
                    )}
                    {recording.consolidationCompletedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Consolidation Completed:</span>
                        <span className="text-sm">{formatDateTime(recording.consolidationCompletedAt)}</span>
                      </div>
                    )}
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

            {/* Status Progress Section */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Recording Status & Progress
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Status:</span>
                  {getStatusBadge(recording.status)}
                </div>
                
                {/* Progress bar for chunk processing */}
                {recording.totalChunks > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Chunk Progress</span>
                      <span className="text-xs text-gray-600">
                        {recording.uploadedChunks || 0} / {recording.totalChunks}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((recording.uploadedChunks || 0) / recording.totalChunks) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Consolidation progress */}
                {recording.consolidatedChunks > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-600">Consolidation Progress</span>
                      <span className="text-xs text-gray-600">
                        {recording.consolidatedChunks} / {recording.totalChunks}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{
                          width: `${((recording.consolidatedChunks || 0) / (recording.totalChunks || 1)) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Status timeline */}
                <div className="border-t pt-3 mt-3">
                  <div className="text-xs text-gray-500 space-y-1">
                    {recording.createdAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Created: {formatDateTime(recording.createdAt)}</span>
                      </div>
                    )}
                    {recording.consolidationStartedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-blue-500" />
                        <span>Consolidation started: {formatDateTime(recording.consolidationStartedAt)}</span>
                      </div>
                    )}
                    {recording.consolidationCompletedAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>Consolidation completed: {formatDateTime(recording.consolidationCompletedAt)}</span>
                      </div>
                    )}
                    {recording.notificationSent && recording.notificationSentAt && (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        <span>User notified: {formatDateTime(recording.notificationSentAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {recording.errorMessage && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-red-900 mb-2">Error Details</h4>
                    <p className="text-sm text-red-700 whitespace-pre-wrap break-words">{recording.errorMessage}</p>
                    {recording.lastRetryAt && (
                      <p className="text-xs text-red-600 mt-2">
                        Last retry attempt: {formatDateTime(recording.lastRetryAt)}
                      </p>
                    )}
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
                          <TableCell className="font-medium">{chunk.chunkNumber}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {chunk.hikVisionTaskId ? chunk.hikVisionTaskId.substring(0, 12) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell>{getStatusBadge(chunk.status)}</TableCell>
                          <TableCell className="text-xs">{formatDateTime(chunk.startTime)}</TableCell>
                          <TableCell className="text-xs">{formatDateTime(chunk.endTime)}</TableCell>
                          <TableCell>{formatFileSize(chunk.fileSizeBytes)}</TableCell>
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
                  onClick={() => onRetry(recording.recordingId)}
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
