import { useEffect, useRef, useCallback } from 'react';
import { Camera } from '@/types/camera';

interface UseWebSocketProps {
  onCameraStatusUpdate: (camera: Camera) => void;
}

export const useWebSocket = ({ onCameraStatusUpdate }: UseWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/admin-ws`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttempts.current = 0;
        
        // Subscribe to camera status updates
        const subscribeMessage = {
          type: 'SUBSCRIBE',
          topic: '/topic/cameras/status'
        };
        ws.current?.send(JSON.stringify(subscribeMessage));
      };

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'CAMERA_STATUS_UPDATE' && data.camera) {
            onCameraStatusUpdate(data.camera);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = () => {
        console.log('WebSocket disconnected');
        
        // Attempt to reconnect if not too many attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.pow(2, reconnectAttempts.current) * 1000; // Exponential backoff
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  }, [onCameraStatusUpdate]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { disconnect };
};