/**
 * Notification Service for BharathVA
 * Handles notification operations
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';
import * as SecureStore from 'expo-secure-store';
import { authService, tokenManager } from './authService';

// Types
export interface Notification {
  id: string;
  recipientUserId: string;
  actorUserId: string;
  senderId?: string; // New schema field (senderId = who triggered the notification)
  actorUsername: string;
  actorFullName: string;
  actorProfileImageUrl?: string | null;
  type: 'LIKE' | 'COMMENT' | 'REPLY' | 'FOLLOW' | 'MENTION';
  feedId: string;
  postId?: string; // New schema field (postId = feed post ID)
  feedImageUrl?: string | null;
  message?: string; // Human-readable notification message (e.g., "User1 replied to your comment: {comment message}")
  commentText?: string | null; // Comment/reply text for COMMENT/REPLY type notifications
  originalCommentText?: string | null; // Original comment text that was replied to (for REPLY type notifications)
  commentId?: string | null; // ID/index of the comment being replied to (for REPLY type notifications)
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  timeAgoHours: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

export interface NotificationPageResponse {
  content: Notification[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Configuration
const API_CONFIG = {
  timeout: getTimeout(),
  enableLogging: isLoggingEnabled(),
};

// Utility functions
const log = (message: string, data?: any) => {
  if (API_CONFIG.enableLogging) {
    console.log(`[NotificationService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.enableLogging) {
    console.error(`[NotificationService] ${message}`, error || '');
  }
};

// Token management - Use tokenManager for consistency with authService
const getAuthToken = async (): Promise<string | null> => {
  try {
    // CRITICAL: Use tokenManager.getAccessToken() instead of direct SecureStore access
    // This ensures consistency with authService and proper token handling
    const token = await tokenManager.getAccessToken();
    if (!token) {
      logError('No authentication token found');
      return null;
    }
    
    // Validate token format (should be a valid JWT)
    if (token.trim().length === 0) {
      logError('Authentication token is empty');
      return null;
    }
    
    // Validate JWT format (should have 3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) {
      logError('Invalid JWT token format');
      return null;
    }
    
    return token;
  } catch (error) {
    logError('Failed to retrieve authentication token', error);
    return null;
  }
};

// API request wrapper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const startTime = Date.now();
  const baseURL = getGatewayURL();
  const url = `${baseURL}${endpoint}`;

  try {
    log('API Request', { method: options.method || 'GET', url });

    // CRITICAL: Properly merge headers from options
    // Convert Headers object to plain object if needed
    let existingHeaders: Record<string, string> = {};
    if (options.headers) {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          existingHeaders[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          existingHeaders[key] = value;
        });
      } else {
        existingHeaders = options.headers as Record<string, string>;
      }
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...existingHeaders,
    };

    // CRITICAL: Check if Authorization header is already provided (e.g., from retry with new token)
    // If provided, use it directly - don't call getAuthToken() which might return stale token
    if (headers['Authorization']) {
      let authHeader = headers['Authorization'];
      
      // CRITICAL: Normalize the Authorization header
      // Strip any existing Bearer prefix and re-add it to ensure consistency
      if (authHeader.startsWith('Bearer ')) {
        authHeader = authHeader.substring(7).trim();
      } else {
        authHeader = authHeader.trim();
      }
      
      // CRITICAL: Validate token is not empty and is a valid JWT
      if (!authHeader || authHeader.length === 0) {
        logError('Provided Authorization header contains empty token');
        const tokenFromStore = await getAuthToken();
        if (tokenFromStore) {
          headers['Authorization'] = `Bearer ${tokenFromStore}`;
          log('Replaced empty token with token from SecureStore');
        } else {
          logError('No token available in SecureStore to replace empty token');
        }
      } else if (!authHeader.includes('.') || authHeader.split('.').length !== 3) {
        logError('Provided Authorization header contains invalid JWT format');
        const tokenFromStore = await getAuthToken();
        if (tokenFromStore) {
          headers['Authorization'] = `Bearer ${tokenFromStore}`;
          log('Replaced invalid token with token from SecureStore');
        } else {
          logError('No token available in SecureStore to replace invalid token');
        }
      } else {
        // Token is valid, ensure it has Bearer prefix
        headers['Authorization'] = `Bearer ${authHeader}`;
        if (API_CONFIG.enableLogging) {
          log('Using provided token in Authorization header', { 
            tokenPrefix: authHeader.substring(0, 20) + '...',
            tokenLength: authHeader.length,
            tokenLast10: authHeader.substring(authHeader.length - 10)
          });
        }
      }
    } else {
      // CRITICAL: Always fetch token fresh from SecureStore (never cache)
      // This ensures we get the latest token after refresh
      const token = await getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        // Log token prefix for debugging (first 20 chars only)
        if (API_CONFIG.enableLogging) {
          log('Using token from SecureStore', { tokenPrefix: token.substring(0, 20) + '...' });
        }
      } else {
        logError('No token available for request');
      }
    }

    // CRITICAL: Final verification that Authorization header is properly set
    if (headers['Authorization']) {
      const finalAuthHeader = headers['Authorization'];
      if (!finalAuthHeader.startsWith('Bearer ')) {
        logError('CRITICAL: Authorization header missing Bearer prefix before fetch!');
        const tokenFromStore = await getAuthToken();
        if (tokenFromStore) {
          headers['Authorization'] = `Bearer ${tokenFromStore}`;
          log('Fixed Authorization header before fetch');
        }
      } else {
        const tokenValue = finalAuthHeader.substring(7).trim();
        if (tokenValue.length === 0) {
          logError('CRITICAL: Authorization header contains empty token before fetch!');
          const tokenFromStore = await getAuthToken();
          if (tokenFromStore) {
            headers['Authorization'] = `Bearer ${tokenFromStore}`;
            log('Fixed empty Authorization header before fetch');
          }
        } else if (API_CONFIG.enableLogging) {
          log('Final Authorization header verification', {
            hasBearer: finalAuthHeader.startsWith('Bearer '),
            tokenLength: tokenValue.length,
            tokenLast10: tokenValue.substring(tokenValue.length - 10)
          });
        }
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      method: options.method,
      body: options.body,
      ...(options.cache && { cache: options.cache }),
      ...(options.credentials && { credentials: options.credentials }),
      ...(options.integrity && { integrity: options.integrity }),
      ...(options.keepalive !== undefined && { keepalive: options.keepalive }),
      ...(options.mode && { mode: options.mode }),
      ...(options.redirect && { redirect: options.redirect }),
      ...(options.referrer && { referrer: options.referrer }),
      ...(options.referrerPolicy && { referrerPolicy: options.referrerPolicy }),
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    log(`API Response: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        const errorData = await response.json().catch(() => null);
        if (errorData && typeof errorData === 'object') {
          errorText = errorData.error || errorData.message || JSON.stringify(errorData);
        } else {
          errorText = await response.text().catch(() => `HTTP ${response.status}`);
        }
      } catch (parseError) {
        errorText = await response.text().catch(() => `HTTP ${response.status}`);
      }
      
      // CRITICAL: Don't log 401s as errors - they're handled gracefully by callers
      // 401s after token refresh are expected (backend authorization issue), not frontend errors
      if (response.status === 401) {
        log(`API Response: ${response.status} (authentication failed - handled by caller)`);
      } else {
        logError(`API Error: ${response.status}`, errorText);
      }
      
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorText || `HTTP ${response.status}`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    let data: T;
    try {
      data = await response.json();
    } catch (parseError) {
      logError('Failed to parse JSON response', parseError);
      return {
        success: false,
        error: {
          code: 'JSON_PARSE_ERROR',
          message: 'Invalid JSON response from server',
          details: parseError,
        },
        timestamp: new Date().toISOString(),
      };
    }

    log(`API Success: ${duration}ms`);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logError(`API Request failed (${duration}ms)`, error);

    if (error.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'TIMEOUT',
          message: 'Request timeout',
        },
        timestamp: new Date().toISOString(),
      };
    }

    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error.message || 'Network request failed',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get all notifications for the current user
 * Latest notifications appear first
 */
export const getNotifications = async (
  page: number = 0,
  size: number = 20
): Promise<ApiResponse<NotificationPageResponse>> => {
  try {
    log('Fetching notifications', { page, size });

    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'No authentication token found',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const response = await apiRequest<NotificationPageResponse>(
      `/api/feed/notifications?page=${page}&size=${size}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.success && response.data) {
      log('Notifications fetched successfully', {
        count: response.data.content?.length || 0,
        totalElements: response.data.totalElements || 0,
        page: response.data.number || 0,
        totalPages: response.data.totalPages || 0,
      });
    } else {
      logError('Failed to fetch notifications', {
        error: response.error,
        code: response.error?.code,
        message: response.error?.message,
      });
    }

    return response;
  } catch (error) {
    logError('Unexpected error in getNotifications', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Get unread notification count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ count: number }>> => {
  try {
    log('Fetching unread notification count');

    const token = await getAuthToken();
    if (!token) {
      logError('No authentication token found for getUnreadCount');
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'No authentication token found',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Don't pass Authorization header explicitly - apiRequest will add it
    // This prevents duplicate headers and ensures proper token handling
    const response = await apiRequest<{ count: number }>(
      '/api/feed/notifications/unread/count',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle 401 errors - token might be expired, try to refresh
    if (!response.success && response.error?.code === 'HTTP_401') {
      log('Authentication failed (401) - attempting token refresh');
      
      // Get current token before refresh for comparison
      const oldToken = await getAuthToken();
      
      try {
        const refreshed = await authService.refreshAccessToken();
        if (refreshed) {
          log('Token refresh returned true, verifying new token');
          
          // CRITICAL: Wait for token to be saved and verify it's actually different
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // CRITICAL: Verify fresh token is available and different from old token
          const freshToken = await getAuthToken();
          if (!freshToken) {
            logError('CRITICAL: No token available after refresh');
            return {
              success: false,
              error: {
                code: 'AUTH_ERROR',
                message: 'Token refresh failed - no token available',
              },
              timestamp: new Date().toISOString(),
            };
          }
          
          // Verify token actually changed (if old token existed)
          if (oldToken && oldToken === freshToken) {
            logError('CRITICAL: Token did not change after refresh');
            return {
              success: false,
              error: {
                code: 'AUTH_ERROR',
                message: 'Token refresh did not produce a new token',
              },
              timestamp: new Date().toISOString(),
            };
          }
          
          log('Using fresh token for retry', { tokenLength: freshToken.length });
          
          // Retry the request with explicit fresh token
          const retryResponse = await apiRequest<{ count: number }>(
            '/api/feed/notifications/unread/count',
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${freshToken}`,
              },
            }
          );
          
          if (retryResponse.success && retryResponse.data) {
            log('Unread count fetched successfully after token refresh', { count: retryResponse.data.count });
            return retryResponse;
          } else {
            if (retryResponse.error?.code === 'HTTP_401') {
              log('Retry failed with 401 - likely backend authorization issue (not frontend token problem)');
            } else {
              logError('Retry failed after token refresh', retryResponse.error);
            }
            return retryResponse;
          }
        } else {
          log('Token refresh returned false - refresh token may be expired');
          return {
            success: false,
            error: {
              code: 'AUTH_ERROR',
              message: 'Token refresh failed. Please log in again.',
            },
            timestamp: new Date().toISOString(),
          };
        }
      } catch (refreshError) {
        logError('Failed to refresh token', refreshError);
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Token refresh failed. Please log in again.',
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    if (response.success && response.data) {
      log('Unread count fetched successfully', { count: response.data.count });
    } else {
      logError('Failed to fetch unread count', response.error);
    }

    return response;
  } catch (error) {
    logError('Unexpected error in getUnreadCount', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Mark a notification as read
 */
export const markAsRead = async (notificationId: string): Promise<ApiResponse<void>> => {
  try {
    log('Marking notification as read', { notificationId });

    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'No authentication token found',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const response = await apiRequest<void>(
      `/api/feed/notifications/${notificationId}/read`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.success) {
      log('Notification marked as read successfully');
    } else {
      logError('Failed to mark notification as read', response.error);
    }

    return response;
  } catch (error) {
    logError('Unexpected error in markAsRead', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<ApiResponse<void>> => {
  try {
    log('Marking all notifications as read');

    // CRITICAL: Use apiRequest (not apiCall) to use correct gateway URL
    // apiCall uses /api/auth base URL which causes wrong endpoint path
    // apiRequest uses getGatewayURL() which is correct for feed-service endpoints
    
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'No authentication token found',
        },
        timestamp: new Date().toISOString(),
      };
    }

    // First attempt with current token
    const response = await apiRequest<void>(
      '/api/feed/notifications/read-all',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Handle 401 errors - token might be expired, try to refresh
    if (!response.success && response.error?.code === 'HTTP_401') {
      log('Authentication failed (401) - attempting token refresh');
      
      // Get current token before refresh for comparison
      const oldToken = await getAuthToken();
      
      try {
        const refreshed = await authService.refreshAccessToken();
        if (refreshed) {
          log('Token refresh returned true, verifying new token');
          
          // CRITICAL: Wait for token to be saved and verify it's actually different
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // CRITICAL: Verify fresh token is available and different from old token
          const freshToken = await getAuthToken();
          if (!freshToken) {
            logError('CRITICAL: No token available after refresh');
            return {
              success: false,
              error: {
                code: 'AUTH_ERROR',
                message: 'Token refresh failed - no token available',
              },
              timestamp: new Date().toISOString(),
            };
          }
          
          // Verify token actually changed (if old token existed)
          if (oldToken && oldToken === freshToken) {
            logError('CRITICAL: Token did not change after refresh - token refresh may have failed silently');
            return {
              success: false,
              error: {
                code: 'AUTH_ERROR',
                message: 'Token refresh did not produce a new token',
              },
              timestamp: new Date().toISOString(),
            };
          }
          
          log('Using fresh token for retry', { 
            tokenLength: freshToken.length,
            tokenChanged: oldToken !== freshToken,
            oldTokenPrefix: oldToken ? oldToken.substring(0, 20) + '...' : 'none',
            newTokenPrefix: freshToken.substring(0, 20) + '...'
          });
          
          // Retry the request with explicit fresh token
          const retryResponse = await apiRequest<void>(
            '/api/feed/notifications/read-all',
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${freshToken}`,
              },
            }
          );
          
          if (retryResponse.success) {
            log('All notifications marked as read successfully after token refresh');
            return retryResponse;
          } else {
            // If retry still fails with 401, validate token format and check backend
            if (retryResponse.error?.code === 'HTTP_401') {
              // Verify token format one more time
              const tokenParts = freshToken.split('.');
              if (tokenParts.length !== 3) {
                logError('CRITICAL: Fresh token has invalid JWT format after refresh');
                return {
                  success: false,
                  error: {
                    code: 'AUTH_ERROR',
                    message: 'Invalid token format after refresh',
                  },
                  timestamp: new Date().toISOString(),
                };
              }
              
              log('Retry failed with 401 after token refresh - backend authorization issue (not frontend token problem)');
              log('Backend authorization issue (401) - UI already updated optimistically');
            } else {
              logError('Retry failed after token refresh', retryResponse.error);
            }
            return retryResponse;
          }
        } else {
          log('Token refresh returned false - refresh token may be expired or invalid');
          return {
            success: false,
            error: {
              code: 'AUTH_ERROR',
              message: 'Token refresh failed. Please log in again.',
            },
            timestamp: new Date().toISOString(),
          };
        }
      } catch (refreshError) {
        logError('Failed to refresh token', refreshError);
        return {
          success: false,
          error: {
            code: 'AUTH_ERROR',
            message: 'Token refresh failed. Please log in again.',
          },
          timestamp: new Date().toISOString(),
        };
      }
    }

    if (response.success) {
      log('All notifications marked as read successfully');
    } else {
      logError('Failed to mark all notifications as read', response.error);
    }

    return response;
  } catch (error) {
    logError('Unexpected error in markAllAsRead', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while marking notifications as read',
        details: error instanceof Error ? error.message : String(error),
      },
      timestamp: new Date().toISOString(),
    };
  }
};
