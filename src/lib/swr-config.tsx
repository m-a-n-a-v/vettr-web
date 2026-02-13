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
        // Cache settings
        dedupingInterval: 5000, // Prevent duplicate requests within 5s
        focusThrottleInterval: 10000, // Throttle revalidation on focus (10s)

        // Revalidation settings
        revalidateOnFocus: true, // Revalidate when window regains focus
        revalidateOnReconnect: true, // Revalidate when network reconnects
        revalidateIfStale: true, // Revalidate if data is stale

        // Error retry settings
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        shouldRetryOnError: true,
        onErrorRetry: (error: any, key, config, revalidate, { retryCount }) => {
          // Never retry on 404
          if (error.status === 404) return;

          // Never retry on Rate Limit (handled by api-client)
          if (error.status === 429 || error.code === 'RATE_LIMIT_EXCEEDED') return;

          // Only retry up to 3 times
          if (retryCount >= 3) return;

          // Retry after 5 seconds
          setTimeout(() => revalidate({ retryCount }), 5000);
        },

        // Cache time settings
        // Data is considered fresh for 60s, stale for 5 minutes before being garbage collected
      }}
    >
      {children}
    </SWRConfig>
  );
}
