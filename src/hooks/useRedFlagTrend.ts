'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { RedFlagTrend } from '@/types/api';

interface UseRedFlagTrendReturn {
  trend: RedFlagTrend | null;
  isLoading: boolean;
  error: Error | null;
  mutate: (data?: RedFlagTrend | Promise<RedFlagTrend> | ((currentData?: RedFlagTrend) => RedFlagTrend | Promise<RedFlagTrend>), shouldRevalidate?: boolean) => Promise<RedFlagTrend | undefined>;
}

/**
 * Hook to fetch global red flag trend data
 * @returns RedFlagTrend object with total active flags, 30-day change, and severity breakdown
 */
export function useRedFlagTrend(options?: { enabled?: boolean }): UseRedFlagTrendReturn {
  const enabled = options?.enabled ?? true;
  const { data, error, isLoading, mutate } = useSWR<RedFlagTrend, Error>(
    enabled ? '/red-flags/trend' : null,
    async (url: string): Promise<RedFlagTrend> => {
      const response = await api.get<RedFlagTrend>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch red flag trend');
      }
      return response.data;
    },
    {
      dedupingInterval: 120000, // Cache red flag trends for 2 min — aggregate data changes infrequently
    }
  );

  return {
    trend: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
