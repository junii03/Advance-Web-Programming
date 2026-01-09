import { useEffect, useCallback, useState } from 'react';
import { getWebSocketService, initializeWebSocket } from '@/src/lib/websocketClient';
import { useAuth } from '@/src/contexts/auth';
import { useToast } from '@/src/components/Toast';
import { api } from '@/src/lib/apiClient';

/**
 * Hook for WebSocket notifications
 * Automatically manages connection and provides notification handlers
 */
export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize WebSocket on mount if authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      console.warn('WebSocket: User not authenticated');
      return;
    }

    let isMounted = true;

    const setupWebSocket = async () => {
      try {
        const token = await api.getToken();
        console.log('Token from storage:', token ? `${token.substring(0, 20)}...` : 'null/undefined');

        if (!token || token.trim() === '') {
          console.error('No token available for WebSocket connection - token is empty or null');
          if (isMounted) {
            setError('Authentication token missing. Please log in again.');
            setIsConnected(false);
          }
          return;
        }

        console.log('Token retrieved successfully (length: ' + token.length + '), connecting to WebSocket');
        const serverUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
        console.log('WebSocket server URL:', serverUrl);

        await initializeWebSocket(serverUrl, token);

        if (isMounted) {
          setIsConnected(true);
          setError(null);
          console.log('WebSocket connected successfully');
        }
      } catch (err) {
        if (isMounted) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to connect to notification service';
          setError(errorMessage);
          setIsConnected(false);
          console.error('WebSocket connection error:', errorMessage, err);
        }
      }
    };

    setupWebSocket();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  // Subscribe to notifications
  useEffect(() => {
    if (!isAuthenticated) return;

    const socketService = getWebSocketService();

    // Subscribe to real-time notifications
    const unsubscribe = socketService.subscribe('notification:new', (notification: any) => {
      showToast({
        title: notification.title,
        message: notification.message,
        type: notification.type || 'system',
        duration: 5000,
      });
    });

    // Subscribe to broadcast notifications
    const unsubscribeBroadcast = socketService.subscribe('notification:broadcast', (notification: any) => {
      showToast({
        title: notification.title,
        message: notification.message,
        type: notification.type || 'system',
        duration: 5000,
      });
    });

    // Subscribe to connection status changes
    const unsubscribeStatus = socketService.subscribe('connectionStatusChanged', (data: any) => {
      setIsConnected(data.connected);
      if (!data.connected) {
        showToast({
          title: 'Connection Lost',
          message: 'Reconnecting to notification service...',
          type: 'system',
          duration: 3000,
        });
      }
    });

    // Subscribe to reconnection
    const unsubscribeReconnect = socketService.subscribe('reconnected', () => {
      setIsConnected(true);
      showToast({
        title: 'Reconnected',
        message: 'Successfully reconnected to notification service',
        type: 'system',
        duration: 3000,
      });
    });

    return () => {
      unsubscribe();
      unsubscribeBroadcast();
      unsubscribeStatus();
      unsubscribeReconnect();
    };
  }, [isAuthenticated, showToast]);

  const markAsRead = useCallback((notificationId: string) => {
    const socketService = getWebSocketService();
    socketService.markAsRead(notificationId);
  }, []);

  const markAllAsRead = useCallback(() => {
    const socketService = getWebSocketService();
    socketService.markAllAsRead();
  }, []);

  const disconnect = useCallback(() => {
    const socketService = getWebSocketService();
    socketService.disconnect();
    setIsConnected(false);
  }, []);

  return {
    isConnected,
    error,
    markAsRead,
    markAllAsRead,
    disconnect,
  };
};

export default useWebSocket;
