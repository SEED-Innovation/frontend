import { apiClient } from '../client';

export interface RecordingChunk {
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

export interface MatchRecording {
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

export const adminRecordingService = {
  /**
   * Get all recordings (admin only)
   */
  async getAllRecordings(): Promise<MatchRecording[]> {
    const response = await apiClient.get('/api/recordings/admin/all');
    return response.data;
  },

  /**
   * Get recording by ID (admin only)
   */
  async getRecordingById(id: number): Promise<MatchRecording> {
    const response = await apiClient.get(`/api/recordings/admin/${id}`);
    return response.data;
  },

  /**
   * Retry a failed recording (admin only)
   */
  async retryRecording(id: number): Promise<MatchRecording> {
    const response = await apiClient.post(`/api/recordings/admin/${id}/retry`);
    return response.data;
  },

  /**
   * Delete a recording (admin only)
   */
  async deleteRecording(id: number): Promise<void> {
    await apiClient.delete(`/api/recordings/admin/${id}`);
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
    return response.data;
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
    return response.data;
  }
};
