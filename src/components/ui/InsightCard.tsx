'use client';

import type { PortfolioInsight } from '@/types/portfolio';

interface InsightCardProps {
  insight: PortfolioInsight;
  onDismiss?: (id: string) => void;
}

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-red-500/20 bg-red-500/5',
  warning: 'border-orange-500/20 bg-orange-500/5',
  info: 'border-blue-500/20 bg-blue-500/5',
};

const SEVERITY_TEXT: Record<string, string> = {
  critical: 'text-red-400',
  warning: 'text-orange-400',
  info: 'text-blue-400',
};

export default function InsightCard({ insight, onDismiss }: InsightCardProps) {
  return (
    <div className={`rounded-xl p-4 border ${SEVERITY_STYLES[insight.severity] ?? 'border-gray-200 dark:border-white/5'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className={`text-[10px] font-semibold uppercase tracking-wide ${SEVERITY_TEXT[insight.severity] ?? 'text-gray-400'}`}>
            {insight.insight_type.replace(/_/g, ' ')}
          </span>
          <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{insight.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{insight.summary}</p>
          {insight.expires_at && (
            <p className="text-[10px] text-gray-400 mt-2">
              Expires: {new Date(insight.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
        {onDismiss && !insight.is_dismissed && (
          <button
            onClick={() => onDismiss(insight.id)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 flex-shrink-0"
            title="Dismiss insight"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
