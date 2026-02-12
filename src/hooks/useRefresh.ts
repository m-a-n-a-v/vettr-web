/**
 * useRefresh Hook
 *
 * Manages manual data refresh with debouncing and last refreshed timestamp tracking.
 * Used for both desktop refresh button and mobile pull-to-refresh.
 */

import { useState, useCallback, useRef } from 'react';

interface UseRefreshOptions {
  onRefresh: () => Promise<void> | void;
  debounceMs?: number; // Minimum time between refreshes
}

interface UseRefreshResult {
  isRefreshing: boolean;
  lastRefreshed: Date | null;
  handleRefresh: () => Promise<void>;
  canRefresh: boolean;
}

/**
 * Hook to manage refresh state with debouncing
 */
export function useRefresh(options: UseRefreshOptions): UseRefreshResult {
  const { onRefresh, debounceMs = 5000 } = options;
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const lastRefreshTime = useRef<number>(0);

  const handleRefresh = useCallback(async () => {
    const now = Date.now();
    const timeSinceLastRefresh = now - lastRefreshTime.current;

    // Check if we can refresh (debounce)
    if (timeSinceLastRefresh < debounceMs) {
      return;
    }

    setIsRefreshing(true);
    lastRefreshTime.current = now;

    try {
      await onRefresh();
      setLastRefreshed(new Date());
    } catch (error) {
      console.error('Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [onRefresh, debounceMs]);

  const canRefresh = Date.now() - lastRefreshTime.current >= debounceMs;

  return {
    isRefreshing,
    lastRefreshed,
    handleRefresh,
    canRefresh,
  };
}
