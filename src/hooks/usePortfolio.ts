'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type {
  Portfolio,
  PortfolioHolding,
  PortfolioSummary,
  CategorizedHoldings,
  PortfolioSnapshot,
} from '@/types/portfolio';

// --- Portfolio List ---

export function usePortfolios() {
  const { data, error, isLoading, mutate } = useSWR<Portfolio[]>(
    '/portfolio',
    async (url: string) => {
      const response = await api.get<Portfolio[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch portfolios');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    portfolios: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- Portfolio Summary ---

export function usePortfolioSummary(options?: { enabled?: boolean }) {
  const enabled = options?.enabled ?? true;
  const { data, error, isLoading, mutate } = useSWR<PortfolioSummary[]>(
    enabled ? '/portfolio/summary' : null,
    async (url: string) => {
      const response = await api.get<PortfolioSummary[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch portfolio summary');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    summaries: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- All Holdings ---

export function useAllHoldings() {
  const { data, error, isLoading, mutate } = useSWR<PortfolioHolding[]>(
    '/portfolio/holdings',
    async (url: string) => {
      const response = await api.get<PortfolioHolding[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch holdings');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    holdings: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- Categorized Holdings ---

export function useCategorizedHoldings() {
  const { data, error, isLoading, mutate } = useSWR<CategorizedHoldings>(
    '/portfolio/holdings/categorized',
    async (url: string) => {
      const response = await api.get<CategorizedHoldings>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch categorized holdings');
      }
      return response.data;
    },
    { dedupingInterval: 60000 }
  );

  return {
    categories: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- Portfolio Snapshots ---

export function usePortfolioSnapshots(portfolioId: string | null, days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR<PortfolioSnapshot[]>(
    portfolioId ? `/portfolio/${portfolioId}/snapshots?days=${days}` : null,
    async (url: string) => {
      const response = await api.get<PortfolioSnapshot[]>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch snapshots');
      }
      return response.data;
    },
    { dedupingInterval: 120000 }
  );

  return {
    snapshots: data ?? [],
    isLoading,
    error: error ?? null,
    mutate,
  };
}

// --- Portfolio Mutations ---

export async function createPortfolio(input: {
  connectionType: string;
  connectionId?: string;
  institutionName?: string;
}) {
  const response = await api.post<Portfolio>('/portfolio', input);
  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Failed to create portfolio');
  }
  return response.data;
}

export async function deletePortfolio(portfolioId: string) {
  const response = await api.delete(`/portfolio/${portfolioId}`);
  if (!response.success) {
    throw new Error(response.error?.message ?? 'Failed to delete portfolio');
  }
}

export async function addHolding(
  portfolioId: string,
  input: { ticker: string; quantity: number; averageCost: number; assetCategory?: string }
) {
  const response = await api.post<PortfolioHolding>(
    `/portfolio/${portfolioId}/holdings`,
    input
  );
  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Failed to add holding');
  }
  return response.data;
}

export async function removeHolding(holdingId: string) {
  const response = await api.delete(`/portfolio/holdings/${holdingId}`);
  if (!response.success) {
    throw new Error(response.error?.message ?? 'Failed to remove holding');
  }
}

export async function importCsvHoldings(
  portfolioId: string,
  rows: Array<{ ticker: string; shares: number; avgCost: number }>
) {
  const response = await api.post(`/portfolio/${portfolioId}/import-csv`, { rows });
  if (!response.success || !response.data) {
    throw new Error(response.error?.message ?? 'Failed to import CSV');
  }
  return response.data;
}
