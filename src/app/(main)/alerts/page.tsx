'use client';

// Disable static generation due to useSearchParams()
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlertRules } from '@/hooks/useAlertRules';
import { useToast } from '@/contexts/ToastContext';
import type { AlertRule, AlertType } from '@/types/api';
import { shareContent } from '@/lib/share';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SkeletonAlertRule, SkeletonAlertTrigger } from '@/components/ui/SkeletonLoader';
import Modal from '@/components/ui/Modal';
import AlertRuleCreator from '@/components/AlertRuleCreator';
import { BellIcon, EditIcon, TrashIcon, PlusIcon, ShareIcon, FlagIcon, AlertTriangleIcon, FilterIcon } from '@/components/icons';

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

function AlertsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { rules, isLoading, error, deleteRule, toggleRule, createRule, updateRule, isCreating, isUpdating, isDeleting } = useAlertRules();
  const { showToast } = useToast();

  // Initialize state from URL params
  const [filter, setFilter] = useState<FilterType>((searchParams.get('filter') as FilterType) || 'All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [togglingRuleId, setTogglingRuleId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update URL when filter changes
  useEffect(() => {
    if (!isClient) return;

    const params = new URLSearchParams();

    if (filter !== 'All') params.set('filter', filter);

    const queryString = params.toString();
    const newUrl = queryString ? `/alerts?${queryString}` : '/alerts';

    router.replace(newUrl, { scroll: false });
  }, [filter, isClient, router]);

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

  // Handle create alert rule
  const handleCreateRule = async (rule: Partial<AlertRule>) => {
    const success = await createRule(rule);

    if (success) {
      showToast('Alert rule created successfully', 'success');
    } else {
      showToast('Failed to create alert rule', 'error');
    }
  };

  // Handle update alert rule
  const handleUpdateRule = async (rule: Partial<AlertRule>) => {
    if (!rule.id) return;

    const success = await updateRule(rule.id, rule);

    if (success) {
      showToast('Alert rule updated successfully', 'success');
      setEditingRule(null);
    } else {
      showToast('Failed to update alert rule', 'error');
    }
  };

  // Handle edit button click
  const handleEdit = (rule: AlertRule) => {
    setEditingRule(rule);
    setShowCreator(true);
  };

  // Handle creator close
  const handleCreatorClose = () => {
    setShowCreator(false);
    setEditingRule(null);
  };

  // Handle delete from creator modal
  const handleDeleteFromCreator = async (id: string) => {
    const success = await deleteRule(id);

    if (success) {
      showToast('Alert rule deleted successfully', 'success');
    } else {
      showToast('Failed to delete alert rule', 'error');
    }
  };

  // Get alert type icon and color
  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'Red Flag':
        return { Icon: FlagIcon, color: 'text-red-400' };
      case 'Financing':
        return { Icon: BellIcon, color: 'text-yellow-400' };
      case 'Executive Changes':
        return { Icon: BellIcon, color: 'text-purple-400' };
      case 'Consolidation':
        return { Icon: BellIcon, color: 'text-blue-400' };
      case 'Drill Results':
        return { Icon: BellIcon, color: 'text-blue-400' };
      default:
        return { Icon: BellIcon, color: 'text-gray-400' };
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

  // Share alert trigger
  const handleShareTrigger = async (trigger: typeof mockRecentTriggers[0]) => {
    const shareText = `${trigger.ticker} Alert: ${trigger.alert_type}\n` +
      `${trigger.message}\n` +
      `Triggered: ${formatRelativeTime(trigger.triggered_at)}`;

    await shareContent(
      {
        title: `${trigger.ticker} - ${trigger.alert_type}`,
        text: shareText,
      },
      () => showToast('Alert copied to clipboard', 'success'),
      () => showToast('Failed to share', 'error')
    );
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse"></div>
        </div>

        <div className="space-y-6">
          {/* Recent Triggers skeleton */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Triggers</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          </div>

          {/* My Alert Rules skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">My Alert Rules</h2>
              <div className="h-8 w-48 bg-white/5 rounded-xl animate-pulse"></div>
            </div>

            {/* Search bar skeleton */}
            <div className="h-10 bg-white/5 rounded-xl animate-pulse mb-4"></div>

            {/* Rules skeleton */}
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-xl h-24 animate-pulse" />
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
        <h1 className="text-2xl font-bold text-white mb-6">Alerts</h1>
        <EmptyState
          icon={<AlertTriangleIcon className="w-16 h-16 text-yellow-400" />}
          title="Failed to load alerts"
          description="There was an error loading your alert rules. Please try again."
        />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Alerts</h1>
        {/* Create New Alert Button - Desktop */}
        <button
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-vettr-accent text-vettr-navy rounded-xl font-medium hover:bg-vettr-accent/90 transition-colors"
          onClick={() => setShowCreator(true)}
        >
          <PlusIcon className="w-5 h-5" />
          Create Alert
        </button>
      </div>

      {/* Recent Triggers Section */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Triggers</h2>
        {mockRecentTriggers.length === 0 ? (
          <EmptyState
            icon={<BellIcon className="w-16 h-16 text-gray-600" />}
            title="No recent triggers"
            description="You haven't had any alert triggers recently."
          />
        ) : (
          <div className="space-y-3">
            {mockRecentTriggers.slice(0, 5).map((trigger) => {
              const { Icon, color } = getAlertIcon(trigger.alert_type);
              return (
                <div
                  key={trigger.id}
                  className="bg-vettr-card/50 border border-white/5 rounded-xl p-4 hover:bg-vettr-card/80 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                    <Link
                      href={`/stocks/${trigger.ticker}`}
                      className="flex-1 min-w-0"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-vettr-accent hover:underline font-mono">{trigger.ticker}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{trigger.alert_type}</span>
                      </div>
                      <p className="text-sm text-gray-300">{trigger.message}</p>
                    </Link>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(trigger.triggered_at)}
                      </span>
                      {/* Share Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleShareTrigger(trigger);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                        aria-label="Share alert"
                        title="Share alert"
                      >
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My Alert Rules Section */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-4">My Alert Rules</h2>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(['All', 'Active', 'Inactive'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === filterType
                ? 'bg-vettr-accent/10 border-vettr-accent/30 text-vettr-accent border'
                : 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10 border'
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
            icon={<BellIcon className="w-16 h-16 text-gray-600" />}
            title="No alert rules yet"
            description="Create your first alert rule to get notified about important stock events."
            actionLabel="Create Alert"
            onAction={() => setShowCreator(true)}
          />
        ) : filteredRules.length === 0 ? (
          <EmptyState
            icon={<FilterIcon className="w-16 h-16 text-gray-600" />}
            title="No matching rules"
            description="No alert rules match your current filters. Try adjusting your search or filter."
          />
        ) : (
          <div className="space-y-3">
            {filteredRules.map((rule) => {
              const { Icon, color } = getAlertIcon(rule.alert_type);
              return (
                <div
                  key={rule.id}
                  className="bg-vettr-card/50 border border-white/5 rounded-xl p-4"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Link
                          href={`/stocks/${rule.ticker}`}
                          className="font-medium text-vettr-accent hover:underline font-mono"
                        >
                          {rule.ticker}
                        </Link>
                        <span className="text-gray-400">•</span>
                        <span className="text-sm text-gray-400">{rule.alert_type}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
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
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 ${rule.is_enabled ? 'bg-vettr-accent' : 'bg-white/10'
                          } ${togglingRuleId === rule.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        title={rule.is_enabled ? 'Disable alert' : 'Enable alert'}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${rule.is_enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                        />
                      </button>

                      {/* Edit Button */}
                      <button
                        onClick={() => handleEdit(rule)}
                        className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        title="Edit alert rule"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmId(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Delete alert rule"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Action Button (Mobile) */}
      <button
        className="md:hidden fixed bottom-20 right-4 w-14 h-14 bg-vettr-accent text-vettr-navy rounded-full shadow-lg flex items-center justify-center hover:bg-vettr-accent/90 transition-colors z-40"
        onClick={() => setShowCreator(true)}
        title="Create new alert"
      >
        <PlusIcon className="w-6 h-6" />
      </button>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete Alert Rule"
          size="sm"
        >
          <div className="py-4">
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this alert rule? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2.5 bg-red-500 text-white rounded-xl font-medium hover:bg-red-500/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Alert Rule Creator Modal */}
      <AlertRuleCreator
        isOpen={showCreator}
        onClose={handleCreatorClose}
        onSubmit={editingRule ? handleUpdateRule : handleCreateRule}
        isCreating={editingRule ? isUpdating : isCreating}
        editingRule={editingRule}
        onDelete={handleDeleteFromCreator}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// Wrap in Suspense to fix Next.js build error with useSearchParams
export default function AlertsPage() {
  return (
    <Suspense fallback={
      <div className="p-4 md:p-6 pb-20 md:pb-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Alerts</h1>
          <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Recent Triggers</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/5 rounded-xl h-20 animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <AlertsPageContent />
    </Suspense>
  );
}

