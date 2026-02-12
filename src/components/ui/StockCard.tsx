'use client';

import Link from 'next/link';
import { Stock } from '@/types/api';
import VetrScoreBadge from './VetrScoreBadge';
import SectorChip from './SectorChip';
import PriceChangeIndicator from './PriceChangeIndicator';

interface StockCardProps {
  stock: Stock;
  showFavorite?: boolean;
  onFavoriteToggle?: (ticker: string) => void;
  isFavorite?: boolean;
}

export default function StockCard({
  stock,
  showFavorite = false,
  onFavoriteToggle,
  isFavorite = false
}: StockCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(stock.ticker);
    }
  };

  // Generate company initials from ticker or name
  const getInitials = () => {
    if (stock.ticker.length <= 3) {
      return stock.ticker;
    }
    const words = stock.company_name.split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return stock.ticker.substring(0, 2);
  };

  return (
    <Link href={`/stocks/${stock.ticker}`}>
      <div className="relative bg-primaryLight hover:bg-surfaceLight border border-border rounded-lg p-4 transition-all duration-200 hover:shadow-lg cursor-pointer group">
        {/* Favorite Star (if enabled) */}
        {showFavorite && (
          <button
            onClick={handleFavoriteClick}
            className="absolute top-3 right-3 text-xl transition-colors duration-200 hover:scale-110 z-10"
            aria-label={isFavorite ? 'Remove from watchlist' : 'Add to watchlist'}
          >
            {isFavorite ? (
              <span className="text-accent">★</span>
            ) : (
              <span className="text-textMuted group-hover:text-textSecondary">☆</span>
            )}
          </button>
        )}

        {/* Company Initials Avatar */}
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center text-accent font-bold flex-shrink-0">
            {getInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-bold text-textPrimary truncate">
                {stock.ticker}
              </h3>
              <VetrScoreBadge score={stock.vetr_score} size="sm" />
            </div>
            <p className="text-sm text-textSecondary truncate">{stock.company_name}</p>
          </div>
        </div>

        {/* Price and Change */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-textPrimary">
              ${stock.current_price.toFixed(2)}
            </span>
            <PriceChangeIndicator change={stock.price_change_percent} />
          </div>
        </div>

        {/* Sector and Exchange */}
        <div className="flex items-center gap-2 flex-wrap">
          <SectorChip sector={stock.sector} />
          <span className="px-2 py-1 bg-surface text-textSecondary text-xs rounded">
            {stock.exchange}
          </span>
        </div>

        {/* Market Cap (optional) */}
        {stock.market_cap && (
          <div className="mt-3 pt-3 border-t border-border">
            <div className="text-xs text-textMuted">Market Cap</div>
            <div className="text-sm text-textSecondary font-medium">
              ${(stock.market_cap / 1000000).toFixed(1)}M
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
