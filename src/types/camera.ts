export type CameraStatus = 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR' | 'HIK_CONNECT_ERROR' | 'NOT_FOUND_IN_HIK_CONNECT' | 'STREAM_UNAVAILABLE';

export interface Camera {
  id: number;
  name: string;
  ipAddress?: string;
  status: CameraStatus;
  port?: number;
  username?: string;
  password?: string;
  streamPath?: string;
  description?: string;
  lastConnectionTestTime?: string;
  lastConnectionSuccess?: boolean;
  associatedCourtId?: number;
  associatedCourtName?: string;

  // Hik-Connect specific fields
  deviceSerial?: string;
  deviceName?: string;
  channelNo?: number;
  channelName?: string;
  hikConnectEnabled?: boolean;
  model?: string;
  firmwareVersion?: string;
  isOnline?: boolean;
  liveStreamUrl?: string;
  streamUrlExpiry?: string;
  lastSync?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Hik-Connect specific interfaces
export interface HikConnectCamera {
  deviceSerial: string;
  deviceName: string;
  channelNo: number;
  channelName: string;
  isOnline: boolean;
  model?: string;
  firmwareVersion?: string;
}

export interface HikConnectConfig {
  id?: number;
  username: string;
  password: string;
  isActive: boolean;
  lastLogin?: string;
  lastSync?: string;
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