'use client'

import { useMemo } from 'react'
import { SamplePortfolio } from '@/types/api'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import { ArrowUpIcon, ArrowDownIcon, BriefcaseIcon } from '@/components/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SamplePortfolioDashboardProps {
  portfolio: SamplePortfolio
}

const formatCurrency = (value: number) => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
  return `$${value.toFixed(2)}`
}

const HEALTH_TIERS = [
  { key: 'elite' as const, label: 'Elite', color: '#10B981', min: 90 },
  { key: 'contender' as const, label: 'Contender', color: '#14B8A6', min: 75 },
  { key: 'watch' as const, label: 'Watch', color: '#F59E0B', min: 50 },
  { key: 'speculative' as const, label: 'Speculative', color: '#F97316', min: 30 },
  { key: 'toxic' as const, label: 'Toxic', color: '#EF4444', min: 0 },
]

export default function SamplePortfolioDashboard({
  portfolio,
}: SamplePortfolioDashboardProps) {
  const router = useRouter()

  // Compute metrics client-side from the 10 stocks
  const metrics = useMemo(() => {
    const stocks = portfolio.stocks
    const qty = 100 // 100 shares per stock

    const totalValue = stocks.reduce((sum, s) => sum + (s.price || 0) * qty, 0)
    const holdingsCount = stocks.length
    const avgScore =
      stocks.length > 0
        ? Math.round(
            stocks.reduce((sum, s) => sum + (s.vetr_score || 0), 0) / stocks.length
          )
        : 0

    // Health distribution
    const health = {
      elite: { count: 0, pct: 0 },
      contender: { count: 0, pct: 0 },
      watch: { count: 0, pct: 0 },
      speculative: { count: 0, pct: 0 },
      toxic: { count: 0, pct: 0 },
    }

    stocks.forEach((s) => {
      const score = s.vetr_score || 0
      if (score >= 90) health.elite.count++
      else if (score >= 75) health.contender.count++
      else if (score >= 50) health.watch.count++
      else if (score >= 30) health.speculative.count++
      else health.toxic.count++
    })

    if (holdingsCount > 0) {
      health.elite.pct = Math.round((health.elite.count / holdingsCount) * 100)
      health.contender.pct = Math.round((health.contender.count / holdingsCount) * 100)
      health.watch.pct = Math.round((health.watch.count / holdingsCount) * 100)
      health.speculative.pct = Math.round((health.speculative.count / holdingsCount) * 100)
      health.toxic.pct = Math.round((health.toxic.count / holdingsCount) * 100)
    }

    return { totalValue, holdingsCount, avgScore, health }
  }, [portfolio.stocks])

  return (
    <div className="space-y-6">
      {/* Connect Real Portfolio CTA */}
      <div className="bg-gradient-to-r from-vettr-accent/10 to-blue-500/10 border border-vettr-accent/20 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-vettr-accent/20 flex items-center justify-center flex-shrink-0">
            <BriefcaseIcon className="w-5 h-5 text-vettr-accent" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Connect Your Real Portfolio
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              You&apos;re viewing the <span className="font-medium text-gray-700 dark:text-gray-300">{portfolio.icon} {portfolio.name}</span> sample portfolio. Connect your brokerage to see your actual holdings.
            </p>
            <Link
              href="/profile"
              className="inline-block mt-2 px-4 py-1.5 bg-vettr-accent text-vettr-navy text-xs font-semibold rounded-lg hover:bg-vettr-accent/90 transition-colors"
            >
              Connect Portfolio
            </Link>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Total Value */}
          <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">
              Total Value
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(metrics.totalValue)}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {metrics.holdingsCount} holdings
            </p>
          </div>

          {/* Holdings Count */}
          <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">
              Stocks
            </p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {metrics.holdingsCount}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">100 shares each</p>
          </div>

          {/* Avg VETTR Score */}
          <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">
              Avg VETTR Score
            </p>
            <div className="flex items-center gap-2">
              <VetrScoreBadge score={metrics.avgScore} size="sm" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {metrics.avgScore}
              </span>
            </div>
          </div>

          {/* Health Preview */}
          <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">
              Health
            </p>
            <div className="flex h-5 rounded-lg overflow-hidden gap-0.5 mb-2">
              {HEALTH_TIERS.map(
                ({ key, color }) =>
                  metrics.health[key].count > 0 && (
                    <div
                      key={key}
                      className="rounded-sm transition-all duration-500"
                      style={{
                        width: `${metrics.health[key].pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  )
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {HEALTH_TIERS.map(
                ({ key, label, color }) =>
                  metrics.health[key].count > 0 && (
                    <div key={key} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-[10px] text-gray-400">
                        {label} ({metrics.health[key].count})
                      </span>
                    </div>
                  )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Holdings Table */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          Sample Holdings
        </h2>
        <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5">
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Ticker
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Company
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Sector
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Change
                  </th>
                  <th className="px-4 py-3 text-center text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Score
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                    Notional
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-white/[0.03]">
                {portfolio.stocks.map((stock) => {
                  const notional = (stock.price || 0) * 100
                  const changePct = stock.price && stock.price_change
                    ? (stock.price_change / (stock.price - stock.price_change)) * 100
                    : null
                  return (
                    <tr
                      key={stock.ticker}
                      className="hover:bg-gray-50 dark:hover:bg-white/[0.03] cursor-pointer transition-colors"
                      onClick={() => router.push(`/stocks/${stock.ticker}`)}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {stock.ticker}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 dark:text-gray-400 truncate max-w-[180px]">
                        {stock.name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 rounded-full">
                          {stock.sector || 'N/A'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white tabular-nums">
                        {stock.price != null ? `$${stock.price.toFixed(2)}` : '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {changePct != null ? (
                          <span
                            className={`inline-flex items-center gap-0.5 ${
                              changePct >= 0 ? 'text-vettr-accent' : 'text-red-400'
                            }`}
                          >
                            {changePct >= 0 ? (
                              <ArrowUpIcon className="w-3 h-3" />
                            ) : (
                              <ArrowDownIcon className="w-3 h-3" />
                            )}
                            {Math.abs(changePct).toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {stock.vetr_score != null ? (
                            <VetrScoreBadge score={stock.vetr_score} size="sm" animate={false} />
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-gray-900 dark:text-white tabular-nums">
                        {formatCurrency(notional)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50 dark:divide-white/[0.03]">
            {portfolio.stocks.map((stock) => {
              const notional = (stock.price || 0) * 100
              const changePct = stock.price && stock.price_change
                ? (stock.price_change / (stock.price - stock.price_change)) * 100
                : null
              return (
                <button
                  key={stock.ticker}
                  onClick={() => router.push(`/stocks/${stock.ticker}`)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      {stock.vetr_score != null && (
                        <VetrScoreBadge score={stock.vetr_score} size="sm" animate={false} />
                      )}
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {stock.ticker}
                        </span>
                        <p className="text-[11px] text-gray-500 truncate max-w-[160px]">
                          {stock.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white tabular-nums">
                        {stock.price != null ? `$${stock.price.toFixed(2)}` : '—'}
                      </p>
                      {changePct != null && (
                        <p
                          className={`text-xs tabular-nums ${
                            changePct >= 0 ? 'text-vettr-accent' : 'text-red-400'
                          }`}
                        >
                          {changePct >= 0 ? '+' : ''}
                          {changePct.toFixed(2)}%
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}
