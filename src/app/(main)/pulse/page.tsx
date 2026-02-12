'use client'

import { useStocks } from '@/hooks/useStocks'
import { useFilings } from '@/hooks/useFilings'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useToast } from '@/contexts/ToastContext'
import StockCard from '@/components/ui/StockCard'
import FilingTypeIcon from '@/components/ui/FilingTypeIcon'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator'
import { SkeletonCard, SkeletonStockCard } from '@/components/ui/SkeletonLoader'
import EmptyState from '@/components/ui/EmptyState'
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'

export default function PulsePage() {
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const { showToast } = useToast()

  // Fetch all stocks for analysis
  const { stocks, isLoading: isLoadingStocks, error: stocksError } = useStocks({ limit: 100 })

  // Fetch recent filings
  const { filings, isLoading: isLoadingFilings, error: filingsError } = useFilings({ limit: 5 })

  // Fetch watchlist for favorites
  const { watchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving } = useWatchlist()

  // Create set of favorited tickers for quick lookup
  const favoritedTickers = useMemo(() => {
    return new Set(watchlist.map(stock => stock.ticker))
  }, [watchlist])

  // Update last refreshed timestamp when data loads
  useEffect(() => {
    if (!isLoadingStocks && !isLoadingFilings) {
      setLastRefreshed(new Date())
    }
  }, [isLoadingStocks, isLoadingFilings])

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
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-textPrimary mb-2">Pulse</h1>
        <p className="text-textSecondary">Market overview and recent activity</p>
      </div>

      {/* Last Refreshed Banner */}
      <div className="mb-6 px-4 py-2 bg-surface rounded-lg border border-border">
        <p className="text-sm text-textSecondary">
          Last refreshed: {lastRefreshed.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
          })}
        </p>
      </div>

      {/* Market Overview Section */}
      <section className="mb-8">
        <h2 className="text-xl font-bold text-textPrimary mb-4">Market Overview</h2>

        {isLoadingStocks ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : stocksError ? (
          <EmptyState
            icon="⚠️"
            title="Error loading market data"
            message="Unable to fetch market overview. Please try again."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Stocks Tracked */}
            <div className="bg-primaryLight p-5 rounded-lg border border-border">
              <p className="text-textSecondary text-sm mb-1">Stocks Tracked</p>
              <p className="text-3xl font-bold text-textPrimary">{stocksTracked}</p>
            </div>

            {/* Avg VETTR Score */}
            <div className="bg-primaryLight p-5 rounded-lg border border-border">
              <p className="text-textSecondary text-sm mb-1">Avg VETTR Score</p>
              <div className="flex items-center gap-3">
                <p className="text-3xl font-bold text-textPrimary">{avgVetrScore}</p>
                <VetrScoreBadge score={avgVetrScore} size="sm" />
              </div>
            </div>

            {/* Top Gainer */}
            <div className="bg-primaryLight p-5 rounded-lg border border-border">
              <p className="text-textSecondary text-sm mb-1">Top Gainer</p>
              {topGainer ? (
                <div>
                  <Link
                    href={`/stocks/${topGainer.ticker}`}
                    className="text-lg font-bold text-textPrimary hover:text-accent transition-colors"
                  >
                    {topGainer.ticker}
                  </Link>
                  <PriceChangeIndicator change={topGainer.price_change_percent || 0} size="sm" />
                </div>
              ) : (
                <p className="text-textMuted">N/A</p>
              )}
            </div>

            {/* Top Loser */}
            <div className="bg-primaryLight p-5 rounded-lg border border-border">
              <p className="text-textSecondary text-sm mb-1">Top Loser</p>
              {topLoser && topLoser.price_change_percent !== topGainer?.price_change_percent ? (
                <div>
                  <Link
                    href={`/stocks/${topLoser.ticker}`}
                    className="text-lg font-bold text-textPrimary hover:text-accent transition-colors"
                  >
                    {topLoser.ticker}
                  </Link>
                  <PriceChangeIndicator change={topLoser.price_change_percent || 0} size="sm" />
                </div>
              ) : (
                <p className="text-textMuted">N/A</p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Two-column layout for desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Events Section */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-textPrimary">Recent Events</h2>
            {filings && filings.length > 0 && (
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded border border-blue-500/30">
                {filings.filter(f => !f.is_read).length} unread
              </span>
            )}
          </div>

          {isLoadingFilings ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : filingsError ? (
            <EmptyState
              icon="📄"
              title="Error loading filings"
              message="Unable to fetch recent events."
            />
          ) : !filings || filings.length === 0 ? (
            <EmptyState
              icon="📄"
              title="No recent events"
              message="No filings have been published recently."
            />
          ) : (
            <div className="space-y-3">
              {filings.map((filing) => (
                <Link
                  key={filing.id}
                  href={`/filings/${filing.id}`}
                  className="block bg-primaryLight p-4 rounded-lg border border-border hover:border-accent transition-all group"
                >
                  <div className="flex items-start gap-3">
                    {/* Unread indicator (blue dot) */}
                    {!filing.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                    )}
                    <FilingTypeIcon type={filing.type} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-textPrimary group-hover:text-accent transition-colors truncate">
                          {filing.title}
                        </h3>
                        {filing.is_material && (
                          <span className="flex-shrink-0 px-2 py-0.5 bg-warning/20 text-warning text-xs rounded border border-warning/30">
                            Material
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-textSecondary">
                        <span className="font-medium text-accent">{filing.ticker}</span>
                        <span>•</span>
                        <span>{new Date(filing.date_filed).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Top Movers Section */}
        <section>
          <h2 className="text-xl font-bold text-textPrimary mb-4">Top Movers</h2>

          {isLoadingStocks ? (
            <div className="space-y-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : stocksError ? (
            <EmptyState
              icon="📈"
              title="Error loading movers"
              message="Unable to fetch top movers data."
            />
          ) : topMovers.length === 0 ? (
            <EmptyState
              icon="📈"
              title="No movers data"
              message="Insufficient price data to show top movers."
            />
          ) : (
            <div className="space-y-3">
              {topMovers.map((stock) => (
                <Link
                  key={stock.ticker}
                  href={`/stocks/${stock.ticker}`}
                  className="block bg-primaryLight p-4 rounded-lg border border-border hover:border-accent transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-lg font-bold text-textPrimary group-hover:text-accent transition-colors">
                          {stock.ticker}
                        </span>
                        <VetrScoreBadge score={stock.vetr_score || 0} size="sm" />
                      </div>
                      <p className="text-sm text-textSecondary truncate">{stock.company_name}</p>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-lg font-semibold text-textPrimary">
                        ${stock.current_price?.toFixed(2) || 'N/A'}
                      </p>
                      <PriceChangeIndicator change={stock.price_change_percent || 0} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Top VETTR Scores Section */}
      <section>
        <h2 className="text-xl font-bold text-textPrimary mb-4">Top VETTR Scores</h2>

        {isLoadingStocks ? (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex-shrink-0 w-72">
              <SkeletonStockCard />
            </div>
            <div className="flex-shrink-0 w-72">
              <SkeletonStockCard />
            </div>
            <div className="flex-shrink-0 w-72">
              <SkeletonStockCard />
            </div>
          </div>
        ) : stocksError ? (
          <EmptyState
            icon="🏆"
            title="Error loading top scores"
            message="Unable to fetch top VETTR scores."
          />
        ) : topScores.length === 0 ? (
          <EmptyState
            icon="🏆"
            title="No score data"
            message="No stocks with VETTR scores available."
          />
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {topScores.map((stock) => (
              <div key={stock.ticker} className="flex-shrink-0 w-72">
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
