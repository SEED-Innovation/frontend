export type CameraStatus = 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR' | 'TESTING_CONNECTION';

export interface Camera {
  id: number;
  name: string;
  ipAddress: string;
  status: CameraStatus;
  port: number;
  description?: string;
  lastConnectionTestTime?: string;
  lastConnectionSuccess?: boolean;
  associatedCourtId?: number;
  associatedCourtName?: string;
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