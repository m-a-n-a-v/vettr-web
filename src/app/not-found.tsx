import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* VETTR Logo */}
        <div className="mb-8">
          <h1 className="text-accent text-5xl font-bold mb-2">VETTR</h1>
          <div className="h-1 w-20 bg-accent mx-auto rounded-full" />
        </div>

        {/* 404 Error */}
        <div className="mb-6">
          <h2 className="text-8xl font-bold text-white mb-4">404</h2>
          <h3 className="text-2xl font-semibold text-textPrimary mb-2">
            Page Not Found
          </h3>
          <p className="text-textSecondary">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/pulse"
            className="px-6 py-3 bg-accent text-primary font-semibold rounded-lg hover:bg-accentDim transition-colors"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/stocks"
            className="px-6 py-3 bg-surface text-textPrimary font-semibold rounded-lg hover:bg-surfaceLight transition-colors"
          >
            Browse Stocks
          </Link>
        </div>
      </div>
    </div>
  )
}
