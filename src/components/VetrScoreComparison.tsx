'use client';

import { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import type { VetrScoreComparison as VetrScoreComparisonType } from '@/types/api';
import { useVetrScoreChart, type ScoreSnapshot } from '@/hooks/useVetrScoreChart';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import { BarChartIcon } from '@/components/icons';
import { chartTheme, getScoreColor } from '@/lib/chart-theme';

type ViewMode = 'comparison' | 'performance';

interface VetrScoreComparisonProps {
  comparison: VetrScoreComparisonType | null;
  isLoading: boolean;
  currentTicker: string;
}

// --- Toggle Button ---
function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (mode: ViewMode) => void }) {
  return (
    <div className="inline-flex rounded-lg bg-gray-100 dark:bg-white/[0.05] p-0.5">
      <button
        onClick={() => onChange('comparison')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'comparison'
            ? 'bg-white dark:bg-vettr-accent/20 text-gray-900 dark:text-vettr-accent shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Sector Comparison
      </button>
      <button
        onClick={() => onChange('performance')}
        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
          mode === 'performance'
            ? 'bg-white dark:bg-vettr-accent/20 text-gray-900 dark:text-vettr-accent shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
        }`}
      >
        Score Performance
      </button>
    </div>
  );
}

// --- Performance Chart ---
function PerformanceChart({ ticker }: { ticker: string }) {
  const { snapshots, isLoading, dataPoints } = useVetrScoreChart({ ticker, range: '24h' });

  if (isLoading) {
    return (
      <div className="h-64 flex items-center justify-center">
        <LoadingSpinner size="lg" color="white" />
      </div>
    );
  }

  if (snapshots.length === 0) {
    return (
      <EmptyState
        icon={<BarChartIcon className="w-16 h-16 text-gray-600" />}
        title="No performance data yet"
        description="Score snapshots are recorded hourly. Check back soon for trend data."
      />
    );
  }

  // Format data for the chart
  const chartData = snapshots.map((s: ScoreSnapshot) => {
    const date = new Date(s.recorded_at);
    return {
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      overall: s.overall_score,
      financial_survival: s.financial_survival_score,
      operational_efficiency: s.operational_efficiency_score,
      shareholder_structure: s.shareholder_structure_score,
      market_sentiment: s.market_sentiment_score,
      price: s.price,
    };
  });

  // Get current and earliest scores for summary
  const latest = snapshots[snapshots.length - 1];
  const earliest = snapshots[0];
  const scoreChange = latest.overall_score - earliest.overall_score;

  // Custom tooltip for the performance chart
  const PerformanceTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-gray-500 dark:text-gray-400 text-xs mb-2">{label}</p>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2 text-sm">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-500 dark:text-gray-400">{entry.name === 'overall' ? 'Overall' : entry.name === 'price' ? 'Price' : entry.name.replace('_', ' ')}</span>
              <span className="text-gray-900 dark:text-white font-semibold ml-auto">
                {entry.name === 'price' ? `$${(entry.value ?? 0).toFixed(2)}` : entry.value}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Current Score</p>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{latest.overall_score}</p>
          <p className={`text-xs mt-1 ${scoreChange > 0 ? 'text-vettr-accent' : scoreChange < 0 ? 'text-red-400' : 'text-gray-400'}`}>
            {scoreChange > 0 ? `+${scoreChange}` : scoreChange < 0 ? `${scoreChange}` : 'No change'} in last 24h
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Data Points</p>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{dataPoints}</p>
          <p className="text-gray-400 text-xs mt-1">Hourly snapshots</p>
        </div>
        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Price</p>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">
            {latest.price !== null ? `$${latest.price.toFixed(2)}` : 'N/A'}
          </p>
          {latest.price !== null && earliest.price !== null && (
            <p className={`text-xs mt-1 ${
              latest.price > earliest.price ? 'text-vettr-accent' : latest.price < earliest.price ? 'text-red-400' : 'text-gray-400'
            }`}>
              {latest.price > earliest.price ? '+' : ''}{(latest.price - earliest.price).toFixed(2)} in last 24h
            </p>
          )}
        </div>
      </div>

      {/* Area Chart - Overall Score */}
      <div className="h-64 mb-4" role="img" aria-label={`VETTR score performance chart for ${ticker} over the last 24 hours`}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00E676" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#00E676" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray={chartTheme.grid.strokeDasharray}
              stroke={chartTheme.grid.stroke}
            />
            <XAxis
              dataKey="time"
              stroke={chartTheme.axis.stroke}
              tick={{ fill: '#94a3b8', fontSize: 10 }}
              interval="preserveStartEnd"
              minTickGap={40}
            />
            <YAxis
              stroke={chartTheme.axis.stroke}
              tick={chartTheme.axis.tick}
              domain={['dataMin - 5', 'dataMax + 5']}
              width={40}
            />
            <Tooltip content={<PerformanceTooltip />} />
            <Area
              type="monotone"
              dataKey="overall"
              stroke="#00E676"
              strokeWidth={2}
              fill="url(#scoreGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#00E676', stroke: '#0D1B2A', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-0.5 rounded-full bg-vettr-accent"></div>
          <span>Overall VETTR Score</span>
        </div>
        <span className="text-gray-600">Last 24 hours (hourly)</span>
      </div>
    </>
  );
}

// --- Sector Comparison Chart (existing logic, extracted) ---
function SectorComparisonChart({ comparison }: { comparison: VetrScoreComparisonType }) {
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

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: { ticker: string; company_name: string; score: number; isCurrent: boolean } }[] }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-vettr-card border border-gray-200 dark:border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-gray-900 dark:text-white font-semibold mb-1">{data.company_name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">{data.ticker}</p>
          <p className="text-vettr-accent font-bold">Score: {(data.score ?? 0).toFixed(1)}</p>
          {data.isCurrent && (
            <p className="text-xs text-vettr-accent mt-1">Current Stock</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <>
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Percentile Rank</p>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">
            {(comparison.percentile_rank ?? 0).toFixed(0)}
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

        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Sector Average</p>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{(comparison.sector_average ?? 0).toFixed(1)}</p>
          <p className={`text-xs mt-1 ${
            (comparison.score ?? 0) > (comparison.sector_average ?? 0)
              ? 'text-vettr-accent'
              : (comparison.score ?? 0) < (comparison.sector_average ?? 0)
              ? 'text-red-400'
              : 'text-gray-400'
          }`}>
            {(comparison.score ?? 0) > (comparison.sector_average ?? 0)
              ? `+${((comparison.score ?? 0) - (comparison.sector_average ?? 0)).toFixed(1)} above average`
              : (comparison.score ?? 0) < (comparison.sector_average ?? 0)
              ? `${((comparison.score ?? 0) - (comparison.sector_average ?? 0)).toFixed(1)} below average`
              : 'At sector average'}
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-white/[0.03] rounded-xl p-4">
          <p className="text-gray-500 text-sm mb-1">Current Score</p>
          <p className="text-gray-900 dark:text-white text-2xl font-bold">{(comparison.score ?? 0).toFixed(1)}</p>
          <p className="text-gray-400 text-xs mt-1">
            Ranked #{chartData.findIndex(d => d.ticker === comparison.ticker) + 1} of {chartData.length}
          </p>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64 mb-4" role="img" aria-label={`Bar chart comparing VETTR scores across ${comparison.sector} sector peers`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
          >
            <CartesianGrid
              strokeDasharray={chartTheme.grid.strokeDasharray}
              stroke={chartTheme.grid.stroke}
            />
            <XAxis
              dataKey="ticker"
              stroke={chartTheme.axis.stroke}
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              angle={-45}
              textAnchor="end"
              height={50}
              interval={0}
            />
            <YAxis
              stroke={chartTheme.axis.stroke}
              tick={chartTheme.axis.tick}
              domain={[0, 100]}
              width={40}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(0, 230, 118, 0.1)' }}
            />

            {/* Sector average reference line */}
            <ReferenceLine
              y={comparison.sector_average}
              stroke="#FF9800"
              strokeDasharray="6 4"
              strokeWidth={2}
              label={{
                value: `Avg: ${(comparison.sector_average ?? 0).toFixed(1)}`,
                position: 'right',
                fill: '#FF9800',
                fontSize: 11,
                fontWeight: 600,
              }}
            />

            <Bar dataKey="score" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getScoreColor(entry.score)}
                  opacity={entry.isCurrent ? 1 : 0.8}
                  stroke={entry.isCurrent ? '#00E676' : 'transparent'}
                  strokeWidth={entry.isCurrent ? 2 : 0}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-sm border-2 border-vettr-accent bg-vettr-accent/20"></div>
          <span>Current Stock ({comparison.ticker})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg width="20" height="4"><line x1="0" y1="2" x2="20" y2="2" stroke="#FF9800" strokeWidth="2" strokeDasharray="4 3" /></svg>
          <span>Sector Average</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-500">Score:</span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#166534' }}></span>
            <span>90+</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#00E676' }}></span>
            <span>75+</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#FBBF24' }}></span>
            <span>50+</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#FB923C' }}></span>
            <span>30+</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: '#F87171' }}></span>
            <span>&lt;30</span>
          </span>
        </div>
      </div>
    </>
  );
}

// --- Main Component ---
export default function VetrScoreComparison({ comparison, isLoading, currentTicker }: VetrScoreComparisonProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('comparison');

  if (isLoading) {
    return (
      <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Sector Comparison</h2>
        <div className="h-64 flex items-center justify-center">
          <LoadingSpinner size="lg" color="white" />
        </div>
      </div>
    );
  }

  const hasComparison = comparison && comparison.peers && comparison.peers.length > 0;

  return (
    <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6">
      {/* Header with toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
            {viewMode === 'comparison' ? 'Sector Comparison' : 'Score Performance'}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {viewMode === 'comparison'
              ? comparison
                ? `How ${comparison.ticker} compares to peers in the ${comparison.sector} sector`
                : 'Compare with sector peers'
              : `${currentTicker} VETTR score over the last 24 hours`
            }
          </p>
        </div>
        <ViewToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Content based on view mode */}
      {viewMode === 'comparison' ? (
        hasComparison ? (
          <SectorComparisonChart comparison={comparison!} />
        ) : (
          <EmptyState
            icon={<BarChartIcon className="w-16 h-16 text-gray-600" />}
            title="No comparison data available"
            description="Unable to load peer comparison data for this stock."
          />
        )
      ) : (
        <PerformanceChart ticker={currentTicker} />
      )}
    </div>
  );
}
