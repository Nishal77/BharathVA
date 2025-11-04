/**
 * BharathVA Feed Service
 * Industrial-grade API service for feed operations
 * 
 * Features:
 * - Comprehensive error handling
 * - Request/response logging
 * - Token management
 * - Retry logic
 * - Type safety
 * - Performance monitoring
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';
import * as SecureStore from 'expo-secure-store';

// Types
export interface CreatePostRequest {
  userId: string;
  message: string;
  imageUrls?: string[];
}

export interface ImageUploadResponse {
  success: boolean;
  publicId?: string;
  imageId?: string; // Add imageId for compatibility
  imageUrl?: string;
  url?: string; // Add url for compatibility
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  width?: number;
  height?: number;
  error?: string;
}

export interface MultipleImageUploadResponse {
  success: boolean;
  imageCount?: number;
  images?: Array<{
    publicId: string;
    imageId: string; // Add imageId for compatibility
    imageUrl: string;
    url?: string; // Add url for compatibility
    originalFileName: string;
    fileSize: number;
    mimeType: string;
    width?: number;
    height?: number;
  }>;
  error?: string;
}

export interface PostResponse {
  id: string;
  userId: string;
  message: string;
  imageUrls?: string[];
  likes?: string[]; // Array of user IDs who liked the post
  likesCount?: number;
  userLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  message: string;
  imageUrls?: string[];
  likes?: string[]; // Array of user IDs who liked the post
  likesCount?: number;
  userLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserFeedResponse {
  content: FeedItem[];
  pageable: {
    sort: {
      sorted: boolean;
      unsorted: boolean;
    };
    pageNumber: number;
    pageSize: number;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  totalElements: number;
  totalPages: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: {
    sorted: boolean;
    unsorted: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

// Configuration
const API_CONFIG = {
  timeout: getTimeout(),
  retryAttempts: 3,
  retryDelay: 1000,
  enableLogging: isLoggingEnabled(),
};

// Utility functions
const log = (message: string, data?: any) => {
  if (API_CONFIG.enableLogging) {
    console.log(`[FeedService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.enableLogging) {
    console.error(`[FeedService] ${message}`, error || '');
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

// JWT token utilities
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    logError('Failed to decode JWT token', error);
    return null;
  }
};

const extractUserIdFromToken = (token: string): string | null => {
  const payload = decodeJWT(token);
  if (!payload) return null;
  
  return payload.userId || payload.sub || null;
};

// Network utilities
const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const createTimeoutPromise = (timeout: number): Promise<never> => {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Request timeout')), timeout);
  });
};

// API request wrapper with retry logic
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit,
  retryCount = 0
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
      
      // Retry on server errors (5xx) or network issues
      if ((response.status >= 500 || response.status === 0) && retryCount < API_CONFIG.retryAttempts) {
        log(`🔄 Retrying request (attempt ${retryCount + 1}/${API_CONFIG.retryAttempts})`);
        await sleep(API_CONFIG.retryDelay * (retryCount + 1));
        return apiRequest<T>(endpoint, options, retryCount + 1);
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
    
    // Retry on network errors
    if (retryCount < API_CONFIG.retryAttempts) {
      log(`🔄 Retrying request due to network error (attempt ${retryCount + 1}/${API_CONFIG.retryAttempts})`);
      await sleep(API_CONFIG.retryDelay * (retryCount + 1));
      return apiRequest<T>(endpoint, options, retryCount + 1);
    }
    
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

// Image upload functions
export const uploadImage = async (imageUri: string): Promise<ImageUploadResponse> => {
  try {
    log('Uploading image', { imageUri });
    
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }
    
    // Create form data
    const formData = new FormData();
    
    // Detect file type from URI
    const fileExtension = imageUri.split('.').pop()?.toLowerCase();
    let mimeType = 'image/jpeg'; // Default fallback
    let fileName = 'image.jpg';
    
    // Map file extensions to MIME types
    switch (fileExtension) {
      case 'heic':
        mimeType = 'image/heic';
        fileName = 'image.heic';
        break;
      case 'heif':
        mimeType = 'image/heif';
        fileName = 'image.heif';
        break;
      case 'png':
        mimeType = 'image/png';
        fileName = 'image.png';
        break;
      case 'gif':
        mimeType = 'image/gif';
        fileName = 'image.gif';
        break;
      case 'webp':
        mimeType = 'image/webp';
        fileName = 'image.webp';
        break;
      case 'bmp':
        mimeType = 'image/bmp';
        fileName = 'image.bmp';
        break;
      case 'tiff':
      case 'tif':
        mimeType = 'image/tiff';
        fileName = 'image.tiff';
        break;
      case 'jpg':
      case 'jpeg':
      default:
        mimeType = 'image/jpeg';
        fileName = 'image.jpg';
        break;
    }
    
    formData.append('file', {
      uri: imageUri,
      type: mimeType,
      name: fileName,
    } as any);
    
    // Make API request
    const response = await apiRequest<ImageUploadResponse>('/api/feed/upload/image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    if (response.success && response.data) {
      log('✅ Image uploaded successfully', { publicId: response.data.publicId });
      return response.data;
    } else {
      logError('❌ Image upload failed', response.error);
      return {
        success: false,
        error: response.error?.message || 'Image upload failed',
      };
    }
    
  } catch (error) {
    logError('❌ Unexpected error in uploadImage', error);
    return {
      success: false,
      error: 'An unexpected error occurred during image upload',
    };
  }
};

export const uploadMultipleImages = async (imageUris: string[]): Promise<MultipleImageUploadResponse> => {
  try {
    log('Uploading multiple images', { count: imageUris.length });
    
    // Get authentication token
    const token = await getAuthToken();
    if (!token) {
      return {
        success: false,
        error: 'No authentication token found',
      };
    }
    
    // Create form data
    const formData = new FormData();
    imageUris.forEach((uri, index) => {
      // Detect file type from URI
      const fileExtension = uri.split('.').pop()?.toLowerCase();
      let mimeType = 'image/jpeg'; // Default fallback
      let fileName = `image_${index}.jpg`;
      
      // Map file extensions to MIME types
      switch (fileExtension) {
        case 'heic':
          mimeType = 'image/heic';
          fileName = `image_${index}.heic`;
          break;
        case 'heif':
          mimeType = 'image/heif';
          fileName = `image_${index}.heif`;
          break;
        case 'png':
          mimeType = 'image/png';
          fileName = `image_${index}.png`;
          break;
        case 'gif':
          mimeType = 'image/gif';
          fileName = `image_${index}.gif`;
          break;
        case 'webp':
          mimeType = 'image/webp';
          fileName = `image_${index}.webp`;
          break;
        case 'bmp':
          mimeType = 'image/bmp';
          fileName = `image_${index}.bmp`;
          break;
        case 'tiff':
        case 'tif':
          mimeType = 'image/tiff';
          fileName = `image_${index}.tiff`;
          break;
        case 'jpg':
        case 'jpeg':
        default:
          mimeType = 'image/jpeg';
          fileName = `image_${index}.jpg`;
          break;
      }
      
      formData.append('files', {
        uri: uri,
        type: mimeType,
        name: fileName,
      } as any);
    });
    
    // Make API request
    const response = await apiRequest<MultipleImageUploadResponse>('/api/feed/upload/images', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });
    
    if (response.success && response.data) {
      log('✅ Multiple images uploaded successfully', { imageCount: response.data.imageCount });
      return response.data;
    } else {
      logError('❌ Multiple image upload failed', response.error);
      return {
        success: false,
        error: response.error?.message || 'Multiple image upload failed',
      };
    }
    
  } catch (error) {
    logError('❌ Unexpected error in uploadMultipleImages', error);
    return {
      success: false,
      error: 'An unexpected error occurred during multiple image upload',
    };
  }
};

// Feed service functions
export const createPost = async (message: string, imageUrls?: string[]): Promise<ApiResponse<PostResponse>> => {
  try {
    log('Creating post', { message: message.substring(0, 50) + '...' });
    
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
    
    // Extract user ID from token
    const userId = extractUserIdFromToken(token);
    if (!userId) {
      return {
        success: false,
        error: {
          code: 'AUTH_ERROR',
          message: 'Unable to extract user ID from token',
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    log('User ID extracted', { userId });
    
    // Validate message
    if (!message || message.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message cannot be empty',
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    if (message.length > 280) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Message cannot exceed 280 characters',
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    // Create request payload
    const payload: CreatePostRequest = {
      userId,
      message: message.trim(),
      imageUrls: imageUrls || [],
    };
    
    // Make API request
    const response = await apiRequest<PostResponse>('/api/feed/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (response.success) {
      log('✅ Post created successfully', { postId: response.data?.id });
    } else {
      logError('❌ Post creation failed', response.error);
    }
    
    return response;
    
  } catch (error) {
    logError('❌ Unexpected error in createPost', error);
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

// Fetch user feeds
export const getUserFeeds = async (userId: string, page: number = 0, size: number = 20): Promise<ApiResponse<UserFeedResponse>> => {
  try {
    log('Fetching user feeds', { userId, page, size });
    
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
    const response = await apiRequest<UserFeedResponse>(`/api/feed/user/${userId}?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.success) {
      log('✅ User feeds fetched successfully', { count: response.data?.content.length });
    } else {
      logError('❌ Failed to fetch user feeds', response.error);
    }
    
    return response;
    
  } catch (error) {
    logError('❌ Unexpected error in getUserFeeds', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while fetching feeds',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Fetch all feeds (global feed)
export const getAllFeeds = async (page: number = 0, size: number = 20): Promise<ApiResponse<UserFeedResponse>> => {
  try {
    log('Fetching all feeds', { page, size });
    
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
    const response = await apiRequest<UserFeedResponse>(`/api/feed/all?page=${page}&size=${size}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.success) {
      log('✅ All feeds fetched successfully', { count: response.data?.content.length });
    } else {
      logError('❌ Failed to fetch all feeds', response.error);
    }
    
    return response;
    
  } catch (error) {
    logError('❌ Unexpected error in getAllFeeds', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while fetching feeds',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Delete post function
// Toggle like on a feed
export const toggleLike = async (feedId: string): Promise<ApiResponse<PostResponse>> => {
  try {
    log('Toggling like', { feedId });
    
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
    
    // Validate feedId
    if (!feedId || feedId.trim().length === 0) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Feed ID cannot be empty',
        },
        timestamp: new Date().toISOString(),
      };
    }
    
    // Make API request
    // Backend returns FeedResponse directly (not wrapped in ApiResponse)
    const response = await apiRequest<PostResponse>(`/api/feed/${feedId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (response.success && response.data) {
      log('✅ Like toggled successfully', { 
        feedId, 
        likesCount: response.data.likesCount,
        likesArray: response.data.likes,
        likesArrayLength: response.data.likes?.length || 0
      });
      
      // Log the full response to debug
      console.log('📦 Full toggleLike response:', JSON.stringify(response.data, null, 2));
    } else {
      logError('❌ Like toggle failed', response.error);
    }
    
    return response;
    
  } catch (error) {
    logError('❌ Unexpected error in toggleLike', error);
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

export const deletePost = async (feedId: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
  try {
    log('Deleting post', { feedId });
    
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
    
    // Make API request - DELETE endpoint returns 204 No Content on success
    const baseUrl = getGatewayURL();
    const fullUrl = `${baseUrl}/api/feed/${feedId}`;
    
    log(`🌐 API Request: DELETE ${fullUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
    
    const fetchResponse = await fetch(fullUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    log(`📥 API Response: ${fetchResponse.status}`);
    
    if (fetchResponse.status === 204) {
      // 204 No Content means successful deletion
      log('✅ Post deleted successfully', { feedId });
      return {
        success: true,
        data: { success: true, message: 'Post deleted successfully' },
        timestamp: new Date().toISOString(),
      };
    } else if (!fetchResponse.ok) {
      // Handle error responses
      const errorText = await fetchResponse.text();
      logError(`API Error: ${fetchResponse.status}`, errorText);
      
      return {
        success: false,
        error: {
          code: `HTTP_${fetchResponse.status}`,
          message: `Request failed with status ${fetchResponse.status}`,
          details: errorText,
        },
        timestamp: new Date().toISOString(),
      };
    } else {
      // Handle other success responses (200, 201, etc.)
      try {
        const data = await fetchResponse.json();
        log('✅ Post deleted successfully', { feedId });
        return {
          success: true,
          data: data || { success: true, message: 'Post deleted successfully' },
          timestamp: new Date().toISOString(),
        };
      } catch (parseError) {
        // If JSON parsing fails but status is OK, consider it successful
        log('✅ Post deleted successfully (no JSON response)', { feedId });
        return {
          success: true,
          data: { success: true, message: 'Post deleted successfully' },
          timestamp: new Date().toISOString(),
        };
      }
    }
    
  } catch (error) {
    logError('❌ Unexpected error in deletePost', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while deleting the post',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Health check function
export const checkFeedServiceHealth = async (): Promise<boolean> => {
  try {
    const response = await apiRequest<{ status: string; service: string; message: string }>('/api/feed/health', {
      method: 'GET',
    });
    
    if (response.success && response.data) {
      log('Health check successful', response.data);
      return response.data.status === 'UP';
    }
    
    logError('Health check failed - invalid response', response);
    return false;
  } catch (error) {
    logError('Health check failed', error);
    return false;
  }
};

// Enhanced feed item with user data
export interface EnhancedFeedItem extends FeedItem {
  userProfile?: {
    fullName: string;
    username: string;
    profilePicture?: string | null;
    profileImageUrl?: string | null;
  };
}

// Simple in-memory cache for user profiles
interface CachedUserProfile {
  fullName: string;
  username: string;
  profilePicture?: string | null;
  profileImageUrl?: string | null;
  timestamp: number;
}

const userProfileCache = new Map<string, CachedUserProfile>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Helper function to get cached user profile
const getCachedUserProfile = (userId: string): { fullName: string; username: string; profilePicture?: string | null; profileImageUrl?: string | null } | null => {
  const cached = userProfileCache.get(userId);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return {
      fullName: cached.fullName,
      username: cached.username,
      profilePicture: cached.profilePicture,
      profileImageUrl: cached.profileImageUrl
    };
  }
  return null;
};

// Helper function to cache user profile
const cacheUserProfile = (userId: string, profile: { fullName: string; username: string; profilePicture?: string | null; profileImageUrl?: string | null }) => {
  userProfileCache.set(userId, {
    ...profile,
    timestamp: Date.now()
  });
};

// Fetch all feeds with real user data from backend
export const getAllFeedsWithUserData = async (page: number = 0, size: number = 20): Promise<ApiResponse<EnhancedFeedItem[]>> => {
  try {
    log('Fetching all feeds with user data', { page, size });
    
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
    
    // Fetch all feeds
    const feedsResponse = await getAllFeeds(page, size);
    if (!feedsResponse.success || !feedsResponse.data) {
      // Return properly typed error response instead of unsafe cast
      return {
        success: false,
        error: feedsResponse.error || {
          code: 'FEED_FETCH_ERROR',
          message: 'Failed to fetch feeds',
        },
        timestamp: feedsResponse.timestamp || new Date().toISOString(),
      };
    }
    
    const feeds = feedsResponse.data.content;
    log('Fetched feeds', { count: feeds.length });
    
    // Get unique user IDs
    const userIds = [...new Set(feeds.map(feed => feed.userId))];
    log('Unique user IDs', { count: userIds.length, userIds });
    
    // Fetch user profiles for all unique users
    const userProfiles = new Map<string, { fullName: string; username: string; profilePicture?: string | null; profileImageUrl?: string | null }>();
    
    for (const userId of userIds) {
      // Check cache first
      const cachedProfile = getCachedUserProfile(userId);
      if (cachedProfile) {
        userProfiles.set(userId, cachedProfile);
        log('✅ Using cached user profile', { userId, profile: cachedProfile });
        continue;
      }
      
      try {
        // Import userService and get user profile from NeonDB
        const { getUserProfileById } = await import('./userService');
        const userResponse = await getUserProfileById(userId);
        
        if (userResponse.success && userResponse.data) {
          // Prioritize profileImageUrl from NeonDB (which comes from users.profile_image_url)
          // Check all possible field names from backend response
          const rawProfileImageUrl = userResponse.data.profileImageUrl || 
                                  userResponse.data.profilePicture || 
                                  (userResponse.data as any)?.profile_image_url || 
                                  null;
          
          // Validate and normalize URL if present
          let validatedImageUrl = null;
          if (rawProfileImageUrl) {
            const trimmedUrl = String(rawProfileImageUrl).trim();
            // Ensure HTTPS for Cloudinary URLs
            if (trimmedUrl.startsWith('http://res.cloudinary.com')) {
              validatedImageUrl = trimmedUrl.replace('http://', 'https://');
            } else if (trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
              validatedImageUrl = trimmedUrl.replace('http://', 'https://');
            } else if (trimmedUrl.startsWith('https://') || trimmedUrl.startsWith('http://')) {
              validatedImageUrl = trimmedUrl;
            } else if (trimmedUrl.length > 0) {
              log(`⚠️  Profile image URL might be invalid: ${trimmedUrl}`);
              validatedImageUrl = trimmedUrl;
            }
          }
          
          const profile = {
            fullName: userResponse.data.fullName || `User ${userId.substring(0, 8)}`,
            username: userResponse.data.username || `user_${userId.substring(0, 8)}`,
            profilePicture: validatedImageUrl, // Keep for backward compatibility
            profileImageUrl: validatedImageUrl, // Primary field from NeonDB users.profile_image_url
          };
          
          userProfiles.set(userId, profile);
          cacheUserProfile(userId, profile); // Cache the result
          
          log('✅ Fetched user profile from NeonDB', { 
            userId, 
            rawResponse: userResponse.data,
            originalProfileImageUrl: rawProfileImageUrl,
            validatedProfileImageUrl: validatedImageUrl,
            profileImageUrl: profile.profileImageUrl,
            fullName: profile.fullName,
            username: profile.username,
            hasImage: !!validatedImageUrl
          });
        } else {
          // Set fallback profile data (no random images - use null)
          const shortUserId = userId.substring(0, 8);
          const fallbackProfile = {
            fullName: `User ${shortUserId}`,
            username: `user_${shortUserId}`,
            profilePicture: null,
            profileImageUrl: null,
          };
          
          userProfiles.set(userId, fallbackProfile);
          cacheUserProfile(userId, fallbackProfile); // Cache fallback too
          
          logError('Failed to fetch user profile from NeonDB, using fallback', { userId, error: userResponse.error });
        }
      } catch (error) {
        logError('Failed to fetch user profile from NeonDB', { userId, error });
        // Set fallback profile data (no random images - use null)
        const shortUserId = userId.substring(0, 8);
        const fallbackProfile = {
          fullName: `User ${shortUserId}`,
          username: `user_${shortUserId}`,
          profilePicture: null,
          profileImageUrl: null,
        };
        
        userProfiles.set(userId, fallbackProfile);
        cacheUserProfile(userId, fallbackProfile); // Cache fallback too
      }
    }
    
    // Create enhanced feeds with real user profile data from NeonDB
    const enhancedFeeds: EnhancedFeedItem[] = feeds.map(feed => ({
      ...feed,
      userProfile: userProfiles.get(feed.userId) || {
        fullName: `User ${feed.userId.substring(0, 8)}`,
        username: `user_${feed.userId.substring(0, 8)}`,
        profilePicture: null,
        profileImageUrl: null,
      }
    }));
    
    log('✅ Enhanced feeds created successfully', { count: enhancedFeeds.length });
    
    return {
      success: true,
      data: enhancedFeeds,
      timestamp: new Date().toISOString(),
    };
    
  } catch (error) {
    logError('❌ Unexpected error in getAllFeedsWithUserData', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'An unexpected error occurred while fetching feeds with user data',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

// Export configuration for debugging
export const getFeedServiceConfig = () => ({
  baseUrl: getGatewayURL(),
  timeout: API_CONFIG.timeout,
  retryAttempts: API_CONFIG.retryAttempts,
  enableLogging: API_CONFIG.enableLogging,
});
