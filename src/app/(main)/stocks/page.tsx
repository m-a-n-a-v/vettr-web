'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useStocks } from '@/hooks/useStocks'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useToast } from '@/contexts/ToastContext'
import SearchInput from '@/components/ui/SearchInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonCard } from '@/components/ui/SkeletonLoader'

type SortOption = 'vetr_score' | 'current_price' | 'price_change_percent' | 'company_name' | 'sector'

export default function StocksPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('vetr_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const { showToast } = useToast()

  // Fetch all stocks and watchlist
  const { stocks, isLoading: stocksLoading, isError: stocksError } = useStocks({
    search: searchQuery || undefined,
  })
  const { watchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving, isLoading: watchlistLoading } = useWatchlist()

  // Create set of favorited tickers for quick lookup
  const favoritedTickers = useMemo(() => {
    if (!watchlist) return new Set<string>()
    return new Set(watchlist.map(stock => stock.ticker))
  }, [watchlist])

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let result = stocks || []

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        stock =>
          stock.ticker.toLowerCase().includes(query) ||
          stock.company_name.toLowerCase().includes(query)
      )
    }

    // Filter by favorites only
    if (favoritesOnly) {
      result = result.filter(stock => favoritedTickers.has(stock.ticker))
    }

    // Sort stocks
    result = [...result].sort((a, b) => {
      let compareValue = 0

      switch (sortBy) {
        case 'vetr_score':
          compareValue = (a.vetr_score || 0) - (b.vetr_score || 0)
          break
        case 'current_price':
          compareValue = (a.current_price || 0) - (b.current_price || 0)
          break
        case 'price_change_percent':
          compareValue = (a.price_change_percent || 0) - (b.price_change_percent || 0)
          break
        case 'company_name':
          compareValue = a.company_name.localeCompare(b.company_name)
          break
        case 'sector':
          compareValue = (a.sector || '').localeCompare(b.sector || '')
          break
      }

      return sortOrder === 'asc' ? compareValue : -compareValue
    })

    return result
  }, [stocks, searchQuery, favoritesOnly, favoritedTickers, sortBy, sortOrder])

  // Handle sort option change
  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption)
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
  }

  // Toggle favorites filter
  const toggleFavoritesOnly = () => {
    setFavoritesOnly(prev => !prev)
  }

  // Handle favorite toggle with optimistic UI and toast notifications
  const handleFavoriteToggle = async (ticker: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

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

  // Loading state
  if (stocksLoading || watchlistLoading) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold mb-6">Stocks</h1>

        {/* Filters skeleton */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <SkeletonCard className="h-12 flex-1" />
          <SkeletonCard className="h-12 w-full md:w-48" />
          <SkeletonCard className="h-12 w-12" />
          <SkeletonCard className="h-12 w-12" />
        </div>

        {/* Stock list skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <SkeletonCard key={i} className="h-24" />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (stocksError) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold mb-6">Stocks</h1>
        <EmptyState
          icon="⚠️"
          title="Error loading stocks"
          message="Unable to load stock data. Please try again later."
        />
      </div>
    )
  }

  // Empty state
  if (filteredStocks.length === 0) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold mb-6">Stocks</h1>

        {/* Filters */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by ticker or company name..."
            className="flex-1"
          />

          <SelectDropdown
            value={sortBy}
            onChange={handleSortChange}
            options={[
              { value: 'vetr_score', label: 'VETTR Score' },
              { value: 'current_price', label: 'Price' },
              { value: 'price_change_percent', label: 'Price Change %' },
              { value: 'company_name', label: 'Name' },
              { value: 'sector', label: 'Sector' },
            ]}
            className="w-full md:w-48"
          />

          <button
            onClick={toggleSortOrder}
            className="flex items-center justify-center px-4 py-2 bg-primaryLight text-textPrimary rounded-lg hover:bg-surfaceLight transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <button
            onClick={toggleFavoritesOnly}
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
              favoritesOnly
                ? 'bg-accent text-primary'
                : 'bg-primaryLight text-textSecondary hover:bg-surfaceLight'
            }`}
            title="Favorites Only"
          >
            ★
          </button>
        </div>

        <EmptyState
          icon="📊"
          title="No stocks found"
          message={
            searchQuery || favoritesOnly
              ? 'Try adjusting your filters or search query.'
              : 'No stocks available at this time.'
          }
          actionLabel={searchQuery || favoritesOnly ? 'Clear Filters' : undefined}
          onAction={
            searchQuery || favoritesOnly
              ? () => {
                  setSearchQuery('')
                  setFavoritesOnly(false)
                }
              : undefined
          }
        />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <h1 className="text-2xl font-bold mb-6">Stocks</h1>

      {/* Filters */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by ticker or company name..."
          className="flex-1"
        />

        <SelectDropdown
          value={sortBy}
          onChange={handleSortChange}
          options={[
            { value: 'vetr_score', label: 'VETTR Score' },
            { value: 'current_price', label: 'Price' },
            { value: 'price_change_percent', label: 'Price Change %' },
            { value: 'company_name', label: 'Name' },
            { value: 'sector', label: 'Sector' },
          ]}
          className="w-full md:w-48"
        />

        <button
          onClick={toggleSortOrder}
          className="flex items-center justify-center px-4 py-2 bg-primaryLight text-textPrimary rounded-lg hover:bg-surfaceLight transition-colors"
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </button>

        <button
          onClick={toggleFavoritesOnly}
          className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${
            favoritesOnly
              ? 'bg-accent text-primary'
              : 'bg-primaryLight text-textSecondary hover:bg-surfaceLight'
          }`}
          title="Favorites Only"
        >
          ★
        </button>
      </div>

      {/* Stock count */}
      <div className="mb-4 text-textSecondary">
        {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'}
      </div>

      {/* Stock list - Mobile: Card view, Desktop: Table-like grid */}
      <div className="space-y-3">
        {filteredStocks.map(stock => (
          <Link
            key={stock.ticker}
            href={`/stocks/${stock.ticker}`}
            className="block bg-primaryLight rounded-lg p-4 hover:bg-surfaceLight transition-colors relative group"
          >
            <div className="flex items-center gap-4">
              {/* Company initials avatar */}
              <div className="flex-shrink-0 w-12 h-12 bg-surface rounded-full flex items-center justify-center text-accent font-bold text-lg">
                {stock.company_name
                  .split(' ')
                  .map(word => word[0])
                  .slice(0, 2)
                  .join('')
                  .toUpperCase()}
              </div>

              {/* Stock info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-textPrimary">
                    {stock.ticker}
                  </span>
                  <button
                    onClick={(e) => handleFavoriteToggle(stock.ticker, e)}
                    disabled={isAdding || isRemoving}
                    className="text-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={favoritedTickers.has(stock.ticker) ? 'Remove from watchlist' : 'Add to watchlist'}
                  >
                    {isAdding || isRemoving ? (
                      <span className="text-textMuted animate-pulse">⋯</span>
                    ) : favoritedTickers.has(stock.ticker) ? (
                      <span className="text-accent drop-shadow-sm">★</span>
                    ) : (
                      <span className="text-textMuted group-hover:text-textSecondary">☆</span>
                    )}
                  </button>
                </div>
                <div className="text-sm text-textSecondary truncate">
                  {stock.company_name}
                </div>
              </div>

              {/* Price info - Hidden on mobile, shown on tablet+ */}
              <div className="hidden sm:flex flex-col items-end gap-1">
                <div className="font-semibold text-textPrimary">
                  ${stock.current_price?.toFixed(2) || 'N/A'}
                </div>
                <PriceChangeIndicator
                  change={stock.price_change_percent || 0}
                  size="sm"
                />
              </div>

              {/* VETTR Score */}
              <div className="flex-shrink-0">
                <VetrScoreBadge score={stock.vetr_score || 0} size="sm" />
              </div>
            </div>

            {/* Mobile-only: Price info below */}
            <div className="sm:hidden mt-3 pt-3 border-t border-border flex justify-between items-center">
              <div>
                <div className="text-xs text-textMuted mb-1">Price</div>
                <div className="font-semibold text-textPrimary">
                  ${stock.current_price?.toFixed(2) || 'N/A'}
                </div>
              </div>
              <PriceChangeIndicator
                change={stock.price_change_percent || 0}
                size="sm"
              />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
