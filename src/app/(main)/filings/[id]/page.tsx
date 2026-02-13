'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useFiling } from '@/hooks/useFiling';
import { useStock } from '@/hooks/useStock';
import { useMarkFilingRead } from '@/hooks/useMarkFilingRead';
import FilingTypeIcon from '@/components/ui/FilingTypeIcon';
import VetrScoreBadge from '@/components/ui/VetrScoreBadge';
import PriceChangeIndicator from '@/components/ui/PriceChangeIndicator';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import EmptyState from '@/components/ui/EmptyState';
import Breadcrumb from '@/components/ui/Breadcrumb';
import { useToast } from '@/contexts/ToastContext';
import { shareContent } from '@/lib/share';
import { ShareIcon, ArrowUpIcon, ArrowDownIcon } from '@/components/icons';

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const filingId = params.id as string;
  const { showToast } = useToast();

  // Fetch filing data
  const { filing, isLoading: isLoadingFiling, error: filingError, mutate: mutateFiling } = useFiling({ id: filingId });

  // Fetch related stock data (only when we have the filing ticker)
  const { stock, isLoading: isLoadingStock } = useStock(filing?.ticker || '');

  // Mark filing as read hook
  const { markAsRead } = useMarkFilingRead();

  // Auto-mark filing as read on view with optimistic update
  useEffect(() => {
    if (filing && !filing.is_read) {
      const markFilingAsRead = async () => {
        // Store current data for rollback
        const previousFiling = filing;

        try {
          // Optimistically update the filing as read immediately
          mutateFiling({ ...filing, is_read: true }, false);

          // Make the API call in the background
          await markAsRead(filing.id);

          // Revalidate to get fresh data from server
          await mutateFiling();
        } catch (error) {
          console.error('Failed to mark filing as read:', error);
          // Rollback on error
          mutateFiling(previousFiling, false);
        }
      };

      markFilingAsRead();
    }
  }, [filing, markAsRead, mutateFiling]);

  // Loading state
  if (isLoadingFiling) {
    return (
      <div className="min-h-screen bg-vettr-navy p-4 md:p-6 pb-20 md:pb-6">
        <LoadingSpinner size="lg" centered message="Loading filing details..." />
      </div>
    );
  }

  // Error state
  if (filingError || !filing) {
    return (
      <div className="min-h-screen bg-vettr-navy p-4 md:p-6 pb-20 md:pb-6">
        <EmptyState
          title="Filing Not Found"
          description="The filing you're looking for could not be found or has been removed."
          actionLabel="Back to Discovery"
          onAction={() => router.push('/discovery')}
        />
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Share filing
  const handleShare = async () => {
    if (!filing) return;

    const shareText = `${filing.title}\n` +
      `Company: ${filing.company_name} (${filing.ticker})\n` +
      `Type: ${filing.type}\n` +
      `Filed: ${formatDate(filing.date_filed)}\n` +
      `Material: ${filing.is_material ? 'Yes' : 'No'}`;

    await shareContent(
      {
        title: filing.title,
        text: shareText,
      },
      () => showToast('Filing copied to clipboard', 'success'),
      () => showToast('Failed to share', 'error')
    );
  };

  return (
    <div className="min-h-screen bg-vettr-navy p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            { label: 'Filings', href: '/discovery' },
            { label: filing.title }
          ]}
        />

        {/* Header: Filing Type Icon, Title, Status Badge */}
        <div className="bg-vettr-card/50 border border-white/5 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <FilingTypeIcon type={filing.type} size="lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 flex-wrap flex-1">
                  <h1 className="text-xl font-semibold text-white break-words">
                    {filing.title}
                  </h1>
                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                      filing.is_read
                        ? 'bg-vettr-accent/10 text-vettr-accent'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}
                  >
                    {filing.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors flex-shrink-0"
                  aria-label="Share filing"
                  title="Share filing"
                >
                  <ShareIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Meta row: Ticker, Date Filed, Material indicator */}
              <div className="flex items-center gap-3 text-sm text-gray-400 mb-2 flex-wrap">
                <Link
                  href={`/stocks/${filing.ticker}`}
                  className="text-vettr-accent hover:text-vettr-accent/80 font-semibold transition-colors"
                >
                  {filing.ticker}
                </Link>
                <span>•</span>
                <span>{formatDate(filing.date_filed)}</span>
                {filing.is_material && (
                  <>
                    <span>•</span>
                    <span className="bg-yellow-500/10 text-yellow-400 rounded-full px-2 py-0.5 text-xs font-medium">
                      Material
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Summary</h2>
          <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
            {filing.summary || 'No summary available for this filing.'}
          </div>
        </div>

        {/* Filing Details Grid */}
        <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Filing Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div className="bg-white/[0.03] rounded-xl p-4">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Type</div>
              <div className="flex items-center gap-2">
                <FilingTypeIcon type={filing.type} size="sm" />
                <span className="text-white font-medium text-sm">{filing.type}</span>
              </div>
            </div>

            {/* Date */}
            <div className="bg-white/[0.03] rounded-xl p-4">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Date Filed</div>
              <div className="text-white font-medium text-sm">
                {formatDate(filing.date_filed)}
              </div>
            </div>

            {/* Material */}
            <div className="bg-white/[0.03] rounded-xl p-4">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Material</div>
              <div>
                {filing.is_material ? (
                  <span className="bg-yellow-500/10 text-yellow-400 rounded-full px-2.5 py-0.5 text-xs font-medium inline-block">
                    Yes
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium text-sm">No</span>
                )}
              </div>
            </div>

            {/* Status */}
            <div className="bg-white/[0.03] rounded-xl p-4">
              <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Status</div>
              <div>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-medium inline-block ${
                    filing.is_read
                      ? 'bg-vettr-accent/10 text-vettr-accent'
                      : 'bg-yellow-500/10 text-yellow-400'
                  }`}
                >
                  {filing.is_read ? 'Read' : 'Unread'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Stock Card */}
        {isLoadingStock ? (
          <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Related Stock</h2>
            <LoadingSpinner size="sm" message="Loading stock details..." />
          </div>
        ) : stock ? (
          <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Related Stock</h2>
            <Link
              href={`/stocks/${stock.ticker}`}
              className="block bg-vettr-card/50 border border-white/5 rounded-2xl p-5 hover:border-vettr-accent/20 hover:bg-vettr-card/80 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                {/* Company Initials Avatar */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-vettr-accent/20 to-vettr-accent/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-vettr-accent font-bold text-sm">
                    {stock.company_name
                      .split(' ')
                      .map((word) => word[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()}
                  </span>
                </div>

                {/* Stock Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <h3 className="text-sm font-bold text-vettr-accent group-hover:text-vettr-accent/80 transition-colors font-mono">
                      {stock.ticker}
                    </h3>
                    <VetrScoreBadge score={stock.vetr_score} size="sm" />
                  </div>
                  <div className="text-gray-400 text-sm mb-3 truncate">
                    {stock.company_name}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-2xl font-bold text-white">
                        ${stock.current_price?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    {stock.price_change_percent !== null && (
                      <div className="flex items-center gap-1">
                        {stock.price_change_percent >= 0 ? (
                          <>
                            <ArrowUpIcon className="w-4 h-4 text-vettr-accent" />
                            <span className="text-sm font-medium text-vettr-accent">
                              {stock.price_change_percent.toFixed(2)}%
                            </span>
                          </>
                        ) : (
                          <>
                            <ArrowDownIcon className="w-4 h-4 text-red-400" />
                            <span className="text-sm font-medium text-red-400">
                              {Math.abs(stock.price_change_percent).toFixed(2)}%
                            </span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="bg-vettr-card/30 border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Related Stock</h2>
            <div className="text-gray-400 text-sm">
              Stock information for {filing.ticker} could not be loaded.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
