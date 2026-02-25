'use client';

interface AiAgentErrorProps {
  message: string;
  onRetry?: () => void;
}

export function AiAgentError({ message, onRetry }: AiAgentErrorProps) {
  return (
    <div className="rounded-2xl bg-red-500/10 dark:bg-red-500/10 border border-red-400/20 dark:border-red-400/20 p-4">
      <div className="flex items-start gap-3">
        {/* Error Icon */}
        <svg
          className="w-5 h-5 text-red-400 dark:text-red-400 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        {/* Error Content */}
        <div className="flex-1">
          <p className="text-sm text-red-400 dark:text-red-400 leading-relaxed">
            {message}
          </p>

          {/* Retry Button */}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 bg-red-500/20 hover:bg-red-500/30 dark:bg-red-500/20 dark:hover:bg-red-500/30 text-red-400 dark:text-red-400 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AiAgentDataUnavailable({ ticker }: { ticker: string }) {
  return (
    <div className="rounded-2xl bg-yellow-500/10 dark:bg-yellow-500/10 border border-yellow-400/20 dark:border-yellow-400/20 p-4">
      <div className="flex items-start gap-3">
        {/* Warning Icon */}
        <svg
          className="w-5 h-5 text-yellow-400 dark:text-yellow-400 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>

        {/* Warning Content */}
        <div className="flex-1">
          <p className="text-sm text-yellow-400 dark:text-yellow-400 leading-relaxed">
            Data is not yet available for <span className="font-semibold">{ticker}</span>. Try a different stock.
          </p>
        </div>
      </div>
    </div>
  );
}
