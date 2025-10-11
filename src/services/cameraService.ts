import { Camera, CameraStatus } from '@/types/camera';

export interface CameraSummary {
  totalCameras: number;
  activeCameras: number;
  offlineCameras: number;
  associatedCourts: number;
}

export interface CreateCameraRequest {
  name: string;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  streamPath?: string;
  initialStatus: CameraStatus;
  description?: string;
}

export interface UpdateCameraRequest {
  name: string;
  ipAddress: string;
  port: number;
  username?: string;
  password?: string;
  streamPath?: string;
  description?: string;
}

export interface AssociateCameraRequest {
  courtId: number;
}

export interface Court {
  id: number;
  name: string;
  imageUrl?: string;
}

export interface Recording {
  id: number;
  filename: string;
  duration: string;
  size: string;
  timestamp: Date;
  status: 'RECORDING' | 'COMPLETED' | 'FAILED' | 'PROCESSING' | 'DELETED';
  cameraId: number;
  cameraName: string;
  filePath?: string;
}

export interface RecordingStatus {
  cameraId: number;
  cameraName: string;
  isRecording: boolean;
  recordingStartTime?: Date;
  currentDuration?: string;
}

export interface RecordingToggleResponse {
  action: 'started' | 'stopped';
  message: string;
  data: RecordingStatus | Recording;
}

export interface RecordingSummary {
  totalRecordings: number;
  activeRecordings: number;
  totalStorageUsed: string;
  recordingsToday: number;
}

export interface CameraHealthSummary {
  totalCameras: number;
  healthyCameras: number;
  offlineCameras: number;
  maintenanceCameras: number;
  lastCheckTime: Date;
}

export interface StatusChangeNotification {
  cameraId: number;
  cameraName: string;
  previousStatus: string;
  newStatus: string;
  timestamp: Date;
}

class CameraService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getSummary(): Promise<CameraSummary> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch camera summary: ${response.statusText}`);
    }

    return response.json();
  }

  async getAllCameras(): Promise<Camera[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch cameras: ${response.statusText}`);
    }

    return response.json();
  }

  async createCamera(request: CreateCameraRequest): Promise<Camera> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to create camera: ${response.statusText}`);
    }

    return response.json();
  }

  async updateCamera(cameraId: number, request: UpdateCameraRequest): Promise<Camera> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to update camera: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteCamera(cameraId: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete camera: ${response.statusText}`);
    }
  }

  async associateCamera(cameraId: number, request: AssociateCameraRequest): Promise<Camera> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/associate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`Failed to associate camera: ${response.statusText}`);
    }

    return response.json();
  }

  async disassociateCamera(cameraId: number): Promise<Camera> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/disassociate`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to disassociate camera: ${response.statusText}`);
    }

    return response.json();
  }

  async testConnection(cameraId: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/test-connection`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to test camera connection: ${response.statusText}`);
    }
  }

  async getUnassociatedCourts(): Promise<Court[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/unassociated-courts`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unassociated courts: ${response.statusText}`);
    }

    return response.json();
  }

  // Recording methods
  async startRecording(cameraId: number): Promise<RecordingStatus | RecordingToggleResponse> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/start-recording`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to start recording: ${response.statusText}`);
    }

    return response.json();
  }

  async stopRecording(cameraId: number): Promise<Recording> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/stop-recording`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to stop recording: ${response.statusText}`);
    }

    return response.json();
  }

  async getRecordingStatus(cameraId: number): Promise<RecordingStatus> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/recording-status`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get recording status: ${response.statusText}`);
    }

    return response.json();
  }

  async getCameraRecordings(cameraId: number): Promise<Recording[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/recordings`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get camera recordings: ${response.statusText}`);
    }

    const recordings = await response.json();
    // Convert timestamp strings to Date objects
    return recordings.map((recording: any) => ({
      ...recording,
      timestamp: new Date(recording.timestamp)
    }));
  }

  async getAllRecordings(): Promise<{ recordings: Recording[]; totalCount: number; totalSize: string }> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/recordings`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get all recordings: ${response.statusText}`);
    }

    const data = await response.json();
    // Convert timestamp strings to Date objects
    data.recordings = data.recordings.map((recording: any) => ({
      ...recording,
      timestamp: new Date(recording.timestamp)
    }));
    
    return data;
  }

  async getRecordingSummary(): Promise<RecordingSummary> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/recordings/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get recording summary: ${response.statusText}`);
    }

    return response.json();
  }

  async deleteRecording(recordingId: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/recordings/${recordingId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete recording: ${response.statusText}`);
    }
  }

  async deleteAllCameraRecordings(cameraId: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/recordings`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to delete all camera recordings: ${response.statusText}`);
    }
  }

  async downloadRecording(recordingId: number): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/recordings/${recordingId}/download`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
      }
    });

    if (!response.ok) {
      // Check if response contains error message
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to download recording: ${response.statusText}`);
      }
      throw new Error(`Failed to download recording: ${response.statusText}`);
    }

    // Check if the response is actually a video file
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/octet-stream')) {
      // If it's JSON, it might be an error response
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Download not available');
      }
    }

    // Create blob and download
    const blob = await response.blob();
    
    // Check if blob is too small (likely corrupted or failed recording)
    if (blob.size < 1000) { // Less than 1KB is probably corrupted
      throw new Error('Recording file appears to be empty or corrupted.');
    }
    
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `recording_${recordingId}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  async testCameraConnection(cameraId: number): Promise<{connected: boolean, message: string}> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/${cameraId}/test-recording-connection`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to test camera connection: ${response.statusText}`);
    }

    return response.json();
  }

  async getSystemHealth(): Promise<any> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/system/health`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get system health: ${response.statusText}`);
    }

    return response.json();
  }

  // Camera health monitoring methods
  async getHealthSummary(): Promise<CameraHealthSummary> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/health/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to get health summary: ${response.statusText}`);
    }

    return response.json();
  }

  async checkCameraHealth(cameraId: number): Promise<boolean> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/health/${cameraId}/check`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to check camera health: ${response.statusText}`);
    }

    return response.json();
  }

  async forceHealthCheckAll(): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/health/check-all`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to force health check: ${response.statusText}`);
    }
  }

  async setCameraMaintenanceMode(cameraId: number, maintenanceMode: boolean): Promise<void> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/cameras/health/${cameraId}/maintenance?maintenanceMode=${maintenanceMode}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to set maintenance mode: ${response.statusText}`);
    }
  }
}

export const cameraService = new CameraService();