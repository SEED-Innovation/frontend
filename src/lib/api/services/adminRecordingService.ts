import { apiClient } from '../client';

export interface RecordingChunk {
  id: number;
  chunkNumber: number;
  startTime: string;
  endTime: string;
  status: string;
  hikVisionTaskId: string;
  downloadUrl: string;
  localPath: string;
  s3Key: string;
  fileSizeBytes: number;
  durationSeconds: number;
  createdAt: string;
  updatedAt: string;
}

export interface MatchRecording {
  id: number;
  recordingId: string; // UUID
  bookingId?: number;
  userId?: number;
  userName?: string;
  userEmail?: string;
  cameraId?: number;
  cameraName?: string;
  courtId?: number;
  courtName?: string;
  facilityName?: string;
  status: 'PENDING' | 'REQUESTING_CHUNKS' | 'POLLING' | 'DOWNLOADING' | 'CONSOLIDATING' | 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'STARTING' | 'RECORDING' | 'PROCESSING' | 'READY' | 'ARCHIVED';
  checkInTime?: string;
  checkOutTime?: string;
  firstChunkStartTime?: string;
  totalChunks?: number;
  uploadedChunks?: number;
  consolidatedChunks?: number;
  consolidatedS3Key?: string;
  consolidatedS3Bucket?: string;
  totalFileSizeBytes?: number;
  totalDurationSeconds?: number;
  retryCount: number;
  maxRetries?: number;
  lastRetryAt?: string;
  consolidationStartedAt?: string;
  consolidationCompletedAt?: string;
  errorMessage?: string;
  notificationSent?: boolean;
  notificationSentAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Manual recording fields
  isManualRecording?: boolean;
  createdByAdminId?: string;
  description?: string;
  
  // Optional chunks
  chunks?: RecordingChunk[];
  
  // Presigned URL for video playback (expires in 12 hours)
  videoUrl?: string;
  
  // Computed fields (for backward compatibility)
  sessionId?: number; // Maps to bookingId
  startTime?: string; // Maps to checkInTime
  endTime?: string; // Maps to checkOutTime
  duration?: number; // Maps to totalDurationSeconds
  fileSize?: number; // Maps to totalFileSizeBytes
}

export const adminRecordingService = {
  /**
   * Get all match recordings (admin only) with pagination
   */
  async getAllRecordings(page: number = 0, size: number = 20, status?: string): Promise<{
    content: MatchRecording[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
  }> {
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', size.toString());
      if (status && status !== 'all') {
        params.append('status', status.toUpperCase());
      }

      // apiClient.get returns the response data directly (not wrapped in .data like axios)
      const response = await apiClient.get<any>(`/api/admin/recordings/match?${params.toString()}`);
      
      // Backend returns Spring Data Page object
      if (response && response.content && Array.isArray(response.content)) {
        return {
          content: response.content,
          totalElements: response.totalElements || 0,
          totalPages: response.totalPages || 0,
          number: response.number || 0,
          size: response.size || size,
          first: response.first || false,
          last: response.last || false,
        };
      }
      
      // Fallback if response is already an array
      if (Array.isArray(response)) {
        return {
          content: response,
          totalElements: response.length,
          totalPages: 1,
          number: 0,
          size: response.length,
          first: true,
          last: true,
        };
      }
      
      // If no data, return empty page
      console.warn('Unexpected response format from getAllRecordings:', response);
      return {
        content: [],
        totalElements: 0,
        totalPages: 0,
        number: 0,
        size: size,
        first: true,
        last: true,
      };
    } catch (error) {
      console.error('Error fetching recordings:', error);
      throw error;
    }
  },

  /**
   * Get recording by recording ID (UUID) (admin only)
   */
  async getRecordingById(recordingId: string): Promise<MatchRecording> {
    const response = await apiClient.get<MatchRecording>(`/api/admin/recordings/match/${recordingId}`);
    return response;
  },

  /**
   * Retry a failed recording (admin only)
   */
  async retryRecording(recordingId: string): Promise<any> {
    const response = await apiClient.post(`/api/admin/recordings/match/${recordingId}/retry`);
    return response;
  },

  /**
   * Cancel a processing recording (admin only)
   */
  async cancelRecording(recordingId: string): Promise<any> {
    const response = await apiClient.post(`/api/admin/recordings/match/${recordingId}/cancel`);
    return response;
  },

  /**
   * Delete a recording (admin only)
   */
  async deleteRecording(recordingId: number): Promise<void> {
    await apiClient.delete(`/api/admin/recordings/${recordingId}`);
  },

  /**
   * Check camera availability for a court
   */
  async checkCameraAvailability(facilityId: number, courtId: number) {
    const response = await apiClient.get(`/api/admin/recordings/camera-availability?facilityId=${facilityId}&courtId=${courtId}`);
    return response;
  },

  /**
   * Start a manual recording
   */
  async startRecording(rtspUrl: string, cameraId: number, courtId?: number, sessionId?: string) {
    const params = new URLSearchParams();
    params.append('rtspUrl', rtspUrl);
    params.append('cameraId', cameraId.toString());
    if (courtId) params.append('courtId', courtId.toString());
    if (sessionId) params.append('sessionId', sessionId);
    
    const response = await apiClient.post(`/api/admin/recordings/start?${params.toString()}`);
    return response;
  },

  /**
   * Stop a recording
   */
  async stopRecording(recordingId: number) {
    const response = await apiClient.post(`/api/admin/recordings/${recordingId}/stop`);
    return response;
  },

  /**
   * Get all manual recordings
   */
  async getManualRecordings(page: number = 0, size: number = 20, unassociated?: boolean) {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('size', size.toString());
    if (unassociated !== undefined) params.append('unassociated', unassociated.toString());
    
    const response = await apiClient.get(`/api/admin/recordings/manual?${params.toString()}`);
    return response;
  },

  /**
   * Associate a recording with a user/booking
   */
  async associateRecording(recordingId: string, userId: string, bookingId?: number, notes?: string) {
    const response = await apiClient.post(`/api/admin/recordings/match/${recordingId}/associate`, {
      userId,
      bookingId,
      notes
    });
    return response;
  }
};
