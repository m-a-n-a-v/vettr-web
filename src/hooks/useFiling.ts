'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Filing, ApiResponse } from '@/types/api';

interface UseFilingParams {
  id: string;
  shouldFetch?: boolean; // Conditionally fetch (default: true)
}

interface UseFilingReturn {
  filing: Filing | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch a single filing by ID
 * @param id - Filing ID
 * @param shouldFetch - Whether to fetch the filing (default: true)
 */
export function useFiling(params: UseFilingParams): UseFilingReturn {
  const { id, shouldFetch = true } = params;

  // Only fetch if shouldFetch is true and id is provided
  const key = shouldFetch && id ? `/filings/${id}` : null;

  const fetcher = async (url: string): Promise<Filing> => {
    const response = await api.get<Filing>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch filing');
    }
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<Filing, Error>(
    key,
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate filing detail on focus
      dedupingInterval: 10000, // Cache for 10s
    }
  );

  return {
    filing: data || null,
    isLoading,
    error: error || null,
    mutate,
  };
}
