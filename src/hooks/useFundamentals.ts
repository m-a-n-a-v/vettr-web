'use client';

import { useState, useEffect } from 'react';
import { getDummyFundamentals } from '@/lib/dummy-fundamentals';
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

/**
 * Hook to fetch fundamentals data for a stock
 * Currently uses dummy data generator. Swap to SWR-based API call when backend is ready.
 *
 * @param ticker - Stock ticker symbol
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns Fundamentals data with financial health, earnings quality, analyst consensus, peer comparison, loading/error states
 */
export function useFundamentals({
  ticker,
  shouldFetch = true
}: UseFundamentalsParams): UseFundamentalsReturn {
  const [data, setData] = useState<FundamentalsData | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | undefined>(undefined);

  useEffect(() => {
    if (!shouldFetch || !ticker) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(undefined);

    // Simulate network delay (300-500ms)
    const delay = 300 + Math.random() * 200;
    const timeoutId = setTimeout(() => {
      try {
        const fundamentalsData = getDummyFundamentals(ticker);
        setData(fundamentalsData);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load fundamentals'));
        setIsLoading(false);
      }
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [ticker, shouldFetch]);

  // TODO: Replace dummy data with real API call using SWR
  // Future implementation:
  /*
  const { data, error, isLoading } = useSWR<FundamentalsData, Error>(
    shouldFetch && ticker ? `/stocks/${ticker}/fundamentals` : null,
    async (url: string): Promise<FundamentalsData> => {
      const response = await api.get<FundamentalsData>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch fundamentals data');
      }
      return response.data;
    },
    {
      dedupingInterval: 60000, // Cache fundamentals for 60s
    }
  );

  return {
    data: data ?? undefined,
    isLoading,
    error: error ?? undefined,
  };
  */

  return {
    data,
    isLoading,
    error,
  };
}
