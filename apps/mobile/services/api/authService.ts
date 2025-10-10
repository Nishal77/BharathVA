// Authentication API Service
import { API_CONFIG, ENDPOINTS } from './config';

// API Response type
interface ApiResponse<T> {
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

// Generic API call function
async function apiCall<T>(
  endpoint: string,
  method: 'GET' | 'POST' = 'GET',
  body?: any
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_CONFIG.BASE_URL}${endpoint}`;
    
    console.log(`[API] ${method} ${url}`);
    if (body) {
      console.log(`[API] Request body:`, JSON.stringify(body));
    }
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    console.log(`[API] Sending request...`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log(`[API] Response status: ${response.status} ${response.statusText}`);
    console.log(`[API] Response ok: ${response.ok}`);

    let data;
    try {
      const textResponse = await response.text();
      console.log(`[API] Response text:`, textResponse.substring(0, 200));
      data = JSON.parse(textResponse);
    } catch (parseError: any) {
      console.error(`[API] JSON parse error:`, parseError.message);
      throw new ApiError('Invalid response from server');
    }

    if (!response.ok) {
      console.error(`[API] Error response:`, data);
      throw new ApiError(
        data.message || 'Request failed',
        response.status,
        data
      );
    }

    console.log(`[API] Success:`, data.message);
    console.log(`[API] Response data:`, data);
    return data;
  } catch (error: any) {
    console.error(`[API] Catch block error:`, error);
    console.error(`[API] Error name:`, error.name);
    console.error(`[API] Error message:`, error.message);
    
    if (error.name === 'AbortError') {
      throw new ApiError('Request timeout. Please check your connection.');
    }
    
    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      error.message || 'Network error. Please check your connection.',
      undefined,
      error
    );
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
};

