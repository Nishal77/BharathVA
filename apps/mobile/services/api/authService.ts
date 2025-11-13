// Authentication API Service
import { API_CONFIG, ENDPOINTS } from './config';
import * as SecureStore from 'expo-secure-store';
import { deviceInfoService } from './deviceInfoService';
import { clearAuthCaches, clearFeedCaches } from '../../utils/cacheManager';
import { clearUserProfileCache } from './feedService';
import { checkBackendConnectivityCached } from '../../utils/networkConnectivity';

// API Response type
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

// Registration Response
interface RegistrationResponse {
  sessionToken: string | null;
  currentStep: string;
  message: string;
  email?: string;
}

// Login Response
interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: string;
  email: string;
  username: string;
  fullName: string;
  expiresIn: number;
  refreshExpiresIn: number;
  message: string;
}

// Token Storage Keys
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_DATA: 'userData',
};

// API Error
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Request queue for token refresh coordination
interface QueuedRequest {
  resolve: (value: any) => void;
  reject: (error: any) => void;
  timestamp: number;
}

// Token Management Functions
export const tokenManager = {
  // Prevent infinite refresh loops
  isRefreshing: false,
  refreshPromise: null as Promise<boolean> | null,
  // Request queue to hold pending requests during token refresh
  requestQueue: [] as QueuedRequest[],
  
  // Add request to queue and wait for token refresh
  async waitForRefresh<T>(): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      this.requestQueue.push({
        resolve: resolve as (value: any) => void,
        reject,
        timestamp: Date.now(),
      });
    });
  },
  
  // Resolve all queued requests after successful refresh
  resolveQueuedRequests(success: boolean): void {
    const queue = [...this.requestQueue];
    this.requestQueue = [];
    
    queue.forEach((request) => {
      if (success) {
        request.resolve(true);
      } else {
        request.reject(new ApiError('Token refresh failed'));
      }
    });
  },

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      // CRITICAL: Only save access token to SecureStore
      // Refresh token is always fetched from database (user_sessions table) in real-time
      // This ensures we always use the latest refresh token from the database
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      
      // CRITICAL: Verify access token was saved by reading it back
      // This ensures SecureStore write is fully complete before returning
      const savedAccessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      
      if (savedAccessToken !== accessToken) {
        throw new ApiError('Token verification failed - access token not saved correctly');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Failed to save authentication tokens');
    }
  },

  async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    } catch (error) {
      return null;
    }
  },

  async getRefreshToken(): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return null;
      }
      
      // CRITICAL: Extract user ID from current access token
      // This ensures we verify the refresh token belongs to the correct user
      let currentUserId: string | null = null;
      try {
        const parts = accessToken.split('.');
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
          currentUserId = payload.userId || payload.sub || null;
        }
      } catch (error) {
        if (API_CONFIG.ENABLE_LOGGING) {
          console.warn('⚠️ [TokenManager] Could not extract user ID from token:', error);
        }
      }
      
      // Try to fetch from database with timeout protection
      try {
        const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.GET_CURRENT_REFRESH_TOKEN}`;
        
        if (API_CONFIG.ENABLE_LOGGING) {
          console.log(`🔄 [TokenManager] Fetching refresh token from database: ${url}`, {
            currentUserId: currentUserId || 'unknown'
          });
        }
        
        // Add timeout controller for fetch request (5 seconds max)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);
          
          if (!response.ok) {
            const errorText = await response.text();
            if (API_CONFIG.ENABLE_LOGGING) {
              console.error(`❌ [TokenManager] Failed to fetch refresh token: ${response.status} ${errorText}`);
            }
            
            // Handle authentication/authorization failures (401 Unauthorized, 403 Forbidden)
            if (response.status === 401 || response.status === 403) {
              if (API_CONFIG.ENABLE_LOGGING) {
                console.warn(`⚠️ [TokenManager] Access token ${response.status === 401 ? 'expired' : 'forbidden'} (${response.status}), using SecureStore fallback`);
              }
              
              // Use SecureStore fallback for expired tokens
              const fallbackToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
              if (fallbackToken) {
                if (API_CONFIG.ENABLE_LOGGING) {
                  console.warn('⚠️ [TokenManager] Using cached refresh token from SecureStore', {
                    currentUserId: currentUserId || 'unknown',
                  });
                }
                return fallbackToken;
              }
              
              return null;
            }
            
            // For other errors, use fallback
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
          
          const data = await response.json();
          
          if (data.success && data.data?.refreshToken) {
            const refreshToken = data.data.refreshToken;
            
            if (API_CONFIG.ENABLE_LOGGING) {
              console.log('✅ [TokenManager] Refresh token fetched from database successfully', {
                refreshTokenPrefix: refreshToken.substring(0, 20) + '...',
                currentUserId: currentUserId || 'unknown',
                source: 'database'
              });
            }
            
            // Update SecureStore with the correct refresh token
            await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
            
            return refreshToken;
          } else {
            if (API_CONFIG.ENABLE_LOGGING) {
              console.error('❌ [TokenManager] Invalid response structure:', data);
            }
            throw new Error('Invalid response structure');
          }
        } catch (fetchError: any) {
          clearTimeout(timeoutId);
          
          // Handle timeout or network errors
          if (fetchError.name === 'AbortError') {
            if (API_CONFIG.ENABLE_LOGGING) {
              console.warn('⚠️ [TokenManager] Fetch timeout - backend not responding, using SecureStore fallback');
            }
          } else {
            if (API_CONFIG.ENABLE_LOGGING) {
              console.error('❌ [TokenManager] Fetch error:', fetchError.message);
            }
          }
          
          // Fall through to SecureStore fallback
          throw fetchError;
        }
      } catch (error: any) {
        // CRITICAL: Use SecureStore fallback when backend is unreachable
        // This allows the app to continue working with cached tokens
        const fallbackToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
        if (fallbackToken) {
          if (API_CONFIG.ENABLE_LOGGING) {
            console.warn('⚠️ [TokenManager] Using cached refresh token from SecureStore as fallback', {
              currentUserId: currentUserId || 'unknown',
              reason: error.message || 'Backend unreachable'
            });
          }
          return fallbackToken;
        }
        
        if (API_CONFIG.ENABLE_LOGGING) {
          console.warn('⚠️ [TokenManager] No fallback token available in SecureStore');
        }
        
        return null;
      }
    } catch (error) {
      if (API_CONFIG.ENABLE_LOGGING) {
        console.error('❌ [TokenManager] Error in getRefreshToken:', error);
      }
      return null;
    }
  },

  async clearTokens(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.USER_DATA);
    } catch (error) {
      // Silent fail for clearing tokens
    }
  },

  /**
   * Completely clear SecureStore - removes all auth-related data
   * Use this when you need to force a clean login state
   */
  async clearSecureStore(): Promise<void> {
    try {
      const keys = [
        TOKEN_KEYS.ACCESS_TOKEN,
        TOKEN_KEYS.REFRESH_TOKEN,
        TOKEN_KEYS.USER_DATA,
        'userId',
        'username',
        'email',
      ];
      
      for (const key of keys) {
        try {
          await SecureStore.deleteItemAsync(key);
        } catch (error) {
          // Continue even if one key fails
        }
      }
      
      if (API_CONFIG.ENABLE_LOGGING) {
        console.log('🧹 SecureStore cleared completely');
      }
    } catch (error) {
      if (API_CONFIG.ENABLE_LOGGING) {
        console.error('Error clearing SecureStore:', error);
      }
    }
  },

  /**
   * Extract user ID from JWT token
   * This is the source of truth for the current authenticated user
   */
  async getUserIdFromToken(): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken();
      if (!accessToken) {
        return null;
      }
      
      // Decode JWT to get user ID
      const parts = accessToken.split('.');
      if (parts.length !== 3) {
        return null;
      }
      
      const base64Url = parts[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload);
      return payload.userId || payload.sub || null;
    } catch (error) {
      if (API_CONFIG.ENABLE_LOGGING) {
        console.error('Error extracting user ID from token:', error);
      }
      return null;
    }
  },

  async saveUserData(userData: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.USER_DATA, JSON.stringify(userData));
    } catch (error) {
      // Silent fail for saving user data
    }
  },

  async getUserData(): Promise<any | null> {
    try {
      const data = await SecureStore.getItemAsync(TOKEN_KEYS.USER_DATA);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      return null;
    }
  },
};

// Internal API call function without token refresh (to prevent infinite loops)
export async function internalApiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  includeAuth: boolean = false,
  extraHeaders?: Record<string, string>
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...extraHeaders,
    };

    if (includeAuth) {
      const accessToken = await tokenManager.getAccessToken();
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    const options: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Log request details in development
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log(`🌐 API Request: ${method} ${url}`);
      if (body) {
        try {
          console.log('📤 Request Body:', JSON.parse(body));
        } catch (e) {
          console.log('📤 Request Body:', body);
        }
      }
    }

    let data;
    try {
      const textResponse = await response.text();
      data = JSON.parse(textResponse);
      
      // Log response details in development
      if (API_CONFIG.ENABLE_LOGGING) {
        console.log(`📥 API Response: ${response.status} ${response.statusText}`);
        console.log('📥 Response Data:', data);
      }
    } catch (parseError: any) {
      if (API_CONFIG.ENABLE_LOGGING) {
        console.error('❌ JSON Parse Error:', parseError);
        console.log('📥 Raw Response:', textResponse);
        console.log('📥 Response Headers:', response.headers);
      }
      
      // Check if response is HTML (error page)
      if (textResponse.includes('<html>') || textResponse.includes('<!DOCTYPE')) {
        throw new ApiError('Server returned HTML instead of JSON. Check if backend is running correctly.');
      }
      
      throw new ApiError(`JSON Parse error: ${parseError.message}. Raw response: ${textResponse.substring(0, 200)}...`);
    }

    if (!response.ok) {
      throw new ApiError(
        data.message || 'Request failed',
        response.status,
        data
      );
    }

    return data;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please check your connection.');
    }
    
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors more specifically
    if (error.message && error.message.includes('Network request failed')) {
      throw new ApiError('Network request failed. Please check your internet connection and ensure the backend is running.');
    }

    if (error.message && error.message.includes('fetch')) {
      throw new ApiError('Network error. Please check your connection and try again.');
    }

    throw new ApiError(
      error.message || 'Network error. Please check your connection.',
      undefined,
      error
    );
  }
}

// Generic API call function with automatic token refresh and request queue
export async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  includeAuth: boolean = false,
  extraHeaders?: Record<string, string>,
  retryCount: number = 0
): Promise<ApiResponse<T>> {
  // If token refresh is in progress and this is an authenticated request, wait for it
  if (includeAuth && tokenManager.isRefreshing && tokenManager.refreshPromise) {
    if (API_CONFIG.ENABLE_LOGGING) {
      console.log('⏳ [apiCall] Token refresh in progress, waiting...', { endpoint });
    }
    try {
      await tokenManager.refreshPromise;
      // After refresh completes, retry the request
      return apiCall<T>(endpoint, method, body, includeAuth, extraHeaders, retryCount);
    } catch (error) {
      // Refresh failed, continue to handle error below
    }
  }
  
  try {
    // First attempt
    return await internalApiCall<T>(endpoint, method, body, includeAuth, extraHeaders);
  } catch (error: any) {
    // Handle 401 (Unauthorized) and 403 (Forbidden) with token refresh
    // 403 can occur when token is expired but server returns Forbidden instead of Unauthorized
    const isAuthError = error instanceof ApiError && 
                       (error.statusCode === 401 || error.statusCode === 403) && 
                       includeAuth && 
                       retryCount === 0;
    
    if (isAuthError) {
      if (API_CONFIG.ENABLE_LOGGING) {
        console.log(`🔄 [apiCall] Auth error (${error.statusCode}), attempting token refresh...`, { endpoint });
      }
      
      // If refresh is already in progress, wait for it
      if (tokenManager.isRefreshing && tokenManager.refreshPromise) {
        if (API_CONFIG.ENABLE_LOGGING) {
          console.log('⏳ [apiCall] Token refresh already in progress, waiting...', { endpoint });
        }
        try {
          await tokenManager.refreshPromise;
          // Retry the call with refreshed token
          return apiCall<T>(endpoint, method, body, includeAuth, extraHeaders, retryCount + 1);
        } catch (refreshError) {
          // Refresh failed, re-throw original error
          throw error;
        }
      }
      
      // Trigger token refresh
      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        // Small delay to ensure token is fully saved and available
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Retry the call with refreshed token
        return apiCall<T>(endpoint, method, body, includeAuth, extraHeaders, retryCount + 1);
      } else {
        // Refresh failed, clear tokens and re-throw error
        await tokenManager.clearTokens();
        throw error;
      }
    }
    
    // Re-throw the error if not an auth error or if retry failed
    throw error;
  }
}

// Auth Service
export const authService = {
  /**
   * Step 1: Register with email
   * Sends OTP to email
   */
  registerEmail: async (email: string): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.REGISTER_EMAIL,
      'POST',
      { email }
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /**
   * Step 2: Verify OTP
   */
  verifyOtp: async (sessionToken: string, otp: string): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.VERIFY_OTP,
      'POST',
      { sessionToken, otp }
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /**
   * Step 3: Resend OTP
   */
  resendOtp: async (sessionToken: string): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.RESEND_OTP,
      'POST',
      { sessionToken }
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /**
   * Step 4: Submit user details
   */
  submitDetails: async (
    sessionToken: string,
    fullName: string,
    phoneNumber: string,
    countryCode: string,
    dateOfBirth: string
  ): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.SUBMIT_DETAILS,
      'POST',
      { sessionToken, fullName, phoneNumber, countryCode, dateOfBirth }
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /**
   * Step 5: Create password
   */
  createPassword: async (
    sessionToken: string,
    password: string,
    confirmPassword: string
  ): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.CREATE_PASSWORD,
      'POST',
      { sessionToken, password, confirmPassword }
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /**
   * Step 6: Check username availability
   */
  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await apiCall<{ available: boolean }>(
      `${ENDPOINTS.AUTH.CHECK_USERNAME}?username=${encodeURIComponent(username)}`,
      'GET'
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /**
   * Step 7: Create username and complete registration
   */
  createUsername: async (sessionToken: string, username: string): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.CREATE_USERNAME,
      'POST',
      { sessionToken, username }
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /** Save registration profile to registration_sessions */
  saveRegistrationProfile: async (
    sessionToken: string,
    payload: { profileImageUrl?: string | null; bio?: string | null; gender: string }
  ): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.REGISTER_PROFILE,
      'POST',
      { sessionToken, ...payload }
    );
    if (!response.success) {
      throw new ApiError(response.message);
    }
    return response.data;
  },

  /** Complete registration: move session data to users table */
  completeRegistration: async (sessionToken: string): Promise<RegistrationResponse> => {
    const response = await apiCall<RegistrationResponse>(
      ENDPOINTS.AUTH.REGISTER_COMPLETE,
      'POST',
      { sessionToken }
    );
    if (!response.success) {
      throw new ApiError(response.message);
    }
    return response.data;
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<string> => {
    const response = await apiCall<string>(ENDPOINTS.AUTH.HEALTH, 'GET');
    
    if (!response.success) {
      throw new ApiError(response.message);
    }
    
    return response.data;
  },

  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<LoginResponse> => {
    // CRITICAL: Clear all caches before login to prevent stale data
    // This ensures we start with a clean slate and fetch fresh user data
    try {
      await clearAuthCaches();
      await clearFeedCaches();
      clearUserProfileCache();
      if (API_CONFIG.ENABLE_LOGGING) {
        console.log('✅ [AuthService] Caches cleared before login');
      }
    } catch (error) {
      // Log but don't fail login if cache clearing fails
      if (API_CONFIG.ENABLE_LOGGING) {
        console.warn('⚠️ [AuthService] Some caches may not have been cleared:', error);
      }
    }
    
    const { deviceInfo, ipAddress } = await deviceInfoService.getFullDeviceInfo();
    
    const response = await apiCall<LoginResponse>(
      ENDPOINTS.AUTH.LOGIN,
      'POST',
      { email, password },
      false,
      {
        'X-Device-Info': deviceInfo,
        'X-IP-Address': ipAddress,
      }
    );
    
    if (!response.success) {
      throw new ApiError(response.message);
    }


    // CRITICAL: Delete old tokens before saving new ones
    // This prevents stale tokens from causing authentication issues
    await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    
    // Save both access token and refresh token to SecureStore
    await tokenManager.saveTokens(response.data.accessToken, response.data.refreshToken);
    
    // Also save refresh token to SecureStore explicitly
    // This ensures we have the latest refresh token cached locally
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, response.data.refreshToken);
    } catch (error) {
      console.error('Failed to save refresh token to SecureStore', error);
      throw error;
    }
    
    // CRITICAL: Save user data immediately after login
    // This ensures SecureStore userData matches the token's user ID
    const userData = {
      userId: response.data.userId,
      email: response.data.email,
      username: response.data.username,
      fullName: response.data.fullName,
    };
    
    await tokenManager.saveUserData(userData);
    
    console.log('✅ [AuthService] User data saved after login', {
      userId: userData.userId,
      email: userData.email,
      username: userData.username
    });
    
    return response.data;
  },

  /**
   * Refresh access token using refresh token from database
   * Always fetches the latest refresh token from user_sessions table before using it
   */
  refreshAccessToken: async (): Promise<boolean> => {
    // If already refreshing, return the existing promise
    if (tokenManager.isRefreshing && tokenManager.refreshPromise) {
      if (API_CONFIG.ENABLE_LOGGING) {
        console.log('⏳ [AuthService] Token refresh already in progress, waiting...');
      }
      return await tokenManager.refreshPromise;
    }

    // Create new refresh promise
    tokenManager.refreshPromise = (async (): Promise<boolean> => {
      try {
        tokenManager.isRefreshing = true;
        
        if (API_CONFIG.ENABLE_LOGGING) {
          console.log('🔄 [AuthService] Starting token refresh...');
        }
        
        // CRITICAL: Check backend connectivity first
        // Skip refresh if backend is unreachable to prevent hanging
        const connectivityCheck = await checkBackendConnectivityCached();
        if (!connectivityCheck.isConnected) {
          console.warn('⚠️ [AuthService] Backend unreachable, skipping token refresh', {
            error: connectivityCheck.error,
            message: 'Will retry when backend becomes available'
          });
          return false;
        }
        
        console.log('✅ [AuthService] Backend is reachable', {
          latency: connectivityCheck.latency ? `${connectivityCheck.latency}ms` : 'unknown'
        });
        
        // CRITICAL: Get current user ID from the ACCESS TOKEN (source of truth)
        // Don't trust SecureStore userData - it might be stale
        // Extract user ID from the current access token before refresh
        const currentAccessToken = await tokenManager.getAccessToken();
        let expectedUserId: string | null = null;
        
        if (currentAccessToken) {
          // Extract user ID from current token
          try {
            const parts = currentAccessToken.split('.');
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
              expectedUserId = payload.userId || payload.sub || null;
            }
          } catch (error) {
            console.warn('⚠️ [AuthService] Could not extract user ID from current token:', error);
          }
        }
        
        // CRITICAL: Always fetch refresh token from database (user_sessions table)
        // This ensures we use the latest refresh token, not a stale cached one
        const refreshToken = await tokenManager.getRefreshToken();
        
        if (!refreshToken) {
          console.error('❌ [AuthService] No refresh token available from database or SecureStore');
          await tokenManager.clearTokens();
          return false;
        }
        
        console.log('✅ [AuthService] Refresh token retrieved for refresh', {
          tokenPrefix: refreshToken.substring(0, 20) + '...',
          tokenLength: refreshToken.length,
          source: 'database',
          expectedUserId: expectedUserId || 'unknown (token expired or invalid)'
        });
        
        // Use internal API call to prevent infinite loops
        const response = await internalApiCall<LoginResponse>(
          ENDPOINTS.AUTH.REFRESH,
          'POST',
          { refreshToken }
        );
        
        if (!response.success) {
          const errorMessage = response.error?.message || response.message || 'Unknown error';
          const errorCode = response.error?.code || 'UNKNOWN_ERROR';
          
          console.error('❌ [AuthService] Token refresh failed', {
            error: errorMessage,
            code: errorCode,
            response: response
          });
          
          // If refresh token is invalid/expired, clear all tokens
          if (errorCode === 'HTTP_401' || errorMessage.includes('expired') || errorMessage.includes('invalid')) {
            console.warn('⚠️ [AuthService] Refresh token is invalid or expired, clearing all tokens');
            await tokenManager.clearTokens();
          } else {
            // For other errors, still clear tokens to force re-authentication
            await tokenManager.clearTokens();
          }
          
          return false;
        }

        // CRITICAL: Ensure tokens are properly saved
        // The API returns both 'accessToken' and 'token' fields - use 'accessToken' as primary
        const newAccessToken = response.data?.accessToken || response.data?.token;
        const newRefreshToken = response.data?.refreshToken;
        const newUserId = response.data?.userId;
        
        // CRITICAL: Verify user ID matches (prevents token mix-up from different users)
        // Only check if we had a valid expectedUserId (token wasn't expired)
        if (expectedUserId && newUserId && expectedUserId !== newUserId) {
          console.error('❌ [AuthService] CRITICAL: User ID mismatch after token refresh!', {
            expectedUserId,
            newUserId,
            message: 'Refresh token belongs to a different user. Clearing all tokens and forcing re-login.'
          });
          // Clear everything - this is a security issue
          await tokenManager.clearSecureStore();
          return false;
        }
        
        // If expectedUserId is null (token expired), trust the new token's user ID
        // But log it for debugging
        if (!expectedUserId && newUserId) {
          console.log('ℹ️ [AuthService] Token was expired, accepting new user ID from refresh:', newUserId);
        }
        
        if (newAccessToken && newRefreshToken) {
          // Get old token before saving new one for comparison
          const oldAccessToken = await tokenManager.getAccessToken();
          const tokensAreDifferent = oldAccessToken !== newAccessToken;
          const responseTokensMatch = response.data?.accessToken === response.data?.token;
          
          console.log('🔄 [AuthService] Token refresh response received', {
            hasAccessToken: !!response.data?.accessToken,
            hasToken: !!response.data?.token,
            responseTokensMatch,
            tokensAreDifferent,
            userIdMatch: expectedUserId === newUserId,
            oldTokenPrefix: oldAccessToken ? oldAccessToken.substring(0, 30) + '...' : 'null',
            newTokenPrefix: newAccessToken.substring(0, 30) + '...',
            oldTokenLength: oldAccessToken?.length || 0,
            newTokenLength: newAccessToken.length,
            oldTokenLast10: oldAccessToken ? oldAccessToken.substring(oldAccessToken.length - 10) : 'null',
            newTokenLast10: newAccessToken.substring(newAccessToken.length - 10),
            hasNewRefreshToken: !!newRefreshToken,
            newRefreshTokenPrefix: newRefreshToken ? newRefreshToken.substring(0, 20) + '...' : 'null'
          });
          
          if (!tokensAreDifferent && oldAccessToken) {
            console.error('❌ [AuthService] CRITICAL: Old and new tokens are identical! Token refresh did not produce a new token.');
            return false;
          }
          
          // CRITICAL: Delete old tokens before saving new ones
          // This prevents stale tokens from causing authentication issues
          await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS_TOKEN);
          await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
          
          // CRITICAL: Save both access token and refresh token to SecureStore
          // Access token is used for API calls, refresh token is used as fallback
          // The refresh token is also stored in database, but we cache it locally for offline support
          await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, newAccessToken);
          await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, newRefreshToken);
          
          // CRITICAL: Verify tokens were actually saved before returning
          const savedAccessToken = await tokenManager.getAccessToken();
          const savedRefreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
          
          if (savedAccessToken !== newAccessToken) {
            console.error('❌ [AuthService] CRITICAL: Access token save verification failed! Saved token does not match new token.');
            return false;
          }
          
          if (savedRefreshToken !== newRefreshToken) {
            console.error('❌ [AuthService] CRITICAL: Refresh token save verification failed! Saved token does not match new token.');
            return false;
          }
          
          console.log('✅ [AuthService] Tokens saved and verified successfully', {
            savedAccessTokenPrefix: savedAccessToken.substring(0, 30) + '...',
            savedAccessTokenLength: savedAccessToken.length,
            savedAccessTokenLast10: savedAccessToken.substring(savedAccessToken.length - 10),
            savedRefreshTokenPrefix: savedRefreshToken ? savedRefreshToken.substring(0, 20) + '...' : 'null',
            savedRefreshTokenLength: savedRefreshToken?.length || 0,
            userId: newUserId
          });
          
          // CRITICAL: Update user data with refreshed information
          // This ensures SecureStore userData matches the token's user ID
          if (response.data.userId && response.data.email && response.data.username && response.data.fullName) {
            const updatedUserData = {
              userId: response.data.userId,
              email: response.data.email,
              username: response.data.username,
              fullName: response.data.fullName,
            };
            
            await tokenManager.saveUserData(updatedUserData);
            
            console.log('✅ [AuthService] User data updated after token refresh', {
              userId: updatedUserData.userId,
              email: updatedUserData.email,
              username: updatedUserData.username
            });
          } else {
            console.warn('⚠️ [AuthService] Missing user data in refresh response, userData not updated');
          }
          
          // Resolve all queued requests
          tokenManager.resolveQueuedRequests(true);
          
          if (API_CONFIG.ENABLE_LOGGING) {
            console.log('✅ [AuthService] Token refresh completed successfully');
          }
          
          return true;
        } else {
          console.error('❌ [AuthService] Invalid response data from token refresh');
          await tokenManager.clearTokens();
          tokenManager.resolveQueuedRequests(false);
          return false;
        }
      } catch (error) {
        console.error('❌ [AuthService] Token refresh error', error);
        await tokenManager.clearTokens();
        tokenManager.resolveQueuedRequests(false);
        return false;
      } finally {
        tokenManager.isRefreshing = false;
        tokenManager.refreshPromise = null;
        
        if (API_CONFIG.ENABLE_LOGGING) {
          console.log('🔄 [AuthService] Token refresh process completed');
        }
      }
    })();

    return await tokenManager.refreshPromise;
  },

  /**
   * Logout and clear all tokens
   */
  logout: async (): Promise<void> => {
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      
      if (refreshToken) {
        await internalApiCall(
          ENDPOINTS.AUTH.LOGOUT,
          'POST',
          { refreshToken }
        );
      }
    } catch (error) {
      // Silent error handling for logout
    } finally {
      // CRITICAL: Clear all caches on logout to prevent stale data
      // This ensures the next login starts with a clean slate
      try {
        await clearAuthCaches();
        await clearFeedCaches();
        clearUserProfileCache();
        if (API_CONFIG.ENABLE_LOGGING) {
          console.log('✅ [AuthService] All caches cleared on logout');
        }
      } catch (cacheError) {
        // Log but don't fail logout if cache clearing fails
        if (API_CONFIG.ENABLE_LOGGING) {
          console.warn('⚠️ [AuthService] Some caches may not have been cleared:', cacheError);
        }
      }
      
      // Also use clearSecureStore as fallback
      await tokenManager.clearSecureStore();
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async (): Promise<boolean> => {
    const accessToken = await tokenManager.getAccessToken();
    return accessToken !== null;
  },

  /**
   * Get current user data
   */
  getCurrentUser: async (): Promise<any | null> => {
    return await tokenManager.getUserData();
  },

  /**
   * ✅ Fetch current user profile from backend (users table)
   */
  getCurrentUserProfile: async (): Promise<any> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.USER_ME,
        'GET',
        undefined,
        true // Include auth token
      );
      
      if (!response.success) {
        throw new ApiError(response.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get user profile by ID
   */
  getUserProfile: async (userId: string): Promise<{ fullName: string; username: string }> => {
    try {
      const response = await apiCall<{ fullName: string; username: string }>(
        ENDPOINTS.AUTH.USER_ME,
        'GET',
        undefined,
        true // Include auth token
      );
      
      if (!response.success) {
        throw new ApiError(response.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Validate current access token
   */
  validateToken: async (): Promise<boolean> => {
    try {
      const response = await internalApiCall<{ valid: boolean }>(
        ENDPOINTS.AUTH.VALIDATE,
        'POST',
        undefined,
        true
      );
      
      return response.success && response.data.valid;
    } catch (error) {
      return false;
    }
  },

  /**
   * Get all active sessions for current user
   */
  getActiveSessions: async (): Promise<UserSessionInfo[]> => {
    try {
      const response = await apiCall<UserSessionInfo[]>(
        ENDPOINTS.AUTH.GET_SESSIONS,
        'GET',
        undefined,
        true
      );
      
      if (!response.success) {
        throw new ApiError(response.message);
      }
      
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout specific session by session ID
   */
  logoutSession: async (sessionId: string): Promise<void> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.LOGOUT_SESSION,
        'POST',
        { sessionId },
        true
      );
      
      if (!response.success) {
        throw new ApiError(response.message);
      }
      
    } catch (error) {
      throw error;
    }
  },

  /**
   * Logout all sessions except current
   */
  logoutAllOtherSessions: async (): Promise<void> => {
    try {
      const response = await apiCall(
        ENDPOINTS.AUTH.LOGOUT_ALL_OTHER,
        'POST',
        undefined,
        true
      );
      
      if (!response.success) {
        throw new ApiError(response.message);
      }
      
    } catch (error) {
      throw error;
    }
  },
};

// User Session Info interface
export interface UserSessionInfo {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  expiresAt: string;
  isCurrentSession: boolean;
}
