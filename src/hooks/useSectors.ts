/**
 * useSectors Hook
 *
 * Fetches distinct stock sectors from the VETTR backend API.
 * Used to populate sector filter chips on the Stocks page.
 */

import useSWR from 'swr';
import { api } from '@/lib/api-client';

interface UseSectorsResult {
  sectors: string[];
  isLoading: boolean;
  error: Error | null;
}

export function useSectors(): UseSectorsResult {
  const { data, error, isLoading } = useSWR<string[]>(
    '/stocks/sectors',
    async (url: string) => {
      const response = await api.get<string[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch sectors');
      }
      return response.data;
    },
    { dedupingInterval: 300000 } // Cache for 5 minutes — sectors change rarely
  );

  return {
    sectors: data ?? [],
    isLoading,
    error: error ?? null,
  };
}
