/**
 * PullToRefreshIndicator Component
 *
 * Visual indicator shown during pull-to-refresh gesture on mobile
 */

interface PullToRefreshIndicatorProps {
  isPulling: boolean;
  pullDistance: number;
  threshold?: number;
}

export default function PullToRefreshIndicator({
  isPulling,
  pullDistance,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  if (pullDistance === 0) return null;

  const progress = Math.min(pullDistance / threshold, 1);
  const opacity = Math.min(pullDistance / 40, 1);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{
        transform: `translateY(${Math.min(pullDistance, threshold)}px)`,
        opacity,
        transition: isPulling ? 'none' : 'all 0.3s ease-out',
      }}
    >
      <div className="bg-surface/90 backdrop-blur-sm px-6 py-3 rounded-full border border-border shadow-lg">
        <div className="flex items-center gap-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 text-accent ${isPulling ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{
              transform: `rotate(${progress * 360}deg)`,
              transition: isPulling ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          <span className="text-sm font-medium text-textPrimary">
            {isPulling ? 'Release to refresh' : 'Pull to refresh'}
          </span>
        </div>
      </div>
    </div>
  );
}
