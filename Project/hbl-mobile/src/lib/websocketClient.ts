/**
 * WebSocket Service for Real-Time Notifications
 * Manages Socket.IO connection with auto-reconnection logic
 */

import * as io from 'socket.io-client';

// Simple logger fallback if logger module doesn't exist
const logger = {
  info: (msg: string, data?: any) => console.log('[INFO]', msg, data),
  warn: (msg: string, data?: any) => console.warn('[WARN]', msg, data),
  error: (msg: string, data?: any) => console.error('[ERROR]', msg, data),
  debug: (msg: string, data?: any) => console.debug('[DEBUG]', msg, data),
};

class WebSocketService {
  socket: any | null;
  isConnected: boolean;
  listeners: Map<string, ((data: any) => void)[]>;
  reconnectAttempts: number;
  maxReconnectAttempts: number;
  reconnectDelay: number;

  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000; // Start at 1 second
  }

  /**
   * Initialize WebSocket connection
   * @param {string} serverUrl - Server URL (e.g., 'http://localhost:5000' or 'https://example.com')
   * @param {string} token - JWT authentication token
   * @returns {Promise<void>}
   */
  async connect(serverUrl: string, token: string): Promise<void> {
    if (this.socket?.connected) {
      logger.info('WebSocket already connected');
      return;
    }

    if (!serverUrl || !token) {
      logger.error('WebSocket: Missing serverUrl or token');
      throw new Error('WebSocket initialization failed: Missing credentials');
    }

    try {
      // First, test if the server is reachable
      logger.info(`WebSocket: Testing server connectivity to ${serverUrl}`);
      try {
        const testResponse = await fetch(`${serverUrl}/socket-test`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (testResponse.ok) {
          const testData = await testResponse.json();
          logger.info('WebSocket: Server connectivity test passed', testData);
        } else {
          logger.warn('WebSocket: Server returned status', testResponse.status);
        }
      } catch (testError) {
        logger.warn('WebSocket: Connectivity test failed (server may be unreachable)', testError);
      }

      // Convert HTTP/HTTPS URLs to WS/WSS for WebSocket
      let wsUrl = serverUrl;
      if (serverUrl.startsWith('https://')) {
        wsUrl = serverUrl.replace('https://', 'wss://');
      } else if (serverUrl.startsWith('http://')) {
        wsUrl = serverUrl.replace('http://', 'ws://');
      }

      const tokenPreview = token ? `${token.substring(0, 20)}...` : 'UNDEFINED';
      logger.info(`WebSocket: Connecting to ${wsUrl} with token: ${tokenPreview}`);

      if (!token || token.trim() === '') {
        throw new Error('WebSocket: Token is empty or undefined');
      }

      // Try polling first (more reliable over proxies), then attempt WebSocket upgrade
      // This is better for production deployments with ALBs/CloudFront that may block WebSocket
      logger.info('WebSocket: Attempting transports in order: polling, websocket');
      this.socket = io.io(wsUrl, {
        auth: {
          token: token, // For Socket.IO auth middleware
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        // Prioritize polling over WebSocket for production reliability
        transports: ['polling', 'websocket'],
        forceNew: false,
        secure: wsUrl.startsWith('wss://'),
        rejectUnauthorized: false,
        path: '/socket.io/', // Explicit path for socket.io
        query: {
          // Send token in query params as backup (for both polling and websocket)
          token: token,
        },
        upgrade: true, // Allow upgrade from polling to websocket
        // Ensure headers/auth are sent with every request
        withCredentials: true,
      });

      // Setup event listeners
      this.setupEventListeners();

      // Wait for connection to establish
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          if (this.socket) {
            this.socket.disconnect();
          }
          reject(new Error('WebSocket connection timeout after 15s'));
        }, 15000);

        this.socket.on('connect', () => {
          logger.info('WebSocket: Connected event received');
          clearTimeout(timeout);
          resolve();
        });

        this.socket.on('connect_error', (error: any) => {
          const errorDetail = {
            message: error?.message,
            type: error?.type,
            description: error?.description,
            code: error?.code,
            context: error?.context,
            data: error?.data,
          };
          logger.error('WebSocket: Connect error details:', JSON.stringify(errorDetail));
          clearTimeout(timeout);
          reject(error);
        });

        this.socket.on('error', (error: any) => {
          const errorDetail = {
            message: error?.message,
            type: error?.type,
            description: error?.description,
            code: error?.code,
          };
          logger.error('WebSocket: Socket error details:', JSON.stringify(errorDetail));
        });
      });

      this.isConnected = true;
      this.reconnectAttempts = 0;
      logger.info('WebSocket: Connected successfully');
    } catch (error) {
      logger.error('WebSocket connection error:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Setup WebSocket event listeners
   * @private
   */
  setupEventListeners(): void {
    if (!this.socket) return;

    // Connection established
    this.socket.on('connect', () => {
      logger.info('WebSocket: Connected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emitLocal('connectionStatusChanged', { connected: true });
    });

    // Transport changed (useful for debugging WebSocket vs polling)
    this.socket.on('upgrade', (transport: any) => {
      logger.info(`WebSocket: Upgraded to ${transport}`);
    });

    this.socket.on('downgrade', (transport: any) => {
      logger.warn(`WebSocket: Downgraded to ${transport}`);
    });

    // Disconnected
    this.socket.on('disconnect', (reason: string) => {
      logger.warn(`WebSocket: Disconnected (${reason})`);
      this.isConnected = false;
      this.emitLocal('connectionStatusChanged', { connected: false, reason });
    });

    // Real-time notification received
    this.socket.on('notification:new', (notification: any) => {
      logger.info('WebSocket: Received notification', notification);
      this.emitLocal('notification:new', notification);
    });

    // Broadcast notification
    this.socket.on('notification:broadcast', (notification: any) => {
      logger.info('WebSocket: Received broadcast notification', notification);
      this.emitLocal('notification:broadcast', notification);
    });

    // Status update
    this.socket.on('status:update', (data: any) => {
      logger.info('WebSocket: Status update', data);
      this.emitLocal('status:update', data);
    });

    // Pong response
    this.socket.on('pong', (data: any) => {
      logger.debug('WebSocket: Pong received', data);
      this.emitLocal('pong', data);
    });

    // Error
    this.socket.on('error', (error: any) => {
      logger.error('WebSocket: Error', error);
      this.emitLocal('error', error);
    });

    // Connection error
    this.socket.on('connect_error', (error: any) => {
      logger.error('WebSocket: Connection error', error);
      this.emitLocal('connectError', error);
    });

    // Reconnect attempt
    this.socket.on('reconnect_attempt', () => {
      this.reconnectAttempts++;
      logger.warn(`WebSocket: Reconnect attempt ${this.reconnectAttempts}`);
    });

    // Reconnected
    this.socket.on('reconnect', () => {
      logger.info('WebSocket: Reconnected');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emitLocal('reconnected', {});
    });
  }

  /**
   * Disconnect WebSocket
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
      logger.info('WebSocket: Disconnected');
    }
  }

  /**
   * Subscribe to WebSocket event
   * @param {string} eventName - Event name to listen for
   * @param {Function} callback - Callback function when event is emitted
   * @returns {Function} Unsubscribe function
   */
  subscribe(
    eventName: string,
    callback: (data: any) => void
  ): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const callbacks = this.listeners.get(eventName)!;
    callbacks.push(callback);

    logger.debug(`WebSocket: Subscribed to ${eventName}`);

    // Return unsubscribe function
    return () => {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      logger.debug(`WebSocket: Unsubscribed from ${eventName}`);
    };
  }

  /**
   * Emit local event to subscribers
   * @private
   */
  emitLocal(eventName: string, data: any): void {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName)!;
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error in ${eventName} callback:`, error);
        }
      });
    }
  }

  /**
   * Emit event to server
   * @param {string} eventName - Event name
   * @param {any} data - Data to send
   */
  emit(eventName: string, data?: any): void {
    if (!this.socket || !this.isConnected) {
      logger.warn(`WebSocket: Not connected, cannot emit ${eventName}`);
      return;
    }

    this.socket.emit(eventName, data);
  }

  /**
   * Mark notification as read
   * @param {string} notificationId - Notification ID
   */
  markAsRead(notificationId: string): void {
    this.emit('notification:read', { notificationId });
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    this.emit('notification:read-all');
  }

  /**
   * Send health check ping
   */
  ping(): void {
    this.emit('ping');
  }

  /**
   * Get connection status
   * @returns {boolean}
   */
  isConnectedStatus(): boolean {
    return this.isConnected && this.socket?.connected;
  }

  /**
   * Get socket instance (for advanced usage)
   * @returns {Socket|null}
   */
  getSocket(): any | null {
    return this.socket;
  }
}

// Singleton instance
let webSocketService: WebSocketService | null = null;

/**
 * Get or create WebSocket service instance
 */
export function getWebSocketService(): WebSocketService {
  if (!webSocketService) {
    webSocketService = new WebSocketService();
  }
  return webSocketService;
}

/**
 * Initialize WebSocket service (call once at app start)
 */
export async function initializeWebSocket(
  serverUrl: string,
  token: string
): Promise<WebSocketService> {
  const service = getWebSocketService();
  try {
    await service.connect(serverUrl, token);

    return service;
  } catch (error) {
    logger.error('Failed to initialize WebSocket:', error);
    throw error;
  }
}

export default WebSocketService;
