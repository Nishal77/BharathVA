// Environment Configuration for BharathVA Mobile App
// This file manages different API endpoints for different environments

export type Environment = 'development' | 'staging' | 'production';

interface ApiConfig {
  baseUrl: string;
  gatewayUrl: string;
  feedServiceUrl: string; // Direct feed-service URL for WebSocket
  newsServiceUrl: string; // News AI service URL
  websocketUrl: string; // WebSocket URL (can be direct to feed-service or through gateway)
  timeout: number;
  enableLogging: boolean;
}

// Environment configurations
const environments: Record<Environment, ApiConfig> = {
  development: {
    // Update this IP to match your development machine's IP address
    // Run: ifconfig | grep "inet " | grep -v 127.0.0.1 to find your IP
    baseUrl: 'http://192.168.0.203:8080/api/auth', // Gateway service for auth API calls
    gatewayUrl: 'http://192.168.0.203:8080', // Gateway service for all API calls
    feedServiceUrl: 'http://192.168.0.203:8082', // Direct feed-service URL
    newsServiceUrl: 'http://192.168.0.203:8084', // News AI service URL
    // Connect directly to feed-service for WebSocket (more reliable than through gateway)
    websocketUrl: 'http://192.168.0.203:8082/ws', // Direct connection to feed-service WebSocket
    timeout: 15000, // Increased to 15 seconds for slower connections
    enableLogging: true,
  },
  staging: {
    baseUrl: 'https://staging-api.bharathva.com/auth',
    gatewayUrl: 'https://staging-api.bharathva.com',
    feedServiceUrl: 'https://staging-api.bharathva.com',
    newsServiceUrl: 'https://staging-api.bharathva.com',
    websocketUrl: 'https://staging-api.bharathva.com/ws', // Through gateway in staging
    timeout: 10000,
    enableLogging: true,
  },
  production: {
    baseUrl: 'https://api.bharathva.com/auth',
    gatewayUrl: 'https://api.bharathva.com',
    feedServiceUrl: 'https://api.bharathva.com',
    newsServiceUrl: 'https://api.bharathva.com',
    websocketUrl: 'https://api.bharathva.com/ws', // Through gateway in production
    timeout: 10000,
    enableLogging: false,
  },
};

// Get current environment
export const getCurrentEnvironment = (): Environment => {
  if (__DEV__) {
    return 'development';
  }
  
  // You can add logic here to detect staging vs production
  // For now, defaulting to production for non-dev builds
  return 'production';
};

// Get API configuration for current environment
export const getApiConfig = (): ApiConfig => {
  const env = getCurrentEnvironment();
  return environments[env];
};

// Helper function to get base URL
export const getBaseURL = (): string => {
  return getApiConfig().baseUrl;
};

// Helper function to get gateway URL
export const getGatewayURL = (): string => {
  return getApiConfig().gatewayUrl;
};

// Helper function to get timeout
export const getTimeout = (): number => {
  return getApiConfig().timeout;
};

// Helper function to check if logging is enabled
export const isLoggingEnabled = (): boolean => {
  return getApiConfig().enableLogging;
};

// Helper function to get WebSocket URL
export const getWebSocketURL = (): string => {
  return getApiConfig().websocketUrl;
};

// Helper function to get feed service URL
export const getFeedServiceURL = (): string => {
  return getApiConfig().feedServiceUrl;
};

// Helper function to get news service URL
export const getNewsServiceURL = (): string => {
  return getApiConfig().newsServiceUrl;
};

// Export current environment for debugging
export const CURRENT_ENVIRONMENT = getCurrentEnvironment();
