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
import axios from 'axios';

interface RecordingChunk {
  id: number;
  chunkNumber: number;
  hikVisionTaskId: string;
  recordingStartTime: string;
  recordingEndTime: string;
  status: 'PENDING' | 'HIK_PROCESSING' | 'READY_TO_DOWNLOAD' | 'DOWNLOADED' | 'CONSOLIDATED' | 'FAILED';
  hikVisionDownloadUrl: string;
  fileSizeBytes: number;
  durationSeconds: number;
  downloadedAt: string;
  hikVisionPollAttempts: number;
  errorMessage: string;
}

interface MatchRecording {
  id: number;
  recordingId: string;
  bookingId: number;
  userId: number;
  userName: string;
  userEmail: string;
  cameraId: number;
  cameraName: string;
  courtName: string;
  facilityName: string;
  status: 'RECORDING' | 'PROCESSING' | 'READY' | 'FAILED';
  checkInTime: string;
  checkOutTime: string;
  firstChunkStartTime: string;
  totalChunks: number;
  uploadedChunks: number;
  consolidatedChunks: number;
  consolidatedS3Key: string;
  totalFileSizeBytes: number;
  totalDurationSeconds: number;
  retryCount: number;
  maxRetries: number;
  lastRetryAt: string;
  consolidationStartedAt: string;
  consolidationCompletedAt: string;
  errorMessage: string;
  notificationSent: boolean;
  notificationSentAt: string;
  createdAt: string;
  updatedAt: string;
  chunks?: RecordingChunk[];
}

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

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    if (open && initialRecording) {
      fetchRecordingDetails(initialRecording.recordingId);
    }
  }, [open, initialRecording]);

  const fetchRecordingDetails = async (recordingId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(
        `${API_BASE_URL}/api/admin/recordings/match/${recordingId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecording(response.data);
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
      RECORDING: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Recording' },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw, label: 'Processing' },
      READY: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready' },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
      PENDING: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
      HIK_PROCESSING: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'HikVision Processing' },
      READY_TO_DOWNLOAD: { color: 'bg-yellow-100 text-yellow-800', icon: Download, label: 'Ready to Download' },
      DOWNLOADED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Downloaded' },
      CONSOLIDATED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Consolidated' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    if (!config) return null;

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
                      <span className="text-sm font-mono">{recording.recordingId.substring(0, 16)}...</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      {getStatusBadge(recording.status)}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Booking ID:</span>
                      <span className="text-sm font-medium">#{recording.bookingId}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">User Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{recording.userName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{recording.userEmail}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Location</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{recording.courtName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{recording.facilityName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CameraIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">{recording.cameraName || `Camera #${recording.cameraId}`}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Timing</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Check-in:</span>
                      <span className="text-sm">{formatDateTime(recording.checkInTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Check-out:</span>
                      <span className="text-sm">{formatDateTime(recording.checkOutTime)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Duration:</span>
                      <span className="text-sm font-medium">{formatDuration(recording.totalDurationSeconds)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Processing</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Total Chunks:</span>
                      <span className="text-sm font-medium">{recording.totalChunks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uploaded:</span>
                      <span className="text-sm font-medium">{recording.uploadedChunks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Consolidated:</span>
                      <span className="text-sm font-medium">{recording.consolidatedChunks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">File Size:</span>
                      <span className="text-sm font-medium">{formatFileSize(recording.totalFileSizeBytes)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-500 mb-2">Retry Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Retry Count:</span>
                      <span className="text-sm font-medium">{recording.retryCount} / {recording.maxRetries}</span>
                    </div>
                    {recording.lastRetryAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Retry:</span>
                        <span className="text-sm">{formatDateTime(recording.lastRetryAt)}</span>
                      </div>
                    )}
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

            {/* Consolidation Timeline */}
            {(recording.consolidationStartedAt || recording.consolidationCompletedAt) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-2">Consolidation Timeline</h3>
                <div className="space-y-2">
                  {recording.consolidationStartedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Started:</span>
                      <span className="text-sm">{formatDateTime(recording.consolidationStartedAt)}</span>
                    </div>
                  )}
                  {recording.consolidationCompletedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Completed:</span>
                      <span className="text-sm">{formatDateTime(recording.consolidationCompletedAt)}</span>
                    </div>
                  )}
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
                        <TableHead>Duration</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Poll Attempts</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recording.chunks.map((chunk) => (
                        <TableRow key={chunk.id}>
                          <TableCell className="font-medium">{chunk.chunkNumber}</TableCell>
                          <TableCell className="font-mono text-xs">
                            {chunk.hikVisionTaskId.substring(0, 12)}...
                          </TableCell>
                          <TableCell>{getStatusBadge(chunk.status)}</TableCell>
                          <TableCell className="text-xs">{formatDateTime(chunk.recordingStartTime)}</TableCell>
                          <TableCell className="text-xs">{formatDateTime(chunk.recordingEndTime)}</TableCell>
                          <TableCell>{formatDuration(chunk.durationSeconds)}</TableCell>
                          <TableCell>{formatFileSize(chunk.fileSizeBytes)}</TableCell>
                          <TableCell>{chunk.hikVisionPollAttempts}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                {recording.notificationSent && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Notification Sent
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {recording.status === 'FAILED' && recording.retryCount < recording.maxRetries && onRetry && (
                  <Button
                    onClick={() => onRetry(recording.recordingId)}
                    variant="outline"
                    className="gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Retry Consolidation
                  </Button>
                )}
                <Button onClick={onClose} variant="outline">
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecordingDetailsDialog;
