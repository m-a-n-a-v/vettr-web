import React from 'react';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) {
  const defaultIcon = (
    <svg
      className="w-16 h-16 text-textMuted"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
      />
    </svg>
  );

  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {/* Icon */}
      <div className="mb-4">{icon || defaultIcon}</div>

      {/* Title */}
      {title && (
        <h3 className="text-lg font-semibold text-textPrimary mb-2">{title}</h3>
      )}

      {/* Message */}
      <p className="text-sm text-textSecondary text-center max-w-md mb-6">{message}</p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="
            px-5 py-2.5 rounded-lg
            bg-accent text-primary font-medium
            hover:bg-accentDim
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-primary
          "
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
