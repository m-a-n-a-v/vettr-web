'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { RedFlagsResponse } from '@/types/api';

interface UseRedFlagsParams {
  ticker: string;
  shouldFetch?: boolean;
}

interface UseRedFlagsReturn {
  redFlags: RedFlagsResponse | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch red flags with composite score for a stock
 * @param ticker - Stock ticker symbol
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns RedFlagsResponse object with score and flags, loading/error states, and mutate function
 */
export function useRedFlags({
  ticker,
  shouldFetch = true
}: UseRedFlagsParams): UseRedFlagsReturn {
  const { data, error, isLoading, mutate } = useSWR<RedFlagsResponse, Error>(
    shouldFetch && ticker ? `/stocks/${ticker}/red-flags` : null,
    async (url: string): Promise<RedFlagsResponse> => {
      const response = await api.get<RedFlagsResponse>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch red flags');
      }
      return response.data;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    redFlags: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
