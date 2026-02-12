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
  const baseClasses = 'animate-pulse bg-surface';

  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded';
      case 'circular':
        return 'rounded-full';
      case 'rectangular':
        return 'rounded-lg';
      case 'card':
        return 'rounded-lg p-4 border border-border';
      default:
        return 'rounded-lg';
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

// Predefined skeleton components for common use cases

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
    <div className={`bg-primaryLight border border-border rounded-lg p-4 ${className}`}>
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

export function SkeletonStockCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-4 ${className}`}>
      {/* Header with avatar and info */}
      <div className="flex items-start gap-3 mb-3">
        <SkeletonLoader variant="circular" width="3rem" height="3rem" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonLoader variant="text" width="4rem" height="1.25rem" />
            <SkeletonLoader variant="circular" width="2rem" height="2rem" />
          </div>
          <SkeletonLoader variant="text" width="70%" />
        </div>
      </div>

      {/* Price section */}
      <div className="mb-3">
        <SkeletonLoader variant="text" width="5rem" height="2rem" />
      </div>

      {/* Chips */}
      <div className="flex items-center gap-2">
        <SkeletonLoader variant="text" width="5rem" height="1.5rem" className="rounded-full" />
        <SkeletonLoader variant="text" width="3rem" height="1.5rem" className="rounded-full" />
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

export function SkeletonMetricCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-4 ${className}`}>
      <SkeletonLoader variant="text" width="60%" className="mb-2" />
      <SkeletonLoader variant="text" width="40%" height="2rem" />
    </div>
  );
}
