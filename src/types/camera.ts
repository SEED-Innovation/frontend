export type CameraStatus = 'ACTIVE' | 'OFFLINE' | 'MAINTENANCE' | 'ERROR' | 'STREAM_UNAVAILABLE';

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

  // HikCentral specific fields
  deviceSerial?: string;
  deviceName?: string;
  channelNo?: number;
  channelName?: string;
  model?: string;
  firmwareVersion?: string;
  isOnline?: boolean;
  liveStreamUrl?: string;
  streamUrlExpiry?: string;
  lastSync?: string;
  createdAt?: string;
  updatedAt?: string;
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