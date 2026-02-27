'use client';

// Disable static generation due to useSearchParams()
export const dynamic = 'force-dynamic';

import { useState, useMemo, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAlertRules } from '@/hooks/useAlertRules';
import { useAlertTriggers } from '@/hooks/useAlertTriggers';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import type { AlertRule, AlertType } from '@/types/api';
import { shareContent } from '@/lib/share';
import SearchInput from '@/components/ui/SearchInput';
import EmptyState from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { SkeletonAlertRule, SkeletonAlertTrigger } from '@/components/ui/SkeletonLoader';
import Modal from '@/components/ui/Modal';
import UpgradeModal from '@/components/UpgradeModal';
import AlertRuleCreator from '@/components/AlertRuleCreator';
import { BellIcon, EditIcon, TrashIcon, PlusIcon, ShareIcon, FlagIcon, AlertTriangleIcon, FilterIcon } from '@/components/icons';

type FilterType = 'All' | 'Active' | 'Inactive';

// ─── Tier limit config ──────────────────────────────────────────────────────
const TIER_LIMITS: Record<string, number> = {
  free: 5,
  pro: 25,
  premium: Infinity,
};

function AlertsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { isAuthenticated } = useAuth();
  const { rules, isLoading, error, deleteRule, toggleRule, createRule, updateRule, isCreating, isUpdating, isDeleting } = useAlertRules();
  const { triggers, isLoading: triggersLoading, markAsRead, markAllAsRead, deleteTrigger, isMarkingAllRead } = useAlertTriggers();
  const { watchlist, isInWatchlist } = useWatchlist({ enabled: isAuthenticated });
  const { subscription } = useSubscription({ enabled: isAuthenticated });
  const { showToast } = useToast();

  // Initialize state from URL params
  const [filter, setFilter] = useState<FilterType>((searchParams.get('filter') as FilterType) || 'All');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [isClient, setIsClient] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [togglingRuleId, setTogglingRuleId] = useState<string | null>(null);
  const [showCreator, setShowCreator] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Set client flag on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Update URL when filter or search query changes
  useEffect(() => {
    if (!isClient) return;

    const params = new URLSearchParams();

    if (filter !== 'All') params.set('filter', filter);
    if (searchQuery) params.set('search', searchQuery);

    const queryString = params.toString();
    const newUrl = queryString ? `/alerts?${queryString}` : '/alerts';

    router.replace(newUrl, { scroll: false });
  }, [filter, searchQuery, isClient, router]);

  // Compute tier limit and watchlist size
  const currentTier = subscription?.tier || 'free';
  const watchlistLimit = TIER_LIMITS[currentTier] || 5;
  const watchlistCount = watchlist.length;

  // Determine if a trigger's stock is locked (not in watchlist + at tier limit)
  const isTriggerLocked = (ticker: string): boolean => {
    if (currentTier === 'premium') return false;
    if (isInWatchlist(ticker)) return false;
    return watchlistCount >= watchlistLimit;
  };

  // Count unread triggers
  const unreadCount = useMemo(() => triggers.filter(t => !t.is_read).length, [triggers]);

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

  // Handle mark all read
  const handleMarkAllRead = async () => {
    const success = await markAllAsRead();
    if (success) {
      showToast('All alerts marked as read', 'success');
    } else {
      showToast('Failed to mark alerts as read', 'error');
    }
  };

  // Handle trigger click (mark as read)
  const handleTriggerClick = async (id: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(id);
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
  const handleShareTrigger = async (trigger: { ticker: string; alert_type: string; message: string; triggered_at: string }) => {
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <div className="h-10 w-32 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
        </div>

        <div className="space-y-6">
          {/* Recent Triggers skeleton */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Triggers</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <SkeletonAlertTrigger key={i} />
              ))}
            </div>
          </div>

          {/* My Alert Rules skeleton */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">My Alert Rules</h2>
              <div className="h-8 w-48 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
            </div>

            {/* Search bar skeleton */}
            <div className="h-10 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse mb-4"></div>

            {/* Desktop Table Skeleton */}
            <div className="hidden md:block bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/5">
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Stock</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Type</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Condition</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-left">Frequency</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-center">Status</th>
                    <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonAlertRule key={i} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card Skeleton */}
            <div className="md:hidden space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-16 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                      <div className="h-6 w-12 bg-gray-100 dark:bg-white/5 rounded-full animate-pulse" />
                    </div>
                    <div className="h-3 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                    <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
                  </div>
                </div>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Alerts</h1>
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
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
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Recent Triggers
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </h2>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              disabled={isMarkingAllRead}
              className="text-sm text-vettr-accent hover:text-vettr-accent/80 transition-colors disabled:opacity-50"
            >
              {isMarkingAllRead ? 'Marking...' : 'Mark all read'}
            </button>
          )}
        </div>

        {triggersLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <SkeletonAlertTrigger key={i} />
            ))}
          </div>
        ) : triggers.length === 0 ? (
          <EmptyState
            icon={<BellIcon className="w-16 h-16 text-gray-600" />}
            title="No recent triggers"
            description="You haven't had any alert triggers recently. Create alert rules to get notified about stock events."
          />
        ) : (
          <div className="space-y-3">
            {triggers.slice(0, 10).map((trigger) => {
              const { Icon, color } = getAlertIcon(trigger.alert_type);
              const locked = isTriggerLocked(trigger.ticker);

              return (
                <div
                  key={trigger.id}
                  className={`relative bg-white/80 dark:bg-vettr-card/50 border rounded-xl p-4 transition-colors cursor-pointer ${
                    trigger.is_read
                      ? 'border-gray-200 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-vettr-card/80'
                      : 'border-vettr-accent/20 bg-vettr-accent/5 hover:bg-vettr-accent/10'
                  }`}
                  onClick={() => handleTriggerClick(trigger.id, trigger.is_read)}
                >
                  {/* Unread indicator dot */}
                  {!trigger.is_read && (
                    <div className="absolute top-4 left-2 w-2 h-2 rounded-full bg-vettr-accent" />
                  )}

                  <div className="flex items-start gap-3 pl-2">
                    <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />

                    {locked ? (
                      /* Locked/Upgrade overlay for non-watchlist stock alerts */
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-vettr-accent font-mono">{trigger.ticker}</span>
                          <span className="text-gray-400">&bull;</span>
                          <span className="text-sm text-gray-400">{trigger.alert_type}</span>
                        </div>
                        <div className="relative">
                          <p className="text-sm text-gray-500 blur-[4px] select-none">
                            {trigger.message || 'Alert details are available for watchlist stocks only.'}
                          </p>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowUpgradeModal(true);
                              }}
                              className="px-3 py-1.5 bg-vettr-accent/10 border border-vettr-accent/30 text-vettr-accent text-xs font-semibold rounded-lg hover:bg-vettr-accent/20 transition-colors"
                            >
                              Upgrade for details
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Full trigger details for watchlist stocks */
                      <Link
                        href={`/stocks/${trigger.ticker}`}
                        className="flex-1 min-w-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-vettr-accent hover:underline font-mono">{trigger.ticker}</span>
                          <span className="text-gray-400">&bull;</span>
                          <span className="text-sm text-gray-400">{trigger.alert_type}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{trigger.title || trigger.message}</p>
                        {trigger.title && trigger.message && trigger.title !== trigger.message && (
                          <p className="text-xs text-gray-500 mt-1">{trigger.message}</p>
                        )}
                      </Link>
                    )}

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {formatRelativeTime(trigger.triggered_at)}
                      </span>
                      {/* Share Button */}
                      {!locked && (
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleShareTrigger(trigger);
                          }}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                          aria-label="Share alert"
                          title="Share alert"
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      )}
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
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">My Alert Rules</h2>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {(['All', 'Active', 'Inactive'] as FilterType[]).map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === filterType
                ? 'bg-vettr-accent/10 border-vettr-accent/30 text-vettr-accent border'
                : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-white/10 border'
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
                  className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-xl p-4"
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
                        <span className="text-gray-400">&bull;</span>
                        <span className="text-sm text-gray-400">{rule.alert_type}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                        <span>Frequency: {rule.frequency}</span>
                        {rule.condition && Object.keys(rule.condition).length > 0 && (
                          <>
                            <span>&bull;</span>
                            <span>Custom conditions</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Toggle Switch */}
                      <button
                        role="switch"
                        aria-checked={rule.is_enabled}
                        aria-label={rule.is_enabled ? 'Disable alert' : 'Enable alert'}
                        onClick={() => handleToggle(rule.id, rule.is_enabled)}
                        disabled={togglingRuleId === rule.id}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-vettr-accent/30 ${rule.is_enabled ? 'bg-vettr-accent' : 'bg-gray-300 dark:bg-white/10'
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
                        className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
                        title="Edit alert rule"
                      >
                        <EditIcon className="w-5 h-5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => setDeleteConfirmId(rule.id)}
                        className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors"
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
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete this alert rule? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
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

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        currentTier={currentTier as 'free' | 'pro' | 'premium'}
        currentCount={watchlistCount}
        currentLimit={watchlistLimit === Infinity ? undefined : watchlistLimit}
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Alerts</h1>
          <div className="h-10 w-32 bg-gray-100 dark:bg-white/5 rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Triggers</h2>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-100 dark:bg-white/5 rounded-xl h-20 animate-pulse" />
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
