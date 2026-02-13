'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import type { VetrScoreComparison as VetrScoreComparisonType } from '@/types/api';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { BarChartIcon } from '@/components/icons';
import { chartTheme, getTooltipStyle } from '@/lib/chart-theme';

interface VetrScoreComparisonProps {
  comparison: VetrScoreComparisonType | null;
  isLoading: boolean;
  currentTicker: string;
}

export default function VetrScoreComparison({ comparison, isLoading, currentTicker }: VetrScoreComparisonProps) {
  if (isLoading) {
    return (
      <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Sector Comparison</h2>
        <div className="h-80 flex items-center justify-center">
          <LoadingSpinner size="lg" color="white" />
        </div>
      </div>
    );
  }

  if (!comparison || !comparison.peers || comparison.peers.length === 0) {
    return (
      <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-4">Sector Comparison</h2>
        <EmptyState
          icon={<BarChartIcon className="w-16 h-16 text-gray-600" />}
          title="No comparison data available"
          description="Unable to load peer comparison data for this stock."
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
        <div className="bg-vettr-card border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{data.company_name}</p>
          <p className="text-gray-400 text-sm mb-1">{data.ticker}</p>
          <p className="text-vettr-accent font-bold">Score: {data.score.toFixed(1)}</p>
          {data.isCurrent && (
            <p className="text-xs text-vettr-accent mt-1">Current Stock</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white mb-2">Sector Comparison</h2>
        <p className="text-gray-400 text-sm">
          How {comparison.ticker} compares to peers in the {comparison.sector} sector
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Percentile Rank</p>
          <p className="text-white text-2xl font-bold">
            {comparison.percentile_rank.toFixed(0)}
            <span className="text-base text-gray-400">th</span>
          </p>
          <p className="text-gray-400 text-xs mt-1">
            {comparison.percentile_rank >= 75
              ? 'Top quartile'
              : comparison.percentile_rank >= 50
              ? 'Above average'
              : comparison.percentile_rank >= 25
              ? 'Below average'
              : 'Bottom quartile'}
          </p>
        </div>

        <div className="bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Sector Average</p>
          <p className="text-white text-2xl font-bold">{comparison.sector_average.toFixed(1)}</p>
          <p className={`text-xs mt-1 ${
            comparison.score > comparison.sector_average
              ? 'text-vettr-accent'
              : comparison.score < comparison.sector_average
              ? 'text-red-400'
              : 'text-gray-400'
          }`}>
            {comparison.score > comparison.sector_average
              ? `+${(comparison.score - comparison.sector_average).toFixed(1)} above average`
              : comparison.score < comparison.sector_average
              ? `${(comparison.score - comparison.sector_average).toFixed(1)} below average`
              : 'At sector average'}
          </p>
        </div>

        <div className="bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Current Score</p>
          <p className="text-white text-2xl font-bold">{comparison.score.toFixed(1)}</p>
          <p className="text-gray-400 text-xs mt-1">
            Ranked #{chartData.findIndex(d => d.ticker === comparison.ticker) + 1} of {chartData.length}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-80 mb-4" role="img" aria-label={`Bar chart comparing VETTR scores across ${comparison.sector} sector peers`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
          >
            <CartesianGrid
              strokeDasharray={chartTheme.grid.strokeDasharray}
              stroke={chartTheme.grid.stroke}
            />
            <XAxis
              dataKey="ticker"
              stroke={chartTheme.axis.stroke}
              tick={chartTheme.axis.tick}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              stroke={chartTheme.axis.stroke}
              tick={chartTheme.axis.tick}
              domain={[0, 100]}
              label={{
                value: 'VETTR Score',
                angle: -90,
                position: 'insideLeft',
                fill: chartTheme.text.secondary,
                fontSize: 12,
              }}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 230, 118, 0.1)' }}
            />

            {/* Sector average reference line */}
            <ReferenceLine
              y={comparison.sector_average}
              stroke={chartTheme.colors.referenceLine}
              strokeDasharray="5 5"
              strokeWidth={2}
              label={{
                value: `Sector Avg: ${comparison.sector_average.toFixed(1)}`,
                position: 'top',
                fill: chartTheme.colors.referenceLine,
                fontSize: 12,
              }}
            />

            <Bar dataKey="score" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.isCurrent ? chartTheme.colors.barPrimary : chartTheme.colors.barSecondary}
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
          <div className="w-4 h-4 rounded bg-vettr-accent"></div>
          <span className="text-gray-400">Current Stock ({comparison.ticker})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded opacity-70" style={{ backgroundColor: chartTheme.colors.barSecondary }}></div>
          <span className="text-gray-400">Sector Peers</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-0.5 bg-yellow-400" style={{ borderTop: '2px dashed #FBBF24' }}></div>
          <span className="text-gray-400">Sector Average</span>
        </div>
      </div>
    </div>
  );
}
