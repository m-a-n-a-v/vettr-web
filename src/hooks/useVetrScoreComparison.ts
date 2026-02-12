'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { VetrScoreComparison } from '@/types/api';

interface UseVetrScoreComparisonParams {
  ticker: string;
  shouldFetch?: boolean;
}

interface UseVetrScoreComparisonReturn {
  comparison: VetrScoreComparison | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch VETTR score comparison with sector peers
 * @param ticker - Stock ticker symbol
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns Comparison object with peer scores, loading/error states, and mutate function
 */
export function useVetrScoreComparison({
  ticker,
  shouldFetch = true
}: UseVetrScoreComparisonParams): UseVetrScoreComparisonReturn {
  const { data, error, isLoading, mutate } = useSWR<VetrScoreComparison, Error>(
    shouldFetch && ticker ? `/stocks/${ticker}/vetr-score/compare` : null,
    async (url: string): Promise<VetrScoreComparison> => {
      const response = await api.get<VetrScoreComparison>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch VETTR score comparison');
      }
      return response.data;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000, // Cache for 60 seconds
    }
  );

  return {
    comparison: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
