/**
 * BharathVA News Service
 * Service for fetching news articles from the News AI backend
 * Includes retry logic, connection validation, and comprehensive error handling
 */

import { getNewsServiceURL, getTimeout, isLoggingEnabled } from './environment';

const API_CONFIG = {
  BASE_URL: getNewsServiceURL(),
  TIMEOUT: getTimeout(),
  ENABLE_LOGGING: isLoggingEnabled(),
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
};

export interface NewsItem {
  id: number;
  url: string;
  title: string;
  description?: string;
  content?: string;
  summary?: string;
  imageUrl?: string;
  author?: string;
  category?: string;
  source?: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsResponse {
  content: NewsItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface NewsApiError {
  code: string;
  message: string;
  details?: any;
}

export interface NewsDetailResponse {
  id: number;
  title: string;
  description?: string;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  source?: string;
  link: string;
  publishedAt: string;
  createdAt: string;
}

const log = (message: string, data?: any) => {
  if (API_CONFIG.ENABLE_LOGGING) {
    console.log(`[NewsService] ${message}`, data || '');
  }
};

const logError = (message: string, error?: any) => {
  if (API_CONFIG.ENABLE_LOGGING) {
    console.error(`[NewsService] ${message}`, error || '');
  }
};

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString();
  const retryablePatterns = [
    'Network request failed',
    'timeout',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND',
    'AbortError',
  ];
  
  return retryablePatterns.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

const fetchNewsWithRetry = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount: number = 0
): Promise<T> => {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const startTime = Date.now();

  log(`Fetching: ${options.method || 'GET'} ${url}${retryCount > 0 ? ` (retry ${retryCount}/${API_CONFIG.MAX_RETRIES})` : ''}`);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    log(`Response: ${response.status} (${duration}ms)`);

    if (!response.ok) {
      const contentType = response.headers.get('content-type') || '';
      let errorText = '';
      
      if (contentType.includes('application/json')) {
        try {
          const errorJson = await response.json();
          errorText = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorText = await response.text();
        }
      } else {
        errorText = await response.text();
        if (errorText.includes('<!DOCTYPE') || errorText.includes('<html')) {
          if (response.status === 404) {
            errorText = `Endpoint not found: ${endpoint}. Please verify the news service is running on port 8083.`;
          } else {
            errorText = `Server returned HTML error page (HTTP ${response.status}). The news service may not be properly configured.`;
          }
        }
      }
      
      logError(`API Error: ${response.status}`, errorText.substring(0, 200));
      
      if (response.status >= 500 && retryCount < API_CONFIG.MAX_RETRIES) {
        log(`Server error ${response.status}, retrying...`);
        await sleep(API_CONFIG.RETRY_DELAY * (retryCount + 1));
        return fetchNewsWithRetry(endpoint, options, retryCount + 1);
      }
      
      if (response.status === 404) {
        throw new Error(`News endpoint not found (404). Please ensure the news-ai service is running and accessible on port 8083. URL: ${url}`);
      }
      
      throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`);
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      logError(`Unexpected content type: ${contentType}`, text.substring(0, 200));
      throw new Error(`Server returned non-JSON response. Expected JSON but got ${contentType}`);
    }

    const data = await response.json();
    log(`Success: ${duration}ms`);

    return data;
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logError(`Request failed after ${duration}ms`, error);

    if (error.name === 'AbortError') {
      if (retryCount < API_CONFIG.MAX_RETRIES) {
        log(`Timeout error, retrying...`);
        await sleep(API_CONFIG.RETRY_DELAY * (retryCount + 1));
        return fetchNewsWithRetry(endpoint, options, retryCount + 1);
      }
      throw new Error('Request timeout. Please check your connection.');
    }

    if (isRetryableError(error) && retryCount < API_CONFIG.MAX_RETRIES) {
      log(`Retryable error detected, retrying...`);
      await sleep(API_CONFIG.RETRY_DELAY * (retryCount + 1));
      return fetchNewsWithRetry(endpoint, options, retryCount + 1);
    }

    if (error.message && error.message.includes('Network request failed')) {
      throw new Error('Network request failed. Please check your internet connection and ensure the news service is running on port 8083.');
    }

    throw error;
  }
};

const fetchNews = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  return fetchNewsWithRetry<T>(endpoint, options, 0);
};

export const newsService = {
  /**
   * Get all news articles with pagination
   */
  getAllNews: async (
    page: number = 0,
    size: number = 20,
    category?: string,
    source?: string,
    search?: string
  ): Promise<NewsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (category) params.append('category', category);
    if (source) params.append('source', source);
    if (search) params.append('search', search);

    return fetchNews<NewsResponse>(`/api/news?${params.toString()}`);
  },

  /**
   * Get a single news article by ID
   */
  getNewsById: async (id: number): Promise<NewsItem> => {
    return fetchNews<NewsItem>(`/api/news/${id}`);
  },

  /**
   * Get recent news articles (within specified hours)
   */
  getRecentNews: async (
    page: number = 0,
    size: number = 20,
    hours: number = 24
  ): Promise<NewsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      hours: hours.toString(),
    });

    return fetchNews<NewsResponse>(`/api/news/recent?${params.toString()}`);
  },

  /**
   * Get trending news articles
   */
  getTrendingNews: async (
    page: number = 0,
    size: number = 20
  ): Promise<NewsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    return fetchNews<NewsResponse>(`/api/news/trending?${params.toString()}`);
  },

  /**
   * Get news article with AI-generated detailed summary
   */
  getNewsWithSummary: async (id: number): Promise<NewsDetailResponse> => {
    log(`Fetching news with AI summary for ID: ${id}`);
    return fetchNews<NewsDetailResponse>(`/api/news/${id}/summary`);
  },
};

