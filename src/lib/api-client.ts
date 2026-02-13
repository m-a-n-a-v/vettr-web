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
}

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
 * Refresh access token using refresh token
 */
async function refreshAccessToken(): Promise<AuthTokens | null> {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    return null;
  }

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
    console.error('Token refresh failed:', error);
    clearTokens();
    return null;
  }
}

/**
 * Sleep for a specified number of milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Calculate exponential backoff delay
 */
function getExponentialBackoffDelay(retryCount: number): number {
  // Base delay: 1 second, doubles with each retry (1s, 2s, 4s)
  return Math.min(1000 * Math.pow(2, retryCount), 8000); // Max 8 seconds
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
    headers = {},
    ...fetchOptions
  } = options;

  // Build full URL
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  // Build headers
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Add Authorization header if auth is required
  if (requiresAuth) {
    const accessToken = getAccessToken();
    if (accessToken) {
      requestHeaders['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  try {
    // Make the request
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    });

    // Handle 401 Unauthorized - attempt token refresh
    if (response.status === 401 && requiresAuth && !skipRefresh) {
      const tokens = await refreshAccessToken();

      if (tokens) {
        // Retry the original request with new token
        return apiClient<T>(endpoint, { ...options, skipRefresh: true });
      } else {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'Authentication required. Please log in.',
          },
        };
      }
    }

    // Handle 429 Too Many Requests - rate limiting
    if (response.status === 429 && retryCount < 5) {
      // Read Retry-After header (can be in seconds or HTTP date format)
      const retryAfterHeader = response.headers.get('Retry-After');
      let retryAfterMs = getExponentialBackoffDelay(retryCount);

      if (retryAfterHeader) {
        // Check if it's a number (seconds) or a date
        const retryAfterSeconds = parseInt(retryAfterHeader, 10);
        if (!isNaN(retryAfterSeconds)) {
          retryAfterMs = retryAfterSeconds * 1000;
        } else {
          // Try parsing as HTTP date
          const retryAfterDate = new Date(retryAfterHeader);
          if (!isNaN(retryAfterDate.getTime())) {
            retryAfterMs = Math.max(0, retryAfterDate.getTime() - Date.now());
          }
        }
      }

      // Cap retry delay at 2 minutes (120s) to prevent indefinite hangs, but allow for longer waits
      retryAfterMs = Math.min(retryAfterMs, 120000);

      console.warn(`[API] Rate limited (429). Retrying after ${Math.ceil(retryAfterMs / 1000)}s. Attempt ${retryCount + 1}/5`);

      // Show toast notification
      showRateLimitToast(Math.ceil(retryAfterMs / 1000));

      // Wait for the specified time
      await sleep(retryAfterMs);

      // Retry the request
      return apiClient<T>(endpoint, {
        ...options,
        retryCount: retryCount + 1,
      });
    }

    // If we've exhausted retries on 429, return error
    if (response.status === 429) {
      return {
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Rate limit exceeded. Please try again later.',
        },
      };
    }

    // Parse response
    const data: ApiResponse<T> = await response.json();

    // Check if response indicates failure
    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || {
          code: 'UNKNOWN_ERROR',
          message: response.statusText || 'An unknown error occurred',
        },
      };
    }

    return data;
  } catch (error) {
    // Network or parsing error
    console.error('API request failed:', error);
    return {
      success: false,
      error: {
        code: 'NETWORK_ERROR',
        message: error instanceof Error ? error.message : 'Network request failed',
      },
    };
  }
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
