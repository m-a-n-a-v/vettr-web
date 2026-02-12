/**
 * useStockSearch Hook
 *
 * Fetches stock search results with debounced input from the VETTR backend API.
 * Uses SWR for caching and automatic revalidation.
 */

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { StockSearchResult, ApiResponse } from '@/types/api';

interface UseStockSearchResult {
  results: StockSearchResult[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSearching: boolean;
}

/**
 * Fetcher function for SWR
 */
async function fetchStockSearch(url: string): Promise<StockSearchResult[]> {
  const response = await api.get<StockSearchResult[]>(url);

  if (!response.success || !response.data) {
    throw new Error(response.error?.message || 'Failed to search stocks');
  }

  return response.data;
}

/**
 * Hook to search stocks with debounced input
 *
 * @param query - Search query string
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 */
export function useStockSearch(query: string, debounceMs: number = 300): UseStockSearchResult {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the query input
  useEffect(() => {
    // If query changes, set searching state
    if (query !== debouncedQuery) {
      setIsSearching(true);
    }

    const handler = setTimeout(() => {
      setDebouncedQuery(query);
      setIsSearching(false);
    }, debounceMs);

    return () => {
      clearTimeout(handler);
    };
  }, [query, debounceMs, debouncedQuery]);

  // Build endpoint - only search if query has at least 1 character
  const endpoint =
    debouncedQuery.trim().length > 0 ? `/stocks/search?q=${encodeURIComponent(debouncedQuery.trim())}` : null;

  // Use SWR for data fetching
  const { data, error, isLoading } = useSWR<StockSearchResult[], Error>(endpoint, fetchStockSearch, {
    revalidateOnFocus: false, // Don't revalidate on focus for search
    revalidateOnReconnect: false, // Don't revalidate on reconnect for search
    dedupingInterval: 2000, // Prevent duplicate requests within 2s
  });

  return {
    results: data || [],
    isLoading,
    isError: !!error,
    error: error || null,
    isSearching, // True when user is typing (before debounce completes)
  };
}
