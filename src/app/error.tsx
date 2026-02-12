'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* VETTR Logo */}
        <div className="mb-8">
          <h1 className="text-accent text-5xl font-bold mb-2">VETTR</h1>
          <div className="h-1 w-20 bg-accent mx-auto rounded-full" />
        </div>

        {/* Error Message */}
        <div className="mb-6">
          <div className="mb-4 text-6xl">⚠️</div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-textSecondary mb-4">
            An unexpected error occurred. We&apos;re sorry for the inconvenience.
          </p>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-surface rounded-lg text-left">
              <p className="text-xs text-textMuted font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4">
          <button
            onClick={reset}
            className="px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accentDim transition-colors"
          >
            Try Again
          </button>
          <Link
            href="/pulse"
            className="px-6 py-3 bg-surface text-textPrimary font-semibold rounded-lg hover:bg-surfaceLight transition-colors inline-block"
          >
            Go to Dashboard
          </Link>
          <Link
            href="mailto:support@vettr.com?subject=Error Report"
            className="text-textSecondary hover:text-accent text-sm transition-colors"
          >
            Report this issue
          </Link>
        </div>
      </div>
    </div>
  )
}
