// Network Connectivity Utility
// Provides fast network checks before making API calls

import { API_CONFIG } from '../services/api/config';

interface NetworkCheckResult {
  isConnected: boolean;
  latency?: number;
  error?: string;
}

/**
 * Quick network connectivity check
 * Tests if the backend is reachable with minimal timeout
 */
export async function checkBackendConnectivity(): Promise<NetworkCheckResult> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    const startTime = Date.now();
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    const latency = Date.now() - startTime;
    
    if (response.ok) {
      return {
        isConnected: true,
        latency,
      };
    }
    
    return {
      isConnected: false,
      error: `Backend returned ${response.status}`,
    };
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return {
        isConnected: false,
        error: 'Connection timeout',
      };
    }
    
    return {
      isConnected: false,
      error: error.message || 'Network error',
    };
  }
}

/**
 * Check network connectivity with caching
 * Caches result for 30 seconds to avoid excessive checks
 */
let cachedResult: NetworkCheckResult | null = null;
let cacheTimestamp = 0;
const CACHE_DURATION = 30000; // 30 seconds

export async function checkBackendConnectivityCached(): Promise<NetworkCheckResult> {
  const now = Date.now();
  
  // Return cached result if still valid
  if (cachedResult && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedResult;
  }
  
  // Perform new check
  const result = await checkBackendConnectivity();
  
  // Update cache
  cachedResult = result;
  cacheTimestamp = now;
  
  return result;
}

/**
 * Clear the connectivity cache
 * Useful after network state changes
 */
export function clearConnectivityCache(): void {
  cachedResult = null;
  cacheTimestamp = 0;
}

