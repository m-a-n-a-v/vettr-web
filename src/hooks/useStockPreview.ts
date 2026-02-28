'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { StockPreview } from '@/types/api';

interface UseStockPreviewReturn {
  preview: StockPreview | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch a public stock preview (score + pillars, no auth required)
 * Used for guest users on the stock detail page
 */
export function useStockPreview(ticker: string | null, options?: { enabled?: boolean }): UseStockPreviewReturn {
  const enabled = options?.enabled ?? true;

  const { data, error, isLoading } = useSWR<StockPreview, Error>(
    enabled && ticker ? `/stocks/${ticker}/preview` : null,
    async (url: string) => {
      const response = await api.get<StockPreview>(url);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch stock preview');
      }
      return response.data;
    },
    {
      dedupingInterval: 60000, // Cache preview for 60s
    }
  );

  return {
    preview: data ?? null,
    isLoading,
    error: error ?? null,
  };
}
