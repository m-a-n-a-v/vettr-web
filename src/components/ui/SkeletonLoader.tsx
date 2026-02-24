'use client';

interface SkeletonLoaderProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string;
  height?: string;
  className?: string;
}

export default function SkeletonLoader({
  variant = 'rectangular',
  width,
  height,
  className = ''
}: SkeletonLoaderProps) {
  const baseClasses = 'animate-pulse bg-gray-100 dark:bg-white/5';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-xl';
      case 'card':
        return 'rounded-xl p-4 border border-gray-200 dark:border-white/5';
      default:
        return 'rounded-xl';
    }
  };

  const variantClasses = getVariantClasses();

  const style: React.CSSProperties = {
    ...(width && { width }),
    ...(height && { height })
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${className}`}
      style={style}
    />
  );
}

// Predefined skeleton components for common use cases - V2 Design

export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLoader
          key={i}
          variant="text"
          width={i === lines - 1 ? '70%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-100 dark:bg-white/5 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3 mb-3">
        <SkeletonLoader variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="60%" />
          <SkeletonLoader variant="text" width="80%" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonLoader variant="text" width="40%" />
        <SkeletonLoader variant="text" width="50%" />
      </div>
    </div>
  );
}

// V2 Metric Card Skeleton - for Pulse page metric cards
export function SkeletonMetricCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 ${className}`}>
      <SkeletonLoader variant="text" width="60%" height="0.75rem" className="mb-2" />
      <SkeletonLoader variant="text" width="40%" height="2rem" />
    </div>
  );
}

// V2 Stock Card Skeleton - matches StockCard component
export function SkeletonStockCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 ${className}`}>
      {/* Header row: ticker + company + favorite */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 space-y-1">
          <SkeletonLoader variant="text" width="4rem" height="1rem" />
          <SkeletonLoader variant="text" width="70%" height="0.875rem" />
        </div>
        <SkeletonLoader variant="circular" width="1.25rem" height="1.25rem" />
      </div>

      {/* Price row */}
      <div className="mb-3">
        <SkeletonLoader variant="text" width="6rem" height="2rem" className="mb-1" />
        <SkeletonLoader variant="text" width="4rem" height="0.875rem" />
      </div>

      {/* Bottom row: sector chip + score badge */}
      <div className="flex items-center justify-between">
        <SkeletonLoader variant="text" width="5rem" height="1.5rem" className="rounded-full" />
        <SkeletonLoader variant="circular" width="2rem" height="2rem" />
      </div>
    </div>
  );
}

export function SkeletonList({ count = 5, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// V2 Filing Table Row Skeleton - for table view
export function SkeletonFilingRow({ className = '' }: { className?: string }) {
  return (
    <tr className={`border-b border-gray-200 dark:border-white/5 ${className}`}>
      <td className="px-4 py-3">
        <SkeletonLoader variant="circular" width="2rem" height="2rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="80%" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="3rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="5rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="3rem" height="1.25rem" className="rounded-full" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="3rem" height="1.25rem" className="rounded-full" />
      </td>
    </tr>
  );
}

// V2 Stock Table Row Skeleton - for table view on Stocks page
export function SkeletonStockRow({ className = '' }: { className?: string }) {
  return (
    <tr className={`border-b border-gray-200 dark:border-white/5 ${className}`}>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="3rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="70%" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="4rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="3rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="circular" width="2rem" height="2rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="5rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="4rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3 text-center">
        <SkeletonLoader variant="circular" width="1.25rem" height="1.25rem" className="mx-auto" />
      </td>
    </tr>
  );
}

// V2 Alert Rule Row Skeleton - for table view
export function SkeletonAlertRule({ className = '' }: { className?: string }) {
  return (
    <tr className={`border-b border-gray-200 dark:border-white/5 ${className}`}>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="4rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="6rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="70%" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="text" width="5rem" height="0.875rem" />
      </td>
      <td className="px-4 py-3">
        <SkeletonLoader variant="rectangular" width="2.75rem" height="1.5rem" className="rounded-full" />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-end">
          <SkeletonLoader variant="circular" width="2rem" height="2rem" />
          <SkeletonLoader variant="circular" width="2rem" height="2rem" />
        </div>
      </td>
    </tr>
  );
}

// V2 Alert Trigger Card Skeleton
export function SkeletonAlertTrigger({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/5 rounded-xl p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <SkeletonLoader variant="circular" width="2rem" height="2rem" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="40%" height="0.875rem" />
          <SkeletonLoader variant="text" width="70%" height="0.75rem" />
          <SkeletonLoader variant="text" width="30%" height="0.75rem" />
        </div>
      </div>
    </div>
  );
}

// V2 Stock Detail Header Skeleton
export function SkeletonStockDetailHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Breadcrumb */}
      <SkeletonLoader variant="text" width="10rem" height="0.875rem" />

      {/* Stock Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <SkeletonLoader variant="text" width="12rem" height="2rem" />
            <SkeletonLoader variant="text" width="4rem" height="1.5rem" className="rounded-lg" />
            <SkeletonLoader variant="text" width="3rem" height="1.5rem" className="rounded-full" />
          </div>
          <SkeletonLoader variant="text" width="8rem" height="3rem" />
          <SkeletonLoader variant="text" width="6rem" height="1.25rem" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
          <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
          <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
        </div>
      </div>
    </div>
  );
}

// V2 VETTR Score Section Skeleton
export function SkeletonVetrScoreSection({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-6 ${className}`}>
      <SkeletonLoader variant="text" width="40%" height="1rem" className="mb-4" />
      <div className="flex items-center justify-center mb-6">
        <SkeletonLoader variant="circular" width="8rem" height="8rem" />
      </div>
      {/* Component breakdown bars */}
      <div className="space-y-3">
        <SkeletonLoader variant="text" width="100%" height="2rem" className="rounded-full" />
        <SkeletonLoader variant="text" width="100%" height="2rem" className="rounded-full" />
        <SkeletonLoader variant="text" width="100%" height="2rem" className="rounded-full" />
        <SkeletonLoader variant="text" width="100%" height="2rem" className="rounded-full" />
        <SkeletonLoader variant="text" width="100%" height="2rem" className="rounded-full" />
      </div>
    </div>
  );
}

// V2 User Profile Header Skeleton
export function SkeletonUserHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-start gap-4 mb-8 ${className}`}>
      <SkeletonLoader variant="circular" width="4rem" height="4rem" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <SkeletonLoader variant="text" width="10rem" height="1.5rem" />
          <SkeletonLoader variant="text" width="4rem" height="1.25rem" className="rounded-full" />
        </div>
        <SkeletonLoader variant="text" width="60%" height="0.875rem" />
      </div>
    </div>
  );
}

// V2 Profile Section Skeleton - for grouped cards
export function SkeletonProfileSection({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-50 dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl overflow-hidden ${className}`}>
      <div className="space-y-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5">
          <SkeletonLoader variant="text" width="30%" height="0.875rem" />
          <SkeletonLoader variant="text" width="20%" height="0.875rem" />
        </div>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/5">
          <SkeletonLoader variant="text" width="35%" height="0.875rem" />
          <SkeletonLoader variant="text" width="25%" height="0.875rem" />
        </div>
        <div className="flex items-center justify-between px-6 py-4">
          <SkeletonLoader variant="text" width="40%" height="0.875rem" />
          <SkeletonLoader variant="text" width="15%" height="0.875rem" />
        </div>
      </div>
    </div>
  );
}

// V2 Chart Skeleton - for Recharts placeholders
export function SkeletonChart({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-50 dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl p-6 ${className}`}>
      <SkeletonLoader variant="text" width="40%" height="1rem" className="mb-4" />
      <div className="flex items-end gap-2 h-64">
        {Array.from({ length: 12 }).map((_, i) => (
          <SkeletonLoader
            key={i}
            variant="rectangular"
            className="flex-1"
            height={`${Math.random() * 60 + 40}%`}
          />
        ))}
      </div>
    </div>
  );
}

// V2 Filter Bar Skeleton - for Stocks/Discovery pages
export function SkeletonFilterBar({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-gray-50 dark:bg-vettr-card/30 border border-gray-200 dark:border-white/5 rounded-2xl p-3 flex items-center gap-3 ${className}`}>
      <SkeletonLoader variant="rectangular" width="16rem" height="2.5rem" className="rounded-xl" />
      <SkeletonLoader variant="rectangular" width="10rem" height="2.5rem" className="rounded-xl" />
      <SkeletonLoader variant="rectangular" width="8rem" height="2.5rem" className="rounded-xl" />
      <div className="flex-1" />
      <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
      <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
    </div>
  );
}

// V2 Fundamentals Tab Skeleton - for Fundamentals tab loading state
export function SkeletonFundamentals({ className = '' }: { className?: string }) {
  return (
    <div className={`space-y-8 ${className}`}>
      {/* Financial Health Dashboard Skeleton */}
      <div className="space-y-4">
        <SkeletonLoader variant="text" width="12rem" height="1.5rem" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-3">
              <SkeletonLoader variant="text" width="60%" height="0.75rem" />
              <SkeletonLoader variant="text" width="40%" height="2rem" />
              <SkeletonLoader variant="text" width="50%" height="1rem" className="rounded-full" />
            </div>
          ))}
        </div>
        <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5">
          <SkeletonLoader variant="text" width="10rem" height="1rem" className="mb-3" />
          <SkeletonLoader variant="rectangular" width="100%" height="5rem" />
        </div>
      </div>

      {/* Earnings Quality + Analyst Consensus Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Earnings Quality Skeleton */}
        <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
          <SkeletonLoader variant="text" width="10rem" height="1.5rem" />
          <div className="flex justify-center">
            <SkeletonLoader variant="circular" width="5rem" height="5rem" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <SkeletonLoader variant="text" width="40%" height="0.75rem" className="mb-2" />
                <SkeletonLoader variant="rectangular" width="100%" height="1.5rem" className="rounded-full" />
              </div>
            ))}
          </div>
          <SkeletonLoader variant="rectangular" width="100%" height="8rem" />
        </div>

        {/* Analyst Consensus Skeleton */}
        <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
          <SkeletonLoader variant="text" width="12rem" height="1.5rem" />
          <div className="space-y-2">
            <SkeletonLoader variant="text" width="50%" height="1.5rem" />
            <SkeletonLoader variant="rectangular" width="100%" height="2rem" className="rounded-full" />
          </div>
          <div>
            <SkeletonLoader variant="text" width="8rem" height="1rem" className="mb-2" />
            <SkeletonLoader variant="rectangular" width="100%" height="3rem" />
          </div>
          <SkeletonLoader variant="rectangular" width="100%" height="8rem" />
        </div>
      </div>

      {/* Peer Comparison Skeleton */}
      <div className="space-y-4">
        <SkeletonLoader variant="text" width="12rem" height="1.5rem" />
        <div className="bg-white/80 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-2xl p-5 space-y-4">
          <SkeletonLoader variant="rectangular" width="100%" height="18.75rem" />
          <div className="overflow-x-auto">
            <div className="space-y-2">
              <SkeletonLoader variant="rectangular" width="100%" height="2.5rem" />
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonLoader key={i} variant="rectangular" width="100%" height="2.5rem" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
