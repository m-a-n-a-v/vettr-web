/**
 * RefreshButton Component
 *
 * Desktop refresh button with loading animation
 */

interface RefreshButtonProps {
  onClick: () => void;
  isRefreshing: boolean;
  disabled?: boolean;
  className?: string;
}

export default function RefreshButton({
  onClick,
  isRefreshing,
  disabled = false,
  className = '',
}: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || isRefreshing}
      className={`
        flex items-center justify-center gap-2 px-4 py-2 rounded-lg
        bg-primaryLight text-textPrimary border border-border
        hover:bg-surfaceLight hover:border-accent/30
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
      aria-label="Refresh data"
      title="Refresh data"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
        />
      </svg>
      <span className="hidden md:inline">{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
    </button>
  );
}
