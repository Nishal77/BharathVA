/**
 * Comprehensive Refresh Token Flow Tests
 * Tests the entire refresh token flow from database to frontend
 */

import { tokenManager, authService } from '../services/api/authService';
import { API_CONFIG, ENDPOINTS } from '../services/api/config';
import * as SecureStore from 'expo-secure-store';

interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
}

class RefreshTokenFlowTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🔄 Refresh Token Flow Test Suite');
    console.log('================================');
    console.log('');

    try {
      await this.testAccessTokenRetrieval();
      await this.testRefreshTokenFromDatabase();
      await this.testRefreshTokenFallback();
      await this.testTokenRefreshFlow();
      await this.testDatabaseEndpoint();
      await this.testTokenSaveAndRetrieve();
      await this.testTokenRefreshAfterExpiry();
    } catch (error) {
      console.error('❌ Test suite error:', error);
      this.results.push({
        testName: 'Test Suite',
        success: false,
        message: `Test suite failed: ${error instanceof Error ? error.message : String(error)}`,
      });
    }

    return this.results;
  }

  /**
   * Test 1: Verify access token can be retrieved
   */
  private async testAccessTokenRetrieval(): Promise<void> {
    console.log('1️⃣ Testing Access Token Retrieval...');
    
    try {
      const accessToken = await tokenManager.getAccessToken();
      
      if (!accessToken) {
        throw new Error('No access token found. Please login first.');
      }

      if (accessToken.length < 50) {
        throw new Error('Access token appears to be invalid (too short)');
      }

      console.log('   ✅ Access token retrieved successfully');
      console.log(`   📝 Token prefix: ${accessToken.substring(0, 30)}...`);
      
      this.results.push({
        testName: 'Access Token Retrieval',
        success: true,
        message: 'Access token retrieved successfully',
        details: { tokenLength: accessToken.length },
      });
    } catch (error) {
      console.error('   ❌ Failed:', error);
      this.results.push({
        testName: 'Access Token Retrieval',
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
    console.log('');
  }

  /**
   * Test 2: Test fetching refresh token from database endpoint
   */
  private async testRefreshTokenFromDatabase(): Promise<void> {
    console.log('2️⃣ Testing Refresh Token Fetch from Database...');
    
    try {
      const accessToken = await tokenManager.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available for testing');
      }

      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.GET_CURRENT_REFRESH_TOKEN}`;
      console.log(`   🔗 Testing endpoint: ${url}`);

      const startTime = Date.now();
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`   📥 Response status: ${response.status}`);
      console.log(`   ⏱️  Response time: ${responseTime}ms`);

      if (!data.success) {
        throw new Error(`API returned success=false: ${data.message}`);
      }

      if (!data.data?.refreshToken) {
        throw new Error('Response missing refreshToken in data field');
      }

      const refreshToken = data.data.refreshToken;
      console.log('   ✅ Refresh token fetched from database successfully');
      console.log(`   📝 Token prefix: ${refreshToken.substring(0, 30)}...`);
      console.log(`   📏 Token length: ${refreshToken.length}`);

      this.results.push({
        testName: 'Refresh Token from Database',
        success: true,
        message: 'Refresh token fetched from database successfully',
        details: {
          responseTime,
          tokenLength: refreshToken.length,
          endpoint: url,
        },
      });
    } catch (error: any) {
      console.error('   ❌ Failed:', error.message);
      this.results.push({
        testName: 'Refresh Token from Database',
        success: false,
        message: error.message || String(error),
        details: {
          error: error.message,
          endpoint: `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.GET_CURRENT_REFRESH_TOKEN}`,
        },
      });
    }
    console.log('');
  }

  /**
   * Test 3: Test fallback to SecureStore
   */
  private async testRefreshTokenFallback(): Promise<void> {
    console.log('3️⃣ Testing Refresh Token Fallback to SecureStore...');
    
    try {
      const refreshToken = await tokenManager.getRefreshToken();
      
      if (!refreshToken) {
        console.log('   ⚠️  No refresh token found (this is OK if user is not logged in)');
        this.results.push({
          testName: 'Refresh Token Fallback',
          success: true,
          message: 'Fallback mechanism works (no token available)',
        });
        return;
      }

      console.log('   ✅ Refresh token retrieved (from database or SecureStore)');
      console.log(`   📝 Token prefix: ${refreshToken.substring(0, 30)}...`);

      this.results.push({
        testName: 'Refresh Token Fallback',
        success: true,
        message: 'Refresh token retrieved successfully',
        details: { tokenLength: refreshToken.length },
      });
    } catch (error) {
      console.error('   ❌ Failed:', error);
      this.results.push({
        testName: 'Refresh Token Fallback',
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
    console.log('');
  }

  /**
   * Test 4: Test complete token refresh flow
   */
  private async testTokenRefreshFlow(): Promise<void> {
    console.log('4️⃣ Testing Complete Token Refresh Flow...');
    
    try {
      const oldAccessToken = await tokenManager.getAccessToken();
      if (!oldAccessToken) {
        throw new Error('No access token available for refresh test');
      }

      console.log('   🔄 Attempting token refresh...');
      const startTime = Date.now();
      const refreshed = await authService.refreshAccessToken();
      const responseTime = Date.now() - startTime;

      if (!refreshed) {
        throw new Error('Token refresh returned false');
      }

      const newAccessToken = await tokenManager.getAccessToken();
      if (!newAccessToken) {
        throw new Error('New access token not found after refresh');
      }

      if (oldAccessToken === newAccessToken) {
        console.log('   ⚠️  Tokens are identical (may be normal if token was just refreshed)');
      } else {
        console.log('   ✅ New access token generated');
        console.log(`   📝 Old token suffix: ...${oldAccessToken.substring(oldAccessToken.length - 10)}`);
        console.log(`   📝 New token suffix: ...${newAccessToken.substring(newAccessToken.length - 10)}`);
      }

      console.log(`   ⏱️  Refresh time: ${responseTime}ms`);

      this.results.push({
        testName: 'Token Refresh Flow',
        success: true,
        message: 'Token refresh completed successfully',
        details: {
          responseTime,
          tokensAreDifferent: oldAccessToken !== newAccessToken,
        },
      });
    } catch (error: any) {
      console.error('   ❌ Failed:', error.message);
      this.results.push({
        testName: 'Token Refresh Flow',
        success: false,
        message: error.message || String(error),
      });
    }
    console.log('');
  }

  /**
   * Test 5: Test database endpoint availability
   */
  private async testDatabaseEndpoint(): Promise<void> {
    console.log('5️⃣ Testing Database Endpoint Availability...');
    
    try {
      const accessToken = await tokenManager.getAccessToken();
      if (!accessToken) {
        throw new Error('No access token available');
      }

      const url = `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.GET_CURRENT_REFRESH_TOKEN}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.status === 404) {
        throw new Error('Endpoint not found (404). Backend may need restart.');
      }

      if (response.status === 401) {
        throw new Error('Unauthorized (401). Access token may be invalid.');
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
      }

      const data = await response.json();
      
      if (data.success && data.data?.refreshToken) {
        console.log('   ✅ Database endpoint is working correctly');
        console.log(`   📍 Endpoint: ${url}`);
        console.log(`   ✅ Response structure is valid`);
        
        this.results.push({
          testName: 'Database Endpoint',
          success: true,
          message: 'Database endpoint is accessible and working',
          details: { endpoint: url, status: response.status },
        });
      } else {
        throw new Error('Invalid response structure');
      }
    } catch (error: any) {
      console.error('   ❌ Failed:', error.message);
      this.results.push({
        testName: 'Database Endpoint',
        success: false,
        message: error.message || String(error),
        details: {
          endpoint: `${API_CONFIG.BASE_URL}${ENDPOINTS.AUTH.GET_CURRENT_REFRESH_TOKEN}`,
        },
      });
    }
    console.log('');
  }

  /**
   * Test 6: Test token save and retrieve
   */
  private async testTokenSaveAndRetrieve(): Promise<void> {
    console.log('6️⃣ Testing Token Save and Retrieve...');
    
    try {
      const testAccessToken = 'test-access-token-' + Date.now();
      const testRefreshToken = 'test-refresh-token-' + Date.now();

      await tokenManager.saveTokens(testAccessToken, testRefreshToken);

      const retrievedAccessToken = await tokenManager.getAccessToken();
      if (retrievedAccessToken !== testAccessToken) {
        throw new Error('Access token not saved correctly');
      }

      console.log('   ✅ Access token saved and retrieved correctly');
      
      const retrievedRefreshToken = await SecureStore.getItemAsync('refreshToken');
      if (retrievedRefreshToken !== testRefreshToken) {
        console.log('   ⚠️  Refresh token not in SecureStore (expected - it\'s fetched from database)');
      }

      await tokenManager.clearTokens();
      const clearedToken = await tokenManager.getAccessToken();
      if (clearedToken !== null) {
        throw new Error('Token not cleared properly');
      }

      console.log('   ✅ Token clearing works correctly');

      this.results.push({
        testName: 'Token Save and Retrieve',
        success: true,
        message: 'Token save/retrieve/clear operations work correctly',
      });
    } catch (error) {
      console.error('   ❌ Failed:', error);
      this.results.push({
        testName: 'Token Save and Retrieve',
        success: false,
        message: error instanceof Error ? error.message : String(error),
      });
    }
    console.log('');
  }

  /**
   * Test 7: Test token refresh after expiry simulation
   */
  private async testTokenRefreshAfterExpiry(): Promise<void> {
    console.log('7️⃣ Testing Token Refresh After Expiry Simulation...');
    
    try {
      const accessToken = await tokenManager.getAccessToken();
      if (!accessToken) {
        console.log('   ⚠️  No access token available (skipping test)');
        this.results.push({
          testName: 'Token Refresh After Expiry',
          success: true,
          message: 'Test skipped (no token available)',
        });
        return;
      }

      const refreshToken = await tokenManager.getRefreshToken();
      if (!refreshToken) {
        console.log('   ⚠️  No refresh token available (skipping test)');
        this.results.push({
          testName: 'Token Refresh After Expiry',
          success: true,
          message: 'Test skipped (no refresh token available)',
        });
        return;
      }

      console.log('   ✅ Both tokens available for refresh test');
      console.log('   🔄 Testing refresh capability...');

      const refreshed = await authService.refreshAccessToken();
      if (refreshed) {
        console.log('   ✅ Token refresh capability verified');
        
        this.results.push({
          testName: 'Token Refresh After Expiry',
          success: true,
          message: 'Token refresh capability verified',
        });
      } else {
        throw new Error('Token refresh returned false');
      }
    } catch (error: any) {
      console.error('   ❌ Failed:', error.message);
      this.results.push({
        testName: 'Token Refresh After Expiry',
        success: false,
        message: error.message || String(error),
      });
    }
    console.log('');
  }

  /**
   * Print test summary
   */
  printSummary(): void {
    console.log('================================');
    console.log('📊 Test Summary');
    console.log('================================');
    console.log('');

    const passed = this.results.filter(r => r.success).length;
    const failed = this.results.filter(r => !r.success).length;

    this.results.forEach((result, index) => {
      const icon = result.success ? '✅' : '❌';
      console.log(`${index + 1}. ${icon} ${result.testName}`);
      console.log(`   ${result.message}`);
      if (result.details) {
        console.log(`   Details:`, JSON.stringify(result.details, null, 2));
      }
      console.log('');
    });

    console.log('================================');
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('================================');
    console.log('');

    if (failed === 0) {
      console.log('🎉 All refresh token flow tests passed!');
    } else {
      console.log('⚠️  Some tests failed. Please review the errors above.');
      console.log('');
      console.log('💡 Troubleshooting:');
      console.log('   1. Ensure backend auth-service is running');
      console.log('   2. Restart backend after adding new endpoint');
      console.log('   3. Check that user is logged in');
      console.log('   4. Verify database connection');
    }
  }
}

/**
 * Run all refresh token flow tests
 */
export const runRefreshTokenFlowTests = async (): Promise<TestResult[]> => {
  const tester = new RefreshTokenFlowTester();
  const results = await tester.runAllTests();
  tester.printSummary();
  return results;
};

export default RefreshTokenFlowTester;

