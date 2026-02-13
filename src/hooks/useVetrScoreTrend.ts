'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { VetrScoreTrend } from '@/types/api';

interface UseVetrScoreTrendParams {
  ticker: string;
  shouldFetch?: boolean;
}

interface UseVetrScoreTrendReturn {
  trend: VetrScoreTrend | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch VETTR score trend analysis for a stock
 * @param ticker - Stock ticker symbol
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns Trend object with direction, momentum, and recent changes
 */
export function useVetrScoreTrend({
  ticker,
  shouldFetch = true
}: UseVetrScoreTrendParams): UseVetrScoreTrendReturn {
  const { data, error, isLoading, mutate } = useSWR<VetrScoreTrend, Error>(
    shouldFetch && ticker ? `/stocks/${ticker}/vetr-score/trend` : null,
    async (url: string): Promise<VetrScoreTrend> => {
      const response = await api.get<VetrScoreTrend>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch VETTR score trend');
      }
      return response.data;
    },
    {
      dedupingInterval: 120000, // Cache for 2 min — trend data rarely changes
    }
  );

  return {
    trend: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
