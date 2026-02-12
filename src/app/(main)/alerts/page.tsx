'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAlertRules } from '@/hooks/useAlertRules';
import { useToast } from '@/contexts/ToastContext';
import type { AlertRule, AlertType } from '@/types/api';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SkeletonCard } from '@/components/ui/SkeletonLoader';
import Modal from '@/components/ui/Modal';

// Mock recent triggers - in production this would come from an API endpoint
// The backend doesn't have a triggers endpoint yet, so we'll show placeholder data
const mockRecentTriggers = [
  {
    id: '1',
    ticker: 'AAPL',
    alert_type: 'Red Flag' as AlertType,
    message: 'High severity red flag detected',
    triggered_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
  {
    id: '2',
    ticker: 'TSLA',
    alert_type: 'Financing' as AlertType,
    message: 'New financing activity detected',
    triggered_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
  },
  {
    id: '3',
    ticker: 'MSFT',
    alert_type: 'Executive Changes' as AlertType,
    message: 'Executive team changes detected',
    triggered_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
];

type FilterType = 'All' | 'Active' | 'Inactive';

export default function AlertsPage() {
  const { rules, isLoading, error, deleteRule, toggleRule } = useAlertRules();
  const { showToast } = useToast();
  const [filter, setFilter] = useState<FilterType>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [togglingRuleId, setTogglingRuleId] = useState<string | null>(null);

  // Filter rules based on active/inactive filter and search query
  const filteredRules = useMemo(() => {
    let filtered = rules;

    // Filter by active/inactive status
    if (filter === 'Active') {
      filtered = filtered.filter((rule) => rule.is_enabled);
    } else if (filter === 'Inactive') {
      filtered = filtered.filter((rule) => !rule.is_enabled);
    }

    // Filter by search query (ticker or alert type)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (rule) =>
          rule.ticker.toLowerCase().includes(query) ||
          rule.alert_type.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [rules, filter, searchQuery]);

  // Handle toggle enable/disable
  const handleToggle = async (id: string, currentEnabled: boolean) => {
    setTogglingRuleId(id);
    const success = await toggleRule(id, !currentEnabled);
    setTogglingRuleId(null);

    if (success) {
      showToast(
        `Alert rule ${!currentEnabled ? 'enabled' : 'disabled'} successfully`,
        'success'
      );
    } else {
      showToast(`Failed to ${!currentEnabled ? 'enable' : 'disable'} alert rule`, 'error');
    }
  };

  // Handle delete confirmation
  const handleDelete = async (id: string) => {
    const success = await deleteRule(id);
    setDeleteConfirmId(null);

    if (success) {
      showToast('Alert rule deleted successfully', 'success');
    } else {
      showToast('Failed to delete alert rule', 'error');
    }
  };

  // Get alert type icon
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'Red Flag':
        return '🚩';
      case 'Financing':
        return '💰';
      case 'Executive Changes':
        return '👔';
      case 'Consolidation':
        return '📊';
      case 'Drill Results':
        return '⛏️';
      default:
        return '🔔';
    }
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const now = Date.now();
    const then = new Date(timestamp).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold mb-6">Alerts</h1>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Recent Triggers</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold mb-4">My Alert Rules</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <h1 className="text-2xl font-bold mb-6">Alerts</h1>
        <EmptyState
          icon="⚠️"
          title="Failed to load alerts"
          message="There was an error loading your alert rules. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Alerts</h1>
        {/* Create New Alert Button - Desktop */}
        <button
          className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent text-primary rounded-lg font-medium hover:bg-accentDim transition-colors"
          onClick={() => {
            // This will be wired up in WEB-023
            showToast('Alert creator coming soon!', 'info');
          }}
        >
          <span className="text-xl">+</span>
          Create Alert
        </button>
      </div>

      {/* Recent Triggers Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Recent Triggers</h2>
        {mockRecentTriggers.length === 0 ? (
          <EmptyState
            icon="🔕"
            title="No recent triggers"
            message="You haven't had any alert triggers recently."
          />
        ) : (
          <div className="space-y-3">
            {mockRecentTriggers.slice(0, 5).map((trigger) => (
              <Link
                key={trigger.id}
                href={`/stocks/${trigger.ticker}`}
                className="block bg-primaryLight border border-border rounded-lg p-4 hover:bg-surfaceLight transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getAlertIcon(trigger.alert_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-accent">{trigger.ticker}</span>
                      <span className="text-textSecondary">•</span>
                      <span className="text-sm text-textSecondary">{trigger.alert_type}</span>
                    </div>
                    <p className="text-sm text-textSecondary">{trigger.message}</p>
                  </div>
                  <span className="text-xs text-textMuted flex-shrink-0">
                    {formatRelativeTime(trigger.triggered_at)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* My Alert Rules Section */}
      <section>
        <h2 className="text-lg font-semibold mb-4">My Alert Rules</h2>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(['All', 'Active', 'Inactive'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === filterType
                  ? 'bg-accent text-primary'
                  : 'bg-primaryLight text-textSecondary hover:bg-surfaceLight'
              }`}
            >
              {filterType}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search by ticker or alert type..."
          />
        </div>

        {/* Rules List */}
        {rules.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No alert rules yet"
            message="Create your first alert rule to get notified about important stock events."
            actionLabel="Create Alert"
            onAction={() => {
              // This will be wired up in WEB-023
              showToast('Alert creator coming soon!', 'info');
            }}
          />
        ) : filteredRules.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No matching rules"
            message="No alert rules match your current filters. Try adjusting your search or filter."
          />
        ) : (
          <div className="space-y-3">
            {filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="bg-primaryLight border border-border rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">
                    {getAlertIcon(rule.alert_type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/stocks/${rule.ticker}`}
                        className="font-medium text-accent hover:underline"
                      >
                        {rule.ticker}
                      </Link>
                      <span className="text-textSecondary">•</span>
                      <span className="text-sm text-textSecondary">{rule.alert_type}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-textMuted">
                      <span>Frequency: {rule.frequency}</span>
                      {rule.condition && Object.keys(rule.condition).length > 0 && (
                        <>
                          <span>•</span>
                          <span>Custom conditions</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Toggle Switch */}
                    <button
                      onClick={() => handleToggle(rule.id, rule.is_enabled)}
                      disabled={togglingRuleId === rule.id}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary ${
                        rule.is_enabled ? 'bg-accent' : 'bg-border'
                      } ${togglingRuleId === rule.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                      title={rule.is_enabled ? 'Disable alert' : 'Enable alert'}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          rule.is_enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteConfirmId(rule.id)}
                      className="p-2 text-textMuted hover:text-error transition-colors"
                      title="Delete alert rule"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Floating Action Button (Mobile) */}
      <button
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-accent text-primary rounded-full shadow-lg flex items-center justify-center text-2xl font-bold hover:bg-accentDim transition-colors z-40"
        onClick={() => {
          // This will be wired up in WEB-023
          showToast('Alert creator coming soon!', 'info');
        }}
        title="Create new alert"
      >
        +
      </button>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Alert Rule"
          size="sm"
        >
          <div className="p-6">
            <p className="text-textSecondary mb-6">
              Are you sure you want to delete this alert rule? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-primaryLight text-textPrimary rounded-lg font-medium hover:bg-surfaceLight transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-error text-white rounded-lg font-medium hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
