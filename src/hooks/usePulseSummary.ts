'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { PulseSummary } from '@/types/api';

interface UsePulseSummaryReturn {
  summary: PulseSummary | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => Promise<PulseSummary | undefined>;
}

/**
 * Hook to fetch pulse dashboard summary data
 * Returns watchlist health, sector exposure, and red flag categories
 * Cached for 60 seconds
 */
export function usePulseSummary(): UsePulseSummaryReturn {
  const { data, error, isLoading, mutate } = useSWR<PulseSummary, Error>(
    '/pulse/summary',
    async (url: string): Promise<PulseSummary> => {
      const response = await api.get<PulseSummary>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch pulse summary');
      }
      return response.data;
    },
    {
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  return {
    summary: data ?? null,
    isLoading,
    error: error ?? null,
    mutate: () => mutate(),
  };
}
