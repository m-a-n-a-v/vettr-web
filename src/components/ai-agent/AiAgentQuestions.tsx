'use client';

import { motion } from 'framer-motion';
import type { AiAgentQuestion } from '@/types/ai-agent';

interface AiAgentQuestionsProps {
  questions: AiAgentQuestion[];
  onSelect: (question: AiAgentQuestion) => void;
  ticker?: string;
  isLoading?: boolean;
  limitReached?: boolean;
  variant?: 'initial' | 'follow-up';
}

const categoryIcons: Record<string, React.ReactNode> = {
  financial_health: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  ),
  analyst_ratings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  ),
  insider_activity: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
      />
    </svg>
  ),
  valuation: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
      />
    </svg>
  ),
  earnings: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
      />
    </svg>
  ),
  red_flags: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
      />
    </svg>
  ),
};

export function AiAgentQuestions({
  questions,
  onSelect,
  ticker,
  isLoading = false,
  limitReached = false,
  variant = 'initial',
}: AiAgentQuestionsProps) {
  const interpolateText = (text: string) => {
    return ticker ? text.replace(/\{TICKER\}/g, ticker) : text;
  };

  const getIcon = (question: AiAgentQuestion) => {
    return categoryIcons[question.category] || categoryIcons.financial_health;
  };

  if (variant === 'follow-up') {
    return (
      <div className="flex flex-wrap gap-2">
        {questions.map((question, index) => (
          <motion.button
            key={question.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 + 0.2 }}
            onClick={() => onSelect(question)}
            disabled={isLoading || limitReached}
            className="bg-vettr-accent/10 text-vettr-accent dark:bg-vettr-accent/10 dark:text-vettr-accent text-xs rounded-full px-3 py-1.5 hover:bg-vettr-accent/20 dark:hover:bg-vettr-accent/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {interpolateText(question.label)}
          </motion.button>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        visible: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      className="space-y-2"
    >
      {questions.map((question) => (
        <motion.button
          key={question.id}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          onClick={() => onSelect(question)}
          disabled={isLoading || limitReached}
          className="w-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-xl px-4 py-3 hover:border-vettr-accent/30 dark:hover:border-vettr-accent/30 hover:bg-white/10 dark:hover:bg-white/10 transition-all text-left flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed relative group"
        >
          {/* Icon */}
          <div className="text-vettr-accent dark:text-vettr-accent shrink-0">
            {getIcon(question)}
          </div>

          {/* Question Text */}
          <span className="text-sm text-gray-300 dark:text-gray-300 flex-1">
            {interpolateText(question.label)}
          </span>

          {/* Chevron */}
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-500 shrink-0 group-hover:text-vettr-accent dark:group-hover:text-vettr-accent transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>

          {/* Limit Reached Overlay */}
          {limitReached && (
            <div className="absolute inset-0 bg-vettr-dark/80 dark:bg-vettr-dark/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <span className="text-xs text-gray-400 dark:text-gray-400 font-medium">
                Upgrade to ask more
              </span>
            </div>
          )}
        </motion.button>
      ))}
    </motion.div>
  );
}
