import Link from 'next/link'
import { BarChartIcon, GridIcon, SearchIcon } from '@/components/icons'

export default function StockNotFound() {
  return (
    <div className="min-h-screen bg-vettr-navy flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(0,230,118,0.08)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(68,138,255,0.05)_0%,_transparent_50%)]" />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <BarChartIcon className="w-16 h-16 text-gray-600" />
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Stock Not Found
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            The stock ticker you&apos;re looking for doesn&apos;t exist in our database or may have been delisted.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/stocks"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-vettr-accent text-vettr-navy font-semibold rounded-xl hover:bg-vettr-accent/90 transition-colors"
          >
            <GridIcon className="w-4 h-4" />
            Browse Stocks
          </Link>
          <Link
            href="/stocks"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
          >
            <SearchIcon className="w-4 h-4" />
            Search
          </Link>
        </div>

        {/* Help Text */}
        <p className="mt-6 text-sm text-gray-500">
          Try searching for the stock ticker or company name using the search feature.
        </p>
      </div>
    </div>
  )
}
