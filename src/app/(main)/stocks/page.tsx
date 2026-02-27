'use client'

// Disable static generation due to useSearchParams()
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useStocks } from '@/hooks/useStocks'
import { useWatchlist } from '@/hooks/useWatchlist'
import { useSubscription } from '@/hooks/useSubscription'
import { useAuth } from '@/contexts/AuthContext'
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
import UpgradeModal from '@/components/UpgradeModal'
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
  SearchIcon,
  TrashIcon
} from '@/components/icons'
import type { Stock } from '@/types/api'

type SortOption = 'vetr_score' | 'current_price' | 'price_change_percent' | 'company_name' | 'sector'
type ViewMode = 'card' | 'table'

const PER_PAGE_OPTIONS = [25, 50, 100] as const

function StocksPageContent() {
  const searchParams = useSearchParams()

  // Initialize state from URL params
  // Separate display value (updates instantly on keystroke) from debounced query (triggers API calls)
  const [searchInput, setSearchInput] = useState(searchParams.get('search') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '')
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get('sort') as SortOption) || 'vetr_score')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>((searchParams.get('order') as 'asc' | 'desc') || 'desc')
  const [viewMode, setViewMode] = useState<ViewMode>('table') // Default to table on desktop
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [perPage, setPerPage] = useState(25)
  const hasLoadedOnce = useRef(false)
  const { isAuthenticated } = useAuth()
  const { showToast } = useToast()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

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

  // Debounce search input → searchQuery (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 300)
    return () => clearTimeout(handler)
  }, [searchInput])

  // Fetch stocks with pagination
  const { stocks, pagination, isLoading: stocksLoading, isError: stocksError, mutate: mutateStocks } = useStocks({
    search: searchQuery || undefined,
    limit: perPage,
    offset: (currentPage - 1) * perPage,
  })
  const { watchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving, isLoading: watchlistLoading } = useWatchlist({ enabled: isAuthenticated })
  const { subscription, isLoading: subscriptionLoading } = useSubscription({ enabled: isAuthenticated })

  // Track first load for skeleton
  useEffect(() => {
    if (stocks) {
      hasLoadedOnce.current = true
    }
  }, [stocks])

  // Update URL when state changes (use history.replaceState to avoid
  // Next.js re-renders that would unmount the SearchInput and lose focus)
  useEffect(() => {
    if (!isClient) return

    const params = new URLSearchParams()

    if (searchQuery) params.set('search', searchQuery)
    if (sortBy !== 'vetr_score') params.set('sort', sortBy)
    if (sortOrder !== 'desc') params.set('order', sortOrder)

    const queryString = params.toString()
    const newUrl = queryString ? `/stocks?${queryString}` : '/stocks'

    window.history.replaceState(null, '', newUrl)
  }, [searchQuery, sortBy, sortOrder, isClient])

  // Reset to page 1 when search/sort/perPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, sortOrder, perPage])

  // Refresh handler
  const handleRefreshData = useCallback(async () => {
    try {
      setCurrentPage(1)
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

  // Sort current page of stocks (search filtering is done server-side via API)
  const filteredStocks = useMemo(() => {
    let result = stocks || []

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
  }, [stocks, sortBy, sortOrder])

  // Handle sort option change
  const handleSortChange = (value: string) => {
    setSortBy(value as SortOption)
  }

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))
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
    } catch (error: any) {
      // Check if it's a tier limit error - show upgrade modal
      if (error?.message?.includes('TIER_LIMIT_EXCEEDED') || error?.message?.includes('Watchlist full')) {
        setShowUpgradeModal(true)
      } else {
        showToast('Failed to update watchlist', 'error')
      }
    }
  }


  // Pagination computed values
  const totalItems = pagination?.total || 0
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage))

  // Generate page numbers to display (show up to 5 pages around current)
  const pageNumbers = useMemo(() => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')
      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }, [currentPage, totalPages])

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    // Scroll to top of stock list
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePerPageChange = (value: string) => {
    setPerPage(Number(value))
  }

  // Loading state - show skeleton only on truly initial page load, not on search/sort changes
  const isInitialLoading = (!hasLoadedOnce.current && stocksLoading) || watchlistLoading || subscriptionLoading
  if (isInitialLoading) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stocks</h1>
          <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 rounded-lg animate-pulse hidden md:block"></div>
        </div>

        {/* Filters skeleton */}
        <SkeletonFilterBar className="mb-6" />

        {/* Result count skeleton */}
        <div className="mb-4 h-5 w-32 bg-gray-100 dark:bg-white/5 rounded animate-pulse"></div>

        {/* Desktop Table skeleton */}
        <div className="hidden md:block bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-lightBg dark:bg-vettr-navy border-b border-gray-200 dark:border-white/5">
              <tr className="border-b border-gray-200 dark:border-white/5">
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stocks</h1>
        <EmptyState
          icon={<AlertTriangleIcon className="w-16 h-16 text-yellow-400" />}
          title="Error loading stocks"
          description="Unable to load stock data. Please try again later."
        />
      </div>
    )
  }

  // Empty state - only show when not loading and no stocks found
  if (filteredStocks.length === 0 && !stocksLoading) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stocks</h1>

        {/* Filter bar */}
        <div className="mb-6 bg-gray-50 dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl p-3">
          <div className="flex flex-col md:flex-row gap-3">
            <SearchInput
              value={searchInput}
              onChange={setSearchInput}
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
              className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
            >
              {sortOrder === 'asc' ? (
                <ChevronUpIcon className="w-5 h-5" />
              ) : (
                <ChevronDownIcon className="w-5 h-5" />
              )}
            </button>

            {/* View toggle - Only shown on desktop (>= 1024px) */}
            <button
              onClick={toggleViewMode}
              className="hidden lg:flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
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
            searchInput
              ? 'Try adjusting your filters or search query.'
              : 'No stocks available at this time.'
          }
          actionLabel={searchInput ? 'Clear Filters' : undefined}
          onAction={
            searchInput
              ? () => {
                setSearchInput('')
                setSearchQuery('')
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stocks</h1>
        {/* Desktop refresh button */}
        <div className="hidden md:block">
          <RefreshButton
            onClick={handleRefresh}
            isRefreshing={isRefreshing}
            disabled={!canRefresh}
          />
        </div>
      </div>

      {/* My Watchlist Section */}
      <div className="mb-6 bg-gray-50 dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Watchlist</h2>
          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {watchlist.length} / {subscription?.watchlist_limit === -1 ? 'unlimited' : subscription?.watchlist_limit || '...'} stocks
            </div>
            {/* Show upgrade button when at or near limit (non-premium) */}
            {subscription && subscription.tier !== 'premium' && subscription.watchlist_limit !== -1 && watchlist.length >= subscription.watchlist_limit && (
              <button
                onClick={() => setShowUpgradeModal(true)}
                className="text-xs font-semibold text-vettr-accent bg-vettr-accent/10 hover:bg-vettr-accent/20 px-3 py-1.5 rounded-lg transition-colors"
              >
                Upgrade
              </button>
            )}
          </div>
        </div>

        {watchlist.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">
            No stocks in your watchlist yet. Star a stock to add it.
          </p>
        ) : (
          <div className="space-y-2">
            {watchlist.map(stock => (
              <div
                key={stock.ticker}
                className="flex items-center gap-3 p-3 bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-xl hover:border-vettr-accent/20 hover:bg-gray-50 dark:hover:bg-vettr-card/80 transition-all cursor-pointer group"
                onClick={() => window.location.href = `/stocks/${stock.ticker}`}
              >
                {/* Ticker and Company */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-sm font-bold text-vettr-accent">{stock.ticker}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 truncate">{stock.company_name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>${stock.current_price?.toFixed(2) || 'N/A'}</span>
                    {stock.price_change_percent !== undefined && stock.price_change_percent !== null && (
                      <div className="flex items-center gap-1">
                        {stock.price_change_percent >= 0 ? (
                          <ArrowUpIcon className="w-3 h-3 text-vettr-accent" />
                        ) : (
                          <ArrowDownIcon className="w-3 h-3 text-red-400" />
                        )}
                        <span className={stock.price_change_percent >= 0 ? 'text-vettr-accent' : 'text-red-400'}>
                          {Math.abs(stock.price_change_percent).toFixed(2)}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* VETR Score */}
                <div className="flex items-center gap-3">
                  <VetrScoreBadge score={stock.vetr_score || 0} size="sm" />

                  {/* Remove button */}
                  <button
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      try {
                        await removeFromWatchlist(stock.ticker)
                        showToast('Removed from watchlist', 'success')
                      } catch (error) {
                        showToast('Failed to remove from watchlist', 'error')
                      }
                    }}
                    disabled={isRemoving}
                    className="text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed p-1"
                    aria-label="Remove from watchlist"
                    title="Remove from watchlist"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter bar - single row design */}
      <div className="mb-6 bg-gray-50 dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl p-3">
        <div className="flex flex-col md:flex-row gap-3">
          <SearchInput
            value={searchInput}
            onChange={setSearchInput}
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
            className="flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
            title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            aria-label={sortOrder === 'asc' ? 'Sort ascending' : 'Sort descending'}
          >
            {sortOrder === 'asc' ? (
              <ChevronUpIcon className="w-5 h-5" />
            ) : (
              <ChevronDownIcon className="w-5 h-5" />
            )}
          </button>

          {/* View toggle - Only shown on desktop (>= 1024px) */}
          <button
            onClick={toggleViewMode}
            className="hidden lg:flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
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

      {/* All Stocks Section Header */}
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">All Stocks</h2>

      {/* Stock count */}
      <div className="mb-4 text-sm text-gray-400 dark:text-gray-500">
        Showing {Math.min((currentPage - 1) * perPage + 1, totalItems)}–{Math.min(currentPage * perPage, totalItems)} of {totalItems} stocks
      </div>

      {/* Stock list - Responsive: Card view on mobile, Card or Table on desktop */}
      {viewMode === 'table' && !isMobile ? (
        // Table view - Desktop only (>= 768px)
        <div className="hidden md:block -mx-4 md:mx-0 px-4 md:px-0">
          <table className="w-full">
            <thead className="bg-lightBg dark:bg-vettr-navy border-b border-gray-200 dark:border-white/5">
              <tr className="border-b border-gray-200 dark:border-white/5">
                <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">
                  <button
                    onClick={() => handleColumnSort('company_name')}
                    className={`flex items-center gap-2 transition-colors ${
                      sortBy === 'company_name' ? 'text-gray-900 dark:text-white' : 'hover:text-gray-600 dark:hover:text-gray-300'
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
                      sortBy === 'company_name' ? 'text-gray-900 dark:text-white' : 'hover:text-gray-600 dark:hover:text-gray-300'
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
                      sortBy === 'current_price' ? 'text-gray-900 dark:text-white' : 'hover:text-gray-600 dark:hover:text-gray-300'
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
                      sortBy === 'price_change_percent' ? 'text-gray-900 dark:text-white' : 'hover:text-gray-600 dark:hover:text-gray-300'
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
                      sortBy === 'vetr_score' ? 'text-gray-900 dark:text-white' : 'hover:text-gray-600 dark:hover:text-gray-300'
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
                      sortBy === 'sector' ? 'text-gray-900 dark:text-white' : 'hover:text-gray-600 dark:hover:text-gray-300'
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
                  className="border-b border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                  onClick={() => window.location.href = `/stocks/${stock.ticker}`}
                >
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm font-bold text-vettr-accent">{stock.ticker}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-900 dark:text-white">{stock.company_name}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
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
                    <span className="text-sm text-gray-500 dark:text-gray-400">{stock.sector || 'N/A'}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
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
                } catch (error: any) {
                  // Check if it's a tier limit error - show upgrade modal
                  if (error?.message?.includes('TIER_LIMIT_EXCEEDED') || error?.message?.includes('Watchlist full')) {
                    setShowUpgradeModal(true)
                  } else {
                    showToast('Failed to update watchlist', 'error')
                  }
                }
              }}
              isTogglingFavorite={isAdding || isRemoving}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 0 && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Per-page selector */}
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>Show</span>
            <select
              value={perPage}
              onChange={(e) => handlePerPageChange(e.target.value)}
              className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:border-vettr-accent/40"
            >
              {PER_PAGE_OPTIONS.map(opt => (
                <option key={opt} value={opt} className="bg-white dark:bg-vettr-navy">{opt}</option>
              ))}
            </select>
            <span>per page</span>
          </div>

          {/* Page navigation */}
          <div className="flex items-center gap-1">
            {/* Previous */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <ChevronUpIcon className="w-4 h-4 -rotate-90" />
            </button>

            {/* Page numbers */}
            {pageNumbers.map((page, i) =>
              page === 'ellipsis' ? (
                <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-500 text-sm">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                    page === currentPage
                      ? 'bg-vettr-accent text-white'
                      : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {page}
                </button>
              )
            )}

            {/* Next */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-900 dark:hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <ChevronDownIcon className="w-4 h-4 -rotate-90" />
            </button>
          </div>

          {/* Total count */}
          <div className="text-sm text-gray-500">
            {totalItems} total
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={subscription?.tier || 'free'}
        currentCount={watchlist.length}
        currentLimit={subscription?.watchlist_limit === -1 ? undefined : (subscription?.watchlist_limit || 5)}
      />
    </div>
  )
}

// Wrap in Suspense to fix Next.js build error with useSearchParams
export default function StocksPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Stocks</h1>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    }>
      <StocksPageContent />
    </Suspense>
  );
}
