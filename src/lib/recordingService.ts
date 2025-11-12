import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface Recording {
  id: number;
  recordingId: string;
  userId: string;
  courtId: number;
  courtName: string;
  facilityName: string;
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
  chunks?: RecordingChunk[];
}

export interface RecordingChunk {
  id: number;
  chunkIndex: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'REQUESTED' | 'READY' | 'DOWNLOADING' | 'DOWNLOADED' | 'FAILED';
  hikVisionTaskId: string;
  downloadUrl: string;
  localPath: string;
  fileSize: number;
}

class RecordingService {
  private getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Get all recordings for the authenticated user
   */
  async getUserRecordings(): Promise<Recording[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recordings/user`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch user recordings:', error);
      throw error;
    }
  }

  /**
   * Get a specific recording by ID (user must own it)
   */
  async getRecordingById(id: number): Promise<Recording> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/recordings/user/${id}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch recording ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get presigned URL for video playback
   */
  async getRecordingPlaybackUrl(recordingId: string, expirationMinutes: number = 60): Promise<string> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/recordings/user/${recordingId}/playback-url`,
        {
          headers: this.getAuthHeaders(),
          params: { expirationMinutes },
        }
      );
      return response.data.url;
    } catch (error) {
      console.error(`Failed to get playback URL for recording ${recordingId}:`, error);
      throw error;
    }
  }

  /**
   * Download recording
   */
  async downloadRecording(recordingId: string): Promise<void> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/recordings/user/${recordingId}/download`,
        {
          headers: this.getAuthHeaders(),
          responseType: 'blob',
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `recording-${recordingId}.mp4`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(`Failed to download recording ${recordingId}:`, error);
      throw error;
    }
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  }

  /**
   * Get status display info
   */
  getStatusInfo(status: string): { label: string; color: string; description: string } {
    const statusMap: Record<string, { label: string; color: string; description: string }> = {
      PENDING: {
        label: 'Pending',
        color: 'gray',
        description: 'Recording request created, waiting to start',
      },
      REQUESTING_CHUNKS: {
        label: 'Requesting',
        color: 'blue',
        description: 'Requesting video chunks from HikVision',
      },
      POLLING: {
        label: 'Processing',
        color: 'yellow',
        description: 'Waiting for HikVision to prepare your video',
      },
      DOWNLOADING: {
        label: 'Downloading',
        color: 'blue',
        description: 'Downloading video chunks',
      },
      CONSOLIDATING: {
        label: 'Consolidating',
        color: 'yellow',
        description: 'Merging video chunks into final video',
      },
      UPLOADING: {
        label: 'Uploading',
        color: 'blue',
        description: 'Uploading final video to storage',
      },
      COMPLETED: {
        label: 'Ready',
        color: 'green',
        description: 'Your recording is ready to watch',
      },
      FAILED: {
        label: 'Failed',
        color: 'red',
        description: 'Recording failed - please contact support',
      },
    };

    return statusMap[status] || { label: status, color: 'gray', description: 'Unknown status' };
  }
}

export const recordingService = new RecordingService();
export default recordingService;
