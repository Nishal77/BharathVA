/**
 * User Search Service for BharathVA
 * Handles real-time user search with debouncing and caching
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';
import * as SecureStore from 'expo-secure-store';
import { tokenManager } from './authService';

export interface UserSearchResult {
  id: string;
  username: string;
  fullName: string;
  profileImageUrl?: string | null;
  bio?: string | null;
  isEmailVerified?: boolean;
}

export interface UserSearchResponse {
  success: boolean;
  data?: UserSearchResult[];
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

const API_CONFIG = {
  timeout: getTimeout(),
  enableLogging: isLoggingEnabled(),
  debounceMs: 300,
  minQueryLength: 1,
  maxResults: 10,
};

const log = (message: string, data?: any) => {
  if (API_CONFIG.enableLogging) {
    console.log(`[UserSearchService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.enableLogging) {
    console.error(`[UserSearchService] ${message}`, error || '');
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

const searchCache = new Map<string, { data: UserSearchResult[]; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

const getCachedResult = (query: string): UserSearchResult[] | null => {
  const cached = searchCache.get(query.toLowerCase().trim());
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    log(`Cache hit for query: "${query}"`);
    return cached.data;
  }
  return null;
};

const setCachedResult = (query: string, data: UserSearchResult[]) => {
  searchCache.set(query.toLowerCase().trim(), {
    data,
    timestamp: Date.now(),
  });
};

const clearCache = () => {
  searchCache.clear();
  log('Search cache cleared');
};

let debounceTimer: NodeJS.Timeout | null = null;
let abortController: AbortController | null = null;

export const searchUsers = async (
  query: string,
  limit: number = API_CONFIG.maxResults
): Promise<UserSearchResponse> => {
  try {
    const trimmedQuery = query.trim();
    
    if (trimmedQuery.length < API_CONFIG.minQueryLength) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Query must be at least ${API_CONFIG.minQueryLength} character(s)`,
        },
        timestamp: new Date().toISOString(),
      };
    }

    if (limit < 1 || limit > 50) {
      limit = API_CONFIG.maxResults;
    }

    const cacheKey = `${trimmedQuery}_${limit}`;
    const cached = getCachedResult(cacheKey);
    if (cached !== null) {
      return {
        success: true,
        data: cached,
        timestamp: new Date().toISOString(),
      };
    }

    const token = await getAuthToken();
    const baseUrl = getGatewayURL();
    const endpoint = `/api/auth/user/search?q=${encodeURIComponent(trimmedQuery)}&limit=${limit}`;
    const fullUrl = `${baseUrl}${endpoint}`;

    log(`Searching users: query="${trimmedQuery}", limit=${limit}`);

    if (abortController) {
      abortController.abort();
    }
    abortController = new AbortController();

    const timeoutId = setTimeout(() => abortController!.abort(), API_CONFIG.timeout);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(fullUrl, {
      method: 'GET',
      headers,
      signal: abortController.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Search failed with status ${response.status}`;
      let errorDetails: any = null;
      
      try {
        const errorText = await response.text();
        errorDetails = errorText;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.message) {
            errorMessage = errorJson.message;
          }
        } catch {
          errorMessage = errorText || errorMessage;
        }
      } catch (parseError) {
        logError('Failed to parse error response', parseError);
      }
      
      logError(`Search failed: ${response.status}`, errorMessage);
      
      if (response.status === 400) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: errorMessage,
            details: errorDetails,
          },
          timestamp: new Date().toISOString(),
        };
      }
      
      return {
        success: false,
        error: {
          code: `HTTP_${response.status}`,
          message: errorMessage,
          details: errorDetails,
        },
        timestamp: new Date().toISOString(),
      };
    }

    let responseData: any;
    try {
      responseData = await response.json();
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

    let userList: UserSearchResult[] = [];
    
    if (responseData && responseData.data) {
      if (Array.isArray(responseData.data)) {
        userList = responseData.data.map((user: any) => {
          const profileImageUrl = user.profileImageUrl || user.profile_image_url || null;
          const normalizedImageUrl = profileImageUrl && typeof profileImageUrl === 'string' 
            ? profileImageUrl.trim() 
            : null;
          
          return {
            id: user.id || '',
            username: user.username || '',
            fullName: user.fullName || user.full_name || '',
            profileImageUrl: normalizedImageUrl && normalizedImageUrl.length > 0 ? normalizedImageUrl : null,
            bio: user.bio || null,
            isEmailVerified: user.isEmailVerified || user.is_email_verified || false,
          };
        });
      } else if (responseData.success && Array.isArray(responseData.data)) {
        userList = responseData.data.map((user: any) => ({
          ...user,
          profileImageUrl: user.profileImageUrl || user.profile_image_url || null,
        }));
      }
    }

    setCachedResult(cacheKey, userList);
    log(`Search completed: found ${userList.length} users`);

    return {
      success: true,
      data: userList,
      timestamp: new Date().toISOString(),
    };

  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      log('Search request aborted');
      return {
        success: false,
        error: {
          code: 'REQUEST_ABORTED',
          message: 'Search request was cancelled',
        },
        timestamp: new Date().toISOString(),
      };
    }

    logError('Unexpected error in searchUsers', error);
    return {
      success: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error,
      },
      timestamp: new Date().toISOString(),
    };
  }
};

export const searchUsersDebounced = (
  query: string,
  callback: (response: UserSearchResponse) => void,
  limit: number = API_CONFIG.maxResults
): void => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(async () => {
    const response = await searchUsers(query, limit);
    callback(response);
  }, API_CONFIG.debounceMs);
};

export const cancelSearch = () => {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (abortController) {
    abortController.abort();
    abortController = null;
  }
  log('Search cancelled');
};

export const getUserSearchServiceConfig = () => ({
  baseUrl: getGatewayURL(),
  timeout: API_CONFIG.timeout,
  debounceMs: API_CONFIG.debounceMs,
  minQueryLength: API_CONFIG.minQueryLength,
  maxResults: API_CONFIG.maxResults,
  enableLogging: API_CONFIG.enableLogging,
});

export { clearCache as clearUserSearchCache };

