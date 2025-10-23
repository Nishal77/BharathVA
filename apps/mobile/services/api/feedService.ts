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
  imageIds?: string[];
}

export interface ImageUploadResponse {
  success: boolean;
  imageId?: string;
  imageUrl?: string;
  originalFileName?: string;
  fileSize?: number;
  mimeType?: string;
  error?: string;
}

export interface MultipleImageUploadResponse {
  success: boolean;
  imageCount?: number;
  images?: Array<{
    imageId: string;
    imageUrl: string;
    originalFileName: string;
    fileSize: number;
    mimeType: string;
  }>;
  error?: string;
}

export interface PostResponse {
  id: string;
  userId: string;
  message: string;
  imageIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FeedItem {
  id: string;
  userId: string;
  message: string;
  imageIds?: string[];
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
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'image.jpg',
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
      log('✅ Image uploaded successfully', { imageId: response.data.imageId });
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
      formData.append('files', {
        uri: uri,
        type: 'image/jpeg',
        name: `image_${index}.jpg`,
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
export const createPost = async (message: string, imageIds?: string[]): Promise<ApiResponse<PostResponse>> => {
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
      imageIds: imageIds || [],
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

// Export configuration for debugging
export const getFeedServiceConfig = () => ({
  baseUrl: getGatewayURL(),
  timeout: API_CONFIG.timeout,
  retryAttempts: API_CONFIG.retryAttempts,
  enableLogging: API_CONFIG.enableLogging,
});
