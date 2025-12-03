import { getGatewayURL, getLocalPulseServiceURL, getTimeout, isLoggingEnabled } from './environment';

export interface WeatherAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  latitude: number;
  longitude: number;
  timestamp: number;
  category: string;
  icon: string;
  locationName: string | null;
}

export interface WeatherAlertResponse {
  success: boolean;
  message: string;
  alerts: WeatherAlert[] | null;
  totalCount: number;
  locationName: string | null;
}

// Use direct localpulse-service URL for better reliability
const LOCALPULSE_URL = getLocalPulseServiceURL();
const TIMEOUT = getTimeout();
const ENABLE_LOGGING = isLoggingEnabled();
const DEFAULT_RADIUS_KM = 60.0;

const log = (message: string, ...args: any[]) => {
  if (ENABLE_LOGGING) {
    console.log(`[WeatherAlertService] ${message}`, ...args);
  }
};

const logError = (message: string, ...args: any[]) => {
  console.error(`[WeatherAlertService] ${message}`, ...args);
};

export const fetchWeatherAlerts = async (
  latitude: number,
  longitude: number,
  radius: number = DEFAULT_RADIUS_KM
): Promise<WeatherAlertResponse> => {
  try {
    // Validate and convert coordinates to numbers
    const lat = Number(latitude);
    const lon = Number(longitude);
    const rad = Number(radius);
    
    // Check if conversion resulted in valid numbers
    if (isNaN(lat) || isNaN(lon)) {
      console.error('[WeatherAlertService] ❌ Invalid coordinates - NaN values');
      console.error('[WeatherAlertService] Received:', { latitude, longitude, lat, lon });
      return {
        success: false,
        message: 'Invalid coordinates: latitude and longitude must be valid numbers',
        alerts: [],
        totalCount: 0,
        locationName: null,
      };
    }
    
    // Cap radius at 100km
    const effectiveRadius = Math.min(rad, 100.0);
    
    // Ensure values are properly formatted as numbers with sufficient precision
    const latStr = lat.toFixed(6);
    const lonStr = lon.toFixed(6);
    const radStr = effectiveRadius.toFixed(2);
    
    console.log('[WeatherAlertService] 🌐 Fetching weather alerts:', { latitude: latStr, longitude: lonStr, radius: radStr });

    const url = `${LOCALPULSE_URL}/api/localpulse/weather-alerts?latitude=${latStr}&longitude=${lonStr}&radius=${radStr}`;
    console.log('[WeatherAlertService] Request URL:', url);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('[WeatherAlertService] Response status:', response.status, response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      
      let errorMessage = `Failed to fetch weather alerts: ${response.status}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Use default error message
      }
      
      console.log('[WeatherAlertService] ❌ API not available:', response.status, errorMessage);
      return {
        success: true,
        message: 'No weather alerts available',
        alerts: [],
        totalCount: 0,
        locationName: null,
      };
    }

    const data: WeatherAlertResponse = await response.json();
    console.log('[WeatherAlertService] 📦 Response data:', {
      success: data.success,
      message: data.message,
      totalCount: data.totalCount,
      alertsCount: data.alerts?.length || 0,
      locationName: data.locationName,
    });
    
    if (data.success && data.alerts && data.alerts.length > 0) {
      console.log('[WeatherAlertService] ✅ Successfully fetched', data.alerts.length, 'weather alerts for', data.locationName);
      if (data.alerts) {
        data.alerts.forEach((alert, index) => {
          console.log(`[WeatherAlertService]   Alert ${index + 1}:`, alert.title, '-', alert.description);
        });
      }
      return data;
    }
    
    console.log('[WeatherAlertService] ⚠️ No weather alerts from API for location:', data.locationName);
    return {
      success: true,
      message: 'No weather alerts in your area',
      alerts: [],
      totalCount: 0,
      locationName: data.locationName,
    };

  } catch (error: any) {
    if (error.name === 'AbortError') {
      log('Request timeout');
      return {
        success: true,
        message: 'Request timeout',
        alerts: [],
        totalCount: 0,
        locationName: null,
      };
    }

    logError('Error fetching weather alerts', error);
    return {
      success: true,
      message: error.message || 'Failed to fetch weather alerts',
      alerts: [],
      totalCount: 0,
      locationName: null,
    };
  }
};
