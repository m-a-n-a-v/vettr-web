'use client';

import useSWR from 'swr';
import { api } from '@/lib/api-client';
import type { AiAgentQuestion } from '@/types/ai-agent';

interface UseAiAgentQuestionsParams {
  parentId?: string;
  shouldFetch?: boolean;
}

interface UseAiAgentQuestionsReturn {
  questions: AiAgentQuestion[];
  isLoading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch AI agent questions
 * @param parentId - Optional parent question ID to fetch follow-up questions
 * @param shouldFetch - Optional flag to conditionally fetch data (default: true)
 * @returns Array of questions, loading/error states
 */
export function useAiAgentQuestions({
  parentId,
  shouldFetch = true
}: UseAiAgentQuestionsParams = {}): UseAiAgentQuestionsReturn {
  const endpoint = parentId
    ? `/ai-agent/questions?parent_id=${parentId}`
    : '/ai-agent/questions';

  const { data, error, isLoading } = useSWR<{ questions: AiAgentQuestion[] }, Error>(
    shouldFetch ? endpoint : null,
    async (url: string) => {
      const response = await api.get<{ questions: AiAgentQuestion[] }>(url);
      if (!response.success || !response.data) {
        throw new Error(response.error?.message || 'Failed to fetch questions');
      }
      return response.data;
    },
    {
      dedupingInterval: 300000, // Cache questions for 5 minutes (they don't change often)
    }
  );

  return {
    questions: data?.questions ?? [],
    isLoading,
    error: error ?? null,
  };
}
