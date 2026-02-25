'use client';

import { useState } from 'react';
import { useStockSearch } from '@/hooks/useStockSearch';

interface AiAgentTickerPickerProps {
  onSelectTicker: (ticker: string) => void;
}

export function AiAgentTickerPicker({
  onSelectTicker,
}: AiAgentTickerPickerProps) {
  const [query, setQuery] = useState('');
  const { results, isLoading, isSearching } = useStockSearch(query, 300);

  const handleSelectStock = (ticker: string) => {
    onSelectTicker(ticker);
    setQuery(''); // Clear search after selection
  };

  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-500"
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
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a stock to get started..."
          className="w-full bg-white/5 dark:bg-white/5 border border-white/10 dark:border-white/10 rounded-xl pl-10 pr-3 py-2 text-sm text-gray-200 dark:text-gray-200 placeholder:text-gray-500 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-vettr-accent focus:border-transparent"
          autoFocus
        />
        {(isLoading || isSearching) && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg
              className="animate-spin h-4 w-4 text-vettr-accent dark:text-vettr-accent"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Search Results */}
      {query.trim().length > 0 && results.length > 0 && (
        <div className="space-y-1 max-h-60 overflow-y-auto">
          {results.slice(0, 5).map((stock) => (
            <button
              key={stock.ticker}
              onClick={() => handleSelectStock(stock.ticker)}
              className="w-full flex items-center justify-between px-3 py-2 bg-white/5 dark:bg-white/5 hover:bg-white/10 dark:hover:bg-white/10 rounded-lg transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-semibold text-vettr-accent dark:text-vettr-accent">
                    {stock.ticker}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {stock.exchange}
                  </span>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-400 truncate">
                  {stock.company_name}
                </div>
              </div>
              <svg
                className="w-4 h-4 text-gray-500 dark:text-gray-500 shrink-0 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ))}
        </div>
      )}

      {/* No Results */}
      {query.trim().length > 0 && !isLoading && !isSearching && results.length === 0 && (
        <div className="text-center py-6">
          <div className="text-sm text-gray-500 dark:text-gray-500">
            No stocks found for &quot;{query}&quot;
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-600 mt-1">
            Try searching by ticker or company name
          </div>
        </div>
      )}

      {/* Empty State */}
      {query.trim().length === 0 && (
        <div className="text-center py-8">
          <svg
            className="w-12 h-12 mx-auto text-gray-600 dark:text-gray-600 mb-3"
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
          <div className="text-sm text-gray-500 dark:text-gray-500">
            Search for any stock to start asking questions
          </div>
        </div>
      )}
    </div>
  );
}
