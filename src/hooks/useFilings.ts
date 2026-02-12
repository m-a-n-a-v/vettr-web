'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Filing, PaginatedResponse } from '@/types/api';

interface UseFilingsParams {
  ticker?: string; // Filter by stock ticker
  limit?: number;
  offset?: number;
  filingType?: string; // Filter by filing type
}

interface UseFilingsReturn {
  filings: Filing[];
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
 * Hook to fetch filings list with optional filtering by ticker and filing type
 * Supports pagination with limit/offset
 */
export function useFilings(params: UseFilingsParams = {}): UseFilingsReturn {
  const { ticker, limit = 25, offset = 0, filingType } = params;

  // Build query string
  const queryParams = new URLSearchParams();
  if (ticker) queryParams.append('ticker', ticker);
  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());
  if (filingType) queryParams.append('type', filingType);

  const queryString = queryParams.toString();
  const key = queryString ? `/filings?${queryString}` : '/filings';

  const fetcher = async (url: string): Promise<PaginatedResponse<Filing>> => {
    const response = await api.get<PaginatedResponse<Filing>>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch filings');
    }
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Filing>,
    Error
  >(key, fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 5000,
  });

  return {
    filings: data?.items || [],
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
