'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import { useToast } from '@/contexts/ToastContext';
import { useAiAgent } from '@/hooks/useAiAgent';
import { useAiAgentUsage } from '@/hooks/useAiAgentUsage';
import type {
  AiAgentQuestion,
  AiAgentConversationEntry,
} from '@/types/ai-agent';

interface AiAgentContextType {
  isOpen: boolean;
  ticker: string | null;
  conversation: AiAgentConversationEntry[];
  isLoading: boolean;
  error: string | null;
  lastQuestion: AiAgentQuestion | null;
  togglePanel: () => void;
  setTicker: (ticker: string) => void;
  askQuestion: (question: AiAgentQuestion) => Promise<void>;
  resetConversation: () => void;
  retryLastQuestion: () => Promise<void>;
  clearError: () => void;
}

const AiAgentContext = createContext<AiAgentContextType | null>(null);

export function useAiAgentContext() {
  const context = useContext(AiAgentContext);
  if (!context) {
    throw new Error(
      'useAiAgentContext must be used within AiAgentProvider'
    );
  }
  return context;
}

interface AiAgentProviderProps {
  children: ReactNode;
}

const SESSION_STORAGE_KEY = 'vettr_ai_panel_open';

export function AiAgentProvider({ children }: AiAgentProviderProps) {
  const pathname = usePathname();
  const { showToast } = useToast();
  const { askQuestion: apiAskQuestion } = useAiAgent();
  const { mutate: mutateUsage } = useAiAgentUsage();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [ticker, setTickerState] = useState<string | null>(null);
  const [conversation, setConversation] = useState<AiAgentConversationEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastQuestion, setLastQuestion] = useState<AiAgentQuestion | null>(null);

  // Load isOpen from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored === 'true') {
      setIsOpen(true);
    }
  }, []);

  // Persist isOpen to sessionStorage
  useEffect(() => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, isOpen.toString());
  }, [isOpen]);

  // Auto-detect ticker from pathname
  useEffect(() => {
    // Match /stocks/[ticker] pattern
    const match = pathname.match(/^\/stocks\/([A-Z0-9]+)/i);
    if (match && match[1]) {
      const detectedTicker = match[1].toUpperCase();
      setTickerState(detectedTicker);
    }
  }, [pathname]);

  // Actions
  const togglePanel = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setTicker = useCallback((newTicker: string) => {
    setTickerState(newTicker.toUpperCase());
    setConversation([]); // Reset conversation when ticker changes
  }, []);

  const resetConversation = useCallback(() => {
    setConversation([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const askQuestion = useCallback(
    async (question: AiAgentQuestion) => {
      if (!ticker) {
        showToast('Please select a stock first', 'error');
        return;
      }

      setIsLoading(true);
      setError(null);
      setLastQuestion(question);

      // Create timeout promise (10 seconds)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT')), 10000);
      });

      try {
        // Race between API call and timeout
        const response = await Promise.race([
          apiAskQuestion(question.id, ticker),
          timeoutPromise,
        ]);

        // Add to conversation
        const entry: AiAgentConversationEntry = {
          question,
          response,
          timestamp: Date.now(),
        };
        setConversation((prev) => [...prev, entry]);

        // Mutate usage cache to reflect updated count
        mutateUsage();
      } catch (error: unknown) {
        // Handle 429 TIER_LIMIT_EXCEEDED
        if (error instanceof Error) {
          const errorMessage = error.message || 'Unknown error';

          // Check if it's a timeout
          if (errorMessage === 'TIMEOUT') {
            setError('Taking longer than expected. Please try again.');
          } else if (
            errorMessage.includes('limit') ||
            errorMessage.includes('429') ||
            errorMessage.includes('TIER_LIMIT_EXCEEDED')
          ) {
            showToast(
              'Daily question limit reached. Upgrade for more questions!',
              'error'
            );
          } else {
            setError(errorMessage);
          }
        } else {
          setError('Failed to get response from AI agent');
        }

        // Mutate usage even on error to refresh the count
        mutateUsage();
      } finally {
        setIsLoading(false);
      }
    },
    [ticker, apiAskQuestion, showToast, mutateUsage]
  );

  const retryLastQuestion = useCallback(async () => {
    if (lastQuestion) {
      await askQuestion(lastQuestion);
    }
  }, [lastQuestion, askQuestion]);

  const value: AiAgentContextType = {
    isOpen,
    ticker,
    conversation,
    isLoading,
    error,
    lastQuestion,
    togglePanel,
    setTicker,
    askQuestion,
    resetConversation,
    retryLastQuestion,
    clearError,
  };

  return (
    <AiAgentContext.Provider value={value}>{children}</AiAgentContext.Provider>
  );
}
