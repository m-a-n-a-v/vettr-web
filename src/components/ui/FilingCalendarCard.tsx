'use client';

import type { FilingCalendarEntry } from '@/types/portfolio';

interface FilingCalendarCardProps {
  filing: FilingCalendarEntry;
}

const STATUS_COLORS: Record<string, string> = {
  upcoming: 'bg-blue-500/10 text-blue-400',
  filed: 'bg-green-500/10 text-green-400',
  overdue: 'bg-red-500/10 text-red-400',
};

export default function FilingCalendarCard({ filing }: FilingCalendarCardProps) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-xl p-4 border border-gray-100 dark:border-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-vettr-accent">
              {filing.ticker}
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${STATUS_COLORS[filing.status] ?? ''}`}>
              {filing.status}
            </span>
          </div>
          <p className="text-sm text-gray-900 dark:text-white">
            {filing.company_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {filing.filing_type} &middot; Expected: {filing.expected_date}
            {filing.actual_date && ` · Filed: ${filing.actual_date}`}
          </p>
        </div>
        {filing.source_url && (
          <a
            href={filing.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-vettr-accent hover:underline flex-shrink-0"
          >
            View
          </a>
        )}
      </div>
    </div>
  );
}
