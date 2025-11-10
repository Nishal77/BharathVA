// Test API Connection Script
// This script helps verify that the mobile app can connect to the backend services

import { API_CONFIG } from './config';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
}

/**
 * Test basic connectivity to the backend API
 */
export const testApiConnection = async (): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing API connection...');
    console.log(`📍 API Base URL: ${API_CONFIG.BASE_URL}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    
    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        error: `Server returned ${response.status}`,
      };
    }
    
    const data = await response.json();
    
    return {
      success: true,
      message: 'API connection successful!',
      responseTime,
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    let errorMessage = 'Unknown error';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - check your network connection';
    } else if (error.message.includes('Network request failed')) {
      errorMessage = 'Network request failed - check if backend is running and accessible';
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Network error - check your internet connection';
    } else {
      errorMessage = error.message || 'Unknown network error';
    }
    
    return {
      success: false,
      message: errorMessage,
      responseTime,
      error: error.message,
    };
  }
};

/**
 * Test registration email endpoint
 */
export const testRegistrationEndpoint = async (): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing registration endpoint...');
    
    const testEmail = 'test@example.com';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseTime = Date.now() - startTime;
    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        message: 'Registration endpoint is working!',
        responseTime,
      };
    } else {
      return {
        success: false,
        message: data.message || `HTTP ${response.status}`,
        responseTime,
        error: data.message,
      };
    }
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      success: false,
      message: error.message || 'Registration endpoint test failed',
      responseTime,
      error: error.message,
    };
  }
};

/**
 * Run all connection tests
 */
export const runAllTests = async (): Promise<void> => {
  console.log('🚀 Starting API Connection Tests...');
  console.log('=====================================');
  
  // Test 1: Basic connectivity
  console.log('\n1️⃣ Testing basic API connectivity...');
  const basicTest = await testApiConnection();
  console.log(`   Result: ${basicTest.success ? '✅' : '❌'} ${basicTest.message}`);
  if (basicTest.responseTime) {
    console.log(`   Response Time: ${basicTest.responseTime}ms`);
  }
  
  // Test 2: Registration endpoint
  console.log('\n2️⃣ Testing registration endpoint...');
  const regTest = await testRegistrationEndpoint();
  console.log(`   Result: ${regTest.success ? '✅' : '❌'} ${regTest.message}`);
  if (regTest.responseTime) {
    console.log(`   Response Time: ${regTest.responseTime}ms`);
  }
  
  console.log('\n=====================================');
  console.log('🏁 API Connection Tests Complete!');
  
  if (basicTest.success && regTest.success) {
    console.log('🎉 All tests passed! Your app should work on physical devices.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('\n💡 Troubleshooting tips:');
    console.log('   • Make sure your backend services are running');
    console.log('   • Check if your machine\'s IP address is correct');
    console.log('   • Ensure your device is on the same network');
    console.log('   • Check firewall settings');
  }
};
