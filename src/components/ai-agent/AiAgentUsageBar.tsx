'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { AiAgentUsage } from '@/types/ai-agent';

interface AiAgentUsageBarProps {
  usage: AiAgentUsage | undefined;
}

function getTimeUntilReset(resetsAt: string): string {
  const now = new Date().getTime();
  const reset = new Date(resetsAt).getTime();
  const diff = reset - now;

  if (diff <= 0) return 'Soon';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function AiAgentUsageBar({ usage }: AiAgentUsageBarProps) {
  const [countdown, setCountdown] = useState<string>('');

  // Update countdown every minute
  useEffect(() => {
    if (!usage?.resets_at) return;

    const updateCountdown = () => {
      setCountdown(getTimeUntilReset(usage.resets_at));
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [usage?.resets_at]);

  // Loading skeleton
  if (!usage) {
    return (
      <div className="space-y-2">
        <div className="w-full bg-white/5 dark:bg-white/5 rounded-full h-1.5 animate-pulse" />
        <div className="text-xs text-gray-500 dark:text-gray-500 text-center">
          Loading...
        </div>
      </div>
    );
  }

  // Premium unlimited
  const isUnlimited = usage.limit === -1 || usage.limit === Infinity;
  if (isUnlimited) {
    return (
      <div className="text-center">
        <div className="text-xs text-vettr-accent dark:text-vettr-accent font-medium">
          ∞ Unlimited questions
        </div>
      </div>
    );
  }

  // Calculate usage percentage
  const usagePercent = usage.limit > 0 ? (usage.used / usage.limit) * 100 : 0;

  // Determine fill color based on usage
  let fillColor = '#00E676'; // vettr-accent green
  if (usagePercent >= 80) {
    fillColor = '#ef4444'; // red-400
  } else if (usagePercent >= 50) {
    fillColor = '#facc15'; // yellow-400
  }

  // Determine if upgrade CTA should show
  const showUpgrade = usage.remaining <= 1;
  const limitReached = usage.remaining === 0;

  // Tier-based upgrade message
  let upgradeMessage = 'Upgrade to PRO for 15/day';
  if (usage.limit === 3) {
    upgradeMessage = 'Upgrade to PRO for 15/day';
  } else if (usage.limit === 15) {
    upgradeMessage = 'Upgrade to PREMIUM for unlimited';
  }

  return (
    <div className="space-y-2">
      {/* Progress Bar */}
      <div className="w-full bg-white/5 dark:bg-white/5 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full transition-all duration-500"
          style={{
            width: `${Math.min(usagePercent, 100)}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>

      {/* Usage Text */}
      <div className="flex items-center justify-between text-xs">
        <span
          className={
            limitReached
              ? 'text-red-400 dark:text-red-400 font-medium'
              : 'text-gray-500 dark:text-gray-500'
          }
        >
          {limitReached
            ? 'Daily limit reached'
            : `${usage.used} of ${usage.limit} questions used today`}
        </span>

        {countdown && (
          <span className="text-gray-500 dark:text-gray-500">
            Resets in {countdown}
          </span>
        )}
      </div>

      {/* Upgrade CTA */}
      {showUpgrade && (
        <div className="text-center pt-1">
          <Link
            href="/profile"
            className="text-vettr-accent dark:text-vettr-accent text-xs hover:underline"
          >
            {upgradeMessage}
          </Link>
        </div>
      )}
    </div>
  );
}
