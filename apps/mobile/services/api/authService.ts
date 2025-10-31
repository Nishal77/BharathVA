// Authentication API Service
import { API_CONFIG, ENDPOINTS } from './config';
import * as SecureStore from 'expo-secure-store';
import { deviceInfoService } from './deviceInfoService';

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

// Token Management Functions
export const tokenManager = {
  // Prevent infinite refresh loops
  isRefreshing: false,
  refreshPromise: null as Promise<boolean> | null,

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    } catch (error) {
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
      return await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH_TOKEN);
    } catch (error) {
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

// Generic API call function with automatic token refresh
export async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any,
  includeAuth: boolean = false,
  extraHeaders?: Record<string, string>,
  retryCount: number = 0
): Promise<ApiResponse<T>> {
  try {
    // First attempt
    return await internalApiCall<T>(endpoint, method, body, includeAuth, extraHeaders);
  } catch (error: any) {
    // Handle 401 with token refresh only once per call
    if (error instanceof ApiError && error.statusCode === 401 && includeAuth && retryCount === 0) {
      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        // Retry the call with refreshed token
        return apiCall<T>(endpoint, method, body, includeAuth, extraHeaders, retryCount + 1);
      }
    }
    
    // Re-throw the error if not a 401 or if retry failed
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


    await tokenManager.saveTokens(response.data.accessToken, response.data.refreshToken);
    
    await tokenManager.saveUserData({
      userId: response.data.userId,
      email: response.data.email,
      username: response.data.username,
      fullName: response.data.fullName,
    });
    
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   */
  refreshAccessToken: async (): Promise<boolean> => {
    // If already refreshing, return the existing promise
    if (tokenManager.isRefreshing && tokenManager.refreshPromise) {
      return await tokenManager.refreshPromise;
    }

    // Create new refresh promise
    tokenManager.refreshPromise = (async (): Promise<boolean> => {
      try {
        tokenManager.isRefreshing = true;
        const refreshToken = await tokenManager.getRefreshToken();
        
        if (!refreshToken) {
          return false;
        }
        
        // Use internal API call to prevent infinite loops
        const response = await internalApiCall<LoginResponse>(
          ENDPOINTS.AUTH.REFRESH,
          'POST',
          { refreshToken }
        );
        
        if (!response.success) {
          await tokenManager.clearTokens();
          return false;
        }

        // Ensure tokens are properly saved
        if (response.data?.accessToken && response.data?.refreshToken) {
          await tokenManager.saveTokens(response.data.accessToken, response.data.refreshToken);
          
          // Update user data with refreshed information
          if (response.data.email && response.data.username && response.data.fullName) {
            await tokenManager.saveUserData({
              userId: response.data.userId,
              email: response.data.email,
              username: response.data.username,
              fullName: response.data.fullName,
            });
          }
          
          return true;
        } else {
          await tokenManager.clearTokens();
          return false;
        }
      } catch (error) {
        await tokenManager.clearTokens();
        return false;
      } finally {
        tokenManager.isRefreshing = false;
        tokenManager.refreshPromise = null;
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
      await tokenManager.clearTokens();
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
