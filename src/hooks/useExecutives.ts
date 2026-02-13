'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Executive, PaginatedResponse } from '@/types/api';

interface UseExecutivesParams {
  ticker?: string; // Filter by stock ticker
  search?: string; // Search by name
  limit?: number;
  offset?: number;
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
 * Hook to fetch executives list with optional filtering by ticker and search query
 * Supports pagination with limit/offset
 */
export function useExecutives(
  params: UseExecutivesParams = {}
): UseExecutivesReturn {
  const { ticker, search, limit = 25, offset = 0 } = params;

  // Build query string based on whether we're searching or listing
  const queryParams = new URLSearchParams();

  // If search query is provided, use search endpoint
  if (search) {
    queryParams.append('q', search);
  }

  // Add ticker filter if provided
  if (ticker) {
    queryParams.append('ticker', ticker);
  }

  queryParams.append('limit', limit.toString());
  queryParams.append('offset', offset.toString());

  const queryString = queryParams.toString();
  // Use search endpoint if search query exists, otherwise use list endpoint
  const endpoint = search ? '/executives/search' : '/executives';
  const key = queryString ? `${endpoint}?${queryString}` : endpoint;

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
  >(key, fetcher, {
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
