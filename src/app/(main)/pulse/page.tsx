'use client'

import { useWatchlist } from '@/hooks/useWatchlist'
import { useRedFlagTrend } from '@/hooks/useRedFlagTrend'
import { usePulseSummary } from '@/hooks/usePulseSummary'
import { usePortfolioSummary } from '@/hooks/usePortfolio'
import { usePortfolioAlerts, usePortfolioAlertUnreadCount, markAlertRead, markAllAlertsRead } from '@/hooks/usePortfolioAlerts'
import { usePortfolioInsights, dismissInsight } from '@/hooks/usePortfolioInsights'
import { useMaterialNews } from '@/hooks/useNews'
import { useSamplePortfolios } from '@/hooks/useSamplePortfolios'
import { useSamplePortfolioSelection } from '@/hooks/useSamplePortfolioSelection'
import { useToast } from '@/contexts/ToastContext'
import { useRefresh } from '@/hooks/useRefresh'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import EmptyState from '@/components/ui/EmptyState'
import RefreshButton from '@/components/ui/RefreshButton'
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator'
import SamplePortfolioPicker from '@/components/pulse/SamplePortfolioPicker'
import SamplePortfolioDashboard from '@/components/pulse/SamplePortfolioDashboard'
import { ArrowUpIcon, ArrowDownIcon, FlagIcon, AlertTriangleIcon, StarIcon, BriefcaseIcon } from '@/components/icons'
import LoginPrompt from '@/components/ui/LoginPrompt'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect, useMemo, useCallback } from 'react'

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'border-red-500/20 bg-red-500/5 text-red-400',
  warning: 'border-orange-500/20 bg-orange-500/5 text-orange-400',
  info: 'border-blue-500/20 bg-blue-500/5 text-blue-400',
}

const ALERT_TYPE_LABELS: Record<string, string> = {
  insider_buy: 'Insider Buy',
  insider_sell: 'Insider Sell',
  hold_expiry: 'Hold Expiry',
  cash_runway: 'Cash Runway',
  warrant_breach: 'Warrant Breach',
  score_change: 'Score Change',
  executive_change: 'Executive Change',
  filing_published: 'Filing Published',
  flow_through_warning: 'Flow-Through',
}

export default function PulsePage() {
  const router = useRouter()
  const { showToast } = useToast()
  const { isAuthenticated } = useAuth()
  const [isMobile, setIsMobile] = useState(false)

  // Portfolio data (only fetch when authenticated)
  const { summaries: portfolioSummaries, isLoading: isLoadingPortfolio, mutate: mutatePortfolio } = usePortfolioSummary({ enabled: isAuthenticated })
  const { alerts, mutate: mutateAlerts } = usePortfolioAlerts({ unreadOnly: true, limit: 5, enabled: isAuthenticated })
  const { unreadCount, mutate: mutateUnreadCount } = usePortfolioAlertUnreadCount({ enabled: isAuthenticated })
  const { insights, mutate: mutateInsights } = usePortfolioInsights(undefined, { enabled: isAuthenticated })
  const { articles: materialNews } = useMaterialNews(3)

  // Existing watchlist data (kept for secondary sections — only when authenticated)
  const { watchlist: stocks, isLoading: isLoadingStocks, mutate: mutateStocks } = useWatchlist({ enabled: isAuthenticated })
  const { summary: pulseSummary, isLoading: isLoadingPulse, mutate: mutatePulse } = usePulseSummary({ enabled: isAuthenticated })
  const { trend: redFlagTrend, mutate: mutateRedFlagTrend } = useRedFlagTrend({ enabled: isAuthenticated })

  const hasPortfolio = portfolioSummaries.length > 0

  // Sample portfolio state (for authenticated users without a real portfolio)
  const { selectedId: samplePortfolioId, select: selectSamplePortfolio, isHydrated } = useSamplePortfolioSelection()
  const needsSamplePortfolio = isAuthenticated && !hasPortfolio && !isLoadingPortfolio
  const { portfolios: samplePortfolios, isLoading: isLoadingSamples } = useSamplePortfolios({ enabled: needsSamplePortfolio })
  const selectedSamplePortfolio = useMemo(
    () => samplePortfolios.find((p) => p.id === samplePortfolioId) || null,
    [samplePortfolios, samplePortfolioId]
  )

  // Aggregate portfolio totals
  const portfolioTotals = useMemo(() => {
    if (portfolioSummaries.length === 0) return null
    return portfolioSummaries.reduce(
      (acc, s) => ({
        totalValue: acc.totalValue + s.total_value,
        totalCost: acc.totalCost + s.total_cost,
        totalPnl: acc.totalPnl + s.total_pnl,
        vettrCoverageValue: acc.vettrCoverageValue + s.vettr_coverage_value,
        holdingsCount: acc.holdingsCount + s.holdings_count,
      }),
      { totalValue: 0, totalCost: 0, totalPnl: 0, vettrCoverageValue: 0, holdingsCount: 0 }
    )
  }, [portfolioSummaries])

  const totalPnlPct = portfolioTotals && portfolioTotals.totalCost > 0
    ? ((portfolioTotals.totalPnl / portfolioTotals.totalCost) * 100)
    : 0

  const vettrCoveragePct = portfolioTotals && portfolioTotals.totalValue > 0
    ? ((portfolioTotals.vettrCoverageValue / portfolioTotals.totalValue) * 100)
    : 0

  // Derived watchlist data
  const sortedByChange = useMemo(() => stocks ? [...stocks].sort((a, b) => (b.price_change_percent || 0) - (a.price_change_percent || 0)) : [], [stocks])
  const topGainers = sortedByChange.filter(s => (s.price_change_percent || 0) > 0).slice(0, 3)
  const topLosers = sortedByChange.filter(s => (s.price_change_percent || 0) < 0).slice(-3).reverse()
  const activeInsights = useMemo(() => insights.filter(i => !i.is_dismissed).slice(0, 4), [insights])

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
      await Promise.all([mutatePortfolio(), mutateStocks(), mutateAlerts(), mutateInsights(), mutateRedFlagTrend(), mutatePulse(), mutateUnreadCount()])
      showToast('Data refreshed successfully', 'success')
    } catch {
      showToast('Failed to refresh data', 'error')
    }
  }, [mutatePortfolio, mutateStocks, mutateAlerts, mutateInsights, mutateRedFlagTrend, mutatePulse, mutateUnreadCount, showToast])

  const { isRefreshing, lastRefreshed, handleRefresh, canRefresh } = useRefresh({ onRefresh: handleRefreshData, debounceMs: 5000 })
  const { isPulling, pullDistance } = usePullToRefresh({ onRefresh: handleRefresh, enabled: isMobile, threshold: 80 })

  const handleDismissInsight = useCallback(async (insightId: string) => {
    try {
      await dismissInsight(insightId)
      await mutateInsights()
      showToast('Insight dismissed', 'success')
    } catch {
      showToast('Failed to dismiss', 'error')
    }
  }, [mutateInsights, showToast])

  const handleMarkAllRead = useCallback(async () => {
    try {
      await markAllAlertsRead()
      await Promise.all([mutateAlerts(), mutateUnreadCount()])
      showToast('All alerts marked as read', 'success')
    } catch {
      showToast('Failed to mark alerts read', 'error')
    }
  }, [mutateAlerts, mutateUnreadCount, showToast])

  const handleMarkAlertRead = useCallback(async (alertId: string) => {
    try {
      await markAlertRead(alertId)
      await Promise.all([mutateAlerts(), mutateUnreadCount()])
    } catch {
      // silent
    }
  }, [mutateAlerts, mutateUnreadCount])

  const isLoading = isLoadingPortfolio || isLoadingStocks
  const isEmptyWatchlist = !isLoadingStocks && stocks.length === 0

  // Watchlist health (existing logic)
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

  const redFlagCategories = pulseSummary?.red_flag_categories

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <PullToRefreshIndicator isPulling={isPulling} pullDistance={pullDistance} threshold={80} />

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {hasPortfolio ? 'Portfolio Pulse' : 'Market Pulse'}
            </h1>
            <p className="text-sm text-gray-500">
              Last updated: {lastRefreshed ? lastRefreshed.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : 'Never'}
            </p>
          </div>
          <div className="hidden md:block">
            <RefreshButton onClick={handleRefresh} isRefreshing={isRefreshing} disabled={!canRefresh} />
          </div>
        </div>
      </div>

      {/* Guest CTA - when not logged in */}
      {!isAuthenticated && (
        <section className="mb-6">
          <div className="bg-gradient-to-r from-vettr-accent/10 to-blue-500/10 border border-vettr-accent/20 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-vettr-accent/20 flex items-center justify-center flex-shrink-0">
                <BriefcaseIcon className="w-6 h-6 text-vettr-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Welcome to VETTR</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Sign in to connect your portfolio, get AI-powered insights, and receive personalized alerts for your Canadian small-cap holdings.
                </p>
                <div className="flex items-center gap-3 mt-4">
                  <Link
                    href="/login"
                    className="px-4 py-2 bg-vettr-accent text-vettr-navy text-sm font-semibold rounded-lg hover:bg-vettr-accent/90 transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    className="px-4 py-2 bg-white/80 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white text-sm font-semibold rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  >
                    Create Account
                  </Link>
                  <Link
                    href="/stocks"
                    className="text-sm text-gray-500 dark:text-gray-400 hover:text-vettr-accent transition-colors ml-1"
                  >
                    Browse Stocks &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Sample Portfolio Flow (authenticated, no real portfolio) */}
      {needsSamplePortfolio && isHydrated && !samplePortfolioId && (
        <section className="mb-6">
          <SamplePortfolioPicker
            portfolios={samplePortfolios}
            isLoading={isLoadingSamples}
            onSelect={selectSamplePortfolio}
          />
        </section>
      )}

      {needsSamplePortfolio && isHydrated && samplePortfolioId && selectedSamplePortfolio && (
        <section className="mb-6">
          <SamplePortfolioDashboard portfolio={selectedSamplePortfolio} />
        </section>
      )}

      {/* Fallback: authenticated, no portfolio, no sample selected, and samples loaded but empty */}
      {isAuthenticated && !hasPortfolio && isHydrated && !samplePortfolioId && !isLoadingSamples && samplePortfolios.length === 0 && isEmptyWatchlist && (
        <EmptyState
          icon={<StarIcon className="w-16 h-16 text-gray-600" />}
          title="Get Started with VETTR"
          description="Connect your portfolio or add stocks to your watchlist to see personalized insights."
          actionLabel="Browse Stocks"
          onAction={() => router.push('/stocks')}
        />
      )}

      {/* =================== PORTFOLIO SECTION =================== */}
      {hasPortfolio && portfolioTotals && (
        <>
          {/* Portfolio Summary Cards */}
          <section className="mb-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Total Value */}
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Total Value</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(portfolioTotals.totalValue)}</p>
                <p className="text-xs text-gray-400 mt-0.5">{portfolioTotals.holdingsCount} holdings</p>
              </div>

              {/* Total P&L */}
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Unrealized P&L</p>
                <div className="flex items-center gap-1.5">
                  {portfolioTotals.totalPnl >= 0 ? (
                    <ArrowUpIcon className="w-4 h-4 text-vettr-accent" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-400" />
                  )}
                  <p className={`text-xl font-bold ${portfolioTotals.totalPnl >= 0 ? 'text-vettr-accent' : 'text-red-400'}`}>
                    {formatCurrency(Math.abs(portfolioTotals.totalPnl))}
                  </p>
                </div>
                <p className={`text-xs mt-0.5 ${totalPnlPct >= 0 ? 'text-vettr-accent' : 'text-red-400'}`}>
                  {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
                </p>
              </div>

              {/* VETTR Coverage */}
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">VETTR Coverage</p>
                <p className="text-xl font-bold text-vettr-accent">{vettrCoveragePct.toFixed(0)}%</p>
                <p className="text-xs text-gray-400 mt-0.5">{formatCurrency(portfolioTotals.vettrCoverageValue)} covered</p>
              </div>

              {/* Alerts */}
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mb-1">Unread Alerts</p>
                <p className={`text-xl font-bold ${unreadCount > 0 ? 'text-orange-400' : 'text-gray-900 dark:text-white'}`}>
                  {unreadCount}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{activeInsights.length} active insight{activeInsights.length !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </section>

          {/* Portfolio Alerts */}
          {alerts.length > 0 && (
            <section className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Alerts</h2>
                {unreadCount > 1 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-vettr-accent hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="space-y-2">
                {alerts.map((alert) => (
                  <button
                    key={alert.id}
                    onClick={() => {
                      handleMarkAlertRead(alert.id)
                      if (alert.deep_link) router.push(alert.deep_link)
                    }}
                    className="w-full text-left bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-xl p-3 hover:bg-gray-50 dark:hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {!alert.is_read && (
                        <span className="w-2 h-2 rounded-full bg-vettr-accent mt-1.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase ${SEVERITY_STYLES[alert.severity] ?? 'border-gray-500/20 bg-gray-500/5 text-gray-400'}`}>
                            {ALERT_TYPE_LABELS[alert.alert_type] ?? alert.alert_type}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{alert.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{alert.message}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 flex-shrink-0">
                        {new Date(alert.triggered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Portfolio Insights */}
          {activeInsights.length > 0 && (
            <section className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">AI Insights</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeInsights.map((insight) => (
                  <div
                    key={insight.id}
                    className={`rounded-xl p-4 border ${SEVERITY_STYLES[insight.severity] ?? 'border-gray-200 dark:border-white/5'}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-wide opacity-70">
                          {insight.insight_type.replace(/_/g, ' ')}
                        </span>
                        <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{insight.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{insight.summary}</p>
                      </div>
                      <button
                        onClick={() => handleDismissInsight(insight.id)}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 flex-shrink-0"
                        title="Dismiss"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* Connect Portfolio CTA (when no portfolio and no sample dashboard showing) */}
      {!hasPortfolio && !isEmptyWatchlist && !(samplePortfolioId && selectedSamplePortfolio) && (
        <section className="mb-6">
          <div className="bg-gradient-to-r from-vettr-accent/10 to-vettr-accent/5 border border-vettr-accent/20 rounded-2xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-vettr-accent/20 flex items-center justify-center flex-shrink-0">
                <BriefcaseIcon className="w-5 h-5 text-vettr-accent" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Connect Your Portfolio</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Link your brokerage or upload a CSV to unlock portfolio analytics, AI insights, and personalized alerts.
                </p>
                <Link
                  href="/profile"
                  className="inline-block mt-3 px-4 py-2 bg-vettr-accent text-vettr-navy text-xs font-semibold rounded-lg hover:bg-vettr-accent/90 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* =================== WATCHLIST/MARKET SECTION =================== */}
      {!isEmptyWatchlist && (
        <>
          {/* Material News */}
          {materialNews.length > 0 && (
            <section className="mb-6">
              <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-amber-600 dark:text-amber-400">Material Events</h3>
                  <Link href="/news" className="text-xs text-amber-500 hover:underline">View All</Link>
                </div>
                <div className="space-y-2">
                  {materialNews.map((article) => (
                    <div key={article.id} className="flex items-start gap-3">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{article.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {article.tickers.join(', ')} &middot; {new Date(article.published_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Market Overview Row */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Watchlist Overview</h2>
            {isLoading ? (
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
                      { key: 'elite' as const, label: 'Elite', color: '#10B981' },
                      { key: 'contender' as const, label: 'Contender', color: '#14B8A6' },
                      { key: 'watchlist' as const, label: 'Watch', color: '#F59E0B' },
                      { key: 'speculative' as const, label: 'Speculative', color: '#F97316' },
                      { key: 'toxic' as const, label: 'Toxic', color: '#EF4444' },
                    ].map(({ key, label, color }) => (
                      <div key={key} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                          <span className="text-xs text-gray-400">{label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{watchlistHealth[key].count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Gainers */}
                <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Top Gainers</p>
                  {topGainers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No gainers today</p>
                  ) : (
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
                    </div>
                  )}
                </div>

                {/* Top Losers */}
                <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-3 font-medium">Top Losers</p>
                  {topLosers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-6">No losers today</p>
                  ) : (
                    <div className="space-y-2">
                      {topLosers.map((stock) => (
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Red Flag Summary */}
          <section className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Red Flag Summary</h2>
            {isLoadingPulse ? (
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 h-40 animate-pulse" />
            ) : (
              <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
                <div className="flex flex-wrap gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 text-sm font-medium">
                    <FlagIcon className="w-3.5 h-3.5" />
                    Critical ({redFlagCategories?.critical_count ?? redFlagTrend?.breakdown_by_severity?.critical ?? 0})
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium">
                    <AlertTriangleIcon className="w-3.5 h-3.5" />
                    Warnings ({redFlagCategories?.warning_count ?? redFlagTrend?.breakdown_by_severity?.moderate ?? 0})
                  </span>
                </div>

                {redFlagCategories && redFlagCategories.categories.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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

                {redFlagCategories?.latest_alert && (
                  <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10 mt-4">
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
        </>
      )}
    </div>
  )
}
