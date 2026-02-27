'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { NewsArticle, FilingCalendarEntry } from '@/types/portfolio';
import type { PaginatedResponse } from '@/types/api';

// --- News Articles ---

export function useNewsArticles(options?: {
  source?: string;
  ticker?: string;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (options?.source) params.set('source', options.source);
  if (options?.ticker) params.set('ticker', options.ticker);
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  const queryString = params.toString();
  const url = `/news${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<NewsArticle>>(
    url,
    async (fetchUrl: string) => {
      const response = await api.get<PaginatedResponse<NewsArticle>>(fetchUrl);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch news');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    articles: data?.items ?? [],
    total: data?.pagination?.total ?? 0,
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- Material News ---

export function useMaterialNews(limit: number = 10) {
  const { data, error, isLoading, mutate } = useSWR<NewsArticle[]>(
    `/news/material?limit=${limit}`,
    async (url: string) => {
      const response = await api.get<NewsArticle[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch material news');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    articles: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- Portfolio News ---

export function usePortfolioNews(tickers: string[]) {
  const tickerString = tickers.join(',');

  const { data, error, isLoading, mutate } = useSWR<NewsArticle[]>(
    tickers.length > 0 ? `/news/portfolio?tickers=${tickerString}` : null,
    async (url: string) => {
      const response = await api.get<NewsArticle[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch portfolio news');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    articles: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- Filing Calendar ---

export function useFilingCalendar(options?: {
  ticker?: string;
  status?: string;
  days?: number;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (options?.ticker) params.set('ticker', options.ticker);
  if (options?.status) params.set('status', options.status);
  if (options?.days) params.set('days', String(options.days));
  if (options?.limit) params.set('limit', String(options.limit));

  const queryString = params.toString();
  const url = `/news/filings${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<FilingCalendarEntry[]>(
    url,
    async (fetchUrl: string) => {
      const response = await api.get<FilingCalendarEntry[]>(fetchUrl);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch filing calendar');
      }
      return response.data;
    },
    { dedupingInterval: 120000 }
  );

  return {
    filings: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}
