'use client';

import { VetrScoreTrend as VetrScoreTrendType } from '@/types/api';

interface VetrScoreTrendProps {
  trend: VetrScoreTrendType;
}

export default function VetrScoreTrend({ trend }: VetrScoreTrendProps) {
  // Map direction to colors and icons (using 5-tier color scale)
  const directionConfig = {
    Improving: {
      color: 'text-vettr-accent',
      bgColor: 'bg-vettr-accent/10',
      borderColor: 'border-vettr-accent/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    Stable: {
      color: 'text-yellow-400',
      bgColor: 'bg-yellow-400/10',
      borderColor: 'border-yellow-400/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
        </svg>
      ),
    },
    Declining: {
      color: 'text-red-400',
      bgColor: 'bg-red-400/10',
      borderColor: 'border-red-400/30',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
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
    return `${sign}${(momentum ?? 0).toFixed(1)}%`;
  };

  return (
    <div className={`bg-vettr-card/50 border ${config.borderColor} ${config.bgColor} rounded-2xl p-5
                    hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all duration-300`}>
      <h3 className="text-lg font-semibold text-white mb-4">Score Trend</h3>

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
              <div className="text-sm text-gray-400">
                Momentum: <span className={config.color}>{formatMomentum(trend.momentum)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Changes */}
        {trend.recent_changes && trend.recent_changes.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-400 mb-2">Recent Changes</h4>
            <div className="space-y-2">
              {trend.recent_changes.map((change, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm border-l-2 border-white/10 pl-3 py-1"
                >
                  <div className="flex-shrink-0 w-24 text-gray-500">
                    {formatDate(change.date)}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${change.change >= 0 ? 'text-vettr-accent' : 'text-red-400'}`}>
                      {(change.change ?? 0) >= 0 ? '+' : ''}{(change.change ?? 0).toFixed(1)} points
                    </div>
                    <div className="text-gray-400">{change.reason}</div>
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
