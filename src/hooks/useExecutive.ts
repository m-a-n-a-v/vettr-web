'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Executive, ApiResponse } from '@/types/api';

interface UseExecutiveParams {
  id: string;
  shouldFetch?: boolean; // Conditionally fetch (default: true)
}

interface UseExecutiveReturn {
  executive: Executive | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch a single executive by ID
 * @param id - Executive ID
 * @param shouldFetch - Whether to fetch the executive (default: true)
 */
export function useExecutive(params: UseExecutiveParams): UseExecutiveReturn {
  const { id, shouldFetch = true } = params;

  // Only fetch if shouldFetch is true and id is provided
  const key = shouldFetch && id ? `/executives/${id}` : null;

  const fetcher = async (url: string): Promise<Executive> => {
    const response = await api.get<Executive>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch executive');
    }
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<Executive, Error>(
    key,
    fetcher,
    {
      revalidateOnFocus: false, // Don't revalidate executive detail on focus
      dedupingInterval: 10000, // Cache for 10s
    }
  );

  return {
    executive: data || null,
    isLoading,
    error: error || null,
    mutate,
  };
}
