'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStock } from '@/hooks/useStock';
import { useVetrScore } from '@/hooks/useVetrScore';
import { useFilings } from '@/hooks/useFilings';
import { useExecutives } from '@/hooks/useExecutives';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useRedFlags } from '@/hooks/useRedFlags';
import { useRedFlagHistory } from '@/hooks/useRedFlagHistory';
import { useVetrScoreHistory } from '@/hooks/useVetrScoreHistory';
import { useVetrScoreComparison } from '@/hooks/useVetrScoreComparison';
import { useVetrScoreTrend } from '@/hooks/useVetrScoreTrend';
import { useToast } from '@/contexts/ToastContext';
import { Executive, RedFlag } from '@/types/api';
import { api } from '@/lib/api-client';
import VetrScoreBadge from '@/components/ui/VetrScoreBadge';
import SectorChip from '@/components/ui/SectorChip';
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator';
import FilingTypeIcon from '@/components/ui/FilingTypeIcon';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';
import SelectDropdown from '@/components/ui/SelectDropdown';
import ExecutiveTable from '@/components/ui/ExecutiveTable';
import ExecutiveDetail from '@/components/ExecutiveDetail';
import VetrScoreDetail from '@/components/VetrScoreDetail';
import VetrScoreComparison from '@/components/VetrScoreComparison';
import VetrScoreTrend from '@/components/VetrScoreTrend';
import { SkeletonStockDetailHeader, SkeletonVetrScoreSection, SkeletonChart, SkeletonFilingRow, SkeletonMetricCard } from '@/components/ui/SkeletonLoader';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { StarIcon, StarFilledIcon, ShareIcon, MoreHorizontalIcon, ArrowUpIcon, ArrowDownIcon, UsersIcon, FlagIcon, ShieldCheckIcon, BarChartIcon, DocumentIcon } from '@/components/icons';
import { chartTheme, getTooltipStyle } from '@/lib/chart-theme';

type Tab = 'overview' | 'pedigree' | 'red-flags';

export default function StockDetailPage() {
  const params = useParams();
  const ticker = params.ticker as string;
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { showToast } = useToast();

  // Pedigree tab state
  const [executiveSearch, setExecutiveSearch] = useState('');
  const [executiveTitleFilter, setExecutiveTitleFilter] = useState('all');
  const [executiveSortBy, setExecutiveSortBy] = useState<'title' | 'tenure' | 'experience' | 'specialization'>('title');
  const [selectedExecutive, setSelectedExecutive] = useState<Executive | null>(null);

  // Red Flags tab state
  const [selectedFlag, setSelectedFlag] = useState<RedFlag | null>(null);
  const [isAcknowledgingAll, setIsAcknowledgingAll] = useState(false);
  const [acknowledgingFlagId, setAcknowledgingFlagId] = useState<string | null>(null);

  // Score detail modal state
  const [showScoreDetail, setShowScoreDetail] = useState(false);

  // Score history chart state
  const [scoreHistoryPeriod, setScoreHistoryPeriod] = useState('6M');

  const { stock, isLoading: stockLoading, error: stockError } = useStock(ticker);
  const { score, isLoading: scoreLoading } = useVetrScore({ ticker });
  const { filings, isLoading: filingsLoading } = useFilings({ ticker, limit: 5 });
  const { executives, isLoading: executivesLoading } = useExecutives({ ticker, search: executiveSearch });
  const { watchlist, isAdding, isRemoving, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const { redFlags, isLoading: redFlagsLoading, mutate: mutateRedFlags } = useRedFlags({ ticker });
  const { history: flagHistory, isLoading: flagHistoryLoading } = useRedFlagHistory({ ticker, limit: 10 });
  const { history: scoreHistory, isLoading: scoreHistoryLoading } = useVetrScoreHistory({ ticker, period: scoreHistoryPeriod });
  const { comparison, isLoading: comparisonLoading } = useVetrScoreComparison({ ticker });
  const { trend, isLoading: trendLoading } = useVetrScoreTrend({ ticker });

  const isInWatchlist = watchlist.some(item => item.ticker === ticker);
  const isTogglingFavorite = isAdding || isRemoving;

  // Filter and sort executives
  const filteredAndSortedExecutives = useMemo(() => {
    let result = [...executives];

    // Apply title filter
    if (executiveTitleFilter !== 'all') {
      result = result.filter(exec =>
        exec.title.toLowerCase().includes(executiveTitleFilter.toLowerCase())
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (executiveSortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'tenure':
          return b.years_at_company - a.years_at_company;
        case 'experience':
          return b.total_experience_years - a.total_experience_years;
        case 'specialization':
          return a.specialization.localeCompare(b.specialization);
        default:
          return 0;
      }
    });

    return result;
  }, [executives, executiveTitleFilter, executiveSortBy]);

  // Extract unique titles for filter options
  const uniqueTitles = useMemo(() => {
    const titles = new Set(executives.map(exec => exec.title));
    return Array.from(titles).sort();
  }, [executives]);

  const handleFavoriteToggle = async () => {
    try {
      if (isInWatchlist) {
        await removeFromWatchlist(ticker);
        showToast('Removed from watchlist', 'success');
      } else {
        await addToWatchlist(ticker);
        showToast('Added to watchlist', 'success');
      }
    } catch (error) {
      showToast('Failed to update watchlist', 'error');
    }
  };

  const handleShare = async () => {
    if (!stock) return;

    const shareText = `${stock.ticker} - ${stock.company_name}\nVETTR Score: ${stock.vetr_score}\nPrice: $${stock.current_price?.toFixed(2)}\nSector: ${stock.sector}`;

    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (error) {
        // User cancelled share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareText);
        showToast('Copied to clipboard', 'success');
      } catch (error) {
        showToast('Failed to copy', 'error');
      }
    }
  };

  const handleAcknowledgeFlag = async (flagId: string) => {
    setAcknowledgingFlagId(flagId);

    // Store current data for rollback
    const previousRedFlags = redFlags;

    try {
      // Optimistically update the flag as acknowledged
      if (redFlags) {
        mutateRedFlags(
          {
            ...redFlags,
            detected_flags: redFlags.detected_flags.map(flag =>
              flag.id === flagId ? { ...flag, is_acknowledged: true } : flag
            ),
          },
          false // Don't revalidate yet
        );
      }

      // Make the API call
      const response = await api.post(`/red-flags/${flagId}/acknowledge`, {});
      if (!response.success) {
        throw new Error('Failed to acknowledge flag');
      }

      showToast('Flag acknowledged', 'success');
      // Revalidate to get fresh data
      await mutateRedFlags();
    } catch (error) {
      showToast('Failed to acknowledge flag', 'error');

      // Rollback on error
      if (previousRedFlags) {
        mutateRedFlags(previousRedFlags, false);
      }
    } finally {
      setAcknowledgingFlagId(null);
    }
  };

  const handleAcknowledgeAll = async () => {
    setIsAcknowledgingAll(true);

    // Store current data for rollback
    const previousRedFlags = redFlags;

    try {
      // Optimistically update all flags as acknowledged
      if (redFlags) {
        mutateRedFlags(
          {
            ...redFlags,
            detected_flags: redFlags.detected_flags.map(flag => ({
              ...flag,
              is_acknowledged: true,
            })),
          },
          false // Don't revalidate yet
        );
      }

      // Make the API call
      const response = await api.post(`/stocks/${ticker}/red-flags/acknowledge-all`, {});
      if (!response.success) {
        throw new Error('Failed to acknowledge all flags');
      }

      showToast('All flags acknowledged', 'success');
      // Revalidate to get fresh data
      await mutateRedFlags();
    } catch (error) {
      showToast('Failed to acknowledge all flags', 'error');

      // Rollback on error
      if (previousRedFlags) {
        mutateRedFlags(previousRedFlags, false);
      }
    } finally {
      setIsAcknowledgingAll(false);
    }
  };

  if (stockLoading) {
    return (
      <div className="min-h-screen bg-vettr-navy">
        <div className="max-w-6xl mx-auto px-6 pt-6 pb-20 md:pb-6">
          {/* Stock Detail Header Skeleton */}
          <SkeletonStockDetailHeader className="mb-6" />

          {/* Tab navigation skeleton */}
          <div className="flex gap-6 border-b border-white/5 mb-6 sticky top-16 bg-vettr-navy/80 backdrop-blur-sm z-30 -mx-6 px-6 py-3">
            <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-white/5 rounded animate-pulse"></div>
          </div>

          {/* Content skeleton - Overview Tab */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column - VETTR Score */}
            <div className="lg:col-span-1">
              <SkeletonVetrScoreSection />
            </div>

            {/* Right column - Charts and Data */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Metrics */}
              <div>
                <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-4"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <SkeletonMetricCard />
                  <SkeletonMetricCard />
                  <SkeletonMetricCard />
                  <SkeletonMetricCard />
                </div>
              </div>

              {/* Chart */}
              <SkeletonChart />

              {/* Recent Filings */}
              <div className="bg-vettr-card/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5">
                  <div className="h-6 w-32 bg-white/5 rounded animate-pulse"></div>
                </div>
                <table className="w-full">
                  <tbody>
                    <SkeletonFilingRow />
                    <SkeletonFilingRow />
                    <SkeletonFilingRow />
                    <SkeletonFilingRow />
                    <SkeletonFilingRow />
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (stockError || !stock) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-vettr-navy">
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-20 md:pb-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Stocks', href: '/stocks' },
            { label: ticker }
          ]}
        />

        {/* Stock Header */}
        <div className="mb-6 mt-6">
          <div className="flex items-start justify-between mb-4">
            {/* Title and badges */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-white mb-3">{stock.company_name}</h1>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-vettr-accent/10 text-vettr-accent rounded-lg px-2 py-0.5 text-sm font-mono font-semibold">
                  {stock.ticker}
                </span>
                {stock.exchange && (
                  <span className="bg-white/5 text-gray-400 rounded-lg px-2 py-0.5 text-xs">
                    {stock.exchange}
                  </span>
                )}
                <SectorChip sector={stock.sector} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 bg-white/5 rounded-xl p-2">
              <button
                onClick={handleFavoriteToggle}
                disabled={isTogglingFavorite}
                className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
                aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {isTogglingFavorite ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : isInWatchlist ? (
                  <StarFilledIcon className="w-5 h-5 text-yellow-400" />
                ) : (
                  <StarIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Share stock"
              >
                <ShareIcon className="w-5 h-5" />
              </button>
              <button
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="More options"
              >
                <MoreHorizontalIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Price Display */}
          <div className="flex items-end gap-4">
            <span className="text-4xl font-bold text-white">
              ${stock.current_price?.toFixed(2) || 'N/A'}
            </span>
            {stock.price_change_percent !== null && stock.price_change_percent !== undefined && (
              <div className="flex items-center gap-1 mb-2">
                {stock.price_change_percent >= 0 ? (
                  <>
                    <ArrowUpIcon className="w-4 h-4 text-vettr-accent" />
                    <span className="text-lg font-medium text-vettr-accent">
                      +{stock.price_change_percent.toFixed(2)}%
                    </span>
                  </>
                ) : (
                  <>
                    <ArrowDownIcon className="w-4 h-4 text-red-400" />
                    <span className="text-lg font-medium text-red-400">
                      {stock.price_change_percent.toFixed(2)}%
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tab navigation */}
        <div className="sticky top-16 z-30 bg-vettr-navy dark:bg-vettr-navy bg-lightBg py-3 -mx-6 px-6 flex gap-6 border-b border-white/5 mb-6" role="tablist" aria-label="Stock information tabs">
          <button
            role="tab"
            aria-selected={activeTab === 'overview'}
            aria-controls="overview-panel"
            id="overview-tab"
            onClick={() => setActiveTab('overview')}
            className={`px-1 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'text-white border-vettr-accent'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'pedigree'}
            aria-controls="pedigree-panel"
            id="pedigree-tab"
            onClick={() => setActiveTab('pedigree')}
            className={`px-1 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'pedigree'
                ? 'text-white border-vettr-accent'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Pedigree
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'red-flags'}
            aria-controls="red-flags-panel"
            id="red-flags-tab"
            onClick={() => setActiveTab('red-flags')}
            className={`px-1 py-3 font-medium text-sm transition-colors border-b-2 ${
              activeTab === 'red-flags'
                ? 'text-white border-vettr-accent'
                : 'text-gray-500 border-transparent hover:text-gray-300'
            }`}
          >
            Red Flags
          </button>
        </div>

        {/* Tab content */}
        <div>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              role="tabpanel"
              id="overview-panel"
              aria-labelledby="overview-tab"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="space-y-6"
            >
            {/* VETTR Score section */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">VETTR Score</h2>
                {trend && (
                  <div className="flex items-center gap-1">
                    {trend.direction === 'Improving' ? (
                      <>
                        <ArrowUpIcon className="w-4 h-4 text-vettr-accent" />
                        <span className="text-sm font-medium text-vettr-accent">Improving</span>
                      </>
                    ) : trend.direction === 'Declining' ? (
                      <>
                        <ArrowDownIcon className="w-4 h-4 text-red-400" />
                        <span className="text-sm font-medium text-red-400">Declining</span>
                      </>
                    ) : (
                      <span className="text-sm font-medium text-gray-400">Stable</span>
                    )}
                  </div>
                )}
              </div>
              {scoreLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" color="white" />
                </div>
              ) : score ? (
                <button
                  onClick={() => setShowScoreDetail(true)}
                  className="w-full flex flex-col items-center justify-center cursor-pointer hover:bg-white/[0.03] rounded-xl p-4 transition-colors group"
                  aria-label="View score details"
                >
                  <VetrScoreBadge score={score.overall_score} size="lg" animate={true} showLabel={false} />
                  <p className="text-xs text-gray-500 mt-2">VETTR Score</p>

                  {/* Component breakdown bars */}
                  {score.components && (
                    <div className="w-full max-w-md mt-6 space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Pedigree</span>
                          <span className="text-xs font-medium text-white">{score.components.pedigree}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div
                            className="bg-blue-400 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${score.components.pedigree}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Filing Velocity</span>
                          <span className="text-xs font-medium text-white">{score.components.filing_velocity}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div
                            className="bg-purple-400 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${score.components.filing_velocity}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Red Flag</span>
                          <span className="text-xs font-medium text-white">{score.components.red_flag}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div
                            className="bg-red-400 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${score.components.red_flag}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Growth</span>
                          <span className="text-xs font-medium text-white">{score.components.growth}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div
                            className="bg-vettr-accent h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${score.components.growth}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-400">Governance</span>
                          <span className="text-xs font-medium text-white">{score.components.governance}</span>
                        </div>
                        <div className="w-full bg-white/5 rounded-full h-1.5">
                          <div
                            className="bg-yellow-400 h-1.5 rounded-full transition-all duration-1000"
                            style={{ width: `${score.components.governance}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-gray-500 text-xs mt-4 group-hover:text-gray-300 transition-colors">
                    Click to view detailed breakdown
                  </p>
                </button>
              ) : (
                <p className="text-gray-400 text-center py-4">Score not available</p>
              )}
            </div>


            {/* Score History Chart */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">Score History</h2>
                {/* Time Range Pills */}
                <div className="flex gap-2">
                  {['1M', '3M', '6M', '12M', '24M'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setScoreHistoryPeriod(period)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                        scoreHistoryPeriod === period
                          ? 'bg-vettr-accent/10 text-vettr-accent'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {scoreHistoryLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner size="lg" color="white" />
                </div>
              ) : scoreHistory.length > 0 && scoreHistory[0]?.history && scoreHistory[0].history.length >= 2 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={scoreHistory[0].history}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray={chartTheme.grid.strokeDasharray}
                        stroke={chartTheme.grid.stroke}
                      />
                      <XAxis
                        dataKey="date"
                        stroke={chartTheme.axis.stroke}
                        tick={chartTheme.axis.tick}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                      />
                      <YAxis
                        stroke={chartTheme.axis.stroke}
                        tick={chartTheme.axis.tick}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={getTooltipStyle()}
                        labelStyle={{ color: chartTheme.text.secondary }}
                        formatter={(value: number | undefined) => [value?.toFixed(1) ?? 'N/A', 'Score']}
                        labelFormatter={(label) => {
                          const date = new Date(label);
                          return date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          });
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke={chartTheme.colors.primary}
                        strokeWidth={2}
                        dot={{ fill: chartTheme.colors.primary, r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <EmptyState
                    icon={<BarChartIcon className="w-16 h-16 text-gray-600" />}
                    title="Not enough data"
                    description="Score history will be displayed once sufficient data is available."
                  />
                </div>
              )}
            </div>

            {/* Key Metrics grid */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Market Cap</p>
                  <p className="text-white font-semibold">
                    {stock.market_cap
                      ? `$${(stock.market_cap / 1000000000).toFixed(1)}B`
                      : 'N/A'}
                  </p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Exchange</p>
                  <p className="text-white font-semibold">{stock.exchange || 'N/A'}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Sector</p>
                  <p className="text-white font-semibold">{stock.sector}</p>
                </div>
                <div className="bg-white/[0.03] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recent Filings</p>
                  <p className="text-white font-semibold">
                    {filings?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Peer Comparison */}
            <VetrScoreComparison
              comparison={comparison}
              isLoading={comparisonLoading}
              currentTicker={ticker}
            />

            {/* Recent Filings */}
            <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Recent Filings</h2>
              {filingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-20 bg-white/5 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filings && filings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/5">
                        <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-3 text-left">Type</th>
                        <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-3 text-left">Title</th>
                        <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-3 text-left">Date</th>
                        <th className="text-xs text-gray-500 uppercase tracking-wider font-medium px-3 py-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filings.map(filing => (
                        <tr
                          key={filing.id}
                          onClick={() => window.location.href = `/filings/${filing.id}`}
                          className="border-b border-white/5 hover:bg-white/[0.03] transition-colors cursor-pointer"
                        >
                          <td className="px-3 py-3">
                            <FilingTypeIcon type={filing.type} />
                          </td>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2">
                              {!filing.is_read && (
                                <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                              )}
                              <span className="text-sm text-white truncate max-w-xs">{filing.title}</span>
                              {filing.is_material && (
                                <span className="px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-medium flex-shrink-0">
                                  Material
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-400 whitespace-nowrap">
                            {new Date(filing.date_filed).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-3 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              filing.is_read
                                ? 'bg-white/5 text-gray-500'
                                : 'bg-blue-400/10 text-blue-400'
                            }`}>
                              {filing.is_read ? 'Read' : 'Unread'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState
                  icon={<DocumentIcon className="w-16 h-16 text-gray-600" />}
                  title="No filings found"
                  description="This stock doesn't have any recent filings."
                />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'pedigree' && (
          <motion.div
            key="pedigree"
            role="tabpanel"
            id="pedigree-panel"
            aria-labelledby="pedigree-tab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {/* Search and Filters */}
            <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <SearchInput
                  value={executiveSearch}
                  onChange={setExecutiveSearch}
                  placeholder="Search executives by name..."
                />
                <SelectDropdown
                  label="Filter by Title"
                  value={executiveTitleFilter}
                  onChange={setExecutiveTitleFilter}
                  options={[
                    { value: 'all', label: 'All Titles' },
                    ...uniqueTitles.map(title => ({ value: title, label: title })),
                  ]}
                />
                <SelectDropdown
                  label="Sort By"
                  value={executiveSortBy}
                  onChange={(val) => setExecutiveSortBy(val as typeof executiveSortBy)}
                  options={[
                    { value: 'title', label: 'Title' },
                    { value: 'tenure', label: 'Tenure (Years)' },
                    { value: 'experience', label: 'Total Experience' },
                    { value: 'specialization', label: 'Specialization' },
                  ]}
                />
              </div>
            </div>

            {/* Executives List - Desktop: Table, Mobile: Cards */}
            <div>
              {executivesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-48 bg-vettr-card/50 border border-white/5 rounded-2xl animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredAndSortedExecutives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAndSortedExecutives.map(executive => (
                    <div
                      key={executive.id}
                      onClick={() => setSelectedExecutive(executive)}
                      className="bg-vettr-card/50 border border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all duration-300 cursor-pointer"
                    >
                      {/* Header with initials avatar */}
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center flex-shrink-0">
                          <span className="text-vettr-accent font-semibold text-lg">
                            {executive.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white mb-1 truncate">
                            {executive.name}
                          </h3>
                          <p className="text-sm text-gray-400 line-clamp-2">{executive.title}</p>
                        </div>
                      </div>

                      {/* Metrics row */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tenure</p>
                          <p className="text-sm text-white font-medium">
                            {executive.years_at_company} {executive.years_at_company === 1 ? 'year' : 'years'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Experience</p>
                          <p className="text-sm text-white font-medium">
                            {executive.total_experience_years} {executive.total_experience_years === 1 ? 'year' : 'years'}
                          </p>
                        </div>
                      </div>

                      {/* Specialization badge */}
                      {executive.specialization && (
                        <div className="mb-3">
                          <span className="inline-block bg-white/5 text-gray-400 rounded-full px-2 py-0.5 text-xs">
                            {executive.specialization}
                          </span>
                        </div>
                      )}

                      {/* Tenure risk indicator */}
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            executive.tenure_risk === 'Stable'
                              ? 'bg-vettr-accent'
                              : executive.tenure_risk === 'Watch'
                              ? 'bg-yellow-400'
                              : 'bg-red-400'
                          }`}
                        />
                        <span
                          className={`text-xs font-medium ${
                            executive.tenure_risk === 'Stable'
                              ? 'text-vettr-accent'
                              : executive.tenure_risk === 'Watch'
                              ? 'text-yellow-400'
                              : 'text-red-400'
                          }`}
                        >
                          {executive.tenure_risk}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<UsersIcon className="w-16 h-16 text-gray-600" />}
                  title="No executives found"
                  description={
                    executiveSearch || executiveTitleFilter !== 'all'
                      ? 'No executives match your search criteria. Try adjusting your filters.'
                      : 'This stock doesn\'t have any executive information available.'
                  }
                />
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'red-flags' && (
          <motion.div
            role="tabpanel"
            id="red-flags-panel"
            aria-labelledby="red-flags-tab"
            key="red-flags"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            {redFlagsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-48 bg-vettr-card/50 border border-white/5 rounded-2xl animate-pulse"
                  />
                ))}
              </div>
            ) : redFlags ? (
              <>
                {/* Overall Red Flag Score */}
                <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-white">Red Flag Score</h2>
                    {redFlags.detected_flags.some(flag => !flag.is_acknowledged) && (
                      <button
                        onClick={handleAcknowledgeAll}
                        disabled={isAcknowledgingAll}
                        className="px-4 py-2 bg-white/5 border border-white/10 text-white rounded-xl hover:bg-white/10 transition-colors disabled:opacity-50"
                      >
                        {isAcknowledgingAll ? 'Acknowledging...' : 'Acknowledge All'}
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col items-center mb-8">
                    {/* Circular progress indicator */}
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="rgba(255,255,255,0.1)"
                          strokeWidth="12"
                        />
                        {/* Progress circle - higher score = more red (inverted from VETTR score) */}
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke={
                            redFlags.overall_score >= 80
                              ? '#F87171'
                              : redFlags.overall_score >= 60
                              ? '#FB923C'
                              : redFlags.overall_score >= 40
                              ? '#FBBF24'
                              : '#00E676'
                          }
                          strokeWidth="12"
                          strokeDasharray={`${(redFlags.overall_score / 100) * 439.8} 439.8`}
                          strokeLinecap="round"
                          className="transition-all duration-1000"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-white tabular-nums">
                          {redFlags.overall_score}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">Red Flag Score</p>
                  </div>

                  {/* Flag Breakdown Progress Bars */}
                  <div className="space-y-3">
                    {/* Consolidation Velocity */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm text-gray-400">Consolidation Velocity</span>
                          <span className="text-xs text-gray-600 ml-2">(30% weight)</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {redFlags.breakdown.consolidation_velocity}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-red-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${redFlags.breakdown.consolidation_velocity}%` }}
                        />
                      </div>
                    </div>

                    {/* Financing Velocity */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm text-gray-400">Financing Velocity</span>
                          <span className="text-xs text-gray-600 ml-2">(25% weight)</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {redFlags.breakdown.financing_velocity}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-orange-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${redFlags.breakdown.financing_velocity}%` }}
                        />
                      </div>
                    </div>

                    {/* Executive Churn */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm text-gray-400">Executive Churn</span>
                          <span className="text-xs text-gray-600 ml-2">(20% weight)</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {redFlags.breakdown.executive_churn}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${redFlags.breakdown.executive_churn}%` }}
                        />
                      </div>
                    </div>

                    {/* Disclosure Gaps */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm text-gray-400">Disclosure Gaps</span>
                          <span className="text-xs text-gray-600 ml-2">(15% weight)</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {redFlags.breakdown.disclosure_gaps}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${redFlags.breakdown.disclosure_gaps}%` }}
                        />
                      </div>
                    </div>

                    {/* Debt Trend */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <span className="text-sm text-gray-400">Debt Trend</span>
                          <span className="text-xs text-gray-600 ml-2">(10% weight)</span>
                        </div>
                        <span className="text-sm font-medium text-white">
                          {redFlags.breakdown.debt_trend}
                        </span>
                      </div>
                      <div className="w-full bg-white/5 rounded-full h-2">
                        <div
                          className="bg-gray-400 h-2 rounded-full transition-all duration-1000"
                          style={{ width: `${redFlags.breakdown.debt_trend}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detected Flags List */}
                <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Detected Flags</h2>
                  {redFlags.detected_flags.length > 0 ? (
                    <div className="space-y-3">
                      {redFlags.detected_flags.map(flag => (
                        <div
                          key={flag.id}
                          className={`p-4 rounded-xl border transition-all ${
                            flag.is_acknowledged
                              ? 'bg-white/[0.015] border-white/5 opacity-60'
                              : 'bg-white/[0.03] border-white/5 hover:border-white/10 cursor-pointer'
                          }`}
                          onClick={() => !flag.is_acknowledged && setSelectedFlag(flag)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Flag icon with severity color */}
                              <FlagIcon
                                className={`w-5 h-5 flex-shrink-0 ${
                                  flag.severity === 'Critical'
                                    ? 'text-red-400'
                                    : flag.severity === 'High'
                                    ? 'text-orange-400'
                                    : flag.severity === 'Moderate'
                                    ? 'text-yellow-400'
                                    : 'text-gray-400'
                                }`}
                              />

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                  <h3 className={`font-medium ${flag.is_acknowledged ? 'text-gray-500 line-through' : 'text-white'}`}>
                                    {flag.name}
                                  </h3>
                                  {/* Severity Badge */}
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                                      flag.severity === 'Critical'
                                        ? 'bg-red-500/10 text-red-400'
                                        : flag.severity === 'High'
                                        ? 'bg-orange-500/10 text-orange-400'
                                        : flag.severity === 'Moderate'
                                        ? 'bg-yellow-500/10 text-yellow-400'
                                        : 'bg-gray-500/10 text-gray-400'
                                    }`}
                                  >
                                    {flag.severity}
                                  </span>
                                  {flag.is_acknowledged && (
                                    <span className="text-gray-500 text-xs flex items-center gap-1">
                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path
                                          fillRule="evenodd"
                                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                      Acknowledged
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm mb-2 ${flag.is_acknowledged ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {flag.explanation}
                                </p>
                                <p className="text-xs text-gray-600">
                                  Detected: {new Date(flag.detected_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })}
                                </p>
                              </div>
                            </div>

                            {/* Acknowledge Button */}
                            {!flag.is_acknowledged && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAcknowledgeFlag(flag.id);
                                }}
                                disabled={acknowledgingFlagId === flag.id}
                                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-400 hover:text-vettr-accent transition-colors disabled:opacity-50"
                              >
                                {acknowledgingFlagId === flag.id ? 'Acknowledging...' : 'Acknowledge'}
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={<ShieldCheckIcon className="w-16 h-16 text-vettr-accent/80" />}
                      title="No red flags detected"
                      description="This stock currently has no red flags. Great news!"
                      variant="positive"
                    />
                  )}
                </div>

                {/* Flag History Timeline */}
                <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
                  <h2 className="text-lg font-semibold text-white mb-4">Flag History</h2>
                  {flagHistoryLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="h-16 bg-white/5 rounded-xl animate-pulse"
                        />
                      ))}
                    </div>
                  ) : flagHistory && flagHistory.length > 0 ? (
                    <div className="relative pl-6">
                      {/* Vertical timeline line */}
                      <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-white/10" />

                      <div className="space-y-6">
                        {flagHistory.flatMap((item) => item.history).map((entry, index) => (
                          <div
                            key={entry.id}
                            className="relative"
                          >
                            {/* Timeline dot */}
                            <div
                              className={`absolute -left-[1.125rem] top-1.5 w-3 h-3 rounded-full border-2 ${
                                entry.severity === 'Critical' || entry.severity === 'High'
                                  ? 'bg-red-400 border-red-400'
                                  : entry.severity === 'Moderate'
                                  ? 'bg-orange-400 border-orange-400'
                                  : 'bg-gray-400 border-gray-400'
                              }`}
                            />

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-white font-medium text-sm">{entry.flag_name}</h4>
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    entry.severity === 'Critical' || entry.severity === 'High'
                                      ? 'bg-red-500/10 text-red-400'
                                      : entry.severity === 'Moderate'
                                      ? 'bg-orange-500/10 text-orange-400'
                                      : 'bg-gray-500/10 text-gray-400'
                                  }`}
                                >
                                  {entry.severity}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500">
                                {new Date(entry.detected_at).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState
                      icon={<BarChartIcon className="w-16 h-16 text-gray-600" />}
                      title="No history available"
                      description="No historical red flag data is available for this stock."
                    />
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon={<FlagIcon className="w-16 h-16 text-red-400" />}
                title="No red flag data"
                description="Unable to load red flag analysis for this stock."
              />
            )}
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </div>

      {/* Executive Detail Modal */}
      {selectedExecutive && (
        <ExecutiveDetail
          executive={selectedExecutive}
          onClose={() => setSelectedExecutive(null)}
        />
      )}

      {/* VETTR Score Detail Modal */}
      {showScoreDetail && score && (
        <VetrScoreDetail
          score={score}
          onClose={() => setShowScoreDetail(false)}
        />
      )}

      {/* Flag Detail Modal */}
      {selectedFlag && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedFlag(null)}
        >
          <div
            className="bg-vettr-card border border-white/10 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-vettr-card border-b border-white/5 px-6 pt-6 pb-0 flex items-start justify-between">
              <div className="flex-1 mb-4">
                <h2 className="text-lg font-semibold text-white mb-3">{selectedFlag.name}</h2>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedFlag.severity === 'Critical'
                        ? 'bg-red-500/10 text-red-400'
                        : selectedFlag.severity === 'High'
                        ? 'bg-orange-500/10 text-orange-400'
                        : selectedFlag.severity === 'Moderate'
                        ? 'bg-yellow-500/10 text-yellow-400'
                        : 'bg-gray-500/10 text-gray-400'
                    }`}
                  >
                    {selectedFlag.severity} Severity
                  </span>
                  {selectedFlag.is_acknowledged && (
                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-500 text-xs flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Acknowledged
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedFlag(null)}
                className="text-gray-400 hover:text-white hover:bg-white/5 rounded-lg p-1 transition-colors"
                aria-label="Close"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-4 space-y-4">
              {/* Explanation */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Explanation</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  {selectedFlag.explanation}
                </p>
              </div>

              {/* Detection Date */}
              <div>
                <h3 className="text-sm font-semibold text-white mb-2">Detection Date</h3>
                <p className="text-sm text-gray-400">
                  {new Date(selectedFlag.detected_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              {/* Actions */}
              {!selectedFlag.is_acknowledged && (
                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button
                    onClick={() => {
                      handleAcknowledgeFlag(selectedFlag.id);
                      setSelectedFlag(null);
                    }}
                    disabled={acknowledgingFlagId === selectedFlag.id}
                    className="flex-1 px-4 py-2 bg-vettr-accent hover:bg-vettr-accent/90 text-vettr-navy font-semibold rounded-xl transition-colors disabled:opacity-50"
                  >
                    {acknowledgingFlagId === selectedFlag.id ? 'Acknowledging...' : 'Acknowledge Flag'}
                  </button>
                  <button
                    onClick={() => setSelectedFlag(null)}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
