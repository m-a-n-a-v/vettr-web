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
        <svg className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }

    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-vettr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-vettr-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px] border-collapse" role="table" aria-label="Filings">
        <thead className="bg-vettr-navy">
          <tr role="row" className="border-b border-white/5">
            <th
              role="columnheader"
              aria-sort={sortField === 'type' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium hover:text-white cursor-pointer group"
              onClick={() => handleSort('type')}
            >
              <div className="flex items-center gap-2">
                Type
                <SortIndicator field="type" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium hover:text-white cursor-pointer group"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-2">
                Title
                <SortIndicator field="title" />
              </div>
            </th>
            {showStock && (
              <th
                role="columnheader"
                aria-sort={sortField === 'ticker' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium hover:text-white cursor-pointer group"
                onClick={() => handleSort('ticker')}
              >
                <div className="flex items-center gap-2">
                  Ticker
                  <SortIndicator field="ticker" />
                </div>
              </th>
            )}
            <th
              role="columnheader"
              aria-sort={sortField === 'date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-left text-xs text-gray-500 uppercase tracking-wider font-medium hover:text-white cursor-pointer group"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-2">
                Date
                <SortIndicator field="date" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'material' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="hidden md:table-cell px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider font-medium hover:text-white cursor-pointer group"
              onClick={() => handleSort('material')}
            >
              <div className="flex items-center justify-center gap-2">
                Material
                <SortIndicator field="material" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'status' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-center text-xs text-gray-500 uppercase tracking-wider font-medium hover:text-white cursor-pointer group"
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
              role="row"
              className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
              onClick={() => window.location.href = `/filings/${filing.id}`}
            >
              <td role="cell" className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <FilingTypeIcon type={filing.type as FilingType} size="sm" />
                  <span className="text-sm text-gray-400">{filing.type}</span>
                </div>
              </td>
              <td role="cell" className="px-4 py-3">
                <div className="flex items-center gap-2">
                  {!filing.is_read && (
                    <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" aria-label="Unread filing" />
                  )}
                  <span className="text-sm text-white font-medium line-clamp-2">
                    {filing.title}
                  </span>
                  {filing.is_material && (
                    <span className="flex-shrink-0 px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
                      Material
                    </span>
                  )}
                </div>
              </td>
              {showStock && (
                <td role="cell" className="px-4 py-3">
                  <Link
                    href={`/stocks/${filing.ticker}`}
                    className="text-sm text-vettr-accent hover:text-vettr-accent/80 font-medium transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {filing.ticker}
                  </Link>
                </td>
              )}
              <td role="cell" className="px-4 py-3">
                <span className="text-sm text-gray-400">
                  {new Date(filing.date_filed).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </td>
              <td role="cell" className="hidden md:table-cell px-4 py-3 text-center">
                {filing.is_material ? (
                  <span className="inline-block px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-medium">
                    Yes
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">No</span>
                )}
              </td>
              <td role="cell" className="px-4 py-3 text-center">
                <span
                  className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    filing.is_read
                      ? 'bg-white/5 text-gray-500'
                      : 'bg-vettr-accent/10 text-vettr-accent'
                  }`}
                >
                  {filing.is_read ? 'Read' : 'Unread'}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
