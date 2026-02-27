'use client';

import { useState, useCallback } from 'react';
import { useAiAgentQuestions } from '@/hooks/useAiAgentQuestions';
import { useAiAgentUsage } from '@/hooks/useAiAgentUsage';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAllHoldings } from '@/hooks/usePortfolio';
import { api } from '@/lib/api-client';
import { ChatIcon } from '@/components/icons';
import LoginPrompt from '@/components/ui/LoginPrompt';
import { useAuth } from '@/contexts/AuthContext';

interface ConversationEntry {
  role: 'user' | 'assistant';
  questionId?: string;
  ticker?: string;
  content: string;
  data?: unknown;
  follow_ups?: Array<{ id: string; label: string; short_label: string }>;
}

export default function AiPage() {
  const { isAuthenticated } = useAuth();
  const [selectedTicker, setSelectedTicker] = useState<string | null>(null);
  const [conversation, setConversation] = useState<ConversationEntry[]>([]);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { questions: initialQuestions } = useAiAgentQuestions({ shouldFetch: isAuthenticated });
  const { usage } = useAiAgentUsage({ enabled: isAuthenticated });
  const { watchlist: stocks } = useWatchlist({ enabled: isAuthenticated });
  const { holdings } = useAllHoldings({ enabled: isAuthenticated });

  // Combine stock tickers from watchlist and portfolio
  const availableTickers = Array.from(
    new Set([
      ...stocks.map((s: any) => s.ticker),
      ...holdings.map((h) => h.ticker),
    ])
  ).sort();

  const askQuestion = useCallback(async (questionId: string, label: string) => {
    if (!selectedTicker || isAsking) return;
    setError(null);
    setIsAsking(true);

    // Add user message
    setConversation((prev) => [
      ...prev,
      { role: 'user', questionId, ticker: selectedTicker, content: label },
    ]);

    try {
      const response = await api.post<{
        response: { summary: string; details: string[]; data_points: Array<{ label: string; value: string }> };
        follow_up_questions: Array<{ id: string; label: string; short_label: string }>;
        usage: unknown;
      }>('/ai-agent/ask', {
        question_id: questionId,
        ticker: selectedTicker,
      });

      if (!response.success || !response.data) {
        throw new Error(response.error?.message ?? 'Failed to get response');
      }

      const { response: aiResponse, follow_up_questions } = response.data;

      setConversation((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: aiResponse.summary,
          data: aiResponse,
          follow_ups: follow_up_questions,
        },
      ]);
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
      // Remove the user message on error
      setConversation((prev) => prev.slice(0, -1));
    } finally {
      setIsAsking(false);
    }
  }, [selectedTicker, isAsking]);

  if (!isAuthenticated) {
    return (
      <div className="p-4 md:p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center">
              <ChatIcon className="w-5 h-5 text-vettr-accent" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Analysis</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered stock analysis for your portfolio</p>
            </div>
          </div>
        </div>
        <LoginPrompt
          title="Sign in to use AI Analysis"
          message="Get AI-powered insights, ask questions about any stock, and receive personalized analysis for your portfolio."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center">
            <ChatIcon className="w-5 h-5 text-vettr-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Analysis</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Ask questions about any stock in your portfolio or watchlist
            </p>
          </div>
        </div>

        {/* Usage Bar */}
        {usage && usage.limit !== Infinity && (
          <div className="mt-3 bg-gray-100 dark:bg-white/5 rounded-lg p-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Daily questions: {usage.used} / {usage.limit}
            </span>
            <div className="w-32 h-1.5 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-vettr-accent rounded-full transition-all"
                style={{ width: `${Math.min(100, (usage.used / usage.limit) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Ticker Selector */}
      {!selectedTicker ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Select a stock to analyze:
          </p>
          {availableTickers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-white/5 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">
                Add stocks to your watchlist or portfolio first
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {availableTickers.map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => setSelectedTicker(ticker)}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm font-semibold text-gray-900 dark:text-white hover:border-vettr-accent hover:bg-vettr-accent/5 transition-all"
                >
                  {ticker}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active Ticker Header */}
          <div className="flex items-center justify-between bg-white dark:bg-white/5 rounded-xl p-3 border border-gray-200 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-vettr-accent">{selectedTicker}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Selected</span>
            </div>
            <button
              onClick={() => {
                setSelectedTicker(null);
                setConversation([]);
                setError(null);
              }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Change
            </button>
          </div>

          {/* Conversation */}
          {conversation.length > 0 && (
            <div className="space-y-3">
              {conversation.map((entry, i) => (
                <div
                  key={i}
                  className={`rounded-xl p-4 ${
                    entry.role === 'user'
                      ? 'bg-vettr-accent/10 ml-8'
                      : 'bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 mr-8'
                  }`}
                >
                  <p className="text-sm text-gray-900 dark:text-white">{entry.content}</p>

                  {/* Data Points */}
                  {!!entry.data && (entry.data as any).data_points?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {(entry.data as any).data_points.map((dp: any, j: number) => (
                        <div
                          key={j}
                          className="bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2"
                        >
                          <p className="text-[10px] text-gray-400 uppercase">{dp.label}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {dp.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {entry.follow_ups && entry.follow_ups.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {entry.follow_ups.map((q) => (
                        <button
                          key={q.id}
                          onClick={() => askQuestion(q.id, q.short_label || q.label)}
                          disabled={isAsking}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-vettr-accent/10 text-vettr-accent hover:bg-vettr-accent/20 transition-colors disabled:opacity-50"
                        >
                          {q.short_label || q.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {isAsking && (
                <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5 mr-8 animate-pulse">
                  <div className="h-4 w-3/4 bg-gray-200 dark:bg-white/10 rounded" />
                  <div className="h-3 w-1/2 bg-gray-200 dark:bg-white/10 rounded mt-2" />
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Initial Questions */}
          <div>
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              {conversation.length === 0 ? 'What would you like to know?' : 'Ask another question'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {initialQuestions.map((q: any) => (
                <button
                  key={q.id}
                  onClick={() => askQuestion(q.id, q.short_label || q.label)}
                  disabled={isAsking}
                  className="text-left px-4 py-3 rounded-xl bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-vettr-accent hover:bg-vettr-accent/5 transition-all disabled:opacity-50"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {q.label}
                  </p>
                  {q.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {q.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
