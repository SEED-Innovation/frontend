export type CameraStatus = 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR';

export interface Camera {
  id: number;
  name: string;
  ipAddress: string;
  status: CameraStatus;
  port: number;
  description?: string;
  lastConnectionTestTime?: string;
  lastConnectionSuccess?: boolean;
  courtCamera?: {
    id: number;
    name: string;
  };
}

export interface CameraConnectionTest {
  cameraId: number;
  success: boolean;
  responseTime: number;
  timestamp: string;
  error?: string;
}

export interface CameraAssociation {
  cameraId: number;
  courtId: number;
}