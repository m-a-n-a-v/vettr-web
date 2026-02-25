'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { AiAgentUsage } from '@/types/ai-agent';

interface UseAiAgentUsageReturn {
  usage: AiAgentUsage | undefined;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch AI agent usage statistics
 * @returns Usage object with used/limit/remaining counts, reset time, loading/error states, and mutate function
 */
export function useAiAgentUsage(): UseAiAgentUsageReturn {
  const { data, error, isLoading, mutate } = useSWR<AiAgentUsage, Error>(
    '/ai-agent/usage',
    async (url: string) => {
      const response = await api.get<AiAgentUsage>(url);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch usage');
      }
      return response.data;
    },
    {
      dedupingInterval: 10000, // Cache usage for 10 seconds
      refreshInterval: 30000, // Refresh every 30 seconds to keep count accurate
    }
  );

  return {
    usage: data,
    isLoading,
    error: error ?? null,
    mutate,
  };
}
