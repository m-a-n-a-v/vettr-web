'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { Subscription } from '@/types/api';

interface UseSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch current subscription tier and limits
 * @returns Subscription object with tier and limits, loading/error states, and mutate function
 */
export function useSubscription(): UseSubscriptionReturn {
  const { data, error, isLoading, mutate } = useSWR<Subscription, Error>(
    '/subscription',
    async (url: string): Promise<Subscription> => {
      const response = await api.get<Subscription>(url);
      if (!response.success || !response.data) {
        throw new Error('Failed to fetch subscription data');
      }
      return response.data;
    },
    {
      revalidateOnFocus: true,
      dedupingInterval: 60000, // Cache for 60 seconds (subscription data changes infrequently)
    }
  );

  return {
    subscription: data ?? null,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
