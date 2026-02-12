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
import { useToast } from '@/contexts/ToastContext';
import { shareContent } from '@/lib/share';

export default function FilingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const filingId = params.id as string;
  const { showToast } = useToast();

  // Fetch filing data
  const { filing, isLoading: isLoadingFiling, error: filingError } = useFiling({ id: filingId });

  // Fetch related stock data (only when we have the filing ticker)
  const { stock, isLoading: isLoadingStock } = useStock(filing?.ticker || '');

  // Mark filing as read hook
  const { markAsRead } = useMarkFilingRead();

  // Auto-mark filing as read on view
  useEffect(() => {
    if (filing && !filing.is_read) {
      // Mark as read in the background (don't block UI)
      markAsRead(filing.id).catch((error) => {
        console.error('Failed to mark filing as read:', error);
        // Silently fail - user can still view the filing
      });
    }
  }, [filing, markAsRead]);

  // Loading state
  if (isLoadingFiling) {
    return (
      <div className="min-h-screen bg-primary p-4 md:p-6 pb-20 md:pb-6">
        <LoadingSpinner size="lg" centered message="Loading filing details..." />
      </div>
    );
  }

  // Error state
  if (filingError || !filing) {
    return (
      <div className="min-h-screen bg-primary p-4 md:p-6 pb-20 md:pb-6">
        <EmptyState
          title="Filing Not Found"
          message="The filing you're looking for could not be found or has been removed."
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
    <div className="min-h-screen bg-primary p-4 md:p-6 pb-20 md:pb-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-textSecondary">
          <Link href="/discovery" className="hover:text-accent transition-colors">
            Discovery
          </Link>
          <span>/</span>
          <span className="text-textPrimary">Filing Detail</span>
        </div>

        {/* Header: Filing Type Icon, Title, Status Badge */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <FilingTypeIcon type={filing.type} size="lg" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-3 flex-wrap flex-1">
                  <h1 className="text-2xl md:text-3xl font-bold text-textPrimary break-words">
                    {filing.title}
                  </h1>
                  {/* Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium flex-shrink-0 ${
                      filing.is_read
                        ? 'bg-accent/20 text-accent border border-accent/30'
                        : 'bg-warning/20 text-warning border border-warning/30'
                    }`}
                  >
                    {filing.is_read ? 'Read' : 'Unread'}
                  </span>
                </div>
                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg bg-surface hover:bg-surfaceLight transition-colors flex-shrink-0"
                  aria-label="Share filing"
                  title="Share filing"
                >
                  <svg
                    className="w-6 h-6 text-textSecondary hover:text-textPrimary transition-colors"
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

              {/* Stock Info */}
              <div className="flex items-center gap-2 text-textSecondary mb-3">
                <Link
                  href={`/stocks/${filing.ticker}`}
                  className="text-accent hover:text-accentDim font-semibold transition-colors"
                >
                  {filing.ticker}
                </Link>
                <span>•</span>
                <span>{filing.company_name}</span>
              </div>

              {/* Date Filed */}
              <div className="text-textSecondary text-sm">
                Filed on {formatDate(filing.date_filed)}
              </div>
            </div>
          </div>
        </div>

        {/* Filing Details Grid */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Filing Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Type */}
            <div>
              <div className="text-textSecondary text-sm mb-1">Type</div>
              <div className="flex items-center gap-2">
                <FilingTypeIcon type={filing.type} size="sm" />
                <span className="text-textPrimary font-medium">{filing.type}</span>
              </div>
            </div>

            {/* Date */}
            <div>
              <div className="text-textSecondary text-sm mb-1">Date Filed</div>
              <div className="text-textPrimary font-medium">
                {formatDate(filing.date_filed)}
              </div>
            </div>

            {/* Material */}
            <div>
              <div className="text-textSecondary text-sm mb-1">Material</div>
              <div>
                {filing.is_material ? (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-warning/20 text-warning border border-warning/30 inline-block">
                    Yes
                  </span>
                ) : (
                  <span className="text-textSecondary font-medium">No</span>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <div className="text-textSecondary text-sm mb-1">Status</div>
              <div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                    filing.is_read
                      ? 'bg-accent/20 text-accent border border-accent/30'
                      : 'bg-warning/20 text-warning border border-warning/30'
                  }`}
                >
                  {filing.is_read ? 'Read' : 'Unread'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Section */}
        <div className="bg-primaryLight rounded-lg p-6 border border-border">
          <h2 className="text-xl font-bold text-textPrimary mb-4">Summary</h2>
          <div className="text-textSecondary leading-relaxed whitespace-pre-wrap">
            {filing.summary || 'No summary available for this filing.'}
          </div>
        </div>

        {/* Related Stock Card */}
        {isLoadingStock ? (
          <div className="bg-primaryLight rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-textPrimary mb-4">Related Stock</h2>
            <LoadingSpinner size="sm" message="Loading stock details..." />
          </div>
        ) : stock ? (
          <div className="bg-primaryLight rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-textPrimary mb-4">Related Stock</h2>
            <Link
              href={`/stocks/${stock.ticker}`}
              className="block bg-surface rounded-lg p-4 border border-border hover:bg-surfaceLight hover:border-accent/30 transition-all group"
            >
              <div className="flex items-start gap-4">
                {/* Company Initials Avatar */}
                <div className="w-12 h-12 rounded-full bg-accent/20 border-2 border-accent/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-accent font-bold text-sm">
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
                    <h3 className="text-xl font-bold text-accent group-hover:text-accentDim transition-colors">
                      {stock.ticker}
                    </h3>
                    <VetrScoreBadge score={stock.vetr_score} size="sm" />
                  </div>
                  <div className="text-textSecondary mb-2 truncate">
                    {stock.company_name}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <span className="text-2xl font-bold text-textPrimary">
                        ${stock.current_price?.toFixed(2) || 'N/A'}
                      </span>
                    </div>
                    {stock.price_change_percent !== null && (
                      <PriceChangeIndicator
                        change={stock.price_change_percent}
                        size="md"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : (
          <div className="bg-primaryLight rounded-lg p-6 border border-border">
            <h2 className="text-xl font-bold text-textPrimary mb-4">Related Stock</h2>
            <div className="text-textSecondary">
              Stock information for {filing.ticker} could not be loaded.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
