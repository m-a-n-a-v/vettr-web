'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
import Onboarding from '@/components/Onboarding';
import KeyboardShortcutsModal from '@/components/KeyboardShortcutsModal';
import QuickSearch from '@/components/QuickSearch';
import { AiAgentButton } from '@/components/ai-agent/AiAgentButton';
import { AiAgentPanel } from '@/components/ai-agent/AiAgentPanel';
import { AiAgentQuestions } from '@/components/ai-agent/AiAgentQuestions';
import { AiAgentResponse, AiAgentResponseSkeleton } from '@/components/ai-agent/AiAgentResponse';
import { AiAgentUsageBar } from '@/components/ai-agent/AiAgentUsageBar';
import { AiAgentTickerPicker } from '@/components/ai-agent/AiAgentTickerPicker';
import { AiAgentError } from '@/components/ai-agent/AiAgentError';
import { useAuth } from '@/contexts/AuthContext';
import { QuickSearchProvider, useQuickSearch } from '@/contexts/QuickSearchContext';
import { AiAgentProvider, useAiAgentContext } from '@/contexts/AiAgentContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useAiAgentQuestions } from '@/hooks/useAiAgentQuestions';
import { useAiAgentUsage } from '@/hooks/useAiAgentUsage';

function MainLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const { isOpen: showQuickSearch, openQuickSearch, closeQuickSearch } = useQuickSearch();
  const {
    isOpen: aiPanelOpen,
    togglePanel,
    ticker,
    setTicker,
    conversation,
    isLoading: aiLoading,
    error: aiError,
    askQuestion,
    retryLastQuestion,
  } = useAiAgentContext();
  const { questions: initialQuestions } = useAiAgentQuestions();
  const { usage } = useAiAgentUsage();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState(false);

  useEffect(() => {
    // Check if user has seen onboarding before
    if (typeof window !== 'undefined' && isAuthenticated) {
      const hasSeenOnboarding = localStorage.getItem('vettr_has_seen_onboarding');
      if (!hasSeenOnboarding) {
        // Show onboarding on first login
        setShowOnboarding(true);
      }
    }
  }, [isAuthenticated]);

  const handleCloseOnboarding = () => {
    setShowOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('vettr_has_seen_onboarding', 'true');
    }
  };

  // Initialize keyboard shortcuts
  useKeyboardShortcuts({
    onOpenQuickSearch: openQuickSearch,
    onOpenHelp: () => setShowKeyboardShortcutsModal(true),
    onCloseModal: () => {
      // Close any open modals
      if (showKeyboardShortcutsModal) {
        setShowKeyboardShortcutsModal(false);
      }
      if (showQuickSearch) {
        closeQuickSearch();
      }
    },
    enabled: isAuthenticated,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-lightBg dark:bg-vettr-navy transition-colors duration-200 relative">
        {/* Background gradients for depth - subtle in both modes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.02)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.04)_0%,_transparent_50%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.015)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.03)_0%,_transparent_50%)] pointer-events-none" />

        {/* Skip to main content link for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-vettr-accent focus:text-vettr-navy focus:rounded focus:outline-none focus:ring-2 focus:ring-vettr-accent"
        >
          Skip to main content
        </a>
        <Navigation />
        <Header />
        {/* Main content area - offset for desktop sidebar and mobile bottom bar */}
        <main id="main-content" className="md:ml-64 pt-16 pb-20 md:pb-0 transition-colors duration-200 relative z-10">
          {children}
        </main>
        {/* Onboarding overlay */}
        <Onboarding isOpen={showOnboarding} onClose={handleCloseOnboarding} />
        {/* Keyboard shortcuts help modal */}
        <KeyboardShortcutsModal
          isOpen={showKeyboardShortcutsModal}
          onClose={() => setShowKeyboardShortcutsModal(false)}
        />
        {/* Quick search overlay */}
        <QuickSearch isOpen={showQuickSearch} onClose={closeQuickSearch} />

        {/* AI Agent Button */}
        <AiAgentButton isOpen={aiPanelOpen} onClick={togglePanel} />

        {/* AI Agent Panel */}
        <AiAgentPanel
          isOpen={aiPanelOpen}
          onClose={togglePanel}
          ticker={ticker}
          conversation={conversation}
        >
          {/* Content based on ticker state */}
          {!ticker ? (
            <AiAgentTickerPicker onSelectTicker={setTicker} />
          ) : (
            <div className="space-y-4">
              {/* Render conversation history */}
              {conversation.map((entry, index) => {
                const isLatest = index === conversation.length - 1;
                return (
                  <div
                    key={entry.timestamp}
                    className={`space-y-3 transition-opacity duration-300 ${
                      isLatest ? 'opacity-100' : 'opacity-70'
                    }`}
                  >
                    {/* Question asked (optional display) */}
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      {entry.question.label.replace(/\{TICKER\}/g, ticker)}
                    </div>

                    {/* Response */}
                    <AiAgentResponse response={entry.response.response} />

                    {/* Follow-up questions (only for most recent entry) */}
                    {isLatest &&
                      entry.response.follow_up_questions &&
                      entry.response.follow_up_questions.length > 0 && (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-500 dark:text-gray-500 font-medium">
                            Follow-up questions:
                          </div>
                          <AiAgentQuestions
                            questions={entry.response.follow_up_questions}
                            onSelect={askQuestion}
                            ticker={ticker}
                            isLoading={aiLoading}
                            limitReached={usage?.remaining === 0}
                            variant="follow-up"
                          />
                        </div>
                      )}
                  </div>
                );
              })}

              {/* Loading skeleton (when waiting for response) */}
              {aiLoading && <AiAgentResponseSkeleton />}

              {/* Error display (when request fails) */}
              {aiError && !aiLoading && (
                <AiAgentError message={aiError} onRetry={retryLastQuestion} />
              )}

              {/* Initial questions (when no conversation) */}
              {conversation.length === 0 && !aiLoading && !aiError && (
                <div className="space-y-3">
                  <div className="text-center py-4">
                    {/* Sparkle Icon */}
                    <svg
                      className="w-8 h-8 text-vettr-accent dark:text-vettr-accent mx-auto mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                    <div className="text-sm text-gray-400 dark:text-gray-400 mb-3">
                      Ask me anything about{' '}
                      <span className="text-vettr-accent dark:text-vettr-accent font-semibold">
                        {ticker}
                      </span>
                    </div>
                  </div>
                  <AiAgentQuestions
                    questions={initialQuestions}
                    onSelect={askQuestion}
                    ticker={ticker}
                    isLoading={aiLoading}
                    limitReached={usage?.remaining === 0}
                    variant="initial"
                  />
                </div>
              )}
            </div>
          )}

          {/* Usage bar in footer (passed as children to panel footer) */}
          <div className="absolute bottom-0 left-0 right-0 px-4 py-3 border-t border-white/10 dark:border-white/10 bg-vettr-dark dark:bg-vettr-dark">
            <AiAgentUsageBar usage={usage} />
          </div>
        </AiAgentPanel>
      </div>
    </ProtectedRoute>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <QuickSearchProvider>
      <AiAgentProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </AiAgentProvider>
    </QuickSearchProvider>
  );
}
