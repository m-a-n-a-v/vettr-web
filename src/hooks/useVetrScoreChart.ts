'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';

export interface ScoreSnapshot {
  overall_score: number;
  financial_survival_score: number;
  operational_efficiency_score: number;
  shareholder_structure_score: number;
  market_sentiment_score: number;
  price: number | null;
  recorded_at: string;
}

interface ChartResponse {
  ticker: string;
  range: string;
  data_points: number;
  snapshots: ScoreSnapshot[];
}

interface UseVetrScoreChartParams {
  ticker: string;
  range?: '24h' | '7d' | '30d' | '90d';
  shouldFetch?: boolean;
}

interface UseVetrScoreChartReturn {
  snapshots: ScoreSnapshot[];
  dataPoints: number;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch VETTR score chart data (hourly snapshots)
 */
export function useVetrScoreChart({
  ticker,
  range = '24h',
  shouldFetch = true,
}: UseVetrScoreChartParams): UseVetrScoreChartReturn {
  const { data, error, isLoading, mutate } = useSWR<ChartResponse, Error>(
    shouldFetch && ticker ? `/stocks/${ticker}/vetr-score/chart?range=${range}` : null,
    async (url: string): Promise<ChartResponse> => {
      const response = await api.get<any>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch VETTR score chart data');
      }
      return response.data;
    },
    {
      dedupingInterval: 300000, // Cache for 5 min — hourly data doesn't change often
    }
  );

  return {
    snapshots: data?.snapshots ?? [],
    dataPoints: data?.data_points ?? 0,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
