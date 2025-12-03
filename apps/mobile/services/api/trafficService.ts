import { getGatewayURL, getLocalPulseServiceURL, getTimeout, isLoggingEnabled } from './environment';

/**
 * Traffic Alert interface representing a single traffic incident.
 */
export interface TrafficAlert {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: string;
  location: string;
  city: string | null;
  state: string | null;
  latitude: number;
  longitude: number;
  timestamp: number;
  roadName: string | null;
}

/**
 * Response structure from the traffic alerts API.
 */
export interface TrafficAlertResponse {
  success: boolean;
  message: string;
  alerts: TrafficAlert[] | null;
  totalCount: number;
}

// Configuration - Use direct localpulse-service URL for better reliability
const LOCALPULSE_URL = getLocalPulseServiceURL();
const TIMEOUT = getTimeout();
const ENABLE_LOGGING = isLoggingEnabled();

// Constants
const DEFAULT_RADIUS_KM = 100.0; // 100km radius for traffic alerts (larger coverage area)
const MAX_RADIUS_KM = 150.0; // Support up to 150km radius
const MAX_RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 1000;

/**
 * Logger for traffic service operations.
 */
const log = (message: string, ...args: any[]) => {
  if (ENABLE_LOGGING) {
    console.log(`[TrafficService] ${message}`, ...args);
  }
};

const logWarn = (message: string, ...args: any[]) => {
  if (ENABLE_LOGGING) {
    console.warn(`[TrafficService] ${message}`, ...args);
  }
};

const logError = (message: string, ...args: any[]) => {
  console.error(`[TrafficService] ${message}`, ...args);
};

/**
 * Delay utility for retry logic.
 */
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch traffic alerts from the backend.
 * The backend aggregates data from MapMyIndia and HERE APIs.
 * 
 * @param latitude - User's latitude
 * @param longitude - User's longitude
 * @param radius - Search radius in kilometers (default: 5km, max: 10km)
 * @returns Promise<TrafficAlertResponse>
 */
export const fetchTrafficAlerts = async (
  latitude: number,
  longitude: number,
  radius: number = DEFAULT_RADIUS_KM
): Promise<TrafficAlertResponse> => {
  console.log('[TrafficService] ========== FETCH TRAFFIC ALERTS ==========');
  console.log('[TrafficService] Input:', { latitude, longitude, radius });
  
  // Validate and convert coordinates to numbers
  const lat = Number(latitude);
  const lon = Number(longitude);
  const rad = Number(radius);
  
  // Check if conversion resulted in valid numbers
  if (isNaN(lat) || isNaN(lon)) {
    console.error('[TrafficService] ❌ Invalid coordinates - NaN values');
    console.error('[TrafficService] Received:', { latitude, longitude, lat, lon });
    return {
      success: false,
      message: 'Invalid coordinates: latitude and longitude must be valid numbers',
      alerts: [],
      totalCount: 0,
    };
  }
  
  // Validate coordinates
  if (!isValidCoordinates(lat, lon)) {
    console.error('[TrafficService] ❌ Invalid coordinates - outside India bounds');
    console.error('[TrafficService] Received:', { latitude, longitude, lat, lon });
    console.error('[TrafficService] Expected: lat 5.0-38.0, lng 67.0-98.0');
    return {
      success: false,
      message: `Invalid location: Coordinates (${lat.toFixed(4)}, ${lon.toFixed(4)}) are outside India. Please enable location services or use a device in India.`,
      alerts: [],
      totalCount: 0,
    };
  }
  
  console.log('[TrafficService] ✅ Coordinates validated - within India bounds');

  // Normalize radius
  const effectiveRadius = Math.min(Math.max(rad, 1.0), MAX_RADIUS_KM);
  
  log('Fetching traffic alerts', { latitude: lat, longitude: lon, radius: effectiveRadius });

  // Attempt fetch with retry logic
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= MAX_RETRY_ATTEMPTS; attempt++) {
    try {
      const result = await executeTrafficRequest(lat, lon, effectiveRadius);
      
      if (result.success) {
        return result;
      }
      
      // If not successful but not a network error, don't retry
      if (result.message && !result.message.includes('network') && !result.message.includes('timeout')) {
        return result;
      }
      
    } catch (error: any) {
      lastError = error;
      logWarn(`Attempt ${attempt} failed: ${error.message}`);
      
      if (attempt < MAX_RETRY_ATTEMPTS) {
        await delay(RETRY_DELAY_MS * attempt);
      }
    }
  }

  // All attempts failed
  logError('All fetch attempts failed', lastError?.message);
  return createEmptyResponse('Unable to fetch traffic alerts. Please try again later.');
};

/**
 * Execute the actual traffic request.
 */
const executeTrafficRequest = async (
  latitude: number,
  longitude: number,
  radius: number
): Promise<TrafficAlertResponse> => {
  // Ensure values are properly formatted as numbers with sufficient precision
  const lat = Number(latitude).toFixed(6);
  const lon = Number(longitude).toFixed(6);
  const rad = Number(radius).toFixed(2);
  
  const url = `${LOCALPULSE_URL}/api/localpulse/traffic/alerts?latitude=${lat}&longitude=${lon}&radius=${rad}`;
  
  console.log('[TrafficService] 🌐 Making API request:', url);
  console.log('[TrafficService] Request params:', { latitude: lat, longitude: lon, radius: rad });
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log('[TrafficService] Response status:', response.status, response.statusText);

    // Handle HTTP errors
    if (!response.ok) {
      console.log('[TrafficService] ❌ HTTP error:', response.status);
      return handleHttpError(response);
    }

    // Parse response
    const data: TrafficAlertResponse = await response.json();
    console.log('[TrafficService] 📦 Response data:', {
      success: data.success,
      message: data.message,
      totalCount: data.totalCount,
      alertsCount: data.alerts?.length || 0,
    });
    
    if (data.success && data.alerts && data.alerts.length > 0) {
      console.log('[TrafficService] ✅ Successfully fetched', data.alerts.length, 'traffic alerts');
      const processed = processAlerts(data.alerts);
      console.log('[TrafficService] Processed alerts:', processed.length);
      return {
        success: true,
        message: 'Success',
        alerts: processed,
        totalCount: processed.length,
      };
    }
    
    console.log('[TrafficService] ⚠️ No traffic alerts found in area');
    return createEmptyResponse('No traffic alerts in your area');

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      logWarn('Request timed out');
      return createEmptyResponse('Request timed out');
    }

    throw error;
  }
};

/**
 * Handle HTTP error responses.
 */
const handleHttpError = async (response: Response): Promise<TrafficAlertResponse> => {
  const status = response.status;
  let errorMessage = `HTTP ${status}`;
  
  try {
    const errorText = await response.text();
    const errorData = JSON.parse(errorText);
    errorMessage = errorData.message || errorMessage;
  } catch (e) {
    // Use default error message
  }

  // Handle expected "no data" responses gracefully
  if (status === 404 || status === 412 || status === 503) {
    log(`Traffic API returned ${status} - treating as no data`);
    return createEmptyResponse('No traffic alerts available');
  }

  // Handle rate limiting
  if (status === 429) {
    logWarn('Rate limit exceeded');
    return createEmptyResponse('Too many requests. Please try again later.');
  }

  // Handle authentication errors
  if (status === 401 || status === 403) {
    logWarn('Authentication error');
    return createEmptyResponse('Service temporarily unavailable');
  }

  // Handle server errors
  if (status >= 500) {
    logWarn(`Server error: ${status}`);
    return createEmptyResponse('Service temporarily unavailable');
  }

  logError(`Unexpected HTTP error: ${status}`, errorMessage);
  return {
    success: false,
    message: errorMessage,
    alerts: null,
    totalCount: 0,
  };
};

/**
 * Process and validate alerts.
 */
const processAlerts = (alerts: TrafficAlert[]): TrafficAlert[] => {
  return alerts
    .filter(alert => alert && alert.id && alert.title)
    .map(alert => ({
      ...alert,
      // Ensure all fields have valid values
      type: alert.type || 'traffic',
      description: alert.description || generateDefaultDescription(alert.type),
      severity: alert.severity || 'medium',
      location: alert.location || 'Area',
      city: alert.city || null,
      state: alert.state || null,
      latitude: alert.latitude || 0,
      longitude: alert.longitude || 0,
      timestamp: alert.timestamp || Math.floor(Date.now() / 1000),
      roadName: alert.roadName || null,
    }));
};

/**
 * Generate default description based on alert type.
 */
const generateDefaultDescription = (type: string): string => {
  const typeLower = (type || '').toLowerCase();
  
  switch (typeLower) {
    case 'accident':
      return 'An accident has been reported. Traffic is affected.';
    case 'traffic_jam':
      return 'Heavy traffic congestion. Expect delays.';
    case 'road_work':
      return 'Road work in progress. Drive carefully.';
    case 'road_closure':
      return 'Road is closed. Use alternate routes.';
    case 'hazard':
      return 'Road hazard detected. Drive with caution.';
    case 'event':
      return 'Event causing traffic delays.';
    default:
      return 'Traffic incident reported in the area.';
  }
};

/**
 * Create an empty successful response.
 */
const createEmptyResponse = (message: string): TrafficAlertResponse => ({
  success: true,
  message,
  alerts: [],
  totalCount: 0,
});

/**
 * Validate coordinates are within reasonable bounds for India.
 */
const isValidCoordinates = (latitude: number, longitude: number): boolean => {
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    console.warn('[TrafficService] Invalid coordinate types:', typeof latitude, typeof longitude);
    return false;
  }
  if (isNaN(latitude) || isNaN(longitude)) {
    console.warn('[TrafficService] Coordinates are NaN:', latitude, longitude);
    return false;
  }
  // India bounds (with some buffer)
  const isValid = latitude >= 5.0 && latitude <= 38.0 && 
                  longitude >= 67.0 && longitude <= 98.0;
  if (!isValid) {
    console.warn('[TrafficService] Coordinates outside India bounds:', { latitude, longitude });
    console.warn('[TrafficService] Expected: lat 5.0-38.0, lng 67.0-98.0');
  }
  return isValid;
};

/**
 * Get a human-readable label for traffic alert type.
 */
export const getTrafficTypeLabel = (type: string): string => {
  const typeLower = (type || '').toLowerCase();
  
  switch (typeLower) {
    case 'accident':
      return 'Accident';
    case 'traffic_jam':
      return 'Traffic Jam';
    case 'road_work':
      return 'Road Work';
    case 'road_closure':
      return 'Road Closed';
    case 'hazard':
      return 'Hazard';
    case 'event':
      return 'Event';
    case 'diversion':
      return 'Diversion';
    default:
      return 'Traffic Alert';
  }
};
