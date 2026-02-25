'use client';

import { api } from '@/lib/api-client';
import type { AiAgentResponse } from '@/types/ai-agent';

/**
 * Hook to interact with the AI agent
 * Provides a function to ask questions to the AI agent
 */
export function useAiAgent() {
  /**
   * Ask a question to the AI agent
   * @param questionId - The ID of the question to ask
   * @param ticker - The stock ticker symbol
   * @returns Promise resolving to the AI agent response
   */
  async function askQuestion(
    questionId: string,
    ticker: string
  ): Promise<AiAgentResponse> {
    const response = await api.post<AiAgentResponse>(
      '/ai-agent/ask',
      {
        question_id: questionId,
        ticker: ticker,
      }
    );

    if (!response.success || !response.data) {
      throw new Error(response.error?.message || 'Failed to get response from AI agent');
    }

    return response.data;
  }

  return {
    askQuestion,
  };
}
