'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { FundamentalsData } from '@/types/fundamentals';

interface UseFundamentalsParams {
  ticker: string;
  shouldFetch?: boolean;
}

interface UseFundamentalsReturn {
  data: FundamentalsData | undefined;
  isLoading: boolean;
  error: Error | undefined;
}

async function fetchFundamentals(url: string): Promise<FundamentalsData> {
  const response = await api.get<FundamentalsData>(url);
  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch fundamentals data');
  }
  return response.data;
}

/**
 * Hook to fetch fundamentals data for a stock.
 * Uses SWR for caching and automatic revalidation.
 *
 * @param ticker - Stock ticker symbol
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 */
export function useFundamentals({
  ticker,
  shouldFetch = true,
}: UseFundamentalsParams): UseFundamentalsReturn {
  const endpoint = shouldFetch && ticker ? `/stocks/${ticker}/fundamentals` : null;

  const { data, error, isLoading } = useSWR<FundamentalsData, Error>(
    endpoint,
    fetchFundamentals,
    {
      dedupingInterval: 60000, // Cache fundamentals for 60s
    }
  );

  return {
    data: data ?? undefined,
    isLoading,
    error: error ?? undefined,
  };
}
