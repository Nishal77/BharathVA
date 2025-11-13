/**
 * User Service for BharathVA
 * Handles user profile operations
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';
import * as SecureStore from 'expo-secure-store';
import { apiCall } from './authService';
import { API_CONFIG } from './config';

// Types
export interface UserProfile {
  id: string;
  fullName: string;
  username: string;
  email?: string;
  profilePicture?: string | null;
  profileImageUrl?: string | null;
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

// Utility functions
const log = (message: string, data?: any) => {
  if (API_CONFIG.ENABLE_LOGGING) {
    console.log(`[UserService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.ENABLE_LOGGING) {
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
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
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

// Get user profile by ID - Use correct endpoint with proper auth error handling
export const getUserProfileById = async (userId: string): Promise<ApiResponse<UserProfile>> => {
  try {
    // Get authentication token first
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
    
    // CRITICAL: Extract user ID from token to verify consistency
    // This ensures we're using the correct user ID from the token, not stale data
    let tokenUserId: string | null = null;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split('')
            .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
        );
        const payload = JSON.parse(jsonPayload);
        tokenUserId = payload.userId || payload.sub || null;
      }
    } catch (error) {
      logError('Could not extract user ID from token', error);
    }
    
    // CRITICAL: If userId parameter doesn't match token's user ID, log warning
    // But still proceed - userId might be for a different user (e.g., viewing someone's profile)
    if (tokenUserId && userId !== tokenUserId) {
      log(`ℹ️  Fetching profile for different user: requested=${userId}, token=${tokenUserId}`);
    }
    
    log('Fetching user profile by ID', { 
      userId,
      tokenUserId: tokenUserId || 'unknown',
      userIdMatch: tokenUserId === userId
    });
    
    // Use the correct endpoint - BASE_URL already includes /api/auth, so endpoint should be /user/{userId}
    // Gateway rewrites /api/auth/user/{userId} to /auth/user/{userId} which matches backend @RequestMapping("/auth/user")
    const endpoint = `/user/${userId}`;
    
    try {
      log(`🔍 Fetching from endpoint: ${endpoint} (full URL: ${API_CONFIG.BASE_URL}${endpoint})`);
      // Use apiCall from authService for centralized token refresh handling
      const response = await apiCall<UserProfile>(endpoint, 'GET', undefined, true);
        
      // Handle user not found (404)
      if (!response.success && response.error?.code === 'HTTP_404') {
        log(`ℹ️  User ${userId} not found (404)`);
          return {
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User profile not found - user may have been deleted',
            },
            timestamp: new Date().toISOString(),
          };
        }
        
      // Handle other errors (auth errors should be handled by apiCall with token refresh)
      if (!response.success) {
        logError(`❌ Failed to fetch user profile: ${response.error?.message}`, response.error);
        return response;
          }
      
      // Success case
      if (response.success && response.data) {
          // Backend returns ApiResponse<T> where T is Map<String, Object>
          // Structure: { success: true, message: "...", data: { id: "...", profileImageUrl: "...", ... }, timestamp: "..." }
          // So response.data is the entire ApiResponse object, and response.data.data is the actual user data Map
          
          let userData: any;
          
          // Check if response.data has a nested 'data' property (ApiResponse structure)
          if (response.data.data) {
            userData = response.data.data;
            log(`📦 Using nested data structure from ApiResponse`);
          } else if (response.data.success !== undefined || response.data.message !== undefined) {
            // This shouldn't happen, but if it does, the response.data itself might be the ApiResponse
            log(`⚠️ Unexpected response structure, trying to extract user data`);
            userData = response.data;
          } else {
            // Direct user data (shouldn't happen with current backend, but handle it)
            userData = response.data;
            log(`📦 Using direct user data structure`);
          }
          
          // Extract profileImageUrl with multiple fallback options
          // Check for camelCase, snake_case, and other variations
          const profileImageUrl = userData.profileImageUrl || 
                                  userData.profile_image_url ||  // NeonDB field name (snake_case)
                                  userData.profilePicture || 
                                  userData.profile_picture || 
                                  null;
          
          // Validate and normalize URL if present
          let validatedImageUrl = null;
          if (profileImageUrl) {
            // Remove whitespace
            const trimmedUrl = String(profileImageUrl).trim();
            // Ensure HTTPS for Cloudinary URLs
            if (trimmedUrl.startsWith('http://res.cloudinary.com')) {
              validatedImageUrl = trimmedUrl.replace('http://', 'https://');
            } else if (trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
              // Convert other HTTP URLs to HTTPS
              validatedImageUrl = trimmedUrl.replace('http://', 'https://');
            } else if (trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('http://')) {
              validatedImageUrl = trimmedUrl;
            } else if (trimmedUrl.length > 0) {
              // If it's a relative path or malformed, try to construct full URL
              log(`⚠️  Profile image URL might be invalid: ${trimmedUrl}`);
              validatedImageUrl = trimmedUrl;
            }
          }
          
          const userProfile: UserProfile = {
            id: userData.id || userId,
            fullName: userData.fullName || userData.full_name || `User ${userId.substring(0, 8)}`,
            username: userData.username || `user_${userId.substring(0, 8)}`,
            email: userData.email,
            profilePicture: validatedImageUrl,
            profileImageUrl: validatedImageUrl, // Primary field from NeonDB users.profile_image_url
            bio: userData.bio,
            verified: userData.verified || userData.isEmailVerified || false,
            followersCount: userData.followersCount || userData.followers_count,
            followingCount: userData.followingCount || userData.following_count,
            postsCount: userData.postsCount || userData.posts_count
          };
          
          log('✅ User profile fetched successfully from NeonDB', { 
            userId, 
            endpoint, 
            originalProfileImageUrl: profileImageUrl,
            validatedProfileImageUrl: validatedImageUrl,
            profileImageUrl: userProfile.profileImageUrl,
            hasImage: !!userProfile.profileImageUrl,
            fullName: userProfile.fullName,
            username: userProfile.username
          });
          
          return {
            success: true,
            data: userProfile,
            timestamp: new Date().toISOString(),
          };
      }
      
      // If we get here, response.success is true but no data
      logError(`❌ User profile response missing data`, response);
      return {
        success: false,
        error: {
          code: 'INVALID_RESPONSE',
          message: 'User profile response missing data',
        },
        timestamp: new Date().toISOString(),
      };
    
    } catch (error) {
      logError(`❌ Exception while fetching user profile: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
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

/**
 * Batch fetch usernames for multiple user IDs
 * Optimized for fetching usernames for "liked by" sections
 * User IDs should already be validated (they exist in MongoDB's likes array)
 */
export const getUsernamesBatch = async (userIds: string[]): Promise<ApiResponse<Record<string, string>>> => {
  try {
    log('Batch fetching usernames from NeonDB', { userIdCount: userIds.length });
    
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
    
    // Validate input
    if (!userIds || userIds.length === 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'userIds array is required and cannot be empty',
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    // Limit batch size
    if (userIds.length > 50) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Maximum 50 user IDs allowed per batch request',
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    // Make API request - use apiCall for centralized token refresh handling
    // BASE_URL already includes /api/auth, so endpoint should be /user/batch/usernames
    const response = await apiCall<Record<string, string>>('/user/batch/usernames', 'POST', { userIds }, true);
    
    // Handle nested ApiResponse structure
    // Backend returns: { success: true, data: { userId: username }, message: "...", timestamp: "..." }
    // apiRequest wraps it again: { success: true, data: { success: true, data: { userId: username }, ... }, timestamp: "..." }
    let usernameMap: Record<string, string> = {};
    
    if (response.success && response.data) {
      // Check if response.data is the actual username map or nested ApiResponse
      if (response.data && typeof response.data === 'object') {
        // If response.data has 'data' property, it's a nested ApiResponse
        if ('data' in response.data && typeof response.data.data === 'object') {
          usernameMap = response.data.data as Record<string, string>;
          log('✅ Batch usernames fetched successfully (nested structure)', { 
            requestedCount: userIds.length,
            fetchedCount: Object.keys(usernameMap).length,
            usernames: usernameMap 
          });
        } 
        // Check if response.data itself is the username map (has userId keys)
        else if (!('success' in response.data) && !('message' in response.data)) {
          // It's directly the username map
          usernameMap = response.data as Record<string, string>;
          log('✅ Batch usernames fetched successfully (direct structure)', { 
            requestedCount: userIds.length,
            fetchedCount: Object.keys(usernameMap).length,
            usernames: usernameMap 
          });
        } else {
          logError('❌ Unexpected response structure', { responseData: response.data });
        }
      }
    } else {
      logError('❌ Batch username fetch failed', response.error);
    }
    
    // Return normalized response with username map directly in data
    return {
      success: response.success,
      data: usernameMap,
      error: response.error,
      timestamp: response.timestamp,
    };
    
  } catch (error) {
    logError('❌ Unexpected error in getUsernamesBatch', error);
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
 * Validates and normalizes profile image URL
 * Ensures HTTPS for Cloudinary URLs and validates URL format
 */
const normalizeProfileImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  
  const trimmedUrl = String(url).trim();
  if (!trimmedUrl) return null;
  
  if (trimmedUrl.startsWith('http://res.cloudinary.com')) {
    return trimmedUrl.replace('http://', 'https://');
  }
  
  if (trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    return trimmedUrl.replace('http://', 'https://');
  }
  
  if (trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('http://')) {
    return trimmedUrl;
  }
  
  return null;
};

/**
 * Maps raw API user data to UserProfile interface
 * Handles various field name variations and provides safe defaults
 */
const mapUserDataToProfile = (userData: any): UserProfile => {
  const profileImageUrl = normalizeProfileImageUrl(
    userData.profileImageUrl || 
    userData.profile_image_url || 
    userData.profilePicture || 
    userData.profile_picture
  );
  
  return {
    id: userData.id || userData.userId || '',
    fullName: userData.fullName || userData.full_name || '',
    username: userData.username || '',
    email: userData.email || undefined,
    profilePicture: profileImageUrl,
    profileImageUrl: profileImageUrl,
    bio: userData.bio || undefined,
    verified: userData.verified || userData.isEmailVerified || false,
    followersCount: userData.followersCount || userData.followers_count || 0,
    followingCount: userData.followingCount || userData.following_count || 0,
    postsCount: userData.postsCount || userData.posts_count || 0,
  };
};

/**
 * Extracts user list from API response
 * Handles different response structures (direct array or nested data array)
 */
const extractUserListFromResponse = (responseData: any): UserProfile[] => {
  if (!responseData) return [];
  
  if (Array.isArray(responseData)) {
    return responseData.map(mapUserDataToProfile);
  }
  
  if (responseData.data && Array.isArray(responseData.data)) {
    return responseData.data.map(mapUserDataToProfile);
  }
  
  return [];
};

/**
 * Get suggested/random users from database
 * Fetches random users excluding the current authenticated user
 * 
 * Gateway routing: /api/auth/user/suggested -> /auth/user/suggested
 * Backend controller: @RequestMapping("/auth/user") + @GetMapping("/suggested")
 * 
 * @param limit - Number of users to fetch (1-10, defaults to 4)
 * @returns Promise resolving to API response with UserProfile array
 */
export const getSuggestedUsers = async (limit: number = 4): Promise<ApiResponse<UserProfile[]>> => {
  try {
    const normalizedLimit = Math.max(1, Math.min(10, Math.floor(limit) || 4));
    log('Fetching suggested users', { limit: normalizedLimit });
    
    // Endpoint path: /user/suggested
    // Full URL: BASE_URL (/api/auth) + /user/suggested = /api/auth/user/suggested
    // Gateway rewrites: /api/auth/user/suggested -> /auth/user/suggested
    // Backend matches: @RequestMapping("/auth/user") + @GetMapping("/suggested") = /auth/user/suggested
    const endpoint = `/user/suggested?limit=${normalizedLimit}`;
    
    log(`🔍 [getSuggestedUsers] Endpoint: ${endpoint}, Full URL: ${API_CONFIG.BASE_URL}${endpoint}`);
    
    try {
      const response = await apiCall<UserProfile[]>(endpoint, 'GET', undefined, true);
      
      if (!response.success) {
        logError('Failed to fetch suggested users', response.error);
        return {
          success: false,
          error: response.error || {
            code: 'API_ERROR',
            message: 'Failed to fetch suggested users',
          },
          timestamp: new Date().toISOString(),
        };
      }
      
      const userList = extractUserListFromResponse(response.data);
      
      if (userList.length === 0) {
        log('No suggested users found in response');
        return {
          success: true,
          data: [],
          timestamp: new Date().toISOString(),
        };
      }
      
      log('✅ Suggested users fetched successfully', { count: userList.length });
      
      return {
        success: true,
        data: userList,
        timestamp: new Date().toISOString(),
      };
      
    } catch (error: any) {
      logError('Exception while fetching suggested users', error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unexpected error occurred while fetching suggested users';
      
      return {
        success: false,
        error: {
          code: 'UNEXPECTED_ERROR',
          message: errorMessage,
          details: error,
        },
        timestamp: new Date().toISOString(),
      };
    }
    
  } catch (error: any) {
    logError('Unexpected error in getSuggestedUsers', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while fetching suggested users';
    
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: errorMessage,
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Export configuration for debugging
export const getUserServiceConfig = () => ({
  baseUrl: getGatewayURL(),
  timeout: API_CONFIG.TIMEOUT,
  enableLogging: API_CONFIG.ENABLE_LOGGING,
});
