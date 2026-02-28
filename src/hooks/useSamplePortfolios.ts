'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { SamplePortfolio, SamplePortfoliosData } from '@/types/api';

interface UseSamplePortfoliosReturn {
  portfolios: SamplePortfolio[];
  isLoading: boolean;
  isError: boolean;
  mutate: () => void;
}

/**
 * Hook to fetch 6 themed sample portfolios (public endpoint, no auth)
 * Used for logged-in users without a connected portfolio
 */
export function useSamplePortfolios(options?: { enabled?: boolean }): UseSamplePortfoliosReturn {
  const enabled = options?.enabled ?? true;

  const { data, error, mutate, isLoading } = useSWR<SamplePortfolio[], Error>(
    enabled ? '/sample-portfolios' : null,
    async (url: string) => {
      const response = await api.get<SamplePortfoliosData>(url);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch sample portfolios');
      }
      return response.data.portfolios;
    },
    {
      dedupingInterval: 300000, // 5 min client-side cache
    }
  );

  return {
    portfolios: data || [],
    isLoading,
    isError: !!error,
    mutate,
  };
}
