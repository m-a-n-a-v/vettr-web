/**
 * VETTR API Client
 *
 * Typed fetch wrapper with JWT token management, automatic refresh, and error handling.
 * Connects to the VETTR backend at https://vettr-backend.vercel.app/v1
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://vettr-backend.vercel.app/v1';

// Token storage keys
const ACCESS_TOKEN_KEY = 'vettr_access_token';
const REFRESH_TOKEN_KEY = 'vettr_refresh_token';

// Type definitions for API responses
export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    request_id: string;
  };
}

export interface PaginationMeta {
  total: number;
  limit: number;
  offset: number;
  has_more: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface PaginatedResponse<T> extends ApiResponse {
  data: PaginatedData<T>;
}

// Import types from centralized types file
import type { AuthResponse as ApiAuthResponse, User } from '@/types/api';

// Auth response types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Re-map the backend auth response to camelCase for convenience in the API client
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Request options
export interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  skipRefresh?: boolean;
  retryCount?: number; // Internal: tracks retry attempts for rate limiting
  timeout?: number; // Request timeout in milliseconds (default: 30000)
}

// Interceptor types
type RequestInterceptor = (url: string, options: ApiRequestOptions) => Promise<{ url: string; options: ApiRequestOptions }> | { url: string; options: ApiRequestOptions };
type ResponseInterceptor = <T>(response: ApiResponse<T>, url: string, options: ApiRequestOptions) => Promise<ApiResponse<T>> | ApiResponse<T>;

// Interceptor storage
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

// Request deduplication cache
interface PendingRequest {
  promise: Promise<ApiResponse<unknown>>;
  timestamp: number;
}
const pendingRequests = new Map<string, PendingRequest>();
const DEDUPLICATION_WINDOW_MS = 2000; // 2s dedup window — prevents same request within 2s

// ─── Global Request Throttler ───────────────────────────────────────────────
// Spaces out concurrent API calls to avoid hitting rate limits.
// Instead of firing 10 requests simultaneously, they are staggered.
const MAX_CONCURRENT_REQUESTS = 3; // Max in-flight requests at once
const REQUEST_STAGGER_MS = 200; // Minimum ms between request dispatches
let activeRequestCount = 0;
let lastRequestTime = 0;

function acquireRequestSlot(): Promise<void> {
  return new Promise<void>((resolve) => {
    const tryAcquire = () => {
      const now = Date.now();
      const timeSinceLastRequest = now - lastRequestTime;

      if (activeRequestCount < MAX_CONCURRENT_REQUESTS && timeSinceLastRequest >= REQUEST_STAGGER_MS) {
        activeRequestCount++;
        lastRequestTime = Date.now();
        resolve();
      } else {
        // Wait for the stagger interval or for a slot to free up
        const waitTime = Math.max(
          REQUEST_STAGGER_MS - timeSinceLastRequest,
          activeRequestCount >= MAX_CONCURRENT_REQUESTS ? 100 : 0
        );
        setTimeout(tryAcquire, Math.max(waitTime, 50));
      }
    };
    tryAcquire();
  });
}

function releaseRequestSlot(): void {
  activeRequestCount = Math.max(0, activeRequestCount - 1);
}
// ─── End Global Request Throttler ───────────────────────────────────────────

// Token refresh mutex to prevent multiple simultaneous refresh calls
let refreshPromise: Promise<AuthTokens | null> | null = null;

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Set tokens in localStorage
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Clear tokens from localStorage
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Refresh access token using refresh token with mutex to prevent multiple simultaneous calls
 */
async function refreshAccessToken(): Promise<AuthTokens | null> {
  // If a refresh is already in progress, return that promise
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  // Create the refresh promise and store it
  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        return null;
      }

      const data: ApiResponse<{ access_token: string; refresh_token: string }> = await response.json();

      if (data.success && data.data) {
        const tokens: AuthTokens = {
          accessToken: data.data.access_token,
          refreshToken: data.data.refresh_token,
        };
        setTokens(tokens.accessToken, tokens.refreshToken);
        return tokens;
      }

      clearTokens();
      return null;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Token refresh failed:', error);
      }
      clearTokens();
      return null;
    } finally {
      // Clear the promise after completion
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Show a toast notification for rate limiting (if toast context is available)
 */
function showRateLimitToast(retryAfterSeconds: number): void {
  if (typeof window !== 'undefined') {
    // Dispatch a custom event that the toast context can listen to
    // This avoids circular dependencies and keeps the API client independent
    window.dispatchEvent(new CustomEvent('api:rate-limit', {
      detail: { retryAfterSeconds }
    }));
  }
}

/**
 * Get a cache key for request deduplication
 */
function getRequestCacheKey(url: string, method: string): string {
  return `${method}:${url}`;
}

/**
 * Get a better error message based on response status
 */
function getErrorMessage(status: number, defaultMessage: string): string {
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Authentication required. Please log in.';
    case 403:
      return 'Access denied. You do not have permission to perform this action.';
    case 404:
      return 'Not found. The requested resource does not exist.';
    case 408:
      return 'Request timeout. Please try again.';
    case 429:
      return 'Too many requests. Please slow down and try again later.';
    case 500:
      return 'Server error. Our team has been notified.';
    case 502:
      return 'Unable to connect to server. Please try again.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    case 504:
      return 'Gateway timeout. The server took too long to respond.';
    default:
      return defaultMessage || 'An unexpected error occurred.';
  }
}

/**
 * Create a fetch request with timeout using AbortController
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit & { timeout?: number }
): Promise<Response> {
  const { timeout = 30000, ...fetchOptions } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout. Please try again.');
    }
    throw error;
  }
}

/**
 * Main API client function
 *
 * @param endpoint - API endpoint (e.g., '/stocks', '/auth/login')
 * @param options - Request options including requiresAuth flag
 * @returns Typed API response
 */
export async function apiClient<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const {
    requiresAuth = true,
    skipRefresh = false,
    retryCount = 0,
    timeout = 30000,
    headers = {},
    ...fetchOptions
  } = options;

  // Build full URL
  let url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  let requestOptions: ApiRequestOptions = { ...options, requiresAuth, skipRefresh, retryCount, timeout, headers, ...fetchOptions };

  // Run request interceptors
  for (const interceptor of requestInterceptors) {
    const result = await interceptor(url, requestOptions);
    url = result.url;
    requestOptions = result.options;
  }

  // Check for pending duplicate request (deduplication)
  const method = (requestOptions.method || 'GET').toUpperCase();
  const cacheKey = getRequestCacheKey(url, method);
  const now = Date.now();

  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest && (now - pendingRequest.timestamp) < DEDUPLICATION_WINDOW_MS) {
    // Return the existing promise for this request
    return pendingRequest.promise as Promise<ApiResponse<T>>;
  }

  // Create the actual request promise
  const requestPromise = (async (): Promise<ApiResponse<T>> => {
    // Build headers
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(requestOptions.headers as Record<string, string>),
    };

    // Add Authorization header if auth is required
    if (requestOptions.requiresAuth) {
      const accessToken = getAccessToken();
      if (accessToken) {
        requestHeaders['Authorization'] = `Bearer ${accessToken}`;
      }
    }

    // Acquire a throttle slot before making the request
    await acquireRequestSlot();

    try {
      // Make the request with timeout
      const response = await fetchWithTimeout(url, {
        ...fetchOptions,
        headers: requestHeaders,
        timeout: requestOptions.timeout,
      });

      // Handle 401 Unauthorized - attempt token refresh
      if (response.status === 401 && requestOptions.requiresAuth && !requestOptions.skipRefresh) {
        const tokens = await refreshAccessToken();

        if (tokens) {
          // Retry the original request with new token
          return apiClient<T>(endpoint, { ...options, skipRefresh: true });
        } else {
          // Refresh failed — return error without redirecting.
          // Pages/components handle AUTH_REQUIRED gracefully
          // (e.g., show LoginPrompt) instead of forcing a redirect.
          return {
            success: false,
            error: {
              code: 'AUTH_REQUIRED',
              message: 'Authentication required. Please log in.',
            },
          };
        }
      }

      // Handle 429 Too Many Requests - return error immediately, NO internal retries
      // SWR will handle retry scheduling at its own (slower) pace
      if (response.status === 429) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[API] Rate limited (429) for ${url}. No retry — SWR will handle revalidation.`);
        }
        showRateLimitToast(5);
        return {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: 'Rate limit exceeded. Please try again later.',
          },
        };
      }

      // Parse response
      let data: ApiResponse<T>;
      try {
        data = await response.json();
      } catch (parseError) {
        // If JSON parsing fails, create error response
        return {
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: getErrorMessage(response.status, 'Failed to parse server response'),
          },
        };
      }

      // Check if response indicates failure
      if (!response.ok || !data.success) {
        return {
          success: false,
          error: data.error || {
            code: `HTTP_${response.status}`,
            message: getErrorMessage(response.status, response.statusText || 'An error occurred'),
          },
        };
      }

      // Run response interceptors
      let finalResponse: ApiResponse<T> = data;
      for (const interceptor of responseInterceptors) {
        finalResponse = await interceptor(finalResponse, url, requestOptions);
      }

      return finalResponse;
    } catch (error) {
      // Network or timeout error
      if (process.env.NODE_ENV === 'development') {
        console.error('API request failed:', error);
      }

      // Check if it's a timeout error
      if (error instanceof Error && error.message.includes('timeout')) {
        return {
          success: false,
          error: {
            code: 'TIMEOUT_ERROR',
            message: 'Request timeout. Please try again.',
          },
        };
      }

      // Network error
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Unable to connect to server. Please check your internet connection.',
        },
      };
    } finally {
      // Always release the throttle slot when request completes
      releaseRequestSlot();
    }
  })();

  // Store in deduplication cache
  pendingRequests.set(cacheKey, {
    promise: requestPromise as Promise<ApiResponse<unknown>>,
    timestamp: now,
  });

  // Clean up cache entry after request completes
  requestPromise.finally(() => {
    setTimeout(() => {
      const cachedRequest = pendingRequests.get(cacheKey);
      if (cachedRequest && cachedRequest.timestamp === now) {
        pendingRequests.delete(cacheKey);
      }
    }, DEDUPLICATION_WINDOW_MS);
  });

  return requestPromise;
}

/**
 * Convenience methods for common HTTP methods
 */
export const api = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
};

/**
 * Auth-specific API methods
 */
export const authApi = {
  /**
   * Login with email and password
   */
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiAuthResponse>('/auth/login', { email, password }, { requiresAuth: false });

    if (response.success && response.data) {
      // Convert snake_case API response to camelCase
      const authData: AuthResponse = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        user: response.data.user,
      };
      setTokens(authData.accessToken, authData.refreshToken);
      return { ...response, data: authData };
    }

    return { success: false, error: response.error };
  },

  /**
   * Sign up with email, password, and display name
   */
  signup: async (email: string, password: string, displayName: string): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiAuthResponse>('/auth/signup', { email, password, display_name: displayName }, { requiresAuth: false });

    if (response.success && response.data) {
      // Convert snake_case API response to camelCase
      const authData: AuthResponse = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        user: response.data.user,
      };
      setTokens(authData.accessToken, authData.refreshToken);
      return { ...response, data: authData };
    }

    return { success: false, error: response.error };
  },

  /**
   * Logout - clears tokens and calls backend logout endpoint
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout', {}, { requiresAuth: true });
    clearTokens();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  /**
   * Refresh tokens manually
   */
  refresh: async (): Promise<AuthTokens | null> => {
    return refreshAccessToken();
  },
};

/**
 * Interceptor management API
 *
 * Allows adding request and response interceptors for extensibility
 */
export const interceptors = {
  /**
   * Add a request interceptor
   * @param interceptor - Function that receives and can modify URL and options before the request
   * @returns Function to remove the interceptor
   */
  addRequestInterceptor: (interceptor: RequestInterceptor): (() => void) => {
    requestInterceptors.push(interceptor);
    return () => {
      const index = requestInterceptors.indexOf(interceptor);
      if (index > -1) {
        requestInterceptors.splice(index, 1);
      }
    };
  },

  /**
   * Add a response interceptor
   * @param interceptor - Function that receives and can modify the response
   * @returns Function to remove the interceptor
   */
  addResponseInterceptor: (interceptor: ResponseInterceptor): (() => void) => {
    responseInterceptors.push(interceptor);
    return () => {
      const index = responseInterceptors.indexOf(interceptor);
      if (index > -1) {
        responseInterceptors.splice(index, 1);
      }
    };
  },

  /**
   * Clear all request interceptors
   */
  clearRequestInterceptors: (): void => {
    requestInterceptors.length = 0;
  },

  /**
   * Clear all response interceptors
   */
  clearResponseInterceptors: (): void => {
    responseInterceptors.length = 0;
  },
};
