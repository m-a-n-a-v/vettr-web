'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import FilingTypeIcon from './FilingTypeIcon';
import type { Filing, FilingType } from '@/types/api';

interface FilingTableProps {
  filings: Filing[];
  showStock?: boolean; // Whether to show the stock/ticker column
}

type SortField = 'type' | 'title' | 'ticker' | 'date' | 'material' | 'status';
type SortDirection = 'asc' | 'desc';

export default function FilingTable({ filings, showStock = true }: FilingTableProps) {
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default descending for date, ascending for others
      setSortField(field);
      setSortDirection(field === 'date' ? 'desc' : 'asc');
    }
  };

  // Sort filings based on current sort field and direction
  const sortedFilings = useMemo(() => {
    const sorted = [...filings].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'type':
          comparison = a.type.localeCompare(b.type);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'ticker':
          comparison = (a.ticker || '').localeCompare(b.ticker || '');
          break;
        case 'date':
          comparison = new Date(a.date_filed).getTime() - new Date(b.date_filed).getTime();
          break;
        case 'material':
          comparison = (a.is_material ? 1 : 0) - (b.is_material ? 1 : 0);
          break;
        case 'status':
          comparison = (a.is_read ? 1 : 0) - (b.is_read ? 1 : 0);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filings, sortField, sortDirection]);

  // Render sort indicator
  const SortIndicator = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-textMuted opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center gap-2">
                Type
                <SortIndicator field="type" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-2">
                Title
                <SortIndicator field="title" />
              </div>
            </th>
            {showStock && (
              <th
                className="px-4 py-3 text-left text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
                onClick={() => handleSort('ticker')}
              >
                <div className="flex items-center gap-2">
                  Stock
                  <SortIndicator field="ticker" />
                </div>
              </th>
            )}
            <th
              className="px-4 py-3 text-left text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-2">
                Date
                <SortIndicator field="date" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-center text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
              onClick={() => handleSort('material')}
            >
              <div className="flex items-center justify-center gap-2">
                Material
                <SortIndicator field="material" />
              </div>
            </th>
            <th
              className="px-4 py-3 text-center text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center justify-center gap-2">
                Status
                <SortIndicator field="status" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedFilings.map((filing) => (
            <tr
              key={filing.id}
              className="border-b border-border/50 hover:bg-surface/50 transition-colors"
            >
              <td className="px-4 py-4">
                <Link href={`/filings/${filing.id}`} className="flex items-center gap-3">
                  <FilingTypeIcon type={filing.type as FilingType} size="sm" />
                  <span className="text-sm text-textSecondary">{filing.type}</span>
                </Link>
              </td>
              <td className="px-4 py-4">
                <Link href={`/filings/${filing.id}`} className="block">
                  <div className="flex items-center gap-2">
                    {!filing.is_read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                    )}
                    <span className="text-sm text-textPrimary font-medium hover:text-accent transition-colors line-clamp-2">
                      {filing.title}
                    </span>
                  </div>
                </Link>
              </td>
              {showStock && (
                <td className="px-4 py-4">
                  <Link
                    href={`/stocks/${filing.ticker}`}
                    className="text-sm text-accent hover:text-accentDim font-medium transition-colors"
                  >
                    {filing.ticker}
                  </Link>
                </td>
              )}
              <td className="px-4 py-4">
                <Link href={`/filings/${filing.id}`} className="block">
                  <span className="text-sm text-textSecondary">
                    {new Date(filing.date_filed).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </Link>
              </td>
              <td className="px-4 py-4 text-center">
                <Link href={`/filings/${filing.id}`} className="block">
                  {filing.is_material ? (
                    <span className="inline-block px-2 py-1 bg-warning/20 border border-warning/30 rounded text-xs font-medium text-warning">
                      Yes
                    </span>
                  ) : (
                    <span className="text-sm text-textMuted">No</span>
                  )}
                </Link>
              </td>
              <td className="px-4 py-4 text-center">
                <Link href={`/filings/${filing.id}`} className="block">
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      filing.is_read
                        ? 'bg-surface text-textMuted'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {filing.is_read ? 'Read' : 'Unread'}
                  </span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
