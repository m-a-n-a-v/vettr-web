'use client'

import { useStocks } from '@/hooks/useStocks'
import { useFilings } from '@/hooks/useFilings'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useRedFlagTrend } from '@/hooks/useRedFlagTrend'
import { useToast } from '@/contexts/ToastContext'
import { useRefresh } from '@/hooks/useRefresh'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import StockCard from '@/components/ui/StockCard'
import FilingTypeIcon from '@/components/ui/FilingTypeIcon'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator'
import { SkeletonMetricCard, SkeletonStockCard, SkeletonFilingRow } from '@/components/ui/SkeletonLoader'
import EmptyState from '@/components/ui/EmptyState'
import RefreshButton from '@/components/ui/RefreshButton'
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator'
import { ArrowUpIcon, ArrowDownIcon, FlagIcon, AlertTriangleIcon, DocumentIcon, TrendingUpIcon, TrophyIcon } from '@/components/icons'
import Link from 'next/link'
import { useState, useEffect, useMemo, useCallback } from 'react'

export default function PulsePage() {
  const { showToast } = useToast()
  const [isMobile, setIsMobile] = useState(false)

  // Fetch all stocks for analysis
  const { stocks, isLoading: isLoadingStocks, error: stocksError, mutate: mutateStocks } = useStocks({ limit: 100 })

  // Fetch recent filings (limit: 10 to share SWR cache key with Discovery page)
  const { filings: allRecentFilings, isLoading: isLoadingFilings, error: filingsError, mutate: mutateFilings } = useFilings({ limit: 10 })
  // Only show 5 on Pulse
  const filings = useMemo(() => allRecentFilings.slice(0, 5), [allRecentFilings])

  // Fetch red flag trend data
  const { trend: redFlagTrend, isLoading: isLoadingRedFlagTrend, error: redFlagTrendError, mutate: mutateRedFlagTrend } = useRedFlagTrend()

  // Fetch watchlist for favorites
  const { watchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving } = useWatchlist()

  // Create set of favorited tickers for quick lookup
  const favoritedTickers = useMemo(() => {
    return new Set(watchlist.map(stock => stock.ticker))
  }, [watchlist])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Refresh handler
  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([
        mutateStocks(),
        mutateFilings(),
        mutateRedFlagTrend(),
      ])
      showToast('Data refreshed successfully', 'success')
    } catch (error) {
      showToast('Failed to refresh data', 'error')
      throw error
    }
  }, [mutateStocks, mutateFilings, mutateRedFlagTrend, showToast])

  // Use refresh hook with debouncing
  const { isRefreshing, lastRefreshed, handleRefresh, canRefresh } = useRefresh({
    onRefresh: handleRefreshData,
    debounceMs: 5000,
  })

  // Pull-to-refresh for mobile
  const { isPulling, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: isMobile,
    threshold: 80,
  })

  // Calculate market overview metrics
  const stocksTracked = stocks?.length || 0
  const avgVetrScore = stocks && stocks.length > 0
    ? Math.round(stocks.reduce((sum, s) => sum + (s.vetr_score || 0), 0) / stocks.length)
    : 0

  // Get top gainer and top loser
  const sortedByChange = stocks ? [...stocks].sort((a, b) =>
    (b.price_change_percent || 0) - (a.price_change_percent || 0)
  ) : []
  const topGainer = sortedByChange[0]
  const topLoser = sortedByChange[sortedByChange.length - 1]

  // Get top VETTR scores (top 5)
  const topScores = stocks
    ? [...stocks]
        .filter(s => s.vetr_score !== null && s.vetr_score !== undefined)
        .sort((a, b) => (b.vetr_score || 0) - (a.vetr_score || 0))
        .slice(0, 5)
    : []

  // Get top movers (largest absolute price changes, max 5)
  const topMovers = stocks
    ? [...stocks]
        .filter(s => s.price_change_percent !== null && s.price_change_percent !== undefined)
        .sort((a, b) => Math.abs(b.price_change_percent || 0) - Math.abs(a.price_change_percent || 0))
        .slice(0, 5)
    : []

  // Handle favorite toggle with optimistic UI and toast notifications
  const handleFavoriteToggle = async (ticker: string) => {
    try {
      const isFavorite = favoritedTickers.has(ticker)
      if (isFavorite) {
        await removeFromWatchlist(ticker)
        showToast('Removed from watchlist', 'success')
      } else {
        await addToWatchlist(ticker)
        showToast('Added to watchlist', 'success')
      }
    } catch (error) {
      showToast('Failed to update watchlist', 'error')
    }
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      {/* Pull-to-refresh indicator (mobile only) */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        pullDistance={pullDistance}
        threshold={80}
      />

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Market Pulse</h1>
            <p className="text-sm text-gray-500">
              Last updated: {lastRefreshed ? lastRefreshed.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
              }) : 'Never'}
            </p>
          </div>
          {/* Desktop refresh button */}
          <div className="hidden md:block">
            <RefreshButton
              onClick={handleRefresh}
              isRefreshing={isRefreshing}
              disabled={!canRefresh}
            />
          </div>
        </div>
      </div>

      {/* Market Overview Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Market Overview</h2>

        {isLoadingStocks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
            <SkeletonMetricCard />
          </div>
        ) : stocksError ? (
          <EmptyState
            icon={<AlertTriangleIcon className="w-16 h-16 text-yellow-400" />}
            title="Error loading market data"
            description="Unable to fetch market overview. Please try again."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stocks Tracked */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Stocks Tracked</p>
              <p className="text-2xl font-bold text-white">{stocksTracked}</p>
            </div>

            {/* Avg VETTR Score */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Avg VETTR Score</p>
              <div className="flex items-center gap-3">
                <p className="text-2xl font-bold text-white">{avgVetrScore}</p>
                <VetrScoreBadge score={avgVetrScore} size="sm" />
              </div>
            </div>

            {/* Top Gainer */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Top Gainer</p>
              {topGainer ? (
                <div>
                  <Link
                    href={`/stocks/${topGainer.ticker}`}
                    className="text-lg font-bold text-white hover:text-vettr-accent transition-colors"
                  >
                    {topGainer.ticker}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowUpIcon className="w-3 h-3 text-vettr-accent" />
                    <span className="text-sm font-medium text-vettr-accent">
                      {Math.abs(topGainer.price_change_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">N/A</p>
              )}
            </div>

            {/* Top Loser */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Top Loser</p>
              {topLoser && topLoser.price_change_percent !== topGainer?.price_change_percent ? (
                <div>
                  <Link
                    href={`/stocks/${topLoser.ticker}`}
                    className="text-lg font-bold text-white hover:text-vettr-accent transition-colors"
                  >
                    {topLoser.ticker}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <ArrowDownIcon className="w-3 h-3 text-red-400" />
                    <span className="text-sm font-medium text-red-400">
                      {Math.abs(topLoser.price_change_percent || 0).toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">N/A</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Red Flag Summary Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Red Flag Summary</h2>

        {isLoadingRedFlagTrend ? (
          <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-white/5 rounded animate-pulse" />
                  <div className="h-10 w-24 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-white/5 rounded animate-pulse" />
                  <div className="h-3 w-full bg-white/5 rounded-full animate-pulse" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-16 bg-white/5 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-white/5 rounded animate-pulse" />
                </div>
                <div className="space-y-1">
                  <div className="h-3 w-12 bg-white/5 rounded animate-pulse" />
                  <div className="h-6 w-12 bg-white/5 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        ) : redFlagTrendError ? (
          <EmptyState
            icon={<FlagIcon className="w-16 h-16 text-red-400" />}
            title="Error loading red flag trends"
            description="Unable to fetch red flag trend data."
          />
        ) : redFlagTrend ? (
          <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
              {/* Total Active Flags */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Total Active Flags</p>
                <div className="flex items-baseline gap-3">
                  <p className="text-4xl font-bold text-white">{redFlagTrend.total_active_flags ?? 0}</p>
                  {(redFlagTrend.change_30_days ?? 0) !== 0 && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      (redFlagTrend.change_30_days ?? 0) > 0 ? 'text-red-400' : 'text-vettr-accent'
                    }`}>
                      {(redFlagTrend.change_30_days ?? 0) > 0 ? (
                        <ArrowUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                      )}
                      <span>{Math.abs(redFlagTrend.change_30_days ?? 0)}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
              </div>

              {/* 30-Day Change Visualization */}
              <div>
                <p className="text-sm text-gray-400 mb-2">30-Day Change</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/5 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (redFlagTrend.change_30_days ?? 0) > 0 ? 'bg-red-400' : 'bg-vettr-accent'
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(redFlagTrend.change_30_days ?? 0) / Math.max(redFlagTrend.total_active_flags ?? 1, 1) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className={`text-lg font-bold ${
                    (redFlagTrend.change_30_days ?? 0) > 0 ? 'text-red-400' :
                    (redFlagTrend.change_30_days ?? 0) < 0 ? 'text-vettr-accent' : 'text-gray-500'
                  }`}>
                    {(redFlagTrend.change_30_days ?? 0) > 0 ? '+' : ''}{redFlagTrend.change_30_days ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Severity Breakdown */}
            <div>
              <p className="text-sm text-gray-400 mb-3">Breakdown by Severity</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Critical */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Critical</p>
                  </div>
                  <p className="text-2xl font-bold text-red-400">{redFlagTrend.breakdown_by_severity?.critical ?? 0}</p>
                </div>

                {/* High */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-orange-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">High</p>
                  </div>
                  <p className="text-2xl font-bold text-orange-400">{redFlagTrend.breakdown_by_severity?.high ?? 0}</p>
                </div>

                {/* Moderate */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Moderate</p>
                  </div>
                  <p className="text-2xl font-bold text-yellow-400">{redFlagTrend.breakdown_by_severity?.moderate ?? 0}</p>
                </div>

                {/* Low */}
                <div className="bg-white/[0.03] rounded-xl p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Low</p>
                  </div>
                  <p className="text-2xl font-bold text-gray-400">{redFlagTrend.breakdown_by_severity?.low ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {/* Recent Filings Section */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-lg font-semibold text-white">Recent Filings</h2>
          {filings && filings.length > 0 && (
            <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
              {filings.filter(f => !f.is_read).length} unread
            </span>
          )}
        </div>

        {isLoadingFilings ? (
          <>
            {/* Desktop Table Skeleton */}
            <div className="hidden md:block bg-vettr-card/50 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Type</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Title</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Ticker</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Date</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Material</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <SkeletonFilingRow />
                  <SkeletonFilingRow />
                  <SkeletonFilingRow />
                  <SkeletonFilingRow />
                  <SkeletonFilingRow />
                </tbody>
              </table>
            </div>

            {/* Mobile Card Skeleton */}
            <div className="md:hidden space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-vettr-card/50 border border-white/5 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 bg-white/5 rounded-full animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-3/4 bg-white/5 rounded animate-pulse" />
                      <div className="h-3 w-1/2 bg-white/5 rounded animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
                        <div className="h-5 w-16 bg-white/5 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : filingsError ? (
          <EmptyState
            icon={<DocumentIcon className="w-16 h-16 text-yellow-400" />}
            title="Error loading filings"
            description="Unable to fetch recent events."
          />
        ) : !filings || filings.length === 0 ? (
          <EmptyState
            icon={<DocumentIcon className="w-16 h-16 text-gray-600" />}
            title="No recent events"
            description="No filings have been published recently."
          />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block bg-vettr-card/50 border border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Type</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Title</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Ticker</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Date</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Material</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filings.map((filing) => (
                    <tr
                      key={filing.id}
                      onClick={() => window.location.href = `/filings/${filing.id}`}
                      className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="px-4 py-3">
                        <FilingTypeIcon type={filing.type} size="sm" />
                      </td>
                      <td className="px-4 py-3 text-sm text-white max-w-md truncate">
                        {filing.title}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-medium text-vettr-accent">{filing.ticker}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {new Date(filing.date_filed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-4 py-3">
                        {filing.is_material ? (
                          <span className="px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs font-medium rounded-full">
                            Yes
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!filing.is_read ? (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-xs font-medium rounded-full">
                            Unread
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Read</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {filings.map((filing) => (
                <Link
                  key={filing.id}
                  href={`/filings/${filing.id}`}
                  className="block bg-vettr-card/50 border border-white/5 rounded-2xl p-4 hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all"
                >
                  <div className="flex items-start gap-3">
                    {!filing.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
                    )}
                    <FilingTypeIcon type={filing.type} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">
                          {filing.title}
                        </h3>
                        {filing.is_material && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-yellow-500/10 text-yellow-400 text-xs rounded-full">
                            Material
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <span className="font-medium text-vettr-accent">{filing.ticker}</span>
                        <span>•</span>
                        <span>{new Date(filing.date_filed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Top Movers Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Top Movers</h2>

        {isLoadingStocks ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-vettr-card/50 border border-white/5 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                      <div className="h-6 w-6 bg-white/5 rounded-full animate-pulse" />
                    </div>
                    <div className="h-3 w-2/3 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="text-right space-y-1">
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse ml-auto" />
                    <div className="h-4 w-12 bg-white/5 rounded animate-pulse ml-auto" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : stocksError ? (
          <EmptyState
            icon={<TrendingUpIcon className="w-16 h-16 text-yellow-400" />}
            title="Error loading movers"
            description="Unable to fetch top movers data."
          />
        ) : topMovers.length === 0 ? (
          <EmptyState
            icon={<TrendingUpIcon className="w-16 h-16 text-gray-600" />}
            title="No movers data"
            description="Insufficient price data to show top movers."
          />
        ) : (
          <div className="space-y-2">
            {topMovers.map((stock) => (
              <Link
                key={stock.ticker}
                href={`/stocks/${stock.ticker}`}
                className="block bg-vettr-card/50 border border-white/5 rounded-2xl p-4 hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-base font-bold text-white group-hover:text-vettr-accent transition-colors">
                        {stock.ticker}
                      </span>
                      <VetrScoreBadge score={stock.vetr_score || 0} size="sm" />
                    </div>
                    <p className="text-sm text-gray-400 truncate">{stock.company_name}</p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-base font-semibold text-white">
                      ${stock.current_price?.toFixed(2) || 'N/A'}
                    </p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      (stock.price_change_percent || 0) >= 0 ? 'text-vettr-accent' : 'text-red-400'
                    }`}>
                      {(stock.price_change_percent || 0) >= 0 ? (
                        <ArrowUpIcon className="w-3 h-3" />
                      ) : (
                        <ArrowDownIcon className="w-3 h-3" />
                      )}
                      <span className="text-sm font-medium">
                        {Math.abs(stock.price_change_percent || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Top VETTR Scores Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Top VETTR Scores</h2>

        {isLoadingStocks ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex-shrink-0 w-full sm:w-72">
              <SkeletonStockCard />
            </div>
            <div className="flex-shrink-0 w-full sm:w-72">
              <SkeletonStockCard />
            </div>
            <div className="flex-shrink-0 w-full sm:w-72">
              <SkeletonStockCard />
            </div>
          </div>
        ) : stocksError ? (
          <EmptyState
            icon={<TrophyIcon className="w-16 h-16 text-yellow-400" />}
            title="Error loading top scores"
            description="Unable to fetch top VETTR scores."
          />
        ) : topScores.length === 0 ? (
          <EmptyState
            icon={<TrophyIcon className="w-16 h-16 text-gray-600" />}
            title="No score data"
            description="No stocks with VETTR scores available."
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {topScores.map((stock) => (
              <div key={stock.ticker} className="flex-shrink-0 w-full sm:w-72 snap-start">
                <StockCard
                  stock={stock}
                  showFavorite={true}
                  isFavorite={favoritedTickers.has(stock.ticker)}
                  onFavoriteToggle={handleFavoriteToggle}
                  isTogglingFavorite={isAdding || isRemoving}
                />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
