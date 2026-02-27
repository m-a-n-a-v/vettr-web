'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { PortfolioInsight } from '@/types/portfolio';

export function usePortfolioInsights(portfolioId?: string, options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const url = portfolioId
    ? `/portfolio-insights/${portfolioId}`
    : '/portfolio-insights';

  const { data, error, isLoading, mutate } = useSWR<PortfolioInsight[]>(
    enabled ? url : null,
    async (fetchUrl: string) => {
      const response = await api.get<PortfolioInsight[]>(fetchUrl);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch insights');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    insights: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}

export async function dismissInsight(insightId: string) {
  const response = await api.post(`/portfolio-insights/${insightId}/dismiss`);
  if (!response.success) {
    throw new Error(response.error?.message ?? 'Failed to dismiss insight');
  }
}
