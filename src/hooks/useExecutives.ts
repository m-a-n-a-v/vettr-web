'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Executive, PaginatedResponse } from '@/types/api';

interface UseExecutivesParams {
  ticker?: string; // Stock ticker (required for data fetch)
  search?: string; // Search by name (used for search endpoint)
  limit?: number;
  offset?: number;
  shouldFetch?: boolean; // Conditionally skip fetching (default: true)
}

interface UseExecutivesReturn {
  executives: Executive[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch executives for a stock ticker
 * Uses /stocks/:ticker/executives endpoint (paginated)
 * Falls back to /executives/search when search query is provided
 */
export function useExecutives(
  params: UseExecutivesParams = {}
): UseExecutivesReturn {
  const { ticker, search, limit = 25, offset = 0, shouldFetch = true } = params;

  // Determine the endpoint based on whether we have a ticker and/or search
  let key: string | null = null;

  if (ticker && search) {
    // Search executives by name within the stock context
    // Use the search endpoint with ticker filter
    const queryParams = new URLSearchParams({
      q: search,
      limit: limit.toString(),
    });
    key = `/executives/search?${queryParams.toString()}`;
  } else if (ticker) {
    // Fetch all executives for a stock — uses /stocks/:ticker/executives
    key = `/stocks/${ticker}/executives`;
  }

  const fetcher = async (url: string): Promise<PaginatedResponse<Executive>> => {
    const response = await api.get<PaginatedResponse<Executive>>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch executives');
    }
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Executive>,
    Error
  >(shouldFetch ? key : null, fetcher, {
    dedupingInterval: 60000, // Cache executives list for 60s
  });

  return {
    executives: data?.items || [],
    pagination: data?.pagination
      ? {
          total: data.pagination.total,
          limit: data.pagination.limit,
          offset: data.pagination.offset,
          hasMore: data.pagination.has_more,
        }
      : null,
    isLoading,
    error: error || null,
    mutate,
  };
}
