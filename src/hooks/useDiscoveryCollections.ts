/**
 * useDiscoveryCollections Hook
 *
 * Fetches discovery collections from the VETTR backend API.
 * Uses SWR for caching and automatic revalidation.
 */

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { DiscoveryCollection, DiscoveryCollectionsData, ApiResponse } from '@/types/api';

interface UseDiscoveryCollectionsResult {
  collections: DiscoveryCollection[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

/**
 * Fetcher function for SWR
 */
async function fetchDiscoveryCollections(url: string): Promise<DiscoveryCollection[]> {
  const response = await api.get<DiscoveryCollectionsData>(url);

  if (!response.success || !response.data) {
    const error = new Error(response.error?.message || 'Failed to fetch discovery collections') as any;
    error.code = response.error?.code;
    error.status = response.error?.code === 'RATE_LIMIT_EXCEEDED' ? 429 : 500;
    throw error;
  }

  return response.data.collections;
}

/**
 * Hook to fetch discovery collections
 */
export function useDiscoveryCollections(): UseDiscoveryCollectionsResult {
  const endpoint = '/discovery/collections';

  // Use SWR for data fetching
  const { data, error, mutate, isLoading } = useSWR<DiscoveryCollection[], Error>(
    endpoint,
    fetchDiscoveryCollections,
    {
      dedupingInterval: 300000, // Cache collections for 5 minutes (300s) — collections change rarely
    }
  );

  return {
    collections: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
