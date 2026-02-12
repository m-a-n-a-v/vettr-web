'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useStockSearch } from '@/hooks/useStockSearch';
import type { StockSearchResult } from '@/types/api';

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
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 animate-fadeIn"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Search Modal */}
      <div
        className="
          relative w-full max-w-2xl bg-primaryLight rounded-xl
          border border-border shadow-2xl
          animate-slideUp
        "
      >
        {/* Search Input */}
        <div className="flex items-center px-4 py-3 border-b border-border">
          {/* Search Icon */}
          <svg
            className="w-5 h-5 text-textMuted mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stocks by ticker or name..."
            className="
              flex-1 bg-transparent border-none outline-none
              text-textPrimary placeholder-textMuted
              text-base
            "
            autoComplete="off"
          />

          {/* Loading indicator */}
          {(isLoading || isSearching) && (
            <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          )}

          {/* Keyboard shortcut hint */}
          <div className="ml-3 text-xs text-textMuted hidden sm:block">
            <kbd className="px-2 py-1 bg-surface rounded border border-border">Esc</kbd>
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {showRecentSearches && (
            <div className="px-4 py-2 text-xs text-textMuted font-medium">
              Recent searches
            </div>
          )}

          {displayItems.length > 0 && (
            <ul className="py-2">
              {displayItems.map((stock, index) => (
                <li key={stock.ticker}>
                  <button
                    type="button"
                    onClick={() => handleSelectStock(stock)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`
                      w-full flex items-center justify-between px-4 py-3
                      transition-colors duration-150
                      ${
                        index === selectedIndex
                          ? 'bg-surface'
                          : 'hover:bg-surface/50'
                      }
                    `}
                  >
                    {/* Left side: Stock info */}
                    <div className="flex items-center space-x-3">
                      {/* Ticker badge */}
                      <div className="flex items-center justify-center w-10 h-10 bg-primaryDark rounded-lg border border-border">
                        <span className="text-sm font-bold text-textPrimary">
                          {stock.ticker.substring(0, 2)}
                        </span>
                      </div>

                      {/* Ticker and name */}
                      <div className="text-left">
                        <div className="text-sm font-semibold text-textPrimary">
                          {stock.ticker}
                        </div>
                        <div className="text-xs text-textSecondary truncate max-w-xs">
                          {stock.company_name}
                        </div>
                      </div>
                    </div>

                    {/* Right side: Score and metadata */}
                    <div className="flex items-center space-x-3">
                      {/* Sector chip */}
                      <span className="hidden sm:inline-block px-2 py-1 text-xs bg-surface rounded border border-border text-textSecondary">
                        {stock.sector}
                      </span>

                      {/* VETTR Score badge */}
                      {stock.vetr_score !== undefined && (
                        <div
                          className={`
                            flex items-center justify-center w-10 h-10 rounded-full
                            text-xs font-bold
                            ${
                              stock.vetr_score >= 80
                                ? 'bg-accent/20 text-accent'
                                : stock.vetr_score >= 60
                                ? 'bg-yellow-500/20 text-yellow-500'
                                : stock.vetr_score >= 40
                                ? 'bg-warning/20 text-warning'
                                : 'bg-error/20 text-error'
                            }
                          `}
                        >
                          {Math.round(stock.vetr_score)}
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
            <div className="px-4 py-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-textMuted mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-textMuted text-sm">
                No stocks found matching &quot;{query}&quot;
              </p>
            </div>
          )}

          {/* No recent searches */}
          {!query.trim() && recentSearches.length === 0 && (
            <div className="px-4 py-8 text-center">
              <svg
                className="w-12 h-12 mx-auto text-textMuted mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-textMuted text-sm">
                Start typing to search for stocks
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border flex items-center justify-between text-xs text-textMuted">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">↓</kbd>
              <span className="ml-1">Navigate</span>
            </span>
            <span className="flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">Enter</kbd>
              <span className="ml-1">Select</span>
            </span>
          </div>
          <span className="flex items-center space-x-1">
            <kbd className="px-1.5 py-0.5 bg-surface rounded border border-border">Esc</kbd>
            <span className="ml-1">Close</span>
          </span>
        </div>
      </div>
    </div>
  );
}
