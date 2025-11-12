import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Video,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Download,
  Calendar,
  User,
  MapPin,
  Camera as CameraIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import axios from 'axios';

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
  totalChunks: number;
  uploadedChunks: number;
  consolidatedChunks: number;
  totalFileSizeBytes: number;
  totalDurationSeconds: number;
  retryCount: number;
  maxRetries: number;
  errorMessage: string;
  notificationSent: boolean;
  consolidationCompletedAt: string;
  createdAt: string;
  updatedAt: string;
}

interface RecordingStats {
  total: number;
  recording: number;
  processing: number;
  ready: number;
  failed: number;
}

const RecordingManagement: React.FC = () => {
  const [recordings, setRecordings] = useState<MatchRecording[]>([]);
  const [stats, setStats] = useState<RecordingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState<MatchRecording | null>(null);
  const { toast } = useToast();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    fetchRecordings();
    fetchStats();
  }, [currentPage, statusFilter]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const params: any = {
        page: currentPage,
        size: 20,
      };
      
      if (statusFilter !== 'all') {
        params.status = statusFilter.toUpperCase();
      }

      const response = await axios.get(`${API_BASE_URL}/api/admin/recordings/match`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setRecordings(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recordings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API_BASE_URL}/api/admin/recordings/match/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      RECORDING: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Recording' },
      PROCESSING: { color: 'bg-yellow-100 text-yellow-800', icon: RefreshCw, label: 'Processing' },
      READY: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Ready' },
      FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Failed' },
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

  const handleRetry = async (recordingId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${API_BASE_URL}/api/admin/recordings/match/${recordingId}/retry`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast({
          title: 'Success',
          description: response.data.message,
        });
        
        // Refresh recordings list
        fetchRecordings();
        fetchStats();
        setSelectedRecording(null);
      } else {
        toast({
          title: 'Error',
          description: response.data.message,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Failed to retry recording:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to retry recording',
        variant: 'destructive',
      });
    }
  };

  const filteredRecordings = recordings.filter(recording => {
    const searchLower = searchTerm.toLowerCase();
    return (
      recording.userName?.toLowerCase().includes(searchLower) ||
      recording.userEmail?.toLowerCase().includes(searchLower) ||
      recording.courtName?.toLowerCase().includes(searchLower) ||
      recording.facilityName?.toLowerCase().includes(searchLower) ||
      recording.recordingId?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recording Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage match recordings</p>
        </div>
        <Button onClick={fetchRecordings} variant="outline" className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  <p className="text-sm text-gray-500">Recording</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.recording}</p>
                </div>
                <Clock className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Processing</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.processing}</p>
                </div>
                <RefreshCw className="w-8 h-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Ready</p>
                  <p className="text-2xl font-bold text-green-600">{stats.ready}</p>
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
                  placeholder="Search by user, email, court, facility, or recording ID..."
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
                <SelectItem value="recording">Recording</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="ready">Ready</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
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
                    <TableHead>Recording ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Court</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check-in</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecordings.map((recording) => (
                    <TableRow key={recording.id}>
                      <TableCell className="font-mono text-xs">
                        {recording.recordingId.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{recording.userName}</p>
                            <p className="text-xs text-gray-500">{recording.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{recording.courtName}</p>
                            <p className="text-xs text-gray-500">{recording.facilityName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(recording.status)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(recording.checkInTime)}
                      </TableCell>
                      <TableCell>{formatDuration(recording.totalDurationSeconds)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: `${(recording.uploadedChunks / recording.totalChunks) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {recording.uploadedChunks}/{recording.totalChunks}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecording(recording)}
                          className="gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </Button>
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
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-500">
                Page {currentPage + 1} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                disabled={currentPage === totalPages - 1}
              >
                Next
              </Button>
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
    </div>
  );
};

export default RecordingManagement;
