'use client';

import Link from 'next/link';
import { Stock } from '@/types/api';
import VetrScoreBadge from './VetrScoreBadge';
import SectorChip from './SectorChip';
import PriceChangeIndicator from './PriceChangeIndicator';
import { StarIcon, StarFilledIcon } from '@/components/icons';

interface StockCardProps {
  stock: Stock;
  showFavorite?: boolean;
  onFavoriteToggle?: (ticker: string) => Promise<void>;
  isFavorite?: boolean;
  isTogglingFavorite?: boolean;
}

export default function StockCard({
  stock,
  showFavorite = true,
  onFavoriteToggle,
  isFavorite = false,
  isTogglingFavorite = false
}: StockCardProps) {
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle && !isTogglingFavorite) {
      await onFavoriteToggle(stock.ticker);
    }
  };

  return (
    <Link href={`/stocks/${stock.ticker}`}>
      <div className="relative bg-vettr-card/50 border border-white/5 rounded-2xl p-5 cursor-pointer group hover:border-vettr-accent/20 hover:bg-vettr-card/80 hover:shadow-lg hover:shadow-vettr-accent/5 transition-all duration-300">
        {/* Header Row: Ticker, Company Name, Favorite Star */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-bold text-vettr-accent">
                {stock.ticker}
              </h3>
              {showFavorite && onFavoriteToggle && (
                <button
                  onClick={handleFavoriteClick}
                  disabled={isTogglingFavorite}
                  className="transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={isFavorite ? 'Remove from watchlist' : 'Add to watchlist'}
                >
                  {isTogglingFavorite ? (
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : isFavorite ? (
                    <StarFilledIcon className="w-4 h-4 text-yellow-400" />
                  ) : (
                    <StarIcon className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                  )}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-400 truncate">{stock.company_name}</p>
          </div>
        </div>

        {/* Price Row */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white">
              ${stock.current_price.toFixed(2)}
            </span>
            <PriceChangeIndicator change={stock.price_change_percent} size="sm" />
          </div>
        </div>

        {/* Bottom Row: Sector Chip + VETTR Score */}
        <div className="flex items-center justify-between gap-2">
          <SectorChip sector={stock.sector} />
          <VetrScoreBadge score={stock.vetr_score} size="sm" />
        </div>
      </div>
    </Link>
  );
}
