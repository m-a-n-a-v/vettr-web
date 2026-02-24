'use client';

import { useState } from 'react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend } from 'recharts';
import { PeerFinancials } from '@/types/fundamentals';
import { getScoreColor } from '@/lib/chart-theme';
import { Sparkline } from '@/components/ui/Sparkline';

interface PeerComparisonFinancialsProps {
  data: PeerFinancials;
  currentTicker: string;
}

type SortField = 'ticker' | 'peRatio' | 'evEbitda' | 'grossMargin' | 'operatingMargin' | 'revenueGrowth' | 'debtToEquity' | 'currentScore';
type SortDirection = 'asc' | 'desc';

export function PeerComparisonFinancials({ data, currentTicker }: PeerComparisonFinancialsProps) {
  const [sortField, setSortField] = useState<SortField>('currentScore');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Find current stock data
  const currentStock = data.peers.find(p => p.ticker === currentTicker);

  // Calculate peer averages for radar chart
  const calculatePeerAverage = (metric: keyof PeerFinancials['peers'][0]) => {
    const peerValues = data.peers
      .filter(p => p.ticker !== currentTicker)
      .map(p => Number(p[metric]) || 0);
    return peerValues.length > 0
      ? peerValues.reduce((sum, val) => sum + val, 0) / peerValues.length
      : 0;
  };

  // Normalize values to 0-100 scale for radar chart
  const normalizeValue = (value: number, max: number, inverted = false): number => {
    const normalized = Math.min((value / max) * 100, 100);
    return inverted ? 100 - normalized : normalized;
  };

  // Prepare radar chart data
  const radarData = currentStock
    ? [
        {
          metric: 'P/E Ratio',
          current: normalizeValue(currentStock.peRatio, 80, true), // Lower is better (inverted)
          peerAvg: normalizeValue(calculatePeerAverage('peRatio'), 80, true),
        },
        {
          metric: 'EV/EBITDA',
          current: normalizeValue(currentStock.evEbitda, 30, true), // Lower is better (inverted)
          peerAvg: normalizeValue(calculatePeerAverage('evEbitda'), 30, true),
        },
        {
          metric: 'Gross Margin',
          current: normalizeValue(currentStock.grossMargin, 100),
          peerAvg: normalizeValue(calculatePeerAverage('grossMargin'), 100),
        },
        {
          metric: 'Op Margin',
          current: normalizeValue(currentStock.operatingMargin, 50),
          peerAvg: normalizeValue(calculatePeerAverage('operatingMargin'), 50),
        },
        {
          metric: 'Rev Growth',
          current: normalizeValue(currentStock.revenueGrowth, 100),
          peerAvg: normalizeValue(calculatePeerAverage('revenueGrowth'), 100),
        },
        {
          metric: 'ROIC',
          current: normalizeValue(currentStock.roic, 40),
          peerAvg: normalizeValue(calculatePeerAverage('roic'), 40),
        },
      ]
    : [];

  // Sort table data
  const sortedPeers = [...data.peers].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    const aNum = Number(aValue) || 0;
    const bNum = Number(bValue) || 0;
    return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
  });

  // Handle column sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Get best value in each column for highlighting
  const getBestValue = (field: SortField) => {
    if (field === 'ticker') return null;

    const values = data.peers.map(p => Number(p[field]) || 0);
    // Lower is better for P/E, EV/EBITDA, Debt/Equity
    const lowerIsBetter = ['peRatio', 'evEbitda', 'debtToEquity'].includes(field);
    return lowerIsBetter ? Math.min(...values) : Math.max(...values);
  };

  // Custom radar chart tooltip
  const RadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-vettr-card border border-white/10 rounded-xl p-3 shadow-xl">
          <p className="text-white text-sm font-semibold mb-2">{payload[0].payload.metric}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-xs">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
              <span className="text-gray-400">{entry.name === 'current' ? currentTicker : 'Peer Avg'}</span>
              <span className="text-white font-semibold ml-auto">{entry.value.toFixed(0)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Radar Chart */}
      {currentStock && (
        <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5 mb-6">
          <h3 className="text-sm font-semibold text-white mb-4">Financial Metrics Comparison</h3>

          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255, 255, 255, 0.1)" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fill: '#94a3b8', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#94a3b8', fontSize: 10 }}
              />
              <Radar
                name="Peer Avg"
                dataKey="peerAvg"
                stroke="#64748b"
                strokeWidth={2}
                fill="#64748b"
                fillOpacity={0.1}
                strokeDasharray="5 5"
              />
              <Radar
                name="current"
                dataKey="current"
                stroke="#00E676"
                strokeWidth={2}
                fill="#00E676"
                fillOpacity={0.25}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '12px',
                  color: '#94a3b8',
                }}
                formatter={(value) => (
                  <span style={{ color: '#94a3b8', fontSize: '12px' }}>
                    {value === 'current' ? currentTicker : value}
                  </span>
                )}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Comparison Table */}
      <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5 overflow-x-auto">
        <h3 className="text-sm font-semibold text-white mb-4">Peer Comparison Table</h3>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-white/5">
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left cursor-pointer hover:text-gray-400 transition-colors sticky left-0 bg-vettr-dark/80 backdrop-blur-sm"
                  onClick={() => handleSort('ticker')}
                >
                  <div className="flex items-center gap-1">
                    Ticker
                    {sortField === 'ticker' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right cursor-pointer hover:text-gray-400 transition-colors"
                  onClick={() => handleSort('peRatio')}
                >
                  <div className="flex items-center justify-end gap-1">
                    P/E
                    {sortField === 'peRatio' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right cursor-pointer hover:text-gray-400 transition-colors"
                  onClick={() => handleSort('evEbitda')}
                >
                  <div className="flex items-center justify-end gap-1">
                    EV/EBITDA
                    {sortField === 'evEbitda' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right cursor-pointer hover:text-gray-400 transition-colors"
                  onClick={() => handleSort('grossMargin')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Gross %
                    {sortField === 'grossMargin' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right cursor-pointer hover:text-gray-400 transition-colors"
                  onClick={() => handleSort('operatingMargin')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Op %
                    {sortField === 'operatingMargin' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right cursor-pointer hover:text-gray-400 transition-colors"
                  onClick={() => handleSort('revenueGrowth')}
                >
                  <div className="flex items-center justify-end gap-1">
                    Rev Growth
                    {sortField === 'revenueGrowth' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right cursor-pointer hover:text-gray-400 transition-colors"
                  onClick={() => handleSort('debtToEquity')}
                >
                  <div className="flex items-center justify-end gap-1">
                    D/E
                    {sortField === 'debtToEquity' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right cursor-pointer hover:text-gray-400 transition-colors"
                  onClick={() => handleSort('currentScore')}
                >
                  <div className="flex items-center justify-end gap-1">
                    VETTR Score
                    {sortField === 'currentScore' && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortDirection === 'asc' ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} />
                      </svg>
                    )}
                  </div>
                </th>
                <th
                  className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    Trend
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPeers.map((peer) => {
                const isCurrent = peer.ticker === currentTicker;
                const peRatioBest = getBestValue('peRatio');
                const evEbitdaBest = getBestValue('evEbitda');
                const grossMarginBest = getBestValue('grossMargin');
                const operatingMarginBest = getBestValue('operatingMargin');
                const revenueGrowthBest = getBestValue('revenueGrowth');
                const debtToEquityBest = getBestValue('debtToEquity');
                const currentScoreBest = getBestValue('currentScore');

                return (
                  <tr
                    key={peer.ticker}
                    className={`border-b border-white/5 hover:bg-white/[0.03] transition-colors ${
                      isCurrent ? 'bg-vettr-accent/5 border-l-2 border-l-vettr-accent' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-white font-medium sticky left-0 bg-vettr-card/80 backdrop-blur-sm">
                      <div>
                        <div className="font-semibold">{peer.ticker}</div>
                        <div className="text-xs text-gray-400 truncate max-w-[120px]">{peer.name}</div>
                      </div>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-white text-right ${
                        peer.peRatio === peRatioBest ? 'font-bold' : ''
                      }`}
                    >
                      {peer.peRatio.toFixed(1)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-white text-right ${
                        peer.evEbitda === evEbitdaBest ? 'font-bold' : ''
                      }`}
                    >
                      {peer.evEbitda.toFixed(1)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-white text-right ${
                        peer.grossMargin === grossMarginBest ? 'font-bold' : ''
                      }`}
                    >
                      {peer.grossMargin.toFixed(1)}%
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-white text-right ${
                        peer.operatingMargin === operatingMarginBest ? 'font-bold' : ''
                      }`}
                    >
                      {peer.operatingMargin.toFixed(1)}%
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-white text-right ${
                        peer.revenueGrowth === revenueGrowthBest ? 'font-bold' : ''
                      }`}
                    >
                      {peer.revenueGrowth > 0 ? '+' : ''}{peer.revenueGrowth.toFixed(1)}%
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-white text-right ${
                        peer.debtToEquity === debtToEquityBest ? 'font-bold' : ''
                      }`}
                    >
                      {peer.debtToEquity.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right ${
                        peer.currentScore === currentScoreBest ? 'font-bold' : ''
                      }`}
                    >
                      <span
                        className="inline-flex items-center justify-center w-12 h-6 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: `${getScoreColor(peer.currentScore)}20`,
                          color: getScoreColor(peer.currentScore)
                        }}
                      >
                        {peer.currentScore}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {peer.scoreTrend && peer.scoreTrend.length > 0 && (
                        <div className="flex items-center justify-center">
                          <Sparkline
                            data={peer.scoreTrend}
                            width={50}
                            height={20}
                            className="opacity-70 hidden min-[375px]:inline-block"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
