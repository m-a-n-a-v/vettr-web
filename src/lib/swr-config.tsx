/**
 * SWR Configuration Provider
 *
 * Configures SWR with sensible defaults for caching and revalidation.
 */

'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Cache settings — generous deduplication to stay within 60 req/min rate limit
        dedupingInterval: 30000, // Prevent duplicate requests within 30s
        focusThrottleInterval: 60000, // Throttle revalidation on focus to once per 60s

        // Revalidation settings — conservative to avoid rate limiting
        revalidateOnFocus: false, // Disabled globally — pages can opt-in per-hook if needed
        revalidateOnReconnect: true, // Revalidate when network reconnects (rare event)
        revalidateIfStale: true, // Revalidate if data is stale

        // Error retry settings — conservative to avoid compounding 429s
        errorRetryCount: 2,
        errorRetryInterval: 10000, // 10s between retries
        shouldRetryOnError: true,
        onErrorRetry: (error: { status?: number; code?: string }, key, config, revalidate, { retryCount }) => {
          // Never retry on 404
          if (error.status === 404) return;

          // Never retry on Rate Limit — wait for user to manually refresh or next scheduled revalidation
          if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') return;

          // Never retry on auth errors
          if (error.status === 401 || error.status === 403) return;

          // Only retry up to 2 times
          if (retryCount >= 2) return;

          // Retry with increasing delay (10s, 20s)
          setTimeout(() => revalidate({ retryCount }), 10000 * (retryCount + 1));
        },

        // Cache time settings
        // Data is considered fresh for 60s, stale for 5 minutes before being garbage collected
      }}
    >
      {children}
    </SWRConfig>
  );
}
