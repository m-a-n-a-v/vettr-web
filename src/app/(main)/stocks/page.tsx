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
import { SkeletonStockRow, SkeletonStockCard, SkeletonFilterBar } from '@/components/ui/SkeletonLoader'
import RefreshButton from '@/components/ui/RefreshButton'
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator'
import StockCard from '@/components/ui/StockCard'
import {
  StarIcon,
  StarFilledIcon,
  TableIcon,
  GridIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  AlertTriangleIcon,
  BarChartIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  SearchIcon
} from '@/components/icons'
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
  const [viewMode, setViewMode] = useState<ViewMode>('table') // Default to table on desktop
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
          <h1 className="text-2xl font-bold text-white">Stocks</h1>
          <div className="h-10 w-10 bg-white/5 rounded-lg animate-pulse hidden md:block"></div>
        </div>

        {/* Filters skeleton */}
        <SkeletonFilterBar className="mb-6" />

        {/* Result count skeleton */}
        <div className="mb-4 h-5 w-32 bg-white/5 rounded animate-pulse"></div>

        {/* Desktop Table skeleton */}
        <div className="hidden md:block bg-vettr-card/50 border border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="sticky top-16 bg-vettr-dark/80 backdrop-blur-sm z-20">
              <tr className="border-b border-white/5">
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Ticker</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Company</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right">Price</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right">Change</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-center">VETTR Score</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Sector</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right">Market Cap</th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-center">Favorite</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 25 }).map((_, i) => (
                <SkeletonStockRow key={i} />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card skeleton */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <SkeletonStockCard key={i} />
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (stocksError) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Stocks</h1>
        <EmptyState
          icon={<AlertTriangleIcon className="w-16 h-16 text-yellow-400" />}
          title="Error loading stocks"
          description="Unable to load stock data. Please try again later."
        />
      </div>
    )
  }

  // Empty state
  if (filteredStocks.length === 0) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold text-white mb-6">Stocks</h1>

        {/* Filter bar */}
        <div className="mb-6 bg-vettr-card/30 border border-white/5 rounded-2xl p-3">
          <div className="flex flex-col md:flex-row gap-3">
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
              className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
            >
              {sortOrder === 'asc' ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>

            <button
              onClick={toggleFavoritesOnly}
              className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors border ${
                favoritesOnly
                  ? 'bg-vettr-accent/10 text-vettr-accent border-vettr-accent/30'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
              title="Favorites Only"
              aria-label="Toggle favorites filter"
            >
              {favoritesOnly ? (
                <StarFilledIcon className="w-5 h-5" />
              ) : (
                <StarIcon className="w-5 h-5" />
              )}
            </button>

            {/* View toggle - Only shown on desktop (>= 1024px) */}
            <button
              onClick={toggleViewMode}
              className="hidden lg:flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
              title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
              aria-label={viewMode === 'card' ? 'Switch to table view' : 'Switch to card view'}
            >
              {viewMode === 'card' ? (
                <TableIcon className="w-5 h-5" />
              ) : (
                <GridIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        <EmptyState
          icon={<SearchIcon className="w-16 h-16 text-gray-600" />}
          title="No stocks match your filters"
          description={
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
        <h1 className="text-2xl font-bold text-white">Stocks</h1>
        {/* Desktop refresh button */}
        <div className="hidden md:block">
          <RefreshButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
            disabled={!canRefresh}
          />
        </div>
      </div>

      {/* Filter bar - single row design */}
      <div className="mb-6 bg-vettr-card/30 border border-white/5 rounded-2xl p-3">
        <div className="flex flex-col md:flex-row gap-3">
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
            className="flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
          >
            {sortOrder === 'asc' ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>

          <button
            onClick={toggleFavoritesOnly}
            className={`flex items-center justify-center w-10 h-10 rounded-xl transition-colors border ${
              favoritesOnly
                ? 'bg-vettr-accent/10 text-vettr-accent border-vettr-accent/30'
                : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white'
            }`}
            title="Favorites Only"
            aria-label="Toggle favorites filter"
          >
            {favoritesOnly ? (
              <StarFilledIcon className="w-5 h-5" />
            ) : (
              <StarIcon className="w-5 h-5" />
            )}
          </button>

          {/* View toggle - Only shown on desktop (>= 1024px) */}
          <button
            onClick={toggleViewMode}
            className="hidden lg:flex items-center justify-center w-10 h-10 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors"
            title={viewMode === 'card' ? 'Switch to Table View' : 'Switch to Card View'}
            aria-label={viewMode === 'card' ? 'Switch to table view' : 'Switch to card view'}
          >
            {viewMode === 'card' ? (
              <TableIcon className="w-5 h-5" />
            ) : (
              <GridIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Stock count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredStocks.length} of {pagination?.total || filteredStocks.length} stocks
      </div>

      {/* Stock list - Responsive: Card view on mobile, Card or Table on desktop */}
      {viewMode === 'table' && !isMobile ? (
        // Table view - Desktop only (>= 768px)
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="sticky top-16 z-20 bg-vettr-navy dark:bg-vettr-navy bg-lightBg backdrop-blur-sm">
              <tr className="border-b border-white/5 dark:border-white/5 border-gray-200">
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">
                  <button
                    onClick={() => handleColumnSort('company_name')}
                    className={`flex items-center gap-2 transition-colors ${
                      sortBy === 'company_name' ? 'text-white' : 'hover:text-gray-300'
                    }`}
                  >
                    Ticker
                    {sortBy === 'company_name' && (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">
                  <button
                    onClick={() => handleColumnSort('company_name')}
                    className={`flex items-center gap-2 transition-colors ${
                      sortBy === 'company_name' ? 'text-white' : 'hover:text-gray-300'
                    }`}
                  >
                    Company
                    {sortBy === 'company_name' && (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right">
                  <button
                    onClick={() => handleColumnSort('current_price')}
                    className={`flex items-center gap-2 ml-auto transition-colors ${
                      sortBy === 'current_price' ? 'text-white' : 'hover:text-gray-300'
                    }`}
                  >
                    Price
                    {sortBy === 'current_price' && (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right">
                  <button
                    onClick={() => handleColumnSort('price_change_percent')}
                    className={`flex items-center gap-2 ml-auto transition-colors ${
                      sortBy === 'price_change_percent' ? 'text-white' : 'hover:text-gray-300'
                    }`}
                  >
                    Change
                    {sortBy === 'price_change_percent' && (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-center">
                  <button
                    onClick={() => handleColumnSort('vetr_score')}
                    className={`flex items-center gap-2 mx-auto transition-colors ${
                      sortBy === 'vetr_score' ? 'text-white' : 'hover:text-gray-300'
                    }`}
                  >
                    VETTR Score
                    {sortBy === 'vetr_score' && (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">
                  <button
                    onClick={() => handleColumnSort('sector')}
                    className={`flex items-center gap-2 transition-colors ${
                      sortBy === 'sector' ? 'text-white' : 'hover:text-gray-300'
                    }`}
                  >
                    Sector
                    {sortBy === 'sector' && (
                      sortOrder === 'asc' ? (
                        <ChevronUpIcon className="w-3 h-3" />
                      ) : (
                        <ChevronDownIcon className="w-3 h-3" />
                      )
                    )}
                  </button>
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right">
                  Market Cap
                </th>
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-center">
                  Favorite
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStocks.map(stock => (
                <tr
                  key={stock.ticker}
                  className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  onClick={() => window.location.href = `/stocks/${stock.ticker}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-bold text-vettr-accent">{stock.ticker}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-white">{stock.company_name}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-white">
                      ${stock.current_price?.toFixed(2) || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {stock.price_change_percent !== undefined && stock.price_change_percent !== null ? (
                        <>
                          {stock.price_change_percent >= 0 ? (
                            <ArrowUpIcon className="w-3 h-3 text-vettr-accent" />
                          ) : (
                            <ArrowDownIcon className="w-3 h-3 text-red-400" />
                          )}
                          <span className={`text-sm font-medium ${
                            stock.price_change_percent >= 0 ? 'text-vettr-accent' : 'text-red-400'
                          }`}>
                            {Math.abs(stock.price_change_percent).toFixed(2)}%
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-500">N/A</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <VetrScoreBadge score={stock.vetr_score || 0} size="sm" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-400">{stock.sector || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-400">
                      {stock.market_cap ? `$${(stock.market_cap / 1_000_000_000).toFixed(1)}B` : 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center">
                      <button
                        onClick={(e) => handleFavoriteToggle(stock.ticker, e)}
                        disabled={isAdding || isRemoving}
                        className="text-gray-400 hover:text-yellow-400 hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label={favoritedTickers.has(stock.ticker) ? 'Remove from watchlist' : 'Add to watchlist'}
                      >
                        {isAdding || isRemoving ? (
                          <LoadingSpinner size="sm" />
                        ) : favoritedTickers.has(stock.ticker) ? (
                          <StarFilledIcon className="w-5 h-5 text-yellow-400" />
                        ) : (
                          <StarIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Card view - Mobile always, desktop when viewMode is 'card'
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStocks.map(stock => (
            <StockCard
              key={stock.ticker}
              stock={stock}
              isFavorite={favoritedTickers.has(stock.ticker)}
              onFavoriteToggle={async (ticker) => {
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
              }}
              isTogglingFavorite={isAdding || isRemoving}
            />
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
            className="bg-white/5 border border-white/10 text-white rounded-xl px-6 py-3 hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoadingMore || stocksLoading ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Loading more...</span>
              </>
            ) : (
              <>
                <span>Load More</span>
                <ChevronDownIcon className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      )}

      {/* No more stocks indicator */}
      {pagination && !pagination.hasMore && filteredStocks.length > 0 && (
        <div className="mt-6 text-center text-sm text-gray-500">
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
        <h1 className="text-2xl font-bold text-white mb-6">Stocks</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <StocksPageContent />
    </Suspense>
  );
}
