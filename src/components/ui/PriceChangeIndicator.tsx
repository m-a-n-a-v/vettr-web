'use client';

interface PriceChangeIndicatorProps {
  change: number;
  size?: 'sm' | 'md' | 'lg';
  showArrow?: boolean;
}

export default function PriceChangeIndicator({
  change,
  size = 'md',
  showArrow = true
}: PriceChangeIndicatorProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  // Determine color based on change direction
  const getColor = () => {
    if (isNeutral) return 'text-textSecondary';
    return isPositive ? 'text-accent' : 'text-error';
  };

  // Size configurations
  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const colorClass = getColor();
  const sizeClass = sizeClasses[size];

  // Format percentage with sign
  const formattedChange = `${isPositive ? '+' : ''}${change.toFixed(2)}%`;

  // Arrow icons
  const Arrow = () => {
    if (isNeutral) {
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 12h14"
          />
        </svg>
      );
    }

    if (isPositive) {
      return (
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 15l7-7 7 7"
          />
        </svg>
      );
    }

    return (
      <svg
        className="w-3 h-3"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );
  };

  return (
    <span
      className={`
        ${colorClass}
        ${sizeClass}
        font-semibold
        inline-flex
        items-center
        gap-1
      `}
    >
      {showArrow && <Arrow />}
      {formattedChange}
    </span>
  );
}
