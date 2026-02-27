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
export function useWatchlist(options?: { enabled?: boolean }): UseWatchlistReturn {
  const enabled = options?.enabled ?? true;
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
  >(enabled ? '/watchlist' : null, fetcher, {
    dedupingInterval: 30000, // Cache watchlist for 30s — only changes on user action
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
   * Add a stock to the watchlist with optimistic updates
   */
  const addToWatchlist = async (ticker: string): Promise<void> => {
    setIsAdding(true);

    // Store current data for potential rollback
    const previousData = data;

    try {
      // Optimistically update the local cache immediately
      // We'll add a placeholder stock object since we don't have full stock data
      // The real data will come from the revalidation
      if (data?.items) {
        mutate(
          async () => {
            // First make the API call
            const response = await api.post(`/watchlist/${ticker}`, {});
            if (!response.success) {
              throw new Error(
                response.error?.message || 'Failed to add to watchlist'
              );
            }
            // Then fetch fresh data
            const freshResponse = await api.get<PaginatedResponse<Stock>>('/watchlist');
            if (!freshResponse.success || !freshResponse.data) {
              throw new Error('Failed to fetch updated watchlist');
            }
            return freshResponse.data;
          },
          {
            optimisticData: data, // Keep current data while loading
            rollbackOnError: true, // Rollback on error
            revalidate: false, // Don't revalidate since we're fetching in the mutate function
          }
        );
      } else {
        // No data yet, just make the API call
        const response = await api.post(`/watchlist/${ticker}`, {});
        if (!response.success) {
          throw new Error(
            response.error?.message || 'Failed to add to watchlist'
          );
        }
        await mutate();
      }
    } catch (error) {
      // Rollback on error
      if (previousData) {
        mutate(previousData, false);
      }
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Remove a stock from the watchlist with optimistic updates
   */
  const removeFromWatchlist = async (ticker: string): Promise<void> => {
    setIsRemoving(true);

    // Store current data for potential rollback
    const previousData = data;

    try {
      // Optimistically update the local cache immediately
      if (data?.items) {
        mutate(
          {
            ...data,
            items: data.items.filter((s) => s.ticker !== ticker),
          },
          false // Don't revalidate yet
        );
      }

      // Make the API call
      const response = await api.delete(`/watchlist/${ticker}`);
      if (!response.success) {
        throw new Error(
          response.error?.message || 'Failed to remove from watchlist'
        );
      }

      // Revalidate to get fresh data from server
      await mutate();
    } catch (error) {
      // Rollback on error
      if (previousData) {
        mutate(previousData, false);
      }
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
