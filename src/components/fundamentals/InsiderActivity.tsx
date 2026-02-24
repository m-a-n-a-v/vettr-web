'use client';

import { InsiderActivity } from '@/types/fundamentals';
import { useEffect, useState } from 'react';

interface InsiderActivityProps {
  data: InsiderActivity;
}

export function InsiderActivityComponent({ data }: InsiderActivityProps) {
  const [animateWidths, setAnimateWidths] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimateWidths(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const isNetBuying = data.netBuySellRatio > 0;
  const netActivityColor = isNetBuying ? 'text-emerald-400' : 'text-red-400';
  const netActivityBg = isNetBuying ? 'bg-emerald-400/10' : 'bg-red-400/10';
  const netActivityText = isNetBuying ? 'Net Buying' : 'Net Selling';

  return (
    <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center gap-2 mb-5">
        {/* Users icon */}
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
            d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          />
        </svg>
        <h2 className="text-lg font-semibold text-white">Insider Activity</h2>
      </div>

      {/* Ownership Breakdown */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Ownership Breakdown
        </div>

        {/* Stacked Bar */}
        <div className="flex h-8 rounded-lg overflow-hidden bg-white/5 mb-2">
          <div
            className="bg-vettr-accent transition-all duration-1000 ease-out flex items-center justify-center"
            style={{ width: animateWidths ? `${data.insidersPercent}%` : '0%' }}
          >
            {data.insidersPercent > 10 && (
              <span className="text-xs font-semibold text-vettr-dark px-2">
                {data.insidersPercent.toFixed(1)}%
              </span>
            )}
          </div>
          <div
            className="bg-blue-500 transition-all duration-1000 ease-out flex items-center justify-center"
            style={{ width: animateWidths ? `${data.institutionsPercent}%` : '0%' }}
          >
            {data.institutionsPercent > 10 && (
              <span className="text-xs font-semibold text-white px-2">
                {data.institutionsPercent.toFixed(1)}%
              </span>
            )}
          </div>
          <div
            className="bg-gray-600 transition-all duration-1000 ease-out flex items-center justify-center"
            style={{ width: animateWidths ? `${data.publicPercent}%` : '0%' }}
          >
            {data.publicPercent > 10 && (
              <span className="text-xs font-semibold text-white px-2">
                {data.publicPercent.toFixed(1)}%
              </span>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-vettr-accent" />
            <span className="text-gray-400">Insiders ({data.insidersPercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-400">Institutions ({data.institutionsPercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
            <span className="text-gray-400">Public ({data.publicPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Net Activity Badge */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-2">
          Net Activity
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${netActivityBg}`}>
          {/* Arrow icon */}
          <svg
            className={`w-4 h-4 ${netActivityColor} ${isNetBuying ? '' : 'rotate-180'}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 15.75l7.5-7.5 7.5 7.5"
            />
          </svg>
          <span className={`text-sm font-semibold ${netActivityColor}`}>
            {netActivityText}
          </span>
          <span className="text-xs text-gray-400">
            ({Math.abs(data.netBuySellRatio).toFixed(2)} ratio)
          </span>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Recent Transactions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">
                  Name
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">
                  Type
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">
                  Shares
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.map((transaction, index) => (
                <tr
                  key={index}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-3 py-3">
                    <div className="text-sm text-white font-medium">{transaction.name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{transaction.relation}</div>
                  </td>
                  <td className="px-3 py-3">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                        transaction.type === 'buy'
                          ? 'bg-emerald-400/10 text-emerald-400'
                          : 'bg-red-400/10 text-red-400'
                      }`}
                    >
                      {transaction.type === 'buy' ? 'Buy' : 'Sell'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-white">
                    {transaction.shares.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-gray-400">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
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
