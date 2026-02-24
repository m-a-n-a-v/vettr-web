'use client';

import { ShortInterest } from '@/types/fundamentals';
import { useState } from 'react';

interface ShortInterestBadgeProps {
  shortInterest: ShortInterest;
}

/**
 * Get color class based on short interest percentage
 * Green <3%, Yellow 3-10%, Red >10%
 */
function getShortInterestColor(percent: number): {
  bg: string;
  text: string;
  border: string;
} {
  if (percent < 3) {
    return {
      bg: 'bg-emerald-400/10',
      text: 'text-emerald-400',
      border: 'border-emerald-400/20',
    };
  } else if (percent <= 10) {
    return {
      bg: 'bg-yellow-400/10',
      text: 'text-yellow-400',
      border: 'border-yellow-400/20',
    };
  } else {
    return {
      bg: 'bg-red-400/10',
      text: 'text-red-400',
      border: 'border-red-400/20',
    };
  }
}

/**
 * ShortInterestBadge Component
 * Displays short interest percentage and days to cover in a compact badge
 * Includes tooltip explaining what short interest means
 */
export function ShortInterestBadge({ shortInterest }: ShortInterestBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const colors = getShortInterestColor(shortInterest.shortInterestPercent);

  return (
    <div className="relative inline-block">
      <div
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${colors.bg} ${colors.border} transition-all duration-300 hover:border-vettr-accent/40 cursor-help`}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Info icon */}
        <svg
          className={`w-4 h-4 ${colors.text}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4" />
          <path d="M12 8h.01" />
        </svg>

        {/* Short Interest Label */}
        <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">
          Short Interest
        </span>

        {/* Short Interest Value */}
        <span className={`text-sm font-semibold ${colors.text}`}>
          {shortInterest.shortInterestPercent.toFixed(2)}%
        </span>

        {/* Days to Cover */}
        <span className="text-xs text-gray-400">
          ({shortInterest.daysToCover.toFixed(1)} days)
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute bottom-full left-0 mb-2 z-50 w-64 p-3 bg-vettr-card border border-white/10 rounded-lg shadow-lg">
          <div className="text-xs text-white font-semibold mb-1">
            What is Short Interest?
          </div>
          <div className="text-xs text-gray-400 leading-relaxed">
            Short interest shows the percentage of shares being bet against. Higher percentages indicate more bearish sentiment. Days to cover shows how many days it would take to close all short positions.
          </div>
          <div className="text-xs text-gray-500 mt-2">
            As of {new Date(shortInterest.asOfDate).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}
