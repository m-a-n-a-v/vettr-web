'use client'

import { useFilings } from '@/hooks/useFilings'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useRedFlagTrend } from '@/hooks/useRedFlagTrend'
import { usePulseSummary } from '@/hooks/usePulseSummary'
import { useToast } from '@/contexts/ToastContext'
import { useRefresh } from '@/hooks/useRefresh'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import EmptyState from '@/components/ui/EmptyState'
import RefreshButton from '@/components/ui/RefreshButton'
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator'
import { ArrowUpIcon, ArrowDownIcon, FlagIcon, AlertTriangleIcon, StarIcon } from '@/components/icons'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react'

// Sector color map
const SECTOR_COLORS: Record<string, string> = {
  'Mining': '#F59E0B',
  'Gold': '#F59E0B',
  'Base Metals': '#F59E0B',
  'Precious Metals': '#F59E0B',
  'Energy': '#10B981',
  'Oil & Gas': '#10B981',
  'Technology': '#3B82F6',
  'Cannabis': '#8B5CF6',
  'Healthcare': '#EF4444',
  'Real Estate': '#F97316',
  'Financial': '#14B8A6',
  'Uranium': '#6366F1',
  'Lithium': '#EC4899',
}

function getSectorColor(sector: string): string {
  return SECTOR_COLORS[sector] || '#64748B'
}

// Filing type badge
function getFilingBadge(type: string): { label: string; color: string; bg: string } {
  switch (type) {
    case 'Press Release':
      return { label: 'News Release', color: 'text-blue-400', bg: 'bg-blue-500/10' }
    case 'MD&A':
      return { label: 'MD&A', color: 'text-purple-400', bg: 'bg-purple-500/10' }
    case 'Financial Statements':
      return { label: 'Financials', color: 'text-green-400', bg: 'bg-green-500/10' }
    case 'Material Change':
      return { label: 'Material Change', color: 'text-yellow-400', bg: 'bg-yellow-500/10' }
    default:
      return { label: 'Filing', color: 'text-gray-400', bg: 'bg-gray-500/10' }
  }
}

export default function PulsePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const [isMobile, setIsMobile] = useState(false)

  // Data hooks
  const { watchlist: stocks, isLoading: isLoadingStocks, error: stocksError, mutate: mutateStocks } = useWatchlist()
  const { filings: allRecentFilings, isLoading: isLoadingFilings, mutate: mutateFilings } = useFilings({ limit: 10 })
  const { summary: pulseSummary, isLoading: isLoadingPulse, mutate: mutatePulse } = usePulseSummary()
  const { trend: redFlagTrend, isLoading: isLoadingRedFlagTrend, mutate: mutateRedFlagTrend } = useRedFlagTrend()

  // Watchlist tickers set
  const watchlistTickers = useMemo(() => new Set(stocks.map(s => s.ticker)), [stocks])

  // Filter filings to watchlist, limit 4
  const filings = useMemo(() => {
    return allRecentFilings.filter(f => watchlistTickers.has(f.ticker)).slice(0, 4)
  }, [allRecentFilings, watchlistTickers])

  // Mobile detection
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  // Refresh
  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([mutateStocks(), mutateFilings(), mutateRedFlagTrend(), mutatePulse()])
      showToast('Data refreshed successfully', 'success')
    } catch {
      showToast('Failed to refresh data', 'error')
    }
  }, [mutateStocks, mutateFilings, mutateRedFlagTrend, mutatePulse, showToast])

  const { isRefreshing, lastRefreshed, handleRefresh, canRefresh } = useRefresh({ onRefresh: handleRefreshData, debounceMs: 5000 })
  const { isPulling, pullDistance } = usePullToRefresh({ onRefresh: handleRefresh, enabled: isMobile, threshold: 80 })

  // Derived data
  const sortedByChange = useMemo(() => stocks ? [...stocks].sort((a, b) => (b.price_change_percent || 0) - (a.price_change_percent || 0)) : [], [stocks])
  const topGainers = sortedByChange.slice(0, 2)
  const topLosers = sortedByChange.slice(-2).reverse()

  const topScores = useMemo(() => stocks
    ? [...stocks].filter(s => s.vetr_score != null).sort((a, b) => (b.vetr_score || 0) - (a.vetr_score || 0)).slice(0, 4)
    : [], [stocks])

  const topMovers = useMemo(() => stocks
    ? [...stocks].filter(s => s.price_change_percent != null).sort((a, b) => Math.abs(b.price_change_percent || 0) - Math.abs(a.price_change_percent || 0)).slice(0, 4)
    : [], [stocks])

  // Watchlist health: prefer API, fallback to client-side (5-tier)
  const watchlistHealth = pulseSummary?.watchlist_health ?? (() => {
    const total = stocks?.length || 0
    const elite = stocks?.filter(s => (s.vetr_score || 0) >= 90).length || 0
    const contender = stocks?.filter(s => (s.vetr_score || 0) >= 75 && (s.vetr_score || 0) < 90).length || 0
    const watchlistCount = stocks?.filter(s => (s.vetr_score || 0) >= 50 && (s.vetr_score || 0) < 75).length || 0
    const speculative = stocks?.filter(s => (s.vetr_score || 0) >= 30 && (s.vetr_score || 0) < 50).length || 0
    const toxic = stocks?.filter(s => (s.vetr_score || 0) < 30).length || 0
    return {
      elite: { count: elite, pct: total > 0 ? Math.round((elite / total) * 100) : 0 },
      contender: { count: contender, pct: total > 0 ? Math.round((contender / total) * 100) : 0 },
      watchlist: { count: watchlistCount, pct: total > 0 ? Math.round((watchlistCount / total) * 100) : 0 },
      speculative: { count: speculative, pct: total > 0 ? Math.round((speculative / total) * 100) : 0 },
      toxic: { count: toxic, pct: total > 0 ? Math.round((toxic / total) * 100) : 0 },
    }
  })()

  // Sector exposure: prefer API, fallback to client-side
  const sectorExposure = pulseSummary?.sector_exposure ?? (() => {
    if (!stocks || stocks.length === 0) return []
    const map = new Map<string, { count: number; exchange: string }>()
    for (const s of stocks) {
      const sector = s.sector || 'Other'
      const ex = map.get(sector)
      if (ex) ex.count++
      else map.set(sector, { count: 1, exchange: s.exchange || '' })
    }
    const total = stocks.length
    return Array.from(map.entries())
      .map(([sector, d]) => ({ sector, exchange: d.exchange, count: d.count, pct: Math.round((d.count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
  })()

  const redFlagCategories = pulseSummary?.red_flag_categories
  const isEmptyWatchlist = !isLoadingStocks && stocks.length === 0
  const isLoadingOverview = isLoadingStocks || isLoadingPulse

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <PullToRefreshIndicator isPulling={isPulling} pullDistance={pullDistance} threshold={80} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Market Pulse</h1>
            <p className="text-sm text-gray-500">
              Last updated: {lastRefreshed ? lastRefreshed.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Never'}
            </p>
          </div>
          <div className="hidden md:block">
            <RefreshButton onClick={handleRefresh} isRefreshing={isRefreshing} disabled={!canRefresh} />
          </div>
        </div>
      </div>

      {isEmptyWatchlist && (
        <EmptyState
          icon={<StarIcon className="w-16 h-16 text-gray-600" />}
          title="Your Watchlist is Empty"
          description="Add stocks to your watchlist to see personalized market insights."
          actionLabel="Browse Stocks"
          onAction={() => router.push('/stocks')}
        />
      )}

      {!isEmptyWatchlist && (
        <>
          {/* ============ ROW 1: Market Overview (3 columns) ============ */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Market Overview</h2>

            {isLoadingOverview ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 h-48 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Watchlist Health */}
                <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Watchlist Health</p>
                  <div className="flex h-6 rounded-lg overflow-hidden gap-0.5 mb-4">
                    {watchlistHealth.elite.count > 0 && (
                      <div className="rounded-md transition-all duration-500" style={{ width: `${watchlistHealth.elite.pct}%`, backgroundColor: '#10B981' }} />
                    )}
                    {watchlistHealth.contender.count > 0 && (
                      <div className="rounded-md transition-all duration-500" style={{ width: `${watchlistHealth.contender.pct}%`, backgroundColor: '#14B8A6' }} />
                    )}
                    {watchlistHealth.watchlist.count > 0 && (
                      <div className="rounded-md transition-all duration-500" style={{ width: `${watchlistHealth.watchlist.pct}%`, backgroundColor: '#F59E0B' }} />
                    )}
                    {watchlistHealth.speculative.count > 0 && (
                      <div className="rounded-md transition-all duration-500" style={{ width: `${watchlistHealth.speculative.pct}%`, backgroundColor: '#F97316' }} />
                    )}
                    {watchlistHealth.toxic.count > 0 && (
                      <div className="rounded-md transition-all duration-500" style={{ width: `${watchlistHealth.toxic.pct}%`, backgroundColor: '#EF4444' }} />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {[
                      { key: 'elite' as const, label: 'Elite (Strong Buy)', color: '#10B981' },
                      { key: 'contender' as const, label: 'Contender (Accumulate)', color: '#14B8A6' },
                      { key: 'watchlist' as const, label: 'Watchlist (Hold)', color: '#F59E0B' },
                      { key: 'speculative' as const, label: 'Speculative (Avoid)', color: '#F97316' },
                      { key: 'toxic' as const, label: 'Toxic (Strong Sell)', color: '#EF4444' },
                    ].map(({ key, label, color }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-xs text-gray-400">{label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{watchlistHealth[key].count} ({watchlistHealth[key].pct}%)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sector Exposure */}
                <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Sector Exposure</p>
                  {sectorExposure.length === 0 ? (
                    <p className="text-sm text-gray-500">No sectors to display</p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {sectorExposure.slice(0, 6).map((item) => (
                        <div key={item.sector} className="rounded-xl p-3 border border-gray-200 dark:border-white/5" style={{ backgroundColor: `${getSectorColor(item.sector)}15` }}>
                          <div className="text-xs font-medium truncate" style={{ color: getSectorColor(item.sector) }}>{item.sector}</div>
                          <div className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{item.pct}%</div>
                          <div className="text-[10px] text-gray-500">{item.count} stock{item.count !== 1 ? 's' : ''}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Top Gainers & Losers */}
                <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Gainers & Losers</p>
                  <div className="space-y-2">
                    {topGainers.map((stock) => (
                      <Link key={stock.ticker} href={`/stocks/${stock.ticker}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                        <div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{stock.ticker}</span>
                          <p className="text-[11px] text-gray-500 truncate max-w-[120px]">{stock.company_name}</p>
                        </div>
                        <div className="flex items-center gap-1 text-vettr-accent">
                          <ArrowUpIcon className="w-3 h-3" />
                          <span className="text-sm font-semibold">{Math.abs(stock.price_change_percent || 0).toFixed(2)}%</span>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-gray-200 dark:border-white/5 my-1" />
                    {topLosers.filter(s => (s.price_change_percent || 0) < 0).map((stock) => (
                      <Link key={stock.ticker} href={`/stocks/${stock.ticker}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                        <div>
                          <span className="text-sm font-bold text-gray-900 dark:text-white">{stock.ticker}</span>
                          <p className="text-[11px] text-gray-500 truncate max-w-[120px]">{stock.company_name}</p>
                        </div>
                        <div className="flex items-center gap-1 text-red-400">
                          <ArrowDownIcon className="w-3 h-3" />
                          <span className="text-sm font-semibold">{Math.abs(stock.price_change_percent || 0).toFixed(2)}%</span>
                        </div>
                      </Link>
                    ))}
                    {topLosers.filter(s => (s.price_change_percent || 0) < 0).length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-1">No losers</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ============ ROW 2: Red Flag Summary (full width) ============ */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Red Flag Summary</h2>

            {isLoadingPulse || isLoadingRedFlagTrend ? (
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 h-40 animate-pulse" />
            ) : (
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                {/* Badge pills */}
                <div className="flex flex-wrap gap-3 mb-5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                    <FlagIcon className="w-3.5 h-3.5" />
                    Critical Flags ({redFlagCategories?.critical_count ?? redFlagTrend?.breakdown_by_severity?.critical ?? 0})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium">
                    <AlertTriangleIcon className="w-3.5 h-3.5" />
                    Warnings ({redFlagCategories?.warning_count ?? redFlagTrend?.breakdown_by_severity?.moderate ?? 0})
                  </span>
                </div>

                {/* Category cards */}
                {redFlagCategories && redFlagCategories.categories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {redFlagCategories.categories.map((cat) => (
                      <div key={cat.category} className={`rounded-xl p-4 border ${cat.severity === 'critical' ? 'border-red-500/20 bg-red-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`w-2 h-2 rounded-full ${cat.severity === 'critical' ? 'bg-red-400' : 'bg-orange-400'}`} />
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{cat.category}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{cat.label}</p>
                        <p className="text-xs text-gray-500 mt-1">{cat.stock_count} stock{cat.stock_count !== 1 ? 's' : ''} affected</p>
                      </div>
                    ))}
                    {/* Fill empty slots to always show 3 columns */}
                    {Array.from({ length: Math.max(0, 3 - redFlagCategories.categories.length) }).map((_, i) => {
                      const existingCats = new Set(redFlagCategories.categories.map(c => c.category))
                      const allCats = ['Financial Risk', 'Governance', 'Momentum']
                      const missing = allCats.filter(c => !existingCats.has(c))
                      return (
                        <div key={`empty-${i}`} className="rounded-xl p-4 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{missing[i] || 'Other'}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-500">All Clear</p>
                          <p className="text-xs text-gray-600 mt-1">No flags detected</p>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    {['Financial Risk', 'Governance', 'Momentum'].map((cat) => (
                      <div key={cat} className="rounded-xl p-4 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-400" />
                          <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{cat}</span>
                        </div>
                        <p className="text-sm font-semibold text-gray-500">All Clear</p>
                        <p className="text-xs text-gray-600 mt-1">No flags detected</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Latest alert banner */}
                {redFlagCategories?.latest_alert && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    {redFlagCategories.latest_alert.is_new && (
                      <span className="flex-shrink-0 px-2 py-0.5 text-[10px] font-bold uppercase bg-red-500 text-white rounded">New</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{redFlagCategories.latest_alert.ticker}</span>
                      <span className="text-sm text-gray-400"> — {redFlagCategories.latest_alert.label}</span>
                    </div>
                    <Link href={`/stocks/${redFlagCategories.latest_alert.ticker}`} className="text-xs text-vettr-accent hover:underline flex-shrink-0">View</Link>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ============ ROW 3: Bottom sections (3 columns) ============ */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Smart Filings (SEDAR+) */}
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Smart Filings (SEDAR+)</p>
                  <Link href="/stocks" className="text-xs text-vettr-accent hover:underline">View All</Link>
                </div>
                {isLoadingFilings ? (
                  <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />)}</div>
                ) : filings.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No recent filings</p>
                ) : (
                  <div className="space-y-2">
                    {filings.map((filing) => {
                      const badge = getFilingBadge(filing.type)
                      return (
                        <Link key={filing.id} href={`/filings/${filing.id}`} className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                          <div className="flex items-start gap-2 mb-1">
                            <span className={`flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded ${badge.bg} ${badge.color}`}>{badge.label}</span>
                            {!filing.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0 mt-1" />}
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white truncate">{filing.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-medium text-vettr-accent">{filing.ticker}</span>
                            <span className="text-[10px] text-gray-500">{new Date(filing.date_filed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Watchlist Movers */}
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Watchlist Movers</p>
                  <Link href="/stocks?sort=change&order=desc" className="text-xs text-vettr-accent hover:underline">View All</Link>
                </div>
                {isLoadingStocks ? (
                  <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />)}</div>
                ) : topMovers.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No movers data</p>
                ) : (
                  <div className="space-y-2">
                    {topMovers.map((stock) => (
                      <Link key={stock.ticker} href={`/stocks/${stock.ticker}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-vettr-accent transition-colors">{stock.ticker}</span>
                            <VetrScoreBadge score={stock.vetr_score || 0} size="sm" />
                          </div>
                          <p className="text-[11px] text-gray-500 truncate mt-0.5">{stock.company_name}</p>
                        </div>
                        <div className={`flex items-center gap-1 ml-3 ${(stock.price_change_percent || 0) >= 0 ? 'text-vettr-accent' : 'text-red-400'}`}>
                          {(stock.price_change_percent || 0) >= 0 ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />}
                          <span className="text-sm font-semibold">{Math.abs(stock.price_change_percent || 0).toFixed(2)}%</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Top VETTR Scores (vertical ranked list) */}
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Top VETTR Scores</p>
                  <Link href="/stocks?sort=vetr_score&order=desc" className="text-xs text-vettr-accent hover:underline">View All</Link>
                </div>
                {isLoadingStocks ? (
                  <div className="space-y-3">{[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse" />)}</div>
                ) : topScores.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-6">No scores available</p>
                ) : (
                  <div className="space-y-2">
                    {topScores.map((stock, idx) => (
                      <Link key={stock.ticker} href={`/stocks/${stock.ticker}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors group">
                        <span className="text-lg font-bold text-gray-600 w-6 text-center">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-vettr-accent transition-colors">{stock.ticker}</span>
                          <p className="text-[11px] text-gray-500 truncate">{stock.company_name}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-vettr-accent">{Math.round(stock.vetr_score || 0)}</span>
                          <p className="text-[10px] text-gray-500">/ 100</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
