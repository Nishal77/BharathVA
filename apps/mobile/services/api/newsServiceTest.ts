/**
 * Unit Tests for News Service
 * Tests news API connectivity, error handling, and retry logic
 */

import { newsService } from './newsService';
import { getNewsServiceURL } from './environment';

export interface TestResult {
  testName: string;
  success: boolean;
  message: string;
  details?: any;
  duration?: number;
}

class NewsServiceTester {
  private results: TestResult[] = [];

  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Starting News Service Unit Tests...');
    console.log('==========================================');
    console.log('');

    this.results = [];

    await this.testServiceConfiguration();
    await this.testHealthCheck();
    await this.testGetTrendingNews();
    await this.testGetAllNews();
    await this.testGetRecentNews();
    await this.testErrorHandling();
    await this.testRetryLogic();

    console.log('==========================================');
    console.log('🏁 News Service Tests Complete!');
    
    const summary = this.getSummary();
    console.log(`   Total Tests: ${summary.total}`);
    console.log(`   Passed: ${summary.passed}`);
    console.log(`   Failed: ${summary.failed}`);
    console.log(`   Success Rate: ${((summary.passed / summary.total) * 100).toFixed(1)}%`);

    return this.results;
  }

  private async testServiceConfiguration(): Promise<void> {
    const startTime = Date.now();
    try {
      const baseUrl = getNewsServiceURL();
      const isValid = baseUrl && baseUrl.includes('8083');
      
      this.addResult({
        testName: 'Service Configuration',
        success: isValid,
        message: isValid 
          ? `Base URL correctly configured: ${baseUrl}`
          : `Base URL misconfigured: ${baseUrl}. Expected port 8083`,
        details: { baseUrl },
        duration: Date.now() - startTime,
      });
    } catch (error: any) {
      this.addResult({
        testName: 'Service Configuration',
        success: false,
        message: `Configuration error: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime,
      });
    }
  }

  private async testHealthCheck(): Promise<void> {
    const startTime = Date.now();
    try {
      const baseUrl = getNewsServiceURL();
      const healthUrl = `${baseUrl}/api/news/health`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(healthUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);
      const duration = Date.now() - startTime;

      if (response.ok) {
        const data = await response.text();
        this.addResult({
          testName: 'Health Check',
          success: true,
          message: `Health check passed: ${data}`,
          details: { status: response.status, response: data },
          duration,
        });
      } else {
        this.addResult({
          testName: 'Health Check',
          success: false,
          message: `Health check failed: HTTP ${response.status}`,
          details: { status: response.status },
          duration,
        });
      }
    } catch (error: any) {
      this.addResult({
        testName: 'Health Check',
        success: false,
        message: `Health check error: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime,
      });
    }
  }

  private async testGetTrendingNews(): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await newsService.getTrendingNews(0, 10);
      
      const isValid = result && 
        Array.isArray(result.content) &&
        typeof result.totalElements === 'number' &&
        typeof result.totalPages === 'number';

      this.addResult({
        testName: 'Get Trending News',
        success: isValid,
        message: isValid
          ? `Successfully fetched ${result.content.length} trending news articles`
          : 'Invalid response structure',
        details: {
          contentCount: result.content.length,
          totalElements: result.totalElements,
          totalPages: result.totalPages,
        },
        duration: Date.now() - startTime,
      });
    } catch (error: any) {
      this.addResult({
        testName: 'Get Trending News',
        success: false,
        message: `Failed to fetch trending news: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime,
      });
    }
  }

  private async testGetAllNews(): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await newsService.getAllNews(0, 5);
      
      const isValid = result && 
        Array.isArray(result.content) &&
        typeof result.totalElements === 'number';

      this.addResult({
        testName: 'Get All News',
        success: isValid,
        message: isValid
          ? `Successfully fetched ${result.content.length} news articles`
          : 'Invalid response structure',
        details: {
          contentCount: result.content.length,
          totalElements: result.totalElements,
        },
        duration: Date.now() - startTime,
      });
    } catch (error: any) {
      this.addResult({
        testName: 'Get All News',
        success: false,
        message: `Failed to fetch all news: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime,
      });
    }
  }

  private async testGetRecentNews(): Promise<void> {
    const startTime = Date.now();
    try {
      const result = await newsService.getRecentNews(0, 5, 24);
      
      const isValid = result && Array.isArray(result.content);

      this.addResult({
        testName: 'Get Recent News',
        success: isValid,
        message: isValid
          ? `Successfully fetched ${result.content.length} recent news articles`
          : 'Invalid response structure',
        details: {
          contentCount: result.content.length,
        },
        duration: Date.now() - startTime,
      });
    } catch (error: any) {
      this.addResult({
        testName: 'Get Recent News',
        success: false,
        message: `Failed to fetch recent news: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime,
      });
    }
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    try {
      const invalidUrl = 'http://invalid-host:8083/api/news/trending';
      
      try {
        await fetch(invalidUrl, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        this.addResult({
          testName: 'Error Handling',
          success: false,
          message: 'Expected error was not thrown',
          duration: Date.now() - startTime,
        });
      } catch (error: any) {
        const hasError = error && (error.message || error.name);
        this.addResult({
          testName: 'Error Handling',
          success: hasError,
          message: hasError
            ? 'Error handling works correctly'
            : 'Error handling failed',
          details: { errorType: error.name || 'Unknown' },
          duration: Date.now() - startTime,
        });
      }
    } catch (error: any) {
      this.addResult({
        testName: 'Error Handling',
        success: false,
        message: `Error handling test failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime,
      });
    }
  }

  private async testRetryLogic(): Promise<void> {
    const startTime = Date.now();
    try {
      const baseUrl = getNewsServiceURL();
      const testUrl = `${baseUrl}/api/news/trending?page=0&size=5`;
      
      let attemptCount = 0;
      const maxAttempts = 3;
      let success = false;

      for (let i = 0; i < maxAttempts; i++) {
        attemptCount++;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);

          const response = await fetch(testUrl, {
            method: 'GET',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            success = true;
            break;
          }
        } catch (error: any) {
          if (i < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      }

      this.addResult({
        testName: 'Retry Logic',
        success: success,
        message: success
          ? `Request succeeded after ${attemptCount} attempt(s)`
          : `Request failed after ${attemptCount} attempts`,
        details: { attempts: attemptCount, success },
        duration: Date.now() - startTime,
      });
    } catch (error: any) {
      this.addResult({
        testName: 'Retry Logic',
        success: false,
        message: `Retry logic test failed: ${error.message}`,
        details: { error: error.message },
        duration: Date.now() - startTime,
      });
    }
  }

  private addResult(result: TestResult): void {
    this.results.push(result);
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.testName}: ${result.message}`);
    if (result.duration) {
      console.log(`   Duration: ${result.duration}ms`);
    }
    if (result.details && Object.keys(result.details).length > 0) {
      console.log(`   Details:`, result.details);
    }
    console.log('');
  }

  private getSummary() {
    const total = this.results.length;
    const passed = this.results.filter(r => r.success).length;
    const failed = total - passed;
    return { total, passed, failed };
  }

  getResults(): TestResult[] {
    return this.results;
  }
}

export async function runNewsServiceTests(): Promise<TestResult[]> {
  const tester = new NewsServiceTester();
  return await tester.runAllTests();
}

export async function testNewsServiceHealth(): Promise<TestResult> {
  const tester = new NewsServiceTester();
  await tester['testHealthCheck']();
  const results = tester.getResults();
  return results.find(r => r.testName === 'Health Check') || {
    testName: 'Health Check',
    success: false,
    message: 'Test not executed',
  };
}

