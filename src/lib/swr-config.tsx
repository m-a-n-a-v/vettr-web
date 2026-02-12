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
        errorRetryCount: 3, // Retry failed requests up to 3 times
        errorRetryInterval: 5000, // Wait 5s between retries
        shouldRetryOnError: true, // Enable automatic retry on error

        // Cache time settings
        // Data is considered fresh for 60s, stale for 5 minutes before being garbage collected
      }}
    >
      {children}
    </SWRConfig>
  );
}
