'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';

interface UseUnreadAlertCountReturn {
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch the unread alert count for display in navigation badges.
 * Polls every 60 seconds for fresh data.
 */
export function useUnreadAlertCount(): UseUnreadAlertCountReturn {
  const { data, error, isLoading, mutate } = useSWR<number, Error>(
    '/alerts/unread-count',
    async (url: string): Promise<number> => {
      const response = await api.get<Record<string, unknown>>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch unread count');
      }
      return (response.data.unread_count as number) || 0;
    },
    {
      dedupingInterval: 30000, // Cache for 30s
      refreshInterval: 60000, // Poll every 60s
    }
  );

  return {
    unreadCount: data ?? 0,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
