'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { PortfolioAlert } from '@/types/portfolio';
import type { PaginatedResponse } from '@/types/api';

export function usePortfolioAlerts(options?: {
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}) {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set('unread_only', 'true');
  if (options?.limit) params.set('limit', String(options.limit));
  if (options?.offset) params.set('offset', String(options.offset));

  const queryString = params.toString();
  const url = `/portfolio-alerts${queryString ? `?${queryString}` : ''}`;

  const { data, error, isLoading, mutate } = useSWR<PaginatedResponse<PortfolioAlert>>(
    url,
    async (fetchUrl: string) => {
      const response = await api.get<PaginatedResponse<PortfolioAlert>>(fetchUrl);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch alerts');
      }
      return response.data;
    },
    { dedupingInterval: 30000 }
  );

  return {
    alerts: data?.items ?? [],
    total: data?.pagination?.total ?? 0,
    isLoading,
    error: error ?? null,
    mutate,
  };
}

export function usePortfolioAlertUnreadCount() {
  const { data, error, isLoading, mutate } = useSWR<{ count: number }>(
    '/portfolio-alerts/unread-count',
    async (url: string) => {
      const response = await api.get<{ count: number }>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch unread count');
      }
      return response.data;
    },
    { dedupingInterval: 30000 }
  );

  return {
    unreadCount: data?.count ?? 0,
    isLoading,
    error: error ?? null,
    mutate,
  };
}

export async function markAlertRead(alertId: string) {
  const response = await api.post(`/portfolio-alerts/${alertId}/read`);
  if (!response.success) {
    throw new Error(response.error?.message ?? 'Failed to mark alert read');
  }
}

export async function markAllAlertsRead() {
  const response = await api.post('/portfolio-alerts/mark-all-read');
  if (!response.success) {
    throw new Error(response.error?.message ?? 'Failed to mark all alerts read');
  }
}
