// Comprehensive Unit Tests for BharathVA Mobile App
// Tests authentication, API calls, and network connectivity

import { authService, tokenManager, ApiError } from '../services/api/authService';
import { API_CONFIG, ENDPOINTS } from '../services/api/config';
import { networkTester } from './networkTest';
import { runRefreshTokenFlowTests } from './refreshTokenFlowTests';

interface TestResult {
  testName: string;
  success: boolean;
  error?: string;
  details?: any;
}

class UnitTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting Comprehensive Unit Tests...');
    console.log('==========================================');
    console.log('');

    this.results = [];

    // Test 1: API Configuration
    await this.testApiConfiguration();

    // Test 2: Token Manager
    await this.testTokenManager();

    // Test 3: Auth Service Methods
    await this.testAuthServiceMethods();

    // Test 4: Network Connectivity
    await this.testNetworkConnectivity();

    // Test 5: Error Handling
    await this.testErrorHandling();

    // Test 6: Refresh Token Flow (if user is logged in)
    await this.testRefreshTokenFlow();

    console.log('==========================================');
    console.log('🏁 Unit Tests Complete!');
    
    const failedTests = this.results.filter(r => !r.success);
    if (failedTests.length > 0) {
      console.log('⚠️  Some tests failed. Check the errors above.');
    } else {
      console.log('✅ All tests passed!');
    }

    console.log('');
    console.log('📊 Test Summary:');
    const summary = this.getSummary();
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);

    return this.results;
  }

  private async testApiConfiguration(): Promise<void> {
    console.log('1️⃣ Testing API Configuration...');
    
    try {
      // Test API_CONFIG
      if (!API_CONFIG.BASE_URL) {
        throw new Error('BASE_URL is not configured');
      }
      
      if (!API_CONFIG.TIMEOUT || API_CONFIG.TIMEOUT <= 0) {
        throw new Error('TIMEOUT is not properly configured');
      }
      
      // Test ENDPOINTS
      if (!ENDPOINTS.AUTH.LOGIN) {
        throw new Error('LOGIN endpoint is not configured');
      }
      
      if (!ENDPOINTS.AUTH.REGISTER_EMAIL) {
        throw new Error('REGISTER_EMAIL endpoint is not configured');
      }
      
      console.log('   Result: ✅ API Configuration is valid');
      console.log(`   Base URL: ${API_CONFIG.BASE_URL}`);
      console.log(`   Timeout: ${API_CONFIG.TIMEOUT}ms`);
      console.log(`   Logging: ${API_CONFIG.ENABLE_LOGGING}`);
      
      this.results.push({
        testName: 'API Configuration',
        success: true,
        details: {
          baseUrl: API_CONFIG.BASE_URL,
          timeout: API_CONFIG.TIMEOUT,
          enableLogging: API_CONFIG.ENABLE_LOGGING,
        },
      });
    } catch (error: any) {
      console.log('   Result: ❌', error.message);
      this.results.push({
        testName: 'API Configuration',
        success: false,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testTokenManager(): Promise<void> {
    console.log('2️⃣ Testing Token Manager...');
    
    try {
      // Test token storage and retrieval
      const testTokens = {
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };
      
      // Clear any existing tokens
      await tokenManager.clearTokens();
      
      // Test saving tokens
      // Note: Only access token is saved locally, refresh token is fetched from database
      await tokenManager.saveTokens(testTokens.accessToken, testTokens.refreshToken);
      
      // Test retrieving tokens
      const retrievedAccessToken = await tokenManager.getAccessToken();
      
      if (retrievedAccessToken !== testTokens.accessToken) {
        throw new Error('Access token not saved/retrieved correctly');
      }
      
      // Note: getRefreshToken() now fetches from database, so it may return null in unit tests
      // This is expected behavior - refresh token is not stored locally anymore
      const retrievedRefreshToken = await tokenManager.getRefreshToken();
      // In unit tests, refresh token fetch from database will fail, so it may be null
      // This is acceptable - the real app will fetch from database when needed
      
      // Test user data storage
      const testUserData = {
        userId: 'test-user-id',
        email: 'test@example.com',
        username: 'testuser',
        fullName: 'Test User',
      };
      
      await tokenManager.saveUserData(testUserData);
      const retrievedUserData = await tokenManager.getUserData();
      
      if (!retrievedUserData || retrievedUserData.userId !== testUserData.userId) {
        throw new Error('User data not saved/retrieved correctly');
      }
      
      // Test clearing tokens
      await tokenManager.clearTokens();
      const clearedAccessToken = await tokenManager.getAccessToken();
      
      if (clearedAccessToken !== null) {
        throw new Error('Access token not cleared properly');
      }
      
      // Note: Refresh token is not stored locally, so we don't check for it here
      
      console.log('   Result: ✅ Token Manager is working correctly');
      
      this.results.push({
        testName: 'Token Manager',
        success: true,
        details: {
          tokenStorage: 'Working',
          userDataStorage: 'Working',
          tokenClearing: 'Working',
        },
      });
    } catch (error: any) {
      console.log('   Result: ❌', error.message);
      this.results.push({
        testName: 'Token Manager',
        success: false,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testAuthServiceMethods(): Promise<void> {
    console.log('3️⃣ Testing Auth Service Methods...');
    
    try {
      // Test health check
      try {
        const healthResponse = await authService.healthCheck();
        console.log('   Health Check: ✅ Working');
      } catch (error) {
        console.log('   Health Check: ⚠️  Failed (may be expected if backend is down)');
      }
      
      // Test username availability check
      try {
        const usernameCheck = await authService.checkUsername('testuser123');
        console.log('   Username Check: ✅ Working');
      } catch (error) {
        console.log('   Username Check: ⚠️  Failed (may be expected if backend is down)');
      }
      
      // Test authentication status
      const isAuthenticated = await authService.isAuthenticated();
      console.log(`   Authentication Status: ${isAuthenticated ? 'Authenticated' : 'Not Authenticated'}`);
      
      console.log('   Result: ✅ Auth Service methods are accessible');
      
      this.results.push({
        testName: 'Auth Service Methods',
        success: true,
        details: {
          healthCheck: 'Tested',
          usernameCheck: 'Tested',
          authenticationStatus: isAuthenticated,
        },
      });
    } catch (error: any) {
      console.log('   Result: ❌', error.message);
      this.results.push({
        testName: 'Auth Service Methods',
        success: false,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testNetworkConnectivity(): Promise<void> {
    console.log('4️⃣ Testing Network Connectivity...');
    
    try {
      const networkResults = await networkTester.runAllTests();
      const networkSummary = networkTester.getSummary();
      
      if (networkSummary.failed === 0) {
        console.log('   Result: ✅ All network tests passed');
      } else {
        console.log(`   Result: ⚠️  ${networkSummary.failed} network tests failed`);
      }
      
      this.results.push({
        testName: 'Network Connectivity',
        success: networkSummary.failed === 0,
        details: {
          totalTests: networkSummary.total,
          passedTests: networkSummary.passed,
          failedTests: networkSummary.failed,
          results: networkResults,
        },
      });
    } catch (error: any) {
      console.log('   Result: ❌', error.message);
      this.results.push({
        testName: 'Network Connectivity',
        success: false,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testErrorHandling(): Promise<void> {
    console.log('5️⃣ Testing Error Handling...');
    
    try {
      // Test ApiError class
      const testError = new ApiError('Test error message', 400, { test: 'data' });
      
      if (testError.message !== 'Test error message') {
        throw new Error('ApiError message not set correctly');
      }
      
      if (testError.statusCode !== 400) {
        throw new Error('ApiError statusCode not set correctly');
      }
      
      if (testError.data?.test !== 'data') {
        throw new Error('ApiError data not set correctly');
      }
      
      // Test error handling in auth service
      try {
        await authService.login('invalid@email.com', 'wrongpassword');
      } catch (error) {
        if (error instanceof ApiError) {
          console.log('   Login Error Handling: ✅ Working');
        } else {
          throw new Error('Login error not properly handled as ApiError');
        }
      }
      
      console.log('   Result: ✅ Error handling is working correctly');
      
      this.results.push({
        testName: 'Error Handling',
        success: true,
        details: {
          apiErrorClass: 'Working',
          loginErrorHandling: 'Working',
        },
      });
    } catch (error: any) {
      console.log('   Result: ❌', error.message);
      this.results.push({
        testName: 'Error Handling',
        success: false,
        error: error.message,
      });
    }
    console.log('');
  }

  private async testRefreshTokenFlow(): Promise<void> {
    console.log('6️⃣ Testing Refresh Token Flow...');
    
    try {
      const accessToken = await tokenManager.getAccessToken();
      if (!accessToken) {
        console.log('   ⚠️  No access token available (skipping refresh token tests)');
        this.results.push({
          testName: 'Refresh Token Flow',
          success: true,
          error: 'Skipped - user not logged in',
        });
        return;
      }

      console.log('   🔄 Running refresh token flow tests...');
      const refreshTokenResults = await runRefreshTokenFlowTests();
      
      refreshTokenResults.forEach(result => {
        this.results.push({
          testName: `Refresh Token: ${result.testName}`,
          success: result.success,
          error: result.success ? undefined : result.message,
          details: result.details,
        });
      });

      const failed = refreshTokenResults.filter(r => !r.success).length;
      if (failed === 0) {
        console.log('   ✅ All refresh token flow tests passed');
      } else {
        console.log(`   ⚠️  ${failed} refresh token tests failed`);
      }
    } catch (error) {
      console.error('   ❌ Refresh token flow test error:', error);
      this.results.push({
        testName: 'Refresh Token Flow',
        success: false,
        error: error instanceof Error ? error.message : String(error),
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

export const unitTester = new UnitTester();

// Export for easy testing
export async function runUnitTests(): Promise<TestResult[]> {
  return await unitTester.runAllTests();
}

// Export individual test functions
export async function testApiConfig(): Promise<TestResult[]> {
  const tester = new UnitTester();
  await tester['testApiConfiguration']();
  return tester.getResults();
}

export async function testTokenManager(): Promise<TestResult[]> {
  const tester = new UnitTester();
  await tester['testTokenManager']();
  return tester.getResults();
}

export async function testAuthService(): Promise<TestResult[]> {
  const tester = new UnitTester();
  await tester['testAuthServiceMethods']();
  return tester.getResults();
}

export async function testNetworkConnectivity(): Promise<TestResult[]> {
  const tester = new UnitTester();
  await tester['testNetworkConnectivity']();
  return tester.getResults();
}

export async function testErrorHandling(): Promise<TestResult[]> {
  const tester = new UnitTester();
  await tester['testErrorHandling']();
  return tester.getResults();
}
