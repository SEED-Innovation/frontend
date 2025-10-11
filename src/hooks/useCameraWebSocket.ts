import { useEffect, useRef } from 'react';
import { Camera } from '@/types/camera';
import { StatusChangeNotification } from '@/services/cameraService';

interface UseCameraWebSocketProps {
  onCameraStatusUpdate?: (camera: Camera) => void;
  onStatusChange?: (notification: StatusChangeNotification) => void;
  onConnectionChange?: (connected: boolean) => void;
}

export const useCameraWebSocket = ({
  onCameraStatusUpdate,
  onStatusChange,
  onConnectionChange
}: UseCameraWebSocketProps) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = () => {
    try {
      const token = localStorage.getItem('accessToken');
      const wsUrl = `${import.meta.env.VITE_WS_URL || 'ws://localhost:8080'}/ws?token=${token}`;
      
      ws.current = new WebSocket(wsUrl);

      ws.current.onopen = () => {
        console.log('🔌 Camera WebSocket connected');
        reconnectAttempts.current = 0;
        onConnectionChange?.(true);

        // Subscribe to camera status updates
        if (ws.current?.readyState === WebSocket.OPEN) {
          ws.current.send(JSON.stringify({
            type: 'SUBSCRIBE',
            destination: '/topic/cameras/status'
          }));

          ws.current.send(JSON.stringify({
            type: 'SUBSCRIBE',
            destination: '/topic/cameras/status-changes'
          }));
        }
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          
          if (message.destination === '/topic/cameras/status' && message.body) {
            const camera: Camera = JSON.parse(message.body);
            onCameraStatusUpdate?.(camera);
          }
          
          if (message.destination === '/topic/cameras/status-changes' && message.body) {
            const notification: StatusChangeNotification = JSON.parse(message.body);
            // Convert timestamp string to Date
            notification.timestamp = new Date(notification.timestamp);
            onStatusChange?.(notification);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
        }
      };

      ws.current.onclose = (event) => {
        console.log('🔌 Camera WebSocket disconnected:', event.code, event.reason);
        onConnectionChange?.(false);
        
        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${maxReconnectAttempts})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttempts.current++;
            connect();
          }, delay);
        }
      };

      ws.current.onerror = (error) => {
        console.error('❌ Camera WebSocket error:', error);
      };

    } catch (error) {
      console.error('❌ Failed to connect to camera WebSocket:', error);
      onConnectionChange?.(false);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (ws.current) {
      ws.current.close(1000, 'Component unmounting');
      ws.current = null;
    }
  };

  const sendMessage = (message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.warn('⚠️ WebSocket not connected, cannot send message');
    }
  };

  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected: ws.current?.readyState === WebSocket.OPEN,
    sendMessage,
    reconnect: connect,
    disconnect
  };
};