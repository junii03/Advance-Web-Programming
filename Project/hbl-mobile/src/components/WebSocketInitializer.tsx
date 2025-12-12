import React from 'react';
import { useWebSocket } from '@/src/hooks/useWebSocket';

/**
 * WebSocket Initializer Component
 *
 * This component initializes WebSocket connections on app startup.
 * It should be placed inside the AuthProvider to ensure user authentication
 * is available before attempting to connect.
 *
 * Usage: Wrap it around your main app navigation
 */
export const WebSocketInitializer = ({ children }: { children: React.ReactNode }) => {
  // This hook automatically initializes WebSocket when user is authenticated
  useWebSocket();

  // Just render children - the hook handles all initialization
  return <>{children}</>;
};

export default WebSocketInitializer;
