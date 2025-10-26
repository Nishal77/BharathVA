/**
 * User Service for BharathVA
 * Handles user profile operations
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';
import * as SecureStore from 'expo-secure-store';

// Types
export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  profilePicture?: string;
  bio?: string;
  verified?: boolean;
  followersCount?: number;
  followingCount?: number;
  postsCount?: number;
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
    console.log(`[UserService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.enableLogging) {
    console.error(`[UserService] ${message}`, error || '');
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
      
      // Don't log 404s as errors since they're expected during endpoint discovery
      if (response.status === 404) {
        log(`ℹ️  API Response: ${response.status} (${duration}ms) - Endpoint not found`);
      } else {
        logError(`API Error: ${response.status}`, errorText);
      }
      
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

// Get user profile by ID - Try multiple endpoints
export const getUserProfileById = async (userId: string): Promise<ApiResponse<UserProfile>> => {
  try {
    log('Fetching user profile by ID', { userId });
    
    // Get authentication token
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
    
    // Try different possible endpoints for user profile
    // Put the working endpoint first to reduce 404s
    const possibleEndpoints = [
      `/api/auth/user/${userId}`,  // This is the working endpoint
      `/api/user/${userId}`,
      `/api/users/${userId}`,
      `/api/profile/${userId}`,
      `/api/user/profile/${userId}`
    ];
    
    for (const endpoint of possibleEndpoints) {
      try {
        log(`🔍 Trying endpoint: ${endpoint}`);
        const response = await apiRequest<UserProfile>(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.success && response.data) {
          // Handle different response formats from backend
          let userProfile: UserProfile;
          
          if (response.data.data) {
            // If response has nested data structure
            userProfile = {
              id: response.data.data.id || userId,
              fullName: response.data.data.fullName || response.data.data.full_name,
              username: response.data.data.username,
              email: response.data.data.email,
              profilePicture: response.data.data.profilePicture || response.data.data.profile_picture,
              bio: response.data.data.bio,
              verified: response.data.data.verified || response.data.data.isEmailVerified,
              followersCount: response.data.data.followersCount || response.data.data.followers_count,
              followingCount: response.data.data.followingCount || response.data.data.following_count,
              postsCount: response.data.data.postsCount || response.data.data.posts_count
            };
          } else {
            // If response is direct user data
            userProfile = {
              id: response.data.id || userId,
              fullName: response.data.fullName || response.data.full_name,
              username: response.data.username,
              email: response.data.email,
              profilePicture: response.data.profilePicture || response.data.profile_picture,
              bio: response.data.bio,
              verified: response.data.verified || response.data.isEmailVerified,
              followersCount: response.data.followersCount || response.data.followers_count,
              followingCount: response.data.followingCount || response.data.following_count,
              postsCount: response.data.postsCount || response.data.posts_count
            };
          }
          
          log('✅ User profile fetched successfully', { userId, endpoint, userProfile });
          return {
            success: true,
            data: userProfile,
            timestamp: new Date().toISOString(),
          };
        } else {
          // Log 404s as info instead of errors since they're expected during endpoint discovery
          if (response.error?.code === 'HTTP_404') {
            log(`ℹ️  Endpoint ${endpoint} not found (404) - trying next...`);
          } else {
            log(`⚠️  Endpoint ${endpoint} failed: ${response.error?.message} - trying next...`);
          }
        }
      } catch (error) {
        log(`⚠️  Endpoint ${endpoint} failed with exception: ${error instanceof Error ? error.message : 'Unknown error'} - trying next...`);
        continue;
      }
    }
    
    // If all endpoints fail, return error
    logError('❌ All user profile endpoints failed', { userId });
    return {
      success: false,
      error: {
        code: 'USER_NOT_FOUND',
        message: 'User profile not found',
      },
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    logError('❌ Unexpected error in getUserProfileById', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while fetching user profile',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Get current user profile
export const getCurrentUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  try {
    log('Fetching current user profile');
    
    // Get authentication token
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
    
    // Make API request
    const response = await apiRequest<UserProfile>('/api/user/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.success) {
      log('✅ Current user profile fetched successfully');
    } else {
      logError('❌ Failed to fetch current user profile', response.error);
    }
    
    return response;
    
  } catch (error) {
    logError('❌ Unexpected error in getCurrentUserProfile', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while fetching current user profile',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Export configuration for debugging
export const getUserServiceConfig = () => ({
  baseUrl: getGatewayURL(),
  timeout: API_CONFIG.timeout,
  enableLogging: API_CONFIG.enableLogging,
});
