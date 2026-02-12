'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { RedFlagHistory, PaginatedResponse } from '@/types/api';

interface UseRedFlagHistoryParams {
  ticker: string;
  limit?: number;
  offset?: number;
  shouldFetch?: boolean;
}

interface UseRedFlagHistoryReturn {
  history: RedFlagHistory[];
  total: number;
  hasMore: boolean;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch paginated red flag history for a stock
 * @param ticker - Stock ticker symbol
 * @param limit - Number of items per page (default: 25)
 * @param offset - Number of items to skip for pagination (default: 0)
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns History array, pagination metadata, loading/error states, and mutate function
 */
export function useRedFlagHistory({
  ticker,
  limit = 25,
  offset = 0,
  shouldFetch = true
}: UseRedFlagHistoryParams): UseRedFlagHistoryReturn {
  // Build query string for pagination
  const queryParams = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  const endpoint = `/stocks/${ticker}/red-flags/history?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<RedFlagHistory>,
    Error
  >(
    shouldFetch && ticker ? endpoint : null,
    async (url: string): Promise<PaginatedResponse<RedFlagHistory>> => {
      const response = await api.get<PaginatedResponse<RedFlagHistory>>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch red flag history');
      }
      return response.data;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000, // Cache for 60 seconds (historical data changes less frequently)
    }
  );

  return {
    history: data?.items ?? [],
    total: data?.pagination.total ?? 0,
    hasMore: data?.pagination.has_more ?? false,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
