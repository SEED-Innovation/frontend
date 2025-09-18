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
  initialStatus: CameraStatus;
  description?: string;
}

export interface UpdateCameraRequest {
  name: string;
  ipAddress: string;
  port: number;
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
}

export const cameraService = new CameraService();