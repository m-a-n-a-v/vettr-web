'use client';

import { useState, useMemo } from 'react';
import type { Executive } from '@/types/api';

interface ExecutiveTableProps {
  executives: Executive[];
  onExecutiveClick?: (executive: Executive) => void;
}

type SortField = 'name' | 'title' | 'tenure' | 'experience' | 'specialization' | 'risk';
type SortDirection = 'asc' | 'desc';

export default function ExecutiveTable({ executives, onExecutiveClick }: ExecutiveTableProps) {
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort executives based on current sort field and direction
  const sortedExecutives = useMemo(() => {
    const sorted = [...executives].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'tenure':
          comparison = a.years_at_company - b.years_at_company;
          break;
        case 'experience':
          comparison = a.total_experience_years - b.total_experience_years;
          break;
        case 'specialization':
          comparison = (a.specialization || '').localeCompare(b.specialization || '');
          break;
        case 'risk':
          const riskOrder: Record<string, number> = { 'Stable': 0, 'Watch': 1, 'Flight Risk': 2, 'Unknown': 3 };
          comparison = (riskOrder[a.tenure_risk] ?? 3) - (riskOrder[b.tenure_risk] ?? 3);
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [executives, sortField, sortDirection]);

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
      <table className="w-full border-collapse" role="table" aria-label="Executive team members">
        <thead className="sticky top-16 z-20 bg-vettr-navy dark:bg-vettr-navy bg-lightBg backdrop-blur-sm">
          <tr role="row" className="border-b border-white/5 dark:border-white/5 border-gray-200">
            <th
              role="columnheader"
              aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-500 text-gray-600 uppercase tracking-wider font-medium hover:text-white dark:hover:text-white hover:text-gray-900 cursor-pointer group"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                Name
                <SortIndicator field="name" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'title' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-500 text-gray-600 uppercase tracking-wider font-medium hover:text-white dark:hover:text-white hover:text-gray-900 cursor-pointer group"
              onClick={() => handleSort('title')}
            >
              <div className="flex items-center gap-2">
                Title
                <SortIndicator field="title" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'tenure' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-500 text-gray-600 uppercase tracking-wider font-medium hover:text-white dark:hover:text-white hover:text-gray-900 cursor-pointer group"
              onClick={() => handleSort('tenure')}
            >
              <div className="flex items-center justify-center gap-2">
                Tenure
                <SortIndicator field="tenure" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'experience' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-500 text-gray-600 uppercase tracking-wider font-medium hover:text-white dark:hover:text-white hover:text-gray-900 cursor-pointer group"
              onClick={() => handleSort('experience')}
            >
              <div className="flex items-center justify-center gap-2">
                Experience
                <SortIndicator field="experience" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'specialization' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-left text-xs text-gray-500 dark:text-gray-500 text-gray-600 uppercase tracking-wider font-medium hover:text-white dark:hover:text-white hover:text-gray-900 cursor-pointer group"
              onClick={() => handleSort('specialization')}
            >
              <div className="flex items-center gap-2">
                Specialization
                <SortIndicator field="specialization" />
              </div>
            </th>
            <th
              role="columnheader"
              aria-sort={sortField === 'risk' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-center text-xs text-gray-500 dark:text-gray-500 text-gray-600 uppercase tracking-wider font-medium hover:text-white dark:hover:text-white hover:text-gray-900 cursor-pointer group"
              onClick={() => handleSort('risk')}
            >
              <div className="flex items-center justify-center gap-2">
                Risk
                <SortIndicator field="risk" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedExecutives.map((executive) => (
            <tr
              key={executive.id}
              role="row"
              className="border-b border-white/5 dark:border-white/5 border-gray-200 hover:bg-white/[0.03] dark:hover:bg-white/[0.03] hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onExecutiveClick?.(executive)}
            >
              <td role="cell" className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-vettr-accent font-bold text-sm">
                      {executive.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-white dark:text-white text-gray-900 font-semibold">
                    {executive.name}
                  </span>
                </div>
              </td>
              <td role="cell" className="px-4 py-4">
                <span className="text-sm text-gray-400 dark:text-gray-400 text-gray-600">
                  {executive.title}
                </span>
              </td>
              <td role="cell" className="px-4 py-4 text-center">
                {executive.years_at_company > 0 ? (
                  <span className="text-sm text-white dark:text-white text-gray-900 font-medium">
                    {executive.years_at_company} {executive.years_at_company === 1 ? 'year' : 'years'}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </td>
              <td role="cell" className="px-4 py-4 text-center">
                {executive.total_experience_years > 0 ? (
                  <span className="text-sm text-white dark:text-white text-gray-900 font-medium">
                    {executive.total_experience_years} {executive.total_experience_years === 1 ? 'year' : 'years'}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">—</span>
                )}
              </td>
              <td role="cell" className="px-4 py-4">
                {executive.specialization ? (
                  <span className="inline-block px-2 py-1 rounded bg-vettr-accent/10 text-vettr-accent text-xs font-medium">
                    {executive.specialization}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">-</span>
                )}
              </td>
              <td role="cell" className="px-4 py-4 text-center">
                {executive.tenure_risk === 'Unknown' ? (
                  <span className="text-sm text-gray-500">—</span>
                ) : (
                  <span
                    className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      executive.tenure_risk === 'Stable'
                        ? 'bg-vettr-accent/10 text-vettr-accent'
                        : executive.tenure_risk === 'Watch'
                        ? 'bg-yellow-400/10 text-yellow-400'
                        : 'bg-red-400/10 text-red-400'
                    }`}
                  >
                    {executive.tenure_risk}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
