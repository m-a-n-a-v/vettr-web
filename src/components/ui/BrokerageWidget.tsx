'use client';

import type { Portfolio } from '@/types/portfolio';
import { LinkIcon } from '@/components/icons';

interface BrokerageWidgetProps {
  portfolio: Portfolio;
  totalValue?: number;
  holdingsCount?: number;
  onDisconnect?: (id: string) => void;
}

const CONNECTION_STATUS_COLORS: Record<string, string> = {
  connected: 'bg-green-500/10 text-green-400',
  disconnected: 'bg-red-500/10 text-red-400',
  syncing: 'bg-blue-500/10 text-blue-400',
  error: 'bg-orange-500/10 text-orange-400',
};

const CONNECTION_TYPE_ICONS: Record<string, string> = {
  flinks: 'F',
  snaptrade: 'S',
  csv: 'C',
  manual: 'M',
};

export default function BrokerageWidget({ portfolio, totalValue, holdingsCount, onDisconnect }: BrokerageWidgetProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(1)}K`;
    return `$${value.toFixed(2)}`;
  };

  return (
    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-vettr-accent/10 flex items-center justify-center text-vettr-accent font-bold text-sm flex-shrink-0">
          {CONNECTION_TYPE_ICONS[portfolio.connectionType] ?? <LinkIcon className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {portfolio.institutionName || 'Portfolio'}
            </span>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${CONNECTION_STATUS_COLORS[portfolio.connectionStatus] ?? 'bg-gray-500/10 text-gray-400'}`}>
              {portfolio.connectionStatus}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            {totalValue != null && <span>{formatCurrency(totalValue)}</span>}
            {holdingsCount != null && <span>{holdingsCount} holdings</span>}
            {portfolio.lastSyncedAt && (
              <span>Synced {new Date(portfolio.lastSyncedAt).toLocaleDateString()}</span>
            )}
          </div>
        </div>
        {onDisconnect && (
          <button
            onClick={() => onDisconnect(portfolio.id)}
            className="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1"
          >
            Disconnect
          </button>
        )}
      </div>
    </div>
  );
}
