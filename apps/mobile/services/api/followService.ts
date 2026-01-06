/**
 * Follow Service for BharathVA
 * Handles follow/unfollow operations
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';
import * as SecureStore from 'expo-secure-store';
import { tokenManager } from './authService';

// Types
export interface FollowResponse {
  isFollowing: boolean;
  followerId: string;
  followingId: string;
  followerFollowingCount?: number;
  followingFollowersCount?: number;
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

// Configuration
const API_CONFIG = {
  timeout: getTimeout(),
  enableLogging: isLoggingEnabled(),
};

// Utility functions
const log = (message: string, data?: any) => {
  if (API_CONFIG.enableLogging) {
    console.log(`[FollowService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.enableLogging) {
    console.error(`[FollowService] ${message}`, error || '');
  }
};

// Token management - Use tokenManager for consistency
const getAuthToken = async (): Promise<string | null> => {
  try {
    // Use tokenManager for consistent token handling and automatic refresh
    const token = await tokenManager.getAccessToken();
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
  options: RequestInit
): Promise<ApiResponse<T>> => {
  const startTime = Date.now();
  const baseUrl = getGatewayURL();
  const fullUrl = `${baseUrl}${endpoint}`;
  
  log(`🌐 API Request: ${options.method || 'GET'} ${fullUrl}`);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const response = await fetch(fullUrl, {
      ...options,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;
    
    log(`📥 API Response: ${response.status} (${duration}ms)`);
    
    if (!response.ok) {
      const errorText = await response.text();
      logError(`API Error: ${response.status}`, errorText);
      
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: `Request failed with status ${response.status}`,
          details: errorText,
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    let data;
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
    
    log(`✅ API Success: ${duration}ms`);
    
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    const duration = Date.now() - startTime;
    logError(`❌ API Error: ${duration}ms`, error);
    
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Unknown network error',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Follow a user
 * @param followingId The user ID to follow
 */
export const followUser = async (followingId: string): Promise<ApiResponse<FollowResponse>> => {
  try {
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
    
    const currentUserId = await tokenManager.getUserIdFromToken();
    if (currentUserId && currentUserId === followingId) {
      logError('Cannot follow yourself', { currentUserId, followingId });
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot follow yourself',
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    log('Following user', { followingId });
    
    const response = await apiRequest<FollowResponse>(`/api/auth/follow/${followingId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.success && response.data) {
      let followData: FollowResponse;
      
      if (response.data.data) {
        followData = response.data.data as FollowResponse;
      } else {
        followData = response.data as FollowResponse;
      }
      
      log('✅ Successfully followed user', { followingId, isFollowing: followData.isFollowing });
      
      return {
        success: true,
        data: followData,
        timestamp: response.timestamp,
      };
    } else {
      logError('❌ Failed to follow user', response.error);
      return response;
    }
  } catch (error) {
    logError('❌ Unexpected error in followUser', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while following user',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Unfollow a user
 * @param followingId The user ID to unfollow
 */
export const unfollowUser = async (followingId: string): Promise<ApiResponse<FollowResponse>> => {
  try {
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
    
    log('Unfollowing user', { followingId });
    
    const response = await apiRequest<FollowResponse>(`/api/auth/follow/${followingId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.success && response.data) {
      let followData: FollowResponse;
      
      if (response.data.data) {
        followData = response.data.data as FollowResponse;
      } else {
        followData = response.data as FollowResponse;
      }
      
      log('✅ Successfully unfollowed user', { followingId, isFollowing: followData.isFollowing });
      
      return {
        success: true,
        data: followData,
        timestamp: response.timestamp,
      };
    } else {
      logError('❌ Failed to unfollow user', response.error);
      return response;
    }
  } catch (error) {
    logError('❌ Unexpected error in unfollowUser', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while unfollowing user',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

/**
 * Check if current user is following another user
 * @param followingId The user ID to check
 */
export const getFollowStatus = async (followingId: string): Promise<ApiResponse<{ isFollowing: boolean }>> => {
  try {
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
    
    log('Checking follow status', { followingId });
    
    const response = await apiRequest<{ isFollowing: boolean }>(`/api/auth/follow/${followingId}/status`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.success && response.data) {
      let statusData: { isFollowing: boolean };
      
      if (response.data.data) {
        statusData = response.data.data as { isFollowing: boolean };
      } else {
        statusData = response.data as { isFollowing: boolean };
      }
      
      log('✅ Follow status retrieved', { followingId, isFollowing: statusData.isFollowing });
      
      return {
        success: true,
        data: statusData,
        timestamp: response.timestamp,
      };
    } else {
      logError('❌ Failed to get follow status', response.error);
      return response;
    }
  } catch (error) {
    logError('❌ Unexpected error in getFollowStatus', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while checking follow status',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Export configuration for debugging
export const getFollowServiceConfig = () => ({
  baseUrl: getGatewayURL(),
  timeout: API_CONFIG.timeout,
  enableLogging: API_CONFIG.enableLogging,
});

