'use client';

import type { PortfolioHolding } from '@/types/portfolio';
import Link from 'next/link';
import { ArrowUpIcon, ArrowDownIcon } from '@/components/icons';

interface HoldingsTableProps {
  holdings: PortfolioHolding[];
  onRemove?: (holdingId: string) => void;
  isRemoving?: boolean;
  showActions?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  vettr_coverage: 'VETTR Coverage',
  large_cap_ca: 'Large Cap CA',
  global: 'Global',
  alternative: 'Alternative',
};

const CATEGORY_COLORS: Record<string, string> = {
  vettr_coverage: 'bg-vettr-accent/10 text-vettr-accent',
  large_cap_ca: 'bg-blue-500/10 text-blue-400',
  global: 'bg-purple-500/10 text-purple-400',
  alternative: 'bg-gray-500/10 text-gray-400',
};

export default function HoldingsTable({ holdings, onRemove, isRemoving, showActions = true }: HoldingsTableProps) {
  if (holdings.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <p className="text-sm">No holdings found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-white/5">
            <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left">Ticker</th>
            <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-left hidden sm:table-cell">Name</th>
            <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">Qty</th>
            <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">Avg Cost</th>
            <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right hidden sm:table-cell">Value</th>
            <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right">P&L</th>
            <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-center hidden md:table-cell">Category</th>
            {showActions && onRemove && (
              <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-2 text-right w-16" />
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
          {holdings.map((holding) => (
            <tr key={holding.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
              <td className="px-3 py-2.5">
                {holding.stock_id ? (
                  <Link href={`/stocks/${holding.ticker}`} className="font-mono text-sm font-bold text-vettr-accent hover:underline">
                    {holding.ticker}
                  </Link>
                ) : (
                  <span className="font-mono text-sm font-bold text-gray-900 dark:text-white">{holding.ticker}</span>
                )}
              </td>
              <td className="px-3 py-2.5 hidden sm:table-cell">
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px] block">{holding.name}</span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="text-sm text-gray-900 dark:text-white">{holding.quantity.toLocaleString()}</span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="text-sm text-gray-900 dark:text-white">
                  ${holding.average_cost?.toFixed(2) ?? 'N/A'}
                </span>
              </td>
              <td className="px-3 py-2.5 text-right hidden sm:table-cell">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  ${holding.current_value?.toLocaleString(undefined, { maximumFractionDigits: 0 }) ?? 'N/A'}
                </span>
              </td>
              <td className="px-3 py-2.5 text-right">
                {holding.unrealized_pnl != null ? (
                  <div className="flex items-center justify-end gap-1">
                    {holding.unrealized_pnl >= 0 ? (
                      <ArrowUpIcon className="w-3 h-3 text-vettr-accent" />
                    ) : (
                      <ArrowDownIcon className="w-3 h-3 text-red-400" />
                    )}
                    <span className={`text-sm font-medium ${holding.unrealized_pnl >= 0 ? 'text-vettr-accent' : 'text-red-400'}`}>
                      {holding.unrealized_pnl_pct?.toFixed(2) ?? '0.00'}%
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-gray-400">—</span>
                )}
              </td>
              <td className="px-3 py-2.5 text-center hidden md:table-cell">
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${CATEGORY_COLORS[holding.asset_category] ?? 'bg-gray-500/10 text-gray-400'}`}>
                  {CATEGORY_LABELS[holding.asset_category] ?? holding.asset_category}
                </span>
              </td>
              {showActions && onRemove && (
                <td className="px-3 py-2.5 text-right">
                  <button
                    onClick={() => onRemove(holding.id)}
                    disabled={isRemoving}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-50"
                  >
                    Remove
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
