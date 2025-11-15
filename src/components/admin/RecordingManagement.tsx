import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Search,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  User,
  MapPin,
  Plus,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import RecordingDetailsDialog from './RecordingDetailsDialog';
import CreateRecordingDialog from './CreateRecordingDialog';
import { adminRecordingService, type MatchRecording } from '@/lib/api/services/adminRecordingService';

interface RecordingStats {
  total: number;
  pending: number;
  requestingChunks: number;
  polling: number;
  downloading: number;
  consolidating: number;
  uploading: number;
  completed: number;
  failed: number;
}

const RecordingManagement: React.FC = () => {
  const [recordings, setRecordings] = useState<MatchRecording[]>([]);
  const [stats, setStats] = useState<RecordingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState<MatchRecording | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [associateDialogOpen, setAssociateDialogOpen] = useState(false);
  const [recordingToAssociate, setRecordingToAssociate] = useState<MatchRecording | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecordings();
  }, [currentPage, pageSize, statusFilter]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Reset to page 0 when filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [statusFilter]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await adminRecordingService.getAllRecordings(
        currentPage,
        pageSize,
        statusFilter
      );

      // Debug: Log unique statuses
      const uniqueStatuses = [...new Set(response.content.map(r => r.status))];
      console.log('Unique recording statuses:', uniqueStatuses);

      setRecordings(response.content);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recordings',
        variant: 'destructive',
      });
      setRecordings([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Fetch all recordings for stats (without pagination)
      const response = await adminRecordingService.getAllRecordings(0, 10000, undefined);
      const recordings = response.content;
      
      const stats: RecordingStats = {
        total: recordings.length,
        pending: recordings.filter((r: MatchRecording) => r.status === 'PENDING').length,
        requestingChunks: recordings.filter((r: MatchRecording) => 
          r.status === 'REQUESTING_CHUNKS' || r.status === 'RECORDING'
        ).length,
        polling: recordings.filter((r: MatchRecording) => r.status === 'POLLING').length,
        downloading: recordings.filter((r: MatchRecording) => r.status === 'DOWNLOADING').length,
        consolidating: recordings.filter((r: MatchRecording) => 
          r.status === 'CONSOLIDATING' || r.status === 'PROCESSING'
        ).length,
        uploading: recordings.filter((r: MatchRecording) => r.status === 'UPLOADING').length,
        completed: recordings.filter((r: MatchRecording) => 
          r.status === 'COMPLETED' || r.status === 'READY'
        ).length,
        failed: recordings.filter((r: MatchRecording) => 
          r.status === 'FAILED' || r.status === 'CANCELLED'
        ).length,
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Pending' },
      STARTING: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Starting' },
      REQUESTING_CHUNKS: { color: 'bg-blue-100 text-blue-800', icon: RefreshCw, label: 'Requesting' },
      RECORDING: { color: 'bg-blue-100 text-blue-800', icon: Video, label: 'Recording' },
      POLLING: { color: 'bg-indigo-100 text-indigo-800', icon: Clock, label: 'Polling' },
      DOWNLOADING: { color: 'bg-purple-100 text-purple-800', icon: Download, label: 'Downloading' },
      CONSOLIDATING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw, label: 'Consolidating' },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw, label: 'Processing' },
      UPLOADING: { color: 'bg-orange-100 text-orange-800', icon: RefreshCw, label: 'Uploading' },
      COMPLETED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Completed' },
      READY: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready' },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
      CANCELLED: { color: 'bg-orange-100 text-orange-800', icon: XCircle, label: 'Cancelled' },
      ARCHIVED: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Archived' },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    
    // Fallback for unknown statuses
    if (!config) {
      return (
        <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {status || 'Unknown'}
        </Badge>
      );
    }

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

  const handleRetry = async (recordingId: string) => {
    try {
      await adminRecordingService.retryRecording(recordingId);

      toast({
        title: 'Success',
        description: 'Recording retry initiated successfully',
      });
      
      // Refresh recordings list
      fetchRecordings();
      fetchStats();
      setSelectedRecording(null);
    } catch (error: any) {
      console.error('Failed to retry recording:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to retry recording',
        variant: 'destructive',
      });
    }
  };

  const handleStopProcessing = async (recordingId: string) => {
    if (!confirm('Are you sure you want to cancel this recording? This action cannot be undone.')) {
      return;
    }

    try {
      await adminRecordingService.cancelRecording(recordingId);

      toast({
        title: 'Success',
        description: 'Recording cancelled successfully',
      });

      // Refresh recordings list
      fetchRecordings();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to cancel recording:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to cancel recording',
        variant: 'destructive',
      });
    }
  };

  const handleAssociate = (recording: MatchRecording) => {
    setRecordingToAssociate(recording);
    setAssociateDialogOpen(true);
  };

  const handleAssociateSubmit = async (userId: string, bookingId?: number, notes?: string) => {
    if (!recordingToAssociate) return;

    try {
      await adminRecordingService.associateRecording(
        recordingToAssociate.recordingId,
        userId,
        bookingId,
        notes
      );

      toast({
        title: 'Success',
        description: 'Recording associated successfully',
      });

      setAssociateDialogOpen(false);
      setRecordingToAssociate(null);
      fetchRecordings();
      fetchStats();
    } catch (error: any) {
      console.error('Failed to associate recording:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to associate recording',
        variant: 'destructive',
      });
    }
  };

  // Client-side search filtering (since backend doesn't support search yet)
  const filteredRecordings = searchTerm ? recordings.filter(recording => {
    const searchLower = searchTerm.toLowerCase();
    return (
      recording.userId?.toString().toLowerCase().includes(searchLower) ||
      recording.userName?.toLowerCase().includes(searchLower) ||
      recording.userEmail?.toLowerCase().includes(searchLower) ||
      recording.id?.toString().includes(searchLower) ||
      recording.recordingId?.toLowerCase().includes(searchLower) ||
      recording.bookingId?.toString().includes(searchLower) ||
      recording.courtId?.toString().includes(searchLower) ||
      recording.courtName?.toLowerCase().includes(searchLower)
    );
  }) : recordings;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recording Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage match recordings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Recording
          </Button>
          <Button onClick={fetchRecordings} variant="outline" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Video className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.pending + stats.requestingChunks + stats.polling + stats.downloading + stats.consolidating + stats.uploading}
                  </p>
                </div>
                <RefreshCw className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
                </div>
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search by recording ID, user ID, session ID, or court ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="requesting_chunks">Requesting Chunks</SelectItem>
                <SelectItem value="recording">Recording</SelectItem>
                <SelectItem value="polling">Polling</SelectItem>
                <SelectItem value="downloading">Downloading</SelectItem>
                <SelectItem value="consolidating">Consolidating</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Recordings Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recordings ({filteredRecordings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredRecordings.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No recordings found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Session</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Chunks</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecordings.map((recording) => (
                    <TableRow key={recording.id}>
                      <TableCell className="font-mono text-xs">
                        #{recording.id}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {recording.userName && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="text-sm">{recording.userName}</span>
                            </div>
                          )}
                          {recording.userEmail && (
                            <span className="text-xs text-gray-500">{recording.userEmail}</span>
                          )}
                          {!recording.userName && !recording.userEmail && recording.userId && (
                            <span className="font-mono text-xs">ID: {recording.userId}</span>
                          )}
                          {!recording.userName && !recording.userEmail && !recording.userId && (
                            <span className="text-xs text-gray-400">Manual Recording</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {recording.bookingId ? `#${recording.bookingId}` : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>{recording.courtName || `Court ${recording.courtId || '-'}`}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          {getStatusBadge(recording.status)}
                          {recording.status === 'FAILED' && recording.errorMessage && (
                            <div className="flex items-start gap-1 mt-1 text-xs text-red-600 max-w-[200px]">
                              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
                              <span className="line-clamp-2" title={recording.errorMessage}>
                                {recording.errorMessage}
                              </span>
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(recording.checkInTime || recording.createdAt)}
                      </TableCell>
                      <TableCell>{formatDuration(recording.totalDurationSeconds || 0)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: recording.totalChunks && recording.totalChunks > 0
                                  ? `${((recording.uploadedChunks || 0) / recording.totalChunks) * 100}%`
                                  : '0%',
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {recording.uploadedChunks || 0}/{recording.totalChunks || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={recording.retryCount > 0 ? 'destructive' : 'secondary'}>
                          {recording.retryCount}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedRecording(recording)}
                            className="gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Button>
                          
                          {recording.videoUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                console.log('Download clicked for recording:', recording.id, 'URL:', recording.videoUrl);
                                if (recording.videoUrl) {
                                  window.open(recording.videoUrl, '_blank');
                                }
                              }}
                              className="gap-1 text-green-600 hover:text-green-700"
                              title="Download recording video"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </Button>
                          )}
                          
                          {!recording.videoUrl && (recording.status === 'READY' || recording.status === 'COMPLETED') && (
                            <span className="text-xs text-gray-400" title="Video URL not available">
                              No URL
                            </span>
                          )}
                          
                          {recording.status === 'FAILED' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRetry(recording.recordingId)}
                              className="gap-1 text-orange-600 hover:text-orange-700"
                            >
                              <RefreshCw className="w-4 h-4" />
                              Retry
                            </Button>
                          )}
                          
                          {(recording.status === 'PENDING' || 
                            recording.status === 'STARTING' ||
                            recording.status === 'REQUESTING_CHUNKS' || 
                            recording.status === 'RECORDING' || 
                            recording.status === 'POLLING' ||
                            recording.status === 'DOWNLOADING' ||
                            recording.status === 'CONSOLIDATING' ||
                            recording.status === 'PROCESSING' ||
                            recording.status === 'UPLOADING') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStopProcessing(recording.recordingId)}
                              className="gap-1 text-red-600 hover:text-red-700"
                              title="Cancel this recording"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </Button>
                          )}
                          
                          {recording.isManualRecording && !recording.userId && 
                           (recording.status === 'COMPLETED' || recording.status === 'READY') && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAssociate(recording)}
                              className="gap-1 text-blue-600 hover:text-blue-700"
                              title="Associate this recording with a user"
                            >
                              <User className="w-4 h-4" />
                              Associate
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-gray-500">
                Showing {currentPage * pageSize + 1} to {Math.min((currentPage + 1) * pageSize, totalElements)} of {totalElements} recordings
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(0)}
                  disabled={currentPage === 0}
                >
                  First
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-700 px-2">
                  Page {currentPage + 1} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                  disabled={currentPage === totalPages - 1}
                >
                  Next
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(totalPages - 1)}
                  disabled={currentPage === totalPages - 1}
                >
                  Last
                </Button>
              </div>
              <Select value={pageSize.toString()} onValueChange={(value) => {
                setPageSize(parseInt(value));
                setCurrentPage(0);
              }}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                  <SelectItem value="100">100 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recording Details Dialog */}
      <RecordingDetailsDialog
        recording={selectedRecording}
        open={!!selectedRecording}
        onClose={() => setSelectedRecording(null)}
        onRetry={handleRetry}
      />

      {/* Create Recording Dialog */}
      <CreateRecordingDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          fetchRecordings();
          fetchStats();
        }}
      />

      {/* Associate Recording Dialog */}
      {associateDialogOpen && recordingToAssociate && (
        <AssociateRecordingDialog
          open={associateDialogOpen}
          recording={recordingToAssociate}
          onClose={() => {
            setAssociateDialogOpen(false);
            setRecordingToAssociate(null);
          }}
          onSubmit={handleAssociateSubmit}
        />
      )}
    </div>
  );
};

// Enhanced Associate Recording Dialog Component with User & Booking Selects
interface AssociateRecordingDialogProps {
  open: boolean;
  recording: MatchRecording;
  onClose: () => void;
  onSubmit: (userId: string, bookingId?: number, notes?: string) => void;
}

const AssociateRecordingDialog: React.FC<AssociateRecordingDialogProps> = ({
  open,
  recording,
  onClose,
  onSubmit,
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedBookingId, setSelectedBookingId] = useState('');
  const [notes, setNotes] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const { toast } = useToast();

  // Load users when dialog opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Load bookings when user is selected
  useEffect(() => {
    if (selectedUserId) {
      fetchUserBookings(parseInt(selectedUserId));
    } else {
      setBookings([]);
      setSelectedBookingId('');
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/users/paged?page=0&size=100`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch users');
      
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive',
      });
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserBookings = async (userId: number) => {
    try {
      setLoadingBookings(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/api/admin/bookings/user/${userId}?page=0&size=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch bookings');
      
      const data = await response.json();
      setBookings(data || []);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user bookings',
        variant: 'destructive',
      });
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user',
        variant: 'destructive',
      });
      return;
    }
    // Handle booking ID - skip if "no-booking" is selected
    const bookingIdToSubmit = selectedBookingId && selectedBookingId !== 'no-booking' 
      ? parseInt(selectedBookingId) 
      : undefined;
    onSubmit(selectedUserId, bookingIdToSubmit, notes || undefined);
  };

  const filteredUsers = userSearch
    ? users.filter(user => {
        const searchLower = userSearch.toLowerCase();
        return (
          user.email?.toLowerCase().includes(searchLower) ||
          user.firstName?.toLowerCase().includes(searchLower) ||
          user.lastName?.toLowerCase().includes(searchLower) ||
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchLower)
        );
      })
    : users;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Associate Recording with User</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">
              <span className="font-medium">Recording ID:</span> <span className="font-mono">{recording.recordingId}</span>
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Court:</span> {recording.courtName || 'N/A'} | 
              <span className="font-medium ml-2">Camera:</span> {recording.cameraName || 'N/A'}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Select User <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="mb-2"
            />
            <Select value={selectedUserId} onValueChange={setSelectedUserId} disabled={loadingUsers}>
              <SelectTrigger>
                <SelectValue placeholder={loadingUsers ? "Loading users..." : "Select a user"} />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.length === 0 ? (
                  <SelectItem value="none" disabled>No users found</SelectItem>
                ) : (
                  filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.firstName} {user.lastName}</span>
                        <span className="text-xs text-gray-500">{user.email}</span>
                      </div>
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedUserId && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Select Booking (Optional)
              </label>
              <Select value={selectedBookingId} onValueChange={setSelectedBookingId} disabled={loadingBookings}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingBookings ? "Loading bookings..." : "Select a booking (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-booking">No booking</SelectItem>
                  {bookings.length === 0 ? (
                    <SelectItem value="none" disabled>No bookings found for this user</SelectItem>
                  ) : (
                    bookings.map((booking) => (
                      <SelectItem key={booking.id} value={booking.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">Booking #{booking.id}</span>
                          <span className="text-xs text-gray-500">
                            {booking.courtName || `Court ${booking.courtId}`} - {new Date(booking.startTime).toLocaleString()}
                          </span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">
              Notes (Optional)
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedUserId}>
              Associate Recording
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RecordingManagement;
