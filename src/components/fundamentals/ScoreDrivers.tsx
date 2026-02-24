'use client';

import { useRouter } from 'next/navigation';
import { FundamentalsData } from '@/types/fundamentals';
import { getScoreColor } from '@/lib/chart-theme';

interface ScoreDriversProps {
  ticker: string;
  fundamentals: FundamentalsData | undefined;
}

export function ScoreDrivers({ ticker, fundamentals }: ScoreDriversProps) {
  const router = useRouter();

  if (!fundamentals) {
    return null;
  }

  const { financialHealth, earningsQuality, analystConsensus } = fundamentals;

  // Calculate insider ownership (for demo, use a realistic value from fundamentals data if available)
  // For now, we'll derive it from the financial health or use a placeholder
  const insiderOwnership = 12.4; // Placeholder - in real app, would come from fundamentals data

  // Define the 4 score drivers aligned with the 4 pillars
  const drivers = [
    {
      pillar: 'Financial Survival',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      ),
      metric: `${financialHealth.cashRunwayMonths.toFixed(1)} months`,
      label: 'Cash Runway',
      value: Math.min(100, (financialHealth.cashRunwayMonths / 36) * 100), // Normalize to 0-100
    },
    {
      pillar: 'Operational Efficiency',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3 3v18h18" />
          <path d="M18 17V9" />
          <path d="M13 17V5" />
          <path d="M8 17v-3" />
        </svg>
      ),
      metric: `${(financialHealth.grossMargin * 100).toFixed(1)}%`,
      label: 'Gross Margin',
      value: financialHealth.grossMargin * 100, // Already 0-100
    },
    {
      pillar: 'Shareholder Structure',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      metric: `${insiderOwnership.toFixed(1)}%`,
      label: 'Insider Ownership',
      value: Math.min(100, insiderOwnership * 5), // Normalize to 0-100 (20% insider = 100 score)
    },
    {
      pillar: 'Market Sentiment',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M3 3v18h18" />
          <path d="m19 9-5 5-4-4-3 3" />
        </svg>
      ),
      metric: `${analystConsensus.consensus} (${analystConsensus.totalAnalysts})`,
      label: 'Analyst Consensus',
      value: getConsensusScore(analystConsensus.consensus),
    },
  ];

  const handleNavigateToFundamentals = () => {
    router.push(`/stocks/${ticker}?tab=fundamentals`);
  };

  return (
    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-white/10">
      {/* Score Drivers Section */}
      <div className="space-y-2">
        {drivers.map((driver, index) => (
          <button
            key={index}
            onClick={handleNavigateToFundamentals}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/[0.03] transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-vettr-accent transition-colors">
                {driver.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                {driver.pillar}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: getScoreColor(driver.value) }}
                />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                  {driver.metric}
                </span>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {driver.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* View all fundamentals link */}
      <button
        onClick={handleNavigateToFundamentals}
        className="w-full mt-4 text-xs text-vettr-accent hover:text-vettr-accent/80 transition-colors flex items-center justify-center gap-1 group"
      >
        <span>View all fundamentals</span>
        <svg
          className="w-3 h-3 group-hover:translate-x-0.5 transition-transform"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

// Helper function to convert consensus string to a 0-100 score
function getConsensusScore(consensus: string): number {
  const consensusLower = consensus.toLowerCase();
  if (consensusLower.includes('strong buy')) return 95;
  if (consensusLower.includes('buy')) return 80;
  if (consensusLower.includes('hold')) return 60;
  if (consensusLower.includes('sell') && !consensusLower.includes('strong')) return 40;
  if (consensusLower.includes('strong sell')) return 20;
  return 60; // Default to hold
}
