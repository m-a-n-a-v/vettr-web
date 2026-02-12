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

export function SkeletonFilingRow({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <SkeletonLoader variant="text" width="70%" />
            <SkeletonLoader variant="text" width="4rem" height="1.5rem" className="rounded" />
          </div>
          <SkeletonLoader variant="text" width="50%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStockRow({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <SkeletonLoader variant="circular" width="3rem" height="3rem" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <SkeletonLoader variant="text" width="5rem" />
              <SkeletonLoader variant="circular" width="2rem" height="2rem" />
            </div>
            <SkeletonLoader variant="text" width="60%" />
          </div>
        </div>
        <div className="text-right space-y-1">
          <SkeletonLoader variant="text" width="4rem" height="1.5rem" />
          <SkeletonLoader variant="text" width="3rem" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAlertRule({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <SkeletonLoader variant="text" width="4rem" />
            <SkeletonLoader variant="text" width="7rem" />
          </div>
          <SkeletonLoader variant="text" width="80%" />
        </div>
        <div className="flex items-center gap-2">
          <SkeletonLoader variant="rectangular" width="3rem" height="1.5rem" className="rounded-full" />
          <SkeletonLoader variant="circular" width="2rem" height="2rem" />
          <SkeletonLoader variant="circular" width="2rem" height="2rem" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonAlertTrigger({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
        <div className="flex-1 space-y-2">
          <SkeletonLoader variant="text" width="40%" />
          <SkeletonLoader variant="text" width="70%" />
          <SkeletonLoader variant="text" width="30%" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonStockDetailHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-6 ${className}`}>
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <SkeletonLoader variant="text" width="60%" height="2rem" />
            <SkeletonLoader variant="text" width="40%" height="3rem" />
            <div className="flex items-center gap-2">
              <SkeletonLoader variant="text" width="6rem" height="1.5rem" className="rounded-full" />
              <SkeletonLoader variant="text" width="5rem" height="1.5rem" className="rounded-full" />
            </div>
          </div>
          <div className="flex gap-2">
            <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
            <SkeletonLoader variant="circular" width="2.5rem" height="2.5rem" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkeletonVetrScoreSection({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-6 ${className}`}>
      <SkeletonLoader variant="text" width="40%" className="mb-4" />
      <div className="flex items-center justify-center">
        <SkeletonLoader variant="circular" width="8rem" height="8rem" />
      </div>
    </div>
  );
}

export function SkeletonUserHeader({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <SkeletonLoader variant="circular" width="5rem" height="5rem" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <SkeletonLoader variant="text" width="10rem" height="2rem" />
            <SkeletonLoader variant="text" width="4rem" height="1.5rem" className="rounded-full" />
          </div>
          <SkeletonLoader variant="text" width="60%" />
        </div>
        <SkeletonLoader variant="rectangular" width="6rem" height="2.5rem" className="rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonProfileSection({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-primaryLight border border-border rounded-lg p-6 ${className}`}>
      <SkeletonLoader variant="text" width="30%" height="1.5rem" className="mb-4" />
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <SkeletonLoader variant="text" width="30%" />
          <SkeletonLoader variant="text" width="20%" />
        </div>
        <div className="flex items-center justify-between">
          <SkeletonLoader variant="text" width="35%" />
          <SkeletonLoader variant="text" width="25%" />
        </div>
        <div className="flex items-center justify-between">
          <SkeletonLoader variant="text" width="40%" />
          <SkeletonLoader variant="text" width="15%" />
        </div>
      </div>
    </div>
  );
}
