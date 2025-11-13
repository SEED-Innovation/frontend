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
  const [totalPages, setTotalPages] = useState(0);
  const [selectedRecording, setSelectedRecording] = useState<MatchRecording | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRecordings();
    fetchStats();
  }, [currentPage, statusFilter]);

  const fetchRecordings = async () => {
    try {
      setLoading(true);
      const response = await adminRecordingService.getAllRecordings();
      const allRecordings = Array.isArray(response) ? response : [];

      let filteredData = allRecordings;
      
      // Apply status filter
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter((r: MatchRecording) => 
          r.status.toLowerCase() === statusFilter.toLowerCase()
        );
      }

      setRecordings(filteredData);
      setTotalPages(Math.ceil(filteredData.length / 20));
    } catch (error) {
      console.error('Failed to fetch recordings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load recordings',
        variant: 'destructive',
      });
      setRecordings([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await adminRecordingService.getAllRecordings();
      const recordings = Array.isArray(response) ? response : [];
      
      const stats: RecordingStats = {
        total: recordings.length,
        pending: recordings.filter((r: MatchRecording) => r.status === 'PENDING').length,
        requestingChunks: recordings.filter((r: MatchRecording) => r.status === 'REQUESTING_CHUNKS').length,
        polling: recordings.filter((r: MatchRecording) => r.status === 'POLLING').length,
        downloading: recordings.filter((r: MatchRecording) => r.status === 'DOWNLOADING').length,
        consolidating: recordings.filter((r: MatchRecording) => r.status === 'CONSOLIDATING').length,
        uploading: recordings.filter((r: MatchRecording) => r.status === 'UPLOADING').length,
        completed: recordings.filter((r: MatchRecording) => r.status === 'COMPLETED').length,
        failed: recordings.filter((r: MatchRecording) => r.status === 'FAILED').length,
      };
      
      setStats(stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  const handleRetry = async (recordingId: number) => {
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
        description: error.response?.data?.message || 'Failed to retry recording',
        variant: 'destructive',
      });
    }
  };

  const filteredRecordings = recordings.filter(recording => {
    const searchLower = searchTerm.toLowerCase();
    return (
      recording.userId?.toLowerCase().includes(searchLower) ||
      recording.id?.toString().includes(searchLower) ||
      recording.sessionId?.toString().includes(searchLower) ||
      recording.courtId?.toString().includes(searchLower)
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
                <SelectItem value="requesting_chunks">Requesting</SelectItem>
                <SelectItem value="polling">Polling</SelectItem>
                <SelectItem value="downloading">Downloading</SelectItem>
                <SelectItem value="consolidating">Consolidating</SelectItem>
                <SelectItem value="uploading">Uploading</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
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
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-mono text-xs">{recording.userId}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        #{recording.sessionId}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span>Court {recording.courtId}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(recording.status)}</TableCell>
                      <TableCell className="text-sm">
                        {formatDateTime(recording.startTime)}
                      </TableCell>
                      <TableCell>{formatDuration(recording.duration)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-[60px]">
                            <div
                              className="bg-primary h-2 rounded-full transition-all"
                              style={{
                                width: recording.chunks?.length > 0 
                                  ? `${(recording.chunks.filter(c => c.status === 'DOWNLOADED').length / recording.chunks.length) * 100}%`
                                  : '0%',
                              }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {recording.chunks?.filter(c => c.status === 'DOWNLOADED').length || 0}/{recording.chunks?.length || 0}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={recording.retryCount > 0 ? 'destructive' : 'secondary'}>
                          {recording.retryCount}
                        </Badge>
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

      {/* Create Recording Dialog */}
      <CreateRecordingDialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        onSuccess={() => {
          fetchRecordings();
          fetchStats();
        }}
      />
    </div>
  );
};

export default RecordingManagement;
