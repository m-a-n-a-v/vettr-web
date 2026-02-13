'use client'

// Disable static generation due to useSearchParams()
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useStocks } from '@/hooks/useStocks'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useToast } from '@/contexts/ToastContext'
import { useRefresh } from '@/hooks/useRefresh'
import { usePullToRefresh } from '@/hooks/usePullToRefresh'
import SearchInput from '@/components/ui/SearchInput'
import SelectDropdown from '@/components/ui/SelectDropdown'
import VetrScoreBadge from '@/components/ui/VetrScoreBadge'
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonStockRow } from '@/components/ui/SkeletonLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator'
import type { Stock } from '@/types/api'

type SortOption = 'vetr_score' | 'current_price' | 'price_change_percent' | 'company_name' | 'sector'
type ViewMode = 'card' | 'table'

const STOCKS_PER_PAGE = 25

function StocksPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'vetr_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('order') as 'asc' | 'desc') || 'desc')
  const [favoritesOnly, setFavoritesOnly] = useState(searchParams.get('favorites') === 'true')
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [offset, setOffset] = useState(0)
  const [allStocks, setAllStocks] = useState<Stock[]>([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const { showToast } = useToast()

  // Load view preference from localStorage on mount
  useEffect(() => {
    setIsClient(true)
    const savedView = localStorage.getItem('stocks_view_mode')
    if (savedView === 'card' || savedView === 'table') {
      setViewMode(savedView)
    }
  }, [])

  // Save view preference to localStorage when it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('stocks_view_mode', viewMode)
    }
  }, [viewMode, isClient])

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch stocks with pagination
  const { stocks, pagination, isLoading: stocksLoading, isError: stocksError, mutate: mutateStocks } = useStocks({
    search: searchQuery || undefined,
    limit: STOCKS_PER_PAGE,
    offset: offset,
  })
  const { watchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving, isLoading: watchlistLoading } = useWatchlist()

  // Accumulate stocks as we load more pages
  useEffect(() => {
    if (stocks && stocks.length > 0) {
      if (offset === 0) {
        // First page - replace all stocks
        setAllStocks(stocks)
      } else {
        // Subsequent pages - append new stocks, avoiding duplicates
        setAllStocks(prev => {
          const existingTickers = new Set(prev.map(s => s.ticker))
          const newStocks = stocks.filter(s => !existingTickers.has(s.ticker))
          return [...prev, ...newStocks]
        })
      }
      setIsLoadingMore(false)
    }
  }, [stocks, offset])

  // Update URL when state changes
  useEffect(() => {
    if (!isClient) return

    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (sortBy !== 'vetr_score') params.set('sort', sortBy)
    if (sortOrder !== 'desc') params.set('order', sortOrder)
    if (favoritesOnly) params.set('favorites', 'true')

    const queryString = params.toString()
    const newUrl = queryString ? `/stocks?${queryString}` : '/stocks'

    router.replace(newUrl, { scroll: false })
  }, [searchQuery, sortBy, sortOrder, favoritesOnly, isClient, router])

  // Reset offset when search/sort changes
  useEffect(() => {
    setOffset(0)
    setAllStocks([])
  }, [searchQuery, sortBy, sortOrder])

  // Load more stocks
  const loadMoreStocks = useCallback(() => {
    if (!pagination || !pagination.hasMore || isLoadingMore || stocksLoading) {
      return
    }
    setIsLoadingMore(true)
    setOffset(prev => prev + STOCKS_PER_PAGE)
  }, [pagination, isLoadingMore, stocksLoading])

  // Intersection Observer for infinite scroll on mobile
  useEffect(() => {
    if (!isMobile || !loadMoreRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && pagination?.hasMore && !isLoadingMore && !stocksLoading) {
          loadMoreStocks()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [isMobile, pagination, isLoadingMore, stocksLoading, loadMoreStocks])

  // Refresh handler
  const handleRefreshData = useCallback(async () => {
    try {
      setOffset(0)
      setAllStocks([])
      await mutateStocks()
      showToast('Data refreshed successfully', 'success')
    } catch (error) {
      showToast('Failed to refresh data', 'error')
      throw error
    }
  }, [mutateStocks, showToast])

  // Use refresh hook with debouncing
  const { isRefreshing, handleRefresh, canRefresh } = useRefresh({
    onRefresh: handleRefreshData,
    debounceMs: 5000,
  })

  // Pull-to-refresh for mobile
  const { isPulling, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: isMobile,
    threshold: 80,
  })

  // Create set of favorited tickers for quick lookup
  const favoritedTickers = useMemo(() => {
    if (!watchlist) return new Set<string>()
    return new Set(watchlist.map(stock => stock.ticker))
  }, [watchlist])

  // Filter and sort stocks (use allStocks for accumulated data)
  const filteredStocks = useMemo(() => {
    let result = allStocks || []

    // Filter by favorites only
    if (favoritesOnly) {
      result = result.filter(stock => favoritedTickers.has(stock.ticker))
    }

    // Sort stocks (note: search filtering is done server-side via API)
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
  }, [allStocks, favoritesOnly, favoritedTickers, sortBy, sortOrder])

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

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode(prev => prev === 'card' ? 'table' : 'card')
  }

  // Handle table column header click for sorting
  const handleColumnSort = (column: SortOption) => {
    if (sortBy === column) {
      // Toggle order if same column
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      // New column, default to descending for scores/prices, ascending for names
      setSortBy(column)
      setSortOrder(column === 'company_name' || column === 'sector' ? 'asc' : 'desc')
    }
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
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Stocks</h1>
          <div className="h-10 w-10 bg-surface rounded-lg animate-pulse hidden md:block"></div>
        </div>

        {/* Filters skeleton */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="h-12 flex-1 bg-surface rounded-lg animate-pulse"></div>
            <div className="h-12 w-full md:w-48 bg-surface rounded-lg animate-pulse"></div>
            <div className="h-12 w-12 bg-surface rounded-lg animate-pulse"></div>
            <div className="h-12 w-12 bg-surface rounded-lg animate-pulse"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-6 w-24 bg-surface rounded animate-pulse"></div>
            <div className="flex gap-2">
              <div className="h-8 w-8 bg-surface rounded animate-pulse"></div>
              <div className="h-8 w-8 bg-surface rounded animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Stock list skeleton */}
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <SkeletonStockRow key={i} />
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
            className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors ${favoritesOnly
              ? 'bg-accent text-primary'
              : 'bg-primaryLight text-textSecondary hover:bg-surfaceLight'
              }`}
            title="Favorites Only"
          >
            ★
          </button>

          {/* View toggle - Only shown on desktop (>= 1024px) */}
          <button
            onClick={toggleViewMode}
            className="hidden lg:flex items-center justify-center px-4 py-2 bg-primaryLight text-textPrimary rounded-lg hover:bg-surfaceLight transition-colors"
            title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
          >
            {viewMode === 'card' ? (
              // Table icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
            ) : (
              // Grid/card icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            )}
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
      {/* Pull-to-refresh indicator (mobile only) */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        pullDistance={pullDistance}
        threshold={80}
      />

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Stocks</h1>
        {/* Desktop refresh button */}
        <div className="hidden md:block">
          <RefreshButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
            disabled={!canRefresh}
          />
        </div>
      </div>

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

        <div className="flex gap-2">
          <button
            onClick={toggleSortOrder}
            className="flex items-center justify-center w-10 h-10 bg-surface border border-border/50 text-textPrimary rounded-xl hover:border-accent/50 transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>

          <button
            onClick={toggleFavoritesOnly}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors border ${favoritesOnly
              ? 'bg-accent text-primary border-accent shadow-[0_0_10px_rgba(0,230,118,0.3)]'
              : 'bg-surface text-textSecondary border-border/50 hover:border-accent/50 hover:text-white'
              }`}
            title="Favorites Only"
          >
            ★
          </button>

          {/* View toggle - Only shown on desktop (>= 1024px) */}
          <button
            onClick={toggleViewMode}
            className="hidden lg:flex items-center justify-center w-10 h-10 bg-surface border border-border/50 text-textPrimary rounded-xl hover:border-accent/50 transition-colors"
            title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
          >
            {viewMode === 'card' ? (
              // Table icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
              </svg>
            ) : (
              // Grid/card icon
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H4a1 1 0 01-1-1v-4zM11 4a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V4zM11 12a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Stock count */}
      <div className="mb-4 text-textSecondary">
        {filteredStocks.length} {filteredStocks.length === 1 ? 'stock' : 'stocks'}
      </div>

      {/* Stock list - Responsive: Card view on mobile/tablet, Card or Table on desktop */}
      {viewMode === 'table' ? (
        // Table view - Desktop only (>= 1024px)
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleColumnSort('company_name')}
                    className="flex items-center gap-2 text-textSecondary hover:text-textPrimary transition-colors font-semibold"
                  >
                    Ticker
                    {sortBy === 'company_name' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleColumnSort('company_name')}
                    className="flex items-center gap-2 text-textSecondary hover:text-textPrimary transition-colors font-semibold"
                  >
                    Name
                    {sortBy === 'company_name' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleColumnSort('current_price')}
                    className="flex items-center gap-2 ml-auto text-textSecondary hover:text-textPrimary transition-colors font-semibold"
                  >
                    Price
                    {sortBy === 'current_price' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <button
                    onClick={() => handleColumnSort('price_change_percent')}
                    className="flex items-center gap-2 ml-auto text-textSecondary hover:text-textPrimary transition-colors font-semibold"
                  >
                    Change%
                    {sortBy === 'price_change_percent' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="text-center py-3 px-4">
                  <button
                    onClick={() => handleColumnSort('vetr_score')}
                    className="flex items-center gap-2 mx-auto text-textSecondary hover:text-textPrimary transition-colors font-semibold"
                  >
                    VETTR Score
                    {sortBy === 'vetr_score' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="text-left py-3 px-4">
                  <button
                    onClick={() => handleColumnSort('sector')}
                    className="flex items-center gap-2 text-textSecondary hover:text-textPrimary transition-colors font-semibold"
                  >
                    Sector
                    {sortBy === 'sector' && (
                      <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </button>
                </th>
                <th className="text-right py-3 px-4">
                  <span className="text-textSecondary font-semibold">Market Cap</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map(stock => (
                <tr
                  key={stock.ticker}
                  className="border-b border-border hover:bg-primaryLight transition-colors group cursor-pointer"
                  onClick={() => window.location.href = `/stocks/${stock.ticker}`}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
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
                      <span className="font-bold text-textPrimary">{stock.ticker}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-textPrimary">{stock.company_name}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="font-semibold text-textPrimary">
                      ${stock.current_price?.toFixed(2) || 'N/A'}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <PriceChangeIndicator
                      change={stock.price_change_percent || 0}
                      size="sm"
                    />
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex justify-center">
                      <VetrScoreBadge score={stock.vetr_score || 0} size="sm" />
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-textSecondary">{stock.sector || 'N/A'}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <span className="text-textSecondary">
                      {stock.market_cap ? `$${(stock.market_cap / 1000000).toFixed(1)}M` : 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Card view - All screen sizes
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
      )}

      {/* Load More / Infinite Scroll Trigger */}
      {pagination && pagination.hasMore && (
        <div ref={loadMoreRef} className="mt-6 flex justify-center">
          {/* Desktop: Load More button */}
          <button
            onClick={loadMoreStocks}
            disabled={isLoadingMore || stocksLoading}
            className="hidden md:flex items-center gap-2 px-6 py-3 bg-primaryLight text-textPrimary rounded-lg hover:bg-surfaceLight transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore || stocksLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Loading more stocks...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </>
            )}
          </button>

          {/* Mobile: Loading indicator for infinite scroll */}
          {(isLoadingMore || stocksLoading) && (
            <div className="md:hidden flex items-center gap-2 text-textSecondary">
              <LoadingSpinner size="sm" />
              <span>Loading more stocks...</span>
            </div>
          )}
        </div>
      )}

      {/* No more stocks indicator */}
      {pagination && !pagination.hasMore && filteredStocks.length > 0 && (
        <div className="mt-6 text-center text-textMuted">
          All stocks loaded ({pagination.total} total)
        </div>
      )}
    </div>
  )
}

// Wrap in Suspense to fix Next.js build error with useSearchParams
export default function StocksPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold mb-6">Stocks</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-surface rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <StocksPageContent />
    </Suspense>
  );
}
