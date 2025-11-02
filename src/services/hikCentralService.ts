export interface HikCentralCameraInfo {
  cameraId: string;
  cameraName: string;
  deviceSerial: string;
  channelNo: number;
  status: string;
  model: string;
  ipAddress: string;
  online: boolean;
}

export interface HikCentralRecording {
  recordingId: string;
  startTime: string;
  endTime: string;
  duration: number;
  fileSize: number;
  recordType: string;
}

export interface HikCentralConnectivityResponse {
  connected: boolean;
  service: string;
  timestamp: string;
  message: string;
  error?: string;
}

export interface HikCentralCamerasResponse {
  cameras: HikCentralCameraInfo[];
  count: number;
  source: string;
}

export interface HikCentralStreamResponse {
  streamUrl: string;
  type: string;
  source: string;
  cameraId: string;
}

export interface HikCentralRecordingResponse {
  message: string;
  cameraId: string;
  source: string;
}

export interface HikCentralRecordingsResponse {
  recordings: HikCentralRecording[];
  count: number;
  cameraId: string;
  startTime: string;
  endTime: string;
  source: string;
}

export interface HikCentralPlaybackResponse {
  playbackUrl: string;
  type: string;
  cameraId: string;
  recordingId: string;
  source: string;
}

export interface RecordingParams {
  recordType?: string;
  duration?: number;
  quality?: string;
}

class HikCentralService {
  private readonly baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  private getAuthHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    };
  }

  /**
   * Test HikCentral Professional API connectivity
   */
  async testConnectivity(): Promise<HikCentralConnectivityResponse> {
    const response = await fetch(`${this.baseUrl}/api/cameras/hikcentral/test-connectivity`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all cameras from HikCentral Professional
   */
  async getCameras(): Promise<HikCentralCamerasResponse> {
    const response = await fetch(`${this.baseUrl}/api/cameras/hikcentral/cameras`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get live stream URL for a specific camera
   */
  async getLiveStreamUrl(cameraId: string): Promise<HikCentralStreamResponse> {
    const response = await fetch(`${this.baseUrl}/api/cameras/hikcentral/cameras/${cameraId}/stream/live`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Start recording on a camera
   */
  async startRecording(
    cameraId: string, 
    params?: RecordingParams
  ): Promise<HikCentralRecordingResponse> {
    const response = await fetch(`${this.baseUrl}/api/cameras/hikcentral/cameras/${cameraId}/recording/start`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params || {})
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Stop recording on a camera
   */
  async stopRecording(cameraId: string): Promise<HikCentralRecordingResponse> {
    const response = await fetch(`${this.baseUrl}/api/cameras/hikcentral/cameras/${cameraId}/recording/stop`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get recordings for a camera within a time range
   */
  async getRecordings(
    cameraId: string,
    startTime: Date,
    endTime: Date
  ): Promise<HikCentralRecordingsResponse> {
    const params = new URLSearchParams({
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString()
    });

    const response = await fetch(`${this.baseUrl}/api/cameras/hikcentral/cameras/${cameraId}/recordings?${params}`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get playback URL for a specific recording
   */
  async getPlaybackUrl(
    cameraId: string, 
    recordingId: string
  ): Promise<HikCentralPlaybackResponse> {
    const response = await fetch(`${this.baseUrl}/api/cameras/hikcentral/cameras/${cameraId}/recordings/${recordingId}/playback`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get recordings for today
   */
  async getTodayRecordings(cameraId: string): Promise<HikCentralRecordingsResponse> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
    
    return this.getRecordings(cameraId, startOfDay, endOfDay);
  }

  /**
   * Get recordings for the last 24 hours
   */
  async getLast24HoursRecordings(cameraId: string): Promise<HikCentralRecordingsResponse> {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    return this.getRecordings(cameraId, yesterday, now);
  }

  /**
   * Get recordings for the last week
   */
  async getLastWeekRecordings(cameraId: string): Promise<HikCentralRecordingsResponse> {
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return this.getRecordings(cameraId, lastWeek, now);
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format duration for display
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${remainingSeconds}s`;
    }
  }

  /**
   * Check if camera is online
   */
  isCameraOnline(camera: HikCentralCameraInfo): boolean {
    return camera.online && camera.status === 'ACTIVE';
  }

  /**
   * Get camera status color for UI
   */
  getCameraStatusColor(camera: HikCentralCameraInfo): string {
    if (this.isCameraOnline(camera)) {
      return 'green';
    } else if (camera.status === 'MAINTENANCE') {
      return 'yellow';
    } else {
      return 'red';
    }
  }
}

export const hikCentralService = new HikCentralService();
export default hikCentralService;