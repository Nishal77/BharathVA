/**
 * News Service Connection Test
 * Validates connectivity to the news-ai service on port 8084
 */

import { getNewsServiceURL } from './environment';

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
  error?: string;
  baseUrl?: string;
  statusCode?: number;
}

/**
 * Test connectivity to the news service health endpoint
 */
export const testNewsServiceConnection = async (): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  const baseUrl = getNewsServiceURL();
  
  try {
    console.log('[NewsConnectionTest] Testing connection to news service...');
    console.log(`[NewsConnectionTest] Base URL: ${baseUrl}`);
    
    if (!baseUrl || !baseUrl.includes('8084')) {
      return {
        success: false,
        message: 'News service URL is not configured for port 8084',
        baseUrl,
        error: `Expected port 8084, got: ${baseUrl}`,
      };
    }

    const healthUrl = `${baseUrl}/api/news/health`;
    console.log(`[NewsConnectionTest] Health check URL: ${healthUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(healthUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    console.log(`[NewsConnectionTest] Response: ${response.status} (${responseTime}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Health check failed: HTTP ${response.status}`,
        responseTime,
        baseUrl,
        statusCode: response.status,
        error: errorText,
      };
    }

    const data = await response.text();
    console.log(`[NewsConnectionTest] Health check response: ${data}`);

    return {
      success: true,
      message: `News service is running: ${data}`,
      responseTime,
      baseUrl,
      statusCode: response.status,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    let errorMessage = 'Unknown error';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - news service may not be running or not accessible';
    } else if (error.message && error.message.includes('Network request failed')) {
      errorMessage = 'Network request failed - check if news-ai service is running on port 8084';
    } else if (error.message && error.message.includes('fetch')) {
      errorMessage = 'Network error - check your internet connection and service availability';
    } else {
      errorMessage = error.message || 'Unknown network error';
    }

    console.error(`[NewsConnectionTest] Connection failed: ${errorMessage}`);

    return {
      success: false,
      message: errorMessage,
      responseTime,
      baseUrl,
      error: error.message,
    };
  }
};

/**
 * Test the trending news endpoint
 */
export const testTrendingNewsEndpoint = async (): Promise<ConnectionTestResult> => {
  const startTime = Date.now();
  const baseUrl = getNewsServiceURL();
  
  try {
    console.log('[NewsConnectionTest] Testing trending news endpoint...');
    
    const trendingUrl = `${baseUrl}/api/news/trending?page=0&size=5`;
    console.log(`[NewsConnectionTest] Trending URL: ${trendingUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(trendingUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);
    const responseTime = Date.now() - startTime;

    console.log(`[NewsConnectionTest] Response: ${response.status} (${responseTime}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Trending endpoint failed: HTTP ${response.status}`,
        responseTime,
        baseUrl,
        statusCode: response.status,
        error: errorText,
      };
    }

    const data = await response.json();
    const articleCount = data.content ? data.content.length : 0;

    console.log(`[NewsConnectionTest] Fetched ${articleCount} trending articles`);

    return {
      success: true,
      message: `Successfully fetched ${articleCount} trending news articles`,
      responseTime,
      baseUrl,
      statusCode: response.status,
    };
  } catch (error: any) {
    const responseTime = Date.now() - startTime;
    
    let errorMessage = 'Unknown error';
    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - endpoint may be slow or unavailable';
    } else if (error.message && error.message.includes('Network request failed')) {
      errorMessage = 'Network request failed - check if news-ai service is running on port 8084';
    } else {
      errorMessage = error.message || 'Unknown network error';
    }

    console.error(`[NewsConnectionTest] Trending endpoint failed: ${errorMessage}`);

    return {
      success: false,
      message: errorMessage,
      responseTime,
      baseUrl,
      error: error.message,
    };
  }
};

/**
 * Run all connection tests for news service
 */
export const runNewsConnectionTests = async (): Promise<void> => {
  console.log('🚀 Starting News Service Connection Tests...');
  console.log('==========================================');
  console.log('');

  const healthTest = await testNewsServiceConnection();
  console.log(`Health Check: ${healthTest.success ? '✅' : '❌'} ${healthTest.message}`);
  if (healthTest.responseTime) {
    console.log(`   Response Time: ${healthTest.responseTime}ms`);
  }
  console.log('');

  const trendingTest = await testTrendingNewsEndpoint();
  console.log(`Trending Endpoint: ${trendingTest.success ? '✅' : '❌'} ${trendingTest.message}`);
  if (trendingTest.responseTime) {
    console.log(`   Response Time: ${trendingTest.responseTime}ms`);
  }
  console.log('');

  console.log('==========================================');
  console.log('🏁 News Service Connection Tests Complete!');
  
  if (healthTest.success && trendingTest.success) {
    console.log('🎉 All tests passed! News service is accessible on port 8084.');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
    console.log('\n💡 Troubleshooting tips:');
    console.log('   • Ensure news-ai service is running: docker-compose up news-ai-service');
    console.log('   • Verify service is listening on port 8084');
    console.log('   • Check if service is accessible: curl http://192.168.0.121:8084/api/news/health');
    console.log('   • Ensure your device is on the same network');
    console.log('   • Check firewall settings');
  }
};

