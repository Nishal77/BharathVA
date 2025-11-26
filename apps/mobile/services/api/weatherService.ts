/**
 * Weather Service for BharathVA LocalPulse
 * Fetches weather data from localpulse-service
 */

import { getGatewayURL, getTimeout, isLoggingEnabled } from './environment';

// Types matching backend WeatherResponse
export interface WeatherResponse {
  success: boolean;
  message: string;
  data: WeatherData | null;
  timestamp: number;
}

export interface WeatherData {
  location: Location;
  current: CurrentWeather;
  condition: WeatherCondition;
  wind: Wind;
  temperature: Temperature;
  humidity: Humidity;
  visibility: Visibility;
  airPollution?: AirPollution;
  timezone: string;
  sunrise: number;
  sunset: number;
}

export interface AirPollution {
  aqi: number;
  aqiLevel: string;
  co?: number;
  no2?: number;
  o3?: number;
  so2?: number;
  pm2_5?: number;
  pm10?: number;
}

export interface Location {
  city: string;
  state: string;
  district: string;
  country: string;
  latitude: number;
  longitude: number;
}

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  pressure: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  visibility: number;
  uvIndex: number;
  timestamp: number;
}

export interface WeatherCondition {
  main: string;
  description: string;
  icon: string;
  code: number;
}

export interface Wind {
  speed: number;
  direction: number;
  gust: number;
}

export interface Temperature {
  current: number;
  feelsLike: number;
  min: number;
  max: number;
}

export interface Humidity {
  value: number;
  level: string;
}

export interface Visibility {
  value: number;
  description: string;
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
    console.log(`[WeatherService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.enableLogging) {
    console.error(`[WeatherService] ${message}`, error || '');
  }
};

// Sleep utility for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// API request wrapper with retry logic
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<ApiResponse<T>> => {
  const startTime = Date.now();
  const baseURL = getGatewayURL();
  const url = `${baseURL}${endpoint}`;

  try {
    log(`🌐 API Request: ${options.method || 'GET'} ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
      },
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    log(`📥 API Response: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      let errorText = 'Unknown error';
      try {
        const errorData = await response.json().catch(() => null);
        if (errorData && typeof errorData === 'object') {
          errorText = errorData.message || errorData.error || JSON.stringify(errorData);
        } else {
          errorText = await response.text().catch(() => `HTTP ${response.status}`);
        }
      } catch (parseError) {
        errorText = await response.text().catch(() => `HTTP ${response.status}`);
      }

      logError(`API Error: ${response.status}`, errorText);

      // Retry on server errors (5xx) or network issues with exponential backoff
      if ((response.status >= 500 || response.status === 0 || response.status === 503) && retryCount < 3) {
        const delay = 1000 * Math.pow(2, retryCount);
        log(`🔄 Retrying request (attempt ${retryCount + 1}/3) after ${delay}ms`);
        await sleep(delay);
        return apiRequest<T>(endpoint, options, retryCount + 1);
      }

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

    log(`✅ API Success: ${duration}ms`);

    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logError(`Request failed after ${duration}ms`, error);

    // Retry on network errors
    if (retryCount < 3 && (error.name === 'AbortError' || error.message?.includes('network'))) {
      const delay = 1000 * Math.pow(2, retryCount);
      log(`🔄 Retrying request (attempt ${retryCount + 1}/3) after ${delay}ms`);
      await sleep(delay);
      return apiRequest<T>(endpoint, options, retryCount + 1);
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

// Weather Service API
export const weatherService = {
  /**
   * Get weather by coordinates
   */
  getWeatherByCoordinates: async (
    latitude: number,
    longitude: number
  ): Promise<ApiResponse<WeatherResponse>> => {
    const endpoint = `/api/localpulse/weather/coordinates?latitude=${latitude}&longitude=${longitude}`;
    return apiRequest<WeatherResponse>(endpoint);
  },

  /**
   * Get weather by city name
   */
  getWeatherByCity: async (city: string): Promise<ApiResponse<WeatherResponse>> => {
    const endpoint = `/api/localpulse/weather/city?city=${encodeURIComponent(city)}`;
    return apiRequest<WeatherResponse>(endpoint);
  },

  /**
   * Health check
   */
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const endpoint = `/api/localpulse/weather/health`;
    return apiRequest<any>(endpoint);
  },
};

