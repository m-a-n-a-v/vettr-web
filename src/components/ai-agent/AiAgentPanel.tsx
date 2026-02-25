'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AiAgentConversationEntry } from '@/types/ai-agent';

interface AiAgentPanelProps {
  isOpen: boolean;
  onClose: () => void;
  ticker?: string | null;
  conversation?: AiAgentConversationEntry[];
  children?: React.ReactNode;
}

export function AiAgentPanel({
  isOpen,
  onClose,
  ticker,
  conversation = [],
  children,
}: AiAgentPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle Escape key to close panel
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Auto-scroll to bottom when conversation updates
  useEffect(() => {
    if (contentRef.current && conversation.length > 0) {
      const scrollToBottom = () => {
        contentRef.current?.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: 'smooth',
        });
      };
      // Small delay to ensure content is rendered
      setTimeout(scrollToBottom, 100);
    }
  }, [conversation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-24 right-4 md:bottom-20 md:right-6 w-[calc(100vw-2rem)] md:w-[400px] h-[85vh] md:h-auto md:max-h-[600px] bg-vettr-dark border border-white/10 rounded-2xl md:rounded-2xl shadow-2xl z-40 flex flex-col overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-panel-title"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-2">
              {/* Sparkle Icon */}
              <svg
                className="w-5 h-5 text-vettr-accent"
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
              <h2
                id="ai-panel-title"
                className="text-base font-semibold text-white dark:text-white"
              >
                VETTR AI
              </h2>
              {ticker && (
                <span className="bg-vettr-accent/10 text-vettr-accent rounded-lg px-2 py-0.5 text-sm font-mono font-semibold">
                  {ticker}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close VETTR AI panel"
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white dark:text-gray-400 dark:hover:text-white"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content Area - Scrollable */}
          <div
            ref={contentRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
          >
            {children}
          </div>

          {/* Footer - Usage Bar Placeholder */}
          <div className="px-4 py-3 border-t border-white/10 shrink-0">
            {/* Usage bar component will be inserted here via children or separate prop */}
            <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
              Usage bar component
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
