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
        // Cache settings — generous deduplication to stay within rate limits
        dedupingInterval: 60000, // Prevent duplicate requests within 60s
        focusThrottleInterval: 120000, // Throttle revalidation on focus to once per 2min

        // Revalidation settings — very conservative to avoid rate limiting
        revalidateOnFocus: false, // Disabled globally — never revalidate on tab focus
        revalidateOnReconnect: false, // Don't revalidate on reconnect — user can manually refresh
        revalidateIfStale: false, // CRITICAL: Don't auto-revalidate stale data on mount — this was causing the storm
        // When navigating between pages, SWR was refiring ALL stale keys from previously visited pages.
        // Users can manually refresh; data is refreshed on explicit mutate() calls only.

        // Error retry settings — conservative to avoid compounding 429s
        errorRetryCount: 1,
        errorRetryInterval: 15000, // 15s between retries
        shouldRetryOnError: true,
        onErrorRetry: (error: { status?: number; code?: string }, key, config, revalidate, { retryCount }) => {
          // Never retry on 404
          if (error.status === 404) return;

          // Never retry on Rate Limit — wait for user to manually refresh or next scheduled revalidation
          if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') return;

          // Never retry on auth errors
          if (error.status === 401 || error.status === 403) return;

          // Only retry once
          if (retryCount >= 1) return;

          // Retry with 15s delay
          setTimeout(() => revalidate({ retryCount }), 15000);
        },

        // Cache time settings
        // Data is considered fresh for 60s, stale for 5 minutes before being garbage collected
      }}
    >
      {children}
    </SWRConfig>
  );
}
