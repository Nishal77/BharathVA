// Network Test Utility
// This utility helps debug network connectivity issues

import { API_CONFIG } from './config';

export interface NetworkTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
  rawResponse?: string;
}

/**
 * Test basic network connectivity
 */
export const testBasicConnectivity = async (): Promise<NetworkTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing basic network connectivity...');
    
    // Test with a simple public API first
    const response = await fetch('https://httpbin.org/get', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(10000),
    });
    
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
      message: 'Basic network connectivity works!',
      responseTime,
    };
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    return {
      success: false,
      message: error.message || 'Basic network test failed',
      responseTime,
      error: error.message,
    };
  }
};

/**
 * Test backend connectivity
 */
export const testBackendConnectivity = async (): Promise<NetworkTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing backend connectivity...');
    console.log(`📍 Backend URL: ${API_CONFIG.BASE_URL}`);
    
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });
    
    const responseTime = Date.now() - startTime;
    const rawResponse = await response.text();
    
    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        error: `Server returned ${response.status}`,
        rawResponse,
      };
    }
    
    // Try to parse JSON
    try {
      const data = JSON.parse(rawResponse);
      return {
        success: true,
        message: 'Backend connectivity works!',
        responseTime,
      };
    } catch (parseError) {
      return {
        success: false,
        message: 'Backend returned invalid JSON',
        responseTime,
        error: 'JSON parse error',
        rawResponse,
      };
    }
    
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    let errorMessage = 'Unknown error';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - backend not responding';
    } else if (error.message.includes('Network request failed')) {
      errorMessage = 'Network request failed - check if backend is running';
    } else if (error.message.includes('fetch')) {
      errorMessage = 'Network error - check your connection';
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
 * Test registration endpoint
 */
export const testRegistrationEndpoint = async (): Promise<NetworkTestResult> => {
  const startTime = Date.now();
  
  try {
    console.log('🔍 Testing registration endpoint...');
    
    const testEmail = 'test@example.com';
    const response = await fetch(`${API_CONFIG.BASE_URL}/register/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email: testEmail }),
      signal: AbortSignal.timeout(API_CONFIG.TIMEOUT),
    });
    
    const responseTime = Date.now() - startTime;
    const rawResponse = await response.text();
    
    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        responseTime,
        error: `Server returned ${response.status}`,
        rawResponse,
      };
    }
    
    // Try to parse JSON
    try {
      const data = JSON.parse(rawResponse);
      return {
        success: true,
        message: 'Registration endpoint works!',
        responseTime,
      };
    } catch (parseError) {
      return {
        success: false,
        message: 'Registration endpoint returned invalid JSON',
        responseTime,
        error: 'JSON parse error',
        rawResponse,
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
 * Run comprehensive network tests
 */
export const runNetworkTests = async (): Promise<void> => {
  console.log('🚀 Starting Comprehensive Network Tests...');
  console.log('==========================================');
  
  // Test 1: Basic connectivity
  console.log('\n1️⃣ Testing basic network connectivity...');
  const basicTest = await testBasicConnectivity();
  console.log(`   Result: ${basicTest.success ? '✅' : '❌'} ${basicTest.message}`);
  if (basicTest.responseTime) {
    console.log(`   Response Time: ${basicTest.responseTime}ms`);
  }
  
  // Test 2: Backend connectivity
  console.log('\n2️⃣ Testing backend connectivity...');
  const backendTest = await testBackendConnectivity();
  console.log(`   Result: ${backendTest.success ? '✅' : '❌'} ${backendTest.message}`);
  if (backendTest.responseTime) {
    console.log(`   Response Time: ${backendTest.responseTime}ms`);
  }
  if (backendTest.rawResponse && !backendTest.success) {
    console.log(`   Raw Response: ${backendTest.rawResponse.substring(0, 200)}...`);
  }
  
  // Test 3: Registration endpoint
  console.log('\n3️⃣ Testing registration endpoint...');
  const regTest = await testRegistrationEndpoint();
  console.log(`   Result: ${regTest.success ? '✅' : '❌'} ${regTest.message}`);
  if (regTest.responseTime) {
    console.log(`   Response Time: ${regTest.responseTime}ms`);
  }
  if (regTest.rawResponse && !regTest.success) {
    console.log(`   Raw Response: ${regTest.rawResponse.substring(0, 200)}...`);
  }
  
  console.log('\n==========================================');
  console.log('🏁 Network Tests Complete!');
  
  if (basicTest.success && backendTest.success && regTest.success) {
    console.log('🎉 All tests passed! Your network configuration is working.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('\n💡 Troubleshooting tips:');
    if (!basicTest.success) {
      console.log('   • Check your internet connection');
    }
    if (!backendTest.success) {
      console.log('   • Make sure your backend services are running');
      console.log('   • Check if your machine\'s IP address is correct');
      console.log('   • Ensure your device is on the same network');
      console.log('   • Check firewall settings');
    }
    if (!regTest.success) {
      console.log('   • Check backend logs for errors');
      console.log('   • Verify database connection');
    }
  }
};
