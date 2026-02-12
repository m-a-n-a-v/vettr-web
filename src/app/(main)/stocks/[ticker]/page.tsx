'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useStock } from '@/hooks/useStock';
import { useVetrScore } from '@/hooks/useVetrScore';
import { useFilings } from '@/hooks/useFilings';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useToast } from '@/contexts/ToastContext';
import VetrScoreBadge from '@/components/ui/VetrScoreBadge';
import SectorChip from '@/components/ui/SectorChip';
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator';
import FilingTypeIcon from '@/components/ui/FilingTypeIcon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';

type Tab = 'overview' | 'pedigree' | 'red-flags';

export default function StockDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { showToast } = useToast();

  const { stock, isLoading: stockLoading, error: stockError } = useStock(ticker);
  const { score, isLoading: scoreLoading } = useVetrScore({ ticker });
  const { filings, isLoading: filingsLoading } = useFilings({ ticker, limit: 5 });
  const { watchlist, isAdding, isRemoving, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const isInWatchlist = watchlist.some(item => item.ticker === ticker);
  const isTogglingFavorite = isAdding || isRemoving;

  const handleFavoriteToggle = async () => {
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(ticker);
        showToast('Removed from watchlist', 'success');
      } else {
        await addToWatchlist(ticker);
        showToast('Added to watchlist', 'success');
      }
    } catch (error) {
      showToast('Failed to update watchlist', 'error');
    }
  };

  const handleShare = async () => {
    if (!stock) return;

    const shareText = `${stock.ticker} - ${stock.company_name}\nVETTR Score: ${stock.vetr_score}\nPrice: $${stock.current_price?.toFixed(2)}\nSector: ${stock.sector}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (error) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('Copied to clipboard', 'success');
      } catch (error) {
        showToast('Failed to copy', 'error');
      }
    }
  };

  if (stockLoading) {
    return (
      <div className="min-h-screen bg-primary p-6 pb-20 md:pb-6">
        <LoadingSpinner centered size="lg" message="Loading stock details..." />
      </div>
    );
  }

  if (stockError || !stock) {
    return (
      <div className="min-h-screen bg-primary p-6 pb-20 md:pb-6">
        <EmptyState
          icon="⚠️"
          title="Stock not found"
          message="The stock you're looking for doesn't exist or couldn't be loaded."
          actionLabel="Back to Stocks"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header with price info */}
      <div className="bg-primaryLight border-b border-border p-6">
        <div className="max-w-6xl mx-auto">
          {/* Title and actions */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary mb-2">{stock.company_name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xl text-textSecondary">{stock.ticker}</span>
                <SectorChip sector={stock.sector} />
                {stock.exchange && (
                  <span className="px-3 py-1 rounded-full bg-surface text-textSecondary text-sm">
                    {stock.exchange}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFavoriteToggle}
                disabled={isTogglingFavorite}
                className="p-2 rounded-lg bg-surface hover:bg-surfaceLight transition-colors disabled:opacity-50"
                aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {isTogglingFavorite ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill={isInWatchlist ? '#00E676' : 'none'}
                    stroke={isInWatchlist ? '#00E676' : 'currentColor'}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-surface hover:bg-surfaceLight transition-colors"
                aria-label="Share stock"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Price info */}
          <div className="flex items-end gap-4">
            <span className="text-5xl font-bold text-textPrimary">
              ${stock.current_price?.toFixed(2) || 'N/A'}
            </span>
            {stock.price_change_percent !== null && stock.price_change_percent !== undefined && (
              <div className="mb-2">
                <PriceChangeIndicator change={stock.price_change_percent} size="lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-primaryLight border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'text-accent border-accent'
                  : 'text-textSecondary border-transparent hover:text-textPrimary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pedigree')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'pedigree'
                  ? 'text-accent border-accent'
                  : 'text-textSecondary border-transparent hover:text-textPrimary'
              }`}
            >
              Pedigree
            </button>
            <button
              onClick={() => setActiveTab('red-flags')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'red-flags'
                  ? 'text-accent border-accent'
                  : 'text-textSecondary border-transparent hover:text-textPrimary'
              }`}
            >
              Red Flags
            </button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto p-6 pb-20 md:pb-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* VETTR Score section */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-textPrimary mb-4">VETTR Score</h2>
              {scoreLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" color="accent" />
                </div>
              ) : score ? (
                <div className="flex items-center justify-center">
                  <VetrScoreBadge score={score.overall_score} size="lg" />
                </div>
              ) : (
                <p className="text-textSecondary text-center py-4">Score not available</p>
              )}
            </div>

            {/* Key Metrics grid */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-textPrimary mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-textMuted text-sm mb-1">Market Cap</p>
                  <p className="text-textPrimary font-semibold">
                    {stock.market_cap
                      ? `$${(stock.market_cap / 1000000).toFixed(1)}M`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-textMuted text-sm mb-1">Exchange</p>
                  <p className="text-textPrimary font-semibold">{stock.exchange || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-textMuted text-sm mb-1">Sector</p>
                  <p className="text-textPrimary font-semibold">{stock.sector}</p>
                </div>
                <div>
                  <p className="text-textMuted text-sm mb-1">Filings</p>
                  <p className="text-textPrimary font-semibold">
                    {filings?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Filings */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-textPrimary mb-4">Recent Filings</h2>
              {filingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-20 bg-surface/50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filings && filings.length > 0 ? (
                <div className="space-y-3">
                  {filings.map(filing => (
                    <Link
                      key={filing.id}
                      href={`/filings/${filing.id}`}
                      className="block p-4 bg-surface hover:bg-surfaceLight rounded-lg border border-border transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <FilingTypeIcon type={filing.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-textPrimary font-medium truncate">
                              {filing.title}
                            </h3>
                            {filing.is_material && (
                              <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-xs font-medium flex-shrink-0">
                                Material
                              </span>
                            )}
                          </div>
                          <p className="text-textMuted text-sm mb-2">
                            {new Date(filing.date_filed).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          {filing.summary && (
                            <p className="text-textSecondary text-sm line-clamp-2">
                              {filing.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📄"
                  title="No filings found"
                  message="This stock doesn't have any recent filings."
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'pedigree' && (
          <div className="bg-primaryLight rounded-lg p-6 border border-border">
            <EmptyState
              icon="👔"
              title="Pedigree tab"
              message="Executive information will be displayed here. Coming soon!"
            />
          </div>
        )}

        {activeTab === 'red-flags' && (
          <div className="bg-primaryLight rounded-lg p-6 border border-border">
            <EmptyState
              icon="🚩"
              title="Red Flags tab"
              message="Red flag analysis will be displayed here. Coming soon!"
            />
          </div>
        )}
      </div>
    </div>
  );
}
