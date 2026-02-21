'use client';

import useSWR from 'swr';
import type { NewsItem } from '@/app/api/news/route';

interface NewsResponse {
  source: string;
  source_url: string;
  fetched_at: string;
  items: NewsItem[];
}

interface UseMarketNewsReturn {
  news: NewsItem[];
  source: string;
  sourceUrl: string;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

const fetcher = async (url: string): Promise<NewsResponse> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to fetch market news');
  }
  return res.json();
};

/**
 * Hook to fetch market news from BNN Bloomberg RSS feed
 * via the Next.js API route at /api/news.
 *
 * Caches for 10 minutes (matches the API route revalidation).
 */
export function useMarketNews(limit: number = 10): UseMarketNewsReturn {
  const { data, error, isLoading, mutate } = useSWR<NewsResponse, Error>(
    '/api/news',
    fetcher,
    {
      dedupingInterval: 600000, // 10 min — RSS feed caches for the same duration
      revalidateOnFocus: false,
    }
  );

  return {
    news: (data?.items ?? []).slice(0, limit),
    source: data?.source ?? 'BNN Bloomberg',
    sourceUrl: data?.source_url ?? 'https://www.bnnbloomberg.ca/',
    isLoading,
    error: error ?? null,
    mutate,
  };
}
