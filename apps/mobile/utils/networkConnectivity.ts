// Network Connectivity Check Utility
// Helps detect network issues and provide better error messages

import { API_CONFIG } from '../services/api/config';
import { getGatewayURL } from '../services/api/environment';

export interface ConnectivityResult {
  isConnected: boolean;
  error?: string;
  details?: {
    gatewayReachable: boolean;
    networkType?: string;
    deviceIP?: string;
  };
}

/**
 * Check if backend services are reachable
 * Returns connectivity status with helpful error messages
 */
export async function checkBackendConnectivity(): Promise<ConnectivityResult> {
  const gatewayUrl = getGatewayURL();
  const healthEndpoint = `${gatewayUrl}/api/auth/register/health`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Fast 3s check
    
    const response = await fetch(healthEndpoint, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    
    clearTimeout(timeoutId);
    
    if (response.ok) {
      return {
        isConnected: true,
        details: {
          gatewayReachable: true,
        },
      };
    } else {
      return {
        isConnected: false,
        error: `Backend returned status ${response.status}`,
        details: {
          gatewayReachable: false,
        },
      };
    }
  } catch (error: any) {
    const errorMessage = error.name === 'AbortError' 
      ? 'Connection timeout - backend unreachable'
      : error.message || 'Network error';
    
    // Extract IP from gateway URL for better error messages
    const gatewayIP = gatewayUrl.split('//')[1]?.split(':')[0] || 'unknown';
    
    return {
      isConnected: false,
      error: errorMessage,
      details: {
        gatewayReachable: false,
        deviceIP: 'unknown', // Can be enhanced with device info
      },
    };
  }
}

/**
 * Get helpful error message for network connectivity issues
 */
export function getNetworkErrorMessage(gatewayUrl: string): string {
  const gatewayIP = gatewayUrl.split('//')[1]?.split(':')[0] || 'unknown';
  const gatewayPort = gatewayUrl.split(':').pop()?.split('/')[0] || '8080';
  
  return `Network connection failed. Please verify:
1. Backend services are running: ${gatewayUrl}
2. Your device is on the same network
3. IP address is correct: ${gatewayIP}
4. Firewall is not blocking port ${gatewayPort}
5. Try: curl ${gatewayUrl}/api/auth/register/health`;
}

/**
 * Check if device is on same network as backend
 * This is a heuristic check based on IP address patterns
 */
export function isLikelySameNetwork(deviceIP: string, backendIP: string): boolean {
  // Extract network prefix (first 3 octets for /24 network)
  const devicePrefix = deviceIP.split('.').slice(0, 3).join('.');
  const backendPrefix = backendIP.split('.').slice(0, 3).join('.');
  
  // Check if both are private IPs and same network
  const isPrivateIP = (ip: string) => {
    return ip.startsWith('192.168.') || 
           ip.startsWith('10.') || 
           ip.startsWith('172.16.') || 
           ip.startsWith('172.17.') || 
           ip.startsWith('172.18.') || 
           ip.startsWith('172.19.') || 
           ip.startsWith('172.20.') || 
           ip.startsWith('172.21.') || 
           ip.startsWith('172.22.') || 
           ip.startsWith('172.23.') || 
           ip.startsWith('172.24.') || 
           ip.startsWith('172.25.') || 
           ip.startsWith('172.26.') || 
           ip.startsWith('172.27.') || 
           ip.startsWith('172.28.') || 
           ip.startsWith('172.29.') || 
           ip.startsWith('172.30.') || 
           ip.startsWith('172.31.');
  };
  
  if (!isPrivateIP(deviceIP) || !isPrivateIP(backendIP)) {
    return false; // One is public IP, likely different network
  }
  
  return devicePrefix === backendPrefix;
}

// Cached connectivity check to avoid repeated network calls
let connectivityCache: {
  result: ConnectivityResult;
  timestamp: number;
} | null = null;

const CACHE_DURATION = 5000; // 5 seconds cache

/**
 * Cached version of connectivity check
 * Returns cached result if available and recent, otherwise performs new check
 */
export async function checkBackendConnectivityCached(): Promise<ConnectivityResult & { latency?: number }> {
  const now = Date.now();
  
  // Return cached result if still valid
  if (connectivityCache && (now - connectivityCache.timestamp) < CACHE_DURATION) {
    return connectivityCache.result;
  }
  
  // Perform new check
  const startTime = Date.now();
  const result = await checkBackendConnectivity();
  const latency = Date.now() - startTime;
  
  // Update cache
  connectivityCache = {
    result: { ...result, latency },
    timestamp: now,
  };
  
  return { ...result, latency };
}
