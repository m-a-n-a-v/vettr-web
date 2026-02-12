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
          const riskOrder = { 'Stable': 0, 'Watch': 1, 'Flight Risk': 2 };
          comparison = riskOrder[a.tenure_risk] - riskOrder[b.tenure_risk];
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
      <table className="w-full border-collapse" role="table" aria-label="Executive team members">
        <thead>
          <tr role="row" className="border-b border-border">
            <th
              role="columnheader"
              aria-sort={sortField === 'name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
              className="px-4 py-3 text-left text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
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
              className="px-4 py-3 text-left text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
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
              className="px-4 py-3 text-center text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
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
              className="px-4 py-3 text-center text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
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
              className="px-4 py-3 text-left text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
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
              className="px-4 py-3 text-center text-sm font-semibold text-textSecondary hover:text-textPrimary cursor-pointer group"
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
              className="border-b border-border/50 hover:bg-surface/50 transition-colors cursor-pointer"
              onClick={() => onExecutiveClick?.(executive)}
            >
              <td role="cell" className="px-4 py-4">
                <div className="flex items-center gap-3">
                  {/* Initials Avatar */}
                  <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-accent font-bold text-sm">
                      {executive.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-textPrimary font-semibold">
                    {executive.name}
                  </span>
                </div>
              </td>
              <td role="cell" className="px-4 py-4">
                <span className="text-sm text-textSecondary">
                  {executive.title}
                </span>
              </td>
              <td role="cell" className="px-4 py-4 text-center">
                <span className="text-sm text-textPrimary font-medium">
                  {executive.years_at_company} {executive.years_at_company === 1 ? 'year' : 'years'}
                </span>
              </td>
              <td role="cell" className="px-4 py-4 text-center">
                <span className="text-sm text-textPrimary font-medium">
                  {executive.total_experience_years} {executive.total_experience_years === 1 ? 'year' : 'years'}
                </span>
              </td>
              <td role="cell" className="px-4 py-4">
                {executive.specialization ? (
                  <span className="inline-block px-2 py-1 rounded bg-primary text-accent text-xs font-medium">
                    {executive.specialization}
                  </span>
                ) : (
                  <span className="text-sm text-textMuted">-</span>
                )}
              </td>
              <td role="cell" className="px-4 py-4 text-center">
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    executive.tenure_risk === 'Stable'
                      ? 'bg-accent/20 text-accent'
                      : executive.tenure_risk === 'Watch'
                      ? 'bg-warning/20 text-warning'
                      : 'bg-error/20 text-error'
                  }`}
                >
                  {executive.tenure_risk}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
