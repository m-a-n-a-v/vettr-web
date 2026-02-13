'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { VetrScoreComparison as VetrScoreComparisonType } from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { BarChartIcon } from '@/components/icons';

interface VetrScoreComparisonProps {
  comparison: VetrScoreComparisonType | null;
  isLoading: boolean;
  currentTicker: string;
}

export default function VetrScoreComparison({ comparison, isLoading, currentTicker }: VetrScoreComparisonProps) {
  if (isLoading) {
    return (
      <div className="bg-primaryLight rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-textPrimary mb-4">Sector Comparison</h2>
        <div className="h-80 flex items-center justify-center">
          <LoadingSpinner size="lg" color="accent" />
        </div>
      </div>
    );
  }

  if (!comparison || !comparison.peers || comparison.peers.length === 0) {
    return (
      <div className="bg-primaryLight rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-textPrimary mb-4">Sector Comparison</h2>
        <EmptyState
          icon={<BarChartIcon className="w-16 h-16 text-gray-600" />}
          title="No comparison data available"
          message="Unable to load peer comparison data for this stock."
        />
      </div>
    );
  }

  // Prepare chart data: combine current stock with peers
  const chartData = [
    {
      ticker: comparison.ticker,
      company_name: comparison.ticker,
      score: comparison.score,
      isCurrent: true,
    },
    ...comparison.peers.map(peer => ({
      ticker: peer.ticker,
      company_name: peer.company_name,
      score: peer.score,
      isCurrent: false,
    })),
  ].sort((a, b) => b.score - a.score);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { ticker: string; company_name: string; score: number; isCurrent: boolean } }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-textPrimary font-semibold mb-1">{data.company_name}</p>
          <p className="text-textSecondary text-sm mb-1">{data.ticker}</p>
          <p className="text-accent font-bold">Score: {data.score.toFixed(1)}</p>
          {data.isCurrent && (
            <p className="text-xs text-accent mt-1">Current Stock</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-primaryLight rounded-lg p-6 border border-border">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-textPrimary mb-2">Sector Comparison</h2>
        <p className="text-textSecondary text-sm">
          How {comparison.ticker} compares to peers in the {comparison.sector} sector
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-surface rounded-lg p-4 border border-border">
          <p className="text-textMuted text-sm mb-1">Percentile Rank</p>
          <p className="text-textPrimary text-2xl font-bold">
            {comparison.percentile_rank.toFixed(0)}
            <span className="text-base text-textSecondary">th</span>
          </p>
          <p className="text-textSecondary text-xs mt-1">
            {comparison.percentile_rank >= 75
              ? 'Top quartile'
              : comparison.percentile_rank >= 50
              ? 'Above average'
              : comparison.percentile_rank >= 25
              ? 'Below average'
              : 'Bottom quartile'}
          </p>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <p className="text-textMuted text-sm mb-1">Sector Average</p>
          <p className="text-textPrimary text-2xl font-bold">{comparison.sector_average.toFixed(1)}</p>
          <p className={`text-xs mt-1 ${
            comparison.score > comparison.sector_average
              ? 'text-accent'
              : comparison.score < comparison.sector_average
              ? 'text-error'
              : 'text-textSecondary'
          }`}>
            {comparison.score > comparison.sector_average
              ? `+${(comparison.score - comparison.sector_average).toFixed(1)} above average`
              : comparison.score < comparison.sector_average
              ? `${(comparison.score - comparison.sector_average).toFixed(1)} below average`
              : 'At sector average'}
          </p>
        </div>

        <div className="bg-surface rounded-lg p-4 border border-border">
          <p className="text-textMuted text-sm mb-1">Current Score</p>
          <p className="text-textPrimary text-2xl font-bold">{comparison.score.toFixed(1)}</p>
          <p className="text-textSecondary text-xs mt-1">
            Ranked #{chartData.findIndex(d => d.ticker === comparison.ticker) + 1} of {chartData.length}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-80 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
            <XAxis
              dataKey="ticker"
              stroke="#94A3B8"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke="#94A3B8"
              tick={{ fill: '#94A3B8', fontSize: 12 }}
              domain={[0, 100]}
              label={{ value: 'VETTR Score', angle: -90, position: 'insideLeft', fill: '#94A3B8', fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0, 230, 118, 0.1)' }} />

            {/* Sector average reference line */}
            <ReferenceLine
              y={comparison.sector_average}
              stroke="#FFB300"
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Sector Avg: ${comparison.sector_average.toFixed(1)}`,
                position: 'top',
                fill: '#FFB300',
                fontSize: 12,
              }}
            />

            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCurrent ? '#00E676' : '#2A4058'}
                  opacity={entry.isCurrent ? 1 : 0.7}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-accent"></div>
          <span className="text-textSecondary">Current Stock ({comparison.ticker})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-surfaceLight opacity-70"></div>
          <span className="text-textSecondary">Sector Peers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-warning" style={{ borderTop: '2px dashed #FFB300' }}></div>
          <span className="text-textSecondary">Sector Average</span>
        </div>
      </div>
    </div>
  );
}
