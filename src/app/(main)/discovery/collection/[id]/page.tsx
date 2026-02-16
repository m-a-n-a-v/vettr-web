'use client';

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useDiscoveryCollections } from '@/hooks/useDiscoveryCollections';
import VetrScoreBadge from '@/components/ui/VetrScoreBadge';
import EmptyState from '@/components/ui/EmptyState';
import { AlertTriangleIcon, SearchIcon } from '@/components/icons';
import type { CollectionStock } from '@/types/api';

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
 * Stock Row Component
 *
 * Displays a single stock in the collection with ticker, name, price, change, and VETR score
 */
interface StockRowProps {
  stock: CollectionStock;
  onClick: () => void;
}

function StockRow({ stock, onClick }: StockRowProps) {
  const priceChangeColor = (stock.price_change ?? 0) >= 0 ? 'text-green-400' : 'text-red-400';
  const priceChangeSign = (stock.price_change ?? 0) >= 0 ? '+' : '';

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between bg-vettr-card/50 border border-white/5 rounded-xl p-4 hover:border-vettr-accent/20 cursor-pointer transition-all"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-bold text-vettr-accent">{stock.ticker}</span>
            <span className="text-xs text-gray-400 truncate">{stock.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-0.5 bg-white/5 text-gray-400 rounded-full">
              {stock.sector}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        <div className="text-right">
          <div className="text-sm text-white font-medium">
            {stock.price !== null ? `$${stock.price.toFixed(2)}` : 'N/A'}
          </div>
          <div className={`text-xs font-medium ${priceChangeColor}`}>
            {stock.price_change !== null
              ? `${priceChangeSign}${stock.price_change.toFixed(1)}%`
              : '0.0%'}
          </div>
        </div>
        <VetrScoreBadge score={stock.vetr_score ?? 0} size="sm" animate={false} />
      </div>
    </div>
  );
}

/**
 * Collection Detail Page
 *
 * Displays details of a specific collection including its stocks
 */
export default function CollectionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const collectionId = params.id as string;

  // Fetch collections
  const { collections, isLoading, isError } = useDiscoveryCollections();

  // Find the matching collection by ID
  const collection = useMemo(() => {
    return collections.find(c => c.id === collectionId);
  }, [collections, collectionId]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-vettr-navy pb-20 md:pb-6">
        <div className="px-4 py-6 md:px-6 space-y-6">
          {/* Back button skeleton */}
          <div className="h-4 w-32 bg-white/5 rounded animate-pulse" />

          {/* Header skeleton */}
          <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/5 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-6 w-2/3 bg-white/5 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-white/5 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
          </div>

          {/* Stock list skeleton */}
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-vettr-card/50 border border-white/5 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/3 bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-1/4 bg-white/5 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                    <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-vettr-navy pb-20 md:pb-6">
        <div className="px-4 py-6 md:px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← Back to Discovery
          </button>
          <EmptyState
            icon={<AlertTriangleIcon className="w-16 h-16 text-yellow-400" />}
            title="Failed to load collections"
            description="Unable to fetch collections. Please try again later."
          />
        </div>
      </div>
    );
  }

  // Collection not found
  if (!collection) {
    return (
      <div className="min-h-screen bg-vettr-navy pb-20 md:pb-6">
        <div className="px-4 py-6 md:px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-4 transition-colors"
          >
            ← Back to Discovery
          </button>
          <EmptyState
            icon={<SearchIcon className="w-16 h-16 text-gray-600" />}
            title="Collection not found"
            description="The collection you're looking for doesn't exist or has been removed."
            actionLabel="Back to Discovery"
            onAction={() => router.push('/discovery')}
          />
        </div>
      </div>
    );
  }

  const icon = collectionIcons[collection.icon] || '📊';

  return (
    <div className="min-h-screen bg-vettr-navy pb-20 md:pb-6">
      <div className="px-4 py-6 md:px-6 space-y-6">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          ← Back to Discovery
        </button>

        {/* Collection Header */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-full bg-vettr-accent/10 flex items-center justify-center">
              <span className="text-3xl">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-white mb-1">{collection.name}</h1>
              <p className="text-sm text-gray-400">{collection.tagline}</p>
            </div>
          </div>
          <p className="text-sm text-vettr-accent font-medium">{collection.criteria_summary}</p>
        </div>

        {/* Stocks List */}
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">
            Stocks ({collection.stocks.length})
          </h2>
          {collection.stocks.length === 0 ? (
            <EmptyState
              icon={<SearchIcon className="w-16 h-16 text-gray-600" />}
              title="No stocks in this collection"
              description="This collection doesn't have any stocks yet."
            />
          ) : (
            <div className="space-y-2">
              {collection.stocks.map((stock) => (
                <StockRow
                  key={stock.ticker}
                  stock={stock}
                  onClick={() => router.push(`/stocks/${stock.ticker}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
