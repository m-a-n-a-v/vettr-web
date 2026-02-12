'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
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
import ExecutiveDetail from '@/components/ExecutiveDetail';
import VetrScoreDetail from '@/components/VetrScoreDetail';
import VetrScoreComparison from '@/components/VetrScoreComparison';

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
    try {
      const response = await api.post(`/red-flags/${flagId}/acknowledge`, {});
      if (response.success) {
        showToast('Flag acknowledged', 'success');
        await mutateRedFlags();
      } else {
        throw new Error('Failed to acknowledge flag');
      }
    } catch (error) {
      showToast('Failed to acknowledge flag', 'error');
    } finally {
      setAcknowledgingFlagId(null);
    }
  };

  const handleAcknowledgeAll = async () => {
    setIsAcknowledgingAll(true);
    try {
      const response = await api.post(`/stocks/${ticker}/red-flags/acknowledge-all`, {});
      if (response.success) {
        showToast('All flags acknowledged', 'success');
        await mutateRedFlags();
      } else {
        throw new Error('Failed to acknowledge all flags');
      }
    } catch (error) {
      showToast('Failed to acknowledge all flags', 'error');
    } finally {
      setIsAcknowledgingAll(false);
    }
  };

  if (stockLoading) {
    return (
      <div className="min-h-screen bg-primary p-6 pb-20 md:pb-6">
        <LoadingSpinner centered size="lg" message="Loading stock details..." />
      </div>
    );
  }

  if (stockError || !stock) {
    return (
      <div className="min-h-screen bg-primary p-6 pb-20 md:pb-6">
        <EmptyState
          icon="⚠️"
          title="Stock not found"
          message="The stock you're looking for doesn't exist or couldn't be loaded."
          actionLabel="Back to Stocks"
          onAction={() => window.history.back()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      {/* Header with price info */}
      <div className="bg-primaryLight border-b border-border p-6">
        <div className="max-w-6xl mx-auto">
          {/* Title and actions */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-textPrimary mb-2">{stock.company_name}</h1>
              <div className="flex items-center gap-2">
                <span className="text-xl text-textSecondary">{stock.ticker}</span>
                <SectorChip sector={stock.sector} />
                {stock.exchange && (
                  <span className="px-3 py-1 rounded-full bg-surface text-textSecondary text-sm">
                    {stock.exchange}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleFavoriteToggle}
                disabled={isTogglingFavorite}
                className="p-2 rounded-lg bg-surface hover:bg-surfaceLight transition-colors disabled:opacity-50"
                aria-label={isInWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
              >
                {isTogglingFavorite ? (
                  <LoadingSpinner size="sm" color="white" />
                ) : (
                  <svg
                    className="w-6 h-6"
                    fill={isInWatchlist ? '#00E676' : 'none'}
                    stroke={isInWatchlist ? '#00E676' : 'currentColor'}
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleShare}
                className="p-2 rounded-lg bg-surface hover:bg-surfaceLight transition-colors"
                aria-label="Share stock"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Price info */}
          <div className="flex items-end gap-4">
            <span className="text-5xl font-bold text-textPrimary">
              ${stock.current_price?.toFixed(2) || 'N/A'}
            </span>
            {stock.price_change_percent !== null && stock.price_change_percent !== undefined && (
              <div className="mb-2">
                <PriceChangeIndicator change={stock.price_change_percent} size="lg" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="bg-primaryLight border-b border-border sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'text-accent border-accent'
                  : 'text-textSecondary border-transparent hover:text-textPrimary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('pedigree')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'pedigree'
                  ? 'text-accent border-accent'
                  : 'text-textSecondary border-transparent hover:text-textPrimary'
              }`}
            >
              Pedigree
            </button>
            <button
              onClick={() => setActiveTab('red-flags')}
              className={`px-6 py-4 font-medium transition-colors border-b-2 ${
                activeTab === 'red-flags'
                  ? 'text-accent border-accent'
                  : 'text-textSecondary border-transparent hover:text-textPrimary'
              }`}
            >
              Red Flags
            </button>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-6xl mx-auto p-6 pb-20 md:pb-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* VETTR Score section */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-textPrimary mb-4">VETTR Score</h2>
              {scoreLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" color="accent" />
                </div>
              ) : score ? (
                <button
                  onClick={() => setShowScoreDetail(true)}
                  className="w-full flex flex-col items-center justify-center cursor-pointer hover:bg-surface/50 rounded-lg p-4 transition-colors group"
                  aria-label="View score details"
                >
                  <VetrScoreBadge score={score.overall_score} size="lg" />
                  <p className="text-textSecondary text-sm mt-4 group-hover:text-textPrimary transition-colors">
                    Click to view detailed breakdown
                  </p>
                </button>
              ) : (
                <p className="text-textSecondary text-center py-4">Score not available</p>
              )}
            </div>

            {/* Score History Chart */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-textPrimary">Score History</h2>
                {/* Time Range Selector */}
                <div className="flex gap-2">
                  {['1M', '3M', '6M', '12M', '24M'].map((period) => (
                    <button
                      key={period}
                      onClick={() => setScoreHistoryPeriod(period)}
                      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                        scoreHistoryPeriod === period
                          ? 'bg-accent text-primary'
                          : 'bg-surface text-textSecondary hover:bg-surfaceLight hover:text-textPrimary'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              {scoreHistoryLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <LoadingSpinner size="lg" color="accent" />
                </div>
              ) : scoreHistory.length > 0 && scoreHistory[0]?.history && scoreHistory[0].history.length >= 2 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={scoreHistory[0].history}
                      margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        stroke="#94A3B8"
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        tickFormatter={(value) => {
                          const date = new Date(value);
                          return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        }}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        tick={{ fill: '#94A3B8', fontSize: 12 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1E3348',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                        }}
                        labelStyle={{ color: '#94A3B8' }}
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
                        stroke="#00E676"
                        strokeWidth={2}
                        dot={{ fill: '#00E676', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <EmptyState
                    icon="📊"
                    title="Not enough data"
                    message="Score history will be displayed once sufficient data is available."
                  />
                </div>
              )}
            </div>

            {/* VETTR Score Comparison */}
            <VetrScoreComparison
              comparison={comparison}
              isLoading={comparisonLoading}
              currentTicker={ticker}
            />

            {/* Key Metrics grid */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-textPrimary mb-4">Key Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-textMuted text-sm mb-1">Market Cap</p>
                  <p className="text-textPrimary font-semibold">
                    {stock.market_cap
                      ? `$${(stock.market_cap / 1000000).toFixed(1)}M`
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-textMuted text-sm mb-1">Exchange</p>
                  <p className="text-textPrimary font-semibold">{stock.exchange || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-textMuted text-sm mb-1">Sector</p>
                  <p className="text-textPrimary font-semibold">{stock.sector}</p>
                </div>
                <div>
                  <p className="text-textMuted text-sm mb-1">Filings</p>
                  <p className="text-textPrimary font-semibold">
                    {filings?.length || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Filings */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-textPrimary mb-4">Recent Filings</h2>
              {filingsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-20 bg-surface/50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filings && filings.length > 0 ? (
                <div className="space-y-3">
                  {filings.map(filing => (
                    <Link
                      key={filing.id}
                      href={`/filings/${filing.id}`}
                      className="block p-4 bg-surface hover:bg-surfaceLight rounded-lg border border-border transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Unread indicator (blue dot) */}
                        {!filing.is_read && (
                          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                        )}
                        <FilingTypeIcon type={filing.type} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-textPrimary font-medium truncate">
                              {filing.title}
                            </h3>
                            {filing.is_material && (
                              <span className="px-2 py-0.5 rounded bg-warning/20 text-warning text-xs font-medium flex-shrink-0">
                                Material
                              </span>
                            )}
                          </div>
                          <p className="text-textMuted text-sm mb-2">
                            {new Date(filing.date_filed).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </p>
                          {filing.summary && (
                            <p className="text-textSecondary text-sm line-clamp-2">
                              {filing.summary}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="📄"
                  title="No filings found"
                  message="This stock doesn't have any recent filings."
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'pedigree' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

            {/* Executives List */}
            <div className="bg-primaryLight rounded-lg p-6 border border-border">
              <h2 className="text-xl font-bold text-textPrimary mb-4">Executive Team</h2>
              {executivesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div
                      key={i}
                      className="h-32 bg-surface/50 rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : filteredAndSortedExecutives.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAndSortedExecutives.map(executive => (
                    <div
                      key={executive.id}
                      onClick={() => setSelectedExecutive(executive)}
                      className="p-4 bg-surface hover:bg-surfaceLight rounded-lg border border-border transition-colors cursor-pointer"
                    >
                      <div className="flex items-start gap-4">
                        {/* Initials Avatar */}
                        <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-accent font-bold text-lg">
                            {executive.name
                              .split(' ')
                              .map(n => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          {/* Name and Title */}
                          <h3 className="text-textPrimary font-semibold mb-1 truncate">
                            {executive.name}
                          </h3>
                          <p className="text-textSecondary text-sm mb-2">{executive.title}</p>

                          {/* Details Grid */}
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-textMuted">Years at Company</p>
                              <p className="text-textPrimary font-medium">
                                {executive.years_at_company} {executive.years_at_company === 1 ? 'year' : 'years'}
                              </p>
                            </div>
                            <div>
                              <p className="text-textMuted">Total Experience</p>
                              <p className="text-textPrimary font-medium">
                                {executive.total_experience_years} {executive.total_experience_years === 1 ? 'year' : 'years'}
                              </p>
                            </div>
                          </div>

                          {/* Specialization Badge */}
                          {executive.specialization && (
                            <div className="mt-2">
                              <span className="inline-block px-2 py-1 rounded bg-primary text-accent text-xs font-medium">
                                {executive.specialization}
                              </span>
                            </div>
                          )}

                          {/* Tenure Risk Indicator */}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-textMuted text-xs">Tenure Risk:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${
                                executive.tenure_risk === 'Stable'
                                  ? 'bg-accent/20 text-accent'
                                  : executive.tenure_risk === 'Watch'
                                  ? 'bg-warning/20 text-warning'
                                  : 'bg-error/20 text-error'
                              }`}
                            >
                              {executive.tenure_risk}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="👔"
                  title="No executives found"
                  message={
                    executiveSearch || executiveTitleFilter !== 'all'
                      ? 'No executives match your search criteria. Try adjusting your filters.'
                      : 'This stock doesn\'t have any executive information available.'
                  }
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'red-flags' && (
          <div className="space-y-6">
            {redFlagsLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div
                    key={i}
                    className="h-48 bg-primaryLight/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : redFlags ? (
              <>
                {/* Overall Red Flag Score */}
                <div className="bg-primaryLight rounded-lg p-6 border border-border">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-textPrimary">Red Flag Score</h2>
                    {redFlags.detected_flags.some(flag => !flag.is_acknowledged) && (
                      <button
                        onClick={handleAcknowledgeAll}
                        disabled={isAcknowledgingAll}
                        className="px-4 py-2 bg-accent hover:bg-accentDim text-primary font-medium rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isAcknowledgingAll ? 'Acknowledging...' : 'Acknowledge All'}
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-center mb-8">
                    {/* Circular progress indicator */}
                    <div className="relative w-40 h-40">
                      <svg className="w-40 h-40 transform -rotate-90">
                        {/* Background circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke="#1E3348"
                          strokeWidth="12"
                        />
                        {/* Progress circle */}
                        <circle
                          cx="80"
                          cy="80"
                          r="70"
                          fill="none"
                          stroke={
                            redFlags.overall_score >= 80
                              ? '#FF5252'
                              : redFlags.overall_score >= 60
                              ? '#FFB300'
                              : redFlags.overall_score >= 40
                              ? '#FFB300'
                              : '#00E676'
                          }
                          strokeWidth="12"
                          strokeDasharray={`${(redFlags.overall_score / 100) * 439.8} 439.8`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-4xl font-bold text-textPrimary">
                          {redFlags.overall_score}
                        </span>
                        <span className="text-sm text-textMuted">Risk Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Flag Breakdown Progress Bars */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-textPrimary mb-4">Flag Breakdown</h3>

                    {/* Consolidation Velocity - 30% */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-textSecondary">Consolidation Velocity</span>
                        <span className="text-sm font-medium text-textPrimary">
                          {redFlags.breakdown.consolidation_velocity}%
                        </span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div
                          className="bg-error h-2 rounded-full transition-all duration-300"
                          style={{ width: `${redFlags.breakdown.consolidation_velocity}%` }}
                        />
                      </div>
                    </div>

                    {/* Financing Velocity - 25% */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-textSecondary">Financing Velocity</span>
                        <span className="text-sm font-medium text-textPrimary">
                          {redFlags.breakdown.financing_velocity}%
                        </span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div
                          className="bg-warning h-2 rounded-full transition-all duration-300"
                          style={{ width: `${redFlags.breakdown.financing_velocity}%` }}
                        />
                      </div>
                    </div>

                    {/* Executive Churn - 20% */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-textSecondary">Executive Churn</span>
                        <span className="text-sm font-medium text-textPrimary">
                          {redFlags.breakdown.executive_churn}%
                        </span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div
                          className="bg-warning h-2 rounded-full transition-all duration-300"
                          style={{ width: `${redFlags.breakdown.executive_churn}%` }}
                        />
                      </div>
                    </div>

                    {/* Disclosure Gaps - 15% */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-textSecondary">Disclosure Gaps</span>
                        <span className="text-sm font-medium text-textPrimary">
                          {redFlags.breakdown.disclosure_gaps}%
                        </span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${redFlags.breakdown.disclosure_gaps}%` }}
                        />
                      </div>
                    </div>

                    {/* Debt Trend - 10% */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-textSecondary">Debt Trend</span>
                        <span className="text-sm font-medium text-textPrimary">
                          {redFlags.breakdown.debt_trend}%
                        </span>
                      </div>
                      <div className="w-full bg-surface rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all duration-300"
                          style={{ width: `${redFlags.breakdown.debt_trend}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detected Flags List */}
                <div className="bg-primaryLight rounded-lg p-6 border border-border">
                  <h2 className="text-xl font-bold text-textPrimary mb-4">Detected Flags</h2>
                  {redFlags.detected_flags.length > 0 ? (
                    <div className="space-y-3">
                      {redFlags.detected_flags.map(flag => (
                        <div
                          key={flag.id}
                          className={`p-4 rounded-lg border transition-all ${
                            flag.is_acknowledged
                              ? 'bg-surface/50 border-border opacity-60'
                              : 'bg-surface border-border hover:border-accent cursor-pointer'
                          }`}
                          onClick={() => !flag.is_acknowledged && setSelectedFlag(flag)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              {/* Flag Icon */}
                              <div className={`text-2xl flex-shrink-0 ${flag.is_acknowledged ? 'opacity-50' : ''}`}>
                                🚩
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className={`font-semibold ${flag.is_acknowledged ? 'text-textMuted line-through' : 'text-textPrimary'}`}>
                                    {flag.name}
                                  </h3>
                                  {/* Severity Badge */}
                                  <span
                                    className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 ${
                                      flag.severity === 'Critical'
                                        ? 'bg-error/20 text-error'
                                        : flag.severity === 'High'
                                        ? 'bg-error/20 text-error'
                                        : flag.severity === 'Moderate'
                                        ? 'bg-warning/20 text-warning'
                                        : 'bg-accent/20 text-accent'
                                    }`}
                                  >
                                    {flag.severity}
                                  </span>
                                  {flag.is_acknowledged && (
                                    <span className="text-textMuted text-xs flex items-center gap-1">
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
                                <p className={`text-sm mb-2 ${flag.is_acknowledged ? 'text-textMuted' : 'text-textSecondary'}`}>
                                  {flag.explanation}
                                </p>
                                <p className="text-xs text-textMuted">
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
                                className="px-3 py-1.5 bg-surface hover:bg-surfaceLight border border-border rounded text-sm text-textSecondary hover:text-textPrimary transition-colors disabled:opacity-50"
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
                      icon="✅"
                      title="No red flags detected"
                      message="This stock currently has no red flags. Great news!"
                    />
                  )}
                </div>

                {/* Flag History Timeline */}
                <div className="bg-primaryLight rounded-lg p-6 border border-border">
                  <h2 className="text-xl font-bold text-textPrimary mb-4">Flag History</h2>
                  {flagHistoryLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className="h-16 bg-surface/50 rounded-lg animate-pulse"
                        />
                      ))}
                    </div>
                  ) : flagHistory && flagHistory.length > 0 ? (
                    <div className="space-y-3">
                      {flagHistory.flatMap((item) => item.history).map((entry, index) => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-4 p-3 bg-surface rounded-lg border border-border"
                        >
                          {/* Timeline dot and line */}
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                entry.severity === 'Critical' || entry.severity === 'High'
                                  ? 'bg-error'
                                  : entry.severity === 'Moderate'
                                  ? 'bg-warning'
                                  : 'bg-accent'
                              }`}
                            />
                            {index < flagHistory.flatMap((item) => item.history).length - 1 && (
                              <div className="w-0.5 h-12 bg-border mt-1" />
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-textPrimary font-medium">{entry.flag_name}</h4>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium ${
                                  entry.severity === 'Critical' || entry.severity === 'High'
                                    ? 'bg-error/20 text-error'
                                    : entry.severity === 'Moderate'
                                    ? 'bg-warning/20 text-warning'
                                    : 'bg-accent/20 text-accent'
                                }`}
                              >
                                {entry.severity}
                              </span>
                            </div>
                            <p className="text-sm text-textMuted">
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
                  ) : (
                    <EmptyState
                      icon="📊"
                      title="No history available"
                      message="No historical red flag data is available for this stock."
                    />
                  )}
                </div>
              </>
            ) : (
              <EmptyState
                icon="🚩"
                title="No red flag data"
                message="Unable to load red flag analysis for this stock."
              />
            )}
          </div>
        )}
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
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedFlag(null)}
        >
          <div
            className="bg-primaryLight rounded-lg border border-border max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-primaryLight border-b border-border p-6 flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">🚩</span>
                  <h2 className="text-2xl font-bold text-textPrimary">{selectedFlag.name}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded text-sm font-medium ${
                      selectedFlag.severity === 'Critical'
                        ? 'bg-error/20 text-error'
                        : selectedFlag.severity === 'High'
                        ? 'bg-error/20 text-error'
                        : selectedFlag.severity === 'Moderate'
                        ? 'bg-warning/20 text-warning'
                        : 'bg-accent/20 text-accent'
                    }`}
                  >
                    {selectedFlag.severity} Severity
                  </span>
                  {selectedFlag.is_acknowledged && (
                    <span className="px-3 py-1 rounded bg-surface text-textMuted text-sm flex items-center gap-1">
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
              </div>
              <button
                onClick={() => setSelectedFlag(null)}
                className="text-textSecondary hover:text-textPrimary transition-colors p-1"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Explanation */}
              <div>
                <h3 className="text-lg font-semibold text-textPrimary mb-3">Explanation</h3>
                <p className="text-textSecondary leading-relaxed">
                  {selectedFlag.explanation}
                </p>
              </div>

              {/* Detection Date */}
              <div>
                <h3 className="text-lg font-semibold text-textPrimary mb-3">Detection Date</h3>
                <p className="text-textSecondary">
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
                <div className="flex gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => {
                      handleAcknowledgeFlag(selectedFlag.id);
                      setSelectedFlag(null);
                    }}
                    disabled={acknowledgingFlagId === selectedFlag.id}
                    className="flex-1 px-4 py-2 bg-accent hover:bg-accentDim text-primary font-medium rounded-lg transition-colors disabled:opacity-50"
                  >
                    {acknowledgingFlagId === selectedFlag.id ? 'Acknowledging...' : 'Acknowledge Flag'}
                  </button>
                  <button
                    onClick={() => setSelectedFlag(null)}
                    className="px-4 py-2 bg-surface hover:bg-surfaceLight text-textPrimary font-medium rounded-lg transition-colors"
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
