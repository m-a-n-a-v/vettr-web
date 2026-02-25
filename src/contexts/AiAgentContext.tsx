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
  togglePanel: () => void;
  setTicker: (ticker: string) => void;
  askQuestion: (question: AiAgentQuestion) => Promise<void>;
  resetConversation: () => void;
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

  const askQuestion = useCallback(
    async (question: AiAgentQuestion) => {
      if (!ticker) {
        showToast('Please select a stock first', 'error');
        return;
      }

      setIsLoading(true);

      try {
        const response = await apiAskQuestion(question.id, ticker);

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

          // Check if it's a tier limit error
          if (
            errorMessage.includes('limit') ||
            errorMessage.includes('429') ||
            errorMessage.includes('TIER_LIMIT_EXCEEDED')
          ) {
            showToast(
              'Daily question limit reached. Upgrade for more questions!',
              'error'
            );
          } else {
            showToast(
              `Failed to get response: ${errorMessage}`,
              'error'
            );
          }
        } else {
          showToast('Failed to get response from AI agent', 'error');
        }

        // Mutate usage even on error to refresh the count
        mutateUsage();
      } finally {
        setIsLoading(false);
      }
    },
    [ticker, apiAskQuestion, showToast, mutateUsage]
  );

  const value: AiAgentContextType = {
    isOpen,
    ticker,
    conversation,
    isLoading,
    togglePanel,
    setTicker,
    askQuestion,
    resetConversation,
  };

  return (
    <AiAgentContext.Provider value={value}>{children}</AiAgentContext.Provider>
  );
}
