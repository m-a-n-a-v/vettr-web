'use client';

// Disable static generation due to useSearchParams()
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStocks } from '@/hooks/useStocks';
import { useFilings } from '@/hooks/useFilings';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useDiscoveryCollections } from '@/hooks/useDiscoveryCollections';
import { useToast } from '@/contexts/ToastContext';
import { useRefresh } from '@/hooks/useRefresh';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';
import SearchInput from '@/components/ui/SearchInput';
import StockCard from '@/components/ui/StockCard';
import Button from '@/components/ui/Button';
import FilingTypeIcon from '@/components/ui/FilingTypeIcon';
import FilingTable from '@/components/ui/FilingTable';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonStockCard, SkeletonFilingRow } from '@/components/ui/SkeletonLoader';
import RefreshButton from '@/components/ui/RefreshButton';
import PullToRefreshIndicator from '@/components/ui/PullToRefreshIndicator';
import type { Filing, FilingType } from '@/types/api';
import { ArrowRightIcon, AlertTriangleIcon, SearchIcon, DocumentIcon } from '@/components/icons';

// Collection icon mapping (SF Symbol → emoji)
const collectionIcons: Record<string, string> = {
  'checkmark.shield': '✅',
  'banknote': '💰',
  'bolt.fill': '⚡',
  'trophy': '🏆',
  'crown': '👑',
  'person.badge.shield.checkmark': '🛡️',
};

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
function DiscoveryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize state from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  // Multi-select sector state: empty Set means 'All'
  const [selectedSectors, setSelectedSectors] = useState<Set<string>>(() => {
    const sectorsParam = searchParams.get('sectors');
    if (sectorsParam) {
      return new Set(sectorsParam.split(',').filter(s => s.trim()));
    }
    return new Set();
  });
  const [isMobile, setIsMobile] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { showToast } = useToast();

  // Fetch all stocks (shares SWR cache key with Pulse page: /stocks?limit=100&offset=0)
  const {
    stocks: allStocks,
    isLoading: isLoadingStocks,
    isError: isErrorStocks,
    mutate: mutateAllStocks,
  } = useStocks({ limit: 100 });

  // Filter stocks client-side instead of making a separate API call
  // This eliminates an extra API request that was contributing to rate limiting
  const filteredStocks = useMemo(() => {
    let result = allStocks;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (s) =>
          s.ticker.toLowerCase().includes(q) ||
          (s.company_name || '').toLowerCase().includes(q) ||
          (s.sector || '').toLowerCase().includes(q)
      );
    }
    if (selectedSectors.size > 0) {
      result = result.filter((s) => selectedSectors.has(s.sector));
    }
    return result.slice(0, 8);
  }, [allStocks, searchQuery, selectedSectors]);

  const isLoadingFiltered = isLoadingStocks;

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

  // Fetch discovery collections
  const { collections, isLoading: isLoadingCollections } = useDiscoveryCollections();

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Update URL when state changes
  useEffect(() => {
    if (!isClient) return;

    const params = new URLSearchParams();

    if (searchQuery) params.set('search', searchQuery);
    if (selectedSectors.size > 0) {
      params.set('sectors', Array.from(selectedSectors).join(','));
    }

    const queryString = params.toString();
    const newUrl = queryString ? `/discovery?${queryString}` : '/discovery';

    router.replace(newUrl, { scroll: false });
  }, [searchQuery, selectedSectors, isClient, router]);

  // Refresh handler
  const handleRefreshData = useCallback(async () => {
    try {
      await Promise.all([
        mutateAllStocks(),
        mutateFilings(),
      ]);
      showToast('Data refreshed successfully', 'success');
    } catch (error) {
      showToast('Failed to refresh data', 'error');
      throw error;
    }
  }, [mutateAllStocks, mutateFilings, showToast]);

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
    if (selectedSectors.size === 0) return filings;

    // Filter filings by matching stock ticker's sector
    return filings.filter((filing) => {
      const stock = allStocks.find((s) => s.ticker === filing.ticker);
      return stock?.sector && selectedSectors.has(stock.sector);
    });
  }, [filings, selectedSectors, allStocks]);

  // Featured stocks: use filtered stocks or top stocks by score
  const featuredStocks = useMemo(() => {
    const stocks = filteredStocks.length > 0 ? filteredStocks : allStocks;
    return stocks.slice(0, 8);
  }, [filteredStocks, allStocks]);

  // Handle sector chip click - toggle sector in/out of Set
  const handleSectorClick = (sector: string) => {
    if (sector === 'All') {
      // Clear all selections
      setSelectedSectors(new Set());
    } else {
      // Toggle sector in/out of Set
      setSelectedSectors(prev => {
        const next = new Set(prev);
        if (next.has(sector)) {
          next.delete(sector);
        } else {
          next.add(sector);
        }
        return next;
      });
    }
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
    <div className="min-h-screen bg-lightBg dark:bg-vettr-navy pb-20 md:pb-6">
      {/* Pull-to-refresh indicator (mobile only) */}
      <PullToRefreshIndicator
        isPulling={isPulling}
        pullDistance={pullDistance}
        threshold={80}
      />

      {/* Page Header */}
      <div className="bg-white dark:bg-vettr-card/30 border-b border-gray-200 dark:border-white/5 px-4 py-6 md:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Discovery</h1>
            <p className="text-sm text-gray-400">
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
        {/* Hero Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <SearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by ticker, company name, or sector..."
              autoFocus={false}
              className="text-lg py-3 shadow-lg shadow-vettr-accent/5 focus:shadow-vettr-accent/10 transition-shadow"
            />
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
            Filter by Sector
          </h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {sectors.map((sector) => {
              const isSelected = sector === 'All'
                ? selectedSectors.size === 0
                : selectedSectors.has(sector);

              return (
                <button
                  key={sector}
                  onClick={() => handleSectorClick(sector)}
                  className={`
                    flex-shrink-0 px-4 py-1.5 text-sm font-medium rounded-full
                    transition-all duration-300
                    ${isSelected
                      ? 'bg-vettr-accent/10 border border-vettr-accent/30 text-vettr-accent'
                      : 'bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10'
                    }
                  `}
                >
                  {sector}
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured Collections Section */}
        {(isLoadingCollections || collections.length > 0) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Collections</h2>
            </div>

            {isLoadingCollections ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <SkeletonCollectionCard key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {collections.slice(0, 6).map((collection) => (
                  <CollectionCard
                    key={collection.id}
                    collection={collection}
                    onClick={() => router.push(`/discovery/collection/${collection.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Featured Stocks Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Featured Stocks</h2>
            <button
              onClick={() => router.push('/stocks')}
              className="flex items-center gap-1 text-sm text-vettr-accent hover:text-vettr-accent/80 transition-colors"
            >
              View All <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          {/* Horizontal Scroll Container with Snap Scrolling */}
          {isLoadingStocks || isLoadingFiltered ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-full sm:w-80 snap-start">
                  <SkeletonStockCard />
                </div>
              ))}
            </div>
          ) : isErrorStocks ? (
            <EmptyState
              icon={<AlertTriangleIcon className="w-16 h-16 text-yellow-400" />}
              title="Failed to load stocks"
              description="Unable to fetch stocks. Please try again later."
            />
          ) : featuredStocks.length === 0 ? (
            <EmptyState
              icon={<SearchIcon className="w-16 h-16 text-gray-600" />}
              title="No stocks found"
              description={
                searchQuery || selectedSectors.size > 0
                  ? 'Try adjusting your search or filter criteria.'
                  : 'No stocks available at this time.'
              }
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 snap-x snap-mandatory">
              {featuredStocks.map((stock) => (
                <div key={stock.ticker} className="flex-shrink-0 w-full sm:w-80 snap-start">
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
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Filings</h2>
            <button
              onClick={() => router.push('/filings')}
              className="text-sm text-vettr-accent hover:text-vettr-accent/80 transition-colors"
            >
              View All →
            </button>
          </div>

          {/* Filings List - Responsive: Cards on mobile, Table on desktop */}
          {isLoadingFilings ? (
            <>
              {/* Desktop Table Skeleton */}
              <div className="hidden md:block bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-white/5">
                      <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Type</th>
                      <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Title</th>
                      <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Ticker</th>
                      <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Date</th>
                      <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Material</th>
                      <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(5)].map((_, i) => (
                      <SkeletonFilingRow key={i} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Skeleton */}
              <div className="md:hidden space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                    <div className="flex items-start gap-4">
                      <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                        <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                        <div className="flex gap-2">
                          <div className="h-5 w-16 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                          <div className="h-5 w-16 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : filingsError ? (
            <EmptyState
              icon={<AlertTriangleIcon className="w-16 h-16 text-yellow-400" />}
              title="Failed to load filings"
              description="Unable to fetch recent filings. Please try again later."
            />
          ) : filteredFilings.length === 0 ? (
            <EmptyState
              icon={<DocumentIcon className="w-16 h-16 text-gray-600" />}
              title="No filings found"
              description={
                selectedSectors.size > 0
                  ? `No recent filings in the selected sector${selectedSectors.size > 1 ? 's' : ''}.`
                  : 'No recent filings available.'
              }
            />
          ) : (
            <>
              {/* Desktop: Table View */}
              <div className="hidden md:block bg-white dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
                <FilingTable filings={filteredFilings} showStock={true} />
              </div>
              {/* Mobile: Card View */}
              <div className="md:hidden space-y-3">
                {filteredFilings.map((filing) => (
                  <FilingRow key={filing.id} filing={filing} />
                ))}
              </div>
            </>
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
        block bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4
        hover:bg-gray-50 dark:hover:bg-vettr-card/80 hover:border-vettr-accent/20 transition-all duration-300
      "
    >
      <div className="flex items-start gap-4">
        {/* Unread indicator (blue dot) */}
        {!filing.is_read && (
          <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0 mt-2" />
        )}

        {/* Filing Type Icon */}
        <div className="flex-shrink-0">
          <FilingTypeIcon type={filing.type as FilingType} size="md" />
        </div>

        {/* Filing Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white line-clamp-2">
              {filing.title}
            </h3>
            {filing.is_material && (
              <span className="flex-shrink-0 px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
                Material
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-400">
            <span className="font-medium text-vettr-accent">{filing.ticker}</span>
            <span>•</span>
            <span>{formattedDate}</span>
          </div>

          {/* Summary Preview (if available) */}
          {filing.summary && (
            <p className="mt-2 text-sm text-gray-500 line-clamp-2">
              {filing.summary}
            </p>
          )}
        </div>
      </div>
    </a>
  );
}

/**
 * Collection Card Component
 *
 * Displays a single collection with icon, title, tagline, and criteria summary
 */
interface CollectionCardProps {
  collection: any; // Using any to avoid importing the type
  onClick: () => void;
}

function CollectionCard({ collection, onClick }: CollectionCardProps) {
  const icon = collectionIcons[collection.icon] || '📊';

  return (
    <div
      onClick={onClick}
      className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-gray-50 dark:hover:bg-vettr-card/80 transition-all duration-300 cursor-pointer"
    >
      {/* Icon in circle */}
      <div className="w-10 h-10 rounded-full bg-vettr-accent/10 flex items-center justify-center mb-3">
        <span className="text-xl">{icon}</span>
      </div>
      {/* Title */}
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{collection.name}</h3>
      {/* Tagline */}
      <p className="text-xs text-gray-400 mb-3 line-clamp-2">{collection.tagline}</p>
      {/* Criteria summary */}
      <p className="text-xs text-vettr-accent font-medium">{collection.criteria_summary}</p>
    </div>
  );
}

/**
 * Collection Card Skeleton
 *
 * Loading skeleton for collection cards
 */
function SkeletonCollectionCard() {
  return (
    <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
      {/* Icon skeleton */}
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 animate-pulse mb-3" />
      {/* Title skeleton */}
      <div className="h-4 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-1" />
      {/* Tagline skeleton */}
      <div className="h-3 w-full bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-1" />
      <div className="h-3 w-2/3 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-3" />
      {/* Criteria skeleton */}
      <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
    </div>
  );
}

// Wrap in Suspense to fix Next.js build error with useSearchParams
export default function DiscoveryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-lightBg dark:bg-vettr-navy pb-20 md:pb-6">
        <div className="bg-white dark:bg-vettr-card/30 border-b border-gray-200 dark:border-white/5 px-4 py-6 md:px-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Discovery</h1>
        </div>
        <div className="px-4 py-6 md:px-6">
          <div className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse mb-6 max-w-2xl mx-auto"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <DiscoveryPageContent />
    </Suspense>
  );
}
