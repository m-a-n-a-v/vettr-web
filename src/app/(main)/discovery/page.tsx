'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useStocks } from '@/hooks/useStocks';
import { useFilings } from '@/hooks/useFilings';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/contexts/ToastContext';
import { useRefresh } from '@/hooks/useRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import SearchInput from '@/components/ui/SearchInput';
import StockCard from '@/components/ui/StockCard';
import FilingTypeIcon from '@/components/ui/FilingTypeIcon';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonStockCard, SkeletonCard } from '@/components/ui/SkeletonLoader';
import RefreshButton from '@/components/ui/RefreshButton';
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator';
import type { Filing, FilingType } from '@/types/api';

/**
 * Discovery Page
 *
 * Browse stocks and recent filings with search and sector filtering.
 * Includes:
 * - Search bar for ticker/name/sector
 * - Horizontal sector filter chips
 * - Featured stocks carousel (horizontal scroll)
 * - Recent filings list
 */
export default function DiscoveryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [isMobile, setIsMobile] = useState(false);
  const { showToast } = useToast();

  // Fetch all stocks for featured section and sector extraction
  const {
    stocks: allStocks,
    isLoading: isLoadingStocks,
    isError: isErrorStocks,
    mutate: mutateAllStocks,
  } = useStocks({ limit: 100 }); // Fetch more stocks for better variety

  // Fetch stocks filtered by search and sector
  const {
    stocks: filteredStocks,
    isLoading: isLoadingFiltered,
    mutate: mutateFilteredStocks,
  } = useStocks({
    limit: 8,
    search: searchQuery || undefined,
    sector: selectedSector !== 'All' ? selectedSector : undefined,
  });

  // Fetch recent filings filtered by sector
  const {
    filings,
    isLoading: isLoadingFilings,
    error: filingsError,
    mutate: mutateFilings,
  } = useFilings({
    limit: 10,
    // Note: Backend may not support filtering filings by sector directly
    // We'll filter client-side if needed
  });

  // Fetch watchlist for favorites
  const { watchlist, addToWatchlist, removeFromWatchlist, isAdding, isRemoving } = useWatchlist();

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Refresh handler
  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([
        mutateAllStocks(),
        mutateFilteredStocks(),
        mutateFilings(),
      ]);
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      showToast('Failed to refresh data', 'error');
      throw error;
    }
  }, [mutateAllStocks, mutateFilteredStocks, mutateFilings, showToast]);

  // Use refresh hook with debouncing
  const { isRefreshing, handleRefresh, canRefresh } = useRefresh({
    onRefresh: handleRefreshData,
    debounceMs: 5000,
  });

  // Pull-to-refresh for mobile
  const { isPulling, pullDistance } = usePullToRefresh({
    onRefresh: handleRefresh,
    enabled: isMobile,
    threshold: 80,
  });

  // Create set of favorited tickers for quick lookup
  const favoritedTickers = useMemo(() => {
    return new Set(watchlist.map(stock => stock.ticker))
  }, [watchlist]);

  // Extract unique sectors from all stocks
  const sectors = useMemo(() => {
    const uniqueSectors = new Set<string>();
    allStocks.forEach((stock) => {
      if (stock.sector) {
        uniqueSectors.add(stock.sector);
      }
    });
    return ['All', ...Array.from(uniqueSectors).sort()];
  }, [allStocks]);

  // Filter filings by selected sector (client-side filtering)
  const filteredFilings = useMemo(() => {
    if (selectedSector === 'All') return filings;

    // Filter filings by matching stock ticker's sector
    return filings.filter((filing) => {
      const stock = allStocks.find((s) => s.ticker === filing.ticker);
      return stock?.sector === selectedSector;
    });
  }, [filings, selectedSector, allStocks]);

  // Featured stocks: use filtered stocks or top stocks by score
  const featuredStocks = useMemo(() => {
    const stocks = filteredStocks.length > 0 ? filteredStocks : allStocks;
    return stocks.slice(0, 8);
  }, [filteredStocks, allStocks]);

  // Handle sector chip click
  const handleSectorClick = (sector: string) => {
    setSelectedSector(sector);
  };

  // Handle search change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

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
  };

  return (
    <div className="min-h-screen bg-primary pb-20 md:pb-6">
      {/* Pull-to-refresh indicator (mobile only) */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        pullDistance={pullDistance}
        threshold={80}
      />

      {/* Page Header */}
      <div className="bg-primaryLight border-b border-border px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-textPrimary mb-2">Discovery</h1>
            <p className="text-sm text-textSecondary">
              Explore stocks and recent filings by sector
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

      <div className="px-4 py-6 md:px-6 space-y-8">
        {/* Search Bar */}
        <div className="max-w-2xl">
          <SearchInput
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search by ticker, company name, or sector..."
            autoFocus={false}
          />
        </div>

        {/* Sector Filter Chips */}
        <div>
          <h2 className="text-sm font-semibold text-textSecondary uppercase tracking-wide mb-3">
            Filter by Sector
          </h2>
          <div className="flex flex-wrap gap-2">
            {sectors.map((sector) => (
              <button
                key={sector}
                onClick={() => handleSectorClick(sector)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${
                    selectedSector === sector
                      ? 'bg-accent text-primary shadow-lg scale-105'
                      : 'bg-primaryLight text-textSecondary hover:bg-surface hover:text-textPrimary'
                  }
                `}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Stocks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-textPrimary">Featured Stocks</h2>
              <p className="text-sm text-textSecondary mt-1">
                {selectedSector !== 'All'
                  ? `Top stocks in ${selectedSector}`
                  : 'Top stocks across all sectors'}
              </p>
            </div>
          </div>

          {/* Horizontal Scroll Container */}
          {isLoadingStocks || isLoadingFiltered ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-80">
                  <SkeletonStockCard />
                </div>
              ))}
            </div>
          ) : isErrorStocks ? (
            <EmptyState
              icon="⚠️"
              title="Failed to load stocks"
              message="Unable to fetch stocks. Please try again later."
            />
          ) : featuredStocks.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="No stocks found"
              message={
                searchQuery || selectedSector !== 'All'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No stocks available at this time.'
              }
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
              {featuredStocks.map((stock) => (
                <div key={stock.ticker} className="flex-shrink-0 w-80">
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
        </div>

        {/* Recent Filings Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-textPrimary">Recent Filings</h2>
              <p className="text-sm text-textSecondary mt-1">
                {selectedSector !== 'All'
                  ? `Latest filings in ${selectedSector}`
                  : 'Latest filings across all sectors'}
              </p>
            </div>
          </div>

          {/* Filings List */}
          {isLoadingFilings ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filingsError ? (
            <EmptyState
              icon="⚠️"
              title="Failed to load filings"
              message="Unable to fetch recent filings. Please try again later."
            />
          ) : filteredFilings.length === 0 ? (
            <EmptyState
              icon="📄"
              title="No filings found"
              message={
                selectedSector !== 'All'
                  ? `No recent filings in ${selectedSector}.`
                  : 'No recent filings available.'
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredFilings.map((filing) => (
                <FilingRow key={filing.id} filing={filing} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Filing Row Component
 *
 * Displays a single filing with type icon, title, ticker, date, and material indicator
 */
interface FilingRowProps {
  filing: Filing;
}

function FilingRow({ filing }: FilingRowProps) {
  const formattedDate = new Date(filing.date_filed).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <a
      href={`/filings/${filing.id}`}
      className="
        block bg-primaryLight rounded-lg p-4 border border-border
        hover:bg-surface hover:border-accent/30 transition-all duration-200
      "
    >
      <div className="flex items-start gap-4">
        {/* Unread indicator (blue dot) */}
        {!filing.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
        )}

        {/* Filing Type Icon */}
        <div className="flex-shrink-0">
          <FilingTypeIcon type={filing.type as FilingType} size="md" />
        </div>

        {/* Filing Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-base font-semibold text-textPrimary line-clamp-2">
              {filing.title}
            </h3>
            {filing.is_material && (
              <span className="flex-shrink-0 px-2 py-1 bg-warning/20 border border-warning/30 rounded text-xs font-medium text-warning">
                Material
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-textSecondary">
            <span className="font-medium text-accent">{filing.ticker}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          {/* Summary Preview (if available) */}
          {filing.summary && (
            <p className="mt-2 text-sm text-textMuted line-clamp-2">
              {filing.summary}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}
