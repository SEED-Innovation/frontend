import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface Recording {
  id: number;
  recordingId: string;
  userId: string;
  courtId: number;
  courtName: string;
  facilityName: string;
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
  chunks?: RecordingChunk[];
}

export interface RecordingChunk {
  id: number;
  chunkIndex: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'REQUESTED' | 'READY' | 'DOWNLOADING' | 'DOWNLOADED' | 'FAILED';
  hikVisionTaskId: string;
  downloadUrl: string;
  localPath: string;
  fileSize: number;
}