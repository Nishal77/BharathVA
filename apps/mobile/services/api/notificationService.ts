/**
 * Notification Service for BharathVA
 * Handles notification operations
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';
import * as SecureStore from 'expo-secure-store';

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

// Token management
const getAuthToken = async (): Promise<string | null> => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) {
      logError('No authentication token found');
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

    const token = await getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(options.headers as HeadersInit),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    log(`API Response: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      logError(`API Error: ${response.status}`, errorText);
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
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'No authentication token found',
        },
        timestamp: new Date().toISOString(),
      };
    }

    const response = await apiRequest<{ count: number }>(
      '/api/feed/notifications/unread/count',
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

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
      '/api/feed/notifications/read-all',
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

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
        message: 'An unexpected error occurred',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};
