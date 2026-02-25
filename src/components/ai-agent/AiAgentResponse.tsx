'use client';

import { motion } from 'framer-motion';
import type { AiAgentResponseData, AiAgentDetail } from '@/types/ai-agent';

interface AiAgentResponseProps {
  response: AiAgentResponseData;
}

const verdictColorMap: Record<
  string,
  { bg: string; text: string }
> = {
  green: {
    bg: 'bg-green-500/10 dark:bg-green-500/10',
    text: 'text-green-400 dark:text-green-400',
  },
  yellow: {
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/10',
    text: 'text-yellow-400 dark:text-yellow-400',
  },
  red: {
    bg: 'bg-red-500/10 dark:bg-red-500/10',
    text: 'text-red-400 dark:text-red-400',
  },
};

const statusDotColorMap: Record<string, string> = {
  safe: 'bg-green-400 dark:bg-green-400',
  warning: 'bg-yellow-400 dark:bg-yellow-400',
  danger: 'bg-red-400 dark:bg-red-400',
  neutral: 'bg-gray-400 dark:bg-gray-400',
};

function parseBoldMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    return <span key={index}>{part}</span>;
  });
}

export function AiAgentResponse({ response }: AiAgentResponseProps) {
  const verdictColors =
    verdictColorMap[response.verdict_color] || verdictColorMap.green;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl bg-vettr-card/50 dark:bg-vettr-card/50 border border-white/5 dark:border-white/5 p-4 space-y-3"
    >
      {/* Verdict Badge */}
      <div className="flex items-center gap-2">
        <span
          className={`${verdictColors.bg} ${verdictColors.text} rounded-full px-3 py-1 text-xs font-semibold`}
        >
          {response.verdict}
        </span>
      </div>

      {/* Summary Text */}
      <div className="text-sm text-gray-300 dark:text-gray-300 leading-relaxed">
        {parseBoldMarkdown(response.summary)}
      </div>

      {/* Details Grid */}
      {response.details && response.details.length > 0 && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {response.details.map((detail: AiAgentDetail, index: number) => (
            <div
              key={index}
              className="flex items-start gap-2 bg-white/5 dark:bg-white/5 rounded-lg p-2"
            >
              {/* Status Dot */}
              <div
                className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                  statusDotColorMap[detail.status] || statusDotColorMap.neutral
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 dark:text-gray-500 mb-0.5">
                  {detail.label}
                </div>
                <div className="text-sm text-gray-200 dark:text-gray-200 font-medium truncate">
                  {detail.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export function AiAgentResponseSkeleton() {
  return (
    <div className="rounded-2xl bg-vettr-card/50 dark:bg-vettr-card/50 border border-white/5 dark:border-white/5 p-4">
      {/* Three-dot pulse animation */}
      <div className="flex items-center gap-2">
        <div className="flex gap-1.5">
          <motion.div
            className="w-2 h-2 rounded-full bg-vettr-accent dark:bg-vettr-accent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-vettr-accent dark:bg-vettr-accent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-2 h-2 rounded-full bg-vettr-accent dark:bg-vettr-accent"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.4,
            }}
          />
        </div>
        <span className="text-sm text-gray-400 dark:text-gray-400">
          Analyzing...
        </span>
      </div>
    </div>
  );
}
