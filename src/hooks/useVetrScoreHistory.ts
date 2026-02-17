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
  // Convert period string (e.g., '6M', '12M') to months number for backend API
  const months = period ? parseInt(period.replace('M', ''), 10) || 6 : 6;
  const endpoint = `/stocks/${ticker}/vetr-score/history?months=${months}`;

  const { data, error, isLoading, mutate } = useSWR<VetrScoreHistory[], Error>(
    shouldFetch && ticker ? endpoint : null,
    async (url: string): Promise<VetrScoreHistory[]> => {
      const response = await api.get<any>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch VETTR score history');
      }

      // Backend returns flat array of history entries; transform to expected shape
      const rawData = Array.isArray(response.data) ? response.data : [];
      const historyPoints: VetrScoreHistory['history'] = rawData.map((entry: any) => ({
        date: entry.calculated_at || entry.date,
        score: entry.overall_score ?? entry.score ?? 0,
        financial_survival_score: entry.financial_survival_score,
        operational_efficiency_score: entry.operational_efficiency_score,
        shareholder_structure_score: entry.shareholder_structure_score,
        market_sentiment_score: entry.market_sentiment_score,
      }));

      // Sort by date ascending for chart display
      historyPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      // Return as a single-element array with the expected structure
      return [{
        ticker,
        history: historyPoints,
        time_range: period || '6M',
      }];
    },
    {
      dedupingInterval: 120000, // Cache for 2 min — historical data rarely changes
    }
  );

  return {
    history: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}
