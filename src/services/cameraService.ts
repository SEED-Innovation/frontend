import { Camera, CameraStatus } from '@/types/camera';

export interface AssociateCameraRequest {
  courtId: number;
}

export interface Court {
  id: number;
  name: string;
  imageUrl?: string;
}

// HikCentral specific interfaces
export interface HikCentralCameraInfo {
  cameraId: string;
  cameraName: string;
  channelNo: number;
  deviceSerial: string;
  deviceCategory: string;
  online: boolean;
  areaId: string;
  areaName: string;
  abilitySet: string;
  isAssociated?: boolean;
  databaseId?: number;
  associatedCourt?: {
    id: number;
    name: string;
  };
}

class CameraService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    
    // Debug logging
    console.log('🔐 Auth Debug:', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'null'
    });
    
    if (!token) {
      console.error('❌ No access token found in localStorage');
      throw new Error('No authentication token available. Please log in again.');
    }
    
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  async getAllCameras(): Promise<HikCentralCameraInfo[]> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cameras/hikcentral`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token may be expired or user lacks SUPER_ADMIN role');
        throw new Error('Authentication failed. Please log in again or contact an administrator. SUPER_ADMIN role required.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch cameras: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('❌ Camera service error:', error);
      throw error;
    }
  }



  async getUnassociatedCourts(): Promise<Court[]> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cameras/unassociated-courts`, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch unassociated courts: ${response.statusText}`);
    }

    return response.json();
  }

  // HikCentral specific methods
  async testHikCentralConnectivity(): Promise<boolean> {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cameras/hikcentral/test`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      if (response.status === 401) {
        console.error('❌ 401 Unauthorized - Token may be expired or user lacks SUPER_ADMIN role');
        throw new Error('Authentication failed. Please log in again or contact an administrator. SUPER_ADMIN role required.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HikCentral Test Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to test HikCentral connectivity: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('❌ HikCentral connectivity test error:', error);
      throw error;
    }
  }

  async createAndAssociateHikCentralCamera(cameraId: string, courtId: number): Promise<any> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cameras/hikcentral/${cameraId}/associate/${courtId}`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to create and associate HikCentral camera: ${response.statusText}`);
    }

    return response.json();
  }

  async disassociateHikCentralCamera(cameraId: string): Promise<any> {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/cameras/hikcentral/${cameraId}/disassociate`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to disassociate HikCentral camera: ${response.statusText}`);
    }

    return response.json();
  }
}

export const cameraService = new CameraService();