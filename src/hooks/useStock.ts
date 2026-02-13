/**
 * useStock Hook
 *
 * Fetches a single stock by ticker from the VETTR backend API.
 * Uses SWR for caching and automatic revalidation.
 */

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Stock, ApiResponse } from '@/types/api';

interface UseStockResult {
  stock: Stock | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Fetcher function for SWR
 */
async function fetchStock(url: string): Promise<Stock> {
  const response = await api.get<Stock>(url);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch stock');
  }

  return response.data;
}

/**
 * Hook to fetch a single stock by ticker
 *
 * @param ticker - Stock ticker symbol (e.g., 'AAPL')
 * @param shouldFetch - Optional flag to enable/disable fetching (default: true)
 */
export function useStock(ticker: string | null, shouldFetch: boolean = true): UseStockResult {
  const endpoint = ticker ? `/stocks/${ticker}` : null;

  // Use SWR for data fetching
  // If ticker is null or shouldFetch is false, SWR will not fetch
  const { data, error, mutate, isLoading } = useSWR<Stock, Error>(
    shouldFetch && endpoint ? endpoint : null,
    fetchStock,
    {
      dedupingInterval: 30000, // Cache individual stock for 30s
    }
  );

  return {
    stock: data || null,
    isLoading,
    isError: !!error,
    error: error || null,
    mutate,
  };
}
