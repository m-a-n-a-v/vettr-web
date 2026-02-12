import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'accent' | 'primary' | 'white';
  className?: string;
  centered?: boolean;
  message?: string;
}

export default function LoadingSpinner({
  size = 'md',
  color = 'accent',
  className = '',
  centered = false,
  message,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const colorClasses = {
    accent: 'text-accent',
    primary: 'text-primary',
    white: 'text-white',
  };

  const spinner = (
    <svg
      className={`animate-spin ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );

  if (centered) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px]">
        {spinner}
        {message && (
          <p className="mt-3 text-sm text-textSecondary">{message}</p>
        )}
      </div>
    );
  }

  if (message) {
    return (
      <div className="flex items-center gap-2">
        {spinner}
        <p className="text-sm text-textSecondary">{message}</p>
      </div>
    );
  }

  return spinner;
}
