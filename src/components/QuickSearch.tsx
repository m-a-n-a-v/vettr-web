'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStockSearch } from '@/hooks/useStockSearch';
import type { StockSearchResult } from '@/types/api';
import { SearchIcon } from '@/components/icons';

const MAX_RECENT_SEARCHES = 5;
const RECENT_SEARCHES_KEY = 'vettr_recent_searches';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickSearch({ isOpen, onClose }: QuickSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<StockSearchResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const { results, isLoading, isSearching } = useStockSearch(query, 300);

  // Define callback functions first (before useEffect hooks)
  const saveToRecentSearches = useCallback((stock: StockSearchResult) => {
    if (typeof window === 'undefined') return;

    // Remove duplicate if exists, add to front, limit to MAX_RECENT_SEARCHES
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.ticker !== stock.ticker);
      const updated = [stock, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleSelectStock = useCallback((stock: StockSearchResult) => {
    saveToRecentSearches(stock);
    onClose();
    router.push(`/stocks/${stock.ticker}`);
  }, [saveToRecentSearches, onClose, router]);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setRecentSearches(parsed);
        } catch (error) {
          console.error('Failed to parse recent searches:', error);
        }
      }
    }
  }, [isOpen]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle arrow keys and Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const displayItems = query.trim() ? results : recentSearches;
      const maxIndex = displayItems.length - 1;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, maxIndex));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayItems.length > 0 && selectedIndex >= 0) {
          handleSelectStock(displayItems[selectedIndex]);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, query, results, recentSearches, selectedIndex, handleSelectStock]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const displayItems = query.trim() ? results : recentSearches;
  const showEmptyState = query.trim() && !isLoading && results.length === 0;
  const showRecentSearches = !query.trim() && recentSearches.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Search Modal */}
      <div className="relative w-full max-w-xl bg-vettr-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center border-b border-white/5 px-5 py-4">
          {/* Search Icon */}
          <SearchIcon className="w-5 h-5 text-gray-500 mr-3 flex-shrink-0" />

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks by ticker or name..."
            aria-label="Search stocks by ticker or name"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-gray-500 text-lg focus:ring-0"
            autoComplete="off"
          />

          {/* Loading indicator */}
          {(isLoading || isSearching) && (
            <div className="w-4 h-4 border-2 border-vettr-accent border-t-transparent rounded-full animate-spin ml-3" />
          )}
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto">
          {showRecentSearches && (
            <div className="px-5 py-2 text-xs text-gray-500 font-medium uppercase tracking-wider">
              Recent
            </div>
          )}

          {displayItems.length > 0 && (
            <ul>
              {displayItems.map((stock, index) => (
                <li key={stock.ticker}>
                  <button
                    type="button"
                    onClick={() => handleSelectStock(stock)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center gap-3 px-5 py-3 transition-colors cursor-pointer ${
                      index === selectedIndex ? 'bg-white/5' : 'hover:bg-white/5'
                    }`}
                  >
                    {/* Ticker and company name */}
                    <div className="flex-1 min-w-0 text-left">
                      <div className="font-mono text-vettr-accent text-sm font-semibold">
                        {stock.ticker}
                      </div>
                      <div className="text-white text-sm truncate">{stock.company_name}</div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex-shrink-0">
                      {stock.current_price !== undefined && (
                        <div className="text-white text-sm font-medium">
                          ${stock.current_price.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Empty state */}
          {showEmptyState && (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-400 text-sm">No results found</p>
            </div>
          )}

          {/* No recent searches */}
          {!query.trim() && recentSearches.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-gray-400 text-sm">Start typing to search for stocks</p>
            </div>
          )}
        </div>

        {/* Footer with keyboard hints */}
        <div className="px-5 py-3 border-t border-white/5 flex items-center justify-center gap-4 text-xs text-gray-600">
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs">↑</kbd>
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs">↓</kbd>
            <span className="ml-1">Navigate</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs">↵</kbd>
            <span className="ml-1">Open</span>
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-xs">Esc</kbd>
            <span className="ml-1">Close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
