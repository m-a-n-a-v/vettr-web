import Link from 'next/link'

export default function StockNotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-6 text-6xl">📊</div>

        {/* Error Message */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">
            Stock Not Found
          </h2>
          <p className="text-textSecondary mb-4">
            The stock ticker you&apos;re looking for doesn&apos;t exist in our database or may have been delisted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/stocks"
            className="px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accentDim transition-colors"
          >
            Browse All Stocks
          </Link>
          <Link
            href="/discovery"
            className="px-6 py-3 bg-surface text-textPrimary font-semibold rounded-lg hover:bg-surfaceLight transition-colors"
          >
            Search Stocks
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-textMuted">
          Try searching for the stock ticker or company name using the search feature.
        </p>
      </div>
    </div>
  )
}
