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
      const response = await api.get<any>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch VETTR score comparison');
      }

      const raw = response.data;

      // Map backend field names to frontend expected names
      return {
        ticker: raw.ticker,
        score: raw.overall_score ?? raw.score ?? 0,
        sector: raw.sector,
        sector_average: raw.sector_average ?? 0,
        percentile_rank: raw.percentile_rank ?? 0,
        peers: (raw.peers || []).map((peer: any) => ({
          ticker: peer.ticker,
          company_name: peer.name || peer.company_name || peer.ticker,
          score: peer.overall_score ?? peer.score ?? 0,
        })),
      };
    },
    {
      dedupingInterval: 120000, // Cache for 2 min — peer data rarely changes
    }
  );

  return {
    comparison: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
