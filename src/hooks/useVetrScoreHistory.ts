'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { VetrScoreHistory } from '@/types/api';

interface UseVetrScoreHistoryParams {
  ticker: string;
  period?: string;
  shouldFetch?: boolean;
}

interface UseVetrScoreHistoryReturn {
  history: VetrScoreHistory[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch VETTR score history for charting
 * @param ticker - Stock ticker symbol
 * @param period - Optional time period (e.g., '1M', '3M', '6M', '12M', '24M')
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns History array, loading/error states, and mutate function
 */
export function useVetrScoreHistory({
  ticker,
  period,
  shouldFetch = true
}: UseVetrScoreHistoryParams): UseVetrScoreHistoryReturn {
  // Build query string if period is provided
  const queryString = period ? `?period=${encodeURIComponent(period)}` : '';
  const endpoint = `/stocks/${ticker}/vetr-score/history${queryString}`;

  const { data, error, isLoading, mutate } = useSWR<VetrScoreHistory[], Error>(
    shouldFetch && ticker ? endpoint : null,
    async (url: string): Promise<VetrScoreHistory[]> => {
      const response = await api.get<VetrScoreHistory[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch VETTR score history');
      }
      return response.data;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000, // Cache for 60 seconds (historical data changes less frequently)
    }
  );

  return {
    history: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}
