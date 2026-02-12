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
export function useRedFlagTrend(): UseRedFlagTrendReturn {
  const { data, error, isLoading, mutate } = useSWR<RedFlagTrend, Error>(
    '/red-flags/trend',
    async (url: string): Promise<RedFlagTrend> => {
      const response = await api.get<RedFlagTrend>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch red flag trend');
      }
      return response.data;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000, // Cache for 60 seconds (less frequent than stock-specific data)
    }
  );

  return {
    trend: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
