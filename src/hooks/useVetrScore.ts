'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { VetrScore } from '@/types/api';

interface UseVetrScoreParams {
  ticker: string;
  shouldFetch?: boolean;
}

interface UseVetrScoreReturn {
  score: VetrScore | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch VETTR score with component breakdown for a stock
 * @param ticker - Stock ticker symbol
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns Score object, loading/error states, and mutate function
 */
export function useVetrScore({
  ticker,
  shouldFetch = true
}: UseVetrScoreParams): UseVetrScoreReturn {
  const { data, error, isLoading, mutate } = useSWR<VetrScore, Error>(
    shouldFetch && ticker ? `/stocks/${ticker}/vetr-score` : null,
    async (url: string): Promise<VetrScore> => {
      const response = await api.get<VetrScore>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch VETTR score');
      }
      return response.data;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    score: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
