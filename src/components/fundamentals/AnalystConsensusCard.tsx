'use client';

import { AnalystConsensus } from '@/types/fundamentals';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';

interface AnalystConsensusCardProps {
  data: AnalystConsensus;
}

export function AnalystConsensusCard({ data }: AnalystConsensusCardProps) {
  const [animateWidths, setAnimateWidths] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateWidths(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const totalRatings = data.buyCount + data.holdCount + data.sellCount;
  const buyPercent = (data.buyCount / totalRatings) * 100;
  const holdPercent = (data.holdCount / totalRatings) * 100;
  const sellPercent = (data.sellCount / totalRatings) * 100;

  const upside = data.upsidePercent;
  const isPositiveUpside = upside > 0;

  // Prepare data for recommendation trend chart
  const trendData = data.recommendations.map((rec) => ({
    period: rec.period,
    'Strong Buy': rec.strongBuy,
    Buy: rec.buy,
    Hold: rec.hold,
    Sell: rec.sell,
    'Strong Sell': rec.strongSell,
  }));

  // Get action badge styling
  const getActionBadge = (action: string) => {
    if (action.toLowerCase().includes('upgrade')) {
      return 'bg-emerald-400/10 text-emerald-400';
    } else if (action.toLowerCase().includes('downgrade')) {
      return 'bg-red-400/10 text-red-400';
    } else {
      return 'bg-blue-400/10 text-blue-400';
    }
  };

  return (
    <div className="bg-white/50 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-gray-50 dark:hover:bg-vettr-card/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        {/* Chart icon */}
        <svg
          className="w-5 h-5 text-vettr-accent"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Analyst Consensus</h2>
      </div>

      {/* Consensus Summary */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{data.consensus}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {data.totalAnalysts} analyst{data.totalAnalysts !== 1 ? 's' : ''} covering
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
              Distribution
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-300">
              {data.buyCount}B / {data.holdCount}H / {data.sellCount}S
            </div>
          </div>
        </div>

        {/* Stacked Bar */}
        <div className="flex h-3 rounded-full overflow-hidden bg-gray-100 dark:bg-white/5" role="img" aria-label={`Analyst ratings: ${buyPercent.toFixed(0)}% buy, ${holdPercent.toFixed(0)}% hold, ${sellPercent.toFixed(0)}% sell`}>
          <div
            className="bg-emerald-500 transition-all duration-1000 ease-out"
            style={{ width: animateWidths ? `${buyPercent}%` : '0%' }}
          />
          <div
            className="bg-gray-500 transition-all duration-1000 ease-out"
            style={{ width: animateWidths ? `${holdPercent}%` : '0%' }}
          />
          <div
            className="bg-red-500 transition-all duration-1000 ease-out"
            style={{ width: animateWidths ? `${sellPercent}%` : '0%' }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-gray-500 dark:text-gray-400">Buy ({data.buyCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="text-gray-500 dark:text-gray-400">Hold ({data.holdCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-500 dark:text-gray-400">Sell ({data.sellCount})</span>
          </div>
        </div>
      </div>

      {/* Price Target Section */}
      <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/5">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Price Target
        </div>

        <div className="flex items-center justify-between mb-2 text-xs text-gray-500 dark:text-gray-400">
          <span>${data.priceTargetLow.toFixed(2)}</span>
          <span className="font-semibold text-gray-900 dark:text-white">${data.priceTargetMedian.toFixed(2)}</span>
          <span>${data.priceTargetHigh.toFixed(2)}</span>
        </div>

        {/* Range Indicator */}
        <div className="relative h-2 bg-gray-100 dark:bg-white/5 rounded-full mb-3">
          {/* Green range bar */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-emerald-500/50 to-emerald-500/30 rounded-full" />

          {/* Current price marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-0.5 h-4 bg-white shadow-lg"
            style={{
              left: `${
                ((data.currentPrice - data.priceTargetLow) /
                  (data.priceTargetHigh - data.priceTargetLow)) *
                100
              }%`,
            }}
          >
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-xs font-semibold text-gray-900 dark:text-white whitespace-nowrap">
              ${data.currentPrice.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Upside/Downside Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Target:</span>
          <span
            className={`text-sm font-semibold ${
              isPositiveUpside ? 'text-emerald-400' : 'text-red-400'
            }`}
          >
            {isPositiveUpside ? '+' : ''}
            {upside.toFixed(1)}% {isPositiveUpside ? 'upside' : 'downside'}
          </span>
        </div>
      </div>

      {/* Recommendation Trend */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Recommendation Trend
        </div>

        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={trendData}>
            <XAxis
              dataKey="period"
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E3348',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
            />
            <Bar dataKey="Strong Buy" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Buy" stackId="a" fill="#34d399" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Hold" stackId="a" fill="#6b7280" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Sell" stackId="a" fill="#fb923c" radius={[0, 0, 0, 0]} />
            <Bar dataKey="Strong Sell" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Upgrades/Downgrades */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Recent Activity
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5">
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">
                  Date
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">
                  Firm
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">
                  Action
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">
                  Grade
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentUpgrades.slice(0, 5).map((upgrade, index) => (
                <tr
                  key={index}
                  className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">{upgrade.date}</td>
                  <td className="px-3 py-3 text-sm text-gray-900 dark:text-white font-medium">{upgrade.firm}</td>
                  <td className="px-3 py-3">
                    <span
                      className={`${getActionBadge(
                        upgrade.action
                      )} rounded-full px-2.5 py-0.5 text-xs font-medium`}
                    >
                      {upgrade.action}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-sm text-gray-600 dark:text-gray-300">
                    {upgrade.fromGrade && upgrade.toGrade ? (
                      <>
                        {upgrade.fromGrade}{' '}
                        <svg
                          className="w-3 h-3 inline-block mx-1"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>{' '}
                        {upgrade.toGrade}
                      </>
                    ) : (
                      upgrade.toGrade || '-'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
