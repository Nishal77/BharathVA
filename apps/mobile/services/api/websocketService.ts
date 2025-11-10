/**
 * BharathVA WebSocket Service
 * Real-time communication for feed updates and notifications
 */

import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { getWebSocketURL, getGatewayURL } from './environment';
import { tokenManager } from './authService';
import { Notification } from './notificationService';

export interface FeedEvent {
  type: 'FEED_CREATED' | 'FEED_DELETED' | 'FEED_UPDATED' | 'FEED_COMMENTED' | 'COMMENT_DELETED' | 'FEED_LIKED' | 'FEED_UNLIKED' | 'CONNECTION_ESTABLISHED' | 'CONNECTION_CLOSED';
  feedId?: string;
  userId?: string;
  message?: string;
  timestamp: string;
}

export interface NotificationEvent {
  type: 'NOTIFICATION_CREATED' | 'NOTIFICATION_COUNT_UPDATED' | 'NOTIFICATION_READ' | 'NOTIFICATION_DELETED';
  notificationId?: string;
  recipientUserId?: string;
  senderId?: string;
  postId?: string;
  notificationType?: string; // LIKE, COMMENT, REPLY, FOLLOW, MENTION
  unreadCount?: number;
  notification?: Notification; // Full notification data for instant display
  timestamp: string;
}

export interface WebSocketCallbacks {
  onFeedCreated?: (event: FeedEvent) => void;
  onFeedDeleted?: (event: FeedEvent) => void;
  onFeedUpdated?: (event: FeedEvent) => void;
  onFeedCommented?: (event: FeedEvent) => void;
  onCommentDeleted?: (event: FeedEvent) => void;
  onFeedLiked?: (event: FeedEvent) => void;
  onFeedUnliked?: (event: FeedEvent) => void;
  onNotificationCreated?: (event: NotificationEvent) => void;
  onNotificationCountUpdated?: (event: NotificationEvent) => void;
  onConnectionEstablished?: (event: FeedEvent) => void;
  onConnectionClosed?: (event: FeedEvent) => void;
  onError?: (error: any) => void;
}

// Store callbacks as arrays to support multiple components
interface WebSocketCallbackArrays {
  onFeedCreated?: Array<(event: FeedEvent) => void>;
  onFeedDeleted?: Array<(event: FeedEvent) => void>;
  onFeedUpdated?: Array<(event: FeedEvent) => void>;
  onFeedCommented?: Array<(event: FeedEvent) => void>;
  onCommentDeleted?: Array<(event: FeedEvent) => void>;
  onFeedLiked?: Array<(event: FeedEvent) => void>;
  onFeedUnliked?: Array<(event: FeedEvent) => void>;
  onNotificationCreated?: Array<(event: NotificationEvent) => void>;
  onNotificationCountUpdated?: Array<(event: NotificationEvent) => void>;
  onConnectionEstablished?: Array<(event: FeedEvent) => void>;
  onConnectionClosed?: Array<(event: FeedEvent) => void>;
  onError?: Array<(error: any) => void>;
}

class WebSocketService {
  private client: Client | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 10; // Increased to allow more retries
  private baseReconnectDelay = 1000; // Base delay: 1 second
  private maxReconnectDelay = 30000; // Max delay: 30 seconds
  private callbacks: WebSocketCallbacks = {};
  private callbackArrays: WebSocketCallbackArrays = {};
  private notificationSubscription: any = null;
  private feedSubscription: any = null;
  private currentUserId: string | null = null;
  private isConnecting = false;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeClient();
  }

  private async getCurrentUserId(): Promise<string | null> {
    try {
      const userData = await tokenManager.getUserData();
      return userData?.userId || null;
    } catch (error) {
      console.error('❌ Error getting current user ID:', error);
      return null;
    }
  }

  private initializeClient() {
    try {
      // Use dedicated WebSocket URL (direct to feed-service in dev, through gateway in prod)
      const wsUrl = getWebSocketURL();
      console.log('🔌 Initializing WebSocket connection to:', wsUrl);
      console.log('📡 WebSocket endpoint should be accessible at:', `${wsUrl}/info`);
      
      // Create STOMP client with webSocketFactory that creates a new socket each time
      // This ensures we get a fresh connection
      this.client = new Client({
        webSocketFactory: () => {
          console.log('🔌 Creating new SockJS connection to:', wsUrl);
          try {
            const socket = new SockJS(wsUrl);
            // Add error handlers to the socket
            socket.onerror = (error) => {
              console.error('❌ SockJS connection error:', error);
            };
            socket.onopen = () => {
              console.log('✅ SockJS socket opened');
            };
            return socket;
          } catch (error) {
            console.error('❌ Error creating SockJS connection:', error);
            throw error;
          }
        },
        debug: (str) => {
          // Only log important debug messages to reduce noise
          if (str.includes('CONNECTED') || str.includes('ERROR') || str.includes('CLOSED') || str.includes('Failed')) {
          console.log('🔌 WebSocket Debug:', str);
          }
        },
        reconnectDelay: this.baseReconnectDelay,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
        connectionTimeout: 10000, // 10 second timeout (increased for slower networks)
        // Disable automatic reconnection - we'll handle it manually with exponential backoff
        beforeConnect: () => {
          console.log('🔌 STOMP client attempting to connect...');
        },
      });

      // Connection established
      this.client.onConnect = async (frame) => {
        console.log('✅ WebSocket connected successfully:', frame);
        this.isConnected = true;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        
        // Get current user ID for notification subscription
        this.currentUserId = await this.getCurrentUserId();
        
        // Subscribe to feed events
        this.subscribeToFeedEvents();
        
        // Subscribe to notification events
        await this.subscribeToNotificationEvents();
        
        // Notify all registered callbacks about connection established
        const connectionEvent: FeedEvent = {
            type: 'CONNECTION_ESTABLISHED',
            timestamp: new Date().toISOString()
        };
        if (this.callbackArrays.onConnectionEstablished) {
          this.callbackArrays.onConnectionEstablished.forEach(cb => cb(connectionEvent));
        }
        
        console.log('✅ WebSocket fully initialized and ready for events');
      };

      // Connection error
      this.client.onStompError = (frame) => {
        const errorMessage = frame?.headers?.['message'] || frame?.message || 'Unknown STOMP error';
        console.error('❌ WebSocket STOMP error:', errorMessage, frame);
        this.isConnected = false;
        this.isConnecting = false;
        
        // Don't attempt reconnect on authentication errors (401, 403)
        const errorCode = frame?.headers?.['status'] || '';
        if (errorCode === '401' || errorCode === '403') {
          console.error('❌ Authentication error - stopping reconnection attempts');
          this.reconnectAttempts = this.maxReconnectAttempts; // Prevent reconnection
        }
        
        if (this.callbackArrays.onError) {
          this.callbackArrays.onError.forEach(cb => {
            try {
              cb(frame);
            } catch (error) {
              console.error('❌ Error in onError callback:', error);
            }
          });
        }
      };

      // Connection closed
      this.client.onWebSocketClose = (event: any) => {
        const closeCode = event?.code || 0;
        const closeReason = event?.reason || 'Unknown';
        const wasClean = event?.wasClean || false;
        
        console.log('🔌 WebSocket connection closed:', {
          code: closeCode,
          reason: closeReason,
          wasClean,
          timestamp: new Date().toISOString()
        });
        
        this.isConnected = false;
        this.isConnecting = false;
        
        // Unsubscribe from all topics
        if (this.feedSubscription) {
          try {
            this.feedSubscription.unsubscribe();
          } catch (e) {
            // Ignore unsubscribe errors
          }
          this.feedSubscription = null;
        }
        if (this.notificationSubscription) {
          try {
            this.notificationSubscription.unsubscribe();
          } catch (e) {
            // Ignore unsubscribe errors
          }
          this.notificationSubscription = null;
        }
        
        // Notify callbacks about connection closed
        const closedEvent: FeedEvent = {
            type: 'CONNECTION_CLOSED',
            timestamp: new Date().toISOString()
        };
        if (this.callbackArrays.onConnectionClosed) {
          this.callbackArrays.onConnectionClosed.forEach(cb => {
            try {
              cb(closedEvent);
            } catch (error) {
              console.error('❌ Error in onConnectionClosed callback:', error);
            }
          });
        }
        
        // Only attempt to reconnect if it was an unexpected close (not a clean close)
        // Error code 1002 means "Cannot connect to server" - this is a connection failure
        if (!wasClean && closeCode !== 1000) {
          // Don't reconnect on authentication errors (401, 403) or if max attempts reached
          if (this.reconnectAttempts < this.maxReconnectAttempts) {
            console.log(`🔄 Connection closed unexpectedly (code: ${closeCode}, reason: ${closeReason}). Will attempt reconnect.`);
        this.attemptReconnect();
          } else {
            console.error('❌ Max reconnection attempts reached. WebSocket will not reconnect automatically.');
            console.log('💡 To reconnect manually, call webSocketService.connect() again');
            // Reset attempts after a longer delay to allow manual retry
            setTimeout(() => {
              this.reconnectAttempts = 0;
              console.log('🔄 Reconnection attempts reset. WebSocket can now reconnect.');
            }, 60000); // Reset after 60 seconds
          }
        } else if (wasClean) {
          console.log('✅ WebSocket closed cleanly. No reconnection needed.');
          this.reconnectAttempts = 0; // Reset on clean close
        }
      };

    } catch (error) {
      console.error('❌ Error initializing WebSocket client:', error);
      if (this.callbackArrays.onError) {
        this.callbackArrays.onError.forEach(cb => cb(error));
      }
    }
  }

  private subscribeToFeedEvents() {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Cannot subscribe to feed events - not connected');
      return;
    }

    try {
      // Unsubscribe from previous subscription if exists
      if (this.feedSubscription) {
        this.feedSubscription.unsubscribe();
        this.feedSubscription = null;
      }

      // Subscribe to general feed events
      this.feedSubscription = this.client.subscribe('/topic/feeds', (message) => {
        try {
          const event: FeedEvent = JSON.parse(message.body);
          console.log('📥 Received feed event:', event.type, 'for feed:', event.feedId, 'by user:', event.userId);
          this.handleFeedEvent(event);
        } catch (error) {
          console.error('❌ Error parsing feed event:', error);
        }
      });

      console.log('📡 Subscribed to feed events topic');
    } catch (error) {
      console.error('❌ Error subscribing to feed events:', error);
    }
  }

  private async subscribeToNotificationEvents() {
    if (!this.client || !this.isConnected) {
      console.warn('⚠️ Cannot subscribe to notification events - not connected');
      return;
    }

    if (!this.currentUserId) {
      console.warn('⚠️ Cannot subscribe to notifications - no user ID available');
      return;
    }

    try {
      // Unsubscribe from previous subscription if exists
      if (this.notificationSubscription) {
        this.notificationSubscription.unsubscribe();
        this.notificationSubscription = null;
      }

      // Subscribe to notification topic - backend sends all notifications here
      // Frontend will filter by recipientUserId to ensure only relevant notifications are processed
      const notificationTopic = '/topic/notifications';
      console.log('📡 Subscribing to notification topic:', notificationTopic, 'for user:', this.currentUserId);
      
      this.notificationSubscription = this.client.subscribe(notificationTopic, (message) => {
        try {
          const event: NotificationEvent = JSON.parse(message.body);
          console.log('📥 Received notification event:', {
            type: event.type,
            notificationType: event.notificationType,
            recipientUserId: event.recipientUserId,
            currentUserId: this.currentUserId
          });
          
          // Filter events for current user only
          if (event.recipientUserId === this.currentUserId) {
            console.log('✅ Notification event is for current user, processing...');
            this.handleNotificationEvent(event);
          } else {
            console.log('⏭️ Notification event is for different user, ignoring');
          }
        } catch (error) {
          console.error('❌ Error parsing notification event:', error);
        }
      });

      console.log(`✅ Subscribed to notification topic for user: ${this.currentUserId}`);
    } catch (error) {
      console.error('❌ Error subscribing to notification events:', error);
    }
  }

  private handleFeedEvent(event: FeedEvent) {
    console.log('🔔 Handling feed event:', event.type, 'for feed:', event.feedId);
    
    switch (event.type) {
      case 'FEED_CREATED':
        if (this.callbackArrays.onFeedCreated) {
          console.log('📤 Calling', this.callbackArrays.onFeedCreated.length, 'onFeedCreated callbacks');
          this.callbackArrays.onFeedCreated.forEach(cb => cb(event));
        }
        break;
      case 'FEED_DELETED':
        if (this.callbackArrays.onFeedDeleted) {
          console.log('📤 Calling', this.callbackArrays.onFeedDeleted.length, 'onFeedDeleted callbacks');
          this.callbackArrays.onFeedDeleted.forEach(cb => cb(event));
        }
        break;
      case 'FEED_UPDATED':
        if (this.callbackArrays.onFeedUpdated) {
          console.log('📤 Calling', this.callbackArrays.onFeedUpdated.length, 'onFeedUpdated callbacks');
          this.callbackArrays.onFeedUpdated.forEach(cb => cb(event));
        }
        break;
      case 'FEED_COMMENTED':
        if (this.callbackArrays.onFeedCommented && this.callbackArrays.onFeedCommented.length > 0) {
          console.log('📤 Calling', this.callbackArrays.onFeedCommented.length, 'onFeedCommented callbacks for feed:', event.feedId);
          this.callbackArrays.onFeedCommented.forEach(cb => {
            try {
              cb(event);
            } catch (error) {
              console.error('❌ Error in onFeedCommented callback:', error);
            }
          });
        } else {
          console.warn('⚠️ No onFeedCommented callbacks registered');
        }
        break;
      case 'COMMENT_DELETED':
        if (this.callbackArrays.onCommentDeleted && this.callbackArrays.onCommentDeleted.length > 0) {
          console.log('📤 Calling', this.callbackArrays.onCommentDeleted.length, 'onCommentDeleted callbacks for feed:', event.feedId);
          this.callbackArrays.onCommentDeleted.forEach(cb => {
            try {
              cb(event);
            } catch (error) {
              console.error('❌ Error in onCommentDeleted callback:', error);
            }
          });
        } else {
          console.warn('⚠️ No onCommentDeleted callbacks registered');
        }
        break;
      case 'FEED_LIKED':
        if (this.callbackArrays.onFeedLiked && this.callbackArrays.onFeedLiked.length > 0) {
          console.log('📤 Calling', this.callbackArrays.onFeedLiked.length, 'onFeedLiked callbacks for feed:', event.feedId);
          this.callbackArrays.onFeedLiked.forEach(cb => {
            try {
              cb(event);
            } catch (error) {
              console.error('❌ Error in onFeedLiked callback:', error);
            }
          });
        } else {
          console.warn('⚠️ No onFeedLiked callbacks registered');
        }
        break;
      case 'FEED_UNLIKED':
        if (this.callbackArrays.onFeedUnliked && this.callbackArrays.onFeedUnliked.length > 0) {
          console.log('📤 Calling', this.callbackArrays.onFeedUnliked.length, 'onFeedUnliked callbacks for feed:', event.feedId);
          this.callbackArrays.onFeedUnliked.forEach(cb => {
            try {
              cb(event);
            } catch (error) {
              console.error('❌ Error in onFeedUnliked callback:', error);
            }
          });
        } else {
          console.warn('⚠️ No onFeedUnliked callbacks registered');
        }
        break;
      case 'CONNECTION_ESTABLISHED':
        if (this.callbackArrays.onConnectionEstablished) {
          this.callbackArrays.onConnectionEstablished.forEach(cb => cb(event));
        }
        break;
      case 'CONNECTION_CLOSED':
        if (this.callbackArrays.onConnectionClosed) {
          this.callbackArrays.onConnectionClosed.forEach(cb => cb(event));
        }
        break;
      default:
        console.log('📝 Unhandled feed event type:', event.type);
    }
  }

  private handleNotificationEvent(event: NotificationEvent) {
    switch (event.type) {
      case 'NOTIFICATION_CREATED':
        if (this.callbackArrays.onNotificationCreated) {
          this.callbackArrays.onNotificationCreated.forEach(cb => {
            try {
              cb(event);
            } catch (error) {
              console.error('❌ Error in onNotificationCreated callback:', error);
            }
          });
        }
        break;
      case 'NOTIFICATION_COUNT_UPDATED':
        if (this.callbackArrays.onNotificationCountUpdated) {
          this.callbackArrays.onNotificationCountUpdated.forEach(cb => {
            try {
              cb(event);
            } catch (error) {
              console.error('❌ Error in onNotificationCountUpdated callback:', error);
            }
          });
        }
        break;
      default:
        console.log('📝 Unhandled notification event type:', event.type);
    }
  }

  private attemptReconnect() {
    // Clear any existing reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ Max reconnection attempts reached. Stopping automatic reconnection.');
      console.log('💡 To reconnect manually, call webSocketService.connect() again');
      this.isConnecting = false;
      return;
    }

    if (this.isConnecting) {
      console.log('⏳ Reconnection already in progress, skipping...');
      return;
    }

    this.reconnectAttempts++;
    this.isConnecting = true;
    
    // Exponential backoff: delay = baseDelay * 2^(attempts-1), capped at maxDelay
    const exponentialDelay = Math.min(
      this.baseReconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.maxReconnectDelay
    );
    
    console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts}) in ${exponentialDelay}ms...`);
    console.log(`📊 Reconnect delay: ${exponentialDelay}ms (exponential backoff)`);

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      
      if (this.isConnected) {
        console.log('✅ Already connected, canceling reconnection attempt');
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        return;
      }

      if (!this.client) {
        console.log('🔄 Reinitializing WebSocket client...');
        this.initializeClient();
      }
      
      if (this.client && !this.isConnected) {
        try {
          console.log('🔌 Activating WebSocket client for reconnection...');
        this.client.activate();
        } catch (error) {
          console.error('❌ Error during reconnection attempt:', error);
          this.isConnecting = false;
          // Will retry on next close event if needed
        }
      }
    }, exponentialDelay);
  }

  // Public methods
  public connect(callbacks: WebSocketCallbacks) {
    // Store callbacks in arrays to support multiple components
    // This allows multiple FeedActionSection components to all receive events
    if (callbacks.onFeedCreated) {
      if (!this.callbackArrays.onFeedCreated) this.callbackArrays.onFeedCreated = [];
      this.callbackArrays.onFeedCreated.push(callbacks.onFeedCreated);
    }
    if (callbacks.onFeedDeleted) {
      if (!this.callbackArrays.onFeedDeleted) this.callbackArrays.onFeedDeleted = [];
      this.callbackArrays.onFeedDeleted.push(callbacks.onFeedDeleted);
    }
    if (callbacks.onFeedUpdated) {
      if (!this.callbackArrays.onFeedUpdated) this.callbackArrays.onFeedUpdated = [];
      this.callbackArrays.onFeedUpdated.push(callbacks.onFeedUpdated);
    }
    if (callbacks.onFeedCommented) {
      if (!this.callbackArrays.onFeedCommented) this.callbackArrays.onFeedCommented = [];
      this.callbackArrays.onFeedCommented.push(callbacks.onFeedCommented);
    }
    if (callbacks.onCommentDeleted) {
      if (!this.callbackArrays.onCommentDeleted) this.callbackArrays.onCommentDeleted = [];
      this.callbackArrays.onCommentDeleted.push(callbacks.onCommentDeleted);
    }
    if (callbacks.onFeedLiked) {
      if (!this.callbackArrays.onFeedLiked) this.callbackArrays.onFeedLiked = [];
      this.callbackArrays.onFeedLiked.push(callbacks.onFeedLiked);
    }
    if (callbacks.onFeedUnliked) {
      if (!this.callbackArrays.onFeedUnliked) this.callbackArrays.onFeedUnliked = [];
      this.callbackArrays.onFeedUnliked.push(callbacks.onFeedUnliked);
    }
    if (callbacks.onNotificationCreated) {
      if (!this.callbackArrays.onNotificationCreated) this.callbackArrays.onNotificationCreated = [];
      this.callbackArrays.onNotificationCreated.push(callbacks.onNotificationCreated);
    }
    if (callbacks.onNotificationCountUpdated) {
      if (!this.callbackArrays.onNotificationCountUpdated) this.callbackArrays.onNotificationCountUpdated = [];
      this.callbackArrays.onNotificationCountUpdated.push(callbacks.onNotificationCountUpdated);
    }
    if (callbacks.onConnectionEstablished) {
      if (!this.callbackArrays.onConnectionEstablished) this.callbackArrays.onConnectionEstablished = [];
      this.callbackArrays.onConnectionEstablished.push(callbacks.onConnectionEstablished);
    }
    if (callbacks.onConnectionClosed) {
      if (!this.callbackArrays.onConnectionClosed) this.callbackArrays.onConnectionClosed = [];
      this.callbackArrays.onConnectionClosed.push(callbacks.onConnectionClosed);
    }
    if (callbacks.onError) {
      if (!this.callbackArrays.onError) this.callbackArrays.onError = [];
      this.callbackArrays.onError.push(callbacks.onError);
    }
    
    // Also keep single callback for backward compatibility (last registered wins)
    this.callbacks = {
      ...this.callbacks,
      ...callbacks,
    };
    
    console.log('🔌 WebSocket connect called, isConnected:', this.isConnected, 'isConnecting:', this.isConnecting);
    
    if (!this.client) {
      console.warn('⚠️ WebSocket client not initialized, reinitializing...');
      this.initializeClient();
    }
    
    if (this.isConnected) {
      console.log('✅ WebSocket already connected, callbacks registered');
      // If already connected, trigger connection established callback immediately
      if (callbacks.onConnectionEstablished) {
        callbacks.onConnectionEstablished({
          type: 'CONNECTION_ESTABLISHED',
          timestamp: new Date().toISOString()
        });
      }
    } else if (!this.isConnecting) {
      // Only activate if not already connecting and haven't exceeded max attempts
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.warn('⚠️ Max reconnection attempts reached. Resetting for manual reconnect...');
        // Allow manual reconnect by resetting attempts if user explicitly calls connect
        this.reconnectAttempts = 0;
      }
      
      this.isConnecting = true;
      console.log('🔌 Activating WebSocket connection...');
      if (this.client) {
        try {
          // Check if client is already active
          if (this.client.active) {
            console.log('⚠️ WebSocket client already active, deactivating first...');
            this.client.deactivate();
            // Wait a bit before reactivating
            setTimeout(() => {
    if (this.client && !this.isConnected) {
                this.client.activate();
              }
            }, 500);
          } else {
      this.client.activate();
          }
          console.log('✅ WebSocket activation initiated');
        } catch (error) {
          console.error('❌ Error activating WebSocket:', error);
          this.isConnecting = false;
          if (this.callbackArrays.onError) {
            this.callbackArrays.onError.forEach(cb => {
              try {
                cb(error);
              } catch (cbError) {
                console.error('❌ Error in onError callback:', cbError);
              }
            });
          }
        }
      } else {
        console.error('❌ Cannot activate WebSocket - client is null, reinitializing...');
        this.initializeClient();
        this.isConnecting = false;
        // Try again after initialization
        setTimeout(() => {
          if (this.client && !this.isConnecting) {
            this.connect(callbacks);
          }
        }, 100);
      }
    } else {
      console.log('⏳ WebSocket connection already in progress, waiting...');
    }
  }

  public disconnect() {
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.notificationSubscription) {
      try {
        this.notificationSubscription.unsubscribe();
      } catch (e) {
        // Ignore unsubscribe errors
      }
      this.notificationSubscription = null;
    }
    
    if (this.feedSubscription) {
      try {
        this.feedSubscription.unsubscribe();
      } catch (e) {
        // Ignore unsubscribe errors
      }
      this.feedSubscription = null;
    }
    
    if (this.client && this.isConnected) {
      console.log('🔌 Disconnecting from WebSocket...');
      this.client.deactivate();
      this.isConnected = false;
    }
    
    this.isConnecting = false;
    this.reconnectAttempts = 0; // Reset attempts on manual disconnect
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
