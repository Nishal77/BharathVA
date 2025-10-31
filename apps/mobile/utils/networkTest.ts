// Comprehensive Network Test Utility for BharathVA Mobile App
// This utility tests all network connectivity and API endpoints

import { API_CONFIG, ENDPOINTS } from '../services/api/config';

interface TestResult {
  testName: string;
  success: boolean;
  responseTime: number;
  error?: string;
  details?: any;
}

class NetworkTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🚀 Starting Comprehensive Network Tests...');
    console.log('==========================================');
    console.log('');

    this.results = [];

    // Test 1: Basic network connectivity
    await this.testBasicConnectivity();

    // Test 2: Backend connectivity
    await this.testBackendConnectivity();

    // Test 3: Registration endpoint
    await this.testRegistrationEndpoint();

    // Test 4: Login endpoint
    await this.testLoginEndpoint();

    // Test 5: Health check
    await this.testHealthCheck();

    console.log('==========================================');
    console.log('🏁 Network Tests Complete!');
    
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('⚠️  Some tests failed. Check the errors above.');
    } else {
      console.log('✅ All tests passed!');
    }

    console.log('');
    console.log('💡 Troubleshooting tips:');
    console.log('   • Check your internet connection');
    console.log('   • Make sure your backend services are running');
    console.log('   • Check if your machine\'s IP address is correct');
    console.log('   • Ensure your device is on the same network');
    console.log('   • Check firewall settings');
    console.log('   • Check backend logs for errors');
    console.log('   • Verify database connection');

    return this.results;
  }

  private async testBasicConnectivity(): Promise<void> {
    console.log('1️⃣ Testing basic network connectivity...');
    
    try {
      const startTime = Date.now();
      
      // Test with a simple fetch to a reliable endpoint
      const response = await fetch('https://httpbin.org/get', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
      
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        console.log('   Result: ✅ Basic connectivity working');
        console.log(`   Response Time: ${responseTime}ms`);
        this.results.push({
          testName: 'Basic Connectivity',
          success: true,
          responseTime,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - Date.now();
      console.log('   Result: ❌', error.message);
      console.log(`   Response Time: ${responseTime}ms`);
      this.results.push({
        testName: 'Basic Connectivity',
        success: false,
        responseTime,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testBackendConnectivity(): Promise<void> {
    console.log('2️⃣ Testing backend connectivity...');
    
    try {
      const startTime = Date.now();
      const url = `${API_CONFIG.BASE_URL}/register/health`;
      
      console.log(`📍 Backend URL: ${url}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log('   Result: ✅ Backend is reachable');
        console.log(`   Response Time: ${responseTime}ms`);
        console.log('   Response:', data);
        this.results.push({
          testName: 'Backend Connectivity',
          success: true,
          responseTime,
          details: data,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - Date.now();
      console.log('   Result: ❌', error.message);
      console.log(`   Response Time: ${responseTime}ms`);
      this.results.push({
        testName: 'Backend Connectivity',
        success: false,
        responseTime,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testRegistrationEndpoint(): Promise<void> {
    console.log('3️⃣ Testing registration endpoint...');
    
    try {
      const startTime = Date.now();
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.REGISTER_EMAIL}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // Registration endpoint should return 400 for invalid email, which is expected
      if (response.status === 400 || response.status === 422) {
        const data = await response.json();
        console.log('   Result: ✅ Registration endpoint is working (expected validation error)');
        console.log(`   Response Time: ${responseTime}ms`);
        console.log('   Response:', data);
        this.results.push({
          testName: 'Registration Endpoint',
          success: true,
          responseTime,
          details: data,
        });
      } else if (response.ok) {
        const data = await response.json();
        console.log('   Result: ✅ Registration endpoint is working');
        console.log(`   Response Time: ${responseTime}ms`);
        this.results.push({
          testName: 'Registration Endpoint',
          success: true,
          responseTime,
          details: data,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - Date.now();
      console.log('   Result: ❌', error.message);
      console.log(`   Response Time: ${responseTime}ms`);
      this.results.push({
        testName: 'Registration Endpoint',
        success: false,
        responseTime,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testLoginEndpoint(): Promise<void> {
    console.log('4️⃣ Testing login endpoint...');
    
    try {
      const startTime = Date.now();
      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.LOGIN}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword',
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      // Login endpoint should return 401 for invalid credentials, which is expected
      if (response.status === 401 || response.status === 400) {
        const data = await response.json();
        console.log('   Result: ✅ Login endpoint is working (expected auth error)');
        console.log(`   Response Time: ${responseTime}ms`);
        console.log('   Response:', data);
        this.results.push({
          testName: 'Login Endpoint',
          success: true,
          responseTime,
          details: data,
        });
      } else if (response.ok) {
        const data = await response.json();
        console.log('   Result: ✅ Login endpoint is working');
        console.log(`   Response Time: ${responseTime}ms`);
        this.results.push({
          testName: 'Login Endpoint',
          success: true,
          responseTime,
          details: data,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - Date.now();
      console.log('   Result: ❌', error.message);
      console.log(`   Response Time: ${responseTime}ms`);
      this.results.push({
        testName: 'Login Endpoint',
        success: false,
        responseTime,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testHealthCheck(): Promise<void> {
    console.log('5️⃣ Testing health check endpoint...');
    
    try {
      const startTime = Date.now();
      const url = `${API_CONFIG.BASE_URL}/register/health`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;
      
      if (response.ok) {
        const data = await response.json();
        console.log('   Result: ✅ Health check is working');
        console.log(`   Response Time: ${responseTime}ms`);
        console.log('   Response:', data);
        this.results.push({
          testName: 'Health Check',
          success: true,
          responseTime,
          details: data,
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error: any) {
      const responseTime = Date.now() - Date.now();
      console.log('   Result: ❌', error.message);
      console.log(`   Response Time: ${responseTime}ms`);
      this.results.push({
        testName: 'Health Check',
        success: false,
        responseTime,
        error: error.message,
      });
    }
    console.log('');
  }

  getResults(): TestResult[] {
    return this.results;
  }

  getSummary(): { total: number; passed: number; failed: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    
    return { total, passed, failed };
  }
}

export const networkTester = new NetworkTester();

// Export for easy testing
export async function runNetworkTests(): Promise<TestResult[]> {
  return await networkTester.runAllTests();
}
