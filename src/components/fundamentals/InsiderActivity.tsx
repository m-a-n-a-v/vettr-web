'use client';

import { InsiderActivity } from '@/types/fundamentals';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

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

  // Smart Money signal styling
  const smartMoneyConfig = {
    accumulating: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-400/10',
      label: 'Accumulating',
      pulse: true,
    },
    neutral: {
      color: 'text-gray-400',
      bg: 'bg-gray-400/10',
      label: 'Neutral',
      pulse: false,
    },
    distributing: {
      color: 'text-red-400',
      bg: 'bg-red-400/10',
      label: 'Distributing',
      pulse: false,
    },
  };
  const smartMoney = smartMoneyConfig[data.smartMoneySignal];

  // Institutional flow styling
  const isInstitutionsAccumulating = data.institutionChangePercent > 0;
  const institutionColor = isInstitutionsAccumulating ? 'text-emerald-400' : 'text-red-400';
  const institutionBg = isInstitutionsAccumulating ? 'bg-emerald-400/10' : 'bg-red-400/10';

  // Concentration risk levels
  const concentrationRisk = data.topHoldersConcentration < 30 ? 'Low' :
                            data.topHoldersConcentration < 60 ? 'Moderate' : 'High';
  const concentrationColor = data.topHoldersConcentration < 30 ? 'text-emerald-400' :
                             data.topHoldersConcentration < 60 ? 'text-yellow-400' : 'text-red-400';
  const concentrationBg = data.topHoldersConcentration < 30 ? 'bg-emerald-400/10' :
                          data.topHoldersConcentration < 60 ? 'bg-yellow-400/10' : 'bg-red-400/10';

  return (
    <div className="bg-white/50 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-gray-50 dark:hover:bg-vettr-card/80 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Insider Activity</h2>
        </div>

        {/* Smart Money Signal Badge */}
        <div className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${smartMoney.bg}`}>
          {smartMoney.pulse && (
            <span className="absolute inset-0 rounded-lg bg-emerald-400/20 animate-pulse" />
          )}
          <svg
            className={`w-4 h-4 ${smartMoney.color} relative z-10`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className={`text-xs font-semibold ${smartMoney.color} relative z-10`}>
            {smartMoney.label}
          </span>
        </div>
      </div>

      {/* Smart Money Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Institutional Flow */}
        <div className={`rounded-lg p-3 ${institutionBg}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
            Institutional Flow
          </div>
          <div className="flex items-center gap-2">
            <svg
              className={`w-4 h-4 ${institutionColor} ${isInstitutionsAccumulating ? '' : 'rotate-180'}`}
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
            <span className={`text-lg font-bold ${institutionColor}`}>
              {data.institutionChangePercent > 0 ? '+' : ''}{data.institutionChangePercent.toFixed(1)}%
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">3-month change</div>
        </div>

        {/* Concentration Risk */}
        <div className={`rounded-lg p-3 ${concentrationBg}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
            Concentration Risk
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${concentrationColor}`}>
              {data.topHoldersConcentration.toFixed(1)}%
            </span>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${concentrationBg} ${concentrationColor}`}>
              {concentrationRisk}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Top 5 holders</div>
        </div>

        {/* Net Activity */}
        <div className={`rounded-lg p-3 ${netActivityBg}`}>
          <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-1">
            Net Activity
          </div>
          <div className="flex items-center gap-2">
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
            <span className={`text-lg font-bold ${netActivityColor}`}>
              {netActivityText}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {Math.abs(data.netBuySellRatio).toFixed(2)} ratio
          </div>
        </div>
      </div>

      {/* Ownership Breakdown */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Current Ownership Breakdown
        </div>

        {/* Stacked Bar */}
        <div className="flex h-8 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 mb-2" role="img" aria-label={`Ownership: ${data.insidersPercent.toFixed(1)}% insiders, ${data.institutionsPercent.toFixed(1)}% institutions, ${data.publicPercent.toFixed(1)}% public`}>
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
            <span className="text-gray-500 dark:text-gray-400">Insiders ({data.insidersPercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-gray-500 dark:text-gray-400">Institutions ({data.institutionsPercent.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-600" />
            <span className="text-gray-500 dark:text-gray-400">Public ({data.publicPercent.toFixed(1)}%)</span>
          </div>
        </div>
      </div>

      {/* Quarterly Ownership History Chart */}
      <div className="mb-6">
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Ownership Trend
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.quarterlyOwnershipHistory}>
            <defs>
              <linearGradient id="insidersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00E676" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="institutionsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="quarter"
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#6B7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1E3348',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#fff',
              }}
              formatter={(value: number | undefined) => value !== undefined ? `${value.toFixed(1)}%` : 'N/A'}
            />
            <Area
              type="monotone"
              dataKey="institutionsPercent"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#institutionsGradient)"
              name="Institutions"
            />
            <Area
              type="monotone"
              dataKey="insidersPercent"
              stroke="#00E676"
              strokeWidth={2}
              fill="url(#insidersGradient)"
              name="Insiders"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="text-xs text-gray-500 uppercase tracking-wider font-medium mb-3">
          Recent Transactions
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-gray-200 dark:border-white/5">
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
                  className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <td className="px-3 py-3">
                    <div className="text-sm text-gray-900 dark:text-white font-medium">{transaction.name}</div>
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
                  <td className="px-3 py-3 text-right text-sm text-gray-900 dark:text-white">
                    {transaction.shares.toLocaleString()}
                  </td>
                  <td className="px-3 py-3 text-right text-sm text-gray-500 dark:text-gray-400">
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
