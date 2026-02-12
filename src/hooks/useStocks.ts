/**
 * useStocks Hook
 *
 * Fetches paginated stock list from the VETTR backend API.
 * Uses SWR for caching and automatic revalidation.
 */

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Stock, PaginatedResponse, ApiResponse } from '@/types/api';

interface UseStocksOptions {
  limit?: number;
  offset?: number;
  search?: string;
  sector?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

interface UseStocksResult {
  stocks: Stock[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  } | null;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Fetcher function for SWR
 */
async function fetchStocks(url: string): Promise<PaginatedResponse<Stock>> {
  const response = await api.get<PaginatedResponse<Stock>>(url);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to fetch stocks');
  }

  return response.data;
}

/**
 * Hook to fetch stocks with optional filters and pagination
 */
export function useStocks(options: UseStocksOptions = {}): UseStocksResult {
  const { limit = 25, offset = 0, search, sector, sort, order } = options;

  // Build query string
  const params = new URLSearchParams();
  params.set('limit', limit.toString());
  params.set('offset', offset.toString());

  if (search) params.set('q', search);
  if (sector) params.set('sector', sector);
  if (sort) params.set('sort', sort);
  if (order) params.set('order', order);

  const endpoint = `/stocks?${params.toString()}`;

  // Use SWR for data fetching
  const { data, error, mutate, isLoading } = useSWR<PaginatedResponse<Stock>, Error>(
    endpoint,
    fetchStocks,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // Prevent duplicate requests within 5s
    }
  );

  return {
    stocks: data?.items || [],
    pagination: data?.pagination
      ? {
          total: data.pagination.total,
          limit: data.pagination.limit,
          offset: data.pagination.offset,
          hasMore: data.pagination.has_more,
        }
      : null,
    isLoading,
    isError: !!error,
    error: error || null,
    mutate,
  };
}
