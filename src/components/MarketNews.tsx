'use client';

import { useMarketNews } from '@/hooks/useMarketNews';
import { AlertTriangleIcon } from '@/components/icons';
import EmptyState from '@/components/ui/EmptyState';

/**
 * MarketNews
 *
 * Displays a feed of market news articles from BNN Bloomberg RSS.
 * Used on the Discovery page alongside Recent Filings.
 */
export default function MarketNews() {
  const { news, source, sourceUrl, isLoading, error } = useMarketNews(8);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Market News</h2>
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-vettr-accent hover:text-vettr-accent/80 transition-colors"
        >
          {source} &rarr;
        </a>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <SkeletonNewsItem key={i} />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={<AlertTriangleIcon className="w-12 h-12 text-yellow-400" />}
          title="Failed to load news"
          description="Unable to fetch market news. Please try again later."
        />
      ) : news.length === 0 ? (
        <EmptyState
          icon={<NewspaperIcon className="w-12 h-12 text-gray-500" />}
          title="No news available"
          description="Market news will appear here when available."
        />
      ) : (
        <div className="space-y-2">
          {news.map((item, i) => (
            <NewsItem key={`${item.link}-${i}`} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Single news article row */
function NewsItem({ item }: { item: { title: string; link: string; description: string; pubDate: string; source: string; imageUrl: string | null } }) {
  const timeAgo = getTimeAgo(item.pubDate);

  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="
        flex gap-3 p-3 rounded-xl
        bg-white/80 dark:bg-vettr-card/50
        border border-gray-200 dark:border-white/5
        hover:bg-gray-50 dark:hover:bg-vettr-card/80
        hover:border-vettr-accent/20
        transition-all duration-300 group
      "
    >
      {/* Thumbnail (if available) */}
      {item.imageUrl && (
        <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5">
          <img
            src={item.imageUrl}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-vettr-accent transition-colors">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
          {item.description}
        </p>
        <div className="mt-1.5 flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span>{item.source}</span>
          <span>&middot;</span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </a>
  );
}

/** Skeleton loading state for a single news row */
function SkeletonNewsItem() {
  return (
    <div className="flex gap-3 p-3 rounded-xl bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5">
      <div className="flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-100 dark:bg-white/5 animate-pulse" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-3.5 w-full bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
        <div className="h-3.5 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
        <div className="h-3 w-1/3 bg-gray-100 dark:bg-white/5 rounded animate-pulse" />
      </div>
    </div>
  );
}

/** Simple inline newspaper icon */
function NewspaperIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z" />
    </svg>
  );
}

/** Convert a date string to relative time (e.g. "2h ago", "3d ago") */
function getTimeAgo(dateStr: string): string {
  try {
    const now = Date.now();
    const then = new Date(dateStr).getTime();
    const diff = now - then;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}
