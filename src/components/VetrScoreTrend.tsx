'use client';

import { VetrScoreTrend as VetrScoreTrendType } from '@/types/api';

interface VetrScoreTrendProps {
  trend: VetrScoreTrendType;
}

export default function VetrScoreTrend({ trend }: VetrScoreTrendProps) {
  // Map direction to colors and icons
  const directionConfig = {
    Improving: {
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    Stable: {
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
        </svg>
      ),
    },
    Declining: {
      color: 'text-error',
      bgColor: 'bg-error/10',
      borderColor: 'border-error/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      ),
    },
  };

  const config = directionConfig[trend.direction];

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Format momentum as percentage with sign
  const formatMomentum = (momentum: number) => {
    const sign = momentum >= 0 ? '+' : '';
    return `${sign}${momentum.toFixed(1)}%`;
  };

  return (
    <div className={`border ${config.borderColor} ${config.bgColor} rounded-lg p-6`}>
      <h3 className="text-lg font-bold text-textPrimary mb-4">Score Trend</h3>

      <div className="space-y-4">
        {/* Direction and Momentum */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${config.color}`}>
              {config.icon}
            </div>
            <div>
              <div className={`text-base font-semibold ${config.color}`}>
                {trend.direction}
              </div>
              <div className="text-sm text-textSecondary">
                Momentum: <span className={config.color}>{formatMomentum(trend.momentum)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Changes */}
        {trend.recent_changes && trend.recent_changes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-textSecondary mb-2">Recent Changes</h4>
            <div className="space-y-2">
              {trend.recent_changes.map((change, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm border-l-2 border-border pl-3 py-1"
                >
                  <div className="flex-shrink-0 w-24 text-textMuted">
                    {formatDate(change.date)}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${change.change >= 0 ? 'text-accent' : 'text-error'}`}>
                      {change.change >= 0 ? '+' : ''}{change.change.toFixed(1)} points
                    </div>
                    <div className="text-textSecondary">{change.reason}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
