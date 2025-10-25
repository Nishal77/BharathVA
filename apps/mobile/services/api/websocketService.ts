/**
 * BharathVA WebSocket Service
 * Real-time communication for feed updates
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export interface FeedEvent {
  type: 'FEED_CREATED' | 'FEED_DELETED' | 'FEED_UPDATED' | 'CONNECTION_ESTABLISHED' | 'CONNECTION_CLOSED';
  feedId?: string;
  userId?: string;
  message?: string;
  timestamp: string;
}

export interface WebSocketCallbacks {
  onFeedCreated?: (event: FeedEvent) => void;
  onFeedDeleted?: (event: FeedEvent) => void;
  onFeedUpdated?: (event: FeedEvent) => void;
  onConnectionEstablished?: (event: FeedEvent) => void;
  onConnectionClosed?: (event: FeedEvent) => void;
  onError?: (error: any) => void;
}

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // 1 second
  private callbacks: WebSocketCallbacks = {};

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      // Create SockJS connection - use the same gateway URL as other API calls
      const socket = new SockJS('http://192.168.0.225:8080/ws');
      
      // Create STOMP client
      this.client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log('🔌 WebSocket Debug:', str);
        },
        reconnectDelay: this.reconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      // Connection established
      this.client.onConnect = (frame) => {
        console.log('✅ WebSocket connected:', frame);
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        // Subscribe to feed events
        this.subscribeToFeedEvents();
        
        // Notify connection established
        if (this.callbacks.onConnectionEstablished) {
          this.callbacks.onConnectionEstablished({
            type: 'CONNECTION_ESTABLISHED',
            timestamp: new Date().toISOString()
          });
        }
      };

      // Connection error
      this.client.onStompError = (frame) => {
        console.error('❌ WebSocket STOMP error:', frame);
        this.isConnected = false;
        
        if (this.callbacks.onError) {
          this.callbacks.onError(frame);
        }
      };

      // Connection closed
      this.client.onWebSocketClose = (event) => {
        console.log('🔌 WebSocket connection closed:', event);
        this.isConnected = false;
        
        if (this.callbacks.onConnectionClosed) {
          this.callbacks.onConnectionClosed({
            type: 'CONNECTION_CLOSED',
            timestamp: new Date().toISOString()
          });
        }
        
        // Attempt to reconnect
        this.attemptReconnect();
      };

    } catch (error) {
      console.error('❌ Error initializing WebSocket client:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    }
  }

  private subscribeToFeedEvents() {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Cannot subscribe to feed events - not connected');
      return;
    }

    try {
      // Subscribe to general feed events
      this.client.subscribe('/topic/feeds', (message) => {
        try {
          const event: FeedEvent = JSON.parse(message.body);
          console.log('📥 Received feed event:', event);
          this.handleFeedEvent(event);
        } catch (error) {
          console.error('❌ Error parsing feed event:', error);
        }
      });

      console.log('📡 Subscribed to feed events');
    } catch (error) {
      console.error('❌ Error subscribing to feed events:', error);
    }
  }

  private handleFeedEvent(event: FeedEvent) {
    switch (event.type) {
      case 'FEED_CREATED':
        if (this.callbacks.onFeedCreated) {
          this.callbacks.onFeedCreated(event);
        }
        break;
      case 'FEED_DELETED':
        if (this.callbacks.onFeedDeleted) {
          this.callbacks.onFeedDeleted(event);
        }
        break;
      case 'FEED_UPDATED':
        if (this.callbacks.onFeedUpdated) {
          this.callbacks.onFeedUpdated(event);
        }
        break;
      case 'CONNECTION_ESTABLISHED':
        if (this.callbacks.onConnectionEstablished) {
          this.callbacks.onConnectionEstablished(event);
        }
        break;
      case 'CONNECTION_CLOSED':
        if (this.callbacks.onConnectionClosed) {
          this.callbacks.onConnectionClosed(event);
        }
        break;
      default:
        console.log('📝 Unhandled feed event type:', event.type);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(() => {
      if (this.client) {
        this.client.activate();
      }
    }, this.reconnectDelay * this.reconnectAttempts);
  }

  // Public methods
  public connect(callbacks: WebSocketCallbacks) {
    this.callbacks = callbacks;
    
    if (this.client && !this.isConnected) {
      console.log('🔌 Connecting to WebSocket...');
      this.client.activate();
    } else if (this.isConnected) {
      console.log('✅ WebSocket already connected');
    }
  }

  public disconnect() {
    if (this.client && this.isConnected) {
      console.log('🔌 Disconnecting from WebSocket...');
      this.client.deactivate();
    }
  }

  public isWebSocketConnected(): boolean {
    return this.isConnected;
  }

  public sendMessage(destination: string, message: any) {
    if (this.client && this.isConnected) {
      this.client.publish({
        destination,
        body: JSON.stringify(message)
      });
    } else {
      console.warn('⚠️ Cannot send message - WebSocket not connected');
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
export default webSocketService;
