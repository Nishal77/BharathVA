// Environment Configuration for BharathVA Mobile App
// This file manages different API endpoints for different environments

export type Environment = 'development' | 'staging' | 'production';

interface ApiConfig {
  baseUrl: string;
  gatewayUrl: string;
  timeout: number;
  enableLogging: boolean;
}

// Environment configurations
const environments: Record<Environment, ApiConfig> = {
  development: {
    baseUrl: 'http://192.168.0.225:8080/api/auth', // Gateway service for auth API calls
    gatewayUrl: 'http://192.168.0.225:8080', // Gateway service for all API calls
    timeout: 30000,
    enableLogging: true,
  },
  staging: {
    baseUrl: 'https://staging-api.bharathva.com/auth',
    gatewayUrl: 'https://staging-api.bharathva.com',
    timeout: 30000,
    enableLogging: true,
  },
  production: {
    baseUrl: 'https://api.bharathva.com/auth',
    gatewayUrl: 'https://api.bharathva.com',
    timeout: 30000,
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

// Export current environment for debugging
export const CURRENT_ENVIRONMENT = getCurrentEnvironment();
