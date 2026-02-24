'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangleIcon, RefreshIcon, HomeIcon } from '@/components/icons'

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
    <div className="min-h-screen bg-lightBg dark:bg-vettr-navy flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-200">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.04)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.03)_0%,_transparent_50%)] dark:bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.05)_0%,_transparent_50%)]" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* VETTR Logo */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-vettr-accent">V</span>
            <span className="text-gray-900 dark:text-white">ETTR</span>
          </h1>
          <div className="h-1 w-20 bg-vettr-accent mx-auto rounded-full" />
        </div>

        {/* Error Icon and Message */}
        <div className="mb-8">
          <div className="mb-4 flex justify-center">
            <AlertTriangleIcon className="w-16 h-16 text-yellow-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            An unexpected error occurred. We&apos;re sorry for the inconvenience.
          </p>

          {/* Error Details (for development) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-4 p-4 bg-gray-100 dark:bg-vettr-card/50 border border-gray-200 dark:border-white/5 rounded-xl text-left">
              <p className="text-xs text-gray-500 font-mono break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-vettr-accent text-vettr-navy font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors"
          >
            <RefreshIcon className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/pulse"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <HomeIcon className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="mailto:support@vettr.com?subject=Error Report"
            className="text-gray-500 dark:text-gray-400 hover:text-vettr-accent text-sm transition-colors"
          >
            Report this issue
          </Link>
        </div>
      </div>
    </div>
  )
}
