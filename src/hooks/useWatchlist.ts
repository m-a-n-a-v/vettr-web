'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Stock, PaginatedResponse } from '@/types/api';
import { useState } from 'react';

interface UseWatchlistReturn {
  watchlist: Stock[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
  addToWatchlist: (ticker: string) => Promise<void>;
  removeFromWatchlist: (ticker: string) => Promise<void>;
  isInWatchlist: (ticker: string) => boolean;
  isAdding: boolean;
  isRemoving: boolean;
}

/**
 * Hook to fetch and manage watchlist (favorites)
 * Provides add and remove mutations with optimistic updates
 */
export function useWatchlist(): UseWatchlistReturn {
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const fetcher = async (url: string): Promise<PaginatedResponse<Stock>> => {
    const response = await api.get<PaginatedResponse<Stock>>(url);
    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to fetch watchlist');
    }
    return response.data;
  };

  const { data, error, isLoading, mutate } = useSWR<
    PaginatedResponse<Stock>,
    Error
  >('/watchlist', fetcher, {
    revalidateOnFocus: true,
    dedupingInterval: 3000,
  });

  const watchlist = data?.items || [];

  /**
   * Check if a stock is in the watchlist
   */
  const isInWatchlist = (ticker: string): boolean => {
    return watchlist.some(
      (stock) => stock.ticker.toLowerCase() === ticker.toLowerCase()
    );
  };

  /**
   * Add a stock to the watchlist
   */
  const addToWatchlist = async (ticker: string): Promise<void> => {
    setIsAdding(true);
    try {
      const response = await api.post(`/watchlist/${ticker}`, {});
      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to add to watchlist'
        );
      }
      // Revalidate watchlist after successful add
      await mutate();
    } catch (error) {
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Remove a stock from the watchlist
   */
  const removeFromWatchlist = async (ticker: string): Promise<void> => {
    setIsRemoving(true);
    try {
      const response = await api.delete(`/watchlist/${ticker}`);
      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to remove from watchlist'
        );
      }
      // Revalidate watchlist after successful remove
      await mutate();
    } catch (error) {
      throw error;
    } finally {
      setIsRemoving(false);
    }
  };

  return {
    watchlist,
    isLoading,
    error: error || null,
    mutate,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    isAdding,
    isRemoving,
  };
}
